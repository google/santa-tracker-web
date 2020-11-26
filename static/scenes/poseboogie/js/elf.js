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

import * as posenet from '@tensorflow-models/posenet';
import '../../../src/polyfill/event-target.js';
import {BODY_PARTS, OTHER} from './world.js';

// The p2 world co-ordinates are centered on (0, 0), with negative Y being
// downwards and negative X being leftwards.
const
    offset = [0, 4.0],  // initial body translation offsets
    headRadius = 2.8,
    neckLength = 0.1,
    torsoLength = 5,
    shoulderWidth = torsoLength * 0.7,
    torsoJointOffset = 0.7,  // distance from outside of torso img the legs/arms should attach.
    armLength = torsoLength,
    armWidth = armLength / 3,
    handLength = 1.5,
    legLength = 5,
    legWidth = legLength / 3.6,
    shoeHeight = 2,
    shoeWidth = shoeHeight * 3/2,
    ankleOffset = 0.14; // fraction of shoe size around which shoe rotates

// When making very frequent updates, particularly twitchy ones, the physics engine calculates the
// bodies as having very high velocity. This value is used to clamp the velocities to a speed
// limit. Velocity is only used when we fail to detect a keypoint so this should be kept low to
// ensure relatively smooth movement. This also allows us to increase our confidence threshold and
// work at higher precision.
const speedLimit = 1;

// 2D context styles that are passed on everywhere we draw instead of using images.
const lineStyle = {
  lineCap: 'round',
  strokeStyle: '#32a658',
};

