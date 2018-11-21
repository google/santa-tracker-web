import * as posenet from '@tensorflow-models/posenet';
import {BODY_PARTS, OTHER} from './world.js';

// The p2 world co-ordinates are centered on (0, 0), with negative Y being
// downwards and negative X being leftwards.
const
    headRadius = 2.8,
    neckLength = 0.1,
    torsoLength = 5,
    shoulderWidth = torsoLength * 0.7,
    armLength = torsoLength,
    armWidth = armLength / 3,
    handLength = 1.5,
    legLength = 5,
    legWidth = legLength / 2.5;

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

export class Elf {
  constructor(world) {
    this.world = world;
    const p2World = world.world;

    // [0, 0] is the center of the body at the point below the head and above
    // the torso. Body positions define the center of mass for the body, which
    // by default, is the center of the shape.

    this.head = new p2.Body({
      position: [0, headRadius],
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
      position: [0, -torsoLength/2],
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
      position: [shoulderWidth/2, -torsoLength/2 + armLength/2],
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
      localPivotA: [shoulderWidth/2, torsoLength/2],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.leftShoulder);

    this.leftForeArm = new p2.Body({
      position: [shoulderWidth/2, -torsoLength/2 - armLength/2],
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

    this.leftElbow = new p2.RevoluteConstraint(this.leftArm, this.leftForeArm, {
      localPivotA: [0, -armLength/4],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.leftElbow);

    this.rightArm = new p2.Body({
      position: [-shoulderWidth/2, -torsoLength/2 + armLength/2],
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
      localPivotA: [-shoulderWidth/2, torsoLength/2],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.rightShoulder);

    this.rightForeArm = new p2.Body({
      position: [-shoulderWidth/2, -torsoLength/2 - armLength/2],
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

    this.rightElbow = new p2.RevoluteConstraint(this.rightArm, this.rightForeArm, {
      localPivotA: [0, -armLength/4],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    p2World.addConstraint(this.rightElbow);

    this.leftHand = new p2.Body({
      position: [shoulderWidth/2, -torsoLength - handLength/2],
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
      position: [-shoulderWidth/2, -torsoLength - handLength/2],
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
      position: [shoulderWidth/2, -torsoLength - legLength/4],
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
      position: [shoulderWidth/2, -torsoLength - legLength*3/4],
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

    this.leftHip = new p2.RevoluteConstraint(this.torso, this.leftLeg, {
      localPivotA: [shoulderWidth/2, -torsoLength/2],
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

    this.rightLeg = new p2.Body({
      position: [-shoulderWidth/2, -torsoLength - legLength/4],
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
      position: [-shoulderWidth/2, -torsoLength - legLength*3/4],
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

    this.rightHip = new p2.RevoluteConstraint(this.torso, this.rightLeg, {
      localPivotA: [-shoulderWidth/2, -torsoLength/2],
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
  }

  enableLimits(enabled) {
    if (enabled) {
      this.neckJoint.setLimits(-Math.PI / 8, Math.PI / 8);  // π/4 = 45°
      this.leftShoulder.setLimits(-Math.PI, Math.PI);
      this.leftElbow.setLimits(-Math.PI/2, Math.PI/2);
      this.rightShoulder.setLimits(-Math.PI, Math.PI);
      this.rightElbow.setLimits(-Math.PI/2, Math.PI/2);
      this.leftWrist.setLimits(Math.PI / 4, -Math.PI / 4);
      this.rightWrist.setLimits(Math.PI / 4, -Math.PI / 4);
      this.leftHip.setLimits(-Math.PI/2, Math.PI/2);
      this.leftKnee.setLimits(-Math.PI/2, Math.PI/2);
      this.rightHip.setLimits(-Math.PI/2, Math.PI/2);
      this.rightKnee.setLimits(-Math.PI/2, Math.PI/2);
    } else {
      this.neckJoint.setLimits(false, false);
      this.leftShoulder.setLimits(false, false);
      this.leftElbow.setLimits(false, false);
      this.rightShoulder.setLimits(false, false);
      this.rightElbow.setLimits(false, false);
      this.leftWrist.setLimits(false, false);
      this.rightWrist.setLimits(false, false);
      this.leftHip.setLimits(false, false);
      this.leftKnee.setLimits(false, false);
      this.rightHip.setLimits(false, false);
      this.rightKnee.setLimits(false, false);
    }
  }

  track(videoConfig, appConfig) {
    this.videoWidth = videoConfig.videoWidth;
    this.videoHeight = videoConfig.videoHeight;

    const trackFrame = () => {
      this.threshold = appConfig.minPartConfidence;
      this.resize = appConfig.resizeBodyParts;
      this.enableLimits(appConfig.enableJointLimits);
      this.humanSize = appConfig.humanSize;

      // Reload the model if the UI setting has changed
      let loadModel = Promise.resolve(videoConfig.net);
      if (appConfig.modelReload) {
        videoConfig.net.dispose();
        videoConfig.net.discarded = true;
        appConfig.modelReload = false;
        loadModel = posenet.load(+appConfig.mobileNetArchitecture);
      }

      loadModel.then((net) => {
        videoConfig.net = net;
        net.estimateSinglePose(videoConfig.video, appConfig.imageScaleFactor,
                appConfig.flipHorizontal, +appConfig.outputStride)
            .then((pose) => {
              // TODO(markmcd): check the overall pose score, show help info / error state
              this.pose = pose.keypoints.reduce((dict, kp) => ({...dict, [kp.part]: kp}), {});
              this.scaleSkeleton();
              if (appConfig.debug) {
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
    if (!this.pose) {
      return;
    }
    // TODO(markmcd): Smooth out these position updates.
    // TODO(markmcd): Sanity check keypoints / scores and give user feedback
    // Some cases we could check for easily:
    // - If head / leg / hand positions are outside of the video frame
    // - If the hips are twisted relative to the shoulders
    // - If parts are below low thresholds (e.g. <0.2)
    // These cause the model to glitch out, so warn the user to get back into
    // the frame.

    if (this.allGood('nose')) {
      this.head.position = this.scale(this.pose['nose'].position);
    }
    if (this.allGood('leftEar', 'rightEar')) {
      this.resizeCircle(this.head.shapes[0], this.dist('leftEar', 'rightEar') * headRadius / 2);
    }

    // Set the torso position (center of mass) to the mean of the observed
    // torso-framing joints.
    // TODO(markmcd): filter out low-conf parts, but don't update if <2
    // parts or only 2 adjacent parts.
    const chestParts = ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'];
    if (this.allGood(...chestParts)) {
      this.torso.position = this.scale(this.mean(...chestParts));
    }
    // Prefer scaling with the long sides, as they more accurately represent torso size
    // (shoulders/hips work, but when they converge it's probably rotation).
    if (this.allGood('leftHip', 'leftShoulder')) {
      this.resizeBox(this.torso.shapes[0], this.dist('leftHip', 'leftShoulder'), null);
    } else if (this.allGood('rightHip', 'rightShoulder')) {
      this.resizeBox(this.torso.shapes[0], this.dist('rightHip', 'rightShoulder'), null);
    } else if (this.allGood('leftShoulder', 'rightShoulder')) {
      this.resizeBox(this.torso.shapes[0], null, this.dist('leftShoulder', 'rightShoulder'));
    } else if (this.allGood('leftHip', 'rightHip')) {
      this.resizeBox(this.torso.shapes[0], null, this.dist('leftHip', 'rightHip'));
    }

    // We can calculate the angle of these parts, so do so.
    const leftShoulder = this.pose['leftShoulder'].position;
    const leftElbow = this.pose['leftElbow'].position;
    const leftWrist = this.pose['leftWrist'].position;

    if (this.allGood('leftShoulder', 'leftElbow')) {
      this.leftArm.position = this.scale(this.mean('leftShoulder', 'leftElbow'));
      // 3π/2 - x to adjust to p2's reference point (0 is 12 o'clock)
      this.leftArm.angle = 3 * Math.PI / 2 - Math.atan2(
          leftShoulder.y - leftElbow.y, leftShoulder.x - leftElbow.x);
      // TODO(markmcd): is preserving aspect ratio the right thing to do here? things get chunky.
      this.resizeBox(this.leftArm.shapes[0], this.dist('leftShoulder', 'leftElbow'), null);
    }

    if (this.allGood('leftElbow', 'leftWrist')) {
      this.leftForeArm.position = this.scale(this.mean('leftElbow', 'leftWrist'));
      this.leftForeArm.angle = this.leftHand.angle = 3 * Math.PI / 2 - Math.atan2(
          leftElbow.y - leftWrist.y, leftElbow.x - leftWrist.x);
      this.leftHand.position = this.scale(this.pose['leftWrist'].position);
      // TODO(markmcd): resize hands/feet
      this.resizeBox(this.leftForeArm.shapes[0], this.dist('leftElbow', 'leftWrist'), null);
    }

    const rightShoulder = this.pose['rightShoulder'].position;
    const rightElbow = this.pose['rightElbow'].position;
    const rightWrist = this.pose['rightWrist'].position;

    if (this.allGood('rightShoulder', 'rightElbow')) {
      this.rightArm.position = this.scale(this.mean('rightShoulder', 'rightElbow'));
      this.rightArm.angle = 3 * Math.PI / 2 - Math.atan2(
          rightShoulder.y - rightElbow.y, rightShoulder.x - rightElbow.x);
      this.resizeBox(this.rightArm.shapes[0], this.dist('rightShoulder', 'rightElbow'), null);
    }

    if (this.allGood('rightElbow', 'rightWrist')) {
      this.rightForeArm.position = this.scale(this.mean('rightElbow', 'rightWrist'));
      this.rightForeArm.angle = this.rightHand.angle = 3 * Math.PI / 2 - Math.atan2(
          rightElbow.y - rightWrist.y, rightElbow.x - rightWrist.x);
      this.rightHand.position = this.scale(this.pose['rightWrist'].position);
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

    if (this.allGood('leftKnee', 'leftAnkle')) {
      this.leftCalf.position = this.scale(this.mean('leftKnee', 'leftAnkle'));
      this.leftCalf.angle = 3 * Math.PI / 2 - Math.atan2(
          leftKnee.y - leftAnkle.y, leftKnee.x - leftAnkle.x);
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

    if (this.allGood('rightKnee', 'rightAnkle')) {
      this.rightCalf.position = this.scale(this.mean('rightKnee', 'rightAnkle'));
      this.rightCalf.angle = 3 * Math.PI / 2 - Math.atan2(
          rightKnee.y - rightAnkle.y, rightKnee.x - rightAnkle.x);
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

  resizeCircle(shape, newRadius) {
    if (!this.resize) { return; }
    shape.radius = newRadius;
    // These seem to only matter when using collision detection, but are recommended so ¯\_(ツ)_/¯
    shape.updateArea();
    shape.updateBoundingRadius();
  }

  resizeBox(shape, height, width) {
    if (!this.resize) { return; }
    if (height && width) {
      shape.height = height;
      shape.width = width;
    } else if (height) {
      shape.width = shape.width / (shape.height / height);
      shape.height = height;
    } else if (width) {
      shape.height = shape.height / (shape.width / width);
      shape.width = width;
    }
    shape.updateArea();
    shape.updateBoundingRadius();
    shape.updateCenterOfMass();  // I think this is used outside of collision detection
    shape.updateTriangles();
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
