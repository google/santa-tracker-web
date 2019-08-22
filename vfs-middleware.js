const modernLoader = require('./build/modern-loader.js');
const mimeTypes = require('mime-types');
const path = require('path');
const fs = require('fs');

// TODO: vfs-middleware is a bit wrong, this is really 'modern middleware' as it
// performs our JS module rewriting

module.exports = (vfsLoad, prefix=null) => {
  return async (req, res, next) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',  // always CORS enabled
      'Expires': '0',
      'Cache-Control': 'no-store',
    };

    let filename = req.path.substr(1);
    if (filename.endsWith('/') || filename === '') {
      filename += 'index.html';
    }

    const id = path.join(prefix || '.', filename);
    const isModuleMode = Boolean(req.headers['origin']);

    // TODO: only even try to read if valid entry point
    let content = null;
    let virtual = false;
    try {
      content = await fs.promises.readFile(id, 'utf-8');
    } catch (e) {
      // ignore
    }
    if (content === null) {
      try {
        content = await vfsLoad(id);
      } catch (e) {
        console.warn('vfs', e);
        res.writeHead(500, headers);
        return res.end();
      }
      virtual = (content != null);
    }

    if (!isModuleMode) {
      if (!virtual) {
        // FIXME: By this point, we've loaded the file: serve it?
        return next();  // defer to dhost, this is just a real file
      }

      // If this was a regular fetch of a virtual file, just serve it (generated CSS/JS/etc).
      // TODO: insert sourceMap
      const raw = (typeof content === 'string') ? content : content.code;
      const mimeType = mimeTypes.lookup(filename);
      if (mimeType) {
        headers['Content-Type'] = mimeType;
      }
      res.writeHead(200, headers);
      return res.end(raw);
    }

    if (content == null) {
      res.writeHead(404, headers);
      return res.end();
    }

    // Ask our loader to rewrite this single file (virtual or not is moot here).
    let result = null;
    try {
      result = await modernLoader(id, content);
    } catch (e) {
      console.warn('loader', e);
      res.writeHead(500, headers);
      return res.end();
    }
    if (result == null) {
      console.warn('could not rewrite', id);
      res.writeHead(400, headers);
      return res.end();
    }

    headers['Content-Type'] = 'application/javascript';
    res.writeHead(200, headers);
    return res.end(result.code);
  };
};