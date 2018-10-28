const WorkStream = require('./build/work-stream.js');
const compileScene = require('./build/compile-scene.js');
const fs = require('fs');
const log = require('fancy-log');
const colors = require('ansi-colors');
const matchSceneMin = require('./build/match-scene-min.js');
const prettyMs = require('pretty-ms');

const BUILD_TIMEOUT = 15 * 1000;    // automatically build for this long after use
const EXPIRY_TIMEOUT = 120 * 1000;  // watch for this long, but don't automatically build
const COMPILE_DELAY = 1 * 1000;     // autocompile due to changed file only after this delay


/**
 * @param {string} sceneName to watch for its JS changes
 * @param {function(string): void} callback
 * @return {function(): void} cleanup/shutdown method
 */
function watchForSceneJs(sceneName, cb) {
  if (sceneName[0] === '_') {
    throw new Error(`unexpected _-prefixed scene requested`);
  }

  const handler = (eventType, p) => {
    if (p.endsWith('.js') && !p.endsWith('.min.js')) {
      cb(p);
    }
  };
  // TODO(samthor): {recursive: true} does not work on Linux.
  const watchShared = fs.watch('scenes/_shared', {recursive: true}, handler);
  const watchScene = fs.watch(`scenes/${sceneName}`, {recursive: true}, handler);
  return () => {
    watchShared.close();
    watchScene.close();
  };
}


/**
 * Watches the source code for a scene, proactively recompiling it if its source changes within
 * fixed windows, or returning the previous built output if not.
 *
 * TODO(samthor): This mostly has nothing to do with scenes. It could be a helper for other types
 * of middleware compiles.
 *
 * @template O
 */
class SceneWatcher {

  /**
   * @param {string} sceneName
   * @param {function(string): !Promise<O>}
   */
  constructor(sceneName, fn) {
    this._sceneName = sceneName;
    this._fn = fn;

    this._buildUntil = -1;
    this._build = null;
    this._delayBuildTimeout = 0;
    this._expiryTimeout = 0;

    this._cleanup = null;
  }

  get sceneName() {
    return this._sceneName;
  }

  /**
   * Dispose all active watching code and callbacks in this SceneWatcher. This is called
   * automatically after `EXPIRY_TIMEOUT` of a build, but can be invoked earlier.
   */
  dispose() {
    global.clearTimeout(this._delayBuildTimeout);
    global.clearTimeout(this._expiryTimeout);
    this._cleanup && this._cleanup();
    this._cleanup = null;
    this._buildUntil = -1;
    this._build = null;
  }

  /**
   * When files are changed by the watcher, invalidate any previous build and then queue another
   * after `COMPILE_DELAY`, as long as the previous build was within `BUILD_TIMEOUT`.
   */
  _fileChange() {
    this._build = null;
    if ((+new Date) < this._buildUntil) {
      global.clearTimeout(this._delayBuildTimeout);
      this._delayBuildTimeout = global.setTimeout(() => this._ensureBuild(), COMPILE_DELAY);
    }
  }

  /**
   * Ensures that there is an active build.
   *
   * @return {!Promise<O>}
   */
  _ensureBuild() {
    if (this._build === null) {
      this._build = this._fn();
    }
    return this._build;
  }

  /**
   * Builds this scene. Configures this SceneWatcher to watch for changes, if it was not already
   * watching.
   *
   * @return {!Promise<O>}
   */
  get build() {
    if (this._cleanup === null) {
      this._cleanup = watchForSceneJs(this._sceneName, () => this._fileChange());
    }
    global.clearTimeout(this._delayBuildTimeout);
    global.clearTimeout(this._expiryTimeout);
    this._expiryTimeout = global.setTimeout(() => this.dispose(), EXPIRY_TIMEOUT);

    this._buildUntil = (+new Date) + BUILD_TIMEOUT;
    return this._ensureBuild();
  }
}


// TODO(samthor): Instead of just keeping one recent watcher, we could keep many.
let recentWatcher = null;


module.exports = function(options={}) {
  const buildHelper = (sceneName) => {
    const config = {
      // TODO(samthor): There's currently no way to pass additional arguments through.
      sceneName: sceneName,
    };
    return compileScene(config, options.compile || false);
  };
  
  const logHelper = (sceneName, out, duration) => {
    const mode = out.compile ? 'compiled' : 'transpiled';
    log(`Scene '${colors.green(sceneName)}' ${mode} in ${colors.red(prettyMs(duration))}`);
  };

  const worker = new WorkStream(buildHelper, logHelper);

  return async (ctx, next) => {
    const sceneName = matchSceneMin(ctx.path.slice(1));
    if (sceneName === null) {
      return next();
    }
  
    if (recentWatcher === null || recentWatcher.sceneName !== sceneName) {
      // Set up a watch task for this scene, so we aggressively recompile while a developer is
      // working on this code. This expires after `EXPIRY_TIMEOUT`.
      log(`Watching scene '${colors.green(sceneName)}'...`);
      recentWatcher && recentWatcher.dispose();
      recentWatcher = new SceneWatcher(sceneName, () => worker.run(sceneName));
    }
  
    const {js, sourceMap} = await recentWatcher.build;
    ctx.response.type = 'text/javascript';
    ctx.response.body = `${js}
//# sourceMappingURL=data:application/json;base64,${sourceMap.toString('base64')}`;
  };
};