goog.provide('app.systems.ElvesSystem');

const ELVES_IMAGES = [
  'img/Elf1@2x.png',
  'img/Elf2@2x.png',
  'img/Elf3@2x.png',
  'img/Elf4@2x.png',
  'img/Elf5@2x.png',
];

class ElvesSystem {

  constructor(camera, placeholderScene, readFromScene = true) {
    this.camera = camera;
    this.placeholderScene = placeholderScene;
    this.seconds = 0;
    this.lastSpawn = 0;
    this.spawnPeriod = 5;
    this.readFromScene = readFromScene;
    if (this.readFromScene) {
      this.generateElvesFromScene();
    } else {
      this.elves = this.generateElves();
    }
    this.nextElfIndex = 0;
  }

  update(deltaSeconds) {
    this.seconds = this.seconds + deltaSeconds;
    if (!this.readFromScene && this.seconds - this.lastSpawn >= this.spawnPeriod) {
      this.spawnElf();
      this.lastSpawn = this.seconds;
    }
  }

  spawnElf() {
    const sprite = this.elves[this.nextElfIndex];
    sprite.position.copy(this.camera.position);
    const offset = this.camera.getWorldDirection().multiplyScalar(5);
    sprite.position.add(offset);
    this.placeholderScene.scene.add(sprite);
    this.nextElfIndex = (this.nextElfIndex + 1) % this.elves.length;
  }

  generateElves() {
    const elves = [];
    for (const elfImg of ELVES_IMAGES) {
      const elfTexture = new THREE.TextureLoader().load(elfImg);
      const material = new THREE.SpriteMaterial({map: elfTexture});
      const sprite = new THREE.Sprite(material);
      sprite.userData.isElf = true;
      elves.push(sprite);
    }
    return elves;
  }

  generateElvesFromScene() {
    for (const scene of this.placeholderScene.getScene().children) {
      for (const obj of scene.children) {
        if (obj.userData.doodle_components.includes('clickable') && obj.userData.clickable.type === 'elf') {
          new THREE.TextureLoader().load(`img/${obj.userData.sprite.assetUrl}`, (elfTexture) => {
            const material = new THREE.SpriteMaterial({map: elfTexture, transparent: true});
            const sprite = new THREE.Sprite(material);
            sprite.material.rotation = (obj.rotation.y);
            sprite.userData.isElf = true;
            obj.add(sprite);
          });
        }
      }
    }
  }
}

app.ElvesSystem = ElvesSystem;
