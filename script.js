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
  // Froschperspektive
  // Startpunkt
  new THREE.Vector3(-6, 0.5, 9),
  //1. Ecke
  new THREE.Vector3(-6, 0.5, -2), // extra Punkt davor und danach, um die Rundung rauszunehmen
  new THREE.Vector3(-6, 0.5, -4),
  new THREE.Vector3(-4, 0.5, -4), // ansonsten wäre die Kurve zu rund und man würde durch Häuser gehen...
  // 2.Ecke
  new THREE.Vector3(5, 0.5, -4), // ich frag mich, ob das auch smarter geht...
  new THREE.Vector3(6, 0.5, -4),
  new THREE.Vector3(6, 0.5, -3),
  // 3.Ecke
  new THREE.Vector3(6, 0.5, 2.5),
  new THREE.Vector3(6, 0.5, 3.8),
  new THREE.Vector3(5, 0.5, 3.8),
  // 4.Ecke
  new THREE.Vector3(1, 0.5, 3.8),
  new THREE.Vector3(0, 0.5, 3.8),
  new THREE.Vector3(0, 0.5, 2.8),
  // Endpunkt: Sackgasse
  new THREE.Vector3(0, 0.5, 0.5),

  //new THREE.Vector3(4, -10, 5),   // Fahrt nach unten

  // Wechsel in die Zwischenstufe
  new THREE.Vector3(1, 4, 16),
  // Wechsel in die Vogelperspektive
  new THREE.Vector3(0, 20, 0),
  new THREE.Vector3(0, 30, 0),
  new THREE.Vector3(0, 40, 0),
  new THREE.Vector3(0, 50, 0),
  //new THREE.Vector3(1, 40, 3),
]);

const pathPoints = pathCurve.getPoints(50);
const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
const pathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 0 });
let cameraPath = new THREE.Mesh(pathGeometry, pathMaterial);

// 🌇 SCENE SETTING -------------------------- 

var setcolor = 0x96A4B6;
scene = new THREE.Scene();
scene.background = new THREE.Color(setcolor);
scene.fog = new THREE.Fog(setcolor, 5, 16);
// scene.fog = new THREE.Fog(setcolor, 25, 1000); // damit der Nebel verschwindet 

// 👇 FLOOR ✅ -----------------------

var floor = generateFloor(1000, 1000);
floor.position.x = -4;
floor.name = 'floor';
floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true;

function generateFloor(w, d) {
  var geo = new THREE.PlaneBufferGeometry(w, d);
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
dirLight.shadowDarkness = 1;
dirLight.shadow.camera.top = 5;
dirLight.shadow.camera.bottom = - 5;
dirLight.shadow.camera.left = - 5;
dirLight.shadow.camera.right = 5;
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

// CALCULATES MOUSE POSITION 

function onMouseMove(event) {
  mouse.x = (event.clientX - windowHalf.x);
  mouse.y = (event.clientY - windowHalf.x);
  // console.log(mouse.x);
}

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

  helper(); // Koordinatensystem  
}

// 🎯 CLASS FOR SINGLE HOUSE -------------------------- 

class House {

  constructor(_xPos, _yPos, _zPos, _height, _tweetString, _fixedBoxSizeY, _roofColor, _neueZahl) {
    this.xPos = _xPos;
    this.yPos = _yPos;
    this.zPos = _zPos;

    this.fixedBoxSizeY = _fixedBoxSizeY;
    this.height = _height;
    this.width = 1;
    this.depth = 1;

    // this.tweetString = this.lineBreak(22, _tweetString);
    // console.log(this.lineBreak(28, _tweetString));
    this.tweetString = _tweetString;

    this.dynamicTexture = new THREEx.DynamicTexture(300, 300 * this.height)

    this.dynamicTexture.clear('rgb(29,41,81)')
    this.dynamicTexture.drawTextCooked({
      text: this.tweetString,
      lineHeight: 0.1 / this.height,
      emissive: 1,
      //transparent: true, 
      blending: THREE.AdditiveBlending, 
      fillStyle: "white",//"rgba(62,57,60,0.9)",//'white',
      font: "18px Courier",
      marginTop: ((this.height - this.fixedBoxSizeY + 1) / this.height) // da fixedBoxSize noch zu hoch ist.
    })

    // 🏠 GEOMETRY OF THE HOUSE 

    this.geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth);

    // COLORS OF THE ROOF AND BUILDING

    let buildingColor = "rgb(62,57,60)";
    this.roofColor = "rgb(0,0,0)";

    // Die Dächer der Häuser sollen zu 10% weiß und 90% schwarz sein und das durch eine zufällige Anordnung
    let colorProbability = Math.random();

