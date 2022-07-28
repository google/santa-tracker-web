# Google Santa Tracker for Web

This repository contains the code to [Google Santa Tracker](https://santatracker.google.com), an educational and entertaining tradition for the December holiday period.

We hope you find this source code interesting.
In general, we do not accept external contributions from the public.
You can file bug reports or feature requests, or contact the engineering lead [Jez Swanson](https://twitter.com/jezzamonn).

(This text duplicated in [contributing.md](docs/contributing.md))

## Supports

Santa Tracker supports evergreen versions of Chrome, Firefox and Safari.
It also supports other Chromium-based browsers (Edge, Opera etc).

We also present a "fallback mode" for older browsers, such as IE11, which allow users to play a small number of historic games.

# Site Structure

Santa Tracker is split up into different scenes. Each page on the Santa Tracker corresponds to one scene, including the main village page, [modvil](static/scenes/modvil/index.html). The scenes are in the [static/scenes/](static/scenes/) directory. Each scene is loaded as an iframe, and is relatively self contained.

The host part of the site handles the loading of each scene, as well as the music and common UI, like the game score or tutorial. There's an [API](static/src/scene/api.js) between the host and the scenes, which allows the host to notify the scenes when events like the scene loading happens, and allows the scenes to tell the host to do things like play a song or update the score.

# Development Guide

## Running locally

You'll need `yarn` or `npm`.
You may also need Java if you're building on Windows, as the binary version of Closure Compiler is unsupported on that platform.

Clone and run `yarn` or `npm install` to install deps, and run `./serve.js` to run a development server.
The development URL will be copied to your clipboard.

The serving script `./serve.js` will listen on both ports 8000 and 8080 by default. Port 8000 serves the host part of the site (this corresponds to the production https://santatracker.google.com domain), and port 8080 serves the static content, including the scenes.

To load a specific scene, open e.g., http://localhost:8000/boatload.html.
Once the site is loaded, you can also run `santaApp.route = 'sceneName'` in the console to switch scenes programmatically.

If you'd like to load a scene from the static domain—without the "host" code—you can load it at e.g., http://127.0.0.1:8080/st/scenes/elfmaker/.
This is intentionally not equal to "localhost" so that prod and static run cross-domain.
The "host" provides scores, audio and some UI, so not all behavior is available in this mode.

As of 2020, development requires Chrome or a Chromium-based browser.
This is due to the way we identify ESM import requests, where Chromium specifies additional headers.
(This is a bug, not a feature.)

## Add A New Scene

Scenes are fundamentally just pages loaded in an `<iframe>`.
You can write them in any way you like, but be sure to call out to the "host" to play audio, report scores, or request other things like the display of tutorials.

To add a new scene, you'll need to:

* Create the `static/scenes/sceneName` folder, adding `index.html`, which runs code in ES modules only:

  1. Ensure you include a `<script type="module">` that imports `src/scene/api.js`, which sets up the connection to the prod "host".
  2. Optionally listen to events from the API, such as 'pause', 'resume', and 'restart'; and configure an `api.ready(() => { ... })` callback that is triggered when the scene is to be swapped in
  3. Import the magic URL `./:closure.js` if you're writing Closure-style code―this will compile everything under `js/`
  4. For more information, see an existing scene like [boatload](static/scenes/boatload/index.html) or [santaselfie](static/scenes/santaselfie/index.html)

* Add associated PNGs:

  * `static/img/scenes/sceneName_2x.png` (950x564) and `sceneName_1x.png` (475x282)
  * `prod/images/og/sceneName.png` (1333x1000)
  
* Name the scene inside [strings](static/src/strings/scenes.js).

* If your scene should not be released to production, disable it inside [release.js](release.js).

## Environment

The build system provides a virtual file system that automatically compiles various source types useful for development and provides a number of helpers.
This includes:

* `.css` files are generated for their corresponding `.scss`
* `.json` is generated for their corresponding `.json5`
* The `static/scenes/sceneName/:closure.js` file can be read to compile an older scene's `js/` folder with Closure Compiler, providing a JS module with default export.

These files don't actually exist, but are automatically created on use.
For example, if `foo.scss` exists, you can simply load `foo.css` to compile it automatically.

### Sass helpers

When writing SCSS, the helper `_rel(path.png)` generates a `url()` which points to a file _relative_ to the current `.scss` source file—even imports.

This works regardless of how the SCSS is finally used, whether `<link href="..." />` or as part of a Web Component.

### JavaScript

The source file `static/src/magic.js` provides various template tag helpers which, while real functions, are inlined at release time.
These include:

  * ``_msg`msgid_here`​`` generates the corresponding i18n string
  * ``_static`path_name`​`` generates an absolute reference to a file within `static`

Also, Santa Tracker is built using JS modules and will rewrite non-relative imports for `node_modules`.
For example, if you `import {LitElement} from 'lit-element';`, this will be rewritten to its full path for development or release.

### Imports

As well as JavaScript itself, Santa Tracker's development environment allows imports of future module types: CSS, JSON and HTML.

## Input

When possible support touch, keyboard, and gamepad input.  Note that basic gamepad
support is offered via synthetic keyboard events in [keys.js](static/src/core/keys.js).

## Sound

Santa Tracker uses an audio library known which exists in the prod "host" only, but can be triggered by API calls in scenes.
This is largely undocumented and provided by an external vendor.
If you're interested in the audio source files, they are in the repo under `static/audio` (and are licensed, as mentioned below, as CC-BY).

The audio library plays audio triggers which play temporary sounds (e.g., a button click) or loops (audio tracks).
Scenes can be configured with audio triggers to start with (via `api.config({sound: [...]})`) which will cause all previous audio to stop, good for shutting down previous games.

## Translations

Santa Tracker contains translations for a variety of different languages.
These translations are sourced from Google's internal translation tool.

If you're adding a string for development, please modify `en_src_messages.json` and ask a Google employee to request a translation run.
If you'd building Santa Tracker for production, you'll need the string to be translated and the final output contained within `lang/`.

## Production

While the source code includes a release script, it's not intended for end-users to run and is used by Googlers to deploy the site.

# Historic Versions

The previous version of Santa Tracker, used until 2018, is available in the [archive-2018](https://github.com/google/santa-tracker-web/tree/archive-2018) branch.

# License

All image and audio files (including *.png, *.jpg, *.svg, *.mp3, *.wav 
and *.ogg) are licensed under the CC-BY license. All other files are 
licensed under the Apache 2 license. See the LICENSE file for details.

    Copyright 2020 Google LLC
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
