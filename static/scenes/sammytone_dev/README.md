# Google Santa Tracker for fallback mode

This coding project is a text based santa tracker for simple browsers that are unable to run the main santa tracker.
Made to go at the top of [this page](https://santatracker.google.com/?fallback=1), and if successful, may be used for chromecast.

## What it supports

This version of the tracker is designed to be used in the [fallback Santa Tracker](https://santatracker.google.com/?fallback=1) for older, less powerful browsers such as IE11 and pre-chromium Edge.

## What Visual elements it has

Essentially none, as of now. In the future there will be pixel art created for the design purposes.
An image for status, 2 placeholders and 1 official.

## What it does
- Requests a [JSON File from an API](https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media) that shows the stops of santa
- Ticks the slider 1 second every second
- Checks what time the slider is set at and sets displayed data to reflect said time, this data is:
  - Status image
  - Status text
  - Estimated time of arrival/departure
  - Presents delivered

