/**
 * Copyright 2020 Google LLC
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

const modernLoader = require('./modern-loader.js');
const mimeTypes = require('mime-types');
const path = require('path');
const fs = require('fs').promises;
const polka = require('polka');
const { statOrNull } = require('../build/fsp.js');


const debug = false;


/**
 * Builds and returns HTTP middleware that defers to a virtual loader and serves as ES6 modules.
 * 
 * @param {(id: string) => Promise<string>} vfsLoad
 * @param {string?} prefix
 * @return {polka.Middleware}
 */
module.exports = (vfsLoad, prefix=null) => {
  return async (req, res, next) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',  // always CORS enabled
      'Expires': '0',
      'Cache-Control': 'no-store',
    };
    const end = (status, data) => {
      res.writeHead(status, headers);
      return res.end(data);
    };

    // nb. Any fetches with "?" for supported file types will disable transforming them.
    const id = path.join(prefix || '.', req.path.substr(1));
    let isModuleMode = Boolean(req.headers['origin'] && req.headers['referer'] && !req.search);
    if (req.search === '?module') {
      isModuleMode = true;
    }

    const stat = await statOrNull(id);
    if (stat && !stat.isFile()) {
      return next();  // exists and is not a regular file, defer to next
    }

    let content;
    let isVirtual = false;

    if (stat === null) {
      try {
        debug && console.warn('loading vfs', id);
        content = await vfsLoad(id);
      } catch (e) {
        // TODO: pass to caller, internal error in VFS
        console.warn('vfs', e);
        return end(500);
      }
      if (content == null) {
        return end(404);
      }
      isVirtual = true;
    }

    if (!isModuleMode) {
      if (!isVirtual) {
        return next();  // defer to next handler, this is just a real file
      }

      // If this was a regular fetch of a virtual file, just serve it (generated CSS/JS/etc).
      // TODO: insert sourceMap
      const raw = (typeof content === 'string') ? content : content.code;
      const mimeType = mimeTypes.lookup(id);
      if (mimeType) {
        headers['Content-Type'] = mimeType;
      }
      return end(200, raw);
    }

    if (!isVirtual) {
      content = await fs.readFile(id, 'utf-8');
    }

    // Ask the modern loader to rewrite this single file (virtual or not is moot here).
    let result = null;
    try {
      result = await modernLoader(id, content, (warn) => {
        console.warn(id, warn.toString());
      });
    } catch (e) {
      // TODO: pass to caller, internal error in loader
      console.warn('loader', e);
      return end(500);
    }
    if (result == null) {
      // TODO(samthor): We should decide on this earlier, before we read the file from disk.
      return next();  // can't be rewritten to a module: wrong type, serve file as-is
    }
    debug && console.warn('rewritten', id);

    headers['Content-Type'] = 'application/javascript';
    return end(200, result.code);
  };
};