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

import { EffectComposer, RenderPass, EffectPass } from "../../../../../third_party/lib/three/postprocessing/postprocessing.js";
import * as THREE from "../../../../../third_party/lib/three/build/three.module.js";
import { CHAPTERS } from '../../model.js'
import TouchTexture from "./TouchTexture.js";
import WaterEffect from "./WaterEffect.js";
import Plane from "./Plane.js";

class Sketch {
  start() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.composer = new EffectComposer(this.renderer);

    document.querySelector('[data-scene]').append(this.renderer.domElement);
    this.renderer.domElement.id = "webGLApp";

    this.camera = new THREE.PerspectiveCamera(45, 1.4, 0.1, 10000);
    this.camera.position.z = 5;

    this.scene = new THREE.Scene();
    this.camera.lookAt = this.scene.position;

    this.clock = new THREE.Clock();

    this.touchTexture = new TouchTexture();

    const images = [];

    for (let i = 0; i < CHAPTERS.length; i++) {
      images.push(`img/desktop/chapter-${i+1}.jpg`);
    }

    this.subject = new Plane(this, images);

    this.tick = this.tick.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.init = this.init.bind(this);

    this.loader = new Loader();
    this.loadAssets().then(this.init);
    this.useComposer = true;
    this.thresholdUnderwater = 5;
    this.currentIndex = 0;
  }

  loadAssets() {
    const loader = this.loader;
    return new Promise(resolve => {
      this.subject.load(loader)
      loader.onComplete = () => {
        resolve();
      };
    });
  }

  getViewSize() {
    const vFOV = THREE.Math.degToRad( this.camera.fov ); // convert vertical fov to radians
    let height = 2 * Math.tan( vFOV / 2 ) * this.camera.position.z; // visible height
    let width = height * this.camera.aspect;

    // put the square full size on screen
    const imageRatioH = 1024 / 1440;
    const imageRatioW = 1440 / 1024;
    const windowRatio = window.innerWidth / window.innerHeight;
    let scale = 1;
    let positionY = 0;
    if (windowRatio < imageRatioW) {
      // scale to hide the top and bottom margins
      scale = window.innerHeight / (window.innerHeight * imageRatioH);
      width = height;
    } else {
      if (this.currentIndex === 0 || this.currentIndex === 18) {
        // stick image to top for first chapter
        positionY = -(width * imageRatioH - height) / 2;
      }
      height = width;
    }

    width *= scale;
    height *= scale;

    return {
      width,
      height,
      positionY
    };
  }

  initComposer() {
    const renderPass = new RenderPass(this.scene, this.camera);
    this.waterEffect = new WaterEffect({ texture: this.touchTexture.texture });

    this.waterPass = new EffectPass(this.camera, this.waterEffect);
    this.waterPass.renderToScreen = true;
    renderPass.renderToScreen = false;

    this.composer.addPass(renderPass);
    this.composer.addPass(this.waterPass);
  }

  init() {
    this.touchTexture.initTexture();

    this.subject.init();
    this.initComposer();

    this.tick();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("mousemove", this.onMouseMove);
    this.onResize();
  }

  onMouseMove(ev) {
    this.mouse = {
      x: ev.clientX / window.innerWidth,
      y: 1 - ev.clientY / window.innerHeight
    };
    this.touchTexture.addTouch(this.mouse);
  }

  render() {
    this.touchTexture.update();
    if (this.useComposer) {
      this.composer.render(this.clock.getDelta());
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  tick() {
    this.render();
    requestAnimationFrame(this.tick);
  }

  onResize() {
    // Update canvas size
    this.composer.setSize(window.innerWidth, window.innerHeight);

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.subject.onResize();
  }

  updateChapter(i) {
    setTimeout(() => {
      this.currentIndex = i;
      this.subject.updateTexture(i);
      if (i > 0 && i <= this.thresholdUnderwater || i === 19 || i === 20) {
        // no more water effect
        this.useComposer = false;
      } else {
        // use composer for water effect
        this.useComposer = true;
      }
    }, 1000);
  }
}

class Loader {
  constructor() {
    this.items = [];
    this.loaded = [];
  }
  begin(name) {
    this.items.push(name);
  }
  end(name) {
    this.loaded.push(name);
    if (this.loaded.length === this.items.length) {
      this.onComplete();
    }
  }
  onComplete() {}
}

export default new Sketch();