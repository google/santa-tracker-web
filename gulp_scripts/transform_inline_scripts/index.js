const { Transform } = require('stream');
const parse5 = require('parse5');
const dom5 = require('dom5');
const gutil = require('gulp-util');

class TransformInlineScripts extends Transform {
  constructor(scriptTransformation) {
    super({objectMode: true});
    this.scriptTransformation = scriptTransformation;
  }

  _transform(file, enc, cb) {
    const doc = parse5.parse(file.contents.toString());
    const p = dom5.predicates;

    const inlineScripts = dom5.queryAll(doc,
        p.AND(p.hasTagName('script'), p.NOT(p.hasAttr('src'))));
    const totalInlineScripts = inlineScripts.length;

    gutil.log(`[${gutil.colors.blue('Transform Inline Scripts')}]`,
        `[${gutil.colors.green(file.path)}]`,
        `Transforming ${totalInlineScripts} inline scripts...`);

    let compileQueue = Promise.resolve();

    inlineScripts.forEach((inlineScript, index) => {
      compileQueue = compileQueue.then(async () => {

        const textNodes = inlineScript.childNodes.filter(dom5.isTextNode);
        const textContent = textNodes.map(textNode => textNode.value).join('\n');

        let compiledTextContent;

        try {
          compiledTextContent = await this.scriptTransformation(textContent);
        } catch (e) {
          gutil.log(`[${gutil.colors.blue('Transform Inline Scripts')}]`,
                    `[${gutil.colors.red(file.path)}]`,
                    e && (e.stack || e.message || e.toString()));

          gutil.log(`[${gutil.colors.blue('Transform Inline Scripts')}]`,
              `[${gutil.colors.red(file.path)}]`,
              `[${gutil.colors.yellow('Transformation Error')}]`,
              `[${gutil.colors.cyan(`${index + 1}/${totalInlineScripts}`)}]`,
              `Falling back to original script content...`);

          compiledTextContent = textContent;
        }

        gutil.log(
            `[${gutil.colors.blue('Transform Inline Scripts')}]`,
            `[${gutil.colors.green(file.path)}]`,
            `Script ${index + 1}/${totalInlineScripts} transformed`);

        dom5.setTextContent(inlineScript, compiledTextContent);
      });
    });

    compileQueue.then(() => {
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

module.exports = scriptTransformation => {
  return new TransformInlineScripts(scriptTransformation);
};
