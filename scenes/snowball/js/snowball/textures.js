const {
  TextureLoader
} = self.THREE;

const loader = new TextureLoader();

const textureMemo = assetPath => {
  let texture;

  return baseUrl => {
    if (texture == null) {
      texture = loader.load(`${baseUrl}${assetPath}`);
    }

    return texture;
  }
};

export const tiles = textureMemo('img/tiles.png');
export const snowball = textureMemo('img/snowball.png');
export const parachute = textureMemo('img/parachute.png');

