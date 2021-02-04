// 📀 LOAD THREE JS -------------------------- 

import * as THREE from './sources/three.module.js';

//FRAMERATE STATS 
javascript: (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()


// 🌐 GLOBAL VARIABLES -------------------------- 

let scene, renderer, camera, controls;
let lon = 0, lat = 0;
let phi = 0, theta = 0;

let houses = [];

let userSpeed = 0;
let userPosition = 0;

window.addEventListener('wheel', function (wheelEvent) {
  wheelEvent.preventDefault();
  wheelEvent.stopPropagation();
  userSpeed += wheelEvent.deltaY * 0.00002;
})

let scrollbox1 = document.getElementById("scrollbox1");
let scrollbox2 = document.getElementById("scrollbox2");
let scrollbox3 = document.getElementById("scrollbox3");

/*let stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom ); */

// 🎥 CAM SETTING -------------------------- 

let fov = 70;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.01;
let far = 100;
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

//Camera Path
//Vector values: (- = nachlinks/+ = nachrechts, - = nach unten/+ = nach oben, - = nach hinten/ + = nach vorne)
const pathCurve = new THREE.CatmullRomCurve3([
  //Froschperspektive
  /*new THREE.Vector3(-8, 0.5, 10),
  new THREE.Vector3(-8, 0.5, 3),
  new THREE.Vector3(-4, 0.5, 2),
  new THREE.Vector3(3, 0.5, 2),
  new THREE.Vector3(4, 0.5, 5),*/
  //new THREE.Vector3(4, -10, 5),   //Fahrt nach unten
  // Wechsel in die Zwischenstufe
  new THREE.Vector3(1, 5, 10),
  // Wechsel in die Vogelperspektive
  new THREE.Vector3(0, 30, 0),
  //new THREE.Vector3(1, 40, 3),
]);

const pathPoints = pathCurve.getPoints(50);
const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
const pathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 0 });
let cameraPath = new THREE.Mesh(pathGeometry, pathMaterial);

// CAMERA ANIMATION ----------------------- 

update(renderer, scene, camera);

function update(renderer, scene, camera) {

  userSpeed = userSpeed * 0.8;
  userPosition = userPosition + userSpeed;
  //console.log(userPosition);
  //camera.rotation.z += 90 * Math.PI / 180;
  camera.lookAt(0, 0, 0);

  if (userPosition >= 0 && userPosition < 1) {
    camera.position.copy(pathCurve.getPointAt(userPosition));
  } else {
    userPosition = 0;
  }

  // ANIMATED TEXT BOXES 

  if (userPosition >= 0 && userPosition < 0.1) {
    document.getElementById("scrollbox1").style.opacity = 1;
  } else {
    document.getElementById("scrollbox1").style.opacity = 0;
  }

  if (userPosition > 0.1 && userPosition < 0.2) {
    document.getElementById("scrollbox2").style.opacity = 1;
  } else {
    document.getElementById("scrollbox2").style.opacity = 0;
  }

  if (userPosition > 0.2 && userPosition < 0.3) {
    document.getElementById("scrollbox3").style.opacity = 1;
  } else {
    document.getElementById("scrollbox3").style.opacity = 0;
  }

  if (userPosition > 0.3 && userPosition < 0.4) {
    document.getElementById("scrollbox4").style.opacity = 1;
  } else {
    document.getElementById("scrollbox4").style.opacity = 0;
  }

  if (userPosition > 0.4 && userPosition < 0.5) {
    document.getElementById("scrollbox5").style.opacity = 1;
  } else {
    document.getElementById("scrollbox5").style.opacity = 0;
  }

  if (userPosition > 0.5 && userPosition < 0.6) {
    document.getElementById("scrollbox6").style.opacity = 1;
  } else {
    document.getElementById("scrollbox6").style.opacity = 0;
  }

  if (userPosition > 0.7 && userPosition < 0.8) {
    document.getElementById("scrollbox7").style.opacity = 1;
  } else {
    document.getElementById("scrollbox7").style.opacity = 0;
  }

  if (userPosition > 0.8 && userPosition < 0.9) {
    document.getElementById("scrollbox8").style.opacity = 1;
  } else {
    document.getElementById("scrollbox8").style.opacity = 0;
  }

  if (userPosition > 0.9 && userPosition < 0.95) {
    document.getElementById("scrollbox9").style.opacity = 1;
  } else {
    document.getElementById("scrollbox9").style.opacity = 0;
  }

  if (userPosition > 0.95 && userPosition < 1) {
    document.getElementById("scrollbox10").style.opacity = 1;
  } else {
    document.getElementById("scrollbox10").style.opacity = 0;
  }

  requestAnimationFrame(function () {
    update(renderer, scene, camera);
  });

}

