import {drawKeypoints, drawSkeleton} from 'tensorflow-models/posenet/demos/demo_util.js';

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
export function detectAndDrawPose(video, net, videoWidth, videoHeight,
    flipHorizontal, imageScaleFactor, outputStride) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  // since images are being fed from a web-cam

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    // Scale an image down to a certain factor. Too large of an image will slow
    // down the GPU.

    const pose = await net.estimateSinglePose(
        video, imageScaleFactor, flipHorizontal, outputStride);

    const minPoseConfidence = 0.15;
    const minPartConfidence = 0.1;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // Draw the video feed
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();

    // Draw the resulting skeleton and keypoints if over certain confidence
    // scores
    if (pose.score >= minPoseConfidence) {
      drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }

    window.requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}
