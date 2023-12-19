import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";

const exportedThree = {GLTFLoader, OBJLoader, DRACOLoader};
Object.assign(exportedThree, THREE);
globalThis.THREE = exportedThree;
