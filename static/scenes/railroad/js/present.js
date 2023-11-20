goog.provide('app.Present');

const material0 = new THREE.MeshToonMaterial( {color: 0xF9D231});
const loader = new THREE.OBJLoader();

let loadedObj;

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
        this.totalFlightTime = 4;
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
    }

    shoot(targetPosition) {
        this.targetPosition = targetPosition;
        this.startPosition = this.model.position;

        var midpoint = new THREE.Vector3().add(this.targetPosition, this.startPosition).multiplyScalar(0.5);
        midpoint.setY(midpoint.y + 3);
        this.curve = new THREE.QuadraticBezierCurve3(this.startPosition, midpoint, this.targetPosition);
        this.inFlight = true;
    }

    update(seconds, deltaSeconds) {
        if (this.inFlight) {
            if (this.currentFlightTime > this.totalFlightTime) {
                this.landed = true;
                // call some kind of function to update score if good hit
            } else if (this.model) {
                var t = this.currentFlightTime/this.totalFlightTime;
                console.log(t);
                console.log(this.currentFlightTime);
                console.log(this.totalFlightTime);
                this.model.position.copy(this.curve.getPoint(t));
                console.log(this.curve.getPoint(t));
                this.currentFlightTime = this.currentFlightTime + deltaSeconds;
            }
        } else if (!this.landed && this.model) {
            // Maybe change this later but for now just float in front of the camera
            this.model.position.copy(this.scene.getCameraPosition(seconds + 2));
        }
    }
}

app.Present = Present;