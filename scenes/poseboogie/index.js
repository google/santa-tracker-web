import api from '../../src/scene/api.js';
import * as posenet from '@tensorflow-models/posenet';
import { detectAndDrawPose } from './js/pose.js';
import { Elf } from './js/elf.js';
import { World } from './js/world.js';

const debug = true;
const videoWidth = 600;
const videoHeight = 500;
const minPartConfidence = 0.5;
const mobileNetArchitecture = 0.75;
const flipHorizontal = true;  // Assume web-cam source, which flips video
const imageScaleFactor = 0.5;
const outputStride = 16;

api.preload.images(
  'img/face.png',
  'img/body.png',
  'img/arm.png',
  'img/hand_cuff.png',
);
const posePromise = posenet.load(mobileNetArchitecture);
api.preload.wait(posePromise);

/**
 * Loads a the camera to be used in the demo
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  // TODO(markmcd): this may be cropped, try and preserve camera's aspect ratio
  video.srcObject = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: videoWidth,
      height: videoHeight,
    },
  });

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectAndDrawPose function.
 */
export async function bindPage() {
  // Load the PoseNet model weights with architecture - the preload API will have already loaded
  // the resources so this should be quick.
  const net = await posePromise;

  // Start the camera
  let video;
  try {
    video = await loadVideo();
  } catch (e) {
    // TODO(markmcd): build error flow for when camera isn't available
    console.error('this browser does not support video capture, ' +
        'or this device does not have a camera');
    throw e;
  }

  const videoConfig = {video, net, videoWidth, videoHeight, flipHorizontal,
    imageScaleFactor, outputStride, minPartConfidence, debug};

  const world = new World();
  const elf = new Elf(world);

  world.animate(document.getElementById('scene'));
  elf.track(videoConfig);

  if (debug) {
    document.getElementById('debug').style.display = 'block';
    detectAndDrawPose(videoConfig);
  }
}


navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

api.ready(bindPage).catch((reason) => {
  // TODO(markmcd): display an error page with link back to village
  console.error(`beep boop, something broke. ${reason}`);
});
