// Creates a scene. TODO: Load scenes from a gltf or glb file.

export class PlaceholderScene {
  constructor() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x71a7db);
  
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.position.set(30, 40, 20);
    directionalLight.lookAt(0,0,0);
  
    scene.add(directionalLight);
  
    // Create a big plane for the ground
    const planeGeometry = new THREE.PlaneGeometry( 20, 20 );
    const planeMaterial = new THREE.MeshStandardMaterial( {color: 0x999999} );
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.rotation.set(-Math.PI / 2, 0, 0);
    plane.castShadow = false;
    plane.receiveShadow = true;
    scene.add(plane);
  
    // Add some cubes. Positions chosen arbitrarily to avoid collisions.
    const cubePositions = [
      [0, 0],
      [1, 2],
      [3, 8],
      [-6, 8],
      [-7, -7],
      [0, -9],
      [9, 0],
      [7, -5],
      [-5, 0],
      [3, -4],
    ]
    const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    for (const [x, y] of cubePositions) {
      const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
      cube.position.set(x, 0.5, y);
      cube.castShadow = true;
      scene.add(cube);
    }

    this.scene = scene;
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
}
