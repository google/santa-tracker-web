const {
  TextureLoader
} = self.THREE;

const loader = new TextureLoader();

export const tiles = loader.load('/src/images/tiles.png');
export const snowball = loader.load('/src/images/snowball.png');
export const elf = loader.load('/src/images/elf.png');
export const dummy = loader.load('/src/images/dummy.png');
