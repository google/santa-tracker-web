const modernLoader = require('./modern-loader.js');
const mimeTypes = require('mime-types');
const path = require('path');
const fs = require('fs').promises;


const statOrNull = async (p) => fs.stat(p).catch((err) => null);


/**
 * Builds and returns HTTP middleware that defers to a virtual loader and serves as ES6 modules.
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

    const id = path.join(prefix || '.', req.path.substr(1));
    const isModuleMode = Boolean(req.headers['origin']);

    const stat = await statOrNull(id);
    if (stat && !stat.isFile()) {
      return next();  // exists and is not a regular file, defer to next
    }

    let content;
    let isVirtual = false;

    if (stat === null) {
      try {
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
      result = await modernLoader(id, content);
    } catch (e) {
      // TODO: pass to caller, internal error in loader
      console.warn('loader', e);
      return end(500);
    }
    if (result == null) {
      // TODO(samthor): We should decide on this earlier, before we read the file from disk.
      return next();  // can't be rewritten to a module: wrong type, serve file as-is
    }

    headers['Content-Type'] = 'application/javascript';
    return end(200, result.code);
  };
};