# Google Santa Tracker for Web

This repository contains the code to [Google Santa Tracker](https://santatracker.google.com), an educational and entertaining tradition for the December holiday period.
It is a companion to the [Android](https://github.com/google/santa-tracker-android) app.

# Supports

Santa Tracker supports Chrome, Firefox and Safari.
It also supports oter Chromium-based browsers (Edge, Opera etc).

We present a "fallback mode" for older browsers, such as IE11.
Many older scenes support these browsers just fine.

# Run

You'll need `yarn` or `npm`.
You may also need Java if you're building on Windows, as the binary version of Closure Compiler is unsupported on that platform.

Clone and run `yarn` to install deps, and run `./serve.js` to run a development server.
This server compiles resources 'on-demand', and will copy the serving URL to your clipboard.

## Staging

To build Santa Tracker into a single folder for staging, run `./release.js` script with a local `--baseurl` (like `--baseurl=/`).
For example:

```bash
# see --help for more flags
./release.js -o --scene=newscene --baseurl=/
```

This will generate a self-contained release under `dist/prod`.
You can serve this folder on its own, or perhaps, deploy it to Firebase Hosting—run `firebase deploy` from the top-level of the project (you'll need to sign in and choose a default project).

## Build and Release

Santa Tracker is served entirely with static resources, so unlike development, every file must be compiled at once.

TODO(samthor): finish this part.

# Development Guide

The serving script `./serve.js` will listen on http://localhost:8000 by default.
This serves the contents of `prod/`, which provides the "host" which fundamentally loads scenes in frames.

To load a specific scene, open e.g. http://localhost:8000/boatload.html, or whatever matches the scene's name.
Once the site is loaded, you can also run `santaApp.route = 'sceneName'` in the console to switch scenes programatically.

## Advanced

Scenes are served from the static host, by default, hosted at http://127.0.0.1:8080/st/.
This is intentionally not equal to "localhost" so that prod and static run in isolated contexts.

To load individual scenes without their host, find them under http://127.0.0.1:8080/st/static/scenes/.
In this mode, features like scores, audio, some UI, and gamepads will not function as they are provided by the prod "host".

As of 2019, development requires Chrome or a Chrome-like browser.

The [Staging](#Staging) guide above removes this isolation so that staging is a simple process that only requires a single domain.

## Add A New Scene

Scenes are fundamentally just pages loaded in an `<iframe>`.
You can write them in any way you like, but be sure to call out to the 'host API' to play audio, report scores, or request other things like the display of tutorials.

To add a new scene, you'll need to:

* Create the `static/scenes/sceneName` folder, adding `index.html`, which runs code in ES modules only:

  1. Ensure you include a `<script type="module">` that imports `src/scene/api.js`, which sets up the connection to the prod "host".
  2. Optionally listen to events from the API, such as 'pause', 'resume', and 'restart'; and configure an `api.ready(() => { ... })` callback that is triggered when the scene is to be swapped in
  3. Import `./:closure.js` if you're writing Closure-style code―this will compile everything under `js/`
  4. For more information, see an existing scene like [boatload](static/scenes/boatload/index.html) or [santaselfie](static/scenes/santaselfie/index.html)

* Add associated PNGs:

  * `static/img/scenes/sceneName_2x.png` (950x564) and `sceneName_1x.png` (475x282)
  * `prod/images/og/sceneName.png` (1333x1000)
  
* Name the scene inside [strings](static/src/strings/scenes.js).

## Environment

The build system provides a virtual file system that automatically compiles various source types useful for development.
This includes:

* `.css` files are generated for their corresponding `.scss`
* `.json` is generated for their corresponding `.json5`
* The `static/scenes/sceneNane./:closure.js` file can be read to compile an older scene's `js/` folder with Closure Compiler, providing a JS module with default export.

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

## Sound

Santa Tracker uses an audio library known as kplay, which is inspired by [Klang](https://jshakansson.se/portfolio/item/santatracker) and reads its config files.
It exists in the prod "host" only, but can be triggered by API calls in scenes.

It plays audio triggers which play temporary sounds (e.g., a button click) or loops (audio tracks).
Scenes can be configured with audio triggers to start with (via `api.config({sound: [...]})`) which will cause all previous audio to stop, good for shutting down previous games.

## Translations

Santa Tracker contains translations for a variety of different languages.
These translations are sourced from Google's internal translation tool.

If you're adding a string for development, please modify `en_src_messages.json` and ask a Google employee to request a translation run.
If you'd building Santa Tracker for production, you'll need the string to be translated and the final output contained within `lang/`.

# License

All image and audio files (including *.png, *.jpg, *.svg, *.mp3, *.wav 
and *.ogg) are licensed under the CC-BY-NC license. All other files are 
licensed under the Apache 2 license. See the LICENSE file for details.

    Copyright 2019 Google LLC
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
