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

// mixin to add chromecast support to santa-app

var chromecastMixin = {
  // JSON.parse(event.data).button values are "left", "right", "up",
  // "down", "enter", "back", "play", and "pause"
  /**
   * Mapping of event data values to KeyboardEvent properties.
   * @private {!Object<{keyIdentifier: string, key: string}>}
   */
  CAST_KEY_MAPPING_: {
    left: {
      keyIdentifier: 'Left',
      key: 'ArrowLeft'
    },
    right: {
      keyIdentifier: 'Right',
      key: 'ArrowRight'
    },
    up: {
      keyIdentifier: 'Up',
      key: 'ArrowUp'
    },
    down: {
      keyIdentifier: 'Down',
      key: 'ArrowDown'
    },
    enter: {
      keyIdentifier: 'Enter',
      key: 'Enter'
    },
    back: {
      keyIdentifier: 'U+001B',
      key: 'Esc'
    }
  },

  initChromecast: function() {
    // TODO(bckenny): remove noisy chromecast debugging logging
    // dynamically import the Cast Reciever SDK if in chromecast mode
    var sdkImportPath = this.resolvePath('../../js/third_party/chromecastsdk.html');
    Polymer.import([sdkImportPath], function(e) {
      // `cast` is added to global scope by SDK
      var castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
      console.log('Starting Cast Receiver Manager');
      castReceiverManager.onReady = function(event) {
        console.log('Received Cast Ready event: ' + JSON.stringify(event.data));
        castReceiverManager.setApplicationState('Santa Tracker');
      };
      castReceiverManager.onSenderConnected = function(event) {
        console.log('Received Cast Sender Connected event: ' + event.data);
        console.log(castReceiverManager.getSender(event.data).userAgent);

        // app starts with 'play' button visible, but need pause as the start state
        // TODO(bckenny): this should possibly available external to santaApp, to
        // allow games to set the start state
        messageBus.broadcast('{"button":"play"}');
      };
      castReceiverManager.onSenderDisconnected = function(event) {
        console.log('Received Cast Sender Disconnected event: ' + event.data);
        if (castReceiverManager.getSenders().length === 0 &&
          event.reason ===
              cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
            window.close();
        }
      };
      castReceiverManager.onSystemVolumeChanged = function(event) {
        console.log('Received Cast System Volume Changed event: ' +
            event.data.level + ' ' + event.data.muted);
      };

      var messageBus = castReceiverManager
          .getCastMessageBus('urn:x-cast:com.google.cast.santatracker');
      messageBus.onMessage = function(event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);

        // if mappable to a key, fire KeyboardEvent on current scene
        // since this is Chromecast only, we can assume it supports the modern
        // KeyboardEvent constructor and skip the initKeyboardEvent silliness
        var data = JSON.parse(event.data);
        var keyDetails = this.CAST_KEY_MAPPING_[data.button];
        if (keyDetails) {
          var e = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyIdentifier: keyDetails.keyIdentifier,
            key: keyDetails.key
          });
          this.selectedScene.dispatchEvent(e);
        } else {
          // these don't map to keys, but can control the pause state of the app
          if (data.button === 'play') {
            this.visibilityService.resume();
          } else if (data.button === 'pause') {
            this.visibilityService.pause();
          }
        }
      }.bind(this);

      castReceiverManager.start({statusText: 'Santa Tracker is starting'});
      console.log('Cast Receiver Manager started');
    }.bind(this));
  },
};
