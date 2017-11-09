const {
  GLTFLoader,
  MeshBasicMaterial,
  AnimationMixer,
  AnimationClip,
  Skeleton
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
    return gltfLoads.then(gltf => new Model(cloneGltf(gltf)));
  };
})();


