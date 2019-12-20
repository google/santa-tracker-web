import {
  fragment,
  vertex
} from "./shaders.js";
import * as THREE from "../../../../../third_party/lib/three/build/three.module.js";

export default class Plane {
  constructor(sceneManager, images) {
    this.sceneManager = sceneManager;
    this.images = images;
    this.textures = [];
  }

  load(loader) {
    for (let i = 0; i < this.images.length; i++) {
      loader.begin("image-" + i);
      var textureLoader = new THREE.TextureLoader();
      textureLoader.load(this.images[i], image => {
        this.textures[i] = image;
        loader.end("image-" + i);
      });
    }
  }

  init() {
    const segments = 60;
    const geometry = new THREE.PlaneBufferGeometry(
      0, // need to be set to set initial scale of the subject
      0,
      segments,
      segments
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_texture: {
          type: "t",
          value: this.textures[0]
        },
        u_textureFactor: {
          type: "f",
          value: new THREE.Vector2(1, 1)
        },
        u_resolution: {
          type: "v2",
          value: new THREE.Vector2(1, 1)
        },
        u_rgbPosition: {
          type: "v2",
          value: new THREE.Vector2(1 / 2, 1 / 2)
        },
        u_rgbVelocity: {
          type: "v2",
          value: new THREE.Vector2(0, 0)
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0,0,0)
    this.mesh.userData.index = 0;
    this.sceneManager.scene.add(this.mesh);
    this.updateTexture(0);
  }

  updateTexture(index) {
    const { positionY } = this.sceneManager.getViewSize();
    this.mesh.position.y = positionY;
    this.mesh.material.uniforms.u_texture.value = this.textures[index];
  };

  onResize() {
    const { width, height, positionY } = this.sceneManager.getViewSize();
    this.mesh.scale.set( width, height, 1 );
    this.mesh.position.y = positionY;
  }
}