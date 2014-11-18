/* jshint node: true */

var dir = require('node-dir');
var through = require('through2');
var path = require('path');

var REGEX = /<i18n-msg msgid="([^"]*)">([^<]*)<\/i18n-msg>/gm;
var FILENAME_REGEX = /_en\.html$/

module.exports = function replaceMessages(opts) {
  var msgPromise = getMsgs(opts.path);

  var stream = through.obj(function(file, enc, cb) {
    // TODO(cbro): only read HTML files.
    if (file.isNull()) return stream.push(file);
    if (file.isStream()) throw new Error('No support for streams');

    msgPromise.then(function(messagesByLang) {
      var src = file.contents.toString();

      for (var lang in messagesByLang) {
        var msgs = messagesByLang[lang];
        if (!msgs) {
          throw new Error('No messages for lang ' + lang);
        }

        var replaced = src.replace(REGEX, function replacer(match, msgid, tagBody) {
          var msg = msgs[msgid];
          if (!msg) {
            throw new Error('Could not find message ' + msgid + ' for ' + lang);
          }
          if (lang == 'en' && msg.message != tagBody) {
            throw new Error('Message text does not match body for ' + msgid +
                ': found [' + tagBody + '], expected: [' + msg.message + ']');
          }
          return msg.message
        });

        if (replaced == src) {
          // Don't create a new file if the source didn't change.
          stream.push(file);
          break;
        }
        if (!file.path.match(FILENAME_REGEX)) {
          throw new Error('Files with i18n-msg should end in _en.html: ' + file.relative);
        }

        var i18nfile = file.clone();
        i18nfile.path = file.path.replace(FILENAME_REGEX, '_' + lang + '.html');
        i18nfile.contents = new Buffer(replaced);

        stream.push(i18nfile);
      }
      cb();
    });
  });

  return stream;
};

/**
 * Read messages from _messages/*.json into a map.
 * Returns a promise-like object.
 */
function getMsgs(msgDir) {
  // map: locale -> message ID -> message object (description/message)
  var msgs = {};
  var done = false;
  var callbacks = [];

  dir.readFiles(msgDir, function(err, content, filename, next) {
    if (err) throw err;

    var lang = path.basename(filename, '.json');
    msgs[lang] = JSON.parse(content);
    next();
  },
  function(err) {
    if (err) throw err;
    done = true;
    while (callbacks.length) {
      callbacks.pop()(msgs);
    }
  });

  return {
    then: function(callback) {
      if (!done) {
        callbacks.push(callback);
      } else {
        callback(msgs);
      }
    }
  };
}