export class Elf extends EventTarget {
  constructor(world, appConfig) {
    super();
    this.config = appConfig;
    this.hasPose = false;
    this.world = world;
    const p2World = world.world;

    // [0, 0] is the center of the body at the point below the head and above
    // the torso. Body positions define the center of mass for the body, which
    // by default, is the center of the shape.

    this.head = new p2.Body({
      position: Elf.translate([0, headRadius], offset),
      mass: 1,
    });
    this.head.zIndex = 1;

    this.headShape = new p2.Circle({
      radius: headRadius,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.headShape.img = document.getElementById('face');
    this.head.addShape(this.headShape);
    p2World.addBody(this.head);

    this.torso = new p2.Body({
      position: Elf.translate([0, -torsoLength/2], offset),
      mass: 1,
    });
    this.torso.zIndex = 0;
    this.torsoShape = new p2.Box({
      width: shoulderWidth,
      height: torsoLength,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.torsoShape.img = document.getElementById('body');
    this.torso.addShape(this.torsoShape);
    p2World.addBody(this.torso);

    this.neckJoint = new p2.RevoluteConstraint(this.head, this.torso, {
      localPivotA: [0, -headRadius-neckLength/2],
      localPivotB: [0, torsoLength/2],
      collideConnected: false,
    });
    p2World.addConstraint(this.neckJoint);

    this.leftArm = new p2.Body({
      position: Elf.translate([shoulderWidth/2, -torsoLength/2 + armLength/2], offset),
      mass: 1,
    });
    this.leftArm.zIndex = 2;
    this.leftArmShape = new p2.Box({
      width: armWidth,
      height: armLength/2,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.leftArmShape.img = document.getElementById('arm');
    this.leftArm.addShape(this.leftArmShape);
    p2World.addBody(this.leftArm);

    this.leftShoulder = new p2.RevoluteConstraint(this.torso, this.leftArm, {
      localPivotA: [shoulderWidth/2 - torsoJointOffset, torsoLength/2],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.leftShoulder);

    this.leftForeArm = new p2.Body({
      position: Elf.translate([shoulderWidth/2, -torsoLength/2 - armLength/2], offset),
      mass: 1,
    });
    this.leftForeArm.zIndex = 2;
    this.leftForeArmShape = new p2.Box({
      width: armWidth,
      height: armLength/2,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.leftForeArmShape.img = document.getElementById('arm');
    this.leftForeArm.addShape(this.leftForeArmShape);
    p2World.addBody(this.leftForeArm);

    this.leftArm.curveWith = this.leftForeArm;
    this.leftForeArm.curveWith = false;
    this.leftArm.style = lineStyle;
    this.leftArm.offset = torsoJointOffset;

    this.leftElbow = new p2.RevoluteConstraint(this.leftArm, this.leftForeArm, {
      localPivotA: [0, -armLength/4],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.leftElbow);

    this.rightArm = new p2.Body({
      position: Elf.translate([-shoulderWidth/2, -torsoLength/2 + armLength/2], offset),
      mass: 1,
    });
    this.rightArm.zIndex = 2;
    this.rightArmShape = new p2.Box({
      width: armWidth,
      height: armLength/2,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.rightArmShape.img = document.getElementById('arm');
    this.rightArm.addShape(this.rightArmShape);
    p2World.addBody(this.rightArm);

    this.rightShoulder = new p2.RevoluteConstraint(this.torso, this.rightArm, {
      localPivotA: [-shoulderWidth/2 + torsoJointOffset, torsoLength/2],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.rightShoulder);

    this.rightForeArm = new p2.Body({
      position: Elf.translate([-shoulderWidth/2, -torsoLength/2 - armLength/2], offset),
      mass: 1,
    });
    this.rightForeArm.zIndex = 2;
    this.rightForeArmShape = new p2.Box({
      width: armWidth,
      height: armLength/2,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.rightForeArmShape.img = document.getElementById('arm');
    this.rightForeArm.addShape(this.rightForeArmShape);
    p2World.addBody(this.rightForeArm);

    this.rightArm.curveWith = this.rightForeArm;
    this.rightForeArm.curveWith = false;
    this.rightArm.style = lineStyle;
    this.rightArm.offset = torsoJointOffset;

    this.rightElbow = new p2.RevoluteConstraint(this.rightArm, this.rightForeArm, {
      localPivotA: [0, -armLength/4],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.rightElbow);

    this.leftHand = new p2.Body({
      position: Elf.translate([shoulderWidth/2, -torsoLength - handLength/2], offset),
      mass: 1,
    });
    this.leftHand.zIndex = 3;
    this.leftHandShape = new p2.Box({
      width: armWidth,
      height: handLength,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.leftHandShape.img = document.getElementById('hand');
    this.leftHand.addShape(this.leftHandShape);
    p2World.addBody(this.leftHand);

    this.leftWrist = new p2.RevoluteConstraint(this.leftForeArm, this.leftHand, {
      localPivotA: [0, -armLength/4],
      localPivotB: [0, handLength/2],
      collideConnected: false,
    });
    p2World.addConstraint(this.leftWrist);

    this.rightHand = new p2.Body({
      position: Elf.translate([-shoulderWidth/2, -torsoLength - handLength/2], offset),
      mass: 1,
    });
    this.rightHand.zIndex = 3;
    this.rightHandShape = new p2.Box({
      width: armWidth,
      height: handLength,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.rightHandShape.img = document.getElementById('hand');
    this.rightHand.addShape(this.rightHandShape);
    p2World.addBody(this.rightHand);

    this.rightWrist = new p2.RevoluteConstraint(this.rightForeArm, this.rightHand, {
      localPivotA: [0, -armLength/4],
      localPivotB: [0, handLength/2],
      collideConnected: false,
    });
    p2World.addConstraint(this.rightWrist);

    this.leftLeg = new p2.Body({
      position: Elf.translate([shoulderWidth/2, -torsoLength - legLength/4], offset),
      mass: 1,
    });
    this.leftLeg.zIndex = 2;
    this.leftLegShape = new p2.Box({
      width: legWidth,
      height: legLength/2,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    // TODO(markmcd): Do we need different graphics for the legs?
    this.leftLegShape.img = document.getElementById('arm');
    this.leftLeg.addShape(this.leftLegShape);
    p2World.addBody(this.leftLeg);

    this.leftCalf = new p2.Body({
      position: Elf.translate([shoulderWidth/2, -torsoLength - legLength*3/4], offset),
      mass: 1,
    });
    this.leftCalf.zIndex = 2;
    this.leftCalfShape = new p2.Box({
      width: legWidth,
      height: legLength/2,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.leftCalfShape.img = document.getElementById('arm');
    this.leftCalf.addShape(this.leftCalfShape);
    p2World.addBody(this.leftCalf);

    this.leftLeg.curveWith = this.leftCalf;
    this.leftCalf.curveWith = false;
    this.leftLeg.style = lineStyle;
    this.leftLeg.offset = -torsoJointOffset;

    this.leftHip = new p2.RevoluteConstraint(this.torso, this.leftLeg, {
      localPivotA: [shoulderWidth/2 - torsoJointOffset, -torsoLength/2],
      localPivotB: [0, legLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.leftHip);

    this.leftKnee = new p2.RevoluteConstraint(this.leftLeg, this.leftCalf, {
      localPivotA: [0, -legLength/4],
      localPivotB: [0, legLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.leftKnee);

    this.leftFoot = new p2.Body({
      position: Elf.translate([shoulderWidth/2 + shoeWidth/2,
        -torsoLength - legLength - shoeHeight/2], offset),
      type: this.config.pinnedFeet ? p2.Body.KINEMATIC : p2.Body.DYNAMIC,
      mass: 1,
    });
    this.leftFoot.zIndex = 3;
    this.leftFootShape = new p2.Box({
      width: shoeWidth,
      height: shoeHeight,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.leftFootShape.img = document.getElementById('leftshoe');
    this.leftFoot.addShape(this.leftFootShape);
    p2World.addBody(this.leftFoot);

    this.leftAnkle = new p2.RevoluteConstraint(this.leftCalf, this.leftFoot, {
      localPivotA: [0, -legLength/4],
      localPivotB: [-shoeWidth/2 + (shoeWidth * ankleOffset),
        shoeHeight/2 - (shoeWidth * ankleOffset)],
      collideConnected: false,
    });
    p2World.addConstraint(this.leftAnkle);

    this.rightLeg = new p2.Body({
      position: Elf.translate([-shoulderWidth/2, -torsoLength - legLength/4], offset),
      mass: 1,
    });
    this.rightLeg.zIndex = 2;
    this.rightLegShape = new p2.Box({
      width: legWidth,
      height: legLength/2,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.rightLegShape.img = document.getElementById('arm');
    this.rightLeg.addShape(this.rightLegShape);
    p2World.addBody(this.rightLeg);

    this.rightCalf = new p2.Body({
      position: Elf.translate([-shoulderWidth/2, -torsoLength - legLength*3/4], offset),
      mass: 1,
    });
    this.rightCalf.zIndex = 2;
    this.rightCalfShape = new p2.Box({
      width: legWidth,
      height: legLength/2,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.rightCalfShape.img = document.getElementById('arm');
    this.rightCalf.addShape(this.rightCalfShape);
    p2World.addBody(this.rightCalf);

    this.rightLeg.curveWith = this.rightCalf;
    this.rightCalf.curveWith = false;
    this.rightLeg.style = lineStyle;
    this.rightLeg.offset = -torsoJointOffset;

    this.rightHip = new p2.RevoluteConstraint(this.torso, this.rightLeg, {
      localPivotA: [-shoulderWidth/2 + torsoJointOffset, -torsoLength/2],
      localPivotB: [0, legLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.rightHip);

    this.rightKnee = new p2.RevoluteConstraint(this.rightLeg, this.rightCalf, {
      localPivotA: [0, -legLength/4],
      localPivotB: [0, legLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.rightKnee);

    this.rightFoot = new p2.Body({
      position: Elf.translate([-shoulderWidth/2 - shoeWidth/2,
        -torsoLength - legLength - shoeHeight/2], offset),
      type: this.config.pinnedFeet ? p2.Body.KINEMATIC : p2.Body.DYNAMIC,
      mass: 1,
    });
    this.rightFoot.zIndex = 3;
    this.rightFootShape = new p2.Box({
      width: shoeWidth,
      height: shoeHeight,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.rightFootShape.img = document.getElementById('rightshoe');
    this.rightFoot.addShape(this.rightFootShape);
    p2World.addBody(this.rightFoot);

    this.rightAnkle = new p2.RevoluteConstraint(this.rightCalf, this.rightFoot, {
      localPivotA: [0, -legLength/4],
      localPivotB: [+shoeWidth/2 - (shoeWidth * ankleOffset),
        shoeHeight/2 - (shoeWidth * ankleOffset)],
      collideConnected: false,
    });
    p2World.addConstraint(this.rightAnkle);
  }

  enableLimits(enabled) {
    if (enabled) {
      this.neckJoint.setLimits(-Math.PI/8, Math.PI/8);  // π/4 = 45°
      this.leftWrist.setLimits(Math.PI/4, -Math.PI/4);
      this.rightWrist.setLimits(Math.PI/4, -Math.PI/4);
      if (this.config.pinnedFeet) {
        // Stop the ankles from rotating below the (fixed) shoes.
        this.leftAnkle.setLimits(-Math.PI/2, Math.PI/2);
        this.rightAnkle.setLimits(-Math.PI/2, Math.PI/2);
      } else {
        this.leftAnkle.setLimits(0, 0);
        this.rightAnkle.setLimits(0, 0);
      }
    } else {
      this.neckJoint.setLimits(false, false);
      this.leftWrist.setLimits(false, false);
      this.rightWrist.setLimits(false, false);
      this.leftAnkle.setLimits(false, false);
      this.rightAnkle.setLimits(false, false);
    }
  }

  track(videoConfig) {
    this.videoWidth = videoConfig.videoWidth;
    this.videoHeight = videoConfig.videoHeight;

    const trackFrame = () => {
      this.threshold = this.config.minPartConfidence;
      this.resize = this.config.resizeBodyParts;
      this.enableLimits(this.config.enableJointLimits);
      this.humanSize = this.config.humanSize;
      this.pinnedFeet = this.config.pinnedFeet;

      // Reload the model if the UI setting has changed
      let loadModel = Promise.resolve(videoConfig.net);
      if (this.config.modelReload) {
        videoConfig.net.dispose();
        videoConfig.net.discarded = true;
        this.config.modelReload = false;
        loadModel = posenet.load(+this.config.mobileNetArchitecture);
      }

      loadModel.then((net) => {
        videoConfig.net = net;
        let singlePosePromise;
        if (this.config.multiPoseMode) {
          singlePosePromise = net.estimateMultiplePoses(videoConfig.video,
                  this.config.imageScaleFactor, this.config.flipHorizontal, +this.config.outputStride)
              // Pull out the best pose from the batch
              .then((poses) => poses.reduce(
                  (bestPose, pose) => !bestPose || pose.score > bestPose.score ? pose : bestPose));
        } else {
          singlePosePromise = net.estimateSinglePose(videoConfig.video,
              this.config.imageScaleFactor,
              this.config.flipHorizontal, +this.config.outputStride);
        }
        singlePosePromise
            .then((pose) => {
              if (pose.score >= this.config.minPoseConfidence) {
                if (!this.hasPose) {
                  this.dispatchEvent(new CustomEvent('pose-change', {detail: true}));
                }
                this.hasPose = true;
                this.pose = pose.keypoints.reduce((dict, kp) => ({...dict, [kp.part]: kp}), {});
                this.scaleSkeleton();
              } else {
                if (this.hasPose) {
                  this.dispatchEvent(new CustomEvent('pose-change', {detail: false}));
                }
                this.hasPose = false;
                this.pose = null;
              }
              if (this.config.debug) {
                document.getElementById('textdump').innerText = JSON.stringify(pose, null, 2);
              }
            })
            .catch((reason) => console.error('Pose estimation failed!', reason))
            .then(() => window.requestAnimationFrame(trackFrame));
        });
    };

    this.world.world.on('postStep', () => this.updatePosition());
    window.requestAnimationFrame(trackFrame);
  }

  updatePosition() {
    if (!this.hasPose || !this.pose) {
      return;
    }
    // TODO(markmcd): Smooth out these position updates.

    if (this.allGood('nose')) {
      this.head.position = this.scale(this.pose['nose'].position);
      this.head.position[1] += neckLength;
    }

    // Set the torso position (center of mass) to the mean of the observed
    // torso-framing joints.
    const chestParts = ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'];
    if (this.allGood(...chestParts)) {
      this.torso.position = this.scale(this.mean(...chestParts));
    }

    // We can calculate the angle of these parts, so do so.
    const leftShoulder = this.pose['leftShoulder'].position;
    const leftElbow = this.pose['leftElbow'].position;
    const leftWrist = this.pose['leftWrist'].position;

    let leftArmOffset = [0, 0];
    if (this.allGood('leftShoulder', 'leftElbow')) {
      // 3π/2 - x to adjust to p2's reference point (0 is 12 o'clock)
      this.leftArm.angle = 3 * Math.PI / 2 - Math.atan2(
          leftShoulder.y - leftElbow.y, leftShoulder.x - leftElbow.x);

      const leftArmCenter = this.scale(this.mean('leftShoulder', 'leftElbow'));
      const leftShoulderPivot = Elf.findRotatedPivotPoint(
          this.torso.position,
          Elf.translate(this.torso.position, this.leftShoulder.pivotA),  // un-rotated pivot point
          this.torso.interpolatedAngle);
      const leftArmPivot = Elf.findRotatedPivotPoint(
          leftArmCenter,
          Elf.translate(leftArmCenter, this.leftShoulder.pivotB),
          this.leftArm.angle);
      leftArmOffset = [leftArmPivot[0] - leftShoulderPivot[0],
        leftArmPivot[1] - leftShoulderPivot[1]];
      this.leftArm.position = Elf.translate(leftArmCenter, leftArmOffset, -1);
      this.resizeBox(this.leftArm.shapes[0], this.dist('leftShoulder', 'leftElbow'), null);
    }

    if (this.allGood('leftElbow', 'leftWrist')) {
      this.leftForeArm.position =
          Elf.translate(this.scale(this.mean('leftElbow', 'leftWrist')), leftArmOffset, -1);
      this.leftForeArm.angle = this.leftHand.angle = 3 * Math.PI / 2 - Math.atan2(
          leftElbow.y - leftWrist.y, leftElbow.x - leftWrist.x);
      this.leftHand.position =
          Elf.translate(this.scale(this.pose['leftWrist'].position), leftArmOffset, -1);
      this.resizeBox(this.leftForeArm.shapes[0], this.dist('leftElbow', 'leftWrist'), null);
    }

    const rightShoulder = this.pose['rightShoulder'].position;
    const rightElbow = this.pose['rightElbow'].position;
    const rightWrist = this.pose['rightWrist'].position;

    let rightArmOffset = [0, 0];
    if (this.allGood('rightShoulder', 'rightElbow')) {
      this.rightArm.angle = 3 * Math.PI / 2 - Math.atan2(
          rightShoulder.y - rightElbow.y, rightShoulder.x - rightElbow.x);

      const rightArmCenter = this.scale(this.mean('rightShoulder', 'rightElbow'));
      const rightShoulderPivot = Elf.findRotatedPivotPoint(
          this.torso.position,
          Elf.translate(this.torso.position, this.rightShoulder.pivotA),  // un-rotated pivot point
          this.torso.interpolatedAngle);
      const rightArmPivot = Elf.findRotatedPivotPoint(
          rightArmCenter,
          Elf.translate(rightArmCenter, this.rightShoulder.pivotB),
          this.rightArm.angle);
      rightArmOffset = [rightArmPivot[0] - rightShoulderPivot[0],
          rightArmPivot[1] - rightShoulderPivot[1]];
      this.rightArm.position = Elf.translate(rightArmCenter, rightArmOffset, -1);
      this.resizeBox(this.rightArm.shapes[0], this.dist('rightShoulder', 'rightElbow'), null);
    }

    if (this.allGood('rightElbow', 'rightWrist')) {
      this.rightForeArm.position =
          Elf.translate(this.scale(this.mean('rightElbow', 'rightWrist')), rightArmOffset, -1);
      this.rightForeArm.angle = this.rightHand.angle = 3 * Math.PI / 2 - Math.atan2(
          rightElbow.y - rightWrist.y, rightElbow.x - rightWrist.x);
      this.rightHand.position =
          Elf.translate(this.scale(this.pose['rightWrist'].position), rightArmOffset, -1);
      this.resizeBox(this.rightForeArm.shapes[0], this.dist('rightElbow', 'rightWrist'), null);
    }

    const leftHip = this.pose['leftHip'].position;
    const leftKnee = this.pose['leftKnee'].position;
    const leftAnkle = this.pose['leftAnkle'].position;

    if (this.allGood('leftHip', 'leftKnee')) {
      this.leftLeg.position = this.scale(this.mean('leftHip', 'leftKnee'));
      this.leftLeg.angle = 3 * Math.PI / 2 - Math.atan2(
          leftHip.y - leftKnee.y, leftHip.x - leftKnee.x);
      this.resizeBox(this.leftLeg.shapes[0], this.dist('leftHip', 'leftKnee'), null);
    }

    if (!this.pinnedFeet && this.allGood('leftKnee', 'leftAnkle')) {
      this.leftCalf.position = this.scale(this.mean('leftKnee', 'leftAnkle'));
      this.leftCalf.angle = this.leftFoot.angle = 3 * Math.PI / 2 - Math.atan2(
          leftKnee.y - leftAnkle.y, leftKnee.x - leftAnkle.x);
      this.leftFoot.position = this.scale(this.pose['leftAnkle'].position);
      // These offsets match the local pivots used in the revolute constraint above
      this.leftFoot.position[0] += shoeWidth/2 - (shoeWidth * ankleOffset);
      this.leftFoot.position[1] -= shoeHeight/2 - (shoeWidth * ankleOffset);
      this.resizeBox(this.leftCalf.shapes[0], this.dist('leftKnee', 'leftAnkle'), null);
    }

    const rightHip = this.pose['rightHip'].position;
    const rightKnee = this.pose['rightKnee'].position;
    const rightAnkle = this.pose['rightAnkle'].position;

    if (this.allGood('rightHip', 'rightKnee')) {
      this.rightLeg.position = this.scale(this.mean('rightHip', 'rightKnee'));
      this.rightLeg.angle = 3 * Math.PI / 2 - Math.atan2(
          rightHip.y - rightKnee.y, rightHip.x - rightKnee.x);
      this.resizeBox(this.rightLeg.shapes[0], this.dist('rightHip', 'rightKnee'), null);
    }

    if (!this.pinnedFeet && this.allGood('rightKnee', 'rightAnkle')) {
      this.rightCalf.position = this.scale(this.mean('rightKnee', 'rightAnkle'));
      this.rightCalf.angle = this.rightFoot.angle = 3 * Math.PI / 2 - Math.atan2(
          rightKnee.y - rightAnkle.y, rightKnee.x - rightAnkle.x);
      this.rightFoot.position = this.scale(this.pose['rightAnkle'].position);
      this.rightFoot.position[0] -= shoeWidth/2 - (shoeWidth * ankleOffset);
      this.rightFoot.position[1] -= shoeHeight/2 - (shoeWidth * ankleOffset);
      this.resizeBox(this.rightCalf.shapes[0], this.dist('rightKnee', 'rightAnkle'), null);
    }

    // Clamp velocities. See comment on speedLimit definition.
    this.world.world.bodies.forEach((body) => {
      body.velocity = body.velocity.map((v) => Elf.clamp(v, speedLimit));
      body.angularVelocity = Elf.clamp(body.angularVelocity, speedLimit);
    })
  }

  scaleSkeleton() {
    // Scale around the center of the video feed, otherwise a person moving towards/away from the
    // camera ends up sliding off towards the top-left.
    Object.entries(this.pose).forEach(([part, pose]) => {
      this.pose[part].position = {
        x: (pose.position.x - this.videoWidth/2) * this.humanSize + this.videoWidth/2,
        y: (pose.position.y - this.videoHeight/2) * this.humanSize + this.videoHeight/2,
      };
    });
  }

  resizeBox(shape, height, width) {
    if (!this.resize) { return; }
    if (height) {
      shape.height = height;
    }
    if (width) {
      shape.width = width;
    }
    shape.updateArea();
    shape.updateBoundingRadius();
    shape.updateCenterOfMass();  // I think this is used outside of collision detection
    shape.updateTriangles();
  }

  static findRotatedPivotPoint(origin, point, rotation) {
    // To rotate around a point we first translate, then rotate, then translate back.
    return [
        Math.cos(rotation) * (point[0] - origin[0]) -
          Math.sin(rotation) * (point[1] - origin[1]) + origin[0],
        Math.sin(rotation) * (point[0] - origin[0]) +
          Math.cos(rotation) * (point[1] - origin[1]) + origin[1],
    ];
  }

  static clamp(n, limit) {
    return Math.min(Math.max(-limit, n), limit);
  }

  dist(aPose, bPose) {
    const a = this.scale(this.pose[aPose].position);
    const b = this.scale(this.pose[bPose].position);
    const x = a[0] - b[0];
    const y = a[1] - b[1];
    return Math.sqrt(x ** 2 + y ** 2);
  }

  scale({x, y}) {
    return [(x - this.videoWidth / 2) / this.world.zoom,
      -(y - this.videoHeight / 2) / this.world.zoom];
  }

  static translate(vec, offset, scale=1) {
    return [vec[0] + scale * offset[0], vec[1] + scale * offset[1]];
  }

  mean(...parts) {
    return parts.map((label) => this.pose[label]).reduce((acc, {position}) => ({
      x: acc.x + position.x / parts.length,
      y: acc.y + position.y / parts.length,
    }), {x: 0, y: 0})
  }

  allGood(...parts) {
    return parts.map((label) => this.pose[label]).every((part) => part.score > this.threshold);
  }
}
