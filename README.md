Google Santa Tracker for Web
============================

This repository contains the code to Google Santa Tracker, an educational and entertaining tradition for the December holiday period.
It is a companion to the [Android](https://github.com/google/santa-tracker-android) app.

![Village Screenshot](santa-preview.png)

## Prerequisites

You'll need `npm` and `bower` (use `npm install -g bower` if it's missing) available on your system.

## Setup

Clone project, then from within the repo:

```bash
$ npm install
```

## Development

Build and run with `gulp serve`.
This will serve from the root directory and recompile JavaScript or CSS on watched changes.

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
