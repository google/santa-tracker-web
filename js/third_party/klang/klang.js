/** @license

Klang <http://plan8.se>
Released under the MIT license
Author: Plan8

The MIT License (MIT)

Copyright (c) 2013 Plan8 Production

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/
(function() {
'use strict';

var AudioSprite = function (src, data, callback) {
  var _this = this;
  var audio = new Audio();
  
  audio.src = src;
  audio.autobuffer = true;
  audio.load();
     
  var _forcePauseOnLoad = function () {
    audio.pause();
    audio.removeEventListener('play', _forcePauseOnLoad, false);

    if (callback && !_this.loaded) {
      callback();
    }

    _this.loaded = true;
  };  
  audio.addEventListener('play', _forcePauseOnLoad, false);

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC STUFF 
  /////////////////////////////////////////////////////////////////////////////
  this.audio = audio;
  this.playing = false;
  this.loaded = false;
  this.data = data;
  this.srcUrl = src;

  /**
   * Triggers loading of sprite source
   */
  this.load = function () {
    if (!Klang.isMobile) {
      audio.volume = 0;
    }
    audio.play();
  };

  /** 
   * Pause audio sprute at current position 
   * @param seekTime (optional) seeking to next sound directly after pause (if 
   *                            you know what it will be) can reduce time to 
   *                            play next sound and make it feel more responsive
   */
  this.pause = function (seekTime) {
    audio.pause();
    if (seekTime) {
      audio.currentTime = seekTime;
    }
    _this.playing = false;
    clearInterval(_this._timer); // Consider using rAF hook instead: Render.stopRender(_this._checkCurrentTime);  
    clearTimeout(_this._backupTimeout);
  };

  this.setLoop = function(state) {
    audio.loop = state;
  }

  this.setVolume = function(vol) {
    if (!Klang.isMobile) {
      audio.volume = vol;
    }
  }
}

AudioSprite.prototype.play = function (startTime, duration) {
  if (startTime == undefined) {
    startTime = 0;
  }

  var _this = this,
      audio = this.audio,
      nextTime = startTime + duration,
      startTime = Math.floor(startTime*100)/100; // seeking to time with too many decimals sometimes ignored by audio tag

  // Consider adding something like this to skip sound if frame rate drops
  // if (Global.LAST_FRAME > 1000) {
  //   return;
  // }

  var progress = function () {
    audio.removeEventListener('progress', progress, false);
    if (_this.updateCallback !== null && _this.playing) {
      _this.updateCallback();
    }
  };

  var delayPlay = function () {
    _this.updateCallback = function () {
      _this.updateCallback = null;
      
      if (waitForDuration() || !audio.duration) {
        // still no duration - server probably doesn't send "Accept-Ranges" headers - aborting');
        return;
      }

      audio.currentTime = startTime;
      audio.play();
    };
    audio.addEventListener('progress', progress, false);
  };
  
  // Check if audio tag is missing duration
  // missing audio.duration is NaN in Firefox
  // missing missing audio.duration is Infinity in Mobile Safari
  // missing audio.duration is 100 in Chrome on Android
  var waitForDuration = function () {
    return !isFinite(audio.duration) || audio.duration === 100;
  };

  _this.playing = true; 
  _this.updateCallback = null;
  audio.removeEventListener('progress', progress, false);

  clearTimeout(_this._backupTimeout);
  clearInterval(_this._timer); //Render.stopRender(_this._checkCurrentTime);
  
  audio.pause();

  try {
    // try seeking to sound to play
    if (startTime == 0) startTime = 0.01; // http://remysharp.com/2010/12/23/audio-sprites/
    if (audio.currentTime !== startTime) audio.currentTime = startTime;

    // make sure we can read duration of audio tag, otherwise we can't seek
    if (waitForDuration() || Math.round(audio.currentTime*100)/100 < startTime) {
      delayPlay();
    } else {
      audio.play();
    }
  } catch (e) {
    delayPlay();
  }

  // Don't create timers if duration is not specified (to play the entire audio)
  if (duration == undefined) {
    return;
  }

  // checks if audio tag has played past current sound and should pause
  _this._checkCurrentTime = function () {
    if (audio.currentTime >= nextTime) {
      _this.pause();
      clearTimeout(_this._backupTimeout);
    }
  }

  // In some cases on Android the audio tag's currentTime doesn't update though the audio is still playing.
  // We setup a fallback timeout to pause 1 second after the current sprite's end time
  // Space sounds more than 1s apart in sprite to be make sure no extra sounds are played
  // Normally this backup timeout is cancelled by _checkCurrentTime()
  _this._backupTimeout = setTimeout(function () {
    _this.pause();
  }, (duration * 1000) + 1000);

  // Consider using requestAnimationFrame instead and hook into your app's 
  // render looop, e.g. Render.startRender(_this._checkCurrentTime);
  _this._timer = setInterval(_this._checkCurrentTime, 10);  
};

