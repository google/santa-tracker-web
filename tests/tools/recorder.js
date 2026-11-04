/**
 * @fileoverview Shared tooling for recording deterministic scene playthrough
 * videos.
 *
 * A per-scene script (e.g. `tests/tools/record_<scene>.js`) calls
 * `runRecording()` with a driver function. The driver plays the game using
 * native Playwright input and `recorder.advanceTime(seconds)`, which steps the
 * scene's manual time one video frame at a time and captures a screenshot of
 * every frame. Frames are piped to ffmpeg to produce an H.264 MP4.
 *
 * Requires `ffmpeg` on PATH. Uses the dev server at `--base-url`, or
 * `http://localhost:$PORT` (default 8005), starting `serve.js` if needed.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('@playwright/test');
const { sceneHelpers } = require('../helpers');

const REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * @typedef {{
 *   output: string,
 *   baseURL: string,
 *   port: number,
 *   fps: number,
 *   quality: number,
 *   headed: boolean,
 *   args: !Object<string, string>,
 * }}
 */
let RecorderOptions;

/**
 * Parses common CLI flags. Unknown `--name value` flags are returned in
 * `args` for the scene script to interpret.
 * @param {string} scene
 * @param {!Array<string>} argv
 * @return {!RecorderOptions}
 */
function parseArgs(scene, argv) {
  const port = parseInt(process.env.PORT || '8005', 10);
  const options = {
    output: path.join(REPO_ROOT, 'videos', `${scene}_playthrough.mp4`),
    baseURL: process.env.BASE_URL || '',
    port,
    fps: 60,
    quality: 80,
    headed: false,
    args: {},
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => argv[++i];
    switch (arg) {
      case '-o':
      case '--output':
        options.output = path.resolve(process.cwd(), next());
        break;
      case '--base-url':
        options.baseURL = next();
        break;
      case '-p':
      case '--port':
        options.port = parseInt(next(), 10);
        break;
      case '--fps':
        options.fps = parseInt(next(), 10);
        break;
      case '-q':
      case '--quality':
        options.quality = parseInt(next(), 10);
        break;
      case '--headed':
        options.headed = true;
        break;
      case '-h':
      case '--help':
        options.args.help = 'true';
        break;
      default:
        if (arg.startsWith('--')) {
          options.args[arg.slice(2)] = next();
        } else {
          throw new Error(`Unexpected argument: ${arg}`);
        }
    }
  }
  if (!options.baseURL) {
    options.baseURL = `http://localhost:${options.port}`;
  }
  return options;
}

/**
 * @param {string} url
 * @return {!Promise<boolean>} whether url responds with HTTP 200.
 */
function isReachable(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Starts `serve.js` on the given port unless url is already reachable.
 * @param {string} url
 * @param {number} port
 * @return {!Promise<?ChildProcess>} the spawned server, if any.
 */
async function ensureServer(url, port) {
  if (await isReachable(url)) {
    return null;
  }
  console.log(`[server] Starting dev server on port ${port}...`);
  const server = spawn('node', ['./serve.js', '--port', String(port), '--cache'], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  for (let i = 0; i < 240; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isReachable(url)) {
      return server;
    }
  }
  server.kill();
  throw new Error(`Dev server did not respond at ${url} within 120s`);
}

/**
 * Records a playthrough of a scene.
 *
 * @param {{
 *   scene: string,
 *   moduleSelector: string,
 *   usage?: string,
 *   query?: string,
 * }} config `usage` documents scene-specific flags for `--help`. `query` is
 *     appended to the host URL.
 * @param {function({
 *   page: !import('@playwright/test').Page,
 *   scene: !ReturnType<typeof sceneHelpers>,
 *   recorder: {
 *     advanceTime: function(number): !Promise<void>,
 *     hold: function(number): !Promise<void>,
 *     frameCount: function(): number,
 *   },
 *   options: !RecorderOptions,
 * }): !Promise<void>} driver Plays the game. Use `recorder.advanceTime()`
 *     instead of the scene helper's `advanceTime()` so that every step is
 *     captured, and `recorder.hold()` to keep showing the current frame (e.g.
 *     the game over overlay).
 */
async function runRecording(config, driver) {
  const options = parseArgs(config.scene, process.argv.slice(2));
  if (options.args.help) {
    console.log(`Records a ${config.scene} playthrough video.

Usage: node ${path.relative(process.cwd(), process.argv[1])} [options]

Options:
  -o, --output <path>   Output MP4 (default: videos/${config.scene}_playthrough.mp4)
  -p, --port <port>     Dev server port (default: $PORT or 8005)
      --base-url <url>  Dev server URL (default: http://localhost:<port>)
      --fps <n>         Frames per second of game time (default: 60)
  -q, --quality <n>     JPEG capture quality 1-100 (default: 80)
      --headed          Show the browser
${config.usage || ''}`);
    return;
  }

  const scene = sceneHelpers(config.scene, config.moduleSelector);
  const server = await ensureServer(`${options.baseURL}/${config.scene}.html`, options.port);
  fs.mkdirSync(path.dirname(options.output), { recursive: true });

  const ffmpeg = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-vcodec', 'mjpeg', '-r', String(options.fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'fast', '-crf', '22',
    '-movflags', '+faststart',
    options.output,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffmpegDone = new Promise((resolve, reject) => {
    ffmpeg.on('error', reject);
    ffmpeg.on('close', (code) => code === 0 ? resolve() :
        reject(new Error(`ffmpeg exited with code ${code}`)));
  });

  const browser = await chromium.launch({ headless: !options.headed });
  let frames = 0;
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      serviceWorkers: 'block',
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);

    await scene.load(page, options.baseURL, { query: config.query });
    // Keep the cookie notice out of the video.
    await page.addStyleTag({ content: 'santa-notice { display: none !important; }' });

    async function capture() {
      const { data } = await cdp.send('Page.captureScreenshot', {
        format: 'jpeg',
        quality: options.quality,
        optimizeForSpeed: true,
      });
      if (!ffmpeg.stdin.write(Buffer.from(data, 'base64'))) {
        await new Promise((r) => ffmpeg.stdin.once('drain', r));
      }
      frames++;
      if (frames % (options.fps * 10) === 0) {
        console.log(`[record] ${frames / options.fps}s recorded`);
      }
    }

    const recorder = {
      async advanceTime(seconds) {
        const count = Math.max(1, Math.round(seconds * options.fps));
        const dt = seconds / count;
        for (let i = 0; i < count; i++) {
          await scene.advanceTime(page, dt);
          await capture();
        }
      },
      async hold(seconds) {
        const count = Math.round(seconds * options.fps);
        for (let i = 0; i < count; i++) {
          await capture();
        }
      },
      frameCount: () => frames,
    };

    await driver({ page, scene, recorder, options });
  } finally {
    ffmpeg.stdin.end();
    await browser.close();
    if (server) {
      server.kill();
    }
  }
  await ffmpegDone;

  console.log(`[record] Wrote ${options.output} ` +
      `(${(frames / options.fps).toFixed(1)}s, ${frames} frames)`);
}

module.exports = {
  runRecording,
};
