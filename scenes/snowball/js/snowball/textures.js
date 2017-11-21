const {
  TextureLoader
} = self.THREE;

const loader = new TextureLoader();

export const tiles = loader.load('/src/images/tiles.png');
export const snowball = loader.load('/src/images/snowball.png');
//export const icons = loader.load('/src/images/icons.png');
export const parachute = loader.load('/src/images/parachute.png');
