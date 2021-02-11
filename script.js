// 📀 LOAD THREE JS -------------------------- 

import * as THREE from './sources/three.module.js';

//FRAMERATE STATS 

javascript: (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()

import { FirstPersonControls } from './sources/firstPersonControls.js';

// 🌐 GLOBAL VARIABLES -------------------------- 

let scene, renderer, camera, controls;
let lon = 0, lat = 0;
let phi = 0, theta = 0;

let houses = [];
let platforms = [];
let mesh;

let userSpeed = 0;
let userPosition = 0;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

window.addEventListener('wheel', function (wheelEvent) {
  wheelEvent.preventDefault();
  wheelEvent.stopPropagation();
  userSpeed += wheelEvent.deltaY * 0.00002;
})

window.addEventListener('mousemove', onMouseMove, false);

// CALCULATES MOUSE POSITION 

function onMouseMove(event) {
  mouse.x = (event.clientX - windowHalf.x) / windowHalf.x;
  mouse.y = (event.clientY - windowHalf.y) / windowHalf.y;
}

let scrollbox1 = document.getElementById("scrollbox1");
let scrollbox2 = document.getElementById("scrollbox2");
let scrollbox3 = document.getElementById("scrollbox3");
let scrollbox4 = document.getElementById("scrollbox4");
let scrollbox5 = document.getElementById("scrollbox5");

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
  // Froschperspektive
  // Startpunkt
  new THREE.Vector3(6, 0.5, -4),
  //1. Ecke
  new THREE.Vector3(-5, 0.5, -4), // extra Punkt davor und danach, um die Rundung rauszunehmen
  new THREE.Vector3(-6, 0.5, -4),
  new THREE.Vector3(-6, 0.5, -3), // ansonsten wäre die Kurve zu rund und man würde durch Häuser gehen...
  // 2.Ecke
  new THREE.Vector3(-6, 0.5, -1), // ich frag mich, ob das auch smarter geht...
  new THREE.Vector3(-6, 0.5, 0),
  new THREE.Vector3(-5, 0.5, 0),
  // 3.Ecke
  new THREE.Vector3(5, 0.5, 0),
  new THREE.Vector3(6, 0.5, 0),
  new THREE.Vector3(6, 0.5, 1),
  // 4.Ecke
  new THREE.Vector3(6, 0.5, 3),
  new THREE.Vector3(6, 0.5, 4),
  new THREE.Vector3(5, 0.5, 4),
  // 5.Ecke
  new THREE.Vector3(1, 0.5, 3.8),
  new THREE.Vector3(0, 0.5, 3.8),
  new THREE.Vector3(0, 0.5, 3.8),
  // Endpunkt: Sackgasse
  new THREE.Vector3(0.5, 0.5, 1),

  //new THREE.Vector3(4, -10, 5),   // Fahrt nach unten

  // Wechsel in die Zwischenstufe
  new THREE.Vector3(1, 4, 15),
  // Wechsel in die Vogelperspektive
  new THREE.Vector3(0, 20, 0),
  new THREE.Vector3(0, 30, 0),
  //new THREE.Vector3(1, 40, 3),
]);

const pathPoints = pathCurve.getPoints(50);
const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
const pathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 0 });
let cameraPath = new THREE.Mesh(pathGeometry, pathMaterial);

// 🌇 SCENE SETTING -------------------------- 

let fogNear = 5;
let fogFar = 15;
var setcolor = 0x96A4B6;
scene = new THREE.Scene();
scene.background = new THREE.Color(setcolor);
// scene.fog = new THREE.Fog(setcolor, fogNear, fogFar);
let fogDensity = 0.2;
// scene.fog = new THREE.FogExp2(setcolor, fogDensity);
//scene.fog = new THREE.Fog(setcolor, 25, 1000); // damit der Nebel verschwindet 

// 👇 FLOOR ✅ -----------------------

var floor = generateFloor(1000, 1000);
floor.position.x = -4;
floor.name = 'floor';
floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true;
floor.castShadow = false;

function generateFloor(w, d) {
  var geo = new THREE.PlaneBufferGeometry(w, d);
  var mat = new THREE.MeshPhongMaterial({
    color: 'rgb(5,8,12)',
    side: THREE.DoubleSide
  });
  var mesh = new THREE.Mesh(geo, mat);
  geo.receiveShadow = true;
  return mesh;
}
scene.add(floor);

// 🌞 LIGHT SETTINGS -------------------------- 

const skyColor = 0xffffff;
const groundColor = 0xffffff;
const hemiIntensity = 1;
const hemiLight = new THREE.HemisphereLight(skyColor, groundColor, hemiIntensity);
hemiLight.position.set(0, 0, 0);
scene.add(hemiLight);

