goog.provide('app.Present');

const material0 = new THREE.MeshToonMaterial( {color: 0xF9D231}); 

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
            console.log("Present added");
        });
    }

    shoot(targetPosition) {
        this.scene.scene.attach(this.model);
        this.targetPosition = targetPosition.clone();
        this.startPosition = new THREE.Vector3();
        this.model.getWorldPosition(this.startPosition);

        var midpoint = new THREE.Vector3(this.targetPosition, this.startPosition);
        midpoint.multiplyScalar(0.5);
        midpoint.setY(midpoint.y + 3);
        this.curve = new THREE.QuadraticBezierCurve3(this.startPosition, midpoint, this.targetPosition);
        this.inFlight = true;
    }

    update(seconds, deltaSeconds) {
        if (this.inFlight) {
            if (this.currentFlightTime > this.totalFlightTime) {
                this.landed = true;
                this.model.position.copy(this.targetPosition);
                // call some kind of function to update score if good hit
            } else if (this.model) {
                var t = this.currentFlightTime/this.totalFlightTime;
                console.log(t);
                // console.log(this.currentFlightTime);
                // console.log(this.totalFlightTime);
                // this.model.position.copy(this.curve.getPoint(t));
                var vec = new THREE.Vector3();
                vec.copy(this.targetPosition);
                vec.multiplyScalar(t);
                vec.addScaledVector(this.startPosition, 1-t);
                this.model.position.copy(vec);
                // this.model.position.copy(t * this.targetPosition + (1-t) * this.startPosition);
                // console.log(this.curve.getPoint(t));
                // this.model.position.copy(this.targetPosition);
                this.currentFlightTime = this.currentFlightTime + deltaSeconds;
            }
        } else if (!this.landed && this.model) {
            // Maybe change this later but for now just float in front of the camera
            // this.model.position.copy(this.scene.getCameraPosition(seconds + 2));
        }
    }
}

app.Present = Present;