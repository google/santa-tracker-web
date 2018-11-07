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

    const minPoseConfidence = 0.1;
    const minPartConfidence = 0.5;

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

/**
 * Draws a p2 body on the supplied context. Relies on a 'img' property on the
 * body, and assumes that the image is the same aspect ratio as the shape it
 * represents.
 */
export function drawBody(body, ctx) {
  const x = body.interpolatedPosition[0],
      y = body.interpolatedPosition[1],
      s = body.shapes[0];
  ctx.save();
  ctx.translate(x, y);  // Translate to the center of the body
  ctx.rotate(body.interpolatedAngle);  // Rotate to the body's orientation
  if (s instanceof p2.Box) {
    if (s.img && s.img.complete) {
      ctx.drawImage(s.img, -s.width / 2, -s.height / 2, s.width, s.height);
    }
  } else if (s instanceof p2.Circle) {
    if (s.img && s.img.complete) {
      ctx.drawImage(s.img, -s.radius, -s.radius, 2*s.radius, 2*s.radius);
    }
  }
  ctx.restore();
}