/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { Transform } = require('stream');
const parse5 = require('parse5');
const dom5 = require('dom5');
const gutil = require('gulp-util');

class TransformNodes extends Transform {
  constructor(predicate, nodeTransformation) {
    super({objectMode: true});
    this.predicate = predicate;
    this.nodeTransformation = nodeTransformation;
  }

  _transform(file, enc, cb) {
    const doc = parse5.parse(file.contents.toString());

    const nodes = dom5.queryAll(doc, this.predicate);
    const totalNodes = nodes.length;

    gutil.log(`[${gutil.colors.blue('Transform Node')}]`,
        `[${gutil.colors.green(file.path)}]`,
        `Transforming ${totalNodes} nodes...`);

    let transformQueue = Promise.resolve();

    nodes.forEach((node, index) => {
      transformQueue = transformQueue.then(async () => {
        try {
          const newNode = await this.nodeTransformation(node);
          dom5.replace(node, newNode);
        } catch (e) {
          gutil.log(`[${gutil.colors.blue('Transform Node')}]`,
                    `[${gutil.colors.red(file.path)}]`,
                    e && (e.stack || e.message || e.toString()));

          gutil.log(`[${gutil.colors.blue('Transform Node')}]`,
              `[${gutil.colors.red(file.path)}]`,
              `[${gutil.colors.yellow('Transformation Error')}]`,
              `[${gutil.colors.cyan(`${index + 1}/${totalNodes}`)}]`,
              `Falling back to original node...`);
        }

        gutil.log(
            `[${gutil.colors.blue('Transform Node')}]`,
            `[${gutil.colors.green(file.path)}]`,
            `Node ${index + 1}/${totalNodes} transformed`);
      });
    });

    transformQueue.then(() => {
      file.contents = new Buffer(parse5.serialize(doc));
      cb(null, file);
    }).catch(error => {
      gutil.log(`[${gutil.colors.red(file.path)}]`,
          `[${gutil.colors.yellow('Unexpected Exception')}]`,
          error && (error.stack || error.message || error.toString()));
      process.exit(1);
    });
  }
}

const transformNodes = (predicate, nodeTransformation) => {
  return new TransformNodes(predicate, nodeTransformation);
};

const transformInlineScripts = scriptTransformation => {
  const p = dom5.predicates;
  const inlineScripts = p.AND(p.hasTagName('script'), p.NOT(p.hasAttr('src')));

  return transformNodes(inlineScripts, async (inlineScript) => {
    const newInlineScript = dom5.cloneNode(inlineScript);
    const textNodes = inlineScript.childNodes.filter(dom5.isTextNode);
    const textContent = textNodes.map(textNode => textNode.value).join('\n');

    const compiledTextContent = await scriptTransformation(textContent);

    dom5.setTextContent(newInlineScript, compiledTextContent);

    return newInlineScript;
  });
};

const transformExternalScriptNodes = scriptNodeTransformation => {
  const p = dom5.predicates;
  const externalModuleScripts = p.AND(
      p.hasTagName('script'),
      p.hasAttr('src'));

  return transformNodes(externalModuleScripts, scriptNodeTransformation);
};

module.exports = {
  transformNodes,
  transformInlineScripts,
  transformExternalScriptNodes
};
