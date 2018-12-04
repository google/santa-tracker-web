import {drawBody, drawCurve} from './pose.js';

// collision groups
export const
    OTHER = Math.pow(2,1),
    BODY_PARTS = Math.pow(2,2);

export class World {
  constructor(config) {
    this.config = config;
    this.world = new p2.World({
      // supply downwards gravity
      gravity: [0, -9.8],
    });
    this.paused = true;

    // This is the ratio of p2 units to canvas pixels & controls how big the
    // world shapes appear on the canvas.
    this.zoom = 50;
  }

  animate(canvas) {
    // To animate the bodies, we must step the world forward in time, using a
    // fixed time step size. The World will run substeps and interpolate
    // automatically for us, to get smooth animation.
    const fixedTimeStep = 1 / 60;  // seconds
    const maxSubSteps = 10;  // Max sub steps to catch up with the wall clock
    let lastTime;

    // Animation loop
    const animatePuppet = (time) => {
      window.requestAnimationFrame(animatePuppet);

      // Render
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      const ctx = canvas.getContext("2d");
      const [w, h] = [canvas.width, canvas.height];
      ctx.clearRect(0, 0, w, h);

      if (this.paused) {
        lastTime = 0;
        return;
      }

      // Use the p2 coordinate system
      ctx.save();
      ctx.translate(w / 2, h / 2);  // Translate to the center
      ctx.scale(this.zoom, -this.zoom);   // Zoom in and flip y axis

      // Compute elapsed time since last render frame
      let deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

      // Move bodies forward in time
      this.world.step(fixedTimeStep, deltaTime, maxSubSteps);

      // Sort bodies by z-index to ensure they're drawn correctly.
      const bodies = this.world.bodies.sort((a, b) => a.zIndex - b.zIndex);
      const alreadyDrawn = {};

      // And draw!
      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        if (this.config.smoothLimbs && body.curveWith !== undefined) {
          // curveWidth is defined, but false when it's part of a curve, but not the originating
          // part. Order matters for drawCurve, so we need to ensure it's ordered correctly, and
          // not drawn as a body, below. We can't rely on definition order as z-index sorting may
          // change the order.
          if (body.curveWith) {
            drawCurve(body, body.curveWith, ctx, this.config.quadraticElbows);
            alreadyDrawn[body.curveWith.id] = true;
          }
        } else if (!(body.id in alreadyDrawn)) {
          drawBody(body, ctx);
        }
      }

      lastTime = time;
      ctx.restore();
    };

    window.requestAnimationFrame(animatePuppet);
  }
}