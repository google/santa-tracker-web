import {BODY_PARTS, OTHER} from './world.js';

// The p2 world co-ordinates are centered on (0, 0), with negative Y being
// downwards and negative X being leftwards.
const
    headRadius = 2.8,
    neckLength = 0.1,
    torsoLength = 5,
    shoulderWidth = torsoLength * 0.7,
    armLength = torsoLength,
    armWidth = armLength / 2.5,
    handLength = 1.5;

export class Elf {
  constructor(world) {
    this.world = world;
    const p2World = world.world;

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
      position: [shoulderWidth/2, -torsoLength/2],
      mass: 1,
    });
    this.leftArm.zIndex = 1;
    this.leftArmShape = new p2.Box({
      width: armWidth,
      height: armLength,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.leftArmShape.img = document.getElementById('leftarm');
    this.leftArm.addShape(this.leftArmShape);
    p2World.addBody(this.leftArm);

    this.leftShoulder = new p2.RevoluteConstraint(this.torso, this.leftArm, {
      localPivotA: [shoulderWidth/2, torsoLength/2],
      localPivotB: [0, armLength/2],
      collideConnected: false,
    });
    this.leftShoulder.setLimits(-Math.PI, Math.PI);
    p2World.addConstraint(this.leftShoulder);

    this.rightArm = new p2.Body({
      position: [-shoulderWidth/2, -torsoLength/2],
      mass: 1,
    });
    this.rightArm.zIndex = 1;
    this.rightArmShape = new p2.Box({
      width: armWidth,
      height: armLength,
      collisionGroup: BODY_PARTS,
      collisionMask: OTHER,
    });
    this.rightArmShape.img = document.getElementById('rightarm');
    this.rightArm.addShape(this.rightArmShape);
    p2World.addBody(this.rightArm);

    this.rightShoulder = new p2.RevoluteConstraint(this.torso, this.rightArm, {
      localPivotA: [-shoulderWidth/2, torsoLength/2],
      localPivotB: [0, armLength/2],
      collideConnected: false,
    });
    this.rightShoulder.setLimits(-Math.PI, Math.PI);
    p2World.addConstraint(this.rightShoulder);

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

    this.leftWrist = new p2.RevoluteConstraint(this.leftArm, this.leftHand, {
      localPivotA: [0, -armLength/2],
      localPivotB: [0, handLength/2],
      collideConnected: false,
    });
    this.leftWrist.setLimits(-Math.PI / 4, Math.PI / 4);
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

    this.rightWrist = new p2.RevoluteConstraint(this.rightArm, this.rightHand, {
      localPivotA: [0, -armLength/2],
      localPivotB: [0, handLength/2],
      collideConnected: false,
    });
    this.rightWrist.setLimits(-Math.PI / 4, Math.PI / 4);
    p2World.addConstraint(this.rightWrist);
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

    this.head.position = scale(part('nose').position);

    // Set the torso position (center of mass) to the mean of the observed
    // torso-framing joints.
    // TODO(markmcd): filter out low-conf parts, but don't update if <2
    // parts or only 2 adjacent parts.
    const torso = ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip']
        .map((label) => part(label));
    const position = torso.reduce((acc, {position}) => ({
      x: acc.x + position.x / torso.length,
      y: acc.y + position.y / torso.length,
    }), {x: 0, y: 0});
    this.torso.position = scale(position);

    this.leftArm.position = scale(part('leftElbow').position);
    this.rightArm.position = scale(part('rightElbow').position);

    this.leftHand.position = scale(part('leftWrist').position);
    this.rightHand.position = scale(part('rightWrist').position);
  }
}