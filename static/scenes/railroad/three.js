import * as THREE from "../../node_modules/three/src/Three.js";
import {GLTFLoader} from "../../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "../../node_modules/three/examples/jsm/loaders/OBJLoader.js";

const exportedThree = {GLTFLoader, OBJLoader};
Object.assign(exportedThree, THREE);
globalThis.THREE = exportedThree;
