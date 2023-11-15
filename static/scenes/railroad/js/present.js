goog.provide('app.Present');

class Present {

    constructor(loader, scene, giftWrapMaterial) {
        this.scene = scene;
        this.inFlight = false;
        this.landed = false;
        this.pointIndex = 0;

        const material0 = new THREE.MeshToonMaterial( {color: 0xF9D231}); 

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
            this.scene.getScene().add(obj);
            console.log("Present added");
        });
    }

    shoot(targetPosition) {
        this.targetPosition = targetPosition;
        this.startPosition = this.model.position;

        const midpoint = new THREE.Vector3().add(this.targetPosition, this.startPosition).multiplyScalar(0.5);
        midpoint.setY(midpoint.y + 3);
        this.curve = new THREE.QuadraticBezierCurve3(this.startPosition, midpoint, this.targetPosition);
        this.points = this.curve.getPoints(175);

        this.inFlight = true;
    }

    update(seconds) {
        if (this.inFlight) {
            if (this.pointIndex == this.points.length) {
                this.landed = true;
                // call some kind of function to update score if good hit
            } else if (this.model) {
                this.model.position.copy(this.points[this.pointIndex]);
                this.pointIndex++;
            }
        } else if (!this.landed && this.model) {
            // Maybe change this later but for now just float in front of the camera
            this.model.position.copy(this.scene.getCameraPosition(seconds + 2));
        }
    }
}

app.Present = Present;