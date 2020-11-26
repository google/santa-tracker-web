/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {drawKeypoints, drawSkeleton} from 'tensorflow-models/posenet/demos/demo_util.js';

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
export function detectAndDrawPose(videoConfig, appConfig) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  canvas.width = videoConfig.videoWidth;
  canvas.height = videoConfig.videoHeight;

  async function poseDetectionFrame() {
    if (videoConfig.net.discarded) {
      window.requestAnimationFrame(poseDetectionFrame);
      return;
    }

    let poses = [];
    if (appConfig.multiPoseMode) {
      // TODO(markmcd): wire up the nmsRadius and maxPoses to UI?
      poses = await videoConfig.net.estimateMultiplePoses(videoConfig.video,
          appConfig.imageScaleFactor, appConfig.flipHorizontal, +appConfig.outputStride, 2);
    } else {
      const pose = await videoConfig.net.estimateSinglePose(videoConfig.video,
          appConfig.imageScaleFactor, appConfig.flipHorizontal, +appConfig.outputStride);
      poses.push(pose);
    }

    ctx.clearRect(0, 0, videoConfig.videoWidth, videoConfig.videoHeight);

    // Draw the video feed
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoConfig.videoWidth, 0);
    ctx.drawImage(videoConfig.video, 0, 0, videoConfig.videoWidth, videoConfig.videoHeight);
    ctx.restore();

    // Draw the resulting skeletons and key-points if over certain confidence scores
    poses.forEach((pose) => {
      drawKeypoints(pose.keypoints, appConfig.minPartConfidence, ctx);
      drawSkeleton(pose.keypoints, appConfig.minPartConfidence, ctx);
    });

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
      // Circles can be drawn by rectangular images, to do so we use 2*radius as the target width
      // and scale the height based on the original aspect ratio.
      const aspect = s.img.height / s.img.width;
      ctx.drawImage(s.img, -s.radius, -s.radius, 2*s.radius, 2*s.radius * aspect);
    }
  }
  ctx.restore();
}

/**
 * Draws a curved line along the path of the two provided p2 bodies. The line is drawn from the
 * "start" (e.g. top or left) of body1 to the "end" (e.g. bottom or right) or body2, so the order
 * of the bodies is important. Provide any 2D context styles as a dict/map on body1.style.
 *
 * The first shape attached to p2 bodies is used, and these must be p2.Box instances.
 *
 * Shapes positioned by the physics system have pivots defined in the constraints. When we position
 * shapes by pose, we need to account for these offsets, via the 'offset' property on the body.
 */
export function drawCurve(body1, body2, ctx, quadratic=false) {
  // Convenient shape aliases
  const s1 = body1.shapes[0];
  const s2 = body2.shapes[0];
  if (!(s1 instanceof p2.Box && s2 instanceof p2.Box)) {
    throw new Error('Unable to draw curves between non-Box shapes.');
  }

  // Body positions are center coordinates, and are rotated, so we need to find the start and
  // end positions through some trig.
  const [cx1, cy1] = body1.interpolatedPosition;
  const [cx2, cy2] = body2.interpolatedPosition;
  const theta1 = body1.interpolatedAngle;
  const theta2 = body2.interpolatedAngle;

  // Start of first shape
  const x1 = cx1 - Math.sin(theta1) * s1.height/2;
  const y1 = cy1 + Math.cos(theta1) * s1.height/2 - body1.offset;
  // End of second shape
  const x2 = cx2 + Math.sin(theta2) * s2.height/2;
  const y2 = cy2 - Math.cos(theta2) * s2.height/2;

  // To find the "joint" we pick the mid-point between the two shapes.
  const mx1 = cx1 + Math.sin(theta1) * s1.height/2;
  const my1 = cy1 - Math.sin(theta1) * s1.height/2;
  const mx2 = cx2 - Math.sin(theta2) * s2.height/2;
  const my2 = cy2 + Math.sin(theta2) * s2.height/2;
  const mx = (mx1 + mx2) / 2;
  const my = (my1 + my2) / 2;

  ctx.save();
  ctx.beginPath();
  // Apply supplied styles.
  Object.assign(ctx, {lineWidth: s1.width/2, lineJoin: 'round', ...body1.style});
  ctx.moveTo(x1, y1);
  if (quadratic) {
    ctx.quadraticCurveTo(mx, my, x2, y2);
  } else {
    ctx.lineTo(mx, my);
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  ctx.restore();
}