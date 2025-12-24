goog.provide('app.Scene');

goog.require('app.isElf');

const dracoLoader = new THREE.DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dracoLoader.setDecoderConfig({type: 'js'});
dracoLoader.preload();

const gltfLoader = new THREE.GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
const textureLoader = new THREE.TextureLoader();

// Initialized in preload.
let loadedGlb;

const ELF_IMAGE_NAMES = [
  'Elf1@2x.png',
  'Elf2@2x.png',
  'Elf3@2x.png',
  'Elf4@2x.png',
  'Elf5@2x.png',
  'Elf1_Holding@2x.png',
  'Elf2_Holding@2x.png',
  'Elf3_Holding@2x.png',
  'Elf4_Holding@2x.png',
  'Elf5_Holding@2x.png',
  'Elf_Throw@2x.png',
  'Elf_Throw2@2x.png',
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
    replaceSkyMaterial(glb.scene);
    loadedGlb = glb;
  }

  /** Preload all the images in parallel. */
  static async preloadImages() {
    const promises = [];
    for (const imageName of ELF_IMAGE_NAMES) {
      const imagePromise = textureLoader
        .loadAsync(`img/${imageName}`)
        .then(texture => {
          texture.colorSpace = THREE.SRGBColorSpace;
          elfImages.set(imageName, texture);
        })
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

  getScene() {
    return this.scene;
  }

  /**
   * @returns {THREE.Sprite | undefined} The closest elf if there's one close enough, otherwise undefined.
   */
  findClosestElf() {
    // Frustum for checking if the elf is in view of the camera
    const cameraGlobal = new THREE.Vector3();
    this.camera.getWorldPosition(cameraGlobal);
    const cameraMatrix = new THREE.Matrix4().multiplyMatrices(
      this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(cameraMatrix);

    const elves = [];
    this.scene.traverse(node => {
      if (app.isElf(node)) {
        elves.push(node)
      }
    });

    let closest = undefined;
    let closestSqDist = Infinity;

    const elfGlobal = new THREE.Vector3();
    for (const elf of elves) {
      if (!frustum.intersectsObject(elf)) {
        continue;
      }

      elf.getWorldPosition(elfGlobal);
      const sqDist = cameraGlobal.distanceToSquared(elfGlobal);
      if (sqDist < closestSqDist) {
        closestSqDist = sqDist;
        closest = elf;
      }
    };

    return closest;
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

function createGradientTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1;

  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#6FAADD');
  gradient.addColorStop(0.03, '#E6F3E0');
  gradient.addColorStop(1, '#E6F3E0');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function replaceSkyMaterial(scene) {
  const skyMaterial = new THREE.MeshStandardMaterial({
    map: createGradientTexture(),
    roughness: 1.0,
    metalness: 0.0,
  });

  scene.traverse(node => {
    if (node.material && node.material.name === 'M_Sky') {
      node.material = skyMaterial;
    }
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
    // Scale the sprite's width to match the texture dimensions
    sprite.scale.set(elfTexture.image.width / elfTexture.image.height, 1, 1);

    sprite.material.rotation = (node.rotation.y);
    if (!assetUrl.includes("Throw")) {
      sprite.userData.isElf = true;
      sprite.userData.clickable = {type: 'elf'};
      sprite.userData.assetUrl = assetUrl;
      sprite.userData.hasPresent = false;
    }
    node.add(sprite);
  });
}

function getElfImage(assetUrl) {
  return elfImages.get(assetUrl);
}

app.Scene = Scene;
app.getElfImage = getElfImage;