const dirColor = 0xffffff;
const dirIntensity = 1.75;
const dirLight = new THREE.DirectionalLight(dirColor, dirIntensity);
dirLight.position.set(-10, 20, -10); // Startposition des Lichts 
dirLight.target.position.set(0, 0, 0); // Endposition des Lichts 
dirLight.castShadow = true;
dirLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(100, 1, 500, 1000));
dirLight.shadow.bias = 0.0001;
dirLight.shadow.camera.top = 500;
dirLight.shadow.camera.bottom = - 500;
dirLight.shadow.camera.left = - 500;
dirLight.shadow.camera.right = 500;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 500;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.position.multiplyScalar(5); // Licht multiplizieren, um Schatten weicher zu machen 
scene.add(dirLight);
scene.add(dirLight.target);

var pointLight = new THREE.PointLight(0xCE9178, 2.0, 600);
pointLight.position.set = (4.5,3,3)
scene.add(pointLight);

var pointLight2 = new THREE.PointLight(0xCE9178, 2.0, 600);
pointLight2.position.set = (4.5,3,-3)
scene.add(pointLight2);

var pointLight3 = new THREE.PointLight(0xCE9178, 2.0, 600);
pointLight3.position.set = (-4.5,3,-3)
scene.add(pointLight3);

var pointLight4 = new THREE.PointLight(0xCE9178, 2.0, 600);
pointLight4.position.set = (-4.5,3,3)
scene.add(pointLight4);

const ambiColor = 0x404040;
const ambiIntensity = 1;
const ambiLight = new THREE.AmbientLight(ambiColor, ambiIntensity);
scene.add(ambiLight);

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

function animate() {

  for (let i = 0; i < houses.length; i++) {
    houses[i].animate();
  }

  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}

// 📊 LOAD JSON DATA ----------------------------------------
// Do not forget to load the D3 Framework in your HTML file!

d3.json("sources/newnewsapi.json").then(function (data) {

  // 🚀 RUN MAIN FUNCTIONS -------------------------- 

  init(data);
  animate();
});

// 🎯 MAIN FUNCTION -------------------------- 

function init(data) {

  let tweets = [];
  for (var i = 0; i < data.article.length; i++) {
    tweets.push(data.article[i].title);
  }
  // console.log('🐦 tweet: ' + tweets);

  let roof = [];
  for (var i = 0; i < data.article.length; i++) {
    roof.push(data.article[i].roof);
  }
  // console.log('🏠 roof: ' + roof);

  generate_city(tweets, roof);

  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 1000;
  controls.lookSpeed = 0.1;

  // helper(); // Koordinatensystem  
}

// 🎯 CLASS FOR SINGLE HOUSE -------------------------- 

class House {

  constructor(_xPos, _yPos, _zPos, _height, _tweetString, _fixedBoxSizeY, _roofColor) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.zPos = _zPos;

    this.fixedBoxSizeY = _fixedBoxSizeY;
    this.height = _height;
    this.width = 1;
    this.depth = 1;

    this.tweetString = _tweetString;

    this.dynamicTexture = new THREEx.DynamicTexture(400, 400 * this.height)

    this.dynamicTexture.clear('rgb(29,41,81)')
    this.dynamicTexture.drawTextCooked({
      background: "black", // der Hintergrund muss schwarz sein, damit die emissiveMap (als Maske) funktioniert
      text: this.tweetString,
      lineHeight: 0.1 / this.height,
      emissive: 1,
      //transparent: true, 
      blending: THREE.AdditiveBlending,
      fillStyle: "white",//"rgba(62,57,60,0.9)",//'white',
      font: "24px Helvetica",
      marginTop: ((this.height - this.fixedBoxSizeY + 1) / this.height) // da fixedBoxSize noch zu hoch ist.
    })

    // 🏠 GEOMETRY OF THE HOUSE 

