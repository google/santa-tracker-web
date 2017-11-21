const {
  TextureLoader
} = self.THREE;

const loader = new TextureLoader();

export const tiles = loader.load('scenes/snowball/img/tiles.png');
export const snowball = loader.load('scenes/snowball/img/snowball.png');
//export const icons = loader.load('/src/images/icons.png');
export const parachute = loader.load('scenes/snowball/img/parachute.png');
