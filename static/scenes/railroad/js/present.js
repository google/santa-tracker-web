goog.provide('app.Present');

const material0 = new THREE.MeshToonMaterial( {color: 0xF9D231});
const loader = new THREE.OBJLoader();

let loadedObj;

const gravity = -20; // acceleration along y
const linearThrowSpeed = 20; // velocity in the x/z plane
const maxThrowVelocity = 8; // after we get to this dy, switch to changing gravity

class Present {

    static async preload() {
        loadedObj = await loader.loadAsync("models/gift.obj");
    }

    constructor(scene, giftWrapMaterial, parent, offset) {
        if (loadedScene == undefined) {
            throw 'Must call Present.preload() before constructing instance.'
        }

        if (parent == undefined) {
            // Note: in the future we may want it to spawn outside of the scene
            // the logic will have to rework a little
            throw 'Present must be parented to something';
        }

        // Physics stuff
        this.inFlight = false;
        this.landed = false;

        // start of the throw
        this.startPosition = new THREE.Vector3();

        // end of the throw
        this.endPosition = new THREE.Vector3();

        // how long it's going to take to complete the throw
        this.durationOfThrow = 0;

        // how long we've been throwing
        this.currentFlightTime = 0;

        // Velocity y to create a nice arch
        this.velocityY = 0;

        // Gravity to use
        this.gravity = gravity;

        // Scene stuff
        this.scene = scene;
        this.model = loadedObj.clone();
        this.model.scale.setScalar(0.001);
        for (let i = 0; i < this.model.children.length; i++) {
            if (i !== 4) {
                this.model.children[i].material = material0;
            } else {
                this.model.children[i].material = giftWrapMaterial;
            }
        }

        parent.add(this.model);
        if (offset) {
            this.model.position.copy(offset);
        }
    }

    shoot(targetPosition) {
        // Move to world space to handle the throw
        this.scene.scene.attach(this.model);

        // new throwing algorithm
        // specify fixed throwing velocity V_x
        // calculate maxT to travel linear distance to target
        // a V_y is chosen given a gravity constant to always look good

        // cache the start and end positions for math later
        this.targetPosition = targetPosition.clone();
        this.model.getWorldPosition(this.startPosition);

        // calculate variables we need to calculate physics stuff
        var throwDistance = this.startPosition.distanceTo(this.targetPosition);
        this.durationOfThrow = throwDistance/linearThrowSpeed;

        // if we know gravity, the height delta, and how long the throw takes,
        // we can choose a start y velocity that will last through the throw
        this.velocityY = (this.targetPosition.y - this.startPosition.y) / this.durationOfThrow
            - gravity * this.durationOfThrow / 2;

        // the predicted linear Vy assuming no gravity
        const initialVy = this.targetPosition.clone().sub(this.startPosition).normalize().y * linearThrowSpeed;

        if (this.velocityY > maxThrowVelocity + initialVy) {
            // cap the throw velocity and change gravity
            this.velocityY = maxThrowVelocity + initialVy;
            this.gravity = 2 * (targetPosition.y - this.startPosition.y) / (this.durationOfThrow * this.durationOfThrow)
                - 2 * this.velocityY / this.durationOfThrow;
        }
        else {
            this.gravity = gravity;
        }

        // update the state
        this.currentFlightTime = 0;
        this.inFlight = true;
    }

    update(seconds, deltaSeconds) {
        if (this.inFlight && !this.landed) {
            if (this.currentFlightTime > this.durationOfThrow) {
                this.landed = true;
                this.model.position.copy(this.targetPosition);
            } else {
                var t = this.currentFlightTime/this.durationOfThrow;
        
                // we move in the x/z plane with a lerp. This could be
                // optimized by not doing y stuff yere, but it wouldn't be as
                // readable
                var position = this.startPosition.clone();
                position.lerp(this.targetPosition, t);
        
                // This is the most basic ballistic trajectory equation you can
                // have. Only effects y
                position.y = this.startPosition.y
                    + this.velocityY * this.currentFlightTime
                    + 1/2 * this.gravity * this.currentFlightTime * this.currentFlightTime;
        
                this.model.position.copy(position);

                this.currentFlightTime = this.currentFlightTime + deltaSeconds;
            }
        }
    }

    removeFromScene() {
        this.model.removeFromParent();
    }
}

app.Present = Present;