// 🌇 SCENE SETTING -------------------------- 

scene = new THREE.Scene();
scene.background = new THREE.Color(0x96A4B6);
scene.fog = new THREE.Fog(0xFFFFFF, 15, 35);

// 👇 FLOOR ✅ -----------------------
var floor = generateFloor(1000, 1000);
floor.position.x = -4;
floor.name = 'floor';
floor.rotation.x = Math.PI / 2;

function generateFloor(w, d) {
  var geo = new THREE.PlaneGeometry(w, d);
  var mat = new THREE.MeshPhongMaterial({
    color: 'rgb(5,8,12)',
    side: THREE.DoubleSide
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}
scene.add(floor);

// Pedestal

/* const pedestalgeo = new THREE.BoxGeometry(20, 2, 14);
const pedestalmat = new THREE.MeshPhongMaterial({ color: 'rgb(5,8,12)' });
let pedestal = new THREE.Mesh(pedestalgeo, pedestalmat);
pedestal.position.y = -1;
scene.add(pedestal); */

// 🌞 LIGHT SETTINGS -------------------------- 

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(- 3, 10, - 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);

// 🎛 RENDER SETTINGS -------------------------- 

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio / 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor('rgb(30,30,30)');
document.body.appendChild(renderer.domElement);

// 🔄 ANIMATION SETTINGS -------------------------- 

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}

// 📊 LOAD JSON DATA ----------------------------------------
// Do not forget to load the D3 Framework in your HTML file!

d3.json("sources/newsapi.json").then(function (data) {

  // 🚀 RUN MAIN FUNCTIONS -------------------------- 

  init(data);
  animate();

  console.log("number of houses: " + houses.length)

}); 

// 🎯 Klasse, um einzelnes Haus zu generieren -------------------------- 

class House {

  constructor(_xPos, _yPos, _zPos, _height, _tweetString, _fixedBoxSizeY) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.zPos = _zPos;

    this.fixedBoxSizeY = _fixedBoxSizeY;
    this.height = _height;
    this.width = 1;
    this.depth = 1;

    this.tweetString = _tweetString;

    this.dynamicTexture = new THREEx.DynamicTexture(1400, 1400 * this.height)
    this.dynamicTexture.context.font = "1px Arial";

    this.dynamicTexture.clear('rgb(170,150,150)')
    this.dynamicTexture.drawTextCooked({
      text: this.tweetString,
      lineHeight: 0.1 / this.height,
      fillStyle: 'black',
      marginTop: (this.height - this.fixedBoxSizeY) / this.height
    })

    this.material = new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, map: this.dynamicTexture.texture });
    this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.x = this.xPos;
    this.mesh.position.y = this.yPos / 2;
    this.mesh.position.z = this.zPos;
  }

  update() {
  }
}

function generate_district(_offsetX, _offsetZ, tweetText) {

  let boxSizeX = 1;
  let boxSizeZ = 1;
  let boxDistance = 0.5;
  let boxMaxRowItems = 3;

  let boxPositionX = -(boxDistance + boxSizeX);
  let boxPositionZ = 0;

  let fixedBoxSizeY = 1;
  let districtSize = 6;

  console.log("generate_district");

  for (var i = 0; i < districtSize; i++) {

    let boxHeight = Math.random() * 2 + fixedBoxSizeY;

    /*let tweettext = data.article[tweetID + i].tweet;
    console.log('🐦 tweet: ' + text);

    let roof = data.article[tweetID + i].roof;
    console.log('🏠roof: ' + roof); */

    let tweetText = "Hello World";

    let boxRowBreak = boxMaxRowItems * (boxSizeX + boxDistance);

    boxPositionX = boxPositionX + boxDistance + boxSizeX;

    if (boxPositionX >= boxRowBreak) {
      boxPositionX = 0;
      boxPositionZ = boxPositionZ + boxDistance + boxSizeZ;
    }

    var house = new House(boxPositionX + _offsetX, 0, boxPositionZ + _offsetZ, boxHeight, tweetText, fixedBoxSizeY);

    houses.push(house);
    scene.add(house.mesh);
  }
}

