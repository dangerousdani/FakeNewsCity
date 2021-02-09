// 🎯 CLASS FOR SINGLE HOUSE -------------------------- 

class Platform {

  constructor(_xPos, _yPos, _zPos) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.zPos = _zPos;

    this.height = 1;
    this.width = 1;
    this.depth = 1;

    // 🏠 GEOMETRY OF THE HOUSE 

    this.geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth);

    // COLOR OF BUILDING

    let buildingColor = "rgb(0,0,0)";

    this.material = new THREE.MeshLambertMaterial({color: buildingColor});

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;
  }
}

// 🎯 FUNCTION TO GENERATE 3X2 DISTRICT -------------------------- 

function generate_district(_offsetX, _offsetZ) {

  let boxSizeX = 1;
  let boxSizeZ = 1;
  let boxDistance = 0.5;
  let boxMaxRowItems = 3;

  let boxPositionX = 0;
  let boxPositionZ = 0;

  let districtSize = 6;

  // console.log("generate_district");

  for (var i = 0; i < districtSize; i++) {

    let tweetText = tweets[tweetID + i];
    let roofText = roof[tweetID + i];
    // console.log(roofText);

    let boxHeight = 1;
    let boxRowBreak = boxMaxRowItems * (boxSizeX + boxDistance);

    if (boxPositionX >= boxRowBreak) {
      boxPositionX = 0;
      boxPositionZ = boxPositionZ + boxDistance + boxSizeZ;
    }

    const platform = new Platform(boxPositionX + _offsetX, 0, boxPositionZ + _offsetZ, boxHeight);

    boxPositionX = boxPositionX + boxDistance + boxSizeX;

    platforms.push(platform); 
    scene.add(house.mesh);
  }
}