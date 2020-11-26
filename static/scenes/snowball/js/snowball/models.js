/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {
  GLTFLoader,
  AnimationMixer,
  AnimationClip,
  Skeleton,
  LoopOnce,
  SkeletonUtils,
} = self.THREE;

const loader = new GLTFLoader();

const cloneGltf = (gltf) => {
  const clonedScene = SkeletonUtils.clone(gltf.scene);
  return {...gltf, scene: clonedScene};
};

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
        if (currentAction !== this.currentAction && this.currentAction.weight < 1.0) {
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
  const loadGltf = (() => {
    let gltfLoads;

    return assetBaseUrl => {
      if (gltfLoads == null) {
        gltfLoads = new Promise(resolve => {
          loader.load(`${assetBaseUrl}models/elf-animated.gltf`, gltf => resolve(gltf));
        });
      }

      return gltfLoads;
    };
  })();

  return (assetBaseUrl, majorColor, minorColor, gender) => {
    return loadGltf(assetBaseUrl).then(gltf => new Model(cloneGltf(gltf)));
  };
})();
