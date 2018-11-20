const babel = require('@babel/core');
const buildResolveBareSpecifiers = require('./build/babel/resolve-bare-specifiers.js');
const buildTemplateTagReplacer = require('./build/babel/template-tag-replacer.js');
const compileCss = require('./build/compile-css.js');
const compileHtml = require('./build/compile-html.js');
const compileScene = require('./build/compile-scene.js');
const fsp = require('./build/fsp.js');
const path = require('path');
const rollup = require('rollup');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const JSON5 = require('json5');


const matchSceneRe = /(?:^|\/)scenes\/([a-z]+)(?:\/(.*)|)$/;


/**
 * @param {string} filename to match for foo/foo-scene.min.js
 * @return {?string} the matched foo, or null
 */
function matchSceneMin(filename) {
  const match = matchSceneRe.exec(filename);
  if (!match) {
    return null;
  }
  const sceneName = match[1];
  const rest = match[2];

  if (rest === `${sceneName}-scene.min.js`) {
    return sceneName;
  }
  return null;
}


function bundleWarn(warning, sub) {
  if (warning.code !== 'EVAL') {
    // Closure uses eval() through its generated code, so ignore this for now.
    return sub(warning);
  }
}


/**
 * Bundles a real source file up with Rollup.
 * 
 * @param {string} filename
 * @return {string}
 */
async function bundleCode(filename, loader) {
  const virtualCache = {};
  const virtualLoader = {
    name: 'rollup-virtual-loader',
    async resolveId(id, importer) {
      if (importer === undefined) {
        return;
      }
      const resolved = path.resolve(path.dirname(importer), id);

      // call back out to our loader if we have further deps
      const out = await loader(resolved);
      if (out) {
        virtualCache[resolved] = out;
        return resolved;
      }
    },
    load(id) {
      const out = virtualCache[id];
      return out !== undefined ? {code: out.body, map: out.map} : undefined;
    },
  };

  const bundle = await rollup.rollup({
    input: filename,
    plugins: [rollupNodeResolve(), virtualLoader],
    onwarn: bundleWarn,
  });

  const out = await bundle.generate({
    name: filename,
    format: 'es',
    sourcemap: true,
  });
  out.map.sourceRoot = path.relative(path.dirname(filename), '.');
  return out;
}


/**
 * @param {{
 *   compile: boolean,
 *   messages: function(string): string,
 * }}
 */
module.exports = (options) => {
  const templateTagReplacer = (name, arg) => {
    if (name === '_style') {
      return compileCss(`styles/${arg}.scss`, options.compile);
    } else if (options.messages && name === '_msg') {
      return options.messages(arg);
    }
  };

  const loader = async (filename) => {
    if (filename.startsWith('third_party/')) {
      return null;
    }

    const parsed = path.parse(filename);
    switch (parsed.ext) {
      case '.css':
        return {
          body: await compileCss(filename, options.compile),
        };
      case '.html':
        // nb. Just pass through options as-is.
        return {
          body: await compileHtml(filename, options),
        };
      case '.js':
        break;
      default:
        return null;
    }

    let body = null;
    let map = null;
    const babelPlugins = [];

    if (parsed.name.endsWith('.min')) {
      // try to match scene JS
      const sceneName = matchSceneMin(filename);
      if (!sceneName) {
        return null;  // do nothing to .min.js unless it's a scene
      }
      const out = await compileScene({sceneName}, options.compile);
      ({js: body, map} = out);
    } else if (parsed.name.endsWith('.bundle')) {
      // completely bundles code
      const actual = parsed.name.substr(0, parsed.name.length - '.bundle'.length) + '.js';
      const out = await bundleCode(path.join(parsed.dir, actual), loader);
      ({code: body, map} = out);
    } else if (parsed.name.endsWith('.json') || parsed.name.endsWith('.json5')) {
      // convert JSON/JSON5 to an exportable module
      const actual = path.join(parsed.dir, parsed.name);
      const raw = await fsp.readFile(actual, 'utf8');
      const json = JSON5.parse(raw);
      body = `const o=${JSON.stringify(json)};export default o;`;

      // Pretend to have an actual source map. This just shows the source up in a browser and
      // makes `loader-transform.js` watch the actual source file for changes.
      // TODO(samthor): This could be done properly by using Rollup with a JSON plugin?
      map = {
        sources: [actual],
        sourcesContent: [raw],
      };
    } else {
      // regular JS file
      body = await fsp.readFile(filename, 'utf8');
      babelPlugins.push(buildResolveBareSpecifiers(filename));
      babelPlugins.push(buildTemplateTagReplacer(templateTagReplacer));
    }

    if (babelPlugins.length) {
      babelPlugins.push(
        '@babel/plugin-proposal-object-rest-spread',
      )

      const result = await babel.transformAsync(body, {
        filename,
        plugins: babelPlugins,
        sourceMaps: true,
        sourceType: 'module',
        retainLines: true,
      });
      ({code: body, map} = result);
    }
  
    // Flatten dependant source files (so they are relative to the request path root), but also
    // update sourceRoot so that it reflects the source's actual path for browser rendering.
    if (map !== null) {
      const dirname = path.dirname(filename);
      const sourceRoot = map.sourceRoot || '.';
      map.sources = (map.sources || []).map((f) => f && path.join(dirname, sourceRoot, f));
      map.sourceRoot = path.relative(dirname, '.');
    }

    return body !== null ? {body, map} : null;
  };
  return loader;
};
