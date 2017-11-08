const {
  GLTFLoader,
  MeshBasicMaterial,
  AnimationMixer,
  AnimationClip
} = self.THREE;

const loader = new GLTFLoader();

class Model {
  constructor(gltf) {
    this.object = gltf.scene;
    this.object.updateMatrixWorld();
    this.animations = gltf.animations;
    this.animationMixer = new AnimationMixer(this.object);
    this.playing = false;
  }

  play(animationName) {
    if (animationName === this.playing) {
      return;
    }
    this.animationMixer.stopAllAction();

    const clip = AnimationClip.findByName( this.animations, animationName );
    const action = this.animationMixer.clipAction(clip);

    if (action != null) {
      action.reset().play();
      this.playing = animationName;
      this.playTime = performance.now();
    } else {
      console.warn('No such animation clip:', animationName);
    }
  }

  update(game) {
    if (this.playing) {
      const frameTime = performance.now();

      this.animationMixer.update((frameTime - this.playTime) / 1000.0);
      this.playTime = frameTime;
    }
  }
}

export const createElf = (() => {
  const gltfLoads = new Promise(resolve => {
    loader.load('./models/elf-animated.gltf', function(gltf) {
      resolve(gltf);
    });
  });

  return (majorColor, minorColor, gender) => {
    return gltfLoads.then(gltf => new Model(gltf));
  };
})();


