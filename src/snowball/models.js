const {
  GLTFLoader,
  MeshBasicMaterial
} = self.THREE;

const loader = new GLTFLoader();

export const createElf = (() => {
  const gltfLoads = new Promise(resolve => {
    loader.load('./models/elf.gltf', function(gltf) {
      resolve(gltf);
    });
  });

  return (majorColor, minorColor, gender) => {
    return gltfLoads.then(gltf => {
      // scene => object3D => group => mesh
      const { scene } = gltf;
      const elfMesh = scene.children[0].children[0].children[0].clone();
      const material = new MeshBasicMaterial({
        map: elfMesh.material.map
      });

      // TODO(cdata): Support elf mesh customization via uniforms:
      /*
      const uniforms = {
        majorColor: {
          value: majorColor
        },
        minorColor: {
          value: minorColor
        },
        gender: {
          value: gender
        },
        map: {
          value: elfMesh.material.map
        }
      };
      */

      elfMesh.material = material;
      elfMesh.scale.multiplyScalar(5.0);
      return elfMesh;
    });
  };
})();