function generate_city(tweetText) {

  let districtSize = 6;
  let bufferX = 5;
  let bufferZ = 4;

  let districts = 2;

  for (let j = -1.3; j <= 1; j++) {
    for (let k = -1.19; k <= 1; k++) {
      generate_district(bufferX * j, bufferZ * k, tweetText);
      tweetText += districtSize;
    }
  }
}

// 🎯 MAIN FUNCTION -------------------------- 

function init(data) {

  generate_city();

  // 🔶 HELPER CUBES ✅ ----------------------- 

  helper();
}

// 🔶 These cubes help you to get an orientation in space -------------------------- 

function helper() {

  var helperObj, geometry, material;
  var helperObjSize = 0.1;
  var helperSize = 3;
  var helperloader = new THREE.FontLoader();

  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = 0; helperObj.position.y = 0; helperObj.position.z = 0; scene.add(helperObj);
  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = -helperSize; helperObj.position.y = -helperSize; helperObj.position.z = helperSize; scene.add(helperObj);
  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = -helperSize; helperObj.position.y = helperSize; helperObj.position.z = helperSize; scene.add(helperObj);
  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = helperSize; helperObj.position.y = helperSize; helperObj.position.z = helperSize; scene.add(helperObj);
  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = helperSize; helperObj.position.y = helperSize; helperObj.position.z = -helperSize; scene.add(helperObj);
  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = helperSize; helperObj.position.y = -helperSize; helperObj.position.z = -helperSize; scene.add(helperObj);
  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = helperSize; helperObj.position.y = -helperSize; helperObj.position.z = helperSize; scene.add(helperObj);
  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = -helperSize; helperObj.position.y = helperSize; helperObj.position.z = -helperSize; scene.add(helperObj);
  geometry = new THREE.BoxGeometry(helperObjSize, helperObjSize, helperObjSize); material = new THREE.MeshNormalMaterial(); helperObj = new THREE.Mesh(geometry, material);
  helperObj.position.x = -helperSize; helperObj.position.y = -helperSize; helperObj.position.z = -helperSize; scene.add(helperObj);

  helperloader.load('../sources/fonts/helvetiker_regular.typeface.json', function (font) { var geometry = new THREE.TextGeometry('X', { font: font, size: 0.2, height: 0.1, }); var material = new THREE.MeshNormalMaterial(); var helperTxt = new THREE.Mesh(geometry, material); helperTxt.position.x = 2.5; helperTxt.position.y = 0; helperTxt.position.z = 0; scene.add(helperTxt); });
  helperloader.load('../sources/fonts/helvetiker_regular.typeface.json', function (font) { var geometry = new THREE.TextGeometry('Y', { font: font, size: 0.2, height: 0.1, }); var material = new THREE.MeshNormalMaterial(); var helperTxt = new THREE.Mesh(geometry, material); helperTxt.position.x = 0; helperTxt.position.y = 2.5; helperTxt.position.z = 0; scene.add(helperTxt); });
  helperloader.load('../sources/fonts/helvetiker_regular.typeface.json', function (font) { var geometry = new THREE.TextGeometry('Z', { font: font, size: 0.2, height: 0.1, }); var material = new THREE.MeshNormalMaterial(); var helperTxt = new THREE.Mesh(geometry, material); helperTxt.position.x = 0; helperTxt.position.y = 0; helperTxt.position.z = 2.5; scene.add(helperTxt); });

  var dir = new THREE.Vector3(0, 1, 0);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 2;
  var hex = 0x00ff00;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  var dir = new THREE.Vector3(1, 0, 0);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 2;
  var hex = 0x0000ff;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  var dir = new THREE.Vector3(0, 0, 1);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 2;
  var hex = 0xff0000;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);
}

  /*controls = new FirstPersonControls( camera, renderer.domElement );
      controls.movementSpeed = 1000;
      controls.lookSpeed = 0.1;*/

  // 👇 YOUR 3D OBJECTS ✅ ----------------------




  /*let districtSize = 6;
  let tweetID = 0;
  let bufferX = -10;
  let bufferZ = 5;

  for (let j = 0; j <= 3; j++) {
    for (let k = -6; k <= -3; k++) {

      generate_district(districtSize, bufferX, k, tweetID);
      //scene.add(generate_district(bufferX, k + bufferZ, districtSize, tweetID, data));
      tweetID += districtSize;
    }
    bufferX += 6
  }

}

  /*
    function generate_district(valueX, valueZ, districtSize, tweetID, data) {

      let groupedObjectsA = new THREE.Group();

      let groupAPositionX = valueX;
      let groupAPositionZ = valueZ;

      groupedObjectsA.position.x = groupAPositionX;
      groupedObjectsA.position.z = groupAPositionZ;

      for (let i = 0; i < districtSize; i++) {

        let fixedBoxSize = 1;
        const boxSizeX = 1;
        let boxSizeY = Math.random() * 2 + fixedBoxSize; //muss let sein 
        const boxSizeZ = 1;

        let text = data.article[tweetID + i].tweet;
        console.log('🐦 tweet: ' + text);

        let roof = data.article[tweetID + i].roof;
        console.log('🏠roof: ' + roof);

        // TEXT ON HOUSES 

        let dynamicTexture = new THREEx.DynamicTexture(1400, 1400 * boxSizeY)
        dynamicTexture.context.font = "1px Arial";

        dynamicTexture.clear('rgb(170,150,150)')
        dynamicTexture.drawTextCooked({
          text: text,
          lineHeight: 0.1 / boxSizeY,
          fillStyle: 'black',
          marginTop: (boxSizeY - fixedBoxSize) / boxSizeY
        })

        // COLORS OF THE ROOF 

        let whiteroof = [
          new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshLambertMaterial({ color: 'rgb(245,245,235)', side: THREE.DoubleSide }),
          new THREE.MeshLambertMaterial({ color: 'rgb(245,245,235)', side: THREE.DoubleSide }),
          new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
        ];

        let blackroof = [
          new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshLambertMaterial({ color: 'rgb(5,8,12)', side: THREE.DoubleSide }),
          new THREE.MeshLambertMaterial({ color: 'rgb(5,8,12)', side: THREE.DoubleSide }),
          new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshLambertMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
        ];

        let blackroof2 = new THREE.MeshFaceMaterial(blackroof);
        let whiteroof2 = new THREE.MeshFaceMaterial(whiteroof);

        let geometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ);

        let mesh;

        if (roof == 'blackroof') {
          mesh = new THREE.Mesh(geometry, blackroof2);
          mesh.position.x = boxPositionX;
          mesh.position.y = 0;
          mesh.position.z = boxPositionZ;
          groupedObjectsA.add(mesh);
        } if (roof == 'whiteroof') {
          mesh = new THREE.Mesh(geometry, whiteroof2);
          mesh.position.x = boxPositionX;
          mesh.position.y = 0;
          mesh.position.z = boxPositionZ;
          groupedObjectsA.add(mesh);
        }

        mesh.position.x = boxPositionX;
        mesh.position.y = boxSizeY / 2;
        mesh.position.z = boxPositionZ;
        groupedObjectsA.add(mesh);

        let boxDistance = 0.5;
        let boxMaxRowItems = 3;

        let boxRowBreak = boxMaxRowItems * (boxSizeX + boxDistance);
        boxPositionX = boxPositionX + boxDistance + boxSizeX;
        if (boxPositionX >= boxRowBreak) {
          boxPositionX = 0;
          boxPositionZ = boxPositionZ + boxDistance + boxSizeZ;
        }

        // ANIMATION HOUSES GROWING 

        let render = function () {
          requestAnimationFrame(render);
          if (userPosition > 0.4 && userPosition < 0.6) {
            mesh.scale.y += 0.1;

          } else {
            mesh.scale.y = mesh.scale.y;
          }
          renderer.render(scene, camera);
        }

        render(); 
      }
      // 👉 🌇 MAKE IT VISIBLE -------------------------- 
      return groupedObjectsA;
    }
  
  */
