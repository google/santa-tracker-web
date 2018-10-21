# Google Santa Tracker for Web

This repository contains the code to [Google Santa Tracker](https://santatracker.google.com), an educational and entertaining tradition for the December holiday period.
It is a companion to the [Android](https://github.com/google/santa-tracker-android) app.

# Supports

Santa Tracker supports Chrome, Firefox, and Edge; it also supports IE11, Safari 10+ and Chromium-based browsers (Opera, Samsung etc) at m44 or above.

# Run

You'll need `yarn` or `npm`, as well as Java (these instructions will assume `yarn`).

Clone the project, run `yarn` to install dependencies, then `yarn start` to bring up a development server.
Compilation of scenes, CSS etc is done via middleware at serve time: if you're interested, see the `-transform.js` files in this directory.

## Build and Release

Santa Tracker is served entirely with static resources, so unlike development, every file must be compiled at once.
TODO(samthor): finish this part.

# Development Guide

Santa Tracker is usees a core 'App Shell' model, as well as individual scenes.
These scenes can typically be run on their own, as well as part of the whole.

## New Scene

To add a new scene, you'll need to update some locations.

1. The [`scenes.js`](scenes.js) file is the master definition for all scenes.
   It contains details about its colors, category, strings etc.
2. Every scene should have associated PNG assets.
   * `images/scenes/sceneName_2x.png` (950x564) and `sceneName_1x.png` (475x282)
   * `images/scenes/sceneName_og.png` (1333x1000)

## JavaScript

Santa Tracker generates JavaScript that is modified from its original source.

* There are some special template tags, which are compiled away.
  1. <code>_msg`msgid_here`</code> is replaced with the translated string contents
  2. <code>_style`style_name`</code> is replaced with the compiled style file from within `/styles`

* Non-relative ES module imports, those importing `node_modules`, are translated to their actual paths (e.g. `import '@polymer/...`)

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
