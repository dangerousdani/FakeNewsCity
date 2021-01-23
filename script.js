// 📀 LOAD THREE JS -------------------------- 

import * as THREE from './sources/three.module.js';

// 📊 LOAD JSON DATA ----------------------------------------
// Do not forget to load the D3 Framework in your HTML file!

d3.json("sources/newsapi.json").then(function (data) {

  // 🌐 GLOBAL VARIABLES -------------------------- 

  var scene, renderer, camera;
  var lon = 0, lat = 0;
  var phi = 0, theta = 0;

  let userSpeed = 0;
  let userPosition = 0;

  window.addEventListener('wheel', function(wheelEvent) {
    wheelEvent.preventDefault();
    wheelEvent.stopPropagation();
    userSpeed += wheelEvent.deltaY*0.00002;
  })

  var startRow = 0;
  var numberOfObjects = startRow + 29;

  var scrollbox1 = document.getElementById("scrollbox1");
  var scrollbox2 = document.getElementById("scrollbox2");
  var scrollbox3 = document.getElementById("scrollbox3");

  // 🌐 GROUPS SETTING -------------------------- 

  var groupedObjectsA = new THREE.Group();
  
    // 🚀 RUN MAIN FUNCTIONS -------------------------- 

  init();
  animate();

  // 🎯 MAIN FUNCTION -------------------------- 

  function init() {

    // 🎥 CAM SETTING -------------------------- 

    var fov = 70;
    var aspect = window.innerWidth / window.innerHeight;
    var near = 0.01;
    var far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    //Camera Path
    //Vector values: (- = nachlinks/+ = nachrechts, - = nach unten/+ = nach oben, - = nach hinten/ + = nach vorne)
    const pathCurve = new THREE.CatmullRomCurve3( [
      //Froschperspektive
      new THREE.Vector3( -3, 0.5, 5 ),
      new THREE.Vector3( -3, 0.5, 1 ),
      new THREE.Vector3( 3, 0.5, 1 ),
      new THREE.Vector3( 3, 0.5, -4 ),
      new THREE.Vector3( 0, 0.5, 5 ),
      //Wechsel in die Zwischenstufe
      new THREE.Vector3( 0, 5, 10 ),
      //Wechsel in die Vogelperspektive
      new THREE.Vector3( 0, 20, 0 )
    ] );

    const pathPoints = pathCurve.getPoints( 50 );
    const pathGeometry = new THREE.BufferGeometry().setFromPoints( pathPoints );
    const pathMaterial = new THREE.LineBasicMaterial( { color : 0xffffff, linewidth: 0 } );
    let cameraPath = new THREE.Mesh( pathGeometry, pathMaterial );

    // Camera Animation ----------------------- 

    update(renderer, scene, camera);

    function update(renderer, scene, camera){
   
    userSpeed = userSpeed * 0.8;
    userPosition = userPosition + userSpeed;
    //console.log(userPosition);
    camera.lookAt(0,0,0);

    if (userPosition >= 0 && userPosition < 1) {
      camera.position.copy(pathCurve.getPointAt(userPosition));
    } else {
      userPosition = 0;
    }

    if(userPosition >= 0 && userPosition < 0.1){
    document.getElementById("scrollbox1").style.opacity = 1;
    } else {
      document.getElementById("scrollbox1").style.opacity = 0;
    }

    if(userPosition > 0.4 && userPosition < 0.7){
    document.getElementById("scrollbox2").style.opacity = 1;
    } else {
      document.getElementById("scrollbox2").style.opacity = 0;
    }

    if(userPosition > 0.9 && userPosition < 1){
    document.getElementById("scrollbox3").style.opacity = 1;
    } else {
      document.getElementById("scrollbox3").style.opacity = 0;
    }

    requestAnimationFrame(function() {
        update(renderer, scene, camera);
    });

    }
    
    // 🌇 SCENE SETTING -------------------------- 

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0xFFFFFF, 15, 35);

    // 🔶 HELPER CUBES ✅ ----------------------- 

    // helper();

    // 👇 FLOOR ✅ -----------------------
    var floor = generateFloor(1000, 1000);
    floor.position.x = -4;
    floor.name = 'floor';
    floor.rotation.x = Math.PI/2;

    function generateFloor(w, d){
    var geo = new THREE.PlaneGeometry(w, d);
    var mat = new THREE.MeshPhysicalMaterial({
        color: 'rgb(100,100,100)',
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    return mesh;
}

    // 👇 YOUR 3D OBJECTS ✅ ----------------------- 

    var boxPositionX = 0;
    var boxPositionZ = 0;

    for (var i = startRow; i <= numberOfObjects; i++) {
      console.log('🌤 Data: ' + i);

      var likes = data.article[i].likes;
      var comments = data.article[i].comments;
      var retweets = data.article[i].retweets;

      var text = data.article[i].tweet;
      console.log('🌤 tweet: ' + text);

      var dynamicTexture = new THREEx.DynamicTexture(2000, 2000)
      dynamicTexture.context.font = "bold " + (0.2 * 512) + "px Arial";

      dynamicTexture.clear('gray')
      dynamicTexture.drawTextCooked({
        text: text,
        lineHeight: 0.07,
        fillStyle : 'white',
      })

      var boxSizeX = 1;
      var boxSizeY = (likes + comments + retweets) / 1000;
      var boxSizeZ = 1;

      var boxDistance = 1;
      var boxMaxRowItems = 10;

      var geometry = new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ);
      var material = new THREE.MeshPhysicalMaterial({
        color: 'rgb(255,255,255)',
        side: THREE.FrontSide,
        map: dynamicTexture.texture
      });
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.random() * 15 - 0.5;
      mesh.position.y = boxSizeY / 2;
      mesh.position.z = Math.random() * 10 - 0.5;
      groupedObjectsA.add(mesh);
      
      mesh.castShadow = true;
      
      var boxRowBreak = boxMaxRowItems * (boxSizeX + boxDistance);

      console.log('boxRowBreak: ' + boxRowBreak);

      boxPositionX = boxPositionX + boxDistance + boxSizeX;
      if (boxPositionX >= boxRowBreak) {
        boxPositionX = 0;
        boxPositionZ = boxPositionZ + boxDistance + boxSizeZ;
      }
    }

    groupedObjectsA.position.x = -boxRowBreak / 2;
    groupedObjectsA.position.z = -boxPositionZ / 2;

    // 🌞 LIGHT SETTINGS -------------------------- 

    var light = new THREE.PointLight(0xFFFFFF, 1, 1000);
    light.position.set(0, 0, 210);
    scene.add(light);

    var light = new THREE.PointLight(0xFFFFFF, 2, 2000);
    light.position.set(0, -211, 50);
    scene.add(light);

    var light = new THREE.PointLight(0xFFFFFF, 2, 2000);
    light.position.set(-211, 0, 50);
    scene.add(light);

    var light = new THREE.PointLight(0xFFFFFF, 1, 2000);
    light.position.set(200, 211, 50);
    scene.add(light);

    // 👉 🌇 MAKE IT VISIBLE -------------------------- 

    scene.add(groupedObjectsA);
    scene.add(floor);
    // scene.add(cameraPath);

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

  }

  // 🔄 ANIMATION SETTINGS -------------------------- 

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);   
    
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

});