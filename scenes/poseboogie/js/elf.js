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
    legWidth = legLength / 5;

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
    this.head.zIndex = 2;

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
    this.leftForeArm.zIndex = 1;
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
    this.rightForeArm.zIndex = 1;
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
      position: [shoulderWidth/2, -torsoLength - legLength/2],
      mass: 1,
    });
    this.leftLeg.zIndex = 1;
    this.leftLegShape = new p2.Box({
      width: legWidth,
      height: legLength,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.leftLegShape.img = document.getElementById('leg');
    this.leftLeg.addShape(this.leftLegShape);
    p2World.addBody(this.leftLeg);

    this.leftHip = new p2.RevoluteConstraint(this.torso, this.leftLeg, {
      localPivotA: [shoulderWidth/2, -torsoLength/2],
      localPivotB: [0, legLength/2],
      collideConnected: false,
    });
    this.leftHip.setLimits(-Math.PI/2, Math.PI/2);
    p2World.addConstraint(this.leftHip);

    this.rightLeg = new p2.Body({
      position: [-shoulderWidth/2, -torsoLength - legLength/2],
      mass: 1,
    });
    this.rightLeg.zIndex = 1;
    this.rightLegShape = new p2.Box({
      width: legWidth,
      height: legLength,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.rightLegShape.img = document.getElementById('leg');
    this.rightLeg.addShape(this.rightLegShape);
    p2World.addBody(this.rightLeg);

    this.rightHip = new p2.RevoluteConstraint(this.torso, this.rightLeg, {
      localPivotA: [-shoulderWidth/2, -torsoLength/2],
      localPivotB: [0, legLength/2],
      collideConnected: false,
    });
    this.rightHip.setLimits(-Math.PI/2, Math.PI/2);
    p2World.addConstraint(this.rightHip);
  }

  track(videoConfig) {
    this.videoWidth = videoConfig.videoWidth;
    this.videoHeight = videoConfig.videoHeight;

    const trackFrame = () => {
      videoConfig.net.estimateSinglePose(videoConfig.video, videoConfig.imageScaleFactor,
            videoConfig.flipHorizontal, videoConfig.outputStride)
          .then((pose) => {
            this.pose = pose;
            document.getElementById('textdump').innerText = JSON.stringify(pose, null, 2);
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

    const scale = ({x, y}) => [(x - this.videoWidth / 2) / this.world.zoom,
      -(y - this.videoHeight / 2) / this.world.zoom];
    const part = part => this.pose.keypoints.find(k => k.part === part);
    const mean = partList => {
      const parts = partList.map((label) => part(label));
      return parts.reduce((acc, {position}) => ({
        x: acc.x + position.x / parts.length,
        y: acc.y + position.y / parts.length,
      }), {x: 0, y: 0});
    };

    this.head.position = scale(part('nose').position);

    // Set the torso position (center of mass) to the mean of the observed
    // torso-framing joints.
    // TODO(markmcd): filter out low-conf parts, but don't update if <2
    // parts or only 2 adjacent parts.
    this.torso.position = scale(mean([
      'leftShoulder', 'rightShoulder', 'leftHip', 'rightHip']));

    // We can calculate the angle of these parts, so do so.
    // TODO(markmcd): Should we cache part() calls?
    const leftShoulder = part('leftShoulder').position;
    const leftElbow = part('leftElbow').position;
    const leftWrist = part('leftWrist').position;
    // π/2 - x to adjust to p2's reference point (0 is 12 o'clock)
    this.leftArm.angle = Math.PI / 2 - Math.atan2(
        leftShoulder.y - leftElbow.y, leftShoulder.x - leftElbow.x);
    this.leftForeArm.angle = Math.PI / 2 - Math.atan2(
        leftElbow.y - leftWrist.y, leftElbow.x - leftWrist.x);

    const rightShoulder = part('rightShoulder').position;
    const rightElbow = part('rightElbow').position;
    const rightWrist = part('rightWrist').position;
    this.rightArm.angle = Math.PI / 2 - Math.atan2(
        rightShoulder.y - rightElbow.y, rightShoulder.x - rightElbow.x);
    this.rightForeArm.angle = Math.PI / 2 - Math.atan2(
        rightElbow.y - rightWrist.y, rightElbow.x - rightWrist.x);

    this.leftArm.position = scale(mean(['leftShoulder', 'leftElbow']));
    this.leftForeArm.position = scale(mean(['leftElbow', 'leftWrist']));
    this.rightArm.position = scale(mean(['rightShoulder', 'rightElbow']));
    this.rightForeArm.position = scale(mean(['rightElbow', 'rightWrist']));

    this.leftHand.position = scale(part('leftWrist').position);
    this.rightHand.position = scale(part('rightWrist').position);

    this.leftLeg.position = scale(part('leftKnee').position);
    this.rightLeg.position = scale(part('rightKnee').position);
  }
}