    this.geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth);

    // COLORS OF THE ROOF AND BUILDING

    let buildingColor = "rgb(27,30,43)";
    this.roofColor = "rgb(0,3,5)";
    let emissiveColor = "rgb(255,255,255)";

    // die Dächer der Häuser sollen zu 10% weiß und 90% schwarz sein und das durch eine zufällige Anordnung
    let colorProbability = Math.random();

    if (colorProbability < 0.5) {
      this.roofColor = "rgb(255,255,255)";
    }

    const textureLoader = new THREE.TextureLoader();
    //const sunshine = textureLoader.load("./sources/drivin_school_8k.hdr");

    this.material = [
      new THREE.MeshPhongMaterial({
        color: buildingColor,
        specular: 0xCE9178,
        emissiveIntensity: 1,
        emissive: emissiveColor,
        emissiveMap: this.dynamicTexture.texture,
        //envMap: sunshine,
        shininess: 100,
        reflectivity: 1
      }),
      new THREE.MeshPhongMaterial({
        color: buildingColor,
        specular: 0xCE9178,
        emissiveIntensity: 1,
        emissive: emissiveColor,
        emissiveMap: this.dynamicTexture.texture,
        shininess: 100,
        reflectivity: 1
      }),
      new THREE.MeshPhongMaterial({
        color: this.roofColor,
        specular: 0xCE9178,
        shininess: 100,
        reflectivity: 1
      }),
      new THREE.MeshPhongMaterial({
        color: this.roofColor,
        specular: 0xCE9178,
        shininess: 100,
        reflectivity: 1
      }),
      new THREE.MeshPhongMaterial({
        color: buildingColor,
        specular: 0xCE9178,
        emissiveIntensity: 1,
        emissive: emissiveColor,
        emissiveMap: this.dynamicTexture.texture,
        shininess: 100,
        reflectivity: 1
      }),
      new THREE.MeshPhongMaterial({
        color: buildingColor,
        specular: 0xCE9178,
        emissiveIntensity: 1,
        emissive: emissiveColor,
        emissiveMap: this.dynamicTexture.texture,
        shininess: 100,
        reflectivity: 1
      })
    ];

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();

    this.mesh.position.x = this.xPos + this.width / 2;
    this.mesh.position.y = this.yPos + this.height / 2;
    this.mesh.position.z = this.zPos + this.depth / 2;
  }

  // 🏢 GROWING HOUSES 

  animate() {

    let growingSpeed = 0.008;
    let roofColor = this.roofColor;

    // die weißen Häuser sollen langsamer als die schwarzen Häuser wachsen

    if (roofColor == "rgb(255,255,255)") {
      growingSpeed = 0.002;
    } else {
      growingSpeed = 0.008;
    }

    // die Häuser sollen nur beim Perspektivenwechseln wachsen

    if (userPosition > 0.4 && userPosition < 0.7) {
      this.mesh.scale.y += Math.random() * growingSpeed;
    } else if (userPosition >= 0 && userPosition < 0.4) {
      this.mesh.scale.y = this.mesh.scale.y;
    } else if (userPosition >= 0.7 && userPosition < 1) {
      this.mesh.scale.y = this.mesh.scale.y;
    }

  }
}

// 🎯 CLASS FOR PLATFORM / Bürgersteig -------------------------- 

class Platform {

  constructor(_xPos, _yPos, _zPos) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.zPos = _zPos;

    this.height = 0.05;
    this.width = 4.5;
    this.depth = 3;

    // 🏠 GEOMETRY OF THE HOUSE

    this.geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth);
    this.material = new THREE.MeshPhongMaterial({ color: "rgb(10,16,24)" });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.mesh.position.x = (this.xPos + this.width / 2) - 0.3;
    this.mesh.position.y = this.yPos + this.height / 2;
    this.mesh.position.z = (this.zPos + this.depth / 2) - 0.3;
  }
}

// 🎯 FUNCTION TO GENERATE 3X2 DISTRICT -------------------------- 

function generate_district(_offsetX, _offsetZ, tweets, tweetID, roof) {

  let boxSizeX = 1;
  let boxSizeZ = 1;
  let boxDistance = 0.5;
  let boxMaxRowItems = 3;

  let boxPositionX = 0;
  let boxPositionZ = 0;

  let fixedBoxSizeY = 2;
  let districtSize = 6;

  // console.log("generate_district");

  for (var i = 0; i < districtSize; i++) {

    let tweetText = tweets[tweetID + i];
    let roofText = roof[tweetID + i];
    // console.log(roofText);

    let boxHeight = Math.random() * 2.5 + fixedBoxSizeY;
    let boxRowBreak = boxMaxRowItems * (boxSizeX + boxDistance);

    if (boxPositionX >= boxRowBreak) {
      boxPositionX = 0;
      boxPositionZ = boxPositionZ + boxDistance + boxSizeZ;
    }

    const house = new House(boxPositionX + _offsetX, 0, boxPositionZ + _offsetZ, boxHeight, tweetText, fixedBoxSizeY, roofText);

    boxPositionX = boxPositionX + boxDistance + boxSizeX;

    houses.push(house); //Array von houses -> fügt ein house dem array hinzu
    scene.add(house.mesh);
  }
}

// 🎯 FUNCTION TO GENERATE GRID OF THE CITY -------------------------- 

