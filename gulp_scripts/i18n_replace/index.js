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

const fs = require('fs');
const path = require('path');
const through2 = require('through2');
const gutil = require('gulp-util');
const format = require('sprintf-js').sprintf;

const mutate = require('../mutate_html');

module.exports = function replaceMessages(opts) {
  const warn = warnFunc(opts.strict);
  const msgs = getMsgs(opts.path);

  const stream = through2.obj(function(file, enc, cb) {
    if (file.isStream()) {
      error('No support for streams');
    }
    if (!file.path.match(/\.html$/) || file.isNull()) {
      // Don't do work if the file isn't HTML.
      warn('skipping non-html: %s', file.path);
      stream.push(file);
      return cb();
    }

    const missing = {};
    function recordMissing(msgid, lang) {
      let langs = missing[msgid];
      if (!langs) {
        missing[msgid] = langs = [];
      }
      langs.push(lang);
    }

    const src = file.contents.toString();

    msgs.then(messagesByLang => {
      Object.keys(messagesByLang).forEach(lang => {
        const msgs = messagesByLang[lang] || {};
        function lookup(msgid) {
          let msg = msgs[msgid];
          if (!msg) {
            recordMissing(msgid, lang);
            msg = messagesByLang['en'][msgid];

            // Check e.g., fr for fr-CA, or es for es-419.
            const parts = lang.split('-');
            const base = parts[0];
            if (base && base !== lang && base in messagesByLang) {
              msg = messagesByLang[base][msgid] || msg;
            }
          }
          return msg ? msg.message : 'MESSAGE_NOT_FOUND';
        }

        const ext = `_${lang}.html`;
        const replaced = mutate(src, function() {
          [...this.querySelectorAll('[msgid]')].forEach(el => {
            if (el.localName === 'i') {
              return;  // ignore, used by santa-strings
            }
            const msgid = el.getAttribute('msgid');
            const msg = lookup(msgid);
            el.removeAttribute('msgid');

            switch (el.localName) {
            case 'title':
              el.textContent = msg;
              break;
            case 'i18n-msg':
              if (el.innerHTML !== 'PLACEHOLDER_i18n') {
                error('i18n-msg was not "PLACEHOLDER_i18n" for %s in: %s', msgid, file.relative);
              }
              el.outerHTML = msg;
              break;
            case 'meta':
              el.setAttribute('content', msg);
              break;
            default:
              error('msgid on unhandled tag: %s', el.localName)
            }
          });
          [...this.querySelectorAll('i18n-msg')].forEach(el => {
            error('i18n-msg should be replaced with msgid, found: %s', el.outerHTML);
          });
          [...this.querySelectorAll('[lang]')].forEach(el => el.setAttribute('lang', lang));
          [...this.querySelectorAll('[href$="_en.html"]')].forEach(el => {
            const href = el.getAttribute('href').replace(/_en\.html$/, ext);
            el.setAttribute('href', href);
          });
        });

        // Note that this always writes a new HTML file, even if the content
        // is the same (perhaps a scene uses no i18n-msg elements).

        if (!file.path.match(/(index|cast|error|upgrade|_en)\.html$/)) {
          if (replaced === src) {
            // ... unless the filename doesn't end with _en.html, in which case
            // someone has accepted that it won't be translated anyway.
            stream.push(file);
            return;
          }
          error('[%s] Translatable files should end in _en.html', file.relative);
        }

        let dir = '/';
        // Only root pages should go in /intl/ directories.
        if (lang != 'en' && !file.path.match(/_en\.html$/)) {
          dir = `/intl/${lang}_ALL/`;
        }
        const i18nfile = file.clone();
        i18nfile.path = path.dirname(file.path) + dir +
            path.basename(file.path).replace(/_en.html$/, ext);
        i18nfile.contents = new Buffer(replaced);
        stream.push(i18nfile);
      });

      Object.keys(missing).forEach(function(msgid) {
        const langs = missing[msgid];

        if (langs.length >= 5) {
          warn('%s: missing \'%s\' for %d langs', file.relative, msgid, langs.length);
        } else {
          warn('%s: missing \'%s\' for [%s]', file.relative, msgid, langs.join(' '));
        }
      });
      cb();
    }).catch(err => {
      console.info('got err', err);
      cb(null, err);
    });
  });

  return stream;
};

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

      const all = files.filter(f => f.endsWith('.json')).map(load);
      resolve(Promise.all(all).then(out => {
        const msgs = {};
        for (const part of out) {
          for (const lang in part) {
            msgs[lang] = part[lang];
          }
        }
        return msgs;
      }, reject));
    });
  });
}

function warnFunc(strict) {
  return function(var_args) {
    const message = format.apply(this, arguments);
    if (strict) {
      throw new gutil.PluginError('i18n_replace', message);
    } else {
      gutil.log('WARNING[i18n_replace]:', message);
    }
  }
}

function error(var_args) {
  const message = format.apply(this, arguments);
  throw new gutil.PluginError('i18n_replace', message);
}
