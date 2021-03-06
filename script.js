// 📀 LOAD THREE JS -------------------------- 

import * as THREE from './sources/three.module.js';

//FRAMERATE STATS 

/*javascript: (function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()*/

// 🌐 GLOBAL VARIABLES -------------------------- 

let scene, renderer, camera, controls;
let lon = 0, lat = 0;
let phi = 0, theta = 0;

let houses = [];
let platforms = [];
let mesh;
let tweetColor = "white";

let pChangeStart = 0.5;
let pChangeEnd = 0.8;

let userSpeed = 0;
let userPosition = 0;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

let scrollSpeed = 0.00002;
let hadPaused = false;
window.addEventListener('wheel', function (wheelEvent) {
  // wheelEvent.preventDefault();
  wheelEvent.stopPropagation();
  userSpeed += wheelEvent.deltaY * scrollSpeed;
});

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
let scrollbox6 = document.getElementById("scrollbox6");

// 🎥 CAM SETTING -------------------------- 

let fov = 70;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.01;
let far = 100;
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

// CAMERA PATH 
// Vector values: (- = nachlinks/+ = nachrechts, - = nach unten/+ = nach oben, - = nach hinten/ + = nach vorne)

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
  new THREE.Vector3(0, 0.5, 1),
  new THREE.Vector3(0, 1, 0.8),
  new THREE.Vector3(0, 2, 0.6),
  // Wechsel in die Zwischenstufe
  new THREE.Vector3(0, 4, 15),
  // Wechsel in die Vogelperspektive
  new THREE.Vector3(0, 18, 5),
  new THREE.Vector3(0, 19, 2),
  new THREE.Vector3(0, 20, 1),
  new THREE.Vector3(0, 22, 0.75),
  new THREE.Vector3(0, 23, 0.5),
  new THREE.Vector3(0, 25, 0), 
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
let fogDensity = 0.2;

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

const ambiColor = 0x404040;
const ambiIntensity = 1;
const ambiLight = new THREE.AmbientLight(ambiColor, ambiIntensity);
scene.add(ambiLight);

const dirColor = 0xffffff;
const dirIntensity = 1.75;
const dirLight = new THREE.DirectionalLight(dirColor, dirIntensity);
dirLight.position.set(-10, 20, -10); // Startposition des Lichts 
dirLight.target.position.set(0, 0, 0); // Endposition des Lichts 
dirLight.castShadow = true;
dirLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(100, 1, 500, 1000));
dirLight.shadow.bias = 0.0001;
dirLight.shadow.radius = 1;
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

let pointColor = 0xCE9178;
let pointIntensity = 0.1;
let pointDistance = 1;
let pointDecay = 0;
let pointHeight = 2;

var pointLight = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight.position.set(0, pointHeight, 0);
scene.add(pointLight);

var pointLight2 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight2.position.set(6, pointHeight, 4);
scene.add(pointLight2);

var pointLight3 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight3.position.set(6, pointHeight, -4);
scene.add(pointLight3);

var pointLight4 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight4.position.set(-6, pointHeight, -4);
scene.add(pointLight4);

var pointLight5 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight5.position.set(-6, pointHeight, 4);
scene.add(pointLight5);

var pointLight6 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight6.position.set(0, pointHeight, -4);
scene.add(pointLight6);

var pointLight7 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight7.position.set(0, pointHeight, 4);
scene.add(pointLight7);

var pointLight8 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight8.position.set(-6, pointHeight, 0);
scene.add(pointLight8);

var pointLight9 = new THREE.PointLight(pointColor, pointIntensity, pointDistance, pointDecay);
pointLight9.position.set(6, pointHeight, 0);
scene.add(pointLight9);

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


// 📊 LOAD JSON DATA (D3 Framework is in html!) ----------------------------------------

