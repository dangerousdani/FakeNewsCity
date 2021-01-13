// 📀 LOAD THREE JS -------------------------- 

import * as THREE from './sources/three.module.js';

// 📊 LOAD JSON DATA ----------------------------------------
// Do not forget to load the D3 Framework in your HTML file!



d3.json("sources/newsapi.json").then(function (data) {

  // 🌐 GLOBAL VARIABLES -------------------------- 

  var scene, renderer, camera;
  //var onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;
  var lon = 0, lat = 0;
  var phi = 0, theta = 0;

  let speed = 0;
  let position = 0;

  window.addEventListener('wheel', (e)=>{
    speed += e.deltaY*0.0002;
  })

  var startRow = 0;
  var numberOfObjects = startRow + 29;

  

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

    camera.position.x = -2;
    camera.position.y = 1;
    camera.position.z = 10;
    //camera.lookAt(new THREE.Vector3(0,0,0));
    //camera.lookAt(scene.position);

    // Camera Animation ----------------------- 

    update(renderer, scene, camera);

    function update(renderer, scene, camera){
   
    position += speed;
    speed *=0.8;
    camera.position.z = position;

    requestAnimationFrame(function() {
        update(renderer, scene, camera);
    });

    }

    // CAMERA CURVE -------------------------- 

    //Create a closed wavey loop
    const curve = new THREE.CatmullRomCurve3( [
      new THREE.Vector3( -10, 0, 10 ),
      new THREE.Vector3( -5, 5, 5 ),
      new THREE.Vector3( 0, 0, 0 ),
      new THREE.Vector3( 5, -5, 5 ),
      new THREE.Vector3( 10, 0, 10 )
    ] );

    const points = curve.getPoints( 50 );
    const geometry2 = new THREE.BufferGeometry().setFromPoints( points );

    const material2 = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    // Create the final object to add to the scene
    const curveObject = new THREE.Line( geometry2, material2 );

    // 🌇 SCENE SETTING -------------------------- 

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0xFFFFFF, 15, 35);

    // 🔶 HELPER CUBES ✅ ----------------------- 

    // helper();

    // 👇 FLOOR ✅ -----------------------
    var floor = generateFloor(22, 22);
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

    /*
    // 🐭 PART OF MOUSE CONTOLL -------------------------- 

    document.addEventListener('mousedown', onDocumentMouseDown, true);
    document.addEventListener('wheel', onDocumentMouseWheel, true);
    */
  }

  // 🔄 ANIMATION SETTINGS -------------------------- 

  function animate() {
    requestAnimationFrame(animate);
    /*
    // MOUSE 
    lon += 0;
    lat = Math.max(- 85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);
    camera.position.x = 10 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 10 * Math.cos(phi) + 10;
    camera.position.z = 10 * Math.sin(phi) * Math.sin(theta) + 10;
    camera.lookAt(scene.position);
    */
    renderer.render(scene, camera);
    
  }

  // 🐭 PART OF MOUSE CONTOLL -------------------------- 
   /*
   function onDocumentMouseDown(event) {
    event.preventDefault();
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
  }*/

  // 🐭 PART OF MOUSE CONTOLL -------------------------- 
  /*
  function onDocumentMouseMove(event) {
    lon = (event.clientX - onPointerDownPointerX) * 0.1 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
  }*/

  // 🐭 PART OF MOUSE CONTOLL -------------------------- 
  /*
  function onDocumentMouseUp() {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
  }*/

  // 🐭 PART OF MOUSE CONTOLL -------------------------- 
/*
  function onDocumentMouseWheel(event) {
    var fov = camera.fov + event.deltaY * 0.05;
    camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
    camera.updateProjectionMatrix();
  }*/

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