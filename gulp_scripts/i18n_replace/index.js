var dir = require('node-dir'),
    gutil = require('gulp-util'),
    through = require('through2'),
    path = require('path');

const NAME = 'i18n_replace';

const REGEX = /<i18n-msg msgid="([^"]*)">[^<]*<\/i18n-msg>/gm

module.exports = function replaceMessages(opts) {
  var msgPromise = getMsgs(opts.path);

  var stream = through.obj(function(file, enc, cb) {
    if (file.isNull()) return stream.queue(file);
    if (file.isStream()) throw "No support for streams";

    msgPromise.then(function(messagesByLang) {
      var src = file.contents.toString();

      for (var lang in messagesByLang) {
        var msgs = messagesByLang[lang];
        if (!msgs) {
          throw "No messages for lang " + lang;
        }

        var i18nfile = file.clone();
        var somethingReplaced = false;

        replaced = src.replace(REGEX, function replacer(match, msgid) {
          somethingReplaced = true;
          var msg = msgs[msgid];
          if (!msg) {
            throw "Could not find message " + msgid + " for " + lang;
          }
          return msg.message;
        });

        if (!somethingReplaced) {
          // Don't create a new file if nothing was replaced.
          break;
        }

        // NOTE(cbro): file.relative is inferred on base and path. clear base so
        // we can set relative.
        i18nfile.base = '.';
        i18nfile.path = getPath(lang) + '/' + file.relative;
        i18nfile.contents = new Buffer(replaced);

        stream.push(i18nfile);
      }
      cb();
    });
  });

  return stream;
}

function getPath(lang) {
  // English goes in the base directory.
  if (lang == 'en') {
    return '.';
  }
  // Locale specific (e.g. en-uk)
  if (lang.indexOf('_')) {
    return './intl/' + lang;
  }
  // Language for all locales
  return './intl/' + lang + '_ALL';
}

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
