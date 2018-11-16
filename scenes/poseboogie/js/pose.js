import {drawKeypoints, drawSkeleton} from 'tensorflow-models/posenet/demos/demo_util.js';

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
export function detectAndDrawPose(videoConfig) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  canvas.width = videoConfig.videoWidth;
  canvas.height = videoConfig.videoHeight;

  async function poseDetectionFrame() {
    const pose = await videoConfig.net.estimateSinglePose(videoConfig.video,
        videoConfig.imageScaleFactor, videoConfig.flipHorizontal, videoConfig.outputStride);

    ctx.clearRect(0, 0, videoConfig.videoWidth, videoConfig.videoHeight);

    // Draw the video feed
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoConfig.videoWidth, 0);
    ctx.drawImage(videoConfig.video, 0, 0, videoConfig.videoWidth, videoConfig.videoHeight);
    ctx.restore();

    // Draw the resulting skeleton and key-points if over certain confidence scores
    drawKeypoints(pose.keypoints, videoConfig.minPartConfidence, ctx);
    drawSkeleton(pose.keypoints, videoConfig.minPartConfidence, ctx);

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