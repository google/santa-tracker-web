<!DOCTYPE html>
<html lang="en">
<head>
    <title>Scene: %(sceneName)s</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, user-scalable=no">
    <style>
        html, body {
            font-family: Roboto, sans-serif;
            font-size: 12px;
            overflow: hidden;
            height: 100%%;
            width: 100%%;
            margin: 0;
            padding: 0;
            background-color: #3ec4f0;
            position: absolute;
            -webkit-tap-highlight-color: rgba(0,0,0,0);
        }
    </style>

    <script>
        // Stub Polymer function in case HTMLImports lag.
        window.__polymerComponents = [];
        window.__sceneBehaviorStub = window.SantaSceneBehavior = 'STUB';
        window.Polymer = function() {
            __polymerComponents.push(arguments);
        }
    </script>
    <script src="../../components/webcomponentsjs/webcomponents-lite.min.js"></script>
    <link rel="import" href="../../elements/elements_en.html" />
</head>
<body>
    <script>
        window.DEV = true;

        // Allow scenes to know that they're running in devmode. iframe-based scenes in particular.
        window.DEVMODE = true;

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

        document.addEventListener('HTMLImportsLoaded', function() {
            // Configure I18nMsg
            window.I18nMsg.url = '../../_messages';
            window.I18nMsg.lang = 'en';

            // Configure SoundController.
            SoundController.klangSrc_ = '../../' + SoundController.klangSrc_;
            if (SoundController.klangConfigSrc_.indexOf('http') !== 0) {
                SoundController.klangConfigSrc_ = '../../' + SoundController.klangConfigSrc_;
            }

            // Create any pending Polymer components.
            __polymerComponents.forEach(function(component) {
                // Replace stubbed SantaSceneBehavior if needed.
                if (component[0].behaviors) {
                    component[0].behaviors = component[0].behaviors.map(function(b) {
                        return b === __sceneBehaviorStub ? SantaSceneBehavior : b;
                    });
                }
                Polymer.apply(null, component);
            });
        });
    </script>

    %(content)s

    <dev-santa-app>
        <%(sceneName)s-scene></%(sceneName)s-scene>
    </dev-santa-app>
</body>
</html>
