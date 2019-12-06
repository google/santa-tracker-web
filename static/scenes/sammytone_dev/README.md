# Google Santa Tracker for fallback mode

This coding project is a text-based Santa Tracker for older browsers that are unable to run the main Santa Tracker.
It is made to go at the top of [the fallback Santa Tracker](https://santatracker.google.com/?fallback=1).
This version of the Tracker is designed to be used in the [fallback Santa Tracker](https://santatracker.google.com/?fallback=1) for older, less powerful browsers such as Internet Explorer 11 and pre-Chromium Edge.

## What visual elements it has

Essentially none, as of now. In the future there will be pixel art created.
The main visual element is an image for status, two placeholder images and one official image.

## What it does
- Requests a [JSON file from an API](https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media) that contains Santa's stops
- Ticks the slider 1 second every second
- Checks what time the slider is set at and sets displayed data to reflect said time, this data includes:
  - Status image
  - Status text
  - Estimated time of arrival/departure
  - Presents delivered

