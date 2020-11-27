⚠️ This contains the code for Santa Tracker used up until 2018.

# Intro

This repository contains the code to [Google Santa Tracker](https://santatracker.google.com), an educational and entertaining tradition for the December holiday period.
It is a companion to the [Android](https://github.com/google/santa-tracker-android) app.

If you'd like to learn more about the engineering that goes into Santa Tracker, and how Santa Tracker works offline as a Progressive Web App, please check out [Santa Tracker as a PWA](https://developers.google.com/web/showcase/2017/santa).

<img src="https://storage.googleapis.com/santa/santa-preview.jpeg" width="384" align="center" />

## Changes

In the 2016 version of Santa Tracker, some featured changes include-

* Upgrade to use Polymer 1.7
* Santa is a Progressive Web App supporting Add to Home Screen and offline through Service Worker
* Further streamlined Chromecast support
* Support the [Web Share API](https://developers.google.com/web/updates/2016/10/navigator-share) where available
* Added several new games, including Gift Matcher, Code a Snowflake and Wrap Battle

# Supports

Santa Tracker supports Chrome, Firefox, and Edge; it also supports IE11, Safari 9+ and Chromium-based browsers (Opera, Samsung etc) at m44 or above.

# Usage

## Prerequisites

You'll need `yarn`, `bower` (use `yarn global add bower` if it's missing) and Java available on your system.

## Setup

Clone project, then from within the repo:

```bash
$ yarn install
```

This will implicitly install dependencies and run `gulp`.
For a list of commands, run `gulp help` (`--help` shows Gulp's help)

## Build and run

Build and run with `gulp serve`.
This will serve from the root directory and recompile JavaScript or CSS on watched changes.
The first build might take some time (~5-10m), as it compiles every scene.

You can load scenes (even while locked) via their ID, e.g. at `/codeboogie.html`.
Alternatively, unlock houses (in dev) by calling `santaApp.unlockAllHouses()`.

If you'd like to serve another way, then you can build all development dependencies with `gulp`.

## Serve production build

First, build for prod and set a `baseurl` for static assets:

    gulp dist --compile --baseurl="http://localhost:9000/"

Serve prod:

    static-server -p 3000 dist_prod/

Separately, serve the static resources:

    static-server -p 9000 --cors http://localhost:3000 dist_static/

Open http://localhost:3000/.

# Development Guide

## Scenes

Santa Tracker is comprised shared code along with many individual scenes: e.g., `village`, `tracker` etc.

### Paths

Scenes are referenced in a few locations-

* `scenes.js`: The definition for each scene is contained here.
  If an `entryPoint` is specified, then the scene is compiled with the Closure Compiler.
  This is also used as the reference for the HTML fanout, creating a HTML file per scene, per language.
* `images/og`: The OG image (for sharing) in the form `images/og/sceneName.png`, and have a resolution of 1333x1000.
* `images/scenes`: Each scene should have two images, the centered and resized version of the OG image-
  1. a 950x564 2x image: `images/scenes/sceneName_2x.png`
  1. a 475x282 1x image: `images/scenes/sceneName.png`
* `elements/santa-strings.html`: Due to inconsistent scene i18n message IDs, each scene needs to have its name declared here for dynamic string loading at runtime.

There are two optional locations-

* `scenes/dorf/sass/_houses.scss`: If the scene is also a _house_ that lives in the village.
* `scenes/press/js/models.js`: To be included in the Press and Educators scenes.

## Translations

Santa Tracker contains translations for a variety of different languages.
These translations are sourced from Google's internal translation tool.

If you're adding a string for development, please modify `en_src_messages.json`.
If you'd building Santa Tracker for production, you'll need the string to be translated.

# License

All image and audio files (including *.png, *.jpg, *.svg, *.mp3, *.wav 
and *.ogg) are licensed under the CC-BY-NC license. All other files are 
licensed under the Apache 2 license. See the LICENSE file for details.

    Copyright 2015 Google Inc. All rights reserved.
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