    if (colorProbability < 0.5) {
      this.roofColor = "rgb(255,255,255)";
    }
    // emissiveMap: new THREE.Texture
    this.material = [
      new THREE.MeshLambertMaterial({ color: buildingColor, map: this.dynamicTexture.texture }),
      new THREE.MeshLambertMaterial({ color: buildingColor, map: this.dynamicTexture.texture }),
      new THREE.MeshLambertMaterial({ color: this.roofColor }),
      new THREE.MeshLambertMaterial({ color: this.roofColor }),
      new THREE.MeshLambertMaterial({ color: buildingColor, map: this.dynamicTexture.texture }),
      new THREE.MeshLambertMaterial({ color: buildingColor, map: this.dynamicTexture.texture })
    ];

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.geometry.castShadow = true;
    this.geometry.receiveShadow = true;

    // console.log('blöder shadow ' + this.geometry.castShadow);

    this.mesh.position.x = this.xPos + this.width / 2;
    this.mesh.position.y = this.yPos + this.height / 2;
    this.mesh.position.z = this.zPos + this.depth / 2;
  }

  // 🏢 GROWING HOUSES 

  animate() {

    let growingSpeed = 0.008;
    let roofColor = this.roofColor;

    //Die weißen Häuser sollen langsamer als die schwarzen Häuser wachsen
    if (roofColor == "rgb(255,255,255)") {
      growingSpeed = 0.002;
    } else {
      growingSpeed = 0.008;
    }

    //Die Häuser sollen nur beim Perspektivenwechseln wachsen
    if (userPosition > 0.4 && userPosition < 0.8) {
      this.mesh.scale.y += Math.random() * growingSpeed;
    } else {
      this.mesh.scale.y = this.mesh.scale.y;
    }

  }

  // ADDING LINE BREAKS 
  /*
    lineBreak(linebreakat, text) {
  
      let spaceMemory = 0; // wie viele Spaces zusätzlich gemacht wurden
      let stringwithbreaks = [];
      let currentPosition = 0;
      let backspace = linebreakat;
      let spacer = 0; // extra Spaces a
  
      for (var line = 0; line < 10; line++) {
        while (true) {
          if (currentPosition + backspace >= text.length) {
            for (var i = 0; i < backspace; i++) {
              stringwithbreaks.push(text[i + currentPosition])
            }
            return stringwithbreaks.join("");
          }
          if (backspace == 0) {
            for (var i = 0; i < linebreakat; i++) {
              stringwithbreaks.push(text[i + currentPosition])
            }
            currentPosition = stringwithbreaks.length - spaceMemory;
            backspace = linebreakat;
            break
          }
          if (text.charAt(backspace + currentPosition) == " ") {
  
            for (var i = 0; i < backspace; i++) {
              stringwithbreaks.push(text[i + currentPosition])
            }
            stringwithbreaks.push("ä");
            currentPosition = stringwithbreaks.length - spaceMemory;
            backspace = linebreakat;
            break
          } else {
            backspace--;
          }
        }
        for (var i = 0; i < stringwithbreaks.length; i++) {
          if (stringwithbreaks[i] == 'ä') {
            stringwithbreaks[i] = ' ';
            for (var j = 0; j < linebreakat - (i % linebreakat); j++) {
              spaceMemory++;
              stringwithbreaks.push(' ');
            }
          }
        }
        for (var i = 0; i < spacer; i++){
          spaceMemory++
          stringwithbreaks.push(' ');
        }
        spacer++;
      }
      return stringwithbreaks.join('');
    }
  */
}

// 🎯 CLASS FOR PLATFORM -------------------------- 

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

// 🎥 CAMERA ANIMATION + TEXT BOXES----------------------- 

function update(renderer, scene, camera) {

  userSpeed = userSpeed * 0.8;
  userPosition = userPosition + userSpeed;
  //console.log(userPosition);
  if (userPosition >= 0 && userPosition < 0.375) {
    camera.lookAt(pathCurve.getPointAt(userPosition + 0.01));
  } else {
    camera.lookAt(0, 8, 0);
  }

  if (userPosition >= 0 && userPosition < 1) {
    camera.position.copy(pathCurve.getPointAt(userPosition));
  } else {
    userPosition = 0;
  }

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

  // 👀 CAMERA MOVING ON MOUSE MOVEMENT 

  // console.log(mouse.x);
  /*
  if (mouse.x > 0) {
      target.x = (1 - mouse.x) * 0.002;
      target.y = (1 - mouse.y) * 0.002;
  
      camera.rotation.x += 0.1 * (target.y - camera.rotation.x); // nach oben
      camera.rotation.y += 0.3 * (target.x - camera.rotation.y); // nach rechts 
   }    
      else {
      target.x = (1 - mouse.x) * 0.002;
      target.y = (1 - mouse.y) * 0.002;
  
      camera.rotation.x = 0.5 * (target.y - camera.rotation.x); // nach oben
      camera.rotation.y = 0.3 * (target.x - camera.rotation.y); // nach links 
      }*/

  if (userPosition > 0 && userPosition < 0.4) {

    target.x = (mouse.x) * 0.002;
    //target.y = (1 - mouse.y) * 0.02;
    //camera.rotation.x += 0.5 * (target.y - camera.rotation.x); // nach oben
    camera.rotation.y += -(target.x - mouse.x) * 0.0002; // nach rechts 
  } else {
    camera.rotation.y = 0;
  }
  // console.log(camera.rotation.y)

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