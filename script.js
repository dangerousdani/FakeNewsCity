// 📀 LOAD THREE JS -------------------------- 

//FrameRate Stats
javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

import * as THREE from './sources/three.module.js';

// 🌐 GLOBAL VARIABLES -------------------------- 

let scene, renderer, camera;
let lon = 0, lat = 0;
let phi = 0, theta = 0;

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
  new THREE.Vector3(-4, 0.5, 4),
  new THREE.Vector3(-4, 0.5, 2),
  new THREE.Vector3(3, 0.5, 2),
  new THREE.Vector3(4, 0.5, 5),
  //new THREE.Vector3(4, -10, 5),   //Fahrt nach unten
  //Wechsel in die Zwischenstufe
  new THREE.Vector3(1, 5, 10),
  //Wechsel in die Vogelperspektive
  new THREE.Vector3(1, 30, 3),
  new THREE.Vector3(1, 40, 3),
]);

const pathPoints = pathCurve.getPoints(50);
const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
const pathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 0 });
let cameraPath = new THREE.Mesh(pathGeometry, pathMaterial);

// Camera Animation ----------------------- 

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

  //Animierte Textboxen

  if (userPosition >= 0 && userPosition < 0.1) {
    document.getElementById("scrollbox1").style.opacity = 1;
  } else {
    document.getElementById("scrollbox1").style.opacity = 0;
  }

  if (userPosition > 0.4 && userPosition < 0.7) {
    document.getElementById("scrollbox2").style.opacity = 1;
  } else {
    document.getElementById("scrollbox2").style.opacity = 0;
  }

  if (userPosition > 0.9 && userPosition < 1) {
    document.getElementById("scrollbox3").style.opacity = 1;
  } else {
    document.getElementById("scrollbox3").style.opacity = 0;
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
floor.rotation.x = Math.PI/2;

function generateFloor(w, d){
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
renderer.shadowMapType = THREE.PCFSoftShadowMap;
renderer.setClearColor('rgb(30,30,30)');
document.body.appendChild(renderer.domElement);

// 🔄 ANIMATION SETTINGS -------------------------- 
/*
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
} */

// 📊 LOAD JSON DATA ----------------------------------------
// Do not forget to load the D3 Framework in your HTML file!

d3.json("sources/newsapi.json").then(function (data) {

  // 🚀 RUN MAIN FUNCTIONS -------------------------- 

  init();
  animate();

  // 🎯 MAIN FUNCTION -------------------------- 

  function init() {

    let boxPositionX = 0;
    let boxPositionZ = 0;

    // 👇 YOUR 3D OBJECTS ✅ ----------------------

    let tweetID = 0;
    let districtSize = 6;
    let bufferX = -8;
    let bufferZ = 0;

    for (let j = 0; j <= 2; j++) {
      for (let k = -5; k <= -3; k++) {
        scene.add(generate_district(bufferX, k + bufferZ, districtSize, tweetID));
        tweetID += districtSize;
      }
      bufferX += 6
      bufferZ -= 9
    }

    function generate_district(valueX, valueZ, districtSize, tweetID) {

      let groupedObjectsA = new THREE.Group();

      let groupAPositionX = valueX;
      let groupAPositionZ = valueZ;

      groupedObjectsA.position.x = groupAPositionX;
      groupedObjectsA.position.z = groupAPositionZ;

      for (let i = 0; i < districtSize; i++) {
        
        let fixedBoxSize = 2;
        const boxSizeX = 1;
        let boxSizeY = Math.random() * 5 + fixedBoxSize; //muss let sein 0.5*6+2=5 5*0.1/100=0.005
        const boxSizeZ = 1;

        let text = data.article[tweetID + i].tweet;
        console.log('🐦 tweet: ' + text);

        let roof = data.article[tweetID + i].roof;
        console.log('🏠roof: ' + roof);
        

        let dynamicTexture = new THREEx.DynamicTexture(1400, 1400*boxSizeY)
        dynamicTexture.context.font = "12px Arial";
 
        dynamicTexture.clear('rgb(170,150,150)')
        dynamicTexture.drawTextCooked({
          text: text,
          lineHeight: 0.1/boxSizeY,
          fillStyle: 'black',
          marginTop: (boxSizeY-1)/boxSizeY
        })

        if (userPosition > 0.4 && userPosition < 0.7) {
          boxSizeY += 1;
        }
    
        // Colors of the Roof

        let whiteroof = [
          new THREE.MeshPhysicalMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshPhysicalMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshPhysicalMaterial({ color: 'rgb(245,245,235)', side: THREE.DoubleSide }),
          new THREE.MeshPhysicalMaterial({ color: 'rgb(245,245,235)', side: THREE.DoubleSide }),
          new THREE.MeshPhysicalMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshPhysicalMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
        ];

        let blackroof = [
          new THREE.MeshBasicMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshBasicMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide}),
          new THREE.MeshBasicMaterial({ color: 'rgb(5,8,12)', side: THREE.DoubleSide }),
          new THREE.MeshBasicMaterial({ color: 'rgb(5,8,12)', side: THREE.DoubleSide }),
          new THREE.MeshBasicMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture }),
          new THREE.MeshBasicMaterial({ color: 'rgb(255,255,255)', emissive: 0xaa9292, side: THREE.FrontSide, map: dynamicTexture.texture  }),
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
        mesh.position.y = boxSizeY/2;
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

        if (userPosition > 0.4 && userPosition < 0.7) {
          boxSizeY += 1;
          mesh.position.y += 1;
        }
      }
      // 👉 🌇 MAKE IT VISIBLE -------------------------- 
      return groupedObjectsA;
    }
    //scene.add(floor);
    //Want to see Camera-Path? ->
    // scene.add(cameraPath);
  }
});