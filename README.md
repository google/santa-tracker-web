Google Santa Tracker 2014
============

This repository contains the code to Google Santa Tracker.

# Prerequisites

You'll need node installed, then bower (`npm install -g bower`) and compass >=1.0.1 (`gem install compass`).

# Setup

Clone project, then from within the repo:

```bash
$ bower install
$ npm install
```

## Development

Build with `gulp`. Alternatively, you can rebuild just the scenes with `gulp compile-scenes`, or the CSS with `gulp compass`.

The raw site can now be served from the root directory.

## Release

Use `gulp --pretty` to build. This performs additional steps such as vulcanizing code and internationalization. Serve from `./dist_pretty`.
