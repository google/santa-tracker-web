const path = require('path');
const fs = require('fs');
const util = require('util');
const sass = require('sass');

const babelCore = require('@babel/core');
const babylon = require('babylon');

const fsp = {
  readFile: util.promisify(fs.readFile),
};

const messages = require('./en_src_messages.json');


const upgradeHTMLDeps = () => {
  return {
    visitor: {
      TaggedTemplateExpression(nodePath) {
        const {node, parent} = nodePath;
        const {tag, quasi} = node;

        const qnode = quasi.quasis[0];
        if (quasi.quasis.length !== 1 || qnode.type !== 'TemplateElement') {
          return;  // not sure what to do here
        }
        const key = qnode.value.raw;
        let update;

        if (tag.name === '_msg') {
          const object = messages[key];
          const message = object && (object.raw || object.message) || '?';
          update = message;
        } else if (tag.name === '_style') {
          const result = sass.renderSync({file: `styles/${key}.scss`});
          update = result.css.toString();
        }
        if (update === undefined) {
          return;
        }

        // see if we're the direct child of a literal, e.g. ${_msg`foo`}
        const index = parent.expressions.indexOf(node);
        if (parent.type !== 'TemplateLiteral' || index === -1) {
          // ... we're not, just insert the string whereever
          nodePath.replaceWith(babelCore.types.stringLiteral(update));
          return;
        }

        // merge the prev/next quasis with the updated value
        const qnew = parent.quasis.slice();
        const qprev = qnew.slice(index, index + 2);
        qnew.splice(index, 2, babelCore.types.templateElement({
          raw: qprev[0].value.raw + update + qprev[1].value.raw,
          cooked: qprev[0].value.cooked + update + qprev[1].value.cooked,
        }));

        // remove the expression
        const enew = parent.expressions.slice();
        enew.splice(index, 1);

        // replace the whole parent templateLiteral
        const replacement = babelCore.types.templateLiteral(qnew, enew);
        nodePath.parentPath.replaceWith(replacement);
      },
    },
  };
};


const resolveBareSpecifiers = () => {
  const handler = (nodePath) => {
    const node = nodePath.node;
    if (node.source === null) {
      return;
    }
    const specifier = node.source.value;

    try {
      new URL(specifier);
      return;  // do nothing, is a real URL
    } catch (e) {
      // ignore
    }
    if (specifier.startsWith('./') || specifier.startsWith('../')) {
      return;  // do nothing, is a relative URL
    }

    const ext = path.extname(specifier);
    const cand = path.join('node_modules/', specifier);
    if (ext === '.js') {
      node.source.value = `/${cand}`;
      return;
    }

    // look for package.json in same folder, OR add a .js ext
    let def;
    try {
      const raw = fs.readFileSync(path.join('./', cand, 'package.json'), 'utf8');
      def = JSON.parse(raw);
    } catch (e) {
      node.source.value = `/${cand}.js`;
      return;  // best chance is just to append .js
    }

    const f = def['module'] || def['jsnext:main'] || def['main'] || 'index.js';
    node.source.value = path.join('/', cand, f);
  };
  
  return {
    visitor: {
      ImportDeclaration: handler,
      ExportNamedDeclaration: handler,
      ExportAllDeclaration: handler,
    },
  };
};


module.exports = async (ctx, next) => {
  const ext = path.extname(ctx.url);
  const match = (ext === '.js' || ext === '.mjs');
  if (!match) {
    return next();
  }

  const presets = [];
  const plugins = [];

  const js = await fsp.readFile(`.${ctx.url}`, 'utf8');

  let ast;
  try {
    ast = babylon.parse(js, {
      sourceType: 'module',
      plugins: [
        'asyncGenerators',
        'objectRestSpread',
      ],
    });
  } catch (e) {
    if (e.constructor.name === 'SyntaxError') {
      console.error('ERROR: failed to parse JavaScript', e);
      return next();
    } else {
      throw e;
    }
  }

  plugins.push(resolveBareSpecifiers());
  plugins.push(upgradeHTMLDeps());

  const result = babelCore.transformFromAst(ast, js, {presets, plugins});
  ctx.response.type = 'text/javascript';
  ctx.response.body = result.code;
};