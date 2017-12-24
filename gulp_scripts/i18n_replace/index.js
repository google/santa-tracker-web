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

/* jshint node: true */

'use strict';

const fs = require('fs');
const path = require('path');
const through2 = require('through2');
const gutil = require('gulp-util');

const mutate = require('../mutate_html');

module.exports = function replaceMessages(opts) {
  opts = Object.assign({strict: false, ext: 'html'}, opts);
  const pendingMessages = getMsgs(opts.path).then((data) => new MessageData(data));

  async function transform(file) {
    if (file.isStream()) {
      throw new gutil.PluginError('i18n_replace', 'no support for streams');
    }

    const ext = path.extname(file.path);
    if (ext !== `.${opts.ext || 'html'}` || file.isNull()) {
      return file;  // ignore if the file isn't processable
    }

    const messageData = await pendingMessages;
    const src = file.contents.toString();
    const rootPage = (path.dirname(file.relative) === '.');

    messageData.langs.forEach((lang) => {
      const ext = `_${lang}.html`;
      const replaced = mutate(src, function() {
        const s = (q, cb) => Array.from(this.querySelectorAll(q)).forEach(cb);

        s('[msgid]', (el) => {
          if (el.localName === 'i') {
            return;  // ignore, used by santa-strings
          }
          const msgid = el.getAttribute('msgid');
          const msg = messageData.format(lang, msgid);
          el.removeAttribute('msgid');
          mutateElement(el, msg, msgid);
        });
        s('i18n-msg', (el) => {
          throw new gutil.PluginError('i18n_replace', `i18n-msg without msgid: ${el.outerHTML}`);
        });
        s('[lang]', (el) => el.setAttribute('lang', lang));
        s('[href$="_en.html"]', (el) => {
          const href = el.getAttribute('href').replace(/_en\.html$/, ext);
          el.setAttribute('href', href);
        });
      });

      // Note that this always writes a new HTML file, even if the content is the same (perhaps a
      // scene uses no i18n-msg elements).

      if (!rootPage && !file.path.match(/(_en)\.html$/)) {
        if (replaced !== src) {
          // we found i18n-msg instances but there was no '_en.html' suffix
          throw new gutil.PluginError('i18n_replace',
              `had translated content, didn't end with _en.html: ${file.relative}`)
        }
        // ... this is a scene we've decided won't be translated anyway.
        return this.push(file);
      }

      // Put non-en root pages (e.g., index, cast) in /intl/ directories.
      const dir = (rootPage && lang !== 'en') ? `/intl/${lang}_ALL/` : '/';
      const i18nfile = file.clone();
      i18nfile.path = path.dirname(file.path) + dir +
          path.basename(file.path).replace(/_en\.html$/, ext);
      i18nfile.contents = new Buffer(replaced);
      this.push(i18nfile);
    });

    const missing = messageData.missing;
    const msgids = Object.keys(missing);
    msgids.forEach((msgid) => {
      const langs = missing[msgid];
      const ratio = `${(langs.size/messageData.count*100).toFixed()} %`;
      const rest = (langs.size <= 10) ? `[${[...langs]}]` : '';
      gutil.log('Missing', `'${gutil.colors.yellow(msgid)}'`,
          'for', gutil.colors.red(ratio), 'of languages', rest);
    });
    if (opts.strict && msgids.length) {
      throw new gutil.PluginError('i18n_replace', `missing strings for ${msgids.length} messages`);
    }
  };

  // TODO(samthor): Make a Promise-safe through2 version
  return through2.obj(function(file, enc, cb) {
    transform.call(this, file).then((f) => cb(null, f), (err) => this.destroy(err));
  });
};

/**
 * Mutates a given element to have an updated message.
 * @param {!Element} el
 * @param {string} msg
 * @param {string} msgid
 */
function mutateElement(el, msg, msgid) {
  switch (el.localName) {
  case 'title':
    el.textContent = msg;
    break;
  case 'i18n-msg':
    if (el.innerHTML !== 'PLACEHOLDER_i18n') {
      throw new gutil.PluginError('i18n_replace',
          `i18n-msg was not "PLACEHOLDER_i18n" for ${msgid} in: ${file.relative}`);
    }
    const otherAttributes = Array.from(el.attributes).map((attr) => attr.name);
    if (otherAttributes.length) {
      gutil.log(`Unexpected attributes on '${gutil.colors.yellow(msgid)}':`,
          gutil.colors.red(otherAttributes.join(', ')));
    }
    el.outerHTML = msg;
    break;
  case 'meta':
    el.setAttribute('content', msg);
    break;
  default:
    throw new gutil.PluginError('i18n_replace', `msgid on unhandled tag: ${el.outerHTML}`);
  }
}

/**
 * MessageData is a convenience wrapper for the Gulp plugin in this file. It allows easy
 * retrieval and formatting of msgids, and records missing msgids.
 */
class MessageData {

  /**
   * @param {!Object<!Object<string>>}
   */
  constructor(data) {
    this.data_ = data;
    this.missing_ = {};
    this.count_ = Object.keys(this.data_).length;
  }

  /**
   * Records the msgid as missing.
   */
  recordMissing_(lang, msgid) {
    let langs = this.missing_[msgid];
    if (langs === undefined) {
      this.missing_[msgid] = langs = new Set();
    }
    langs.add(lang);
  }

  get count() {
    return this.count_;
  }

  get missing() {
    return this.missing_;
  }

  get langs() {
    return Object.keys(this.data_);
  }

  /**
   * Formats the passed msgid. Splits on comma.
   *
   * This behavior is a bit flaky, as maybe we have msgids with commas. It's only used by the
   * fanout task.
   *
   * @param {string} lang
   * @param {string} s
   * @return {string}
   */
  format(lang, s) {
    const parts = s.split(',').filter((x) => x);
    return parts.map((part) => this.get(lang, part)).join(' \u2014 ');  // mdash
  }

  get(lang, msgid) {
    const msgs = this.data_[lang] || {};
    let msg = msgs[msgid];
    if (!msg) {
      this.recordMissing_(lang, msgid);
      msg = this.data_['en'][msgid];  // default to English

      // Fallback to e.g., fr for fr-CA, or es for es-419.
      const parts = lang.split('-');
      const base = parts[0];
      if (base && base !== lang && base in this.data_) {
        msg = this.data_[base][msgid] || msg;
      }
    }

    return msg ? msg.message : 'MESSAGE_NOT_FOUND';
  }
}


/**
 * Read messages from _messages/*.json into a map.
 * Returns a promise-like object.
 *
 * @param {string} msgDir
 * @return {!Promise<!Object<!Object<string>>>}
 */
function getMsgs(msgDir) {
  function load(filename) {
    const lang = path.basename(filename, '.json');
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(msgDir, filename), (err, data) => {
        if (err) {
          return reject(err);
        }

        const part = {};
        part[lang] = JSON.parse(data);
        resolve(part);
      });
    });
  }

  return new Promise((resolve, reject) => {
    fs.readdir(msgDir, (err, files) => {
      if (err) {
        return reject(err);
      }

      const all = files.filter((f) => f.endsWith('.json')).map(load);
      resolve(Promise.all(all).then((out) => {
        const msgs = {};
        for (const part of out) {
          for (const lang in part) {
            msgs[lang] = part[lang];
          }
        }
        return Object.freeze(msgs);
      }, reject));
    });
  });
}
