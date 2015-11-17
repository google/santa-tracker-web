/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */


goog.provide('app.config.Styles');

/**
 * Style templates - Dimensions and HTML for all available types of level objects
 * @const
 */
app.config.Styles = {
  snowGlobe: {
    className: 'object--snowglobe snowglobe',
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 41.1 47.7"><defs><circle id="a" cx="20.1" cy="20.1" r="20.1"/></defs><path fill="#F9CE1D" d="M37 47.7H3.2l3.3-10.1h27.2"/><circle fill="#86BAD6" cx="20.1" cy="20.1" r="20.1"/><defs><circle id="b" cx="20.1" cy="20.1" r="20.1"/></defs><clipPath id="c"><use xlink:href="#b" overflow="visible"/></clipPath><path clip-path="url(#c)" fill="#FFF" d="M2.2 29.3c2.5-2.1 5.9-2.8 9-2 2.1.6 4.1 1.8 6.2 1.3 1.7-.4 2.9-1.8 4.5-2.4 1.3-.5 2.8-.4 4.2-.1 1.4.3 2.7.9 4.1 1.3 2.7.8 5.6 1 8.4.5v5.3l-8.9 8.9H6.4l-4.8-7.3.6-5.5z"/><path clip-path="url(#c)" fill="none" stroke="#FFF" stroke-width="1.215" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray="0,27.3375" d="M23.1 11.1c-1.7-.2-3.4-.2-5 .1-.7.1-1.4.4-1.6 1-.2.5 0 1 .4 1.4.3.4.8.6 1.3.9l7.5 3.9c.8.4 1.7 1.1 1.5 2-.2.7-1 1-1.7 1.1-2.5.4-5.2.1-7.5-.8-.9-.3-1.7-.8-2.3-1.5s-.8-1.8-.3-2.6c.6-.9 1.7-1.1 2.8-1.1 1.9-.1 3.8.2 5.7.1 1.9 0 3.9-.4 5.4-1.6s2.5-3.2 1.8-5c-.4-1.2-1.4-2.1-2.5-2.8-5.7-4-13.4-5-19.9-2.6-1.8.7-3.5 1.6-4.9 3s-2.3 3.2-2.4 5.1c-.1 2 .9 3.9 2.1 5.5 3.1 4 8.4 6.1 13.5 6s10-2.3 14-5.6c.9-.8 1.8-1.6 2.8-2.2 1-.6 2.3-.9 3.4-.5s2 1.4 2.5 2.5.6 2.3.8 3.5c.1.9.2 1.9-.4 2.7-.6.8-1.7 1-2.7 1-5.6.1-11.1-3-13.8-7.9-1.2-2.2-2-4.9-4.1-6.3-1.9-1.3-4.4-1.2-6.6-.4-2.1.8-3.9 2.3-5.7 3.8-1.2 1-2.4 2-2.7 3.5-.4 2 1.2 3.8 2.9 4.7 2.6 1.3 5.7 1.1 8.5.1 2.7-1 5.2-2.6 7.7-4.1 2.5-1.5 5-3 7.9-3.6"/><path opacity=".2" fill="#4D4D4D" d="M31.3 3.4C34.8 7 37 12 37 17.4c0 11.1-9 20.2-20.2 20.2-3.9 0-7.5-1.1-10.6-3 3.6 3.5 8.5 5.6 13.9 5.6 11.1 0 20.1-9 20.1-20.1 0-7-3.5-13.1-8.9-16.7z"/><path fill="none" stroke="#F9CE1D" stroke-width="5.982" stroke-linecap="round" stroke-miterlimit="10" d="M3.7 37.6h32.8"/><circle fill="#FFF" cx="11.3" cy="11.4" r="2.7"/><circle opacity=".7" fill="#FFF" cx="7.4" cy="17.1" r="1.2"/><g><path opacity=".3" fill="#4D4D4D" d="M5.5 40.6l30.7 5.2-1.6-5.2"/></g><g><defs><circle id="d" cx="20.1" cy="20.1" r="20.1"/></defs></g></svg>',
    width: 40,
    height: 40 * 1.15,
    dynamicShadow: true
  },
  presentCircle: {
    className: 'object--present-cricle',
    innerHTML: '',
    width: 40,
    height: 40,
    dynamicShadow: true
  },
  presentSquare: {
    className: '',
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path fill="#DA4637" d="M0 0h50v50H0z"/><path fill="#F1B31C" d="M28.2 21.8V0h-6.4v21.8H0v6.4h21.8V50h6.4V28.2H50v-6.4"/></svg>',
    width: 40,
    height: 40,
    dynamicShadow: true
  },
  presentRectangle: {
    className: 'object--present-rect',
    innerHTML: '',
    width: 40,
    height: 40 * 1.5,
    dynamicShadow: true
  },
  target: {
    className: '',
    width: 40 * 2,
    height: 40 * 1.5
  },
  angledBeam: {
    className: '',
    width: 300,
    height: 200,
    stroke: 30, // thickness of bar
    padding: 10,
    hasAngle: true
  },
  straightBeam: {
    className: '',
    width: 200,
    height: 30, // thickness of bar
    hasAngle: false
  },
  conveyorBelt: {
    className: 'object--conveyorBelt',
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 218.7 46.2"><circle fill="#EF6C00" cx="23.1" cy="23.1" r="20.7"/><path fill="#FFF" d="M43.1 17.7c.2 5.2-1.7 10.4-5.6 14.4-6 6-15.7 6-21.7 0-4.7-4.7-4.7-12.4 0-17.1 1.8-1.8 4.2-2.8 6.7-2.8s4.9 1 6.7 2.8c1.4 1.4 2.2 3.2 2.2 5.2s-.8 3.8-2.1 5.2c-1.1 1.1-2.5 1.7-4 1.7s-2.9-.6-4-1.7c-1.7-1.7-1.7-4.4 0-6.1.6-.6 1.4-1 2.3-1 .9 0 1.7.3 2.3 1 .5.5.7 1.1.7 1.7 0 .6-.2 1.2-.7 1.7-.7.7-1.8.7-2.4 0-.4-.4-.4-1.2 0-1.6.4-.4.4-1.1 0-1.5-.4-.4-1.1-.4-1.5 0-1.2 1.2-1.2 3.4 0 4.6 1.5 1.5 3.9 1.5 5.3 0 .8-.8 1.3-2 1.3-3.2 0-1.2-.5-2.3-1.3-3.2-1-1-2.3-1.6-3.8-1.6-1.4 0-2.8.6-3.8 1.6-2.5 2.5-2.5 6.6 0 9.1 1.5 1.5 3.4 2.3 5.5 2.3s4-.8 5.5-2.3c1.8-1.8 2.8-4.1 2.8-6.7 0-2.5-1-4.9-2.8-6.7-2.2-2.2-5.1-3.4-8.1-3.4-3.1 0-6 1.2-8.1 3.4C9 19 9 28 14.5 33.5c6.8 6.8 17.8 6.8 24.6 0 2-2 3.5-4.3 4.6-6.8.2-1.2.3-2.4.3-3.6-.2-1.9-.4-3.7-.9-5.4z"/><circle fill="#37B34A" cx="195.6" cy="23.1" r="20.7"/><path fill="#FFF" d="M175.6 17.7c-.2 5.2 1.7 10.4 5.6 14.4 6 6 15.7 6 21.7 0 4.7-4.7 4.7-12.4 0-17.1-1.8-1.8-4.2-2.8-6.7-2.8s-4.9 1-6.7 2.8c-1.4 1.4-2.2 3.2-2.2 5.2s.8 3.8 2.1 5.2c1.1 1.1 2.5 1.7 4 1.7s2.9-.6 4-1.7c1.7-1.7 1.7-4.4 0-6.1-.6-.6-1.4-1-2.3-1-.9 0-1.7.3-2.3 1-.5.5-.7 1.1-.7 1.7 0 .6.2 1.2.7 1.7.7.7 1.8.7 2.4 0 .4-.4.4-1.2 0-1.6-.4-.4-.4-1.1 0-1.5.4-.4 1.1-.4 1.5 0 1.2 1.2 1.2 3.4 0 4.6-1.5 1.5-3.9 1.5-5.3 0-.8-.8-1.3-2-1.3-3.2 0-1.2.5-2.3 1.3-3.2 1-1 2.3-1.6 3.8-1.6 1.4 0 2.8.6 3.8 1.6 2.5 2.5 2.5 6.6 0 9.1-1.5 1.5-3.4 2.3-5.5 2.3s-4-.8-5.5-2.3c-1.8-1.8-2.8-4.1-2.8-6.7 0-2.5 1-4.9 2.8-6.7 2.2-2.2 5.1-3.4 8.1-3.4 3.1 0 6 1.2 8.1 3.4 5.5 5.5 5.5 14.5 0 20-6.8 6.8-17.8 6.8-24.6 0-2-2-3.5-4.3-4.6-6.8-.2-1.2-.3-2.4-.3-3.6.2-1.9.4-3.7.9-5.4z"/><path class="belt" fill="none" stroke="#F9CE1D" stroke-width="5.184" stroke-miterlimit="10" stroke-dasharray="13.9" d="M216.1 23.1c0 11.3-9.2 20.5-20.5 20.5H23.1c-11.3 0-20.5-9.2-20.5-20.5S11.8 2.6 23.1 2.6h172.5c11.3 0 20.5 9.2 20.5 20.5"/></svg>',
    width: 240,
    height: 52
  },
  spring: {
    className: 'object--spring',
    height: 70,
    width: 50,  
    jointAngle: false
  }
};