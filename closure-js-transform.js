const compileScene = require('./build/compile-scene.js');

const matchScene = /^\/scenes\/(\w+)\/\1-scene\.min\.js$/;

module.exports = async (ctx, next) => {
  const m = matchScene.exec(ctx.url);
  if (!m) {
    return next();
  }

  const config = {
    sceneName: m[1],
    entryPoint: 'app.Game',  // TODO(samthor): This is the most common for now. Have a defs file.
  };

  const start = +new Date;
  const compile = false;
  const out = await compileScene(config, compile);
  const duration = (+new Date) - start;
  console.info(compile ? 'compiled' : 'transpiled', config.sceneName, 'duration', `${duration}ms`);

  ctx.response.type = 'text/javascript';
  ctx.response.body = out;
};
