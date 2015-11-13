<script src="../../js/soundcontroller.js"></script>
<script src="../../components/closure-library/closure/goog/base.js"></script>
<script src="%(sceneName)s-scene.deps.js"></script>
<script>
    goog.require('%(entryPoint)s');
</script>

<script>
    window.DEV = true;

    // Store app namespace in the expected place.
    window.scenes = {%(sceneName)s: window.app};

    // Allow scenes to know that they're running in devmode. iframe-based scenes in particular.
    window.DEVMODE = true;

    // Configure I18nMsg
    window.I18nMsg.url = '../../_messages';
    window.I18nMsg.lang = 'en';

    // Configure SoundController.
    SoundController.klangSrc_ = '../../' + SoundController.klangSrc_;
    SoundController.klangConfigSrc_ = '../../' + SoundController.klangConfigSrc_;

    // Define a super simple dev-santa-app element which runs its contained scene directly.
    Polymer({
        is: 'dev-santa-app',
        ready: function() {
            var scene = this.children[0];
            setTimeout(function() {
                scene.active = true;
            }, 0);

            var sc = new SoundController(this.soundsLoaded.bind(this));
            this.addEventListener('sound-preload', sc.loadSounds.bind(sc));
            this.addEventListener('sound-ambient', sc.playAmbientSounds.bind(sc));
            this.addEventListener('sound-trigger', sc.playSound.bind(sc));
            window.santaApp = this;
        },

        soundsLoaded: function(soundsName) {
            var scene = this.children[0];
            if (scene && scene.fire) {
                scene.fire('sounds-loaded', soundsName);
            }
        }
    });
</script>
