/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Registry of pre-generated Santa postcards keyed by route stop ID.
 * Every `_static` and `_msg` call MUST be a static tagged template literal so
 * `build/source-magic.js` compiles all 45 language bundles during `./release.js`.
 */

import {_msg, _static} from '../../../src/magic.js';

export const POSTCARD_SHARED_ASSETS = {
  mailboxUrl: _static`img/postcards/mailbox.png`,
  stampUrl: _static`img/postcards/postcard_stamp.svg`,
  geminiSparkUrl: _static`img/postcards/gemini_spark.png`,  // official spark from the Gemini logo toolkit
  postmarkUrl: _static`img/postcards/postcard_postmark.png`,
};

export const POSTCARD_UI_STRINGS = {
  mailboxLabel: () => _msg`postcard_mailbox_label`,
  flipToBack: () => _msg`postcard_flip_to_back`,
  flipToFront: () => _msg`postcard_flip_to_front`,
  download: () => _msg`postcard_download`,
  share: () => _msg`postcard_share`,
  journalTitle: () => _msg`postcard_journal_title`,
  recipientName: () => _msg`postcard_recipient_name`,
  recipientStreet: () => _msg`postcard_recipient_street`,
  recipientCity: () => _msg`postcard_recipient_city`,
  madeWithGemini: () => _msg`postcard_made_with_gemini`,
  nextStop: (city) => _msg`postcard_next_stop`.replace('{city}', city),
  santaSignature: () => _msg`postcard_santa_signature`,
  emptyMailbox: () => _msg`postcard_mailbox_empty`,
  previous: () => _msg`postcard_previous`,
  next: () => _msg`postcard_next`,
  viewAll: () => _msg`postcard_view_all`,
  back: () => _msg`postcard_back_to_carousel`,
  close: () => _msg`postcard_close_mailbox`,
};

export const POSTCARDS_BY_STOP_ID = {
  provideniya: {
    id: 'provideniya',
    frontUrl: _static`img/postcards/provideniya.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_provideniya`,
  },
  anadyr: {
    id: 'anadyr',
    frontUrl: _static`img/postcards/anadyr.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_anadyr`,
  },
  'petropavlovsk-kamchatsky': {
    id: 'petropavlovsk-kamchatsky',
    frontUrl: _static`img/postcards/petropavlovsk-kamchatsky.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_petropavlovsk-kamchatsky`,
  },
  bikini: {
    id: 'bikini',
    frontUrl: _static`img/postcards/bikini.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_bikini`,
  },
  majuro: {
    id: 'majuro',
    frontUrl: _static`img/postcards/majuro.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_majuro`,
  },
  tarawa: {
    id: 'tarawa',
    frontUrl: _static`img/postcards/tarawa.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_tarawa`,
  },
  funafuti: {
    id: 'funafuti',
    frontUrl: _static`img/postcards/funafuti.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_funafuti`,
  },
  atafu: {
    id: 'atafu',
    frontUrl: _static`img/postcards/atafu.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_atafu`,
  },
  apia: {
    id: 'apia',
    frontUrl: _static`img/postcards/apia.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_apia`,
  },
  suva: {
    id: 'suva',
    frontUrl: _static`img/postcards/suva.jpg`,
    postmarkDay: 24,
    getMessage: () => _msg`postcard_note_suva`,
  },
};

/**
 * Returns the resolved postcard object for a route destination, or null if none exists.
 * @param {?Object} destination Route destination object from `santa_<lang>.json`
 * @param {?Object=} nextDestination The following stop on the route, used for Santa's
 *     "Off to <city> next!" line. Omitted when there is none or it's the North Pole landing.
 * @return {?Object}
 */
export function getPostcardForDestination(destination, nextDestination = null) {
  if (!destination || !destination.id) {
    return null;
  }
  const entry = POSTCARDS_BY_STOP_ID[destination.id];
  if (!entry) {
    return null;
  }
  return {
    id: entry.id,
    city: destination.city || '',
    region: destination.region || '',
    frontUrl: entry.frontUrl,
    postmarkDay: entry.postmarkDay,
    nextCity: nextDestination && nextDestination.id !== 'landing' ? nextDestination.city || '' : '',
    message: entry.getMessage(),
  };
}