var __extends = function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../lib/webaudio.d.ts" />
/// <reference path="../../lib/js.d.ts" />
(function (Klang) {
    Klang.audioTagHandler;
    function touchLoad(e) {
        Klang.audioTagHandler.loadSoundFiles();
    }
    /**
    * Represents an audio source for audio tag fallback.
    * @param {Object} data Configuration data.
    * @param {Object} sprite Audiosprite that this source uses.
    * @constructor
    * @extends {Klang.ATAudioSource}
    */
    var ATAudioSource = (function () {
        function ATAudioSource(data, sprite) {
            this._data = data;
            this._sprite = sprite;
            if(!this._sprite) {
                return;
            }
            this._priority = this._sprite.data.audio_tag;
            if(this._data.loop) {
                var url = this._sprite.srcUrl;
                if(this._data.loop_start != undefined && this._data.loop_end != undefined) {
                    this._data.offset = this._data.loop_start;
                    this._data.duration = this._data.loop_end - this._data.loop_start;
                }
            }
            this._gain = new ATGainNode(data.volume, this);
        }
        ATAudioSource.prototype.play = function () {
            if(!this._sprite) {
                return;
            }
            if(Klang.audioTagHandler.getLimitSounds()) {
                if(this._priority == 1) {
                    //Klang.audioTagHandler.stopAll();
                                    } else {
                    return this;
                }
            }
            clearInterval(this._loopTimer);
            this._sprite.setVolume(this._gain.getVolume() * Klang.audioTagHandler.getGlobalVolume());
            this._sprite.play(this._data.offset, this._data.duration);
            if(this._data.loop) {
                var _this = this;
                this._loopTimer = setTimeout(function () {
                    _this.play();
                }, Math.round(this._data.duration * 1000));
            }
            return this;
        };
        ATAudioSource.prototype.fadeInAndPlay = function (targetValue, duration) {
            if(!this._sprite) {
                return;
            }
            this.setVolume(0);
            this.play();
            this.getOutput().fadeVolume(targetValue, duration);
            return this;
        };
        ATAudioSource.prototype.stop = function () {
            if(!this._sprite) {
                return;
            }
            this._sprite.pause();
            clearInterval(this._loopTimer);
            return this;
        };
        ATAudioSource.prototype.fadeOutAndStop = function (duration) {
            if(!this._sprite) {
                return;
            }
            var _this = this;
            this.getOutput().fadeVolume(0, duration, function () {
                _this.stop();
            });
            return this;
        };
        ATAudioSource.prototype.setVolume = function (value) {
            if(!this._sprite) {
                return;
            }
            this._sprite.setVolume(value * Klang.audioTagHandler.getGlobalVolume());
            return this;
        };
        ATAudioSource.prototype.getOutput = function () {
            return this._gain;
        };
        return ATAudioSource;
    })();
    Klang.ATAudioSource = ATAudioSource;    
    /**
    * Represents an audio group for audio tag fallback.
    * @param {Object} data Configuration data.
    * @constructor
    * @extends {Klang.ATAudioSource}
    */
    var ATAudioGroup = (function () {
        function ATAudioGroup(data) {
            this._data = data;
            this._content = [];
            for(var c in this._data.content) {
                var audio = Klang.audioTagHandler.getObject(this._data.content[c]);
                if(audio) {
                    this._content.push(audio);
                }
            }
        }
        ATAudioGroup.prototype.play = function () {
            var index = Util.random(this._content.length - 1, 0);
            if(this._content[index]) {
                this._content[index].play();
            }
            return this;
        };
        ATAudioGroup.prototype.stop = function () {
            for(var c in this._content) {
                if(this._content[c]) {
                    this._content[c].stop();
                }
            }
            return this;
        };
        return ATAudioGroup;
    })();
    Klang.ATAudioGroup = ATAudioGroup;    
    /**
    * Simulates a gain node for audio tags.
    * @param {number} volume Starting volume.
    * @constructor
    * @extends {Klang.ATGainNode}
    */
    var ATGainNode = (function () {
        // obejct to update when the volume changes
        function ATGainNode(volume, owner) {
            this._currentVolume = volume != undefined ? volume : 1;
            if(this._currentVolume < 0) {
                this._currentVolume = 0;
            } else if(this._currentVolume > 1) {
                this._currentVolume = 1;
            }
            this._owner = owner;
        }
        ATGainNode.prototype.getVolume = function () {
            return this._currentVolume;
        };
        ATGainNode.prototype.setVolume = function (value) {
            if(value < 0) {
                value = 0;
            } else if(value > 1) {
                value = 1;
            }
            this._currentVolume = value;
            if(this._owner && this._owner.setVolume) {
                this._owner.setVolume(this._currentVolume);
            }
            return this;
        };
        ATGainNode.prototype.fadeVolume = function (targetValue, duration, callback) {
            clearInterval(this._fadeTimer);
            var _this = this;
            this._fadeSteps = Math.round(duration * 1000) / 10;
            this._volumeStep = (this._currentVolume - targetValue) / this._fadeSteps;
            this._fadeTimer = setInterval(function () {
                _this.setVolume(_this._currentVolume - _this._volumeStep);
                _this._fadeSteps--;
                if(_this._fadeSteps <= 0) {
                    clearInterval(_this._fadeTimer);
                    if(callback) {
                        callback();
                    }
                }
            }, 10);
            return this;
        };
        return ATGainNode;
    })();
    Klang.ATGainNode = ATGainNode;    
    /**
    * Represents a process for audio tag fallback.
    * @param {Object} data Configuration data.
    * @param {string} name Name of the process.
    * @param {Object} vars The variables that this process needs.
    * @constructor
    * @extends {Klang.ATProcess}
    */
    var ATProcess = (function () {
        function ATProcess(data, name, vars) {
            this._data = data;
            this._name = name;
            this._vars = vars;
            if(this._data.at_action === "copy") {
                this._data.at_action = this._data.action;
            }
        }
        ATProcess.prototype.start = function (args) {
            try  {
                new Function("Util", "me", "args", this._data.at_action)(Util, this._vars, args);
            } catch (ex) {
                Klang.err("Klang: error in process '" + this._name + "': " + ex.name + ": " + ex.message);
            }
        };
        return ATProcess;
    })();
    Klang.ATProcess = ATProcess;    
    /**
    * Handles fallback to using audio tag for browsers that do not support web audio.
    * @param {string} baseUrl Base url for the config file.
    * @param {Function} readyCallback Function to call when the engine is ready and auto sounds are loaded.
    * @param {Function} progressCallback Function to call while loading audio sounds.
    * @constructor
    * @extends {Klang.AudioTagHandles}
    */
    var AudioTagHandler = (function () {
        function AudioTagHandler(config, readyCallback, progressCallback) {
            this._audioSprites = {
            };
            this._limitSounds = Klang.isMobile || Klang.browser == "Opera";
            if(typeof config == "string") {
                var request = new XMLHttpRequest();
                request.open("GET", config, true);
                var _this = this;
                request.onreadystatechange = function () {
                    if(request.readyState == 4 && request.status == 200) {
                        try  {
                            _this.init(JSON.parse(request.responseText), readyCallback, progressCallback);
                        } catch (ex) {
                            // Config parse error
                            // or new Audio not supported (Safari 5 on windows without Quicktime installed...)
                            Klang.version = "n/a";
                            if(readyCallback) {
                                readyCallback(false);
                            }
                        }
                    } else if(request.status == 404) {
                        Klang.err("Klang exception: config file not found: '" + config + "'");
                    } else if(request.status != 0 && request.status != 200) {
                        Klang.err("Klang exception: unable to load config file: '" + config + "' " + request.status);
                    }
                };
                request.send(null);
            } else if(typeof config == "object") {
                this.init(config);
            } else {
                Klang.err("Klang exception: unrecognized config type: " + typeof config);
            }
        }
        AudioTagHandler.prototype.init = function (data, readyCallback, progressCallback) {
            var _this = this;
            this._globalVolume = 1;
            this._readyCallback = readyCallback;
            this._progressCallback = progressCallback;
            this._events = data.events;
            var fileRoot = data.settings.file_root;
            var format = (Klang.browser == "Opera" || Klang.browser == "Firefox") ? ".ogg" : ".mp3";
            // Create audio sprites
            for(var p in data.files) {
                var fileData = data.files[p];
                // Ladda inte in filer som inte har markerats för användning i audio tag
                var prio = fileData.audio_tag;
                if(prio && (!this._limitSounds || prio == 1)) {
                    // ladda inte in filer utan prio 1 på mobil
                    this._audioSprites[fileData.id] = new AudioSprite(fileRoot + fileData.url + format, fileData, function () {
                        _this.loadProgress();
                    });
                }
            }
            // Create sources
            this._audio = {
            };
            for(var a in data.audio) {
                var audioData = data.audio[a];
                if(audioData.type == "AudioSource") {
                    var sprite = this._audioSprites[audioData.file_id];
                    // Skapa inte audio sources som använder filer som inte används
                    //if (sprite) {
                    this._audio[a] = new ATAudioSource(audioData, this._audioSprites[audioData.file_id]);
                    //}
                                    } else if(audioData.type == "AudioGroup") {
                    this._audio[a] = new ATAudioGroup(audioData);
                }
            }
            // Create processes
            this._processes = {
            };
            for(var p in data.processes) {
                var processData = data.processes[p];
                // skapa inte processer som itne används i audiotag
                if(processData.at_action) {
                    var processArgs = {
                    };
                    for(var v in processData.vars) {
                        var processVarName = processData.vars[v];
                        processArgs[processVarName] = this._audio[processVarName];
                    }
                    this._processes[p] = new ATProcess(processData, p, processArgs);
                }
            }
            this.loadSoundFiles([
                "auto", 
                "autotag"
            ]);
        };
        AudioTagHandler.prototype.initIOS = function () {
            for(var p in this._audioSprites) {
                this._audioSprites[p].load();
            }
        };
        AudioTagHandler.prototype.loadSoundFiles = /**
        * Starts loading a group of sounds.
        * @param {string} group Which group to load, loads all sounds if not specified.
        * @param {Function} readyCallback Function to call when the engine is ready and auto sounds are loaded.
        * @param {Function} progressCallback Function to call while loading audio sounds.
        */
        function (group, readyCallback, progressCallback, loadFailedCallback) {
            console.log("Klang audiotag load " + group);
            if(readyCallback) {
                this._readyCallback = readyCallback;
            }
            if(progressCallback) {
                this._progressCallback = progressCallback;
            }
            this._loadedFiles = 0;
            this._numFiles = 0;
            for(var p in this._audioSprites) {
                var spriteGroup = this._audioSprites[p].data.load_group;
                if(group == undefined || spriteGroup == group || group.indexOf(spriteGroup) != -1) {
                    this._numFiles++;
                    this._audioSprites[p].load();
                }
            }
            // Nothing to load, call ready
            if(/*this._numFiles == 0 && */ this._readyCallback) {
                // load progress of audio tags is unreliable
                this._readyCallback(true);
                console.log("Klang audiotag ready: " + this._numFiles + " files");
            }
        };
        AudioTagHandler.prototype.loadProgress = /**
        * Updates load progress.
        */
        function () {
            this._loadedFiles++;
            if(this._progressCallback) {
                this._progressCallback(this._loadedFiles / this._numFiles);
            }
            if(this._readyCallback && this._loadedFiles >= this._numFiles) {
                this._readyCallback();
            }
        };
        AudioTagHandler.prototype.triggerEvent = /**
        * Triggers an event.
        * @param {string} name Which event to trigger.
        * @param {Object} args Arguments to pass to the process.
        */
        function (name, args) {
            //console.log("tag: incoming " + name);
            if(!this._events) {
                // not initialized
                return;
            }
            try  {
                var eventTarget = this._events[name];
                if(typeof eventTarget == "string") {
                    var process = this._processes[eventTarget];
                    if(process) {
                        process.start(args);
                    }
                } else if(eventTarget) {
                    for(var ix = 0, len = eventTarget.length; ix < len; ix++) {
                        var processName = eventTarget[ix];
                        var process = this._processes[processName];
                        if(process) {
                            process.start(args);
                        }
                    }
                }
            } catch (ex) {
                Klang.err("Klang: error when triggering event '" + name + "': " + ex.name + ": " + ex.message);
            }
        };
        AudioTagHandler.prototype.getGlobalVolume = function () {
            return this._globalVolume;
        };
        AudioTagHandler.prototype.setGlobalVolume = function (value) {
            if(value < 0) {
                value = 0;
            } else if(value > 1) {
                value = 1;
            }
            this._globalVolume = value;
            for(var a in this._audio) {
                var audio = this._audio[a];
                if(audio.setVolume) {
                    audio.setVolume(audio.getOutput().getVolume());
                }
            }
        };
        AudioTagHandler.prototype.getLimitSounds = function () {
            return this._limitSounds;
        };
        AudioTagHandler.prototype.stopAll = function (priority) {
            for(var a in this._audio) {
                if(priority == undefined || this._audio[a]._priority == priority) {
                    this._audio[a].stop();
                }
            }
            this.stopPeriodic();
            return this;
        };
        AudioTagHandler.prototype.getObject = function (name) {
            return this._audioSprites[name] || this._audio[name];
        };
        AudioTagHandler.prototype.playPeriodic = function (obj, maxSec, minSec) {
            clearTimeout(this._periodicTimer);
            var _this = this;
            this._periodicTimer = setTimeout(function () {
                obj.play();
                _this.playPeriodic(obj, maxSec, minSec);
            }, Util.random(maxSec * 1000, minSec * 1000));
        };
        AudioTagHandler.prototype.stopPeriodic = function () {
            clearTimeout(this._periodicTimer);
        };
        return AudioTagHandler;
    })();
    Klang.AudioTagHandler = AudioTagHandler;    
    Klang.context;
    Klang.version;
    Klang.safari;
    Klang.progressCallback;
    Klang.readyCallback;
    Klang.browser;
    Klang.os;
    Klang.isMobile;
    Klang.isIOS;
    Klang.fallback;
    /**
    * Handles loading of the config file, initialization of objects and triggering of events.
    * @constructor
    */
    var Core = (function () {
        // Om super master out ska fadas ut vid blur
        function Core() {
            this._initComplete = false;
            this._blurFadeOut = false;
            Klang.safari = Klang.context.createGain == undefined;
            this._preLoadInitStack = [];
            this._postLoadInitStack = [];
            this._connectStack = [];
            this._superMasterOutput = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
        }
        Core.inst = null;
        Core.isInited = function isInited() {
            if(Core.inst == null) {
                return false;
            }
            return Core.inst._initComplete;
        };
        Object.defineProperty(Core.prototype, "initComplete", {
            get: /**
            * Whether or not the core is initialized.
            * @return {boolean}  If the core is inited.
            */
            function () {
                /*if (inst == null) {
                return false;
                }*/
                return this._initComplete;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Core, "instance", {
            get: /**
            * The single instance.
            * @return {Klang.Model.Core}
            */
            function () {
                if(Core.inst == null) {
                    Core.inst = new Core();
                }
                return Core.inst;
            },
            enumerable: true,
            configurable: true
        });
        Core.deinit = function deinit() {
            Core.inst = null;
        };
        Core.prototype.stopAll = function () {
            window.removeEventListener("focus", this._focusFunction);
            window.removeEventListener("blur", this._blurFunction);
            for(var p in this._objectTable) {
                if(this._objectTable[p].stop) {
                    this._objectTable[p].stop();
                }
            }
        };
        Core.prototype.loadJSON = /**
        * Asynchronously loads a JSON config file.
        * @param {Object} options URL to the config-file to load. vafan heter den options för...?
        * @param {Function} readyCallback Function to call when auto-load sounds have loaded.
        * @param {Function} progressCallback Function to call as loading of sounds progresses.
        */
        function (options, readyCallback, progressCallback) {
            this._readyCallback = readyCallback;
            this._progressCallback = progressCallback || function () {
            };
            if(typeof options === "object") {
                var data = this.createConfigNode(options);
                Core.settings = data.settings;
                Core.instance.initContent(data);
                // Parsa JSON-filen
                //var data = this.parseConfigJSON(options.config);
                // Initiera klang
                //Core.instance.initContent(data, options.files);
                            } else if(typeof options === "string") {
                //
                var request = new XMLHttpRequest();
                request.open("GET", options, true);
                var _this = this;
                request.onreadystatechange = function () {
                    if(request.readyState == 4 && request.status == 200) {
                        // Parsa JSON-filen
                        var configText = request.responseText;
                        var data = _this.parseConfigJSON(configText);
                        // Initiera klang
                        Core.settings = data.settings;
                        Core.instance.initContent(data, null, options);
                    } else if(request.status == 404) {
                        throw "Klang exception: config file not found: '" + options + "'";
                    } else if(request.status != 200) {
                        throw "Klang exception: unable to load config file: '" + options + "'";
                    }
                };
                request.send(null);
            } else {
                throw "Klang exception: unrecognized options: '" + options + "'";
            }
        };
        Core.prototype.parseConfigJSON = /**
        * Parses a config file and creates objects.
        * @param {string} jsonString Content of the config file as a string.
        * @return {Object} The parsed config data.
        * @private
        */
        function (jsonString) {
            return JSON.parse(jsonString, function (key, value) {
                // Skapa rätt objekt om objektet har en typ
                if(value && typeof value === 'object' && typeof value.type === 'string') {
                    return new Model[value.type](value, key);
                }
                return value;
            });
        };
        Core.prototype.createConfigNode = /**
        * Recursively creates the correct object types for an already parsed config node.
        * @param {Object} node Node in parsed JSON config.
        * @return {Object} Node with types created.
        * @private
        */
        function (node) {
            // parse properties
            if(typeof node === "object") {
                for(var key in node) {
                    var prop = node[key];
                    if(typeof prop === "object" && typeof prop.type === "string") {
                        node[key] = this.createConfigNode(prop);
                        node[key] = new Model[prop.type](prop, key);
                    } else {
                        node[key] = this.createConfigNode(prop);
                    }
                }
            }
            return node;
        };
        Core.prototype.initContent = /**
        * Initializes data loaded from a JSON config file.
        * @private
        * @param {Object} data Object containing the loaded JSON data.
        * @param {Array} files Files to load.
        * @param {string} url Base url.
        */
        function (data, files, url) {
            var baseURL = data.settings.file_root;// file_root från configen, används när vi hostar filerna
            
            var filePath = data.settings.file_path || "";// file_path från configen, används ISTÄLLET för file_root so relative path från configen när vi flyttat över.
            
            if(!baseURL) {
                if(url.lastIndexOf("/") != -1) {
                    baseURL = url.substring(0, url.lastIndexOf("/"));
                    if(baseURL.charAt(baseURL.length - 1) !== "/") {
                        baseURL += "/";
                    }
                    baseURL += filePath;
                } else {
                    baseURL = filePath;
                }
            }
            // Init fade out on blur
            if(data.settings.blur_fade_time != -1) {
                this._blurFadeOut = true;
                var fadeTime = data.settings.blur_fade_time || 0.5;
                var _this = this;
                // när tabben får fokus
                window.addEventListener('focus', function () {
                    Util.curveParamLin(_this._superMasterOutput.gain, 1.0, fadeTime);
                });
                // när tabben tappar fokus
                window.addEventListener('blur', function () {
                    if(_this._blurFadeOut) {
                        Util.curveParamLin(_this._superMasterOutput.gain, 0.0, fadeTime);
                    }
                });
            }
            // om filarrayen skickas med används den, annars används filer från configen
            Model.FileHandler.instance.fileInfo = files != undefined ? files : data.files;
            this._eventTable = data.events || {
            };
            this._objectTable = {
            };
            for(var p in data.audio) {
                this._objectTable[p] = data.audio[p];
            }
            for(var p in data.busses) {
                this._objectTable[p] = data.busses[p];
            }
            for(var p in data.sequencers) {
                this._objectTable[p] = data.sequencers[p];
            }
            for(var p in data.processes) {
                this._objectTable[p] = data.processes[p];
            }
            for(var p in data.synths) {
                this._objectTable[p] = data.synths[p];
            }
            for(var p in data.lfos) {
                this._objectTable[p] = data.lfos[p];
            }
            for(var p in data.automations) {
                this._objectTable[p] = data.automations[p];
            }
            // Sätt lyssnarens startposition för 3d-ljud
            if(data.settings.listener_start_position) {
                var pos = data.settings.listener_start_position;
                Model.Panner.listener.setPosition(pos[0], pos[1], pos[2]);
            }
            // Skapa egna kurvor
            Util.createCurves(data.curves);
            // Initiera de objekt som inte kunde skapas klart
            for(var ix = 0, len = this._preLoadInitStack.length; ix < len; ix++) {
                var element = this._preLoadInitStack[ix];
                // Om elementet har en initmetod initieras elementet
                if(element.init) {
                    element.init();
                }
            }
            // Koppla ihop alla audio nodes
            this._superMasterOutput.connect(Klang.context.destination);
            for(var ix = 0, len = this._connectStack.length; ix < len; ix++) {
                var element = this._connectStack[ix];
                // Om elementet ska kopplas till en audionode
                // Kolla om elementet ska kopplas till output eller en bus
                switch(element.destinationName) {
                    case "$OUT":
                        element.connect(this._superMasterOutput);
                        break;
                    case "$PARENT":
                        break;
                    default: {
                        var destination = this.findInstance(element.destinationName);
                        element.connect(destination.input);
                        break;
                    }
                }
            }
            // PreLoad och Connect-stacksen behövs inte längre
            this._preLoadInitStack = null;
            this._connectStack = null;
            this._timeHandler = new Model.TimeHandler();
            this._initComplete = true;
            // Börja ladda in alla autoload-ljud
            // Kör readycallback när alla ljud är laddade
            Model.FileHandler.instance.baseURL = baseURL;
            Model.FileHandler.instance.loadFiles("auto", Core.soundsLoaded, this._progressCallback);
        };
        Core.prototype.loadSoundFiles = /**
        * Loads the sound files contained in a specific pack of sound file URLs.
        * @param {string} name Name of the pack of sound file URLs to load.
        * @param {Function} callback Function to call when all sounds from the sound pack have been loaded.
        */
        function (name, callback, progressCallback, loadFailedCallback) {
            if(progressCallback) {
                this._progressCallback = progressCallback;
            }
            Model.FileHandler.instance.loadFiles(name, callback, this._progressCallback, loadFailedCallback);
        };
        Core.soundsLoaded = /**
        * Called when auto load sound files have been loaded.
        * @private
        */
        function soundsLoaded() {
            var _this = Core.instance;
            for(var i = 0, len = _this._postLoadInitStack.length; i < len; i++) {
                _this._postLoadInitStack[i].init();
            }
            // PostLoad-stacken behövs inte längre
            _this._postLoadInitStack = null;
            if(_this._readyCallback) {
                _this._readyCallback(true);
            }
        };
        Core.prototype.pushToPreLoadInitStack = /**
        * Adds an object to be initialized immediately after the config have loaded.
        * @param {Object} instance Object to be initialized.
        * @return {boolean} If the object was pushed to the stack or not.
        */
        function (instance) {
            if(this._preLoadInitStack) {
                this._preLoadInitStack.push(instance);
                return true;
            }
            return false;
        };
        Core.prototype.pushToPostLoadInitStack = /**
        * Adds an object to be initialized after auto-load sounds have loaded.
        * @param {Object} instance Object to be initialized.
        * @return {boolean} If the object was pushed to the stack or not.
        */
        function (instance) {
            if(this._postLoadInitStack) {
                this._postLoadInitStack.push(instance);
                return true;
            }
            return false;
        };
        Core.prototype.pushToConnectStack = /**
        * Adds an object to be connected to an audio node after nodes have been created.
        * @param {Object} instance Object to be connected.
        * @return {boolean} If the object was pushed to the stack or not.
        */
        function (instance) {
            if(this._connectStack) {
                this._connectStack.push(instance);
                return true;
            }
            return false;
        };
        Core.prototype.findInstance = /**
        * Finds audio / bus / sequencer object by it's name.
        * @param name Identifying name of the object.
        * @return Object identified by name or null if not found.
        */
        function (name) {
            var instance = this._objectTable[name];
            return instance;
        };
        Core.prototype.triggerEvent = /**
        * Triggers an event and starts the {@link Process} that is associated with the event.
        * @param {string} id Name of the event to trigger.
        * @param {Array} eventArgs Arguments to pass to the event.
        */
        function (id) {
            var eventArgs = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                eventArgs[_i] = arguments[_i + 1];
            }
            var process = this._eventTable[id];
            if(typeof process == "string") {
                this._objectTable[process].start(eventArgs[0])// eventArgs[0] är hela arrayen
                ;
            } else if(process instanceof Array) {
                for(var ix = 0, len = process.length; ix < len; ix++) {
                    this._objectTable[process[ix]].start(eventArgs[0])// eventArgs[0] är hela arrayen
                    ;
                }
            }
        };
        Core.prototype.initIOS = /**
        * Creates a silent audio buffer and plays it back to initialize web audio for iOS devices.
        */
        function () {
            var src = Klang.context.createBufferSource();
            if(Klang.safari) {
                src.noteOn(0);
            } else {
                src.start(0);
            }
        };
        Object.defineProperty(Core.prototype, "timeHandler", {
            get: /**
            * Get the timehandler.
            * @type {TimeHandler}
            */
            function () {
                return this._timeHandler;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Core.prototype, "output", {
            get: /**
            * The master output node.
            * @type {GainNode}
            */
            function () {
                return this._superMasterOutput;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Core.prototype, "blurFadeOut", {
            get: /**
            * Whether to fade out on blur.
            * @type {boolean}
            */
            function () {
                return this._blurFadeOut;
            },
            set: function (state) {
                this._blurFadeOut = state;
            },
            enumerable: true,
            configurable: true
        });
        return Core;
    })();    
    /***
    * public.ts
    * Innehåller de funktioner som är tillgängliga utifrån motorn.
    */
    /**
    * Whether or not Klang has been initialized.
    * @type {boolean}
    */
    Klang.klangInited = false;
    /**
    * Triggers an event.
    * @param {string} name Name of the event to run.
    * @param {Array} args Arguments to pass to the event.
    */
    function triggerEvent(name) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        if(!Core.isInited) {
            return;
        }
        try  {
            if(Klang.version === "webaudio") {
                if(!Klang.context) {
                    return;
                }
                Core.instance.triggerEvent(name, args);
            } else if(Klang.version === "audiotag") {
                if(Klang.audioTagHandler) {
                    Klang.audioTagHandler.triggerEvent(name, args);
                }
            }
        } catch (ex) {
            Klang.err("Klang exception: unable to trigger event: '" + name + "'");
        }
    }
    Klang.triggerEvent = triggerEvent;
    /**
    * Initializes the Klang Core using a JSON config file.
    * @param {string} json Path on the server to the config file.
    * @param {Function} readyCallback Function to call when all auto-load sounds are loaded.
    * @param {Function} progressCallback Function with sound loading progress.
    */
    function init(json, readyCallback, progressCallback, loadFailedCallback) {
        if(navigator.userAgent.indexOf('Firefox') != -1) {
            //Firefox
            Klang.browser = "Firefox";
        } else if(navigator.userAgent.indexOf('Chrome') != -1) {
            //Chrome
            Klang.browser = "Chrome";
        } else if(navigator.userAgent.indexOf('Safari') != -1) {
            //Safari
            Klang.browser = "Safari";
        } else if(navigator.userAgent.indexOf('Opera') != -1) {
            //Opera
            Klang.browser = "Opera";
        } else if(navigator.userAgent.indexOf('MSIE') != -1) {
            // IE
            Klang.browser = "IE";
        }
        Klang.isMobile = Util.checkMobile();
        Klang.isIOS = Util.checkIOS();
        if(Klang.klangInited) {
            Klang.warn("Klang already initialized");
            return;
        }
        Klang.klangInited = true;
        if(window.AudioContext == undefined && window.webkitAudioContext != undefined) {
            window.AudioContext = window.webkitAudioContext;
        }
        if(window.AudioContext != undefined) {
            if(!Klang.context) {
                Klang.context = new AudioContext();
            }
            //Används för att själv styra om till fallback json fil i jfk
            /*if (Klang.browser == "Firefox" || Util.checkMobile()) {
            Klang.fallback = "config_tablet.json";
            }*/
                    } else {
            Klang.version = "audiotag";
            try  {
                Klang.audioTagHandler = new AudioTagHandler(json, readyCallback, progressCallback);
            } catch (ex) {
                Klang.err("Klang exception: unable to initialize audio tag fallback");
                Klang.version = "n/a";
                readyCallback(false);
                return false;
            }
            return true;
            Klang.version = "n/a";
            //"Flash not available"
            readyCallback(false);
            return false;
        }
        try  {
            Klang.version = "webaudio";
            if(Core.isInited()) {
                Klang.warn("Klang already initialized");
            }
            //Används för att själv styra om till fallback json fil i jfk
            /*if (Klang.fallback) {
            json = json.substring(0, json.indexOf("config.json"))+Klang.fallback;
            }*/
            Core.instance.loadJSON(json, readyCallback, progressCallback);
            return true;
        } catch (ex) {
            Klang.err("Klang exception: unable to parse config file: '" + json + "'");
            Klang.version = "n/a";
            readyCallback(false);
            return false;
        }
    }
    Klang.init = init;
    /**
    * Initializes web audio for iOS devices, should be called on a touch event.
    */
    function initIOS() {
        if(Klang.version == "webaudio") {
            try  {
                Core.instance.initIOS();
            } catch (ex) {
            }
        } else if(Klang.version == "audiotag" && Klang.isIOS) {
            Klang.audioTagHandler.initIOS();
        }
    }
    Klang.initIOS = initIOS;
    /**
    * Start loading a pack of sounds defined in the JSON config file.
    * @param {string} name Name of the pack to load.
    * @param {function} readyCallback Function to call when all sounds are loaded.
    * @param {function} progressCallback Function to call while loading files.
    */
    function load(name, readyCallback, progressCallback, loadFailedCallback) {
        try  {
            if(Klang.version == "webaudio") {
                Core.instance.loadSoundFiles(name, readyCallback, progressCallback, loadFailedCallback);
            } else if(Klang.version == "audiotag") {
                Klang.audioTagHandler.loadSoundFiles(name, readyCallback, progressCallback, loadFailedCallback);
            }
        } catch (ex) {
            Klang.err("Klang exception: unable to load file group: '" + name + "'");
        }
    }
    Klang.load = load;
    /**
    * Gets progress on the number of loaded audio files.
    * @returns {Object} Object containing two properties: loaded- number of loaded audio files and total: total number of audio files to be loaded.
    */
    function getLoadProgress() {
        return Model.FileHandler.instance.progress;
    }
    Klang.getLoadProgress = getLoadProgress;
    function log() {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        if(Klang.browser == "Chrome") {
            console.log("%c[" + getTimeString() + "] " + args.join(), "color:" + Util.LOG_TIME_COLOR);
        } else {
            console.log.apply(console, args);
        }
    }
    Klang.log = log;
    function logc(message, color) {
        if(Klang.browser == "Chrome") {
            if(!color) {
                color = "gray";
            }
            console.log("%c[" + getTimeString() + "] " + message, "color:" + color);
        } else {
            console.log(message);
        }
    }
    Klang.logc = logc;
    function warn() {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        if(Klang.browser == "Chrome") {
            console.warn("%c[" + Klang.getTimeString() + "] " + args.join(), "color:" + Util.LOG_WARN_COLOR);
        } else {
            console.warn.apply(console, args);
        }
    }
    Klang.warn = warn;
    function err() {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        if(Klang.browser == "Chrome") {
            console.warn("%c[" + Klang.getTimeString() + "] " + args.join(), "color:" + Util.LOG_ERROR_COLOR);
        } else {
            console.warn.apply(console, args);
        }
    }
    Klang.err = err;
    function zeropad(num, digits) {
        var str = num.toString();
        while(str.length < digits) {
            str = "0" + str;
        }
        return str;
    }
    Klang.zeropad = zeropad;
    function getTimeStamp(time) {
        return zeropad(time.getUTCMinutes(), 2) + ":" + zeropad(time.getUTCSeconds(), 2) + "." + zeropad(time.getUTCMilliseconds(), 3);
    }
    Klang.getTimeStamp = getTimeStamp;
    function getTimeString(t) {
        if(t == undefined) {
            t = Klang.context.currentTime;
        }
        var ms = Math.round(t * 1000);
        var s = Math.floor((ms / 1000) % 60);
        var m = Math.floor((ms / (1000 * 60)) % 60);
        var h = Math.floor((ms / (1000 * 60 * 60)) % 24);
        return zeropad(h, 2) + ":" + zeropad(m, 2) + ":" + zeropad(s, 2) + "." + zeropad(ms % 1000, 3);
    }
    Klang.getTimeString = getTimeString;
    // Tar bort alla objekt, men behåller alla filer som laddats in
    function deinit(url, readyCallback) {
        Klang.klangInited = false;
        if(Klang.version == "webaudio") {
            if(Core.isInited()) {
                Core.instance.stopAll();
                Core.deinit();
            }
        } else if(Klang.version == "audiotag") {
            Klang.audioTagHandler.stopAll();
        }
        Klang.version = "n/a";
    }
    Klang.deinit = deinit;
    var Model;
    (function (Model) {
        /** @namespace Klang.Model */ /**
        * Handles loading and access of files.
        * @constructor
        */
        var FileHandler = (function () {
            // om laddning har misslyckats av fil som inte hittats/cors etc
            function FileHandler() {
                this._files = {
                };
                this._progress = {
                    totalBytes: 0,
                    loadedBytes: 0,
                    totalFiles: 0,
                    totalAudioFiles: 0,
                    readyAudioFiles: 0,
                    bufferedFiles: 0
                };
                this._lastSentPercent = -1;
            }
            FileHandler.inst = null;
            Object.defineProperty(FileHandler, "instance", {
                get: /**
                * The single instance.
                * @type {Klang.Model.FileHandler}
                */
                function () {
                    if(FileHandler.inst == null) {
                        FileHandler.inst = new FileHandler();
                    }
                    return FileHandler.inst;
                },
                enumerable: true,
                configurable: true
            });
            FileHandler.prototype.sendProgressCallback = /**
            * Calls the callback function for progress of file loading.
            * @private
            */
            function () {
                if(this._progressCallback && !this._loadInterrupted) {
                    var percent = 0;
                    // uppdatera endast procent om alla filers filstorlek har hämtats
                    if(this._progress.readyAudioFiles >= this._progress.totalAudioFiles) {
                        percent = Math.floor(((this._progress.loadedBytes + this._progress.bufferedFiles) / (this._progress.totalBytes + this._progress.totalFiles)) * 100);
                    }
                    if(percent != this._lastSentPercent) {
                        this._lastSentPercent = percent;
                        this._progressCallback(percent);
                    }
                }
            };
            FileHandler.prototype.updateProgress = /**
            * Updates the load progress.
            * @param {Object} request What request's progress to update.
            * @param {Object} e Progress event.
            * @private
            */
            function (request, e) {
                if(!request["sizeReceived"]) {
                    request["sizeReceived"] = true;
                    var totalBytes = 1;// 1 om längden inte finns tillgänglig
                    
                    if(e.lengthComputable) {
                        totalBytes = e.total;
                        request["loadedBytes"] = 0;
                    }
                    request["totalBytes"] = totalBytes;
                    this.progress.totalBytes += totalBytes;
                    this.progress.readyAudioFiles++;
                }
                // Lägg på antal nya inladdade bytes om det finns tillgängligt
                if(request["loadedBytes"] != undefined) {
                    var deltaBytes = e.loaded - request["loadedBytes"];
                    request["loadedBytes"] = e.loaded;
                    this.progress.loadedBytes += deltaBytes;
                    this.sendProgressCallback();
                }
            };
            FileHandler.prototype.loadAudioBuffer = /**
            * Loads one audio file into memory.
            * @param {Object} info Data about the file to load.
            * @param {Function} callback Function to call when the file has loaded.
            */
            function (info, callback) {
                var _this = this;
                var request = new XMLHttpRequest();
                var format = ".ogg";
                if(Klang.browser === "Safari") {
                    format = ".mp3";
                }
                request.open('GET', this._baseURL + info.url + format, true);
                request.responseType = 'arraybuffer';
                request["sizeReceived"] = false;
                request.onprogress = function (e) {
                    _this.updateProgress(request, e);
                };
                request.onload = function (e) {
                    Klang.context.decodeAudioData(request.response, function (buf) {
                        if(request["loadedBytes"]) {
                            var deltaBytes = request["totalBytes"] - request["loadedBytes"];
                            _this.progress.loadedBytes += deltaBytes;
                        } else {
                            _this.progress.loadedBytes += 1;
                        }
                        _this.addFile(info, buf);
                        if(callback) {
                            callback();
                        }
                    }, function (ex) {
                        console.log("Klang warning: unable to load file '" + (this._baseURL || "") + info.url + "'");
                    });
                };
                request.onreadystatechange = function () {
                    if(request.readyState == 4 && request.status == 200) {
                    } else if(request.status != 200) {
                        _this._loadInterrupted = true;
                        /*if (_this._filesLoadedCallback) {
                        _this._filesLoadedCallback(false);
                        }*/
                        if(_this._loadFailedCallback) {
                            _this._loadFailedCallback();
                        }
                    }
                };
                request.send();
                this.progress.totalAudioFiles++;
            };
            FileHandler.prototype.loadMidiFile = /**
            * Loads one midi file into memory.
            * @param {Object} info Data about the file to load.
            * @param {Function} callback Function to call when the file has loaded.
            */
            function (info, callback) {
                var _this = this;
                loadRemote(this._baseURL + info.url, function (request, e) {
                    _this.updateProgress(request, e);
                }, function (data) {
                    _this.addFile(info, readMidiFile(data))// Läser igenom midifilen och skapar tracks, events osv
                    ;
                    if(callback) {
                        callback();
                    }
                });
            };
            FileHandler.prototype.loadMidiString = /**
            * Loads one midi file into memory from a string.
            * @param {Object} info Data about the file to load.
            */
            function (info) {
                var _this = this;
                var request = new XMLHttpRequest();
                request.open('GET', this._baseURL + info.url);
                //request.overrideMimeType("text/plain; charset=x-user-defined");
                request.onprogress = function (e) {
                    _this.updateProgress(request, e);
                };
                request.onreadystatechange = function () {
                    if(this.readyState == 4 && this.status == 200) {
                        _this.addFile(info, readMidiString(request.response));
                    }
                };
                request.send();
            };
            FileHandler.prototype.loadFiles = /**
            * Loads an array of files into memory.
            * @param {string} group Which file group to load
            * @param {function} filesLoadedCallback callback function when files are loaded.
            * @param {function} progressCallback callback function for progress.
            */
            function (group, filesLoadedCallback, progressCallback, loadFailedCallback) {
                this._filesLoadedCallback = filesLoadedCallback;
                this._progressCallback = progressCallback;
                if(loadFailedCallback) {
                    this._loadFailedCallback = loadFailedCallback;
                }
                this._loadInterrupted = false;
                this.progress.totalBytes = 0;
                this.progress.totalFiles = 0;
                this.progress.loadedBytes = 0;
                this.progress.readyAudioFiles = 0;
                this.progress.totalAudioFiles = 0;
                this.progress.bufferedFiles = 0;
                // Börja ladda in alla filer
                for(var ix = 0, len = this._fileInfo.length; ix < len; ix++) {
                    var info = this._fileInfo[ix];
                    // Ladda inte in filen om den redan laddats in
                    if((info.load_group == group || group.indexOf(info.load_group) != -1) && !this._files[info.id]) {
                        switch(info.file_type) {
                            case "audio":
                                this.loadAudioBuffer(info);
                                break;
                            case "midi":
                                this.loadMidiFile(info);
                                break;
                            case "midistring":
                                this.loadMidiString(info);
                                break;
                        }
                        this.progress.totalFiles++;
                    }
                }
                // kalla callback direkt om inget ska laddas
                if(this.progress.totalFiles == 0) {
                    if(filesLoadedCallback && !this._loadInterrupted) {
                        filesLoadedCallback(true);
                    }
                    return;
                }
            };
            FileHandler.prototype.addFile = /**
            * Adds a file to the FileHandler.
            * @param {Object} info File-info object representing the file
            * @param {Object} file The file to add.
            */
            function (info, file) {
                this._files[info.id] = file;
                this.progress.bufferedFiles++;
                this.sendProgressCallback();
                if(this._progress.bufferedFiles == this.progress.totalFiles && !this._loadInterrupted) {
                    if(this._filesLoadedCallback) {
                        this._filesLoadedCallback(true);
                    }
                }
            };
            FileHandler.prototype.getFile = /**
            * Gets the file that corresponds to the audio pointed to by a url.
            * @param {string} id The file's id
            * @returns {Object} The file corresponding to the ID.
            */
            function (id) {
                return this._files[id] || null;
            };
            Object.defineProperty(FileHandler.prototype, "progress", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Object containing load progress data.
                * @type {Object}
                */
                function () {
                    return this._progress;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FileHandler.prototype, "baseURL", {
                set: /**
                * Base URL to load files from.
                * @type {string}
                */
                function (url) {
                    this._baseURL = url;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FileHandler.prototype, "fileInfo", {
                set: /**
                * The file handler fiel info.
                * @type {Array.<Object>}
                */
                function (fileInfo) {
                    this._fileInfo = fileInfo;
                },
                enumerable: true,
                configurable: true
            });
            return FileHandler;
        })();
        Model.FileHandler = FileHandler;        
        /**
        * Represents any type of audio that can be played through a bus.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        */
        var Audio = (function () {
            function Audio(data, name) {
                this._name = name;
                this._type = data.type;
                this._output = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._volume = data.volume != undefined ? data.volume : 1.0;
                this._output.gain.value = this._volume;
                // Spara destination och lägg på ihopkopplingskön om destination är definierad
                if(data.destination_name) {
                    this.destinationName = data.destination_name;
                    if(!Core.instance.initComplete) {
                        Core.instance.pushToConnectStack(this);
                    }
                }
            }
            Audio.prototype.connect = /**
            * Sets the destination for this audio's output.
            * @param {AudioNode} destination Where to route this audio's output.
            * @return {Klang.Model.Audio} Self
            */
            function (destination) {
                return this;
            };
            Audio.prototype.disconnect = /**
            * Removes all previous connections.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                return this;
            };
            Audio.prototype.play = /**
            * Schedules this audio to start playing.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.Audio} Self
            */
            function (when) {
                return this;
            };
            Audio.prototype.stop = /**
            * Stops playing back this audio.
            * @param {number} when When in web audio context time to stop playing.
            */
            function (when) {
                return this;
            };
            Audio.prototype.pause = /**
            * Pauses playback.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                return this;
            };
            Audio.prototype.unpause = /**
            * Resumes playback.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                return this;
            };
            Audio.prototype.curvePlaybackRate = /**
            *   Exponentially changes the playbackrate.
            *   @param {number} value PlaybackRate to change to.
            *   @param {number} duration Duration in seconds for the curve change.
            *   @return {Klang.Model.Audio} Self
            */
            function (value, duration) {
                return this;
            };
            Audio.prototype.fadeInAndPlay = /**
            * Starts playing the audio and fades it's volume from 0 to 1.
            * @param {number} duration Time in seconds to reach full volume.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.Audio} Self
            */
            function (duration, when) {
                return this;
            };
            Audio.prototype.fadeOutAndStop = /**
            * Starts fading out the volume of the audio and stops playback when the volume reaches 0.
            * @param {number} duration Time in seconds to reach zero volume
            * @param {number} [when] When in Web Audio Context time to start fading out.
            * @return {Klang.Model.Audio} Self
            */
            function (duration, when) {
                return this;
            };
            Audio.prototype.deschedule = /**
            * Deschedules everything that has been scheduled but has not started playing.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                return this;
            };
            Object.defineProperty(Audio.prototype, "playbackRate", {
                set: /***
                * GETTERS / SETTERS
                *********************/
                /**
                * The playback speed of the buffer where 2 means double speed.
                * @member {number}
                */
                function (value) {
                    return this;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Audio.prototype, "playing", {
                get: /**
                * Whether or not this AudioSource is currently playing.
                * @type {boolean}
                */
                function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Audio.prototype, "duration", {
                get: /**
                * The length of the audio in seconds.
                * @type {number}
                */
                function () {
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Audio.prototype, "output", {
                get: /**
                * The audio's output.
                * @type {GainNode}
                */
                function () {
                    return this._output;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Audio.prototype, "playbackState", {
                get: /**
                * The state of the playback of this AudioSource. Valid states:
                * 0: not started
                * 1: scheduled
                * 2: playing
                * 3: stopped
                * @type {number}
                */
                function () {
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            return Audio;
        })();
        Model.Audio = Audio;        
        /**
        * Represents a buffer for one audio file and how to play it back.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        * @extends {Klang.Model.Audio}
        */
        var AudioSource = (function (_super) {
            __extends(AudioSource, _super);
            // Tid då ljudet började spelas
            function AudioSource(data, name) {
                        _super.call(this, data, name);
                this._sources = [];
                this._startTime = 0;
                this._scheduleAhead = 0.2;
                this._stopping = false;
                this._fading = false;
                this._paused = false;
                this._pauseTime = -1;
                // Hur lång tid av ljudet som spelats
                this._pauseStartTime = -1;
                this.data = data;
                this._fileId = data.file_id;
                this._playbackRate = data.playback_rate || 1.0;
                this._endTime = 0;
                this._loop = data.loop != undefined ? data.loop : false;
                this._loopStart = data.loop_start;
                this._loopEnd = data.loop_end;
                this._offset = (data.offset) || 0;
                this._duration = data.duration || 0;
                this._reverse = data.reverse;
                this._retrig = data.retrig != undefined ? data.retrig : true;
                // initiera direkt om initieringen redan gjorts
                if(!Core.instance.pushToPostLoadInitStack(this)) {
                    this.init();
                }
            }
            AudioSource.prototype.init = /**
            * Initializes the AudioSouce.
            */
            function () {
                this._buffer = FileHandler.instance.getFile(this._fileId);
                if(this._reverse) {
                    if(this._loop) {
                        var start = this._buffer.length - this._loopEnd;
                        this._loopEnd = this._buffer.length - this._loopStart;
                        this._loopStart = start;
                    }
                    var reverseBuffer = Klang.context.createBuffer(this._buffer.numberOfChannels, this._buffer.length, Klang.context.sampleRate);
                    for(var c = 0; c < this._buffer.numberOfChannels; c++) {
                        var channelBuffer = this._buffer.getChannelData(c);
                        // vänd på buffern
                        var reverseChannelBuffer = reverseBuffer.getChannelData(c);
                        for(var len = channelBuffer.length, ix = len - 1; ix >= 0; ix--) {
                            reverseChannelBuffer[len - ix] = channelBuffer[ix];
                        }
                    }
                    // använd reversad buffer
                    this._buffer = reverseBuffer;
                }
            };
            AudioSource.prototype.setLoopRegion = /**
            * Sets what part of the audio buffer to loop if looping is turned on.
            * @param {number} loopStart Timestamp in seconds where in the buffer the loop starts.
            * @param {number} loopEnd Timestamp in seconds where in the buffer the loop ends.
            */
            function (loopStart, loopEnd) {
                this._loopStart = loopStart || this._loopStart;
                this._loopEnd = loopEnd || this._loopEnd;
                for(var ix = 0, len = this._sources.length; ix < len; ix++) {
                    var source = this._sources[ix];
                    source.loopStart = this._loopStart;
                    source.loopEnd = this._loopEnd;
                }
                return this;
            };
            AudioSource.prototype.connect = /**
            * Sets the destination for this AudioSource's audio output.
            * @param {AudioNode} destination Where to route this AudioSource's output.
            * @param {boolean} forceConnect Enables connecting to more than 1 destination.
            * @return {Klang.Model.AudioSource} Self
            */
            function (destination, forceConnect) {
                // Only do the connection if it's not already connected
                if(!this._destination || forceConnect) {
                    this.output.connect(destination);
                    this._destination = destination;
                }
                return this;
            };
            AudioSource.prototype.disconnect = /**
            * Removes all previous connections.
            * @return {Klang.Model.AudioSource} Self
            */
            function () {
                this.output.disconnect();
                this._destination = null;
                return this;
            };
            AudioSource.prototype.play = /**
            * Schedules this AudioSource to start playing.
            * @param {number} when When in web audio context time to start playing.
            * @param {bool} resume Whether to resume previous playback, if the AudioSource has been paused.
            * @return {Klang.Model.AudioSource} Self
            */
            function (when, resume) {
                if (typeof when === "undefined") { when = 0; }
                if (typeof resume === "undefined") { resume = false; }
                this.removeUnusedSources();
                if(!this._buffer) {
                    this._buffer = FileHandler.instance.getFile(this._fileId);
                    if(!this._buffer) {
                        return;
                    }
                }
                when = when || 0;
                //console.log(this._name, "s", when, "c", context.currentTime);
                // spela inte om tiden har passerat (för att inte klumpa ihop massa ljud vid scroll på ios)
                if(when != 0 && when <= Klang.context.currentTime) {
                    return this;
                }
                //Util.lastPlayedSourceTime = when;
                if(!this.paused) {
                    this._pauseStartTime = when;
                }
                //  Resets _pauseTime if not started from unpause()
                if(!resume) {
                    this._pauseTime = 0;
                }
                this._startTime = when;
                this._paused = false;
                if(this._stopping) {
                    Util.setParam(this.output.gain, this.output.gain.value, when);
                    clearTimeout(this._stoppingId);
                    this.output.gain.cancelScheduledValues(when);
                    this._stopping = false;
                    return;
                } else if(!this._fading) {
                    this.output.gain.value = this._volume;
                }
                this._fading = false;
                if(!this._retrig && !this.loop) {
                    if(when < this._endTime) {
                        return;
                    }
                } else if(this.loop) {
                    if(this._playing) {
                        return;
                    }
                    this._playing = true;
                    clearTimeout(this._endedTimeout);
                }
                /*if (!this._source || this._source.buffer) {
                this.createBufferSource();
                }*/
                var source = this.createBufferSource();
                source.buffer = this._buffer;
                this._endTime = when + source.buffer.duration;
                if(this._loop) {
                    source.loop = true;
                    if(this._loopStart) {
                        source.loopStart = this._loopStart;
                    }
                    if(this._loopEnd) {
                        source.loopEnd = this._loopEnd;
                    }
                }
                source.connect(this._output);
                // kompatibilitet med äldre versioner av waa
                //this._duration  = this._buffer.duration - this._offset;
                //console.log(this._offset, this._duration);
                // Fix for Firefox Audiosprite
                if(Klang.browser == "Firefox" && this._offset) {
                    this._offset -= 0.2;
                    this._duration -= 0.2;
                }
                source["startTime"] = when;
                if(Klang.safari) {
                    source.noteGrainOn(when, this._offset, this._duration || source.buffer.duration);
                } else {
                    source.start(when, this._offset, this._duration || source.buffer.duration);
                }
                //Klang.log("play:"+this._name, "offset", this._offset, "duration", this._duration);
                return this;
            };
            AudioSource.prototype.stop = /**
            * Stops all currently playing instances of this AudioSource's buffer.
            * @param {number} when When in web audio context time to stop playing.
            */
            function (when) {
                if (typeof when === "undefined") { when = 0; }
                var numSources = this._sources.length;
                if(numSources > 0) {
                    when = when || Util.now();
                    if(this._loop) {
                        var _this = this;
                        clearTimeout(this._endedTimeout);
                        this._endedTimeout = setTimeout(function () {
                            _this._playing = false;
                        }, (when - Util.now()) / 0.001);
                    } else {
                        this._endTime = when;
                    }
                    // Stoppa alla sources och töm arrayen
                    for(var ix = 0; ix < numSources; ix++) {
                        var source = this._sources[ix];
                        // kompatibilitet med äldre versioner av waa
                        if(Klang.safari) {
                            source.noteOff(when);
                        } else {
                            source.stop(when);
                        }
                        source.disconnect();
                    }
                    this._sources = [];
                }
                return this;
            };
            AudioSource.prototype.deschedule = /**
            * Deschedules everything that has been scheduled but has not started playing.
            * @return {Klang.Model.AudioSource} Self
            */
            function () {
                for(var ix = 0; ix < this._sources.length; ix++) {
                    var source = this._sources[ix];
                    if(source.playbackState == 1 || source["startTime"] > Klang.context.currentTime) {
                        if(Klang.safari) {
                            source.noteOff(0);
                        } else {
                            source.stop(0);
                        }
                        this._sources[ix].disconnect();
                        source.disconnect();
                        ix--;
                    }
                }
                return this;
            };
            AudioSource.prototype.pause = /**
            * Pauses the playback of this AudioSource.
            * @return {Klang.Model.AudioSource} Self
            */
            function () {
                if(this._endTime > Util.now()) {
                    this._paused = true;
                    var pauseDelta = Util.now() - this._startTime;// Tid som spelats sedan senaste start/unpause
                    
                    this._pauseTime += pauseDelta;
                    this.stop();
                }
                return this;
            };
            AudioSource.prototype.unpause = /**
            * Resumes the playback of this AudioSource.
            * @return {Klang.Model.AudioSource} Self
            */
            function () {
                if(this.paused) {
                    // Spara vanlig offset
                    var realOffset = this._offset;
                    // Ändra offset för att endast spela vad som är kvar av buffern
                    this._offset += this._pauseTime;
                    // Spela upp och ändra tillbaka offset
                    this.play(0, true);
                    this._offset = realOffset;
                }
                return this;
            };
            AudioSource.prototype.createBufferSource = /**
            * Creates a new source node for playing back this AudioSource.
            * @private
            * @return {AudioBufferSourceNode} The source node that was created.
            */
            function () {
                var source = Klang.context.createBufferSource();
                source.playbackRate.value = this._playbackRate;
                this._sources.push(source);
                return source;
            };
            AudioSource.prototype.fadeInAndPlay = /**
            * Starts playing the audio and fades it's volume from 0 to 1.
            * @param {number} duration Time in seconds to reach full volume.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.AudioSource} Self
            */
            function (duration, when) {
                var now = Klang.context.currentTime;
                if(!when) {
                    when = now;
                }
                if(this.loop && this._playing && !this._stopping) {
                    return;
                }
                this.output.gain.cancelScheduledValues(when);
                if(this._stopping) {
                    clearTimeout(this._stoppingId);
                    this.output.gain.setValueAtTime(this.output.gain.value, when);
                } else {
                    this._fading = true;
                    this.output.gain.setValueAtTime(0, when);
                    this.play(when == now ? 0 : when);
                }
                this._stopping = false;
                this.output.gain.linearRampToValueAtTime(this._volume, when + duration);
                return this;
            };
            AudioSource.prototype.fadeOutAndStop = /**
            * Starts fading out the volume of the audio and stops playback when the volume reaches 0.
            * @param {number} duration Time in seconds to reach zero volume
            * @param {number} [when] When in Web Audio Context time to start fading out.
            * @return {Klang.Model.AudioSource} Self
            */
            function (duration, when) {
                if(!this.playing) {
                    return;
                }
                if(when == undefined) {
                    when = Klang.context.currentTime;
                }
                this.output.gain.cancelScheduledValues(when);
                Util.setParam(this.output.gain, this.output.gain.value, when);
                Util.curveParamLin(this.output.gain, 0, duration, when);
                var _this = this;
                this._stopping = true;
                this._stoppingId = setTimeout(function () {
                    _this._stopping = false;
                    _this._playing = false;
                    _this.stop(when + duration);
                    //resets to original volume
                    Util.setParam(_this.output.gain, _this._volume, when + duration + 0.5);
                }, (duration + (when - Util.now()) - _this._scheduleAhead) / 0.001);
                return this;
            };
            AudioSource.prototype.removeUnusedSources = /**
            * Removes any stopped or finished source nodes.
            * @private
            */
            function () {
                for(var ix = 0; ix < this._sources.length; ix++) {
                    var source = this._sources[ix];
                    if(source.playbackState == 3 || source["startTime"] + source.buffer.duration < Klang.context.currentTime) {
                        this._sources[ix].disconnect();
                        this._sources.splice(ix, 1);
                        ix--;
                    }
                }
            };
            AudioSource.prototype.curvePlaybackRate = /**
            *   Exponentially changes the playbackrate.
            *   @param {number} value PlaybackRate to change to.
            *   @param {number} duration Duration in seconds for the curve change.
            *   @return {Klang.Model.AudioSource} Self
            */
            function (value, duration) {
                var node = this.playbackRateNode;
                node.cancelScheduledValues(Util.now());
                node.setValueAtTime(node.value == 0 ? Util.EXP_MIN_VALUE : node.value, Util.now());
                node.exponentialRampToValueAtTime(value, Util.now() + duration);
                this.playbackRate = value;
                return this;
            };
            Object.defineProperty(AudioSource.prototype, "lastSource", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * The last source node that was created.
                * @type {AudioBufferSourceNode}
                */
                function () {
                    var numSources = this._sources.length;
                    if(numSources == 0) {
                        return null;
                    }
                    return this._sources[numSources - 1];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "loop", {
                get: /**
                * Whether playback of the buffer should loop or not.
                * @type {boolean}
                */
                function () {
                    return this._loop;
                },
                set: function (value) {
                    this._loop = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "offset", {
                get: /**
                * Where in the buffer to start playing, in seconds.
                * @type {number}
                */
                function () {
                    return this._offset;
                },
                set: function (value) {
                    this._offset = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "duration", {
                get: /**
                * Number of seconds after the offset to stop playing the buffer.
                * @member {number}
                */
                function () {
                    return this._duration;
                    //return this._buffer.duration - this._offset;
                                    },
                set: function (value) {
                    this._duration = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "paused", {
                get: /**
                * Whether this AudioSource has been paused or not.
                * @type {boolean}
                */
                function () {
                    return this._paused;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "playbackRate", {
                get: /**
                * The playback speed of the buffer where 2 means double speed.
                * @member {number}
                */
                function () {
                    return this._playbackRate;
                },
                set: function (value) {
                    this._playbackRate = value;
                    for(var ix = 0, len = this._sources.length; ix < len; ix++) {
                        this._sources[ix].playbackRate.value = this._playbackRate;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "nextPlaybackRate", {
                set: /**
                *   The playbackrate for the next source node that is created, NOT the currently playing sources.
                *   Used by SamplePlayer
                *   @type {number}
                */
                function (value) {
                    this._playbackRate = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "playbackRateNode", {
                get: /**
                * Node for manipulating the playback rate.
                * @type {AudioParam}
                */
                function () {
                    var source = this.lastSource;
                    if(!source) {
                        this.createBufferSource();
                    } else if(source.playbackState === 3) {
                        this.createBufferSource();
                    }
                    return source.playbackRate;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "buffer", {
                get: /**
                * The audio buffer that this AudioSource plays.
                * @type {AudioBuffer}
                */
                function () {
                    if(!this._buffer) {
                        this._buffer = FileHandler.instance.getFile(this._fileId);
                    }
                    return this._buffer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "playing", {
                get: /**
                * Whether or not this AudioSource is currently playing.
                * @type {boolean}
                */
                function () {
                    var playing = false;
                    if(this._playing !== undefined) {
                        playing = this._playing;
                    } else {
                        if(this._endTime > Util.now()) {
                            playing = true;
                        }
                    }
                    return playing;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioSource.prototype, "playbackState", {
                get: /**
                * The state of the playback of this AudioSource. Valid states:
                * 0: not started
                * 1: scheduled
                * 2: playing
                * 3: stopped
                * @type {number}
                */
                function () {
                    var source = this.lastSource;
                    if(source) {
                        return source.playbackState;
                    }
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            return AudioSource;
        })(Audio);
        Model.AudioSource = AudioSource;        
        /**
        * Enum for group types, represents how an AudioGroup is played back.
        * @enum {number}
        */
        var GroupType = {
            CONCURRENT: 0,
            STEP: 1,
            RANDOM: 2,
            SHUFFLE: 3
        };
        /**
        * A group of multiple audio objects.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        * @extends Klang.Model.Audio
        */
        var AudioGroup = (function (_super) {
            __extends(AudioGroup, _super);
            function AudioGroup(data, name) {
                        _super.call(this, data, name);
                this._adder = 0;
                this._currentId = 0;
                this._paused = false;
                this._groupType = data.group_type != undefined ? data.group_type : GroupType.STEP;
                this._retrig = data.retrig != undefined ? data.retrig : true;
                this._content = data.content || [];
                Core.instance.pushToPreLoadInitStack(this);
            }
            AudioGroup.prototype.init = /**
            * Fills the content array according to the names specified in the config for this group.
            */
            function () {
                var newContent = [];
                for(var ix = 0, len = this._content.length; ix < len; ix++) {
                    newContent.push(Core.instance.findInstance(this._content[ix]));
                }
                this._content = newContent;
            };
            AudioGroup.prototype.shuffle = /**
            * Shuffles an array
            * @param {Array} array Array to shuffle
            * @private
            */
            function (array) {
                var counter = array.length, temp, index;
                // While there are elements in the array
                while(counter--) {
                    // Pick a random index
                    index = (Math.random() * counter) | 0;
                    // And swap the last element with it
                    temp = array[counter];
                    array[counter] = array[index];
                    array[index] = temp;
                }
                return array;
            };
            AudioGroup.prototype.connect = /**
            * Sets the destination for this group's output.
            * @param {AudioNode} destination Where to route this group's output.
            * @return {Klang.Model.AudioGroup} Self
            */
            function (destination) {
                for(var ix = 0, len = this._content.length; ix < len; ix++) {
                    var a = this._content[ix];
                    //if (!a.destinationName || a.destinationName == "$PARENT") {
                    a.disconnect();
                    a.connect(this._output);
                    //}
                                    }
                this._output.connect(destination);
                return this;
            };
            AudioGroup.prototype.disconnect = /**
            * Removes all previous connections.
            * @return {Klang.Model.AudioGroup} Self
            */
            function () {
                this._output.disconnect();
                return this;
            };
            AudioGroup.prototype.play = /**
            * Schedules playback of the group.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.AudioGroup} Self
            */
            function (when) {
                // Spela inte om retrig är avstängt och senaste ljudet fortfarande spelas
                if(!this._retrig && this.latestPlayed && this.latestPlayed.playing) {
                    return;
                }
                this._paused = false;
                if(this._groupType == GroupType.STEP) {
                    this._currentId = this._adder % this._content.length;
                    this._adder++;
                    this._content[this._currentId].play(when);
                } else if(this._groupType == GroupType.RANDOM) {
                    var random = Math.floor(Math.random() * (this._content.length - 1));
                    if(this._content.length > 1 && random == this._adder) {
                        random = (random + 1) % this._content.length;
                    }
                    this._currentId = this._adder = random;
                    this._content[this._currentId].play(when);
                } else if(this._groupType == GroupType.SHUFFLE) {
                    if(this._adder % this._content.length == 0) {
                        this.shuffle(this._content);
                    }
                    this._currentId = this._adder % this._content.length;
                    this._adder++;
                    this._content[this._currentId].play(when);
                } else if(this._groupType == GroupType.CONCURRENT) {
                    for(var ix = 0, len = this._content.length; ix < len; ix++) {
                        this._content[ix].play(when);
                    }
                }
                if(this._groupType === GroupType.CONCURRENT) {
                    // Utgår från första om concurrent, skulle kunna utgå från längsta istället.
                    this._latestPlayed = this._content[0];
                } else {
                    this._latestPlayed = this._content[this._currentId];
                }
                return this;
            };
            AudioGroup.prototype.stop = /**
            * Stops playing back this group.
            * @param {number} when When in web audio context time to stop playing.
            */
            function (when) {
                this._content[this._currentId].stop(when);
                return this;
            };
            AudioGroup.prototype.pause = /**
            * Pauses playback.
            * @return {Klang.Model.AudioGroup} Self
            */
            function () {
                this._paused = true;
                if(this._latestPlayed) {
                    this._latestPlayed.pause();
                }
                return this;
            };
            AudioGroup.prototype.unpause = /**
            * Resumes playback.
            * @return {Klang.Model.AudioGroup} Self
            */
            function () {
                this._paused = false;
                if(this._latestPlayed) {
                    this._latestPlayed.unpause();
                }
                return this;
            };
            AudioGroup.prototype.fadeInAndPlay = /**
            * Starts playing the audio and fades it's volume from 0 to 1.
            * @param {number} duration Time in seconds to reach full volume.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.AudioGroup} Self
            */
            function (duration, when) {
                this.play(when);
                this.output.gain.value = 0;
                Util.curveParamLin(this.output.gain, 1, duration, when);
                return this;
            };
            AudioGroup.prototype.fadeOutAndStop = /**
            * Starts fading out the volume of the audio and stops playback when the volume reaches 0.
            * @param {number} duration Time in seconds to reach zero volume
            * @param {number} [when] When in Web Audio Context time to start fading out.
            * @return {Klang.Model.AudioGroup} Self
            */
            function (duration, when) {
                if(when == undefined) {
                    when = Klang.context.currentTime;
                }
                this.output.gain.cancelScheduledValues(when);
                Util.curveParamLin(this.output.gain, 0, duration, when);
                //resets to original volume
                Util.setParam(this.output.gain, this._volume, when + duration);
                this.stop(when + duration);
                return this;
            };
            AudioGroup.prototype.curvePlaybackRate = /**
            *   Exponentially changes the playbackrate.
            *   @param {number} value PlaybackRate to change to.
            *   @param {number} duration Duration in seconds for the curve change.
            *   @return {Klang.Model.AudioGroup} Self
            */
            function (value, duration) {
                for(var ix = 0, len = this._content.length; ix < len; ix++) {
                    this._content[ix].curvePlaybackRate(value, duration);
                }
                return this;
            };
            AudioGroup.prototype.deschedule = /**
            * Deschedules everything that has been scheduled but has not started playing.
            * @return {Klang.Model.AudioGroup} Self
            */
            function () {
                for(var ix = 0, len = this._content.length; ix < len; ix++) {
                    this._content[ix].deschedule();
                }
                return this;
            };
            Object.defineProperty(AudioGroup.prototype, "playbackRate", {
                set: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * The playback speed of the buffer where 2 means double speed.
                * @member {number}
                */
                function (value) {
                    for(var ix = 0, len = this._content.length; ix < len; ix++) {
                        this._content[ix].playbackRate = value;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioGroup.prototype, "groupType", {
                get: /**
                * The group's type, determines how the content is played.
                * @type {Klang.Model.GroupType}
                */
                function () {
                    return this._groupType;
                },
                set: function (value) {
                    this._groupType = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioGroup.prototype, "content", {
                get: /**
                * The group's audio content.
                * @type {Array.<Audio>}
                */
                function () {
                    return this._content;
                },
                set: function (value) {
                    this._content = value;
                    this.init();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioGroup.prototype, "playing", {
                get: /**
                * Whether or not this AudioSource is currently playing.
                * @type {boolean}
                */
                function () {
                    return this._latestPlayed ? this._latestPlayed.playing : false;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioGroup.prototype, "duration", {
                get: /**
                * The length of the audio in seconds.
                * @type {number}
                */
                function () {
                    return this._latestPlayed ? this._latestPlayed.duration : this._content[0].duration;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioGroup.prototype, "playbackState", {
                get: /**
                * The state of the playback of this AudioSource. Valid states:
                * 0: not started
                * 1: scheduled
                * 2: playing
                * 3: stopped
                * @type {number}
                */
                function () {
                    return this._content[this._currentId].playbackState;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AudioGroup.prototype, "latestPlayed", {
                get: /**
                * The latest audio that was played.
                * @type {Klang.Model.Audio}
                */
                function () {
                    return this._latestPlayed;
                },
                enumerable: true,
                configurable: true
            });
            return AudioGroup;
        })(Audio);
        Model.AudioGroup = AudioGroup;        
        /**
        * An automation of a parameter.
        * @param {Object} data Configuration data.
        * @class
        */
        var Automation = (function () {
            function Automation(data) {
                this._startValue = data.start_value || 0;
                this._points = data.points || [];
            }
            Automation.prototype.automate = /**
            * Starts the automation.
            * @param {AudioParam} param What parameter to automate.
            * @param {number} when When to start the automation, in web audio context time.
            */
            function (param, when) {
                when = when || Klang.context.currentTime;
                param.cancelScheduledValues(when);
                param.setValueAtTime(this._startValue, when);
                var lastEndTime = 0;
                for(var ix = 0, len = this._points.length; ix < len; ix++) {
                    var p = this._points[ix];
                    switch(p.curve) {
                        case "lin":
                            param.linearRampToValueAtTime(p.value, when + p.time);
                            break;
                        case "exp":
                            param.exponentialRampToValueAtTime(p.value, when + p.time);
                            break;
                        default:
                            param.setValueCurveAtTime(Util.CUSTOM_CURVES[p.curve], when + lastEndTime, p.time - lastEndTime);
                            break;
                    }
                    lastEndTime = p.time;
                }
            };
            return Automation;
        })();
        Model.Automation = Automation;        
        /**
        * Represents a bus for routing audio and effects.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @class
        */
        var Bus = (function () {
            function Bus(data, name) {
                this._name = name;
                this._type = data.type;
                this._input = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._output = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._effects = data.effects || [];
                this._input.gain.value = data.input_vol;
                this._output.gain.value = data.output_vol;
                // Spara destination och lägg på ihopkopplingskön om destination är definierad
                if(data.destination_name) {
                    this.destinationName = data.destination_name;
                    Core.instance.pushToConnectStack(this);
                }
                Core.instance.pushToPreLoadInitStack(this);
            }
            Bus.prototype.init = /**
            * Sets up the routing of the bus' effects.
            * @method init
            */
            function () {
                var lastNode = this._input;
                for(var i = 0, len = this._effects.length; i < len; i++) {
                    lastNode.disconnect();
                    lastNode.connect(this._effects[i].input);
                    lastNode = this._effects[i];
                }
                lastNode.connect(this._output);
            };
            Bus.prototype.connect = /**
            * Connects audio from this bus to a Web Audio node.
            * @param {AudioNode} destination Which node to route audio to.
            */
            function (destination) {
                this._output.connect(destination);
                return this;
            };
            Bus.prototype.disconnect = /**
            * Removes all previous connections.
            * @return {Klang.Model.Bus} Self
            */
            function () {
                this._output.disconnect();
                return this;
            };
            Object.defineProperty(Bus.prototype, "input", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * The bus' input.
                * @type {GainNode}
                */
                function () {
                    return this._input;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Bus.prototype, "output", {
                get: /**
                * The bus' output.
                * @type {GainNode}
                */
                function () {
                    return this._output;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Bus.prototype, "effects", {
                get: /**
                * This bus' effect chain.
                * @type {Array.<Klang.Model.Effect>}
                */
                function () {
                    return this._effects;
                },
                enumerable: true,
                configurable: true
            });
            return Bus;
        })();
        Model.Bus = Bus;        
        /**
        * Handles playback of midi files.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        * @extends {Klang.Model.Audio}
        */
        var MidiPattern = (function (_super) {
            __extends(MidiPattern, _super);
            //private _stopCount: number;
            function MidiPattern(data, name) {
                        _super.call(this, data, name);
                this._startStep = 0;
                this._totalStep = 0;
                this._currentStep = 0;
                this._syncStep = 0;
                this._stepCount = 0;
                this._fadeTime = 0;
                this._transpose = 0;
                this._scales = {
                    diatonic: [
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0
                    ],
                    dorian: [
                        0, 
                        1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        1, 
                        0, 
                        1, 
                        0, 
                        0, 
                        -1
                    ],
                    phrygian: [
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0, 
                        1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1
                    ],
                    lydian: [
                        0, 
                        1, 
                        0, 
                        1, 
                        0, 
                        1, 
                        0, 
                        0, 
                        1, 
                        0, 
                        1, 
                        0
                    ],
                    mixolydian: [
                        0, 
                        1, 
                        0, 
                        1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0, 
                        0, 
                        -1
                    ],
                    aeolian: [
                        0, 
                        -1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1
                    ],
                    locrian: [
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0, 
                        -1
                    ],
                    harmonicMinor: [
                        0, 
                        1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        1, 
                        0, 
                        0, 
                        -1, 
                        1, 
                        0
                    ],
                    melodicMinor: [
                        0, 
                        1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        1, 
                        0, 
                        -1, 
                        0, 
                        1, 
                        0
                    ],
                    majorPentatonic: [
                        0, 
                        1, 
                        0, 
                        1, 
                        0, 
                        -1, 
                        1, 
                        0, 
                        1, 
                        0, 
                        -1, 
                        1
                    ],
                    minorPentatonic: [
                        0, 
                        -1, 
                        1, 
                        0, 
                        -1, 
                        0, 
                        1, 
                        0, 
                        -1, 
                        1, 
                        0, 
                        -1
                    ],
                    doubleHarmonic: [
                        0, 
                        0, 
                        -1, 
                        1, 
                        0, 
                        0, 
                        1, 
                        0, 
                        0, 
                        -1, 
                        1, 
                        0
                    ],
                    halfDim: [
                        0, 
                        1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        0, 
                        -1, 
                        0, 
                        -1, 
                        0, 
                        -1
                    ],
                    chromatic: [
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0
                    ],
                    custom: [
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0
                    ]
                };
                this._state = PatternState.Stopped;
                this._beatSubscription = data.beat_subscription || 0.25;
                this._midiFileId = data.file_id;
                this._midiTrackIx = data.midi_track || 0;
                this._sequencerName = data.sequencer;
                this._synthName = data.synth;
                this._loop = data.loop != undefined ? data.loop : true;
                this._length = data.length || 0;
                this._nextClip = 0;
                this._startStep = data.start_step || 0;
                this._root = data.root;
                this._transpose = this._orgTranspose = data.transpose || 0;
                this._scale = this._orgScale = data.scale;
                this._rootNote = data.root_note || 36;
                this._activeUpbeat = -1;
                if(data.upbeats) {
                    this._upbeats = [];
                    this._upbeatLoopOffset = 0;
                    for(var ix = 0, len = data.upbeats.length; ix < len; ix++) {
                        this._upbeats.push({
                            length: data.upbeats[ix].length,
                            step: data.upbeats[ix].step,
                            targetStep: data.upbeats[ix].target_step,
                            playInLoop: data.upbeats[ix].play_in_loop
                        });
                    }
                }
                Core.instance.pushToPostLoadInitStack(this);
            }
            MidiPattern.prototype.init = /**
            * Initializes the pattern.
            */
            function () {
                // Hämta sequencern
                this._sequencer = Core.instance.findInstance(this._sequencerName);
                this._sequencer.registerPattern(this);
                // Hämta synten som ska spelas
                if(this._synthName === "progression") {
                    this._synth = "progression";
                    this._progression = true;
                    this._currentChord = [];
                } else {
                    this._synth = Core.instance.findInstance(this._synthName);
                }
                this._midiFile = FileHandler.instance.getFile(this._midiFileId);
                if(this._midiFile) {
                    this.setupFile();
                }
            };
            MidiPattern.prototype.setupFile = /**
            * Creates clips for the midi events in the file.
            * @private
            * @return {Klang.Model.MidiPattern} Self
            */
            function () {
                this._midiTrack = this._midiFile.tracks[this._midiTrackIx];
                this.recalculateBPM(this._sequencer.bpm);
                var ticksPerBeat = this._midiFile.header.ticksPerBeat;
                // Gå igenom midifilen och skapa clips för varje event
                var step = 0;
                var ticks = 0;
                this._clips = [];
                for(var ix = 0, len = this._midiTrack.length; ix < len; ix++) {
                    var ev = this._midiTrack[ix];
                    ticks += ev.deltaTime;
                    var of = (ticks / ticksPerBeat) % this._sequencer.resolution;
                    var st = ticks / ticksPerBeat - of;
                    this._clips.push({
                        event: ev,
                        step: st,
                        offset: ticks % (ticksPerBeat * this._sequencer.resolution)
                    });
                }
                return this;
            };
            MidiPattern.prototype.connect = /**
            * Sets the destination for this audio's output.
            * @param {AudioNode} destination Where to route this audio's output.
            * @return {Klang.Model.Audio} Self
            */
            function (destination) {
                this._output.connect(destination);
                return this;
            };
            MidiPattern.prototype.disconnect = /**
            * Removes all previous connections.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                this._output.disconnect();
                return this;
            };
            MidiPattern.prototype.changeState = /**
            * Sets what state this pattern is in.
            * @param {number} state State to change to.
            */
            function (state) {
                this._state = state;
            };
            MidiPattern.prototype.prePlaySchedule = /**
            * Schedules this pattern to start playing at the specified step.
            * If this pattern includes any upbeats, the longest upbeat that fits in the remaining steps will be played.
            * @param {number} steps number of steps until starting the pattern.
            * @param {number} syncStep At what step to start playing the pattern.
            * @param {bool} restart Force start from the beginning if already playing.
            * @return {Klang.Model.MidiPattern}
            */
            function (steps, syncStep, restart) {
                if(!this._midiFile) {
                    this._midiFile = FileHandler.instance.getFile(this._midiFileId);
                    if(!this._midiFile) {
                        return;
                    }
                    this.setupFile();
                }
                restart = restart || false;
                // inget händer om det redan spelas
                if(this._state == PatternState.Playing) {
                    if(restart) {
                        this._syncStep = syncStep;
                        this.stop(steps, true);
                    } else {
                        return this;
                    }
                }
                this._syncStep = syncStep;
                this._currentStep = this._startStep;
                this.findNextClip(this._currentStep);
                if(steps > 0) {
                    this._stepCount = steps;
                    this._currentStep += this._syncStep;
                    this._syncStep = 0;
                    this._totalStep = 0;
                    this.changeState(PatternState.PrePlaying);
                    if(this._upbeats) {
                        this._activeUpbeat = -1;
                        // hitta den upptakt som passar bäst (den längsta som får plats i antalet steps)
                        for(var ix = 0, len = this._upbeats.length; ix < len; ix++) {
                            var upbeat = this._upbeats[ix];
                            if(upbeat.length <= steps) {
                                if(this._activeUpbeat == -1 || this._upbeats[this._activeUpbeat].length < upbeat.length) {
                                    this._activeUpbeat = ix;
                                }
                            }
                        }
                        if(this._activeUpbeat != -1 && this._upbeats[this._activeUpbeat].playInLoop) {
                            this._upbeatLoopOffset = this._upbeats[this._activeUpbeat].length;
                        }
                    }
                    //  hitta vilket clip att börja på
                    this.findNextClip(this._activeUpbeat == -1 ? this._currentStep : this._upbeats[this._activeUpbeat].step);
                } else {
                    this.changeState(PatternState.Playing);
                }
                return this;
            };
            MidiPattern.prototype.play = /**
            * Schedules this pattern to start playing.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.MidiPattern} Self
            */
            function (when) {
                if(!this._midiFile) {
                    this._midiFile = FileHandler.instance.getFile(this._midiFileId);
                    if(!this._midiFile) {
                        return;
                    }
                    this.setupFile();
                }
                // inget händer om det redan spelas
                if(this._state == PatternState.Playing) {
                    return this;
                }
                // Schemalägg volym om en tidpunkt anges
                if(when && when != 0) {
                    var targetVol = this._output.gain.value;
                    this._output.gain.setValueAtTime(0, 0);
                    this._output.gain.setValueAtTime(targetVol, when);
                }
                this._currentStep = (this._sequencer.currentStep % this._length) + this._startStep// Synka denna patterns step mot sequencerns step
                ;
                this.changeState(PatternState.Playing);
                this.findNextClip(this._currentStep);
                // Starta sequencern om den inte är igång
                if(!this._sequencer.started) {
                    this._sequencer.start();
                }
                return this;
            };
            MidiPattern.prototype.restart = /**
            * Resets the pattern so that it will restart from the beginning.
            * @return {Klang.Model.MidiPattern} Self
            */
            function () {
                this._currentStep = this._startStep;
                this._nextClip = 0;
                return this;
            };
            MidiPattern.prototype.stop = /**
            * Stops playing this pattern.
            * @param {number} when When to stop playing.
            * @param {boolean} beat Whether to stop on a beat or at a specific time.
            * @return {Klang.Model.MidiPattern} Self
            */
            function (when, beat) {
                if(this._synth.deschedule && this._sequencer._scheduleAheadTime > 0.5) {
                    this._synth.deschedule();
                }
                // utan argument stoppas det direkt, eller om det redan är stoppat
                if(when == undefined || this._state == PatternState.Stopped) {
                    this.changeState(PatternState.Stopped);
                    return this;
                }
                // Om man inte anger beat är true default, eftersom det är vanligast
                if(beat == undefined) {
                    beat = true;
                }
                // börja stega ned tills pattern ska sluta spela
                if(beat) {
                    this._stepCount = this._sequencer.getStepsToNext(this._sequencer.beatLength * when);
                    this.changeState(PatternState.PreStopping);
                } else {
                    this.changeState(PatternState.Stopped);
                    if(this._synth !== "progression" && this._synth._loopedSamples) {
                        this._synth.stop(when);
                    }
                }
                return this;
            };
            MidiPattern.prototype.pause = /**
            * Pauses playback.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                return this;
            };
            MidiPattern.prototype.unpause = /**
            * Resumes playback.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                return this;
            };
            MidiPattern.prototype.sendMidiEvents = /**
            * Sends midi events to the synth that is specified for this midi pattern.
            * @param {number} step What step to send midi events for.
            * @param {number} scheduleTime Time when the event should be triggered.
            * @param {boolean} bypassNoteOn Whether to skip handling noteOn events or not.
            * @private
            */
            function (step, scheduleTime, bypassNoteOn) {
                var startClip = this._nextClip;
                while(this._clips[this._nextClip].step == step) {
                    var nextClip = this._clips[this._nextClip];
                    if(!this._progression) {
                        //transpose
                        var transpose = 0;
                        if(nextClip.event.noteNumber) {
                            if(this._scale) {
                                var orgNote = nextClip.event.noteNumber;
                                var scaleStep = (orgNote % 12) - this._root;
                                if(scaleStep < 0) {
                                    scaleStep += 12;
                                }
                                transpose = this._scales[this._scale][scaleStep];
                            }
                            if(this._transpose != 0) {
                                transpose += this._transpose;
                            }
                        }
                        if(!(bypassNoteOn && nextClip.event.subtype === "noteOn")) {
                            this._synth.handleMidiEvent(nextClip.event, scheduleTime + nextClip.offset * this._secPerTick, transpose);
                        }
                    } else {
                        // if progression
                        // saves current notes in _currentChord array.
                        if(nextClip.event.subtype === "noteOn") {
                            this._currentChord.push(nextClip.event.noteNumber);
                        } else if(nextClip.event.subtype === "noteOff") {
                            var id = this._currentChord.indexOf(nextClip.event.noteNumber);
                            if(id > -1) {
                                this._currentChord.splice(id, 1);
                            }
                        }
                    }
                    this._nextClip++;
                    if(this._nextClip == this._clips.length) {
                        this._nextClip = 0;
                    }
                    if(this._nextClip === startClip) {
                        break;
                    }
                }
                if(this._progression && this._currentChord.length) {
                    this._currentChord.sort(function (a, b) {
                        return a - b;
                    });
                    var chordRootMidiNote = this._currentChord[0];// root note in chord = lowest note
                    
                    var root = chordRootMidiNote % 12;
                    var transpose = 0;
                    // if chord root is not the same as pattern root
                    if(root != this._root) {
                        // transpose = chord root midi note number - pattern root midi note number.
                        transpose = chordRootMidiNote - this._rootNote;
                    }
                    var scale = [
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0, 
                        0
                    ];
                    var chordNormalized = [];
                    // loop through scale. Normailzed chord based on 0 = chord root.
                    for(var j = 0; j < this._currentChord.length; j++) {
                        var n = (this._currentChord[j] % 12) - root;
                        if(n < 0) {
                            n += 12;
                        }
                        chordNormalized.push(n);
                    }
                    chordNormalized.sort(function (a, b) {
                        return a - b;
                    });
                    // if note exists in chord adds 0 else finds closest note in chord and adds the diff to that note.
                    for(var i = 0; i < scale.length; i++) {
                        var closest = this.getClosestValues(chordNormalized, i);
                        if(closest !== undefined) {
                            scale[i] = closest - i;
                        }
                    }
                    // sets scale and transpose to all MidiPatterns in sequencer
                    this._sequencer.customScale = scale;
                    this._sequencer.transpose = transpose;
                    this._rootNote = chordRootMidiNote;
                }
            };
            MidiPattern.prototype.getClosestValues = /**
            * Returns the item closest to an index from an array.
            * @param {Array} a Array to search.
            * @param {number} x Index to search for.
            * @private
            */
            function (a, x) {
                var lo = -1, hi = a.length;
                while(hi - lo > 1) {
                    var mid = Math.round((lo + hi) / 2);
                    if(a[mid] <= x) {
                        lo = mid;
                    } else {
                        hi = mid;
                    }
                }
                var closest;
                if(a[lo] == x) {
                    closest = hi = lo;
                }
                if(Math.abs(x - hi) > Math.abs(x - lo)) {
                    closest = lo;
                } else if(Math.abs(x - hi) < Math.abs(x - lo)) {
                    closest = hi;
                } else {
                    closest = lo;
                }
                return a[closest];
            };
            MidiPattern.prototype.findNextClip = // Hittar det clip som ska spelas tidigast utifrån ett visst steg
            /**
            * Finds the index of the closest clip following a certain step.
            * Also sets the next clip to be the found index.
            * @private
            * @param {number} step What step to search from.
            * @return Index of the clip that was found.
            */
            function (step) {
                for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                    if(this._clips[ix].step >= step) {
                        this._nextClip = ix;
                        return ix;
                        break;
                    }
                }
            };
            MidiPattern.prototype.playStep = /**
            * Handles events at a certain step.
            * @private
            * @param {number} currentStep Step to handle.
            * @param {number} scheduleTime Time to schedule events at this step.
            */
            function (currentStep, scheduleTime) {
                var playThisStep = true;
                if(this._currentStep >= this._length + this._startStep) {
                    // Vi måste gå igenom de clip som ligger precis på slutet innan vi går tillbaka till början
                    this.sendMidiEvents(this._length, scheduleTime, true);
                    this._currentStep = this._startStep;
                    // kolla vilket som ska vara nästa clip igen
                    this.findNextClip(this._currentStep);
                    // Sluta lyssna om den inte ska loopa
                    if(!this._loop) {
                        this.changeState(PatternState.Stopped);
                        playThisStep = false;
                    }
                }
                if(playThisStep) {
                    this.sendMidiEvents(this._currentStep, scheduleTime, false);
                }
                this._totalStep += this._beatSubscription;
                this._currentStep += this._beatSubscription;
            };
            MidiPattern.prototype.update = /**
            * Handles updates from the sequencer.
            * @param {number} currentStep Step to handle.
            * @param {number} scheduleTime Time to schedule events at this step.
            * @return {Klang.Model.MidiPattern}
            */
            function (currentStep, scheduleTime) {
                // Räkna fram och köa upp endast om denna pattern lyssnar
                if(this._state != PatternState.Stopped && currentStep % this._beatSubscription == 0) {
                    // den här if-satsen är ganska ful, kollar om nån upptakt finns och isf om den ska spelas i loopen
                    if(this._upbeats && this._activeUpbeat != -1 && this._upbeats[this._activeUpbeat].playInLoop && this._state == PatternState.Playing) {
                        if(this._currentStep >= this._length + this._startStep - this._upbeatLoopOffset) {
                            if(this._upbeatLoopOffset > 0) {
                                this._stepCount = this._upbeatLoopOffset;
                                this.changeState(PatternState.PrePlaying);
                            }
                            this.sendMidiEvents(this._currentStep, scheduleTime, true);
                            this._currentStep = this._startStep;
                            this.findNextClip(this._upbeats[this._activeUpbeat].step);
                        }
                    }
                    switch(this._state) {
                        case PatternState.PrePlaying: {
                            if(this._activeUpbeat != -1) {
                                var upbeat = this._upbeats[this._activeUpbeat];
                                var currentUpbeatStep = upbeat.length - this._stepCount;
                                // Skicka inte events om nuvarande preplayStep är innan upptakten har börjat
                                if(currentUpbeatStep >= 0) {
                                    this.sendMidiEvents(upbeat.step + currentUpbeatStep, scheduleTime, false);
                                }
                            }
                            this._stepCount -= this._beatSubscription;
                            if(this._stepCount <= 0) {
                                if(this._activeUpbeat != -1 && upbeat.targetStep) {
                                    this._currentStep = upbeat.targetStep;
                                }
                                this.findNextClip(this._currentStep);
                                this.changeState(PatternState.Playing);
                            }
                            break;
                        }
                        case PatternState.Playing: {
                            this.playStep(currentStep, scheduleTime);
                            break;
                        }
                        case PatternState.PreStopping: {
                            this._stepCount -= this._beatSubscription;
                            if(this._stepCount <= 0) {
                                this.stop(scheduleTime, false);
                            } else {
                                this.playStep(currentStep, scheduleTime);
                            }
                            break;
                        }
                        case PatternState.PostStop: {
                            // inte implementerat
                            break;
                        }
                    }
                }
                return this;
            };
            MidiPattern.prototype.recalculateBPM = /**
            * Calculates the length of a quarter note according to the tick data of the midi file.
            * @param {number} bpm
            */
            function (bpm) {
                // Räkna ut tid att vänta för varje 'tick'
                var ticksPerBeat = this._midiFile.header.ticksPerBeat;// Ticks per fjärdedelsnot
                
                var microsecPerQuarterNote = 60000000 / bpm;// Mikrosekunder per fjärdeldelsnot
                
                var secPerQuarterNote = microsecPerQuarterNote / 1000000;// Sekunder per fjärdedelvsnot
                
                this._secPerTick = secPerQuarterNote / ticksPerBeat// Sekunder per tick
                ;
            };
            MidiPattern.prototype.getNextBar = /**
            *   Calculates next bar based on beat modifier.
            *   @param {number} x Beat modifier = bar length to count with.
            *   @return Next bar
            */
            function (x) {
                var nextBar = Math.ceil(this._currentStep / x);
                if(this._currentStep > this._length - x) {
                    nextBar = 0;
                }
                return nextBar;
            };
            MidiPattern.prototype.fadeInAndPlay = /**
            * Starts playing the audio and fades it's volume from 0 to 1.
            * @param {number} duration Time in seconds to reach full volume.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.Audio} Self
            */
            function (duration, when) {
                this.play(when);
                this.output.gain.value = 0;
                Util.curveParamLin(this.output.gain, 1, duration, when);
                return this;
            };
            MidiPattern.prototype.fadeOutAndStop = /**
            * Starts fading out the volume of the audio and stops playback when the volume reaches 0.
            * @param {number} duration Time in seconds to reach zero volume
            * @param {number} [when] When in Web Audio Context time to start fading out.
            * @return {Klang.Model.Audio} Self
            */
            function (duration, when) {
                if(when == undefined) {
                    when = Klang.context.currentTime;
                }
                this.output.gain.cancelScheduledValues(when);
                Util.curveParamLin(this.output.gain, 0, duration, when);
                //resets to original volume
                Util.setParam(this.output.gain, this._volume, when + duration);
                this.stop(when + duration);
                return this;
            };
            MidiPattern.prototype.deschedule = /**
            * Deschedules everything that has been scheduled but has not started playing.
            * @return {Klang.Model.MidiPattern} Self
            */
            function (steps) {
                if(steps == undefined) {
                    steps = this._length;
                }
                if(this._synth.deschedule) {
                    this._synth.deschedule();
                }
                if(this._state != PatternState.Stopped) {
                    console.log(this._name, "steps", steps, "current", this._currentStep - this._startStep);
                    steps = steps % this._length;
                    this._currentStep = this._currentStep - steps// återställ nuvarande steg
                    ;
                    //this._stepCount += steps;
                    // om vi gick förbi startsteget går vi till slutet av patternet istället
                    if(this._currentStep < this._startStep) {
                        var stepDelta = this._startStep - this._currentStep;
                        this._currentStep = this._startStep + this._length - stepDelta;
                    }
                    // sätt rätt nextClip
                    for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                        if(this._clips[ix].step >= this._currentStep) {
                            this._nextClip = ix;
                            break;
                        }
                    }
                    console.log(this._name, "current", this._currentStep - this._startStep);
                }
                return this;
            };
            MidiPattern.prototype.resetTranspose = /**
            * Resets transposition to it's original state.
            */
            function () {
                this._transpose = this._orgTranspose;
            };
            Object.defineProperty(MidiPattern.prototype, "length", {
                get: /**
                * The length of the pattern in steps.
                * @type {number}
                */
                function () {
                    return this._length;
                },
                set: function (length) {
                    this._length = length;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MidiPattern.prototype, "startStep", {
                set: /**
                * What step the pattern should start from.
                * @type {number}
                */
                function (step) {
                    //synten måste stoppas här. på rätt tid. i synk.
                    //Klang.log(this._sequencer.getNoteTime(this._sequencer.getStepsToNext(4)));
                    //this._synth.stop(context.currentTime+this._sequencer.getNoteTime(this._sequencer.getStepsToNext(4)));
                    this._startStep = step;
                    this._currentStep = (this._sequencer.currentStep % this._length) + this._startStep;
                    for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                        if(this._clips[ix].step >= this._currentStep) {
                            this._nextClip = ix;
                            break;
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MidiPattern.prototype, "scale", {
                set: /**
                * The scale that midi data is transposed to.
                * @type {Array.<number>}
                */
                function (scale) {
                    if(!this._progression) {
                        if(scale === "reset") {
                            this._scale = this._orgScale;
                        } else {
                            this._scale = scale;
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MidiPattern.prototype, "customScale", {
                set: /**
                * A custom scale to use.
                * @type {Array.<number>}
                */
                function (obj) {
                    if(!this._progression) {
                        this._scales["custom"] = obj;
                        this._scale = "custom";
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MidiPattern.prototype, "transpose", {
                get: function () {
                    return this._transpose;
                },
                set: /**
                * Transposition of midi notes.
                * @type {number}
                */
                function (transpose) {
                    this._transpose = transpose;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MidiPattern.prototype, "loop", {
                get: /**
                * Whether this pattern loops or not.
                * @type {bool}
                */
                function () {
                    return this._loop;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MidiPattern.prototype, "state", {
                get: /**
                * Playing state
                * @type {number}
                */
                function () {
                    return this._state;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MidiPattern.prototype, "playing", {
                get: /**
                * Whether or not this pattern is playing.
                * @type {boolean}
                */
                function () {
                    var _playing = false;
                    if(this._state === 1 || this._state === 1) {
                        _playing = true;
                    }
                    return _playing;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MidiPattern.prototype, "duration", {
                get: /**
                * The length of the audio in seconds.
                * @type {number}
                */
                function () {
                    return this._length * this._sequencer.getNoteTime(1);
                },
                enumerable: true,
                configurable: true
            });
            return MidiPattern;
        })(Audio);
        Model.MidiPattern = MidiPattern;        
        (function (PatternState) {
            PatternState._map = [];
            PatternState._map[0] = "PrePlaying";
            PatternState.PrePlaying = 0;// innan mainloopen börjar, ev upptakt spelas
            
            PatternState._map[1] = "Playing";
            PatternState.Playing = 1;// mainloopen
            
            PatternState._map[2] = "PreStopping";
            PatternState.PreStopping = 2;// räknar ned tills mainloopen ska sluta
            
            PatternState._map[3] = "PostStop";
            PatternState.PostStop = 3;// fortsättar att spela tills fade ut är klar
            
            PatternState._map[4] = "Stopped";
            PatternState.Stopped = 4;// inget spelas
            
        })(Model.PatternState || (Model.PatternState = {}));
        var PatternState = Model.PatternState;
        /**
        * A sequence of audio objects to be played back synced with to a sequencer.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        * @extends {Klang.Model.Audio}
        */
        var Pattern = (function (_super) {
            __extends(Pattern, _super);
            function Pattern(data, name) {
                        _super.call(this, data, name);
                this._startStep = 0;
                this._totalStep = 0;
                this._currentStep = 0;
                this._syncStep = 0;
                this._stepCount = 0;
                this._fadeTime = 0;
                this._length = 2;
                this._loop = true;
                this._tail = false;
                this._forceFade = false;
                this._activeUpbeat = -1;
                this._state = PatternState.Stopped;
                this._beatSubscription = data.beat_subscription;
                this._length = data.length;
                this._startStep = data.start_step || 0;
                this._loop = data.loop != undefined ? data.loop : true;
                this._tail = data.tail != undefined ? data.tail : false;
                this._clips = [];
                this._upbeats = [];
                this._sequencerName = data.sequencer;
                this._initData = {
                    dummyClips: data.content,
                    dummyUpbeats: data.upbeats
                };
                Core.instance.pushToPreLoadInitStack(this);
            }
            Pattern.prototype.init = /**
            * Fills the content array according to the names specified in the config for this pattern.
            * @memberof Klang.Model.Pattern
            * @method init
            * @instance
            */
            function () {
                // Hitta instanser för alla ljud i clippen
                if(this._initData.dummyClips) {
                    for(var ix = 0, len = this._initData.dummyClips.length; ix < len; ix++) {
                        var dummy = this._initData.dummyClips[ix];
                        // Hitta rätt ljud om ett ljud ska spelas upp
                        if(dummy.audio) {
                            this._clips.push({
                                audio: Core.instance.findInstance(dummy.audio),
                                process: null,
                                args: null,
                                step: dummy.step
                            });
                        } else// Hitta processen om en process ska köras
                         {
                            this._clips.push({
                                audio: null,
                                process: Core.instance.findInstance(dummy.process),
                                args: dummy.args,
                                step: dummy.step
                            });
                        }
                    }
                }
                // Hitta instanser för alla ljud i upbeats
                if(this._initData.dummyUpbeats) {
                    for(var ix = 0, ilen = this._initData.dummyUpbeats.length; ix < ilen; ix++) {
                        var dummyUpbeat = this._initData.dummyUpbeats[ix];
                        var upbeatClips = [];
                        for(var jx = 0, jlen = dummyUpbeat.content.length; jx < jlen; jx++) {
                            var dummyClip = dummyUpbeat.content[jx];
                            // Copy-pasta från första initieringen....
                            if(dummyClip.audio) {
                                upbeatClips.push({
                                    audio: Core.instance.findInstance(dummyClip.audio),
                                    process: null,
                                    args: null,
                                    step: dummyClip.step
                                });
                            } else// Hitta processen om en process ska köras
                             {
                                upbeatClips.push({
                                    audio: null,
                                    process: Core.instance.findInstance(dummyClip.process),
                                    args: dummyClip.args,
                                    step: dummyClip.step
                                });
                            }
                        }
                        dummyUpbeat.clips = upbeatClips;
                        this._upbeats.push({
                            length: dummyUpbeat.length,
                            clips: upbeatClips
                        });
                    }
                    // Sortera upptakterna så att den längsta ligger först
                    this._upbeats.sort(function (a, b) {
                        return b.length - a.length;
                    });
                }
                // Hämta sequencern
                this._sequencer = Core.instance.findInstance(this._sequencerName);
                this._sequencer.registerPattern(this);
                this._initData = null;
            };
            Pattern.prototype.connect = /**
            * Sets the destination for this audio's output.
            * @param {AudioNode} destination Where to route this audio's output.
            * @return {Klang.Model.Audio} Self
            */
            function (destination) {
                for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                    var a = this._clips[ix].audio;
                    if(a/* && (!a.destinationName || a.destinationName == "$PARENT")*/ ) {
                        a.disconnect();
                        a.connect(this._output);
                    }
                }
                this._output.connect(destination);
                return this;
            };
            Pattern.prototype.disconnect = /**
            * Removes all previous connections.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                this._output.disconnect();
                return this;
            };
            Pattern.prototype.changeState = /**
            * Sets what state this pattern is in.
            * @param {number} state State to change to.
            */
            function (state) {
                //console.log(this._name, "change from", getPatternStateString(this._state), "to", getPatternStateString(state), "step", this._currentStep);
                this._state = state;
            };
            Pattern.prototype.prePlaySchedule = /**
            * Schedules this pattern to start playing at the specified step.
            * If this pattern includes any upbeats, the longest upbeat that fits in the remaining steps will be played.
            * @param {number} steps number of steps until starting the pattern.
            * @param {number} syncStep At what step to start playing the pattern.
            * @param {boolean} restart Force start from the beginning if already playing.
            * @param {boolean} fadeIn Whether to fade in the pattern.
            * @param {number} duration
            * @return {Klang.Model.Pattern}
            */
            function (steps, syncStep, restart, fadeIn, duration) {
                restart = restart || false;
                var t = Klang.context.currentTime;
                // Övergå till att fortsätta om vi håller på att avsluta
                if(this._state == PatternState.PreStopping || this._state == PatternState.PostStop) {
                    this._output.gain.cancelScheduledValues(t);
                    this._output.gain.setValueAtTime(this._output.gain.value, t);
                    this._output.gain.linearRampToValueAtTime(this._volume, t + 0.5);
                    this.changeState(PatternState.Playing);
                    clearTimeout(this._stoppingId);
                    return this;
                } else if(this._output.gain.value != this._volume || PatternState.Stopped) {
                    var v;
                    if(this._state === PatternState.Stopped && fadeIn) {
                        v = 0;
                    } else {
                        v = this._output.gain.value;
                    }
                    this._output.gain.cancelScheduledValues(t);
                    this._output.gain.setValueAtTime(v, t);
                    this._output.gain.linearRampToValueAtTime(this._volume, t + duration);
                } else if(fadeIn) {
                    this._output.gain.cancelScheduledValues(t);
                    this._output.gain.setValueAtTime(0, t);
                    this._output.gain.linearRampToValueAtTime(this._volume, t + duration);
                }
                // inget händer om det redan spelas
                if(this._state == PatternState.Playing || this._state == PatternState.PrePlaying) {
                    if(restart) {
                        this._syncStep = syncStep;
                        this.stop(steps, true, 0);
                    } else {
                        return this;
                    }
                }
                this._syncStep = syncStep;
                if(steps > 0) {
                    this._stepCount = steps;
                    this._currentStep = this._startStep;
                    this._totalStep = 0;
                    this._activeUpbeat = -1;
                    for(var ix = 0, len = this._upbeats.length; ix < len; ix++) {
                        var upbeat = this._upbeats[ix];
                        if(upbeat.length <= steps) {
                            if(this._activeUpbeat == -1 || this._upbeats[this._activeUpbeat].length < upbeat.length) {
                                this._activeUpbeat = ix;
                            }
                        }
                    }
                    this.changeState(PatternState.PrePlaying);
                } else {
                    this.changeState(PatternState.Playing);
                }
                return this;
            };
            Pattern.prototype.play = /**
            * Schedules this pattern to start playing.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.Audio} Self
            */
            function (when) {
                // inget händer om det redan spelas
                if(this._state == PatternState.Playing || this._state == PatternState.PrePlaying) {
                    return this;
                } else if(this._state == PatternState.PreStopping || this._state == PatternState.PostStop) {
                    clearTimeout(this._stoppingId);
                }
                // Schemalägg volym om en tidpunkt anges
                /*if (when && when != 0) {
                var targetVol = this._output.gain.value;
                this._output.gain.setValueAtTime(0, 0);
                this._output.gain.setValueAtTime(targetVol, when);
                }*/
                this._currentStep = (this._sequencer.currentStep % this._length) + this._startStep// Synka denna patterns step mot sequencerns step
                ;
                this.changeState(PatternState.Playing);
                // Starta sequencern om den inte är igång
                if(!this._sequencer.started) {
                    this._sequencer.start();
                }
                return this;
            };
            Pattern.prototype.stop = /**
            * Stops playing this pattern.
            * @param {number} when When to stop playing.
            * @param {boolean} beat Whether to stop on a beat or at a specific time.
            * @param {number} fadeTime Over how long to fade out.
            * @param {number} wait Number of steps to wait before stopping.
            * @return {Klang.Model.MidiPattern} Self
            */
            function (when, beat, fadeTime, wait) {
                // Stoppa endast om den spelar
                if(this._state == PatternState.Stopped) {
                    return this;
                } else if(this._state === PatternState.PrePlaying) {
                    // Stoppar direkt om den inte börjat spela än.
                    // OBS Kan bli problem med upptakter eftersom dom ju spelar i PrePlaying läge och då kommer stoppas direkt.
                    this.changeState(PatternState.Stopped);
                    return;
                }
                // utan argument stoppas det direkt
                if(when == undefined) {
                    this.changeState(PatternState.Stopped);
                    return this;
                }
                // Om man inte anger beat är true default, eftersom det är vanligast.
                if(beat == undefined) {
                    beat = true;
                }
                // börja stega ned tills pattern ska sluta spela
                if(beat) {
                    this._stepCount = this._sequencer.getStepsToNext(this._sequencer.beatLength * when) || 0;
                    this._fadeTime = fadeTime;
                    this.changeState(PatternState.PreStopping);
                    if(wait > 0) {
                        this._stepCount += wait;
                    }
                } else// fortsätt spela tills den fadat ut helt och hållet
                 {
                    if(fadeTime) {
                        var fadeBeats = fadeTime / this._sequencer.getNoteTime(1);// antal beats att fada ut över
                        
                        this._stepCount = Math.ceil(fadeBeats);
                        this.changeState(PatternState.PostStop);
                        var t = when;//context.currentTime;
                        
                        //console.log(this._name, "volume", this._output.gain.value, "start fade", "t", t, "done", (t-context.currentTime+fadeTime)/0.001);
                        this._output.gain.cancelScheduledValues(t);
                        this._output.gain.setValueAtTime(this._output.gain.value, t);
                        this._output.gain.linearRampToValueAtTime(0.0, t + fadeTime);
                        var _this = this;
                        this._stoppingId = setTimeout(function () {
                            //console.log(_this._name, "fade done", context.currentTime);
                            for(var i = 0; i < _this._clips.length; i++) {
                                if(_this._clips[i].audio) {
                                    _this._clips[i].audio.stop(0);
                                }
                            }
                        }, (t - Klang.context.currentTime + fadeTime) / 0.001);
                    } else {
                        this.changeState(PatternState.Stopped);
                    }
                }
                return this;
            };
            Pattern.prototype.pause = /**
            * Pauses playback.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                    if(this._clips[ix].audio) {
                        this._clips[ix].audio.pause();
                    }
                }
                return this;
            };
            Pattern.prototype.unpause = /**
            * Resumes playback.
            * @return {Klang.Model.Audio} Self
            */
            function () {
                for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                    if(this._clips[ix].audio) {
                        this._clips[ix].audio.unpause();
                    }
                }
                return this;
            };
            Pattern.prototype.playStep = /**
            * Handles events at a certain step.
            * @private
            * @param {number} currentStep Step to handle.
            * @param {number} scheduleTime Time to schedule events at this step.
            */
            function (currentStep, scheduleTime) {
                if(this._currentStep >= this._length + this._startStep) {
                    if(this._loop) {
                        this._currentStep = this._startStep;
                    } else if(!this._loop) {
                        // Sluta lyssna om den inte ska loopa
                        this.changeState(PatternState.Stopped);
                    }
                }
                // Hitta på ett sätt att inte loopa igenom alla clips varje gång??
                for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                    if(this._clips[ix].step == this._currentStep) {
                        var clip = this._clips[ix];
                        // spela ljud
                        if(clip.audio) {
                            clip.audio.play(scheduleTime);
                        } else// kör process
                         {
                            clip.process.start(clip.args);
                        }
                    }
                }
                this._totalStep += this._beatSubscription;
                this._currentStep += this._beatSubscription;
            };
            Pattern.prototype.update = /**
            * Handles updates from the sequencer.
            * @param {number} currentStep Step to handle.
            * @param {number} scheduleTime Time to schedule events at this step.
            * @return {Klang.Model.Pattern}
            */
            function (currentStep, scheduleTime) {
                // Räkna fram och köa upp endast om denna pattern lyssnar
                if(this._state != PatternState.Stopped && currentStep % this._beatSubscription == 0) {
                    //console.log("pattern:", this._name, "state", this._state, "this._stepCount", this._stepCount);
                    switch(this._state) {
                        case PatternState.PrePlaying: {
                            if(this._activeUpbeat != -1) {
                                var upbeat = this._upbeats[this._activeUpbeat];
                                for(var ix = 0, len = upbeat.clips.length; ix < len; ix++) {
                                    var clip = upbeat.clips[ix];
                                    if(clip.step == upbeat.length - this._stepCount) {
                                        // spela ljud
                                        if(clip.audio) {
                                            clip.audio.play(scheduleTime);
                                        } else// kör process
                                         {
                                            clip.process.start(clip.args);
                                        }
                                    }
                                }
                            }
                            this._stepCount -= this._beatSubscription;
                            if(this._stepCount <= 0) {
                                this._currentStep = this._startStep + this._syncStep % this._length;
                                this._syncStep = 0;
                                this.changeState(PatternState.Playing);
                            }
                            break;
                        }
                        case PatternState.Playing: {
                            // När vi nått slutet av denna pattern
                            this.playStep(currentStep, scheduleTime);
                            break;
                        }
                        case PatternState.PreStopping: {
                            this._stepCount -= this._beatSubscription;
                            if(this._stepCount <= 0) {
                                if(!this._tail || this._forceFade) {
                                    this.stop(scheduleTime, false, this._fadeTime);
                                } else {
                                    this.changeState(PatternState.Stopped);
                                    // Resets _currentStep so pattern starts from beginning next time it's played.
                                    this._currentStep = 0;
                                }
                            } else {
                                this.playStep(currentStep, scheduleTime);
                            }
                            break;
                        }
                        case PatternState.PostStop: {
                            // Den här (playStep) borde inte köras om patternet inte spelar, alltså stoppas innan det har börjat spela.
                            this.playStep(currentStep, scheduleTime);
                            this._stepCount -= this._beatSubscription;
                            if(this._stepCount <= 0) {
                                this._forceFade = false;
                                this.changeState(PatternState.Stopped);
                                // Resets _currentStep so pattern starts from beginning next time it's played.
                                this._currentStep = 0;
                            }
                            break;
                        }
                    }
                }
                return this;
            };
            Pattern.prototype.deschedule = /**
            * Deschedules everything that has been scheduled but has not started playing.
            * @return {Klang.Model.Pattern} Self
            */
            function (steps) {
                if(steps == undefined) {
                    steps = this._length;
                }
                if(this._state != PatternState.Stopped) {
                    steps = steps % this._length;
                    for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                        var clip = this._clips[ix];
                        if(clip.audio) {
                            clip.audio.deschedule();
                        }
                    }
                    clearTimeout(this._stoppingId);
                    this._output.gain.cancelScheduledValues(Util.now());
                    this._currentStep = this._currentStep - steps// återställ nuvarande steg
                    ;
                    // om vi gick förbi startsteget går vi till slutet av patternet istället
                    if(this._currentStep < this._startStep) {
                        var stepDelta = this._startStep - this._currentStep;
                        this._currentStep = this._startStep + this._length - stepDelta;
                    }
                }
                return this;
            };
            Pattern.prototype.fadeInAndPlay = /**
            * Starts playing the audio and fades it's volume from 0 to 1.
            * @param {number} duration Time in seconds to reach full volume.
            * @param {number} when When in web audio context time to start playing.
            * @return {Klang.Model.Audio} Self
            */
            function (duration, when) {
                return this;
            };
            Pattern.prototype.fadeOutAndStop = /**
            * Starts fading out the volume of the audio and stops playback when the volume reaches 0.
            * @param {number} duration Time in seconds to reach zero volume
            * @param {number} [when] When in Web Audio Context time to start fading out.
            * @return {Klang.Model.Audio} Self
            */
            function (duration, when) {
                when = when || Util.now();
                this.stop(when, false, duration);
                return this;
            };
            Pattern.prototype.curvePlaybackRate = /**
            *   Exponentially changes the playbackrate.
            *   @param {number} value PlaybackRate to change to.
            *   @param {number} duration Duration in seconds for the curve change.
            *   @return {Klang.Model.Audio} Self
            */
            function (value, duration) {
                for(var i = 0, l = this._clips.length; i < l; i++) {
                    this._clips[i].audio.curvePlaybackRate(value, duration);
                }
                return this;
            };
            Pattern.prototype.getNextBar = /**
            *   Calculates next bar based on beat modifier.
            *   @param {number} x Beat modifier = bar length to count with.
            *   @return Next bar
            */
            function (x) {
                var nextBar = Math.ceil(this._currentStep / x);
                if(this._currentStep > this._length - x) {
                    nextBar = 0;
                }
                return nextBar;
            };
            Object.defineProperty(Pattern.prototype, "forceFade", {
                set: /**
                * GETTERS / SETTERS
                *********************/
                /**
                *   Whether to force fade when stopped.
                *   If all patterns should fade when stopped, overrides _tail = true;
                *   @type {boolean} value
                */
                function (value) {
                    this._forceFade = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pattern.prototype, "playbackRate", {
                set: /**
                * The playback speed of the buffer where 2 means double speed.
                * @member {number}
                */
                function (value) {
                    for(var ix = 0, len = this._clips.length; ix < len; ix++) {
                        this._clips[ix].audio.playbackRate = value;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pattern.prototype, "length", {
                get: /**
                * The length of the pattern in steps.
                * @type {number}
                */
                function () {
                    return this._length;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pattern.prototype, "loop", {
                get: /**
                * Whether this pattern loops or not.
                * @type {bool}
                */
                function () {
                    return this._loop;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pattern.prototype, "state", {
                get: /**
                * Playing state
                * @type {number}
                */
                function () {
                    return this._state;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pattern.prototype, "playing", {
                get: /**
                * Whether or not this pattern is playing.
                * @type {boolean}
                */
                function () {
                    var _playing = false;
                    if(this._state === 1 || this._state === 1) {
                        _playing = true;
                    }
                    return _playing;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pattern.prototype, "duration", {
                get: /**
                * The length of the audio in seconds.
                * @type {number}
                */
                function () {
                    return this._length * this._sequencer.getNoteTime(1);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pattern.prototype, "playbackState", {
                get: /**
                * The state of the playback of this AudioSource. Valid states:
                * 0: not started
                * 1: scheduled
                * 2: playing
                * 3: stopped
                * @type {number}
                */
                function () {
                    return 0;
                },
                enumerable: true,
                configurable: true
            });
            return Pattern;
        })(Audio);
        Model.Pattern = Pattern;        
        /**
        * Superclass for all effects. Contains one input and one output node.
        * @param {Object} data Configuration data.
        * @constructor
        */
        var Effect = (function () {
            function Effect(data) {
                this._type = data.type;
                this._input = Klang.context.createGain != undefined ? Klang.context.createGain() : Klang.context.createGainNode();
                this._output = Klang.context.createGain != undefined ? Klang.context.createGain() : Klang.context.createGainNode();
            }
            Effect.prototype.connect = /**
            * Connects the output of the effect to an Audio Node.
            * @param {AudioNode} destination Where to route the audio.
            */
            function (destination) {
                this._output.connect(destination);
                return this;
            };
            Effect.prototype.disconnect = /**
            * Disconnects the effect.
            */
            function () {
                this._output.disconnect();
                return this;
            };
            Effect.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                return this;
            };
            Object.defineProperty(Effect.prototype, "input", {
                get: /***
                * GETTERS / SETTERS
                *********************/
                /**
                * The effect's input node. Connect an Audio Node to this node have it's output be affected by the effect.
                * @type {GainNode}
                */
                function () {
                    return this._input;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Effect.prototype, "output", {
                get: /**
                * The effect's output.
                * @type {GainNode}
                */
                function () {
                    return this._output;
                },
                enumerable: true,
                configurable: true
            });
            return Effect;
        })();
        Model.Effect = Effect;        
        /**
        * Sends audio signal to a bus.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var EffectSend = (function (_super) {
            __extends(EffectSend, _super);
            function EffectSend(data) {
                        _super.call(this, data);
                this._wet = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._wet.gain.value = data.wet;
                this._input.connect(this._wet);
                this._input.connect(this._output);
                this.destinationName = data.destination_name;
                Core.instance.pushToPreLoadInitStack(this);
            }
            EffectSend.prototype.init = /**
            * Finds the bus to send to.
            */
            function () {
                var destination = Core.instance.findInstance(this.destinationName);
                this._wet.connect(destination.input);
            };
            EffectSend.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._wet);
                    this._input.connect(this._output);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Object.defineProperty(EffectSend.prototype, "wet", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Wet amount
                * @type {AudioParam}
                */
                function () {
                    return this._wet.gain;
                },
                enumerable: true,
                configurable: true
            });
            return EffectSend;
        })(Effect);
        Model.EffectSend = EffectSend;        
        /**
        * Eigth band EQ
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Equalizer = (function (_super) {
            __extends(Equalizer, _super);
            function Equalizer(data) {
                        _super.call(this, data);
                this._filters = [];
                if(Klang.browser == "Firefox") {
                    this._input.connect(this._output);
                    return;
                }
                if(data.bands.length == 0) {
                    this._input.connect(this.output);
                } else {
                    for(var ix = 0, len = data.bands.length; ix < len; ix++) {
                        var band = data.bands[ix];
                        var filter = Klang.context.createBiquadFilter();
                        if(band.filter_type) {
                            filter.type = Util.safeFilterType(band.filter_type);
                        }
                        if(band.frequency) {
                            filter.frequency.value = band.frequency;
                        }
                        if(band.gain) {
                            filter.gain.value = band.gain;
                        }
                        if(band.Q) {
                            filter.Q.value = band.Q;
                        }
                        if(ix == 0) {
                            this._input.connect(filter);
                        } else {
                            this._filters[ix - 1].connect(filter);
                        }
                        this._filters.push(filter);
                    }
                    this._filters[this._filters.length - 1].connect(this._output);
                }
            }
            Equalizer.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    if(this._filters.length == 0) {
                        this._input.connect(this._output);
                    } else {
                        this._input.connect(this._filters[0]);
                    }
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Object.defineProperty(Equalizer.prototype, "filters", {
                get: /**
                * Active filters.
                * @type {Array}
                */
                function () {
                    return this._filters;
                },
                enumerable: true,
                configurable: true
            });
            return Equalizer;
        })(Effect);
        Model.Equalizer = Equalizer;        
        /**
        * Implementation of the Web Audio API Biquad Filter.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var BiquadFilter = (function (_super) {
            __extends(BiquadFilter, _super);
            function BiquadFilter(data) {
                        _super.call(this, data);
                this._filter = Klang.context.createBiquadFilter();
                this._filter.type = Util.safeFilterType(data.filter_type);
                this._input.connect(this._filter);
                this._filter.connect(this._output);
                this._filter.frequency.value = data.frequency != undefined ? data.frequency : this._filter.frequency;
                this._filter.Q.value = data.Q != undefined ? data.Q : this._filter.Q;
                this._filter.gain.value = data.gain != undefined ? data.gain : this._filter.gain.value;
            }
            BiquadFilter.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._filter);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Object.defineProperty(BiquadFilter.prototype, "frequency", {
                get: /***
                * GETTERS / SETTERS
                *********************/
                /**
                * Filter frequency
                * @type {AudioParam}
                */
                function () {
                    return this._filter.frequency;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BiquadFilter.prototype, "Q", {
                get: /**
                * Filter Q
                * @type {AudioParam}
                */
                function () {
                    return this._filter.Q;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BiquadFilter.prototype, "gain", {
                get: /**
                * Filter gain
                * @type {AudioParam}
                */
                function () {
                    return this._filter.gain;
                },
                enumerable: true,
                configurable: true
            });
            return BiquadFilter;
        })(Effect);
        Model.BiquadFilter = BiquadFilter;        
        /**
        * Bitcrusher and sample rate reducer.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Bitcrusher = (function (_super) {
            __extends(Bitcrusher, _super);
            function Bitcrusher(data) {
                        _super.call(this, data);
                this._pro = Klang.context.createScriptProcessor(data.buffer_size || 4096, 2, 2);
                var _this = this;
                this._pro.onaudioprocess = function (e) {
                    var inp = e.inputBuffer, out = e.outputBuffer, iL = inp.getChannelData(0), iR = inp.getChannelData(1), oL = out.getChannelData(0), oR = out.getChannelData(1), step = Math.pow(0.5, _this._bits), len = inp.length, sample = 0, lastL = 0, lastR = 0, i = 0;
                    for(; i < len; ++i) {
                        if((sample += _this._reduction) >= 1) {
                            sample--;
                            lastL = step * Math.floor(iL[i] / step);
                            lastR = step * Math.floor(iR[i] / step);
                        }
                        oL[i] = lastL;
                        oR[i] = lastR;
                    }
                };
                this._bits = data.bits || 4;
                this._reduction = data.reduction || 0.2;
                this._input.connect(this._pro);
                this._pro.connect(this._output);
            }
            Bitcrusher.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._pro);
                    this._input.connect(this._output);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Object.defineProperty(Bitcrusher.prototype, "bits", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Bits
                * @type {AudioParam}
                */
                function () {
                    return this._bits;
                },
                set: function (value) {
                    this._bits = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Bitcrusher.prototype, "reduction", {
                get: /**
                * Sample rate reduction.
                * @type {AudioParam}
                */
                function () {
                    return this._reduction;
                },
                set: function (value) {
                    this._reduction = value;
                },
                enumerable: true,
                configurable: true
            });
            return Bitcrusher;
        })(Effect);
        Model.Bitcrusher = Bitcrusher;        
        /**
        * Compressor effect that can be connected to a bus.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Compressor = (function (_super) {
            __extends(Compressor, _super);
            // för att dölja kompressionen när den används till sidechain
            function Compressor(data) {
                        _super.call(this, data);
                this._bypass = data.bypass;
                if(Klang.isMobile) {
                    this._input.connect(this._output);
                    return;
                }
                this._dynamicsCompressor = Klang.context.createDynamicsCompressor();
                this._makeUpGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._input.connect(this._dynamicsCompressor);
                this._dynamicsCompressor.connect(this._makeUpGain);
                this._makeUpGain.connect(this._output);
                if(this._bypass) {
                    this._input.connect(this._output);
                    this._makeUpGain.gain.value = 0;
                }
                this._dynamicsCompressor.threshold.value = data.threshold || this._dynamicsCompressor.threshold.value;
                this._dynamicsCompressor.knee.value = data.knee || this._dynamicsCompressor.knee.value;
                this._dynamicsCompressor.ratio.value = data.ratio || this._dynamicsCompressor.ratio.value;
                this._dynamicsCompressor.attack.value = data.attack || this._dynamicsCompressor.attack.value;
                this._dynamicsCompressor.release.value = data.release || this._dynamicsCompressor.release.value;
                this._makeUpGain.gain.value = data.make_up_gain || this._makeUpGain.gain.value;
            }
            Compressor.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._dynamicsCompressor);
                    if(this._bypass) {
                        this._input.connect(this._output);
                    }
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Object.defineProperty(Compressor.prototype, "threshold", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Threshold
                * @type {AudioParam}
                */
                function () {
                    return this._dynamicsCompressor.threshold;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Compressor.prototype, "knee", {
                get: /**
                * Knee
                * @type {AudioParam}
                */
                function () {
                    return this._dynamicsCompressor.knee;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Compressor.prototype, "ratio", {
                get: /**
                * Ratio
                * @type {AudioParam}
                */
                function () {
                    return this._dynamicsCompressor.ratio;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Compressor.prototype, "attack", {
                get: /**
                * Attack
                * @type {AudioParam}
                */
                function () {
                    return this._dynamicsCompressor.attack;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Compressor.prototype, "release", {
                get: /**
                * Release
                * @type {AudioParam}
                */
                function () {
                    return this._dynamicsCompressor.release;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Compressor.prototype, "reduction", {
                get: /**
                * Reduction in db
                * @type {AudioParam}
                */
                function () {
                    return this._dynamicsCompressor.reduction;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Compressor.prototype, "makeUpGain", {
                get: /**
                * Make up gain
                * @type {AudioParam}
                */
                function () {
                    return this._makeUpGain.gain;
                },
                enumerable: true,
                configurable: true
            });
            return Compressor;
        })(Effect);
        Model.Compressor = Compressor;        
        /**
        * Convolver effect that can be connected to a bus or send
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Convolver = (function (_super) {
            __extends(Convolver, _super);
            function Convolver(data) {
                        _super.call(this, data);
                if(Klang.isMobile) {
                    this._input.connect(this._output);
                    return;
                }
                this._soundName = data.sound;
                this._convolver = Klang.context.createConvolver();
                this._input.connect(this._convolver);
                this._convolver.connect(this._output);
                Core.instance.pushToPostLoadInitStack(this);
            }
            Convolver.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._convolver);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Convolver.prototype.init = /**
            * Grabs the audio buffer for the plate.
            */
            function () {
                var soundInstance = Core.instance.findInstance(this._soundName);
                this._convolver.buffer = soundInstance.buffer;
            };
            return Convolver;
        })(Effect);
        Model.Convolver = Convolver;        
        // Olika typer av delays
        /**
        * Base class for all delay effects, handles syncing to a sequencer.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var DelayBase = (function (_super) {
            __extends(DelayBase, _super);
            function DelayBase(data) {
                        _super.call(this, data);
                this._sync = data.sync// namn på en sequencer. Om man lägger till sync i json så är delay_time uplösningen av synkningen där 1 = 1 fjärdedel, 0.5 = åttondel osv
                ;
            }
            DelayBase.prototype.init = /**
            * Inits syncing to sequencer.
            */
            function () {
                if(this._sync) {
                    var seq = Core.instance.findInstance(this._sync);
                    this.updateSync(seq.bpm);
                    seq.registerBPMSync(this);
                }
            };
            DelayBase.prototype.updateSync = /**
            * Updates the BPM.
            * @param {number} bpm New BPM.
            */
            function (bpm) {
                return this;
            };
            Object.defineProperty(DelayBase.prototype, "sync", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * The name of the sequencer that this delay effect is synced to or undefined if it is not synced.
                * @type {string}
                */
                function () {
                    return this._sync;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DelayBase.prototype, "syncResolution", {
                get: /**
                * What resolution to sync to.
                * @type {number}
                */
                function () {
                    return this._syncResolution;
                },
                set: function (value) {
                    this._syncResolution = value;
                },
                enumerable: true,
                configurable: true
            });
            return DelayBase;
        })(Effect);
        Model.DelayBase = DelayBase;        
        /**
        * Simple delay effect.
        * input -> filter -> delay -> output
        *                 -> feedback -> filter
        *
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.DelayBase}
        */
        var Delay = (function (_super) {
            __extends(Delay, _super);
            function Delay(data) {
                        _super.call(this, data);
                /*if (Klang.isMobile) {
                this._input.connect(this._output);
                return;
                }*/
                this._feedback = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._delay = Klang.safari ? Klang.context.createDelayNode() : Klang.context.createDelay();
                if(data.filter) {
                    this._filter = Klang.context.createBiquadFilter();
                    this._input.connect(this._filter);
                    this._filter.connect(this._delay);
                    this._filter.type = Util.safeFilterType(data.filter.filter_type);
                    this._filter.frequency.value = data.filter.frequency || 1000;
                    this._filter.Q.value = data.filter.Q || 4.0;
                    this._filter.gain.value = data.filter.gain || 1.0;
                } else {
                    this._input.connect(this._delay);
                }
                this._delay.connect(this._feedback);
                this._delay.connect(this._output);
                this._feedback.connect(this._delay);
                if(this.sync) {
                    Core.instance.pushToPreLoadInitStack(this);
                    this.syncResolution = data.delay_time || 1;
                } else {
                    this._delay.delayTime.value = data.delay_time || 0.125;
                }
                this._feedback.gain.value = data.feedback || 0.3;
                this._output.gain.value = data.output_vol || data.wet || 1.0;
            }
            Delay.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._delay);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Delay.prototype.updateSync = /**
            * Updates the BPM.
            * @param {number} bpm New BPM.
            */
            function (bpm) {
                this._delay.delayTime.value = (60 / bpm) * this.syncResolution;
                return this;
            };
            Object.defineProperty(Delay.prototype, "delayTime", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Delay time in seconds.
                * @type {AudioParam}
                */
                function () {
                    return this._delay.delayTime;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Delay.prototype, "feedback", {
                get: /**
                * Feedback amount
                * @type {AudioParam}
                */
                function () {
                    return this._feedback.gain;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Delay.prototype, "filter", {
                get: /**
                * Filter
                * @type {BiquadFilterNode}
                */
                function () {
                    return this._filter;
                },
                enumerable: true,
                configurable: true
            });
            return Delay;
        })(DelayBase);
        Model.Delay = Delay;        
        /**
        * Ping pong delay
        * input -> filter -> leftDelay -> output
        *                              -> rightDelay -> output
        *                                            -> feedback -> filter
        *
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var PingPongDelay = (function (_super) {
            __extends(PingPongDelay, _super);
            function PingPongDelay(data) {
                        _super.call(this, data);
                this._splitter = Klang.context.createChannelSplitter(2);
                this._merger = Klang.context.createChannelMerger(2);
                this._mono = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._leftDelay = Klang.safari ? Klang.context.createDelayNode() : Klang.context.createDelay();
                this._rightDelay = Klang.safari ? Klang.context.createDelayNode() : Klang.context.createDelay();
                this._feedback = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                if(data.filter) {
                    this._filter = Klang.context.createBiquadFilter();
                    this._mono.connect(this._filter);
                    this._filter.connect(this._leftDelay);
                    this._feedback.connect(this._filter);
                    this._filter.type = Util.safeFilterType(data.filter.filter_type);
                    this._filter.frequency.value = data.filter.frequency || 1000;
                    this._filter.Q.value = data.filter.Q || 4.0;
                    this._filter.gain.value = data.filter.gain || 1.0;
                } else {
                    this._mono.connect(this._leftDelay);
                    this._feedback.connect(this._leftDelay);
                }
                this._input.connect(this._splitter);
                this._splitter.connect(this._mono, 0, 0);
                this._splitter.connect(this._mono, 1, 0);
                this._leftDelay.connect(this._rightDelay);
                this._rightDelay.connect(this._feedback);
                this._leftDelay.connect(this._merger, 0, 0);
                this._rightDelay.connect(this._merger, 0, 1);
                this._merger.connect(this._output);
                if(this.sync) {
                    Core.instance.pushToPreLoadInitStack(this);
                    this.syncResolution = data.delay_time || 1;
                } else {
                    this._leftDelay.delayTime.value = data.delay_time || 0.125;
                    this._rightDelay.delayTime.value = this._leftDelay.delayTime.value;
                }
                this._feedback.gain.value = data.feedback || 0.3;
                this._output.gain.value = data.output_vol || data.wet || 1.0;
            }
            PingPongDelay.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._splitter);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            PingPongDelay.prototype.updateSync = /**
            * Updates the BPM.
            * @param {number} bpm New BPM.
            */
            function (bpm) {
                this._leftDelay.delayTime.value = (60 / bpm) * this.syncResolution;
                this._rightDelay.delayTime.value = this._leftDelay.delayTime.value;
                return this;
            };
            Object.defineProperty(PingPongDelay.prototype, "feedback", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Feedback amount
                * @type {AudioParam}
                */
                function () {
                    return this._feedback.gain;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(PingPongDelay.prototype, "filter", {
                get: /**
                * Filter
                * @type {BiquadFilterNode}
                */
                function () {
                    return this._filter;
                },
                enumerable: true,
                configurable: true
            });
            return PingPongDelay;
        })(DelayBase);
        Model.PingPongDelay = PingPongDelay;        
        /**
        * Includes to separate delays for the left and right channel.
        * input -> leftFilter  -> leftDelay  -> output
        *                                    -> leftFeedback  -> leftFilter
        *       -> rightFilter -> rightDelay -> output
        *                                    -> rightFeedback -> filter
        *
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var StereoDelay = (function (_super) {
            __extends(StereoDelay, _super);
            function StereoDelay(data) {
                        _super.call(this, data);
                if(this.sync) {
                    data.left.sync = this.sync;
                    data.right.sync = this.sync;
                }
                this._splitter = Klang.context.createChannelSplitter(2);
                this._merger = Klang.context.createChannelMerger(2);
                this._leftDelay = new Delay(data.left || {
                });
                this._rightDelay = new Delay(data.right || {
                });
                this._input.connect(this._splitter);
                this._splitter.connect(this._leftDelay.input, 0, 0);
                this._splitter.connect(this._rightDelay.input, 0, 0);
                this._splitter.connect(this._rightDelay.input, 1, 0);
                this._leftDelay.output.connect(this._merger, 0, 0);
                this._rightDelay.output.connect(this._merger, 0, 1);
                this._merger.connect(this._output);
            }
            StereoDelay.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._splitter);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            StereoDelay.prototype.updateSync = /**
            * Updates the BPM.
            * @param {number} bpm New BPM.
            */
            function (bpm) {
                this._leftDelay.updateSync(bpm);
                this._rightDelay.updateSync(bpm);
                return this;
            };
            Object.defineProperty(StereoDelay.prototype, "leftDelay", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Left delay
                * @type {Klang.Model.Delay}
                */
                function () {
                    return this._leftDelay;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StereoDelay.prototype, "rightDelay", {
                get: /**
                * Right delay
                * @type {Klang.Model.Delay}
                */
                function () {
                    return this._rightDelay;
                },
                enumerable: true,
                configurable: true
            });
            return StereoDelay;
        })(DelayBase);
        Model.StereoDelay = StereoDelay;        
        /**
        * Limiter effect that can be connected to a bus.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Limiter = (function (_super) {
            __extends(Limiter, _super);
            function Limiter(data) {
                        _super.call(this, data);
                this._compressor = Klang.context.createDynamicsCompressor();
                this._preGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._postGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._input.connect(this._preGain);
                this._preGain.connect(this._compressor);
                this._compressor.connect(this._postGain);
                this._postGain.connect(this._output);
                this._compressor.threshold.value = data.threshold || 0;
                this._compressor.knee.value = 0;
                this._compressor.ratio.value = 100;
                this._compressor.attack.value = 0;
                this._compressor.release.value = 0;
                this._preGain.gain.value = data.pre_gain == undefined ? 1 : data.pre_gain;
                this._postGain.gain.value = data.post_gain == undefined ? 1 : data.post_gain;
            }
            Limiter.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._preGain);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Object.defineProperty(Limiter.prototype, "threshold", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Threhsold
                * @type {AudioParam}
                */
                function () {
                    return this._compressor.threshold;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Limiter.prototype, "preGain", {
                get: /**
                * Gain before limiter.
                * @type {AudioParam}
                */
                function () {
                    return this._preGain.gain;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Limiter.prototype, "postGain", {
                get: /**
                * Gain after limiter
                * @type {AudioParam}
                */
                function () {
                    return this._postGain.gain;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Limiter.prototype, "reduction", {
                get: /**
                * Reduction in db
                * @member {AudioParam}
                */
                function () {
                    return this._compressor.reduction;
                },
                enumerable: true,
                configurable: true
            });
            return Limiter;
        })(Effect);
        Model.Limiter = Limiter;        
        /**
        * Panner that can be connected to a bus or effect.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Panner = (function (_super) {
            __extends(Panner, _super);
            function Panner(data) {
                        _super.call(this, data);
                this._parameters = {
                    "x": 0,
                    "y": 0,
                    "z": 0.1,
                    "ox": 1,
                    "oy": 0,
                    "oz": 0,
                    "vx": 0,
                    "vy": 0,
                    "vz": 0
                };
                this._panner = Klang.context.createPanner();
                this._input.connect(this._panner);
                this._panner.connect(this._output);
                this._panner.panningModel = data.panning_model || "HRTF";
                this._panner.distanceModel = data.distance_model || "inverse";
                if(data.ref_distance) {
                    this._panner.refDistance = data.ref_distance;
                }
                if(data.max_distance) {
                    this._panner.maxDistance = data.max_distance;
                }
                if(data.rolloff_factor) {
                    this._panner.rolloffFactor = data.rolloff_factor;
                }
                if(data.cone_inner_angle) {
                    this._panner.coneInnerAngle = data.cone_inner_angle;
                }
                if(data.cone_outer_angle) {
                    this._panner.coneOuterAngle = data.cone_outer_angle;
                }
                if(data.cone_outer_gain) {
                    this._panner.coneOuterGain = data.cone_outer_gain;
                }
            }
            Panner.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._panner);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Object.defineProperty(Panner, "listener", {
                get: /**
                * The position of the listener, this position is global and affects all 3D panners.
                * @param {number} x x-pos (optional).
                * @param {number} y y-pos (optional).
                * @param {number} z z-pos (optional).
                */
                function () {
                    return Klang.context.listener;
                },
                enumerable: true,
                configurable: true
            });
            Panner.prototype.setPosition = /**
            * Sets panner position in relation to the AudioContextListener
            * @param {number} x x-pos (optional).
            * @param {number} y y-pos (optional).
            * @param {number} z z-pos (optional).
            */
            function (x, y, z) {
                var _x = x || this._parameters["x"], _y = y || this._parameters["y"], _z = z || this._parameters["z"];
                this._panner.setPosition(_x, _y, _z);
                this._parameters["x"] = _x;
                this._parameters["y"] = _y;
                this._parameters["z"] = _z;
            };
            Panner.prototype.setOrientation = /**
            * Describes which direction the audio source is pointing in the 3D cartesian coordinate space.
            * @param {number} x x-pos (optional).
            * @param {number} y y-pos (optional).
            * @param {number} z z-pos (optional).
            */
            function (x, y, z) {
                var _x = x || this._parameters["ox"], _y = y || this._parameters["oy"], _z = z || this._parameters["oz"];
                this._panner.setOrientation(_x, _y, _z);
                this._parameters["ox"] = _x;
                this._parameters["oy"] = _y;
                this._parameters["oz"] = _z;
            };
            Panner.prototype.setVelocity = /**
            * Sets the velocity vector of the audio source.
            * @param {number} x x-pos (optional).
            * @param {number} y y-pos (optional).
            * @param {number} z z-pos (optional).
            */
            function (x, y, z) {
                var _x = x || this._parameters["vx"], _y = y || this._parameters["vy"], _z = z || this._parameters["vz"];
                this._panner.setVelocity(_x, _y, _z);
                this._parameters["vx"] = _x;
                this._parameters["vy"] = _y;
                this._parameters["vz"] = _z;
            };
            return Panner;
        })(Effect);
        Model.Panner = Panner;        
        /**
        * Sidechain effect
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Sidechain = (function (_super) {
            __extends(Sidechain, _super);
            function Sidechain(data) {
                        _super.call(this, data);
                this._source = data.source;
                this._gain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._processor = Klang.safari ? Klang.context.createJavaScriptNode(data.buffer_size || 0) : Klang.context.createScriptProcessor(data.buffer_size || 0);
                var _this = this;
                this._processor.onaudioprocess = function () {
                    var reduction = _this._source.reduction.value;
                    // för att det är onödigt att räkna pow för mycket
                    _this._gain.gain.value = reduction == 0 ? 1 : Math.pow(10, reduction / 20);
                };
                this._input.connect(this._gain);
                this._input.connect(this._processor);
                this._processor.connect(Klang.context.destination);
                this._gain.connect(this._output);
                Core.instance.pushToPreLoadInitStack(this);
            }
            Sidechain.prototype.init = /**
            * Finds the compressor effect that reduces gain
            */
            function () {
                var bus = Core.instance.findInstance(this._source.bus);
                this._source = bus._effects[this._source.index];
            };
            Sidechain.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._gain);
                    this._input.connect(this._processor);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            return Sidechain;
        })(Effect);
        Model.Sidechain = Sidechain;        
        /**
        * Panner that only pans between the left and right channels. Does NOT use a 3D panner.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var StereoPanner = (function (_super) {
            __extends(StereoPanner, _super);
            function StereoPanner(data) {
                        _super.call(this, data);
                this._splitter = Klang.context.createChannelSplitter(2);
                this._merger = Klang.context.createChannelMerger(2);
                //this._mono = safari ? context.createGainNode() : context.createGain();
                this._left = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._right = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                // Dela upp input i två kanaler med separata gains
                this._input.connect(this._splitter);
                /*this._splitter.connect(this._mono, 0, 0);
                this._splitter.connect(this._mono, 1, 0);
                this._mono.connect(this._left);
                this._mono.connect(this._right);*/
                this._splitter.connect(this._left, 0, 0);
                this._splitter.connect(this._right, 1, 0);
                // Koppla ihop de två kanalerna till output
                this._left.connect(this._merger, 0, 0);
                this._right.connect(this._merger, 0, 1);
                this._merger.connect(this._output);
                this.pan = data.pan;
            }
            StereoPanner.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._splitter);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            StereoPanner.prototype.getGainValue = function (value) {
                return (value + 1) / 2;
            };
            StereoPanner.prototype.setPanTo = /**
            * Instantly sets panning at a given time.
            * @param {float} value A value between 0 and 1 where 0 represents all the way left and 1 represents all the way right.
            * @param {float} when When in Web Audio Context time to set the value.
            */
            function (value, when) {
                var gainValue = this.getGainValue(value);
                this._left.gain.setValueAtTime(1 - gainValue, when || 0);
                this._right.gain.setValueAtTime(gainValue, when || 0);
                return this;
            };
            StereoPanner.prototype.linPanTo = /**
            * Pans linearily to a specific value over a perid of time.
            * @param {float} value Target panning value.
            * @param {float} duration Time in seconds to reach the target value.
            * @param {float} when When in Web Audio Context time to start changing the value.
            */
            function (value, duration, when) {
                when = when || Klang.context.currentTime;
                var gainValue = this.getGainValue(value);
                this._left.gain.setValueAtTime(this._left.gain.value, when);
                this._left.gain.linearRampToValueAtTime(1 - gainValue, Klang.context.currentTime + duration);
                this._right.gain.setValueAtTime(this._right.gain.value, when);
                this._right.gain.linearRampToValueAtTime(gainValue, Klang.context.currentTime + duration);
                return this;
            };
            StereoPanner.prototype.expPanTo = /**
            * Pans exponentially to a specific value over a perid of time.
            * @param {float} value Target panning value.
            * @param {float} duration Time in seconds to reach the target value.
            * @param {float} when When in Web Audio Context time to start changing the value.
            */
            function (value, duration, when) {
                when = when || Klang.context.currentTime;
                var gainValue = this.getGainValue(value);
                this._left.gain.setValueAtTime(this._left.gain.value == 0 ? Util.EXP_MIN_VALUE : this._left.gain.value, when);
                this._left.gain.exponentialRampToValueAtTime(1 - gainValue, Klang.context.currentTime + duration);
                this._right.gain.setValueAtTime(this._right.gain.value == 0 ? Util.EXP_MIN_VALUE : this._right.gain.value, when);
                this._right.gain.exponentialRampToValueAtTime(gainValue, Klang.context.currentTime + duration);
                return this;
            };
            Object.defineProperty(StereoPanner.prototype, "pan", {
                get: /***
                * GETTERS / SETTERS
                *********************/
                /**
                * Current panning value, a floating point number between -1 and 1
                * where -1 represents all the way left, 1 represents all the way right and 0 is center.
                * @member {number}
                */
                function () {
                    return this._right.gain.value;
                },
                set: function (value) {
                    var gainValue = this.getGainValue(value);
                    this._left.gain.value = 1 - gainValue;
                    this._right.gain.value = gainValue;
                },
                enumerable: true,
                configurable: true
            });
            return StereoPanner;
        })(Effect);
        Model.StereoPanner = StereoPanner;        
        /**
        * Tremolo effect implemented by having an oscillator to modulate the output gain.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Tremolo = (function (_super) {
            __extends(Tremolo, _super);
            function Tremolo(data, startTime) {
                        _super.call(this, data);
                if(data.sync) {
                    this._sync = data.sync;
                    this._rate = data.rate || 0.25;
                }
                this._oscillator = Klang.context.createOscillator();
                this._amplitude = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._input.connect(this._output);
                this._oscillator.connect(this._amplitude);
                this._amplitude.connect(this._output.gain);
                this._oscillator.frequency.value = data.frequency || 10;
                this._oscillator.type = data.wave || 0// Sinusvåg
                ;
                this._amplitude.gain.value = data.amplitude || 1.0;
                this._oscillator.start(startTime);
                Core.instance.pushToPreLoadInitStack(this);
            }
            Tremolo.prototype.init = /**
            * Initializes syncing to sequencer.
            */
            function () {
                if(this._sync) {
                    var seq = Core.instance.findInstance(this._sync);
                    this.updateSync(seq.bpm);
                    seq.registerBPMSync(this);
                }
            };
            Tremolo.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                if(state) {
                    this._amplitude.connect(this._output);
                } else {
                    this._amplitude.disconnect();
                }
                return this;
            };
            Tremolo.prototype.updateSync = /**
            * Updates the syncing from sequencer.
            * @param {number} bpm New BPM.
            */
            function (bpm) {
                this._oscillator.frequency.value = (bpm / 60) / this._rate;
                return this;
            };
            Object.defineProperty(Tremolo.prototype, "frequency", {
                get: /***
                * GETTERS / SETTERS
                *********************/
                /**
                * Tremolo rate
                * @type {AudioParam}
                */
                function () {
                    return this._oscillator.frequency;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Tremolo.prototype, "amplitude", {
                get: /**
                * Tremolo amplitude
                * @type {AudioParam}
                */
                function () {
                    return this._amplitude.gain;
                },
                enumerable: true,
                configurable: true
            });
            return Tremolo;
        })(Effect);
        Model.Tremolo = Tremolo;        
        /**
        * Distortion effect.
        * @param {Object} data Configuration data.
        * @constructor
        * @extends {Klang.Model.Effect}
        */
        var Distortion = (function (_super) {
            __extends(Distortion, _super);
            function Distortion(data) {
                        _super.call(this, data);
                this._samples = 8192;
                this._type = data.distortion_type || 0;
                this._amount = data.amount || 0.7;
                this._samples = 8192;
                this._waveshaper = Klang.context.createWaveShaper();
                this._inputDrive = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._outputDrive = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._input.connect(this._inputDrive);
                this._inputDrive.connect(this._waveshaper);
                this._waveshaper.connect(this._outputDrive);
                this._outputDrive.connect(this._output);
                this._ws_table = new Float32Array(this._samples);
                this.createWSCurve(this._type, 0.7);
            }
            Distortion.prototype.createWSCurve = //TODO: lägg till fler WaveShaper algoritmer.
            function (type, amount) {
                switch(type) {
                    case 0:
                        var amount = Math.min(amount, 0.9999);
                        var k = 2 * amount / (1 - amount), i, x;
                        for(i = 0; i < this._samples; i++) {
                            x = i * 2 / this._samples - 1;
                            this._ws_table[i] = (1 + k) * x / (1 + k * Math.abs(x));
                        }
                        break;
                }
                this._waveshaper.curve = this._ws_table;
            };
            Distortion.prototype.setActive = /**
            * Activates or deactives the effect. An inactive effet is bypassed.
            * @param {boolean} state
            */
            function (state) {
                this._input.disconnect();
                if(state) {
                    this._input.connect(this._inputDrive);
                } else {
                    this._input.connect(this._output);
                }
                return this;
            };
            Object.defineProperty(Distortion.prototype, "amount", {
                get: /***
                * GETTERS / SETTERS
                *********************/
                /**
                * Distortion amount
                * @type {number}
                */
                function () {
                    return this._amount;
                },
                set: function (val) {
                    this._amount = val;
                    this.createWSCurve(this._type, this._amount);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Distortion.prototype, "type", {
                get: /**
                * Distortion type
                * @type {number}
                */
                function () {
                    return this._type;
                },
                set: function (val) {
                    this._type = val;
                    this.createWSCurve(this._type, this._amount);
                },
                enumerable: true,
                configurable: true
            });
            return Distortion;
        })(Effect);
        Model.Distortion = Distortion;        
        /**
        * Modulates an audio param over time.
        * @param {Object} data Configuration data.
        * @param {number} startTime When to start the LFO
        * @constructor
        */
        var LFO = (function () {
            function LFO(data, startTime) {
                this._targets = data.targets;
                this._sync = data.sync;
                this._rate = data.rate || 1;
                this._phaseVal = data.phase || 0;
                this._oscillator = Klang.context.createOscillator();
                this._oscillator.type = data.wave || 0;
                this._oscillator.frequency.value = this._rate;
                this._amplitude = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._amplitude.gain.value = data.amplitude || 1;
                this._phase = Klang.safari ? Klang.context.createDelayNode() : Klang.context.createDelay();
                this._phase.delayTime.value = this._phaseVal * (1 / this._oscillator.frequency.value);
                this._oscillator.connect(this._phase);
                this._phase.connect(this._amplitude);
                Klang.safari ? this._oscillator.noteOn(startTime) : this._oscillator.start(startTime);
                Core.instance.pushToPreLoadInitStack(this);
            }
            LFO.prototype.init = /**
            * Initializes syncing
            */
            function () {
                if(this._sync) {
                    var seq = Core.instance.findInstance(this._sync);
                    this.updateSync(seq.bpm);
                    seq.registerBPMSync(this);
                }
                for(var ix = 0, len = this._targets.length; ix < len; ix++) {
                    var t = this._targets[ix];
                    var bus = Core.instance.findInstance(t.bus);
                    var effect = bus.effects[t.effect];
                    this._amplitude.connect(effect[t.param]);
                }
            };
            LFO.prototype.updateSync = /**
            * Updates sync from sequencer
            * @param {number} bpm New BPM
            */
            function (bpm) {
                this._oscillator.frequency.value = (bpm / 60) / this._rate;
                this._phase.delayTime.value = this._phaseVal * (1 / this._oscillator.frequency.value);
                return this;
            };
            return LFO;
        })();
        Model.LFO = LFO;        
        /**
        * Synth that maps midi events to playback.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        */
        var Synth = (function () {
            // protected finns inte i typescript
            function Synth(data, name) {
                this._name = name;
                this._type = data.type;
                this._output = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._output.gain.value = data.volume || 1.0;
                // Spara destination och lägg på ihopkopplingskön om destination är definierad
                if(data.destination_name) {
                    this.destinationName = data.destination_name;
                    if(!Core.instance.initComplete) {
                        Core.instance.pushToConnectStack(this);
                    }
                }
            }
            Synth.prototype.connect = /**
            * Connects the synth's output to a Web Audio Node.
            * @param {AudioNode} destination Which node to route audio to.
            */
            function (destination) {
                this._output.connect(destination);
                return this;
            };
            Synth.prototype.disconnect = /**
            * Disconnects the synth from currently connected Web Audio node.
            */
            function () {
                this._output.disconnect();
                return this;
            };
            Synth.prototype.handleMidiEvent = /**
            * Handles a midi event.
            * @param {any} event Midi event to handle.
            * @param {number} when Time when the event should be handled, in Web Audio context time.
            */
            function (event, when) {
                return this;
            };
            Synth.prototype.stop = /**
            * Cancels playback of this synth immediately.
            */
            function () {
            };
            Synth.prototype.deschedule = /**
            * Deschedules scheduled playback.
            */
            function () {
                return this;
            };
            Object.defineProperty(Synth.prototype, "output", {
                get: /**
                * The audio's output.
                * @type {GainNode}
                */
                function () {
                    return this._output;
                },
                enumerable: true,
                configurable: true
            });
            return Synth;
        })();
        Model.Synth = Synth;        
        /**
        * Fills an empty buffer with values using the specified algorithm
        * @param {number} frames Number of frames in the buffer.
        * @param {number} alg Algorithm to use to fill the buffer.
        * @return {AudioBuffer} The generated buffer
        */
        function generateNoiseBuffer(frames, alg) {
            //var source = context.createBufferSource();
            var sampleFrames = frames || 65536;
            var buffer = Klang.context.createBuffer(1, sampleFrames, Klang.context.sampleRate);
            var bufferData = buffer.getChannelData(0);
            if(!alg) {
                alg = 0;
            }
            for(var i = 0; i < sampleFrames; i++) {
                switch(alg) {
                    case 0:
                        bufferData[i] = Math.random() * 2 - 1;
                        break;
                    case 1:
                        bufferData[i] = Math.random();
                        break;
                    case 2:
                        bufferData[i] = Math.random() - 1;
                        break;
                    case 3:
                        bufferData[i] = i / sampleFrames;
                        break;
                    default:
                        break;
                }
            }
            /*source.buffer = buffer;
            source.loop = true;*/
            return buffer;
        }
        Model.generateNoiseBuffer = generateNoiseBuffer;
        /**
        * One voice of a symepl oscillator
        * @param {Object} data Configuration data.
        * @param {number} voiceType Type of voice
        * @param {number} startTime When to start oscs
        * @param {AudioBuffer} noiseBuffer Noise buffer to use for noise type
        * @constructor
        * @extends {Klang.Model.Synth}
        */
        var SympleVoice = (function () {
            function SympleVoice(data, voiceType, filterData, startTime, noiseBuffer) {
                this.filterStartFreq = -1;
                this.voiceType = voiceType;
                this.active = false;
                this.activatedNote = -1;
                this._enabled = true;
                this._detune = data.detune || 0;
                this._wave = data.wave || 0;
                this._frames = data.frames;
                this._algorithm = data.algorithm;
                if(noiseBuffer) {
                    this._noiseBuffer = noiseBuffer;
                }
                this.gain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._filterData = filterData;
                //this.gain.gain.setValueAtTime(0.0, 0.0);
                            }
            SympleVoice.prototype.noteOn = /**
            * Handles note on event
            * @param {number} noteNumber Which note to turn on
            * @param {number} when When to turn on note
            * @param {Object} gainEG Gain envelope to use.
            * @param {Object} filterEG Filter envelope to use.
            * @param {Object} pitchEG Pitch envelopeto use
            * @param {number} transpose How much to tranpose midi note
            */
            function (noteNumber, velocity, when, gainEG, filterEG, pitchEG, transpose) {
                if(!this.enabled) {
                    return;
                }
                // Oscillator
                if(this._wave !== 4) {
                    this.source = Klang.context.createOscillator();
                    this.source.type = this._wave;
                    this.source.detune.value = this._detune;
                } else // Noise generator
                if(this._wave == 4) {
                    this.source = Klang.context.createBufferSource();
                    this.source.buffer = this._noiseBuffer;
                    this.source.loop = true;
                    //this.source = generateNoiseBuffer(this._frames, this._algorithm);
                                    }
                this._envelope = Klang.context.createGain();
                if(this._filterData) {
                    this.filter = Klang.context.createBiquadFilter();
                    this.filter.type = Util.safeFilterType(this._filterData.filter_type);
                    this.filter.frequency.value = this._filterData.frequency == undefined ? Util.NYQUIST_FREQUENCY : this._filterData.frequency;
                    if(this.filter.detune) {
                        this.filter.detune.value = this._filterData.detune || 0;
                    }// detune finns inte i safari
                    
                    this.filter.Q.value = this._filterData.Q || this.filter.Q;
                    this.filter.gain.value = this._filterData.gain || this.filter.gain;
                    this.filterTargetFreq = this.filter.frequency.value;
                    this.source.connect(this.filter);
                    this.filter.connect(this._envelope);
                    this._envelope.connect(this.gain);
                } else {
                    this.source.connect(this._envelope);
                    this._envelope.connect(this.gain);
                }
                if(this.voiceType == 1) {
                    this.filterAmplitudeGainNode.connect(this.filter.frequency);
                }
                if(when < Util.now()) {
                    when = Util.now();
                }
                //Klang.log("note on", noteNumber, when);
                this.active = true;
                this.activatedNote = noteNumber;
                // Bara för oscillator
                if(this._wave !== 4) {
                    // FREQUENCY
                    var pitchTargetFreq = Util.midiNoteToFrequency(noteNumber + transpose);
                    if(pitchEG) {
                        var pitchStartFreq = -1;
                        if(pitchEG.contour > 0) {
                            pitchStartFreq = pitchTargetFreq * (1 - pitchEG.contour);
                        } else if(pitchEG.contour < 0) {
                            pitchStartFreq = (Util.NYQUIST_FREQUENCY - pitchTargetFreq) * (-pitchEG.contour) + pitchTargetFreq;
                        }
                        this.source.frequency.cancelScheduledValues(when);
                        if(pitchStartFreq != -1) {
                            this.source.frequency.setValueAtTime(pitchStartFreq, when);
                            if(Klang.safari) {
                                this.source.frequency.setTargetValueAtTime(pitchTargetFreq, when, pitchEG.decay);
                            } else {
                                this.source.frequency.setTargetAtTime(pitchTargetFreq, when, pitchEG.decay);
                            }
                        } else// om contour är 0 sätts värdet direkt
                         {
                            this.source.frequency.setValueAtTime(pitchTargetFreq, when);
                        }
                    } else {
                        this.source.frequency.setValueAtTime(pitchTargetFreq, when);
                    }
                }
                // FILTER EG
                if(filterEG) {
                    this.filterStartFreq = -1;
                    if(filterEG.contour < 0) {
                        this.filterStartFreq = this.filterTargetFreq * (1 + filterEG.contour) + 1// +1 för att inte börja på 0 (exp ramp)
                        ;
                    } else if(filterEG.contour > 0) {
                        this.filterStartFreq = (Util.NYQUIST_FREQUENCY - this.filterTargetFreq) * filterEG.contour + this.filterTargetFreq;
                    }
                    if(this.filterStartFreq != -1) {
                        this.filter.frequency.cancelScheduledValues(when);
                        this.filter.frequency.setValueAtTime(this.filterStartFreq, when);
                        this.filter.frequency.exponentialRampToValueAtTime(this.filterTargetFreq, when + filterEG.attack);
                        if(Klang.safari) {
                            this.filter.frequency.setTargetValueAtTime(this.filterTargetFreq * filterEG.sustain, when + filterEG.attack, filterEG.decay);
                        } else {
                            this.filter.frequency.setTargetAtTime(this.filterTargetFreq * filterEG.sustain, when + filterEG.attack, filterEG.decay);
                        }
                    }
                }
                // GAIN EG
                var vol = 1.0;//velocity/127;
                
                if(gainEG) {
                    //this.gain.gain.cancelScheduledValues(when);
                    this._envelope.gain.value = 0.0;
                    this._envelope.gain.setValueAtTime(0.0, when);
                    this._envelope.gain.linearRampToValueAtTime(vol, when + gainEG.attack);
                    if(Klang.safari) {
                        this._envelope.gain.setTargetValueAtTime(vol * gainEG.sustain, when + gainEG.attack, gainEG.decay);
                    } else {
                        this._envelope.gain.setTargetAtTime(vol * gainEG.sustain, when + gainEG.attack, gainEG.decay);
                    }
                } else {
                    this._envelope.gain.setValueAtTime(vol, when);
                }
                this.source["startTime"] = when;
                Klang.safari ? this.source.noteOn(when) : this.source.start(when);
            };
            SympleVoice.prototype.noteOff = /**
            * Handles note off event
            * @param {number} noteNumber Which note to turn off
            * @param {number} when When to turn off note
            * @param {Object} gainEG Gain envelope to use.
            * @param {Object} filterEG Filter envelope to use.
            */
            function (noteNumber, when, gainEG, filterEG) {
                if(!this.enabled) {
                    return;
                }
                if(when < Util.now()) {
                    when = Util.now();
                }
                //Klang.log("note off", noteNumber, when);
                this.active = false;
                if(filterEG) {
                    if(this.filterStartFreq != -1) {
                        var currentFreq = this.filter.frequency.value;
                        this.filter.frequency.cancelScheduledValues(when);
                        this.filter.frequency.setValueAtTime(currentFreq, when);
                        if(Klang.safari) {
                            this.filter.frequency.setTargetValueAtTime(this.filterStartFreq, when, filterEG.release);
                        } else {
                            this.filter.frequency.setTargetAtTime(this.filterStartFreq, when, filterEG.release);
                        }
                    }
                }
                /*
                ändrade val till gainEG.sustain eftersom this.gain.gain.value var 0.
                Om gain inte hunnit ner till sustain kan det kanske låta konstigt?
                */
                //var val = this.gain.gain.value;
                if(gainEG) {
                    //var val = gainEG.sustain
                    this._envelope.gain.cancelScheduledValues(when);
                    this._envelope.gain.setValueAtTime(this._envelope.gain.value, when);
                    if(Klang.safari) {
                        this._envelope.gain.setTargetValueAtTime(0.0, when, gainEG.release);
                    } else {
                        this._envelope.gain.setTargetAtTime(0.0, when, gainEG.release);
                    }
                } else {
                    this._envelope.gain.setValueAtTime(0.0, when);
                }
                this.source["offTime"] = when;
                Klang.safari ? this.source.noteOff(when + gainEG.release * 5) : this.source.stop(when + gainEG.release * 5);
            };
            SympleVoice.prototype.stop = /**
            * Cancels playback of this synth immediately.
            */
            function () {
                this.filter.frequency.cancelScheduledValues(0);
                this._envelope.gain.cancelScheduledValues(0);
                this._envelope.gain.setValueAtTime(0, 0);
                Klang.safari ? this.source.noteOff(0) : this.source.stop(0);
            };
            SympleVoice.prototype.stopSoft = /**
            * Cancels playback softly (fades out)
            * @param {number} when When to stop
            * @param {Object} gainEG Envelope to use for fade
            * @param {Object} filterEG Envelope to use for filter
            */
            function (when, gainEG, filterEG) {
                this.active = false;
                /*    if (this.filterStartFreq != -1) {
                var currentFreq = this.filter.frequency.value;
                this.filter.frequency.cancelScheduledValues(0);
                if (safari) this.filter.frequency.setTargetValueAtTime(this.filterStartFreq, when, filterEG.release);
                else this.filter.frequency.setTargetAtTime(this.filterStartFreq, when, filterEG.release);
                }*/
                this._envelope.gain.cancelScheduledValues(when);
                if(Klang.safari) {
                    this._envelope.gain.setTargetValueAtTime(0.0, when, gainEG.release);
                } else {
                    this._envelope.gain.setTargetAtTime(0.0, when, gainEG.release);
                }
                Klang.safari ? this.source.noteOff(when + gainEG.release * 5) : this.source.stop(when + gainEG.release * 5);
            };
            Object.defineProperty(SympleVoice.prototype, "enabled", {
                get: /**
                * Whether this osc is enabled or not
                * @type {boolean}
                */
                function () {
                    return this._enabled;
                },
                set: function (state) {
                    this._enabled = state;
                },
                enumerable: true,
                configurable: true
            });
            return SympleVoice;
        })();        
        /**
        * One oscillator in Symple
        * @constructor
        * @param {Object} data Config data for osc
        * @param {Object} filterData Config data for filter
        * @param {number} startTime When to start osc
        */
        var SympleOsc = (function () {
            function SympleOsc(data, poly, filterData, startTime) {
                this._enabled = true;
                this.nextVoice = 0;
                this.octave = data.octave || 0;
                this.output = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this.output.gain.value = data.volume == undefined ? 1.0 : data.volume;
                this._data = data;
                this._poly = poly;
                this._filterData = filterData;
                this.voices = [];
                // Always generate noise buffer in debug, to be able to switch osc type to noise dynamically
                if(data.wave == 4) {
                    this._noiseBuffer = generateNoiseBuffer(this._data._frames, this._data._algorithm);
                }
            }
            SympleOsc.prototype.noteOn = /**
            * Handles note on event
            * @param {number} noteNumber Which note to turn on
            * @param {number} when When to turn on note
            * @param {Object} gainEG Gain envelope to use.
            * @param {Object} filterEG Filter envelope to use.
            * @param {Object} pitchEG Pitch envelopeto use
            * @param {number} transpose How much to tranpose midi note
            */
            function (noteNumber, velocity, when, gainEG, filterEG, pitchEG, transpose) {
                if(!this.enabled) {
                    return;
                }
                if(this.voices.length == this._poly) {
                    this.voices[0].noteOff(noteNumber, when, gainEG, filterEG);
                    this.voices.splice(0, 1);
                }
                /*
                for (var ix = 0; ix < this.voices.length; ix++) {
                var v = this.voices[ix];
                if (v.source.playbackState == 3) {
                this.voices.splice(ix, 1);
                ix--;
                }
                }
                */
                noteNumber += this.octave * 12;
                var v;
                if(this._data.wave == 4) {
                    v = new SympleVoice(this._data, 0, this._filterData, when, this._noiseBuffer);
                } else {
                    v = new SympleVoice(this._data, 0, this._filterData, when);
                }
                v.gain.connect(this.output);
                v.noteOn(noteNumber, velocity, when, gainEG, filterEG, pitchEG, transpose);
                // Sätts av lfon om lfo pitch ska kopplas in
                if(this.lfoPitchGainNode && this._data.wave != 4) {
                    this.lfoPitchGainNode.connect(v.source.frequency);
                }
                // Sätts av lfon om lfo filter ska kopplas in
                if(this.filterAmplitude && v.filter) {
                    this.filterAmplitude.connect(v.filter.frequency);
                }
                this.voices.push(v);
            };
            SympleOsc.prototype.noteOff = /**
            * Handles note off event
            * @param {number} noteNumber Which note to turn off
            * @param {number} when When to turn off note
            * @param {Object} gainEG Gain envelope to use.
            * @param {Object} filterEG Filter envelope to use.
            */
            function (noteNumber, when, gainEG, filterEG) {
                if(!this.enabled) {
                    return;
                }
                noteNumber += this.octave * 12;
                // Stäng av den som sattes på med samma not
                for(var ix = 0; ix < this.voices.length; ix++) {
                    if(this.voices[ix].active && this.voices[ix].activatedNote == noteNumber) {
                        this.voices[ix].noteOff(noteNumber, when, gainEG, filterEG);
                        this.voices.splice(ix, 1);
                        break;
                    }
                }
            };
            SympleOsc.prototype.stopSoft = /**
            * Cancels playback softly (fades out)
            * @param {number} when When to stop
            * @param {Object} gainEG Envelope to use for fade
            * @param {Object} filterEG Envelope to use for filter
            */
            function (when, gainEG, filterEG) {
                for(var ix = 0; ix < this.voices.length; ix++) {
                    this.voices[ix].stopSoft(when, gainEG, filterEG);
                }
            };
            SympleOsc.prototype.stop = /**
            * Cancels playback of this osc immediately.
            */
            function () {
                for(var ix = 0, len = this.voices.length; ix < len; ix++) {
                    this.voices[ix].stop();
                }
            };
            SympleOsc.prototype.deschedule = /**
            * Deschedules scheduled playback.
            */
            function () {
                for(var ix = 0, len = this.voices.length; ix < len; ix++) {
                    if(this.voices[ix]) {
                        var source = this.voices[ix].source;
                        if(source.playbackState == 1 || source["startTime"] > Klang.context.currentTime) {
                            this.voices[ix].stop();
                            this.voices.splice(ix, 1);
                            ix--;
                        }
                    }
                }
            };
            SympleOsc.prototype.setDetune = /**
            * Updates detune amount
            * @param {number} detune Amount detune
            * @param {number} when When to updte detune.
            */
            function (detune, when) {
                //this._detune = detune;
                if(this._data) {
                    this._data.detune = detune;
                    for(var ix = 0, len = this.voices.length; ix < len; ix++) {
                        this.voices[ix].source.detune.setValueAtTime(detune, when);
                    }
                }
            };
            Object.defineProperty(SympleOsc.prototype, "enabled", {
                get: /**
                * Whether this osc is enabled or not
                * @type {boolean}
                */
                function () {
                    return this._enabled;
                },
                set: function (state) {
                    this._enabled = state;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SympleOsc.prototype, "detune", {
                get: /**
                * How detuned osc is
                * @type {number} Detune amount
                */
                function () {
                    return this._detune;
                },
                enumerable: true,
                configurable: true
            });
            return SympleOsc;
        })();        
        /**
        * Modulates parameter of the Symple synth
        * @param {Object} data Configuration data.
        * @param {number} startTime When to start the LFO
        * @constructor
        */
        var SympleLFO = (function () {
            function SympleLFO(data, startTime) {
                this.osc = Klang.context.createOscillator();
                this.phaseDelay = Klang.safari ? Klang.context.createDelayNode() : Klang.context.createDelay();
                this.osc.type = data.wave || 0;
                this.osc.frequency.value = data.rate || 1;
                this.phase = data.phase || 0;
                this.phaseDelay.delayTime.value = this.phase * (1 / this.osc.frequency.value);
                this.sync = data.sync;
                this.syncResolution = data.rate;
                this.osc.connect(this.phaseDelay);
                //if (data.osc_volume_amount) {
                this.oscVolumeAmplitude = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this.oscVolumeAmplitude.gain.value = data.osc_volume_amount;
                this.phaseDelay.connect(this.oscVolumeAmplitude);
                //}
                //if (data.pitch_amount) {
                this.pitchAmplitude = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this.pitchAmplitude.gain.value = data.pitch_amount;
                this.phaseDelay.connect(this.pitchAmplitude);
                //}
                //if (data.filter_amount) {
                this.filterAmplitude = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this.filterAmplitude.gain.value = data.filter_amount;
                this.phaseDelay.connect(this.filterAmplitude);
                //}
                Klang.safari ? this.osc.noteOn(startTime) : this.osc.start(startTime);
            }
            SympleLFO.prototype.updateSync = /**
            * Updates sync from a sequencer.
            * @param {number} bpm New BPM.
            */
            function (bpm) {
                this.osc.frequency.value = (bpm / 60) / this.syncResolution;
                this.phaseDelay.delayTime.value = this.phase * (1 / this.osc.frequency.value);
                return this;
            };
            return SympleLFO;
        })();        
        /**
        * Plays synthesized tones based on midi input.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        * @extends {Klang.Model.Synth}
        */
        var Symple = (function (_super) {
            __extends(Symple, _super);
            function Symple(data, name) {
                        _super.call(this, data, name);
                this.bendRange = 400;
                this._arpCounter = 0;
                this._arpNoteLength = 0.5;
                var startTime = Klang.context.currentTime + Util.OSC_START_DELAY;// Tid då alla oscillatorer ska starta, för att de ska startas exakt samtidigt
                
                this._gainEG = data.gain_eg;
                this._filterEG = data.filter_eg;
                this._pitchEG = data.pitch_eg;
                this._arpMode = data.arp_mode || -1;
                this._beatSubscription = data.beat_subscription || 0.25;
                this._sync = data.sync;
                this._activeVoices = [];
                // OSCILLATORS
                this._oscs = [];
                this._poly = data.poly;
                for(var ix = 0, len = data.oscillators.length; ix < len; ix++) {
                    var o = new SympleOsc(data.oscillators[ix], data.poly, data.filter, startTime);
                    o.output.connect(this.output);
                    this._oscs.push(o);
                }
                if(data.LFO) {
                    this._LFO = new SympleLFO(data.LFO, startTime);
                    // oscillators
                    for(var ix = 0, len = this._oscs.length; ix < len; ix++) {
                        var osc = this._oscs[ix];
                        // osc volume
                        if(this._LFO.oscVolumeAmplitude) {
                            this._LFO.oscVolumeAmplitude.connect(osc.output.gain);
                        }
                        if(this._LFO.pitchAmplitude) {
                            osc.lfoPitchGainNode = this._LFO.pitchAmplitude;
                        }
                        // filter freq
                        if(this._LFO.filterAmplitude) {
                            osc.filterAmplitude = this._LFO.filterAmplitude;
                        }
                        // voices
                                            }
                    // synkning
                    if(this._LFO.sync) {
                        Core.instance.pushToPreLoadInitStack(this);
                    }
                }
                // ARP
                if(this._sync) {
                    Core.instance.pushToPreLoadInitStack(this);
                }
            }
            Symple.prototype.init = /**
            * Inits sync to sequencer.
            */
            function () {
                if(this._LFO.sync) {
                    // kommer endast hit om LFO finns och ska synkas
                    var seq = Core.instance.findInstance(this._LFO.sync);
                    this._LFO.updateSync(seq.bpm);
                    seq.registerBPMSync(this._LFO);
                }
                if(this._sync) {
                    var seq = Core.instance.findInstance(this._sync);
                    seq.registerSynth(this);
                }
            };
            Symple.prototype.handleMidiEvent = /**
            * Handles a midi event.
            * @param {any} event Midi event to handle.
            * @param {number} when Time when the event should be handled, in Web Audio context time.
            * @param {number} transpose How much to transpose midi notes
            * @param {boolean} bypassArp Force no use of arp
            */
            function (midiEvent, when, transpose, bypassArp) {
                when = when || Klang.context.currentTime;
                bypassArp = bypassArp || false;
                transpose = transpose || 0;
                if(midiEvent.type == "channel") {
                    if(midiEvent.subtype == "noteOn") {
                        if(this._arpMode >= 0 && !bypassArp) {
                            this._activeVoices.push(midiEvent);
                            return;
                        }
                        for(var ix = 0, len = this._oscs.length; ix < len; ix++) {
                            this._oscs[ix].noteOn(midiEvent.noteNumber, midiEvent.velocity, when, this._gainEG, this._filterEG, this._pitchEG, transpose);
                        }
                    } else if(midiEvent.subtype == "noteOff") {
                        if(this._arpMode >= 0 && !bypassArp) {
                            for(var i = 0; i < this._activeVoices.length; i++) {
                                if(midiEvent.noteNumber === this._activeVoices[i].noteNumber) {
                                    this._activeVoices.splice(i, 1);
                                    break;
                                }
                            }
                            return;
                        }
                        for(var ix = 0, len = this._oscs.length; ix < len; ix++) {
                            this._oscs[ix].noteOff(midiEvent.noteNumber, when, this._gainEG, this._filterEG);
                        }
                    } else if(midiEvent.subtype == "pitchBend") {
                        var bend;
                        if(midiEvent.value != undefined) {
                            bend = midiEvent.value;
                        } else if(midiEvent.velocity != undefined) {
                            bend = midiEvent.velocity;
                        }
                        var currentPitch = ((bend - 8192) / 16384) * this.bendRange;
                        //var currentPitch = ((bend - 64) / 127) * this.bendRange;
                        //console.log(currentPitch, when, Util.now());
                        for(var i = 0; i < this._oscs.length; i++) {
                            this._oscs[i].setDetune(currentPitch, when);
                        }
                    }
                }
                return this;
            };
            Symple.prototype.stop = /**
            * Cancels playback of this synth immediately.
            */
            function (when) {
                when = when || Util.now();
                for(var ix = 0, len = this._oscs.length; ix < len; ix++) {
                    //this._oscs[ix].stop();
                    this._oscs[ix].stopSoft(when, this._gainEG, this._filterEG);
                }
            };
            Symple.prototype.deschedule = /**
            * Deschedules scheduled playback.
            */
            function () {
                for(var o = 0, len = this._oscs.length; o < len; o++) {
                    this._oscs[o].deschedule();
                }
                return this;
            };
            Symple.prototype.arpActive = function (active) {
                if(active) {
                    if(this._sync) {
                        var seq = Core.instance.findInstance(this._sync);
                        seq.registerSynth(this);
                    }
                } else {
                    this._arpMode = -1;
                    if(this._sync) {
                        var seq = Core.instance.findInstance(this._sync);
                        seq.unregisterSynth(this);
                    }
                }
            };
            Symple.prototype.update = /**
            * Called from the sequencer that this synth listens to.
            * @param {currentStep} The sequencer's current step.
            * @param {scheduleTime} Web Audio API context time that corresponds to the current step.
            */
            function (currentStep, scheduleTime) {
                // Räkna fram och köa upp endast om denna synth lyssnar
                /**
                * TODO: Sortera activeVoices / _arpModes
                * oktaver
                * note length
                */
                if(currentStep % this._beatSubscription == 0) {
                    if(this._activeVoices.length === 0) {
                        return;
                    }
                    this._arpCounter++;
                    this._arpCounter = this._arpCounter % this._activeVoices.length;
                    if(this._arpCounter < this._activeVoices.length) {
                        this.handleMidiEvent(this._activeVoices[this._arpCounter], scheduleTime, 0, true);
                        var noteOff = {
                            "type": "channel",
                            "subtype": "noteOff",
                            "noteNumber": this._activeVoices[this._arpCounter].noteNumber,
                            "velocity": this._activeVoices[this._arpCounter].velocity,
                            "deltaTime": this._activeVoices[this._arpCounter].deltaTime
                        };
                        this.handleMidiEvent(noteOff, scheduleTime + this._arpNoteLength, 0, true);
                    }
                }
            };
            return Symple;
        })(Synth);
        Model.Symple = Symple;        
        /**
        * Plays samples based on midi events.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        * @extends {Klang.Model.Synth}
        */
        var SamplePlayer = (function (_super) {
            __extends(SamplePlayer, _super);
            //A sample is stopped after releaseTime * _stopFactor seconds.
            function SamplePlayer(data, name) {
                        _super.call(this, data, name);
                this._content = [];
                this._activeVoices = [];
                this._allVoices = [];
                // Alla röster som spelas, även om de schedulerats att stoppa
                this._hasNoteOffSamples = false;
                this._hasSustainOnSamples = false;
                this._hasSustainOffSamples = false;
                this._pitchBendRange = 0.25;
                this._pedalOnTime = -1;
                this._sustained = [];
                this._maxNotes = 20;
                this._stopFactor = 5;
                this._content = data.content;
                this._volumeCurve = data.volume_curve || "none";
                this._gainEG = data.eg_gain || {
                    attack: 0,
                    decay: 0,
                    sustain: 1,
                    release: 0.005
                };
                this._currentPitch = 1;
                Core.instance.pushToPreLoadInitStack(this);
            }
            SamplePlayer.prototype.init = /**
            * Initializes sample player
            */
            function () {
                this._envelope = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                for(var ix = 0, len = this._content.length; ix < len; ix++) {
                    if(this._content[ix].value === "noteOff") {
                        this._hasNoteOffSamples = true;
                    }
                    if(this._content[ix].value === "sustainOn") {
                        this._hasSustainOnSamples = true;
                    }
                    if(this._content[ix].value === "sustainOff") {
                        this._hasSustainOffSamples = true;
                    }
                    for(var j = 0; j < this._content[ix].samples.length; j++) {
                        // byter ut strängen source mot audioSource-instanser
                        this._content[ix].samples[j].source = Core.instance.findInstance(this._content[ix].samples[j].source);
                        this._content[ix].samples[j].source._parentType = "SamplePlayer";
                        if(this._content[ix].samples[j].source.loop) {
                            this._loopedSamples = true;
                        }
                    }
                }
            };
            SamplePlayer.prototype.handleMidiEvent = /**
            * Handles a midi event.
            * @param {any} event Midi event to handle.
            * @param {number} when Time when the event should be handled, in Web Audio context time.
            * @param {number}
            */
            function (midiEvent, when, transpose) {
                when = when || Util.now();
                transpose = transpose || 0;
                if(midiEvent.type == "channel") {
                    if(midiEvent.subtype == "noteOn") {
                        this.noteOn(when, midiEvent.noteNumber, transpose, midiEvent.velocity, midiEvent.subtype);
                        //Klang.log("Note on: " + midiEvent.noteNumber);
                        if(this._callback) {
                            this._callback(midiEvent, when);
                        }
                    } else if(midiEvent.subtype == "noteOff") {
                        this.noteOff(when, midiEvent.noteNumber, midiEvent.velocity, midiEvent.subtype);
                        if(this._callback) {
                            this._callback(midiEvent, when);
                        }
                        //Klang.log("Note off: " + midiEvent.noteNumber);
                                            } else if(midiEvent.subtype == "pitchBend") {
                        var bend = midiEvent.value;
                        //this._currentPitch = 1+((bend -8192)/16384);
                        this._currentPitch = 1 + ((bend - 64) / 127);
                        for(var i = 0; i < this._activeVoices.length; i++) {
                            this._activeVoices[i].source.playbackRateNode.setValueAtTime(this._currentPitch, when);
                        }
                    } else if(midiEvent.subtype == "controller") {
                        var controllerType = midiEvent.controllerType || midiEvent.noteNumber;
                        var value = midiEvent.value == undefined ? midiEvent.velocity : midiEvent.value;
                        switch(controllerType) {
                            case 1:
                                //modulation
                                break;
                            case 64:
                                //sustain
                                if(value < 64) {
                                    this.pedalRelease(when);
                                    if(when > this._pedalOnTime) {
                                        this._pedalOnTime = -1;
                                    }
                                    if(this._hasSustainOffSamples) {
                                        this.noteOn(when, 0, 0, 127, "sustainOff");
                                    }
                                } else if(value > 64) {
                                    this._pedalOnTime = when;
                                    if(this._hasSustainOnSamples) {
                                        this.noteOn(when, 0, 0, 127, "sustainOn");
                                    }
                                }
                                break;
                            default:
                        }
                    }
                }
                return this;
            };
            SamplePlayer.prototype.noteOn = /**
            * Plays a sample corresponding to a midi note.
            * @param {number} when When to play the note.
            * @param {number} midiNote What note to play
            * @param {number} transpose How much to tranpose the note
            * @param {number} velocity Note velocity
            * @param {string} value Type of midi event
            * @param {number} volume Volume to play at
            * @private
            */
            function (when, midiNote, transpose, velocity, value, volume) {
                // Ta bort voices som stoppats
                for(var ix = 0; ix < this._allVoices.length; ix++) {
                    var v = this._allVoices[ix];
                    if(v.source._sources.length == 0 || v.source.lastSource.playbackState == 3) {
                        this._allVoices.splice(ix, 1);
                        ix--;
                    }
                }
                //Klang.log("when", when, "midiNote", midiNote, "velocity", velocity,  "value", value);
                var note = this.getNote(midiNote + transpose, velocity, value);
                //calculate pitch/playbackRate
                var targetPitch = Util.midiNoteToFrequency(midiNote + transpose);
                var rootPitch = Util.midiNoteToFrequency(note.root);
                var rate = targetPitch / rootPitch;
                if(note.root === -1) {
                    rate = 1;
                }
                var copy = new AudioSource(note.source.data, midiNote.toString());
                if(value === "noteOn") {
                    var newVoice = {
                        "source": copy,
                        "time": when,
                        "velocity": velocity,
                        "note": midiNote,
                        "transpose": transpose
                    };
                    this._activeVoices.push(newVoice);
                    this._allVoices.push(newVoice);
                }
                //  samplePlayerns destination overridar audiosourcens
                if(this.destinationName) {
                    copy.connect(Core.instance.findInstance(this.destinationName).input);
                } else {
                    copy.connect(Core.instance.findInstance(copy.destinationName).input);
                }
                var vol = 0;
                if(volume) {
                    vol = volume * velocity / 128;
                } else if(this._volumeCurve === "linear") {
                    vol = velocity / 128;
                } else if(this._volumeCurve === "exponential") {
                    vol = Math.abs(1 - Math.exp(velocity / 128));
                } else if(this._volumeCurve === "none") {
                    vol = 1;
                }
                vol *= copy.output.gain.value;
                //Klang.log("vol", vol);
                copy.output.gain.cancelScheduledValues(when);
                if(this._gainEG.attack === 0) {
                    copy.output.gain.setValueAtTime(vol, when);
                } else {
                    copy.output.gain.setValueAtTime(0.0, when);
                    copy.output.gain.linearRampToValueAtTime(vol, when + this._gainEG.attack);
                    if(Klang.safari) {
                        copy.output.gain.setTargetValueAtTime(vol * this._gainEG.sustain, when + this._gainEG.attack, this._gainEG.decay);
                    } else {
                        copy.output.gain.setTargetAtTime(vol * this._gainEG.sustain, when + this._gainEG.attack, this._gainEG.decay);
                    }
                }
                copy.nextPlaybackRate = rate * this._currentPitch;
                copy.play(when);
            };
            SamplePlayer.prototype.noteOff = /**
            * Handles note off event
            * @param {number} When to handle note off
            * @param {number} midiNote What note to noteOff
            * @param {number} velocity NoteOff velocity
            * @param {string} value noteOff value
            * @private
            */
            function (when, midiNote, velocity, value) {
                var note = this.getNote(midiNote, velocity, "noteOn");
                for(var i = 0; i < this._activeVoices.length; i++) {
                    if(!midiNote || midiNote.toString() === this._activeVoices[i].source._name) {
                        // If pedal is pressed
                        if(when > this._pedalOnTime && this._pedalOnTime > 0) {
                            // Limits the number of sustained notes. Splices the first one (oldest) and adds the new note.
                            if(this._sustained.length > this._maxNotes) {
                                this._sustained[0].source.stop(when + this._gainEG.release * this._stopFactor);
                                this._sustained.splice(0, 1);
                            }
                            this._sustained.push(this._activeVoices[i]);
                            this._activeVoices.splice(i, 1);
                        } else {
                            if(when < Util.now()) {
                                when = Util.now();
                            }
                            var val = this._activeVoices[i].source.output.gain.value;
                            //this._activeVoices[i].source.output.gain.cancelScheduledValues(when);
                            //this._activeVoices[i].source.output.gain.setValueAtTime(val, when);
                            this._activeVoices[i].source.stop(when + this._gainEG.release * this._stopFactor);
                            if(Klang.safari) {
                                this._activeVoices[i].source.output.gain.setTargetValueAtTime(0.0, when, this._gainEG.release);
                            } else {
                                this._activeVoices[i].source.output.gain.setTargetAtTime(0.0, when, this._gainEG.release);
                            }
                            if(this._hasNoteOffSamples) {
                                var t = Util.now() - this._activeVoices[i].time;
                                var v = Math.min((Math.exp(-t) / 3), 1);
                                this.noteOn(when, midiNote, this._activeVoices[i].transpose, this._activeVoices[i].velocity, value, v);
                            }
                            this._activeVoices.splice(i, 1);
                        }
                    }
                }
            };
            SamplePlayer.prototype.stop = /**
            * Stops all notes and resets pedal
            * @param {number} when When to stop
            */
            function (when) {
                var when = when || Util.now();
                this.pedalRelease(when);
                for(var i = 0; i < this._activeVoices.length; i++) {
                    if(when < Util.now()) {
                        when = Util.now();
                    }
                    var val = this._activeVoices[i].source.output.gain.value;
                    this._activeVoices[i].source.output.gain.cancelScheduledValues(when);
                    this._activeVoices[i].source.output.gain.setValueAtTime(val, when);
                    this._activeVoices[i].source.stop(when + this._gainEG.release * this._stopFactor);
                    if(Klang.safari) {
                        this._activeVoices[i].source.output.gain.setTargetValueAtTime(0.0, when, this._gainEG.release);
                    } else {
                        this._activeVoices[i].source.output.gain.setTargetAtTime(0.0, when, this._gainEG.release);
                    }
                }
                this._activeVoices = [];
                return this;
            };
            SamplePlayer.prototype.deschedule = /**
            * Deschedules scheduled playback.
            */
            function () {
                for(var i = 0; i < this._allVoices.length; i++) {
                    this._allVoices[i].source.deschedule();
                }
                return this;
            };
            SamplePlayer.prototype.pedalRelease = /**
            * Releases pedal
            * @param {number} when When to release pedal
            * @private
            */
            function (when) {
                for(var i = 0; i < this._sustained.length; i++) {
                    if(when < Util.now()) {
                        when = Util.now();
                    }
                    // Fulfix för Firefox som inte funkar så bra
                    if(Klang.browser == "Firefox") {
                        //var val = this._sustained[i].source.output.gain.value;
                        //this._sustained[i].source.output.gain.cancelScheduledValues(when);
                        //this._sustained[i].source.output.gain.setValueAtTime(val, when);
                        this._sustained[i].source.output.gain.linearRampToValueAtTime(0.0, when + 0.3);
                        this._sustained[i].source.stop(when + this._gainEG.release * this._stopFactor);
                        continue;
                    }
                    if(Klang.safari) {
                        this._sustained[i].source.output.gain.setTargetValueAtTime(0.0, when, this._gainEG.release);
                    } else {
                        this._sustained[i].source.output.gain.setTargetAtTime(0.0, when, this._gainEG.release);
                    }
                    if(this._hasNoteOffSamples) {
                        var t = Util.now() - this._sustained[i].time;
                        var v = Math.min((Math.exp(-t) / 3), 1);
                        this.noteOn(when, this._sustained[i].note, this._sustained[i].transpose, this._sustained[i].velocity, "noteOff", v);
                    }
                }
                this._sustained = [];
            };
            SamplePlayer.prototype.getNote = /**
            * Checks which source to play based on it's note and velocity
            * @param {number} note noteNumber to check
            * @param {number} velocity Velocity to check
            * @param {string} value Value to check
            */
            function (note, velocity, value) {
                var i = 0;
                var val = this._content[i].value || "noteOn";
                while(velocity > this._content[i].highVelocity || value !== this._content[i].value) {
                    i++;
                }
                var velocityLayer = i;
                var j = 0;
                while(note < this._content[velocityLayer].samples[j].startRange || note > this._content[velocityLayer].samples[j].endRange) {
                    j++;
                }
                return this._content[velocityLayer].samples[j];
            };
            Object.defineProperty(SamplePlayer.prototype, "content", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Sample content
                * @type {Array}
                */
                function () {
                    return this._content;
                },
                set: function (value) {
                    this._content = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SamplePlayer.prototype, "callbackFunction", {
                set: /**
                * Callback
                * @type {Function}
                */
                function (func) {
                    this._callback = func;
                },
                enumerable: true,
                configurable: true
            });
            return SamplePlayer;
        })(Synth);
        Model.SamplePlayer = SamplePlayer;        
        /**
        * Plays a synthesized kick drum sound.
        * @param {Object} data Configuration data.
        * @param {number} startTime When to start oscs
        * @param {AudioNode} destination Where to route output
        * @constructor
        */
        var SmattrKick1 = (function () {
            function SmattrKick1(data, startTime, destination) {
                this._volume = data.volume != undefined ? data.volume : 1.0;
                this._pitchTargetFreq = data.pitch_target_freq != undefined ? data.pitch_target_freq : 62;
                this._pitchStartFreq = data.pitch_start_freq != undefined ? data.pitch_start_freq : 200;
                this._pitchDecay = data.pitch_decay != undefined ? data.pitch_decay : 0.04;
                this._gainDecay = data.gain_decay != undefined ? data.gain_decay : 0.07;
                this._sine = Klang.context.createOscillator();
                this._filter = Klang.context.createBiquadFilter();
                this._gain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                if(Klang.safari) {
                    this._filter.type = 0;
                } else {
                    this._filter.type = "lowpass";
                }
                this._filter.frequency.value = data.lowpass_frequency != undefined ? data.lowpass_frequency : 500;
                this._filter.Q.value = data.lowpass_Q != undefined ? data.lowpass_Q : 3;
                this._sine.connect(this._filter);
                this._filter.connect(this._gain);
                this._gain.connect(destination);
                this._gain.gain.value = 0.0;
                Klang.safari ? this._sine.noteOn(startTime) : this._sine.start(startTime);
            }
            SmattrKick1.prototype.play = /**
            * Plays the sound
            * @param {number} velocity Note velocity
            * @param {number} when When to play
            */
            function (velocity, when) {
                when = when || Klang.context.currentTime;
                // Pitch
                this._sine.frequency.setValueAtTime(this._pitchStartFreq, when);
                Klang.safari ? this._sine.frequency.setTargetValueAtTime(this._pitchTargetFreq, when, this._pitchDecay) : this._sine.frequency.setTargetAtTime(this._pitchTargetFreq, when, this._pitchDecay);
                // Gain
                this._gain.gain.setValueAtTime(this._volume, when);
                Klang.safari ? this._gain.gain.setTargetValueAtTime(0.0, when, this._gainDecay) : this._gain.gain.setTargetAtTime(0.0, when, this._gainDecay);
            };
            return SmattrKick1;
        })();        
        /**
        * Plays a synthesized kick drum sound.
        * @param {Object} data Configuration data.
        * @param {number} startTime When to start oscs
        * @param {AudioNode} destination Where to route output
        * @constructor
        */
        var SmattrKick2 = (function () {
            function SmattrKick2(data, startTime, destination) {
                this._subVolume = data.sub_volume != undefined ? data.sub_volume : 1.0;
                this._subDecay = data.sub_decay != undefined ? data.sub_decay : 0.04;
                this._fmAmount = data.fm_amount != undefined ? data.fm_amount : 30;
                this._fmDecay = data.fm_decay != undefined ? data.fm_decay : 0.08;
                this._fmSustain = data.fm_sustain != undefined ? data.fm_sustain : 0.4;
                this._subSine = Klang.context.createOscillator();
                this._subGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._fmSine = Klang.context.createOscillator();
                this._fmGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._filter = Klang.context.createBiquadFilter();
                this._gain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._subSine.frequency.value = data.sub_frequency != undefined ? data.sub_frequency : 62;
                this._subGain.gain.value = 0.0;
                this._fmSine.frequency.value = data.fm_frequency != undefined ? data.fm_frequency : 62;
                this._fmGain.gain.value = this._fmAmount * this._fmSustain;
                this._gain.gain.value = data.volume != undefined ? data.volume : 1.0;
                if(Klang.safari) {
                    this._filter.type = 0;
                } else {
                    this._filter.type = "lowpass";
                }
                this._filter.frequency.value = data.lowpass_frequency != undefined ? data.lowpass_frequency : 1500;
                this._filter.Q.value = data.lowpass_Q != undefined ? data.lowpass_Q : 1.0;
                this._fmSine.connect(this._fmGain);
                this._fmGain.connect(this._subSine.frequency);
                this._subSine.connect(this._subGain);
                this._subGain.connect(this._filter);
                this._filter.connect(this._gain);
                this._gain.connect(destination);
                Klang.safari ? this._subSine.noteOn(startTime) : this._subSine.start(startTime);
                Klang.safari ? this._fmSine.noteOn(startTime) : this._fmSine.start(startTime);
            }
            SmattrKick2.prototype.play = /**
            * Plays the sound
            * @param {number} velocity Note velocity
            * @param {number} when When to play
            */
            function (velocity, when) {
                // Sub Gain
                this._subGain.gain.setValueAtTime(this._subVolume, when);
                Klang.safari ? this._subGain.gain.setTargetValueAtTime(0.0, when, this._subDecay) : this._subGain.gain.setTargetAtTime(0.0, when, this._subDecay);
                // FM Gain
                this._fmGain.gain.setValueAtTime(this._fmAmount, when);
                Klang.safari ? this._fmGain.gain.setTargetValueAtTime(this._fmAmount * this._fmSustain, when, this._fmDecay) : this._fmGain.gain.setTargetAtTime(this._fmAmount * this._fmSustain, when, this._fmDecay);
            };
            return SmattrKick2;
        })();        
        /**
        * Plays a synthesized snare drum sound.
        * @param {Object} data Configuration data.
        * @param {number} startTime When to start oscs
        * @param {AudioNode} destination Where to route output
        * @constructor
        */
        var SmattrSnare = (function () {
            function SmattrSnare(data, startTime, destination) {
                this._noiseVolume = data.noise_volume != undefined ? data.noise_volume : 0.6;
                this._noiseHold = data.noise_hold != undefined ? data.noise_hold : 0.05;
                this._noiseDecay = data.noise_decay != undefined ? data.noise_decay : 0.06;
                this._sineVolume = data.sine_volume != undefined ? data.sine_volume : 0.5;
                this._sineDecay = data.sine_decay != undefined ? data.sine_decay : 0.05;
                this._noise = generateNoiseBuffer(undefined, 1);
                this._noiseGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._sine = Klang.context.createOscillator();
                this._sineGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._hpf = Klang.context.createBiquadFilter();
                this._lpf = Klang.context.createBiquadFilter();
                this._outGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._sine.frequency.value = data.sine_frequency != undefined ? data.sine_frequency : 123;
                this._outGain.gain.value = data.volume != undefined ? data.volume : 1.0;
                if(Klang.safari) {
                    this._hpf.type = 0;
                } else {
                    this._hpf.type = "highpass";
                }
                this._hpf.frequency.value = data.highpass_freq != undefined ? data.highpass_freq : 20;
                this._hpf.Q.value = data.highpass_Q != undefined ? data.highpass_Q : 0.05;
                if(Klang.safari) {
                    this._lpf.type = 0;
                } else {
                    this._lpf.type = "lowpass";
                }
                this._lpf.frequency.value = data.lowpass_freq != undefined ? data.lowpass_freq : 6500;
                this._lpf.Q.value = data.lowpass_Q != undefined ? data.lowpass_Q : 0.01;
                this._noise.connect(this._noiseGain);
                this._sine.connect(this._sineGain);
                this._noiseGain.connect(this._hpf);
                this._sineGain.connect(this._hpf);
                this._hpf.connect(this._lpf);
                this._lpf.connect(this._outGain);
                this._outGain.connect(destination);
                this._noiseGain.gain.value = 0.0;
                this._sineGain.gain.value = 0.0;
                Klang.safari ? this._noise.noteOn(startTime) : this._noise.start(startTime);
                Klang.safari ? this._sine.noteOn(startTime) : this._sine.start(startTime);
            }
            SmattrSnare.prototype.play = /**
            * Plays the sound
            * @param {number} velocity Note velocity
            * @param {number} when When to play
            */
            function (velocity, when) {
                // noise gain
                this._noiseGain.gain.setValueAtTime(this._noiseVolume, when);
                Klang.safari ? this._noiseGain.gain.setTargetValueAtTime(0.0, when + this._noiseHold, this._noiseDecay) : this._noiseGain.gain.setTargetAtTime(0.0, when + this._noiseHold, this._noiseDecay);
                // sine gain
                this._sineGain.gain.setValueAtTime(this._sineVolume, when);
                Klang.safari ? this._sineGain.gain.setTargetValueAtTime(0.0, when, this._sineDecay) : this._sineGain.gain.setTargetAtTime(0.0, when, this._sineDecay);
            };
            return SmattrSnare;
        })();        
        /**
        * Plays a synthesized hihat drum sound.
        * @param {Object} data Configuration data.
        * @param {number} startTime When to start oscs
        * @param {AudioNode} destination Where to route output
        * @constructor
        */
        var SmattrHihat = (function () {
            function SmattrHihat(data, startTime, destination) {
                this._noiseVolume = data.noise_volume != undefined ? data.volume : 0.6;
                this._noiseAttack = data.noise_attack != undefined ? data.noise_attack : 0.0005;
                this._noiseHold = data.noise_hold != undefined ? data.noise_hold : 0.005;
                this._noiseDecay = data.noise_decay != undefined ? data.noise_decay : 0.03;
                this._noise = generateNoiseBuffer(undefined, 1);
                this._noiseGain = Klang.safari ? Klang.context.createGainNode() : Klang.context.createGain();
                this._hpf = Klang.context.createBiquadFilter();
                if(Klang.safari) {
                    this._hpf.type = 0;
                } else {
                    this._hpf.type = "highpass";
                }
                this._hpf.frequency.value = data.highpass_freq != undefined ? data.highpass_freq : 6500;
                this._hpf.Q.value = data.highpass_Q != undefined ? data.highpass_Q : 0.05;
                this._noise.connect(this._noiseGain);
                this._noiseGain.connect(this._hpf);
                this._hpf.connect(destination);
                this._noiseGain.gain.value = 0.0;
                Klang.safari ? this._noise.noteOn(startTime) : this._noise.start(startTime);
            }
            SmattrHihat.prototype.play = /**
            * Plays the sound
            * @param {number} velocity Note velocity
            * @param {number} when When to play
            */
            function (velocity, when) {
                // noise gain
                this._noiseGain.gain.cancelScheduledValues(when);
                this._noiseGain.gain.setValueAtTime(0.0, when);
                this._noiseGain.gain.linearRampToValueAtTime(this._noiseVolume, when + this._noiseAttack);
                Klang.safari ? this._noiseGain.gain.setTargetValueAtTime(0.0, when + this._noiseAttack + this._noiseHold, this._noiseDecay) : this._noiseGain.gain.setTargetAtTime(0.0, when + this._noiseAttack + this._noiseHold, this._noiseDecay);
            };
            return SmattrHihat;
        })();        
        /**
        * Plays synthesized drums based on midi events.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        * @extends {Klang.Model.Synth}
        */
        var Smattr = (function (_super) {
            __extends(Smattr, _super);
            function Smattr(data, name) {
                        _super.call(this, data, name);
                var startTime = Klang.context.currentTime + Util.OSC_START_DELAY;// Tid då alla oscillatorer ska starta, för att de ska startas exakt samtidigt
                
                this._sounds = {
                };
                for(var ix = 0, len = data.sounds.length; ix < len; ix++) {
                    var sound = data.sounds[ix];
                    switch(sound.drum_type) {
                        case "SmattrKick1":
                            this._sounds[sound.note] = new SmattrKick1(sound, startTime, this._output);
                            break;
                        case "SmattrKick2":
                            this._sounds[sound.note] = new SmattrKick2(sound, startTime, this._output);
                            break;
                        case "SmattrSnare":
                            this._sounds[sound.note] = new SmattrSnare(sound, startTime, this._output);
                            break;
                        case "SmattrHihat":
                            this._sounds[sound.note] = new SmattrHihat(sound, startTime, this._output);
                            break;
                    }
                }
            }
            Smattr.prototype.handleMidiEvent = /**
            * Handles a midi event.
            * @param {any} event Midi event to handle.
            * @param {number} when Time when the event should be handled, in Web Audio context time.
            */
            function (midiEvent, when, transpose) {
                when = when || Klang.context.currentTime;
                transpose = transpose || 0;
                if(midiEvent.type == "channel") {
                    var sound = midiEvent.noteNumber;
                    if(this._sounds[sound]) {
                        if(midiEvent.subtype == "noteOn") {
                            this._sounds[sound].play(midiEvent.velocity, when);
                        }
                        //else if (midiEvent.subtype == "noteOff") {
                        //}
                                            }
                }
                return this;
            };
            Smattr.prototype.stop = /**
            * Cancels playback of this synth immediately.
            */
            function (when) {
                when = when || Util.now();
            };
            Smattr.prototype.deschedule = /**
            * Deschedules scheduled playback.
            */
            function () {
                return this;
            };
            return Smattr;
        })(Synth);
        Model.Smattr = Smattr;        
        /**
        * Enum for pattern syncing methods.
        * @enum
        */
        (function (SyncType) {
            SyncType._map = [];
            SyncType._map[0] = "Restart";
            SyncType.Restart = 0;// Start from beginning
            
            SyncType._map[1] = "Playing";
            SyncType.Playing = 1;// Sync with the patterns playing of those you're starting.
            
            SyncType._map[2] = "All";
            SyncType.All = 2;// Sync with all playing patterns
            
            SyncType._map[3] = "Continue";
            SyncType.Continue = 3;// Continues if already playing.
            
        })(Model.SyncType || (Model.SyncType = {}));
        var SyncType = Model.SyncType;
        /**
        * Handles syncing of patterns.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        */
        var Sequencer = (function () {
            function Sequencer(data, name) {
                // Tid i sekunder att schemalägga framtiden
                this._scheduler = null;
                // Handle till setTimeout
                this._started = false;
                this._bpm = 120;
                this._barLength = 4;
                this._beatLength = 1;
                this._resolution = 0.25;
                // Timestamp i Web Audio Context då nästa steg sker
                this._currentStep = 0;
                // Nuvarande steg
                this._paused = false;
                this._name = name;
                this._type = data.type;
                this._bpm = data.bpm || 120;
                this._barLength = data.measure_length;
                this._beatLength = data.beat_length;
                this._registeredPatterns = [];
                this._registeredSynths = [];
                this._syncHandler = new SyncHandler();
                this._syncedObjects = [];
                Core.instance.pushToPreLoadInitStack(this);
            }
            Sequencer.prototype.init = /**
            * Initializes the sequencer
            */
            function () {
                this._lookahead = Core.settings.sequencer_lookahead || 50.0;
                this._scheduleAheadTime = Core.settings.sequencer_schedule_ahead || 0.2;
                if(Klang.isIOS) {
                    this._scheduleAheadTime = Core.settings.sequencer_schedule_ahead_ios || 5;
                }
                this._resolution = Core.settings.sequencer_resolution || 0.25;
            };
            Sequencer.prototype.startScheduler = /**
            * Steps the sequenver forward and schedules the next step.
            * @private
            */
            function () {
                if(!this._paused && Klang.context.currentTime !== 0) {
                    this._lastScheduleLoopTime = Klang.context.currentTime;
                    while(this._scheduleTime < Klang.context.currentTime + this._scheduleAheadTime) {
                        //if (this._scheduleTime>= context.currentTime && context.currentTime !== 0) {
                        // Notifiera Patterns
                        for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                            this._registeredPatterns[ix].update(this._currentStep, this._scheduleTime);
                        }
                        // Notifiera Synths
                        for(var jx = 0, len = this._registeredSynths.length; jx < len; jx++) {
                            this._registeredSynths[jx].update(this._currentStep, this._scheduleTime);
                        }
                        // Gå till nästa step
                        this._currentStep += this._resolution;
                        this._scheduleTime += (60.0 / this._bpm) * this._resolution;
                        this._syncHandler.update(this._resolution);
                        /*}else {
                        this._scheduleTime = context.currentTime;
                        //console.log("*** this._scheduleTime", this._scheduleTime, "context.currentTime", context.currentTime, "this._scheduleAheadTime", this._scheduleAheadTime);
                        }*/
                                            }
                }
                // Hax för att kunna anropa en privat funktion med setTimeout
                var _this = this;
                this._scheduler = setTimeout(function () {
                    _this.startScheduler();
                }, _this._lookahead);
            };
            Sequencer.prototype.start = /**
            * Starts scheduling.
            * @return {Klang.Model.Sequencer}
            */
            function () {
                this._started = true;
                this._scheduleTime = Klang.context.currentTime;
                clearTimeout(this._scheduler);
                this.startScheduler();
                return this;
            };
            Sequencer.prototype.pause = /**
            * Pauses playback.
            * @return {Klang.Model.Sequencer} Self
            */
            function () {
                this._paused = true;
                this._pauseOffset = this._scheduleTime - Util.now();
                for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                    this._registeredPatterns[ix].pause();
                }
                return this;
            };
            Sequencer.prototype.unpause = /**
            * Resumes playback.
            * @return {Klang.Model.Sequencer} Self
            */
            function () {
                this._paused = false;
                this._scheduleTime = Util.now() + this._pauseOffset;
                for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                    this._registeredPatterns[ix].unpause();
                }
                return this;
            };
            Sequencer.prototype.reschedule = /**
            * Removes everything that has been scheduled to play, and reschedules it.
            * @return {Klang.Model.Sequencer} Self
            */
            function () {
                clearTimeout(this._scheduler)// för att en ny schemaläggning inte ska ske mitt i reschedule
                ;
                var scheduled = this._scheduleTime - Klang.context.currentTime;// hur lång tid som schemalaggts
                
                var resolutionTime = this.getNoteTime(this._resolution);
                var scheduleOffset = scheduled > this._scheduleAheadTime ? (scheduled - this._scheduleAheadTime) : (scheduled - (this._scheduleAheadTime - resolutionTime));
                var realScheduledSteps = ((scheduled - scheduled % resolutionTime) / resolutionTime) / (this._beatLength / this._resolution);
                var scheduledSteps = (this._scheduleAheadTime / resolutionTime) / (this._beatLength / this._resolution);// antal steg som schemalaggts
                
                this._scheduleTime = Klang.context.currentTime + scheduleOffset// ny tid för nästa steg
                ;
                if(realScheduledSteps < scheduledSteps) {
                    this._scheduleTime -= resolutionTime;
                }
                this._currentStep -= scheduledSteps;
                // currentstep borde inte bli NaN.......
                if(isNaN(this._currentStep) || this._currentStep < 0) {
                    this._currentStep = 0;
                }
                // Ta bort schemaläggning som redan gjorts
                for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                    this._registeredPatterns[ix].deschedule(scheduledSteps);
                }
                // Kör schemaläggning direkt
                this.startScheduler();
                return this;
            };
            Sequencer.prototype.stop = /**
            * Stop the sequencer.
            * @return {Klang.Model.Sequencer} Self
            */
            function () {
                this._started = false;
                clearTimeout(this._scheduler);
                this._scheduler = null;
                return this;
            };
            Sequencer.prototype.stopAll = /**
            * Stops all synced patterns.
            * @param {Object} params Stop options.
            * @param {Array.<Klang.Model.Pattern>} exceptions Patterns that should not be stopped.
            * @return {Klang.Model.Sequencer} Self
            */
            function (params) {
                var exceptions = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    exceptions[_i] = arguments[_i + 1];
                }
                var beat = params.beat != undefined ? params.beat : 4;
                var fadeTime = params.fadeTime || 1;
                var forceFade = params.forceFade || false;
                var wait = params.wait || 0;
                //this.reschedule();
                for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                    if(exceptions.indexOf(this._registeredPatterns[ix]) == -1) {
                        this._registeredPatterns[ix].forceFade = forceFade;
                        this._registeredPatterns[ix].stop(beat, true, fadeTime, wait);
                    }
                }
                return this;
            };
            Sequencer.prototype.restart = /**
            * Resets the sequencer to step 0.
            * @return {Klang.Model.Sequencer} Self
            */
            function () {
                this._currentStep = 0;
                return this;
            };
            Sequencer.prototype.registerPattern = /**
            * Registers a pattern for updates from this sequencer.
            * @param {Pattern} pattern Pattern that should receive updates.
            * @return {Klang.Model.Sequencer} Self
            */
            function (pattern) {
                this._registeredPatterns.push(pattern);
                return this;
            };
            Sequencer.prototype.unregisterPattern = /**
            * Unregisters a pattern for updates from this sequencer.
            * @param {Pattern} pattern Pattern that should stop receiving updates.
            * @return {Klang.Model.Sequencer} Self
            */
            function (pattern) {
                var index = this._registeredPatterns.indexOf(pattern);
                this._registeredPatterns.splice(index, 1);
                return this;
            };
            Sequencer.prototype.registerSynth = /**
            * Registers a synth for updates from this sequencer.
            * @param {Synth} synth Synth that should receive updates.
            * @return {Klang.Model.Sequencer} Self
            */
            function (synth) {
                this._registeredSynths.push(synth);
                return this;
            };
            Sequencer.prototype.unregisterSynth = /**
            * Unregisters a synth for updates from this sequencer.
            * @param {Synth} synth Synth that should stop receiving updates.
            * @return {Klang.Model.Sequencer} Self
            */
            function (synth) {
                var index = this._registeredPatterns.indexOf(synth);
                this._registeredSynths.splice(index, 1);
                return this;
            };
            Sequencer.prototype.sync = /**
            * Schedules the execution of a process synced to this sequencer.
            * @param {Process} process The process to schedule.
            * @param {number} beatModifier When to run the process.
            * @param {Array.<Object>} args Arguments to send to the process.
            * @return {Klang.Model.Sequencer} Self
            */
            function (process, beatModifier, args) {
                return this.syncInSteps(process, this.getStepsToNext(this.beatLength * beatModifier), args);
            };
            Sequencer.prototype.syncInSteps = /**
            * Schedules the execution of a process synced to this sequencer.
            * @param {Process} process The process to schedule.
            * @param {number} steps In how many steps to run the process
            * @param {Array.<Object>} args Arguments to send to the process.
            * @return {Klang.Model.Sequencer} Self
            */
            function (process, steps, args) {
                // Starta sequencern om den inte är igång
                if(!this._started) {
                    this.start();
                }
                var scheduleTime = this.getNoteTime(steps) + this._scheduleTime;
                //lägger alltid in sceduleTime som sista argument
                if(!args) {
                    args = [
                        scheduleTime
                    ];
                } else if(args.length) {
                    args.push(scheduleTime);
                }
                // Skapa en countdown för när actionen ska köras
                this._syncHandler.addSyncCountdown(new SyncCountdown(steps, process, args));
                return this;
            };
            Sequencer.prototype.syncPattern = /**
            * Schedules playback of a pattern.
            * @param {Object} params Sync options.
            * @param {Array.<Pattern>} patterns The patterns to start.
            * @return {Klang.Model.Sequencer} Self
            */
            function (params) {
                var patterns = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    patterns[_i] = arguments[_i + 1];
                }
                // Starta sequencern om den inte är igång
                var beat = params.beat;
                var fadeIn = params.fadeIn || false;
                var duration = params.duration || 1;
                var absolute = params.absolute == undefined ? false : params.absolute;
                var syncType = params.syncType != undefined ? params.syncType : 3;
                var wait = params.wait || 0;
                var first;
                if(!this._started) {
                    this.start();
                    steps = beat = 0;
                    first = true;
                }
                /*
                Oklart om syncstep funkar för MidiPatterns.
                Eftersom MidiPatterns inte väntar ut takten utan går direkt till state 4.
                Syncstep synkar bara om patternet är i state 1 eller 2.
                */
                var syncStep;
                var restart = false;
                if(syncType === SyncType.Restart) {
                    // 0
                    syncStep = 0;
                    restart = true;
                } else if(syncType === SyncType.Playing) {
                    // 1
                    var longest = 0;
                    var longestId = -1;
                    for(var ix = 0, len = patterns.length; ix < len; ix++) {
                        if(patterns[ix].state === 1) {
                            if(patterns[ix].length > longest) {
                                longest = patterns[ix].length;
                                longestId = ix;
                            }
                        }
                    }
                    var nextBar = 0;
                    if(longestId > -1) {
                        nextBar = patterns[longestId].getNextBar(beat);
                    }
                    syncStep = nextBar * beat;
                    if(nextBar > 0 && wait > 0) {
                        syncStep += wait;
                    }
                } else if(syncType === SyncType.All) {
                    // 2
                    var longest = 0;
                    var longestId = -1;
                    for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                        if(this._registeredPatterns[ix].state === 1 || this._registeredPatterns[ix].state === 2) {
                            if(this._registeredPatterns[ix].length > longest) {
                                longest = this._registeredPatterns[ix].length;
                                longestId = ix;
                            }
                        }
                    }
                    var nextBar = 0;
                    if(longestId > -1) {
                        nextBar = this._registeredPatterns[longestId].getNextBar(beat);
                    }
                    syncStep = nextBar * beat;
                } else if(syncType === SyncType.Continue) {
                    // 3
                    syncStep = 0;
                    restart = false;
                }
                var steps;
                if(absolute != false) {
                    if(typeof absolute == "number") {
                        steps = this.getStepsToNext(this.beatLength * absolute) + this.beatLength * beat;
                    } else {
                        steps = this.beatLength * beat;
                    }
                } else {
                    if(beat > 0) {
                        steps = this.getStepsToNext(this.beatLength * beat);
                    } else if(beat == 0) {
                        steps = 0;
                    }
                }
                if(wait > 0) {
                    steps += wait;
                }
                for(var ix = 0, len = patterns.length; ix < len; ix++) {
                    patterns[ix].prePlaySchedule(steps, syncStep, restart, fadeIn, duration);
                }
                // Fullösning för att första patternet ska starta direkt.
                // TODO: fixa
                if(first) {
                    // copy-pasta från reschedule
                    var scheduled = this._scheduleTime - Klang.context.currentTime;// hur lång tid som schemalaggts
                    
                    var resolutionTime = this.getNoteTime(this._resolution);
                    var scheduleOffset = scheduled > this._scheduleAheadTime ? (scheduled - this._scheduleAheadTime) : (scheduled - (this._scheduleAheadTime - resolutionTime));
                    this._scheduleTime = Klang.context.currentTime + scheduleOffset;
                    this._currentStep = patterns[0]._currentStep;
                    first = false;
                } else if(this._scheduleAheadTime > 0.5) {
                    this.reschedule();
                }
                return this;
            };
            Sequencer.prototype.registerBPMSync = /**
            * Registers an object to be notified when the sequencers updates it's BPM.
            * @param {Object} obj Object to notify.
            * @return {Klang.Model.Sequencer} Self
            */
            function (obj) {
                if(this._syncedObjects.indexOf(obj) == -1) {
                    this._syncedObjects.push(obj);
                }
                return this;
            };
            Sequencer.prototype.getStepsToNext = /**
            * Calculate steps to the next specified beat.
            * @param {number} x Beat to calculate steps to
            * @return {number} Number calculated steps
            */
            function (x) {
                return x - (this._currentStep % x);
            };
            Sequencer.prototype.getNoteTime = /**
            * Gets the length of a note in seconds in this sequencer's tempo.
            * @param {number} note
            * @return {number} Length in seconds.
            */
            function (note) {
                if(note == undefined) {
                    note = 1;
                }
                return (60 / this._bpm) * note;
            };
            Sequencer.prototype.getBeatTime = /**
            * Get time when the specified beat will occur.
            * @param {number} x Beat to calculate time to.
            * @return {number} When the beat will occur.
            */
            function (x) {
                return this.getNoteTime(this.getStepsToNext(x)) + Util.now();
            };
            Object.defineProperty(Sequencer.prototype, "started", {
                get: /**
                * GETTERS / SETTERS
                *********************/
                /**
                * Whether the sequencer has started or not.
                * @type {boolean}
                */
                function () {
                    return this._started;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "paused", {
                get: /**
                * Whether the sequencer is paused or not.
                * @type {boolean}
                */
                function () {
                    return this._paused;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "bpm", {
                get: /**
                * The sequencer's current BPM.
                * @type {number}
                */
                function () {
                    return this._bpm;
                },
                set: function (value) {
                    this._bpm = value;
                    // Uppdatera bpm i midipatterns
                    for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                        if(this._registeredPatterns[ix]._type == "MidiPattern") {
                            this._registeredPatterns[ix].recalculateBPM(this._bpm);
                        }
                    }
                    // Uppdatera bpm i synkade objekt
                    for(var ix = 0, len = this._syncedObjects.length; ix < len; ix++) {
                        this._syncedObjects[ix].updateSync(this._bpm);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "scale", {
                set: /**
                * The scale for all registered midi patterns.
                * @type {string}
                */
                function (scale) {
                    // Uppdatera bpm i midipatterns
                    for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                        if(this._registeredPatterns[ix]._type == "MidiPattern") {
                            this._registeredPatterns[ix].scale = scale;
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "customScale", {
                set: /**
                * The custom scale for all registered midi patterns.
                * @type {Object}
                */
                function (obj) {
                    // Uppdatera bpm i midipatterns
                    for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                        if(this._registeredPatterns[ix]._type == "MidiPattern") {
                            this._registeredPatterns[ix].customScale = obj;
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "transpose", {
                set: /**
                * The transposition for all registered midi patterns.
                * @type {number}
                */
                function (transpose) {
                    // Uppdatera bpm i midipatterns
                    for(var ix = 0, len = this._registeredPatterns.length; ix < len; ix++) {
                        if(this._registeredPatterns[ix]._type == "MidiPattern") {
                            if(transpose === 0) {
                                this._registeredPatterns[ix].resetTranspose();
                            } else {
                                this._registeredPatterns[ix].transpose += transpose;
                            }
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "resolution", {
                get: /**
                * The sequencer's resolution.
                * @type {number}
                */
                function () {
                    return this._resolution;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "barLength", {
                get: /**
                * Length of a bar.
                * @type {number}
                */
                function () {
                    return this._barLength;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "beatLength", {
                get: /**
                * Length of a beat.
                * @type {number}
                */
                function () {
                    return this._beatLength;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Sequencer.prototype, "currentStep", {
                get: /**
                * The sequencer's current step.
                * @type {number}
                */
                function () {
                    return this._currentStep;
                },
                enumerable: true,
                configurable: true
            });
            return Sequencer;
        })();
        Model.Sequencer = Sequencer;        
        /**
        * Handles syncing porocesses to a sequencer.
        * @param {number} targetStep When to run the process.
        * @param {Klang.Model.Process} What process to run.
        * @param {Array} Arguments for the process.
        * @constructor
        */
        var SyncCountdown = (function () {
            function SyncCountdown(targetStep, process, args) {
                this._currentStep = 0;
                this._targetStep = targetStep;
                this._process = process;
                this._args = args;
            }
            SyncCountdown.prototype.advance = /**
            * Step the countdown forward.
            * @param {number} step
            */
            function (step) {
                this._currentStep += step;
            };
            SyncCountdown.prototype.performAction = /**
            * Runs the process.
            */
            function () {
                if(typeof this._process == "string") {
                    new Function("Core", "Model", "Util", "args", this._process)(Core, Model, Util, this._args);
                } else {
                    this._process.start(this._args);
                }
            };
            Object.defineProperty(SyncCountdown.prototype, "finished", {
                get: /**
                * if the countdown has finished.
                * @type {boolean}
                */
                function () {
                    return this._currentStep >= this._targetStep;
                },
                enumerable: true,
                configurable: true
            });
            return SyncCountdown;
        })();
        Model.SyncCountdown = SyncCountdown;        
        /**
        * Handles all sync countdowns.
        * @constructor
        */
        var SyncHandler = (function () {
            function SyncHandler() {
                this._timers = [];
            }
            SyncHandler.prototype.addSyncCountdown = /**
            * Adds a sync countdown to this sync handler.
            * @param {number} countdown
            */
            function (countdown) {
                this._timers.push(countdown);
            };
            SyncHandler.prototype.update = /**
            * Updates all sync countdowns.
            * @param {number} step
            */
            function (step) {
                // Uppdatera alla räknare
                for(var ix = 0; ix < this._timers.length; ix++) {
                    var countdown = this._timers[ix];
                    countdown.advance(step);
                    if(countdown.finished) {
                        countdown.performAction();
                        // Ta bort räknaren och justera ix i loopen för att inte hoppa över något index
                        this._timers.splice(ix, 1);
                        ix--;
                    }
                }
            };
            return SyncHandler;
        })();
        Model.SyncHandler = SyncHandler;        
        /**
        * Handles timing that is not synced to a sequencer.
        * @constructor
        */
        var TimeHandler = (function () {
            function TimeHandler() {
                this._updateTime = Core.settings.timehandler_lookahead;
                this._callbacks = [];
            }
            TimeHandler.inst = null;
            Object.defineProperty(TimeHandler, "instance", {
                get: /**
                * The single instance.
                * @type {Klang.Model.TimeHandler}
                */
                function () {
                    if(TimeHandler.inst == null) {
                        TimeHandler.inst = new TimeHandler();
                    }
                    return TimeHandler.inst;
                },
                enumerable: true,
                configurable: true
            });
            TimeHandler.prototype.startScheduler = /**
            * Start the time handling scheduler.
            * @private
            */
            function () {
                // Om inga callbacks finns kvar stängs schemaläggaren av
                if(this._callbacks.length > 0) {
                    var currentTime = Klang.context.currentTime;
                    var deltaTime = currentTime - this._lastTime;
                    // Gå igenom alla callbacks och anropa funktionen om det är dags
                    for(var ix = 0; ix < this._callbacks.length; ix++) {
                        var callback = this._callbacks[ix];
                        callback.timePassed += deltaTime;
                        if(callback.timePassed >= callback.targetTime) {
                            callback.obj[callback.func]();
                            // Ta bort callbacken och justera ix i loopen för att inte hoppa över något index
                            this._callbacks.splice(ix, 1);
                            ix--;
                        }
                    }
                    this._lastTime = currentTime;
                    var _this = this;
                    this._scheduler = setTimeout(function () {
                        _this.startScheduler();
                    }, _this._updateTime);
                } else {
                    this.stop();
                }
            };
            TimeHandler.prototype.start = /**
            * Starts the scheduler.
            */
            function () {
                this._started = true;
                this._lastTime = Klang.context.currentTime;
                clearTimeout(this._scheduler);
                this.startScheduler();
            };
            TimeHandler.prototype.stop = /**
            * Stops the scheduler.
            */
            function () {
                this._started = false;
                clearTimeout(this._scheduler);
                this._scheduler = null;
            };
            TimeHandler.prototype.registerMethodCallback = /**
            * Registers a callback for a time.
            * @param {Object} obj Target object.
            * @param {Function} func Callback function.
            * @param {number} targetTime Target time.
            */
            function (obj, func, targetTime) {
                this._callbacks.push({
                    obj: obj,
                    func: func,
                    timePassed: 0,
                    targetTime: targetTime
                });
                if(!this._started) {
                    this.start();
                }
            };
            TimeHandler.prototype.removeMethodCallback = /**
            * Removes a previously added callback.
            * @param {Object} obj Obejct to remove.
            * @param {function} func Function to remove.
            */
            function (obj, func) {
                for(var ix = 0, len = this._callbacks.length; ix < len; ix++) {
                    var callback = this._callbacks[ix];
                    if(callback.obj == obj && callback.func == func) {
                        this._callbacks.splice(ix, 1);
                        return;
                    }
                }
            };
            return TimeHandler;
        })();
        Model.TimeHandler = TimeHandler;        
        /**
        * Base class for all process types. Processes runs a series of actions.
        * @param {Object} data Configuration data.
        * @constructor
        */
        var Process = (function () {
            function Process(data) {
                this._vars = data.vars;
                Core.instance.pushToPreLoadInitStack(this);
            }
            Process.prototype.init = /**
            * Initializes the process by getting references for the required variables.
            */
            function () {
                // Gå igenom listan av variabelnamn och hämta referenser till objekten
                for(var ix = 0, len = this._vars.length; ix < len; ix++) {
                    var n = this._vars[ix];
                    this._actionData[n] = Core.instance.findInstance(n);
                }
                this._vars = null;
            };
            Process.prototype.start = /**
            * Starts this process.
            * @param {Array.<Object>} args Arguments to pass to the process.
            */
            function (args) {
            };
            Process.prototype.execute = /**
            * Runs the process' actions.
            * @param {string} action Action to run.
            * @param {Array.<Object>} args Arguments to pass to the action.
            */
            function (action, args) {
                // Skapa en anonym funktion och kalla på den direkt.
                // Funktionens kropp är strängen som skickats in som 'action',
                // 'me' och '_args' blir parametrar till funktionen.
                return new Function("Core", "Model", "Util", "me", "args", action)(Core, Model, Util, this._actionData, args);
            };
            return Process;
        })();
        Model.Process = Process;        
        /**
        * Runs actions instantaneously.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        */
        var SimpleProcess = (function (_super) {
            __extends(SimpleProcess, _super);
            function SimpleProcess(data, name) {
                        _super.call(this, data);
                this._name = name;
                this._type = data.type;
                this._action = data.action;
                this._actionData = {
                };
            }
            SimpleProcess.prototype.start = /**
            * Starts this process.
            * @param {Array.<Object>} args Arguments to pass to the process.
            */
            function (args) {
                try  {
                    this.execute(this._action, args);
                } catch (ex) {
                    Klang.err("Klang: error in process '" + this._name + "': " + ex.name + ": " + ex.message);
                }
            };
            return SimpleProcess;
        })(Process);
        Model.SimpleProcess = SimpleProcess;        
        /**
        * Executes a series of actions containing JavaScript code.
        * @param {Object} data Configuration data.
        * @param {string} name Identifying name.
        * @constructor
        */
        var AdvancedProcess = (function (_super) {
            __extends(AdvancedProcess, _super);
            function AdvancedProcess(data, name) {
                        _super.call(this, data);
                // start tid baserad på context-tid
                this._nextStartTime = 0;
                // start tid för nästa loop baserad på context-tid
                this._waitOffset = 0;
                // Totala wait-tiden per loop
                this.SCHEDULE_AHEAD_TIME = 0.2;
                //Tid för att schedulera ljudet
                this._lastTime = 0;
                this._name = name;
                this._type = data.type;
                this._preAction = data.pre_action || null;
                this._actions = data.actions;
                this._currentAction = 0;
                this._started = false;
                this._loop = data.loop != undefined ? data.loop : false;
                this._loopTime = data.loopTime || -1;
                this._actionData = {
                    process: this
                };
            }
            AdvancedProcess.prototype.start = /**
            * Starts this process.
            * @param {Array.<Object>} args Arguments to pass to the process.
            */
            function (args) {
                // avancerad process fuckas upp vid lång scroll på ios
                if(Klang.isIOS) {
                    return;
                }
                try  {
                    this._args = args;
                    this._currentAction = 0;
                    this._execTime = 0;
                    this._startTime = Klang.context.currentTime;
                    this._nextStartTime = this._startTime;
                    // Om preaction är av typen exec körs scriptet
                    if(this._preAction) {
                        if(this._preAction.operation == "exec") {
                            this.execute(this._preAction.script, this._args);
                        } else // Om det är en wait registreras cont som callback i TimeHandler och processen avbryts
                        if(this._preAction.operation == "wait") {
                            this._execTime = this.execute(this._preAction.script, this._args);
                            this._waitOffset += this._execTime;
                            if(this._execTime >= this.SCHEDULE_AHEAD_TIME) {
                                TimeHandler.instance.registerMethodCallback(this, "cont", this._execTime - (this.SCHEDULE_AHEAD_TIME / 2));
                            } else {
                                this.cont();
                            }
                            return;
                        }
                    }
                    this._started = true;
                    //Om ingen preaction kör igång direkt.
                    this.cont();
                } catch (ex) {
                    Klang.err("Klang: error in process '" + this._name + "': " + ex.name + ": " + ex.message);
                }
            };
            AdvancedProcess.prototype.cont = /**
            * Continues execution of this process after it has been paused.
            */
            function () {
                //sparar tiden som nästa exec ska köras på som en variabel i actionData
                this._actionData["execTime"] = this._nextStartTime + this._waitOffset;
                for(var len = this._actions.length; this._currentAction < len; this._currentAction++) {
                    // Avsluta om started har ändrats till false
                    if(!this._started) {
                        return;
                    }
                    var action = this._actions[this._currentAction];
                    // Om denna action är av typen exec körs scriptet
                    if(action.operation == "exec") {
                        this.execute(action.script, this._args);
                        this._execTime = 0;
                    } else // Om det är en wait registreras cont som callback i TimeHandler och processen avbryts
                    if(action.operation == "wait") {
                        this._execTime = this.execute(action.script, this._args);
                        this._waitOffset += this._execTime;
                        //om tiden är längre än SCHEDULE_AHEAD_TIME görs en timeout, annars fortsätter den schedulera till waitOffset är längre än SCHEDULE_AHEAD_TIME
                        if(this._execTime >= this.SCHEDULE_AHEAD_TIME) {
                            TimeHandler.instance.registerMethodCallback(this, "cont", this._execTime - (this.SCHEDULE_AHEAD_TIME / 2));
                        } else {
                            if(this._waitOffset > this.SCHEDULE_AHEAD_TIME) {
                                this.scheduleLoop(this._waitOffset);
                            } else {
                                this._currentAction++;
                                this.cont();
                            }
                        }
                        this._currentAction++;
                        return;
                    }
                }
                // Kör cont igen om processen ska loopa
                if(this._loop) {
                    if(this._loopTime > 0) {
                        this.scheduleLoop(this._loopTime);
                    } else {
                        this._waitOffset = 0;
                        this._currentAction = 0;
                        this.cont();
                    }
                }
            };
            AdvancedProcess.prototype.scheduleLoop = //kollar hur långt tid  det är kvar till loopTime och gör en timeout 0.1s innan.
            //Man kan specificera en loopTid i json filen som '"loopTime": 2' (sek) eller bara sätta loop till true som innan.
            /**
            * Scheules the looping of this process.
            * @param {number} loopTime Time to loop.
            * @private
            */
            function (loopTime) {
                if(!this._started) {
                    return;
                }
                this._nextStartTime += loopTime// start tid för nästa loop baserad på context tid.
                ;
                var timeTilNext = this._nextStartTime - Klang.context.currentTime;// tid till nästa loop ska starta
                
                var _this = this;
                var loopTimeoutId = setTimeout(function () {
                    _this._waitOffset = 0;
                    _this._currentAction = 0;
                    _this.cont();
                }, (timeTilNext - (this.SCHEDULE_AHEAD_TIME / 2)) * 1000);
            };
            AdvancedProcess.prototype.stop = /**
            * Stops execution of this process.
            */
            function () {
                this._started = false;
                // Ta bort callbacken till metoden cont från TimeHandler
                TimeHandler.instance.removeMethodCallback(this, "cont");
            };
            return AdvancedProcess;
        })(Process);
        Model.AdvancedProcess = AdvancedProcess;        
    })(Model || (Model = {}));
    var Util;
    (function (Util) {
        /** @namespace Klang.Util */ /**
        * Sets the value of an audio param.
        * @param  {number} param What parameter to set.
        * @param  {number} value Value to set the parameter to.
        * @param  {number} when? When the value should be set.
        */
        function setParam(param, value, when) {
            param.setValueAtTime(value, when || Klang.context.currentTime);
        }
        Util.setParam = setParam;
        /**
        * Increments the value of an audio param.
        * @param  {number} param What parameter to increment.
        * @param  {number} value How much to increment the value.
        * @param  {number} when? When the value should be incremented.
        */
        function adjustParam(param, value, when) {
            param.setValueAtTime(param.value + value, when || Klang.context.currentTime);
        }
        Util.adjustParam = adjustParam;
        /**
        * Curves a parameter's value linearly over time.
        * @param  {number} param What parameter to curve.
        * @param  {number} value Target value of the parameter.
        * @param  {number} duration Length of the curve in seconds.
        * @param  {number} when? When the value should be at the target.
        */
        function curveParamLin(param, value, duration, when) {
            when = when || Klang.context.currentTime;
            param.setValueAtTime(param.value, when);
            param.linearRampToValueAtTime(value, Klang.context.currentTime + duration);
        }
        Util.curveParamLin = curveParamLin;
        /**
        * Curves a parameter's value exponentially over time.
        * @param  {number} param What parameter to curve.
        * @param  {number} value Target value of the parameter.
        * @param  {number} duration Length of the curve in seconds.
        * @param  {number} when? When the value should be at the target.
        */
        function curveParamExp(param, value, duration, when) {
            when = when || Klang.context.currentTime;
            param.setValueAtTime(param.value == 0 ? Util.EXP_MIN_VALUE : param.value, when);
            param.exponentialRampToValueAtTime(value, Klang.context.currentTime + duration);
        }
        Util.curveParamExp = curveParamExp;
        /**
        * Curves a parameter's value with a custom curve.
        * @param  {number} param What parameter to curve.
        * @param  {string} curve Curve to use.
        * @param  {number} duration Length of the curve in seconds.
        * @param  {number} when? When the value should be at the target.
        */
        function curveParam(param, curve, duration, when) {
            when = when || Klang.context.currentTime;
            param.setValueCurveAtTime(Util.CUSTOM_CURVES[curve], when, duration);
        }
        Util.curveParam = curveParam;
        Util.CUSTOM_CURVES = {
        };
        function createCurves(data) {
            for(var name in data) {
                var cdata = data[name];
                // Om man anger en array av värden används värdena som en kurva
                if(cdata instanceof Array) {
                    var curve = new Float32Array(cdata.length);
                    for(var ix = 0, len = cdata.length; ix < len; ix++) {
                        curve[ix] = cdata[ix];
                    }
                } else// Annars
                 {
                    if(!cdata.resolution) {
                        cdata.resolution = 1024;
                    }
                    if(!cdata.amplitude) {
                        cdata.amplitude = 1;
                    }
                    if(!cdata.amplitude_offset) {
                        cdata.amplitude_offset = 0;
                    }
                    if(!cdata.phase_offset) {
                        cdata.phase_offset = 0;
                    }
                    if(!cdata.length) {
                        cdata.length = 1;
                    }
                    var curve = new Float32Array(cdata.resolution);
                    if(cdata.curve_type == "sine") {
                        var phase_offset = cdata.phase_offset * Math.PI * 2;
                        var length = cdata.length * Math.PI * 2;
                        for(var ix = 0, len = curve.length; ix < len; ix++) {
                            curve[ix] = cdata.amplitude_offset + Math.sin(phase_offset + (ix / len) * length) * cdata.amplitude;
                        }
                    } else // TODO: Lägg in fasförtjutning och längd
                    if(cdata.curve_type == "saw") {
                        for(var ix = 0, len = curve.length; ix < len; ix++) {
                            curve[ix] = cdata.amplitude_offset + ((len - ix) / len) * cdata.amplitude;
                        }
                    } else if(cdata.curve_type == "inverse-saw") {
                        for(var ix = 0, len = curve.length; ix < len; ix++) {
                            curve[ix] = cdata.amplitude_offset + (ix / len) * cdata.amplitude;
                        }
                    }
                    Util.CUSTOM_CURVES[name] = curve;
                }
            }
        }
        Util.createCurves = createCurves;
        /**
        * Second root of 12
        * @const {Number}
        */
        Util.ROOT12 = 1.059463094359295;// andra roten ur 12
        
        /**
        * Nyquist frequency at sample rate 44100
        * @const {Number}
        */
        Util.NYQUIST_FREQUENCY = 22050;
        /**
        * FFT size when pitch shifting samples.
        * @const {Number}
        */
        Util.PITCH_SHIFT_FFT = 2048;
        /**
        * Value to start from when ramping exponentially instead of 0.
        * @const {Number}
        */
        Util.EXP_MIN_VALUE = 0.0001;
        /**
        * Oscillator start time delay.
        * @const {Number}
        */
        Util.OSC_START_DELAY = 0.005;
        /**
        * Color of the time stamp in debug logs
        * @const {string}
        */
        Util.LOG_TIME_COLOR = "#999999";
        Util.LOG_EVENT_COLOR = "#E075A9";
        Util.LOG_WARN_COLOR = "DarkOrange";
        Util.LOG_ERROR_COLOR = "Red";
        /**
        * Generates a random integer in a range.
        * @param  {number} max Max value to be generated.
        * @param  {number} min? Min value to be generated.
        * @return {number} The randomly generated number.
        */
        function random(max, min) {
            min = min || 1;
            return Math.floor(min + (1 + max - min) * Math.random());
        }
        Util.random = random;
        /**
        * Generates a random float in a range.
        * @param  {number} max max value to be generated.
        * @param  {number} min? Min value to be generated.
        * @return {number} The randomly generated number.
        */
        function randomFloat(max, min) {
            min = min || 1.0;
            return min + (max - min) * Math.random();
        }
        Util.randomFloat = randomFloat;
        /**
        * Eases the change of a numeric value.
        * @param {number} current Current value.
        * @param {number} delta Change of the value to be eased.
        * @param {number} ease Easing factor, defaults to 3.
        * @return {number} Eased value.
        */
        function ease(current, delta, ease) {
            if (typeof ease === "undefined") { ease = 3; }
            return current - (current - delta) / ease;
            //vol -= (vol-speed)/ease
                    }
        Util.ease = ease;
        /**
        * Gets the current web audio api time in seconds.
        * @return {number} The current time.
        */
        function now() {
            return Klang.context.currentTime;
        }
        Util.now = now;
        /**
        * Converts a midi note number to frequency.
        * http://www.dzone.com/snippets/midi-note-number-and-frequency
        * @param {number} note Which note to convert
        * @return {number} The note's frequency.
        */
        function midiNoteToFrequency(note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        }
        Util.midiNoteToFrequency = midiNoteToFrequency;
        /**
        * Converts a frequency to midi note.
        * @param {number} freq Frequency to convert.
        * @return {number} Note number of the frequency.
        */
        function frequencyToMidiNote(freq) {
            return 69 + 12 * Math.log(freq / 440) / Math.log(2);
        }
        Util.frequencyToMidiNote = frequencyToMidiNote;
        /**
        * Returns the correct filter type for the current browser;
        * @param  {Object} filterType Filter type to check
        * @return {Object} Filter types matching the browser's capabilities.
        */
        function safeFilterType(filterType) {
            if(filterType == undefined) {
                if(Klang.safari) {
                    return 0;
                } else {
                    return "lowpass";
                }
            }
            // firefox does not handle filter type as number
            if(Klang.browser == "Firefox") {
                if(typeof filterType == "number") {
                    switch(filterType) {
                        case 0:
                            return "lowpass";
                        case 1:
                            return "highpass";
                        case 2:
                            return "bandpass";
                        case 3:
                            return "lowshelf";
                        case 4:
                            return "highshelf";
                        case 5:
                            return "peaking";
                        case 6:
                            return "notch";
                        case 7:
                            return "allpass";
                        default:
                            return "lowpass";
                    }
                } else {
                    return filterType;
                }
            } else // old safari does not handle filter type as string
            if(Klang.safari) {
                if(typeof filterType == "string") {
                    switch(filterType) {
                        case "lowpass":
                            return 0;
                        case "highpass":
                            return 1;
                        case "bandbass":
                            return 2;
                        case "lowshelf":
                            return 3;
                        case "highshelf":
                            return 4;
                        case "peaking":
                            return 5;
                        case "notch":
                            return 6;
                        case "allpass":
                            return 7;
                        default:
                            return 0;
                    }
                } else {
                    return filterType;
                }
            }
            // other implementations are fine with either
            return filterType;
        }
        Util.safeFilterType = safeFilterType;
        /**
        * Checks if the user is on a mobile device.
        * @return {boolean} True if the user is on a mobile.
        */
        function checkMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }
        Util.checkMobile = checkMobile;
        /**
        * Checks if the user is on an iOS device.
        * @return {boolean} True if the user is using iOS
        */
        function checkIOS() {
            return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
        }
        Util.checkIOS = checkIOS;
        /**
        * Sets whether or not to fade out audio when window loses focus.
        * @param {boolean} state Fade state
        */
        function setBlurFadeOut(state) {
            Core.instance.blurFadeOut = state;
        }
        Util.setBlurFadeOut = setBlurFadeOut;
    })(Util || (Util = {}));
})(window.Klang || (window.Klang = {}));
})();
