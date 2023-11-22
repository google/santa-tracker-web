
goog.provide('app.Scene');

const gltfLoader = new THREE.GLTFLoader();
// Initialized in preload.
let loadedScene;

class Scene {

  static async preload() {
    loadedScene = await gltfLoader.loadAsync('models/toy-shop.glb');
  }

  constructor() {
    if (loadedScene == undefined) {
      throw 'Must call Scene.preload() before constructing instance.'
    }

    this.camera = loadedScene.cameras[0];
    this.camera.fov = 50;
    this.camera.near = 0.1;
    this.camera.far = 2000;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x71a7db);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.position.set(30, 40, 20);
    directionalLight.lookAt(0,0,0);

    this.scene.add(directionalLight);

    this.mixer = new THREE.AnimationMixer(loadedScene.scene);
    this.clips = loadedScene.animations;
    this.clips.forEach((clip) => {
    	this.mixer.clipAction(clip).play();
    });

    replaceMaterialsWithToonMaterials(loadedScene.scene);
    this.scene.add(loadedScene.scene);
  }

  update(deltaSeconds) {
    this.mixer.update(deltaSeconds);
  }

  updateCameraSize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  getCamera() {
    return this.camera;
  }

  setTimeScale(scale) {
    this.mixer.timeScale = scale;
  }

  getCameraPosition(timeInSeconds) {
    const rotatePeriodSeconds = 30;
    const radius = 7;
    const height = 0.8;
    const angle = 2 * Math.PI * timeInSeconds / rotatePeriodSeconds;
    return new THREE.Vector3(
      radius * Math.cos(angle),
      height,
      radius * Math.sin(angle),
    );
  }

  getScene() {
    return this.scene;
  }
}

function replaceMaterialsWithToonMaterials(scene) {
  const toonReplacementMaterials = new Map();
  scene.traverse(node => {
    // Only replace textures marked as toon textures.
    if (!node.material || !node.material.name.startsWith('Toon')) {
      return;
    }
    if (!toonReplacementMaterials.has(node.material.name)) {
      // Create a new toon material with the same color as the existing material.
      const replacementMaterial = new THREE.MeshToonMaterial( { color: node.material.color });
      replacementMaterial.shininess = 0;
      toonReplacementMaterials.set(node.material.name, replacementMaterial);
    }
    node.material = toonReplacementMaterials.get(node.material.name);
  });
}

app.Scene = Scene;
