// mixin to add chromecast support to santa-app

var chromecastMixin = {
  // TODO(bckenny): right now, event.data values are "left", "right", "up",
  // "down", "return", "space". Finalize these.
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
    return: {
      keyIdentifier: 'Enter',
      key: 'Enter'
    },
    space: {
      keyIdentifier: ' ',
      key: 'U+0020'
    }
  },

  initChromecast: function() {
    // TODO(bckenny): remove noisy chromecast debugging logging
    // dynamically import the Cast Reciever SDK if in chromecast mode
    var sdkImportPath = this.resolvePath('../../js/chromecastsdk.html');
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

        // fire KeyboardEvent on current scene
        // since this is Chromecast only, we can assume it supports the modern
        // KeyboardEvent constructor and skip the initKeyboardEvent silliness
        // TODO(bckenny): use Polymer's this.fire if
        // https://github.com/Polymer/core-a11y-keys/issues/6 is fixed
        var keyDetails = this.CAST_KEY_MAPPING_[event.data];
        if (keyDetails) {
          var e = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyIdentifier: keyDetails.keyIdentifier,
            key: keyDetails.key
          });
          this.selectedScene.dispatchEvent(e);
        }
      };

      castReceiverManager.start({statusText: 'Santa Tracker is starting'});
      console.log('Cast Receiver Manager started');
    }.bind(this));
  },
};
