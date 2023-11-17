goog.provide('app.Present');

const material0 = new THREE.MeshToonMaterial( {color: 0xF9D231}); 

// the distance to the target scaled by this number is how high we go
const midpointOffset = .25;

// a value from 0 to 1 that defines the peak height
const midpointT = .25;

class Present {
    constructor(loader, scene, giftWrapMaterial) {
        this.scene = scene;
        this.inFlight = false;
        this.landed = false;
        this.totalFlightTime = .25;
        this.currentFlightTime = 0;

        loader.load( "models/gift.obj", obj => {
            obj.scale.setScalar(0.001);
            for (let i = 0; i < obj.children.length; i++) {          
                if (i !== 4) {
                  obj.children[i].material = material0;
                } else {
                  obj.children[i].material = giftWrapMaterial;
                }
              }
            this.model = obj;
            this.scene.camera.add(obj);
            obj.position.set(.125, -.125, -1);
        });
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