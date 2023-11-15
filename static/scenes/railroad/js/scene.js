
goog.provide('app.Scene');

const gltfLoader = new THREE.GLTFLoader();

class Scene {
  constructor(loadedScene, camera, animations) {
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

    this.mixer = new THREE.AnimationMixer(loadedScene);
    this.mixer.timeScale = 0.5;
    this.clips = animations;
    this.clips.forEach((clip) => {
    	this.mixer.clipAction(clip).play();
    });

    replaceMaterialsWithToonMaterials(loadedScene);
    this.scene.add(loadedScene);
    this.camera = camera;
    this.camera.fov = 50;
    this.camera.updateProjectionMatrix();
  }

  update(deltaSeconds) {
    this.mixer.update(deltaSeconds);
  }

  getCamera() {
    return this.camera;
  }

  setTimeScale(scale) {
    this.mixer.timeScale = scale * 0.5;  // Since our scale starts out at 0.5;
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
