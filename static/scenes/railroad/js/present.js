goog.provide('app.Present');

const material0 = new THREE.MeshToonMaterial( {color: 0xF9D231});
const loader = new THREE.OBJLoader();

let loadedObj;

// the distance to the target scaled by this number is how high we go
const midpointOffset = .25;

// a value from 0 to 1 that defines the peak height
const midpointT = .25;

class Present {

    static async preload() {
        loadedObj = await loader.loadAsync("models/gift.obj");
    }

    constructor(scene, giftWrapMaterial) {
        if (loadedScene == undefined) {
            throw 'Must call Present.preload() before constructing instance.'
        }

        this.scene = scene;
        this.inFlight = false;
        this.landed = false;
        this.totalFlightTime = .25;
        this.currentFlightTime = 0;
        this.model = loadedObj.clone();
        this.model.scale.setScalar(0.001);
        for (let i = 0; i < this.model.children.length; i++) {
            if (i !== 4) {
                this.model.children[i].material = material0;
            } else {
                this.model.children[i].material = giftWrapMaterial;
            }
        }

        // TODO: after this commit move this pack out to present-system.
        this.scene.camera.add(this.model);
        this.model.position.set(.125, -.125, -1);
    }

    shoot(targetPosition) {
        this.scene.scene.attach(this.model);
        this.targetPosition = targetPosition.clone();
        this.startPosition = new THREE.Vector3();
        this.model.getWorldPosition(this.startPosition);

        var midpoint = this.startPosition.clone()
            .multiplyScalar(1-midpointT)
            .addScaledVector(this.targetPosition, midpointT)
            .add(new THREE.Vector3(0, this.startPosition.distanceTo(this.targetPosition) * midpointOffset));

        this.curve = new THREE.QuadraticBezierCurve3(this.startPosition.clone(), midpoint.clone(), this.targetPosition.clone());

        this.inFlight = true;
    }

    addDebugGeo() {
        const points = this.curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({color: 0x00ff00});
        const curveObject = new THREE.Line(geometry, material);
        this.scene.scene.add(curveObject);
    }

    update(seconds, deltaSeconds) {
        // TODO: move this all into present system
        if (this.inFlight) {
            if (this.currentFlightTime > this.totalFlightTime) {
                this.landed = true;
                this.model.position.copy(this.targetPosition);
                // call some kind of function to update score if good hit
            } else if (this.model) {
                var t = this.currentFlightTime/this.totalFlightTime;
                this.model.position.copy(this.curve.getPoint(t));
                this.currentFlightTime = this.currentFlightTime + deltaSeconds;
            }
        }
    }
}

app.Present = Present;