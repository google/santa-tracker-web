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


import './src/polyfill/css.js';
import {_static} from './src/magic.js';

import santaStyles from './styles/santa.css';
import fallbackStyles from './styles/fallback.css';
document.adoptedStyleSheets = [santaStyles, fallbackStyles];

import {Loader, LoaderHandler} from 'iframe-load';
import {prepareMessage} from './src/lib/iframe.js';

import {buildLoader} from './src/core/loader.js';
import {configureProdRouter, globalClickHandler} from './src/core/router.js';



const audio = document.createElement('audio');
audio.src = _static`fallback-audio/village_retro_music_r2.mp3`;
audio.loop = true;
audio.autoplay = true;
document.body.append(audio);


const homeButton = document.createElement('button');
homeButton.className = 'home';
homeButton.disabled = true;
document.body.append(homeButton);


const errorElement = document.createElement('div');
errorElement.className = 'error';
document.body.append(errorElement);


// Extend the timeout, especially for dev, where we're compiling.
class TimeoutLoader extends Loader {
  static timeout() {
    return 10 * 1000;
  }
}


const loader = new TimeoutLoader(document.body, new (class extends LoaderHandler {
  constructor() {
    super();
    this._resolveUnload = () => {};
  }

  unload(frame, href) {
    // Unload only when the new frame is ready. This is unlike the regular codebase, which can
    // remove the old frame early behind the loading screen.
    frame.classList.add('unload');
    this._resolveUnload();  // resolve any unfinished

    const p = new Promise((r) => this._resolveUnload = r);
    return p.then(() => {
      frame.classList.add('gone');
      return new Promise((r) => window.setTimeout(r, 125));
    });
  }

  async prepare(frame, href, context) {
    const port = await prepareMessage(frame);
    if (!(port instanceof MessagePort)) {
      this._resolveUnload();  // kick unloaded frame
      return null;
    }

    // send ?foo=.. data
    port.postMessage({type: 'data', payload: context});

    // Do basic setup for tasks
    await new Promise((resolve) => {
      let tasks = 1;  // pretend that 'config' is a single task
      port.onmessage = (ev) => {
        const {type, payload} = ev.data;
        switch (type) {
          case 'config':
            --tasks;  // we ignore the config in fallback
            break;
          case 'tasks':
            tasks += payload;
            break;
          default:
            return;  // ignore, don't run tasks check below
        }
        if (tasks <= 0) {
          resolve();
        }
      };
    });

    this._resolveUnload();  // kick unloaded frame
    return port;
  }

  ready(frame, href, port) {
    document.body.classList.add('loaded');

    if (port === null) {
      failedToLoad();
    } else {
      runner(port);
    }

    return true;  // indicate 'success'
  }
}));


const fallbackLoad = (url, {route, data, locked}) => {
  homeButton.disabled = !route;  // show home button on non-"/" pages
  return loader.load(url, data);
};
const {scope, go, write} = configureProdRouter(buildLoader(fallbackLoad, true));
document.body.addEventListener('click', globalClickHandler(scope, go));


homeButton.addEventListener('click', (ev) => go(''));


function runner(port) {
  let recentScore = {};

  port.postMessage({type: 'ready'});
  port.postMessage({type: 'resume'});

  port.onmessage = (ev) => {
    const {type, payload} = ev.data;

    switch (type) {
      case 'score':
        recentScore = payload;
        return;

      case 'gameover':
        console.warn('got gameover', recentScore);
        go('');
        return;

      case 'ga':
        ga.apply(null, payload);
        return;

      case 'go':
        go(payload);
        return;

      case 'data':
        write(payload);
        return;
    }
  };
}


function failedToLoad() {
  // TODO(samthor): Do anything at all?
}

