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
You may also need Java if you're building on Windows, as the binary version of Closure Compiler is unsupported.

Clone and run `yarn` to install deps, and run `./serve.js` to run a development server.

## Build and Release

Santa Tracker is served entirely with static resources, so unlike development, every file must be compiled at once.
TODO(samthor): finish this part.

# Development Guide

Santa Tracker uses an App Shell model (provided under `prod/`), as well as individual scenes which run within an `iframe`.
Each scene can also be run independently for testing.

## New Scene

To add a new scene, you'll need to update some locations.

1. The [`scenes.json5`](scenes.json5) file is the master definition for all scenes.
   It contains details about each scene's colors, rotation, category, strings etc.
2. Every scene should have associated PNG assets.
   * `static/img/scenes/sceneName_2x.png` (950x564) and `sceneName_1x.png` (475x282)
   * `prod/images/og/sceneName.png` (1333x1000)

## Environment

The build system provides a virtual file system that automatically compiles various source types useful for development.
This includes:

* `.css` files are generated for their corresponding `.scss`
* `.json` is generated for their corresponding `.json5`
* The `static/scenes/sceneNane./:closure.js` file can be read to compile an older scene's `js/` folder with Closure Compiler, providing a JS module with default export.

Additionally, when writing SCSS, the helper `_rel(path.png)` generates a `url()` which points to a file _relative_ to the current `.scss` source file, regardless of how the CSS is eventually used.

### JavaScript

The source file `static/src/magic.js` provides various template tag helpers which, while real functions, are inlined at release time.
These include:

  * ``_msg`msgid_here`​`` generates the corresponding i18n string
  * ``_static`path_name`​`` generates an absolute reference to a file within `static`

Santa Tracker is built using JS modules and will rewrite non-relative imports for `node_modules` (e.g. `lit-element` => `../../node_modules/lit-element/index.js`).

### Imports

As well as JavaScript itself, Santa Tracker's development environment allows imports of future module types: CSS, JSON and HTML.

## Sound

Santa Tracker uses an audio library known as [Klang](https://jshakansson.se/portfolio/item/santatracker).
It exists in the prod context only.

It's somewhat of a black box but has a config file provided by an upstream vendor, and provides a variety of features.
Internally, it plays single, or repeated music/audio tracks (e.g., one can trigger "holding down" a UI button, which plays indefinitely).
These are played on various channels which can overwrite each other or run independently.

In general, there are two "channels" that we care about:

* Music channel (controlled largely by `music_start_ingame`, `music_start_scene` or `music_start_village`)
* Game channel (controlled by `gameid_start` + `gameid_stop` or `_finish` etc)

There's a few ways to perform global operations:

* Sending `videoplayer_start` and `videoplayer_stop` mutes and unmutes sounds, respectively
* Sending `global_sound_off` and `global_sound_on` independently mutes and unmutes all sound
* Calling `Klang.stopAll()` kills all sounds, including music (but does not reset mute status)

Additionally, Klang listens to global document visibility, and will mute while in the background.

## Translations

Santa Tracker contains translations for a variety of different languages.
These translations are sourced from Google's internal translation tool.

If you're adding a string for development, please modify `en_src_messages.json`.
If you'd building Santa Tracker for production, you'll need the string to be translated and the final output contained within `lang/`.

# License

All image and audio files (including *.png, *.jpg, *.svg, *.mp3, *.wav 
and *.ogg) are licensed under the CC-BY-NC license. All other files are 
licensed under the Apache 2 license. See the LICENSE file for details.

    Copyright 2018 Google LLC
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
