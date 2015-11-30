<script src="../../components/closure-library/closure/goog/base.js"></script>
<script src="%(sceneName)s-scene.deps.js"></script>
<script>
    goog.require('%(entryPoint)s');
</script>
<script>
    // Store app namespace in the expected place.
    window.scenes = {%(sceneName)s: window.app};
</script>