d3.json("sources/newsapi.json").then(function (data) {

  // 🚀 RUN MAIN FUNCTIONS -------------------------- 

  init(data);
  animate(renderer, scene, camera);
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

    // 🏠 GEOMETRY OF THE HOUSE 

    this.geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth);

    // COLORS OF THE ROOF AND BUILDING

    let buildingColor = "rgb(27,30,43)";
    this.roofColor = "rgb(0,3,5)";
    let emissiveColor = "rgb(255,255,255)";

    // die Dächer der Häuser sollen zu 10% weiß und 90% schwarz sein und das durch eine zufällige Anordnung
    let colorProbability = Math.random();

    if (colorProbability < 0.2) {
      this.roofColor = "rgb(255,255,255)";
    }

    this.checkText = true;

    this.dynamicTexture.drawTextCooked({
      background: "black", // der Hintergrund muss schwarz sein, damit die emissiveMap (als Maske) funktioniert
      text: this.tweetString,
      lineHeight: 0.1 / this.height,
      emissive: 1,
      blending: THREE.AdditiveBlending,
      fillStyle: tweetColor,
      font: "24px Helvetica",
      marginTop: ((this.height - this.fixedBoxSizeY + 1) / this.height) // da fixedBoxSize noch zu hoch ist.
    })

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

  animate() {

    // 🏢 GROWING HOUSES 

    let growingSpeed = 0.005;
    let roofColor = this.roofColor;

    // die weißen Häuser sollen langsamer als die schwarzen Häuser wachsen

    if (roofColor == "rgb(255,255,255)") {
      growingSpeed = 0.005;
    } else {
      growingSpeed = 0.0075;
    }

    let maxScale = growingSpeed * 320 + 1;
    //Achtung: growingSpeed und MaxScale sind abhängig von einander. Wenn man oben den growingSpeed vergößert muss hier der Scale (diese * 200) verkleinert werden. Zb. wird der Speed verdoppelt muss der Scale hier halbiert werden um dieselbe maxScale zu erreichen wie zuvor. 1 ist eine notwendige Konstante.

    // die Häuser sollen nur beim Perspektivenwechseln wachsen und bis sie maxScale erreicht haben

    if (userPosition > pChangeStart && userPosition < pChangeEnd && this.mesh.scale.y < maxScale) {
      this.mesh.scale.y += Math.random() * growingSpeed;
    } else if (userPosition >= 0 && userPosition < 0.4) {
      this.mesh.scale.y = this.mesh.scale.y;
    } else if (userPosition >= 0.7 && userPosition < 1) {
      this.mesh.scale.y = this.mesh.scale.y;
    }

    if (userPosition > 0.5 && this.checkText) {
      this.dynamicTexture.drawTextCooked({
        background: "black",
        text: '',
        emissive: 1,
        blending: THREE.AdditiveBlending,
        fillStyle: this.tweetColor,
      });
      this.checkText = false;
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

  for (var i = 0; i < districtSize; i++) {

    let tweetText = tweets[tweetID + i];
    let roofText = roof[tweetID + i];

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

// RESIZE WINDOW  

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 🎥 CAMERA ANIMATION + TEXT BOXES ----------------------- 

function animate(renderer, scene, camera) {

  userSpeed = userSpeed * 0.8;
  userPosition = userPosition + userSpeed;

  // REDUCING FOG DURING USER NAVIGATION 
  let fogDensity = 0.2 - userPosition * 0.2;
  scene.fog = new THREE.FogExp2(setcolor, fogDensity);

  // CAMERA 
  if (userPosition >= 0 && userPosition < 1) {
    camera.position.copy(pathCurve.getPointAt(userPosition));
  } else if (userPosition < 0) {
    userPosition = 0;
  } else if (userPosition > 1) {
    userPosition = 1;
  }

  if (userPosition >= 0 && userPosition < 0.49) {
    camera.lookAt(pathCurve.getPointAt(userPosition + 0.01));
  } else {
    camera.lookAt(0, 7, 0);
  }

  // STOP AT PERSPECTIVE CHANGE 

  if (userPosition > 0.47 && userPosition < 0.48 && !hadPaused) {
    scrollSpeed = 0;
    setTimeout(function () { scrollSpeed = 0.00002; }, 1000);
  } else 

  if (userPosition > 0.69 && userPosition < 0.7 && !hadPaused) {
    scrollSpeed = 0;
    setTimeout(function () { scrollSpeed = 0.00002; hadPaused = true; }, 1000);
  }

  // BUTTONS 

  document.getElementById("replay").onclick = function () {
    window.location.reload();
  };

  document.getElementById("popup-button").onclick = function () {
    document.getElementById("popup-wrapper").style.display = "flex";
  };

   document.getElementById("close-button").onclick = function () {
    document.getElementById("popup-wrapper").style.display = "none";
  };

  document.getElementById("start").onclick = function () {
    userPosition = 0.03;
  };

  // SCROLLBOXES FOR EXPLANATIONS 

  let transitionTime = 5000; // 1000ms = 1s 

  if (userPosition >= 0 && userPosition < 0.02) {
    document.getElementById("scrollbox1").style.opacity = 1;
    document.getElementById("scrollbox1").style.display = "flex";
  } else {
    document.getElementById("scrollbox1").style.opacity = 0;
    setTimeout(function () { (document.getElementById("scrollbox1").style.display = "none") }, transitionTime);
  }

  if (userPosition > 0.02 && userPosition < 0.04) {
    document.getElementById("scrollbox2").style.opacity = 1;
    setTimeout(document.getElementById("scrollbox2").style.display = "flex", 1000);
  } else if (userPosition > 0.04 && userPosition < 0.06) {
    document.getElementById("scrollbox2").style.opacity = 0;
    setTimeout(function () { (document.getElementById("scrollbox2").style.display = "none") }, transitionTime);
  } else if (userPosition < 0.02) {
    document.getElementById("scrollbox2").style.opacity = 0;
    document.getElementById("scrollbox2").style.display = "none";
  }

  if (userPosition > 0.18 && userPosition < 0.25) {
    document.getElementById("scrollbox3").style.opacity = 1;
    document.getElementById("scrollbox3").style.display = "flex";
  } else if (userPosition > 0.17 && userPosition < 0.26) {
    document.getElementById("scrollbox3").style.opacity = 0;
    setTimeout(function () { (document.getElementById("scrollbox3").style.display = "none") }, transitionTime);
  } else {
    document.getElementById("scrollbox3").style.opacity = 0;
    document.getElementById("scrollbox3").style.display = "none";
  }

  if (userPosition > 0.30 && userPosition < 0.38) {
    document.getElementById("scrollbox4").style.opacity = 1;
    document.getElementById("scrollbox4").style.display = "flex";
  } else if (userPosition > 0.29 && userPosition < 0.39) {
    document.getElementById("scrollbox4").style.opacity = 0;
    setTimeout(function () { (document.getElementById("scrollbox4").style.display = "none") }, transitionTime);
  } else {
    document.getElementById("scrollbox4").style.opacity = 0;
    document.getElementById("scrollbox4").style.display = "none";
  }

  // SCROLLBOX 5 - Changing perspectives.

  if (userPosition > 0.46 && userPosition < 0.56) {
    document.getElementById("scrollbox5").style.display = "flex";
  } else {
    document.getElementById("scrollbox5").style.display = "none";
  }

  if (userPosition > 0.47 && userPosition < 0.54) {
    document.getElementById("scrollbox5").style.opacity = 1;
  } else {
    document.getElementById("scrollbox5").style.opacity = 0;
  }

  // SCROLLBOX 6 - We are almost there.

  if (userPosition > 0.68 && userPosition < 0.78) {
    document.getElementById("scrollbox6").style.display = "flex";
  } else {
    document.getElementById("scrollbox6").style.display = "none";
  }

  if (userPosition > 0.69 && userPosition < 0.76) {
    document.getElementById("scrollbox6").style.opacity = 1;
  } else {
    document.getElementById("scrollbox6").style.opacity = 0;
  }

  // SCROLLBOX 7 - The whole picture. 

  if (userPosition > 0.89 && userPosition < 0.99) {
    document.getElementById("scrollbox7").style.display = "flex";
  } else {
    document.getElementById("scrollbox7").style.display = "none";
  }

  if (userPosition > 0.90 && userPosition < 0.98) {
    document.getElementById("scrollbox7").style.opacity = 1;
  } else {
    document.getElementById("scrollbox7").style.opacity = 0;
  }

  // 👀 CAMERA ROTATION ON MOUSE MOVEMENT 

  if (userPosition > 0 && userPosition < 0.49) {
    //target.x = maximale Gradzahl der Abweichung nach rechts o. links in Porzent der Mausbewegung
    //Mouse.x hat einen Wert zwischen -1 bis 1. Bsp. mouse.x = 0.5 d.h. 50% der maximalen Gradzahl werden geschwenkt.
    //bei mouse.x = 1 (das ist wenn die Maus ganz links am Rand ist) heißt es 100% der Gradzahl werden geschwenkt.
    //der letzte Wert bedeutet wie viel Porzent einer Drehung. Dabei ist 1 eine 180 grad Drehung, 0.5 eine 90 Grad drehung. 0.1 eine 18 Grad Drehung.

    target.x = mouse.x * Math.PI / 15; //target = maximale Gradzahl der Abweichung nach rechts o links
    //target.y = mouse.y * Math.PI / 40; 

    camera.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -target.x));
    //camera.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), -target.y));

    camera.quaternion.normalize();
  } else {
    camera.rotation.y = 0;
  }

  // MAKES HOUSES GROW 

  for (let i = 0; i < houses.length; i++) {
    houses[i].animate();
  }

  renderer.render(scene, camera);
  requestAnimationFrame(function () {
    animate(renderer, scene, camera);
  });

}

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