function generate_city(tweets, roof) {

  const districtSize = 6;
  const bufferX = 6;
  const bufferZ = 4;
  const districts = 4; // wenn mehr häuser als daten in der datenbank sind, gehts nicht.

  let tweetID = 0;

  const offsetX = (bufferX * districts - (bufferX - 4)) / 2;
  const offsetZ = (bufferZ * districts - (bufferZ - 2.5)) / 2;

  for (let j = 0; j < districts; j++) {
    for (let k = 0; k < districts; k++) {
      generate_district(bufferX * j - offsetX, bufferZ * k - offsetZ, tweets, tweetID, roof);
      tweetID += districtSize;

      const platform = new Platform(bufferX * j - offsetX, 0, bufferZ * k - offsetZ);
      platforms.push(platform);
      scene.add(platform.mesh);
    }
  }
}

// Rezise Site ----------------------- 

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

// 🎥 CAMERA ANIMATION + TEXT BOXES----------------------- 

function update(renderer, scene, camera) {

  if (userPosition >= 0 && userPosition < 0.4 && fogDensity > 0.05) {
    scene.fog = new THREE.FogExp2(setcolor, fogDensity);
    // console.log("WIRST DU WENIGER??? " + fogDensity);
  } else if (userPosition >= 0.4 && userPosition < 1 && fogDensity > 0.06) {
    scene.fog = new THREE.FogExp2(setcolor, fogDensity);
    fogDensity -= 0.001;
    // console.log("was soll das " + fogDensity);
  }
  
  userSpeed = userSpeed * 0.8;
  userPosition = userPosition + userSpeed;

  //Kameraposition
  if (userPosition >= 0 && userPosition < 1) {
    camera.position.copy(pathCurve.getPointAt(userPosition));
  } else {
    userPosition = 1;
  }

  document.getElementById("replay").onclick = function () {
    userPosition = 0;
  };

  /*document.getElementById("start").onclick = function () {
    document.getElementById("scrollbox1").style.opacity = 0;
  };*/

  //Kameraausrichtung
  if (userPosition > 0 && userPosition < 0.60) {
    camera.lookAt(pathCurve.getPointAt(userPosition + 0.01));
  } else {
    camera.lookAt(0, 8, 0);
  }

  //SCROLLBOXEN TEXTBLÖCKE

  if (userPosition >= 0 && userPosition < 0.02) {
    document.getElementById("scrollbox1").style.opacity = 1;
  } else {
    document.getElementById("scrollbox1").style.opacity = 0;
  }

  if (userPosition > 0.15 && userPosition < 0.19) {
    document.getElementById("scrollbox2").style.opacity = 1;
  } else {
    document.getElementById("scrollbox2").style.opacity = 0;
  }

  if (userPosition > 0.35 && userPosition < 0.5) {
    document.getElementById("scrollbox3").style.opacity = 1;
  } else {
    document.getElementById("scrollbox3").style.opacity = 0;
  }

  if (userPosition > 0.53 && userPosition < 0.70) {
    document.getElementById("scrollbox4").style.opacity = 1;
  } else {
    document.getElementById("scrollbox4").style.opacity = 0;
  }

  if (userPosition > 0.82 && userPosition <= 1) {
    document.getElementById("scrollbox5").style.opacity = 1;
  } else {
    document.getElementById("scrollbox5").style.opacity = 0;
  }

  // 👀 CAMERA MOVING ON MOUSE MOVEMENT 

  if (userPosition > 0 && userPosition < 0.4) {
    //target.x = maximale Gradzahl der Abweichung nach rechts o. links in Porzent der Mausbewegung
    //Mouse.x hat einen Wert zwischen -1 bis 1. Bsp. mouse.x = 0.5 d.h. 50% der maximalen Gradzahl werden geschwenkt.
    //bei mouse.x = 1 (das ist wenn die Maus ganz links am Rand ist) heißt es 100% der Gradzahl werden geschwenkt.
    //der letzte Wert bedeutet wie viel Porzent einer Drehung. Dabei ist 1 eine 180 grad Drehung, 0.5 eine 90 Grad drehung. 0.1 eine 18 Grad Drehung.

    target.x = mouse.x * Math.PI / 20; //target = maximale Gradzahl der Abweichung nach recht o links
    //target.y = mouse.y * Math.PI / 40; 

    camera.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -target.x));
    //camera.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), -target.y));

    camera.quaternion.normalize();
  } else {
    camera.rotation.y = 0;
  }

  requestAnimationFrame(function () {
    update(renderer, scene, camera);
  });

}

update(renderer, scene, camera);

// 🔶 ORIENTATION CUBES FOR AXES -------------------------- 

function helper() {

  var dir = new THREE.Vector3(0, 1, 0);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0x00ff00;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  var dir = new THREE.Vector3(1, 0, 0);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0x0000ff;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);

  var dir = new THREE.Vector3(0, 0, 1);
  dir.normalize();
  var origin = new THREE.Vector3(0, 0, 0);
  var length = 3;
  var hex = 0xff0000;
  var arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
  scene.add(arrowHelper);
}