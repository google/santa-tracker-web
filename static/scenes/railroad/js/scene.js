
goog.provide('app.Scene');

const gltfLoader = new THREE.GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Initialized in preload.
let loadedGlb;

const ELF_IMAGE_NAMES = [
  'Elf1@2x.png',
  'Elf2@2x.png',
  'Elf3@2x.png',
  'Elf4@2x.png',
  'Elf5@2x.png',
  'Elf_throw.png',
];
/** @type {Map<string, THREE.Texture>} */
const elfImages = new Map();

class Scene {

  static async preload() {
    // Start the images loading
    const imagesPromise = this.preloadImages();

    const glb = await gltfLoader.loadAsync('models/toy-shop.glb')
    await imagesPromise;

    replaceElvesWithSprites(glb.scene);
    replaceMaterialsWithToonMaterials(glb.scene);
    loadedGlb = glb;
  }

  /** Preload all the images in parallel. */
  static async preloadImages() {
    const promises = [];
    for (const imageName of ELF_IMAGE_NAMES) {
      const imagePromise = textureLoader
        .loadAsync(`img/${imageName}`)
        .then(texture => elfImages.set(imageName, texture))
        .then(_ => console.log(`Loaded ${imageName}`))
      promises.push(imagePromise);
    }
    await Promise.all(promises);
  }

  constructor() {
    if (loadedGlb == undefined) {
      throw 'Must call Scene.preload() before constructing instance.'
    }

    this.camera = loadedGlb.cameras[0];
    this.camera.fov = 50;
    this.camera.near = 0.1;
    this.camera.far = 2000;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x71a7db);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.position.set(30, 40, 20);
    directionalLight.lookAt(0,0,0);

    this.scene.add(directionalLight);

    this.mixer = new THREE.AnimationMixer(loadedGlb.scene);
    this.clips = loadedGlb.animations;
    this.clips.forEach((clip) => {
    	this.mixer.clipAction(clip).play();
    });

    replaceMaterialsWithToonMaterials(loadedGlb.scene);
    this.scene.add(loadedGlb.scene);
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

function replaceElvesWithSprites(scene) {
  scene.traverse(node => {
    if (!node.userData || !node.userData.sprite) {
      return;
    }

    const assetUrl = node.userData.sprite.assetUrl;
    if (!elfImages.has(assetUrl)) {
      console.error(`Invalid elf asset URL: "${assetUrl}"`);
      return;
    }
    const elfTexture = elfImages.get(assetUrl);

    const material = new THREE.SpriteMaterial({map: elfTexture, transparent: true});
    const sprite = new THREE.Sprite(material);
    sprite.material.rotation = (node.rotation.y);
    sprite.userData.isElf = true;
    node.add(sprite);
  });
}

app.Scene = Scene;
