export const generateThreeVertices = (rawVerts) => {
    let verts = [];

    for(let v = 0; v < rawVerts.length; v+=3){
        const x = rawVerts[v]
        const y = rawVerts[v+1]
        const z = rawVerts[v+2]
        const vec3 = new THREE.Vector3(x,y,z)
        verts.push(vec3);
    }

    return verts;
};

export const generateThreeFaces = (rawFaces) => {
    let faces = [];

    for(let f = 0; f < rawFaces.length; f+=3){
        faces.push(new THREE.Face3(rawFaces[f],
            rawFaces[f+1],
            rawFaces[f+2]));
    }

    return faces;
};


export const generateCannonVertices = (rawVerts) => {
    let verts = [];

    for(let v = 0; v < rawVerts.length; v++){
        verts.push(new CANNON.Vec3(rawVerts[v].x,
            rawVerts[v].y,
            rawVerts[v].z));
    }

    return verts;
};

export const generateCannonFaces = (rawFaces) => {
    let faces = [];

    for(let f = 0; f < rawFaces.length; f++){
        faces.push([rawFaces[f].a,
            rawFaces[f].b,
            rawFaces[f].c]);
    }

    return faces;
};

export const generateBody = (groups, properties) => {
    const body = new CANNON.Body({
        mass: properties.mass
    });

    for (let g = 0; g < groups.length; g++) {
        const group = groups[g];

        const verts = generateThreeVertices(group.vertices);
        const faces = generateThreeFaces(group.faces);
        const geometry = new THREE.Geometry();
        const material = new THREE.MeshBasicMaterial();

        geometry.vertices = verts;
        geometry.faces = faces;
        console.log(geometry)

        geometry.verticesNeedUpdate = true

        const mesh = new THREE.Mesh(geometry, material);

        mesh.scale.copy(properties.scale);

        mesh.updateMatrix();
        // mesh.geometry.applyMatrix(mesh.matrix); // this line is creating 0,0,0 vertices
        mesh.geometry.computeFaceNormals();
        mesh.geometry.computeVertexNormals();
        mesh.matrix.identity();

        // console.log(verts, faces)

        const updatedVerts = generateCannonVertices(verts);
        const updatedFaces = generateCannonFaces(faces);
        // console.log(updatedVerts[0])

        // const polyhedron = new CANNON.ConvexPolyhedron(updatedVerts,updatedFaces);
        // const poule = new CANNON.Trimesh(verts, [0, 1, 2, 3])
        // console.log(poule)


        // body.addShape(new CANNON.Trimesh(updatedVerts, updatedFaces));

        // body.addShape(polyhedron);
        body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        var z180 = new CANNON.Quaternion();
        z180.setFromAxisAngle(new CANNON.Vec3(0,0,1),Math.PI);
        body.quaternion = z180.mult(body.quaternion);
    }

    return body;
};