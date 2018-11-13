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
    this.head.zIndex = 1.5;

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
    this.neckJoint.setLimits(-Math.PI / 8, Math.PI / 8);  // π/4 = 45°
    p2World.addConstraint(this.neckJoint);

    this.leftArm = new p2.Body({
      position: [shoulderWidth/2, -torsoLength/2 + armLength/2],
      mass: 1,
    });
    this.leftArm.zIndex = 1;
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
    this.leftShoulder.setLimits(-Math.PI, Math.PI);
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

    this.leftElbow = new p2.RevoluteConstraint(this.leftArm, this.leftForeArm, {
      localPivotA: [0, -armLength/4],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    this.leftElbow.setLimits(-Math.PI/2, Math.PI/2);
    p2World.addConstraint(this.leftElbow);

    this.rightArm = new p2.Body({
      position: [-shoulderWidth/2, -torsoLength/2 + armLength/2],
      mass: 1,
    });
    this.rightArm.zIndex = 1;
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
    this.rightShoulder.setLimits(-Math.PI, Math.PI);
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

    this.rightElbow = new p2.RevoluteConstraint(this.rightArm, this.rightForeArm, {
      localPivotA: [0, -armLength/4],
      localPivotB: [0, armLength/4],
      collideConnected: false,
    });
    this.rightElbow.setLimits(-Math.PI/2, Math.PI/2);
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
    this.leftWrist.setLimits(Math.PI / 4, -Math.PI / 4);
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
    this.rightWrist.setLimits(Math.PI / 4, -Math.PI / 4);
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

    this.leftHip = new p2.RevoluteConstraint(this.torso, this.leftLeg, {
      localPivotA: [shoulderWidth/2, -torsoLength/2],
      localPivotB: [0, legLength/4],
      collideConnected: false,
    });
    this.leftHip.setLimits(-Math.PI/2, Math.PI/2);
    p2World.addConstraint(this.leftHip);

    this.leftKnee = new p2.RevoluteConstraint(this.leftLeg, this.leftCalf, {
      localPivotA: [0, -legLength/4],
      localPivotB: [0, legLength/4],
      collideConnected: false,
    });
    this.leftKnee.setLimits(-Math.PI/2, Math.PI/2);
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

    this.rightHip = new p2.RevoluteConstraint(this.torso, this.rightLeg, {
      localPivotA: [-shoulderWidth/2, -torsoLength/2],
      localPivotB: [0, legLength/4],
      collideConnected: false,
    });
    this.rightHip.setLimits(-Math.PI/2, Math.PI/2);
    p2World.addConstraint(this.rightHip);

    this.rightKnee = new p2.RevoluteConstraint(this.rightLeg, this.rightCalf, {
      localPivotA: [0, -legLength/4],
      localPivotB: [0, legLength/4],
      collideConnected: false,
    });
    this.rightKnee.setLimits(-Math.PI/2, Math.PI/2);
    p2World.addConstraint(this.rightKnee);
  }

  track(videoConfig) {
    this.videoWidth = videoConfig.videoWidth;
    this.videoHeight = videoConfig.videoHeight;

    const trackFrame = () => {
      videoConfig.net.estimateSinglePose(videoConfig.video, videoConfig.imageScaleFactor,
            videoConfig.flipHorizontal, videoConfig.outputStride)
          .then((pose) => {
            this.pose = pose.keypoints.reduce((dict, kp) => ({...dict, [kp.part]: kp}), {});
            if (videoConfig.debug) {
              document.getElementById('textdump').innerText = JSON.stringify(pose, null, 2);
            }
          })
          .catch((reason) => {
            console.error('Pose estimation failed!', reason);
          })
          .then(() => window.requestAnimationFrame(trackFrame));
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

    this.head.position = this.scale(this.pose['nose'].position);

    // Set the torso position (center of mass) to the mean of the observed
    // torso-framing joints.
    // TODO(markmcd): filter out low-conf parts, but don't update if <2
    // parts or only 2 adjacent parts.
    this.torso.position = this.scale(this.mean([
      'leftShoulder', 'rightShoulder', 'leftHip', 'rightHip']));

    // We can calculate the angle of these parts, so do so.
    const leftShoulder = this.pose['leftShoulder'].position;
    const leftElbow = this.pose['leftElbow'].position;
    const leftWrist = this.pose['leftWrist'].position;
    // 3π/2 - x to adjust to p2's reference point (0 is 12 o'clock)
    this.leftArm.angle = 3 * Math.PI / 2 - Math.atan2(
        leftShoulder.y - leftElbow.y, leftShoulder.x - leftElbow.x);
    this.leftForeArm.angle = this.leftHand.angle = 3 * Math.PI / 2 - Math.atan2(
        leftElbow.y - leftWrist.y, leftElbow.x - leftWrist.x);

    const rightShoulder = this.pose['rightShoulder'].position;
    const rightElbow = this.pose['rightElbow'].position;
    const rightWrist = this.pose['rightWrist'].position;
    this.rightArm.angle = 3 * Math.PI / 2 - Math.atan2(
        rightShoulder.y - rightElbow.y, rightShoulder.x - rightElbow.x);
    this.rightForeArm.angle = this.rightHand.angle = 3 * Math.PI / 2 - Math.atan2(
        rightElbow.y - rightWrist.y, rightElbow.x - rightWrist.x);

    this.leftArm.position = this.scale(this.mean(['leftShoulder', 'leftElbow']));
    this.leftForeArm.position = this.scale(this.mean(['leftElbow', 'leftWrist']));
    this.rightArm.position = this.scale(this.mean(['rightShoulder', 'rightElbow']));
    this.rightForeArm.position = this.scale(this.mean(['rightElbow', 'rightWrist']));

    this.leftHand.position = this.scale(this.pose['leftWrist'].position);
    this.rightHand.position = this.scale(this.pose['rightWrist'].position);

    const leftHip = this.pose['leftHip'].position;
    const leftKnee = this.pose['leftKnee'].position;
    const leftAnkle = this.pose['leftAnkle'].position;
    this.leftLeg.angle = Math.PI / 2 - Math.atan2(
        leftHip.y - leftKnee.y, leftHip.x - leftKnee.x);
    this.leftCalf.angle = Math.PI / 2 - Math.atan2(
        leftKnee.y - leftAnkle.y, leftKnee.x - leftAnkle.x);

    const rightHip = this.pose['rightHip'].position;
    const rightKnee = this.pose['rightKnee'].position;
    const rightAnkle = this.pose['rightAnkle'].position;
    this.rightLeg.angle = Math.PI / 2 - Math.atan2(
        rightHip.y - rightKnee.y, rightHip.x - rightKnee.x);
    this.rightCalf.angle = Math.PI / 2 - Math.atan2(
        rightKnee.y - rightAnkle.y, rightKnee.x - rightAnkle.x);

    this.leftLeg.position = this.scale(this.mean(['leftHip', 'leftKnee']));
    this.leftCalf.position = this.scale(this.mean(['leftKnee', 'leftAnkle']));
    this.rightLeg.position = this.scale(this.mean(['rightHip', 'rightKnee']));
    this.rightCalf.position = this.scale(this.mean(['rightKnee', 'rightAnkle']));
  }

  scale({x, y}) {
    return [(x - this.videoWidth / 2) / this.world.zoom,
      -(y - this.videoHeight / 2) / this.world.zoom];
  }

  mean(parts) {
    return parts.map((label) => this.pose[label]).reduce((acc, {position}) => ({
      x: acc.x + position.x / parts.length,
      y: acc.y + position.y / parts.length,
    }), {x: 0, y: 0})
  }
}
