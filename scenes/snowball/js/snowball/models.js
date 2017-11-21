const {
  GLTFLoader,
  MeshBasicMaterial,
  AnimationMixer,
  AnimationClip,
  Skeleton,
  LoopOnce
} = self.THREE;

const loader = new GLTFLoader();

const cloneGltf = (gltf) => {
  const clone = {
    animations: gltf.animations,
    scene: gltf.scene.clone(true)
  };

  const skinnedMeshes = {};

  gltf.scene.traverse(node => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node;
    }
  });

  const cloneBones = {};
  const cloneSkinnedMeshes = {};

  clone.scene.traverse(node => {
    if (node.isBone) {
      cloneBones[node.name] = node;
    }

    if (node.isSkinnedMesh) {
      cloneSkinnedMeshes[node.name] = node;
    }
  });

  for (let name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name];
    const skeleton = skinnedMesh.skeleton;
    const cloneSkinnedMesh = cloneSkinnedMeshes[name];

    const orderedCloneBones = [];

    for (let i = 0; i < skeleton.bones.length; ++i) {
      const cloneBone = cloneBones[skeleton.bones[i].name];
      orderedCloneBones.push(cloneBone);
    }

    cloneSkinnedMesh.bind(
        new Skeleton(orderedCloneBones, skeleton.boneInverses),
        cloneSkinnedMesh.matrixWorld);
  }

  return clone;
}

class Model {
  constructor(gltf) {
    this.object = gltf.scene;
    this.object.updateMatrixWorld();
    this.animations = gltf.animations;
    this.animationMixer = new AnimationMixer(this.object.children[0]);
    this.playing = false;

    this.currentAction = null;
    this.mixedAnimationActions = {};

    this.mixedAnimationCount = 0;
  }

  getClip(animationName) {
    return AnimationClip.findByName(this.animations, animationName);
  }

  getAction(animationName) {
    const clip = this.getClip(animationName);
    const action = this.animationMixer.clipAction(clip);

    return action;
  }

  play(animationName) {
    if (animationName === this.playing) {
      return;
    }

    if (this.currentAction) {
      this.currentAction.setEffectiveWeight(0);
    }

    this.animationMixer.stopAllAction();

    const action = this.getAction(animationName);


    if (action != null) {
      action.setEffectiveWeight(1.0);
      action.reset().play();

      this.playing = animationName;
      this.playTime = performance.now();
    } else {
      console.warn('No such animation clip:', animationName);
    }

    this.currentAction = action;

    return action;
  }

  playOnce(animationName) {
    const action = this.play(animationName);

    if (action != null) {
      action.loop = LoopOnce;
      action.repititions = 0;
      action.clampWhenFinished = true;
    }

    return action;
  };

  mixOnce(animationName) {
    const clip = this.getClip(animationName);
    const existingAction = this.animationMixer.existingAction(clip);

    if (existingAction != null && existingAction.isRunning()) {
      existingAction.stop();
    }

    this.mixedAnimationCount++;

    const action = this.animationMixer.clipAction(clip);

    action.loop = LoopOnce;
    action.repititions = 0;
    action.reset().play();
    action.zeroSlopeAtEnd = true;
    action.clampWhenFinished = true;
    action.timeScale = 1.75;

    const currentAction = this.currentAction;

    if (currentAction != null) {
      currentAction.weight = 0;
    }

    const onFinished = event => {
      if (event.action === action) {
        this.animationMixer.removeEventListener('finished', onFinished);
        action.fadeOut(0.25);
        currentAction.setEffectiveWeight(1.0).fadeIn(0.25)
        if (currentAction !== this.currentAction &&
            this.currentAction.weight < 1.0) {
          this.currentAction.setEffectiveWeight(1.0).fadeIn(0.25).play();
        }
      }
    };

    this.animationMixer.addEventListener('finished', onFinished);
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
    loader.load('scenes/snowball/js/models/elf-animated.gltf', function(gltf) {
      gltf.scene.traverse(node => {
        if (node.isSkinnedMesh) {
          //const originalMaterial = node.material;
          //debugger;
          //node.material = new MeshBasicMaterial({
            //map: originalMaterial.map
          //});
        }
      });
      resolve(gltf);
    });
  });

  return (majorColor, minorColor, gender) => {
    return gltfLoads.then(gltf => new Model(cloneGltf(gltf)));
  };
})();


