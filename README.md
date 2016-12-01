Google Santa Tracker for Web
============================

This repository contains the code to [Google Santa Tracker](https://santatracker.google.com), an educational and entertaining tradition for the December holiday period.
It is a companion to the [Android](https://github.com/google/santa-tracker-android) app.

<img src="https://storage.googleapis.com/santa/santa-preview.jpeg" width="384" align="center" />

## Changes

In the 2015 version of Santa Tracker, some featured changes include-

* Upgrade to use Polymer 1.0+
* Revamped Santa's Village including mobile-friendly responsive design
* Added several new games, including Present Bounce and Code Boogie, written in ES6
* Streamlined Chromecast support
* Increased use of emojis

# Supports

Santa Tracker supports Chrome, Firefox, and Edge; it also supports IE11, Safari 9+ and Chromium-based browsers (Opera, Samsung etc) at m44 or above.

# Usage

## Prerequisites

You'll need `npm`, `bower` (use `npm install -g bower` if it's missing) and Java available on your system.

## Setup

Clone project, then from within the repo:

```bash
$ npm install
```

For a list of commands, run `gulp --help`.

## Build and run

Build and run with `gulp serve`.
This will serve from the root directory and recompile JavaScript or CSS on watched changes.
The first build might take some time (~10-20m), as it compiles every scene.

You can load scenes (even while locked) via their ID, e.g. at `/#codeboogie`.
Alternatively, unlock houses (in dev) by calling `santaApp.unlockAllHouses()`.

If you'd like to serve another way, then you can build all development dependencies with `gulp`.

## Serve production build

First, build for prod and set a `baseurl` for static assets:

    gulp dist --baseurl="http://localhost:9000/"

Serve prod:

    serve -p 3000 dist_prod/

Separately, serve the static resources:

    serve -p 9000 --cors dist_static/

Open http://localhost:3000/.

## Release

Use `gulp dist --pretty` to build.
This performs additional steps, such as vulcanizing code and internationalization.
Serve from `./dist_pretty`.

## Portal Docker deployment

* Checkout / update any dependent repos

* Build the image: `docker build -t santa .`

* Create the container: `docker create --restart always -p 8080:8080 --name santa santa`

* Run the container: `docker start -d santa`

* Verify that the container is running: `docker ps`

* Verify that the container is listening: `curl -I http://lg-head:8080`

To rebuild, run `docker rm -f santa` and start over from building the image.

# Scenes

Santa Tracker is comprised shared code along with many individual scenes: e.g., `village`, `tracker` etc.

## Relevant Paths

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
