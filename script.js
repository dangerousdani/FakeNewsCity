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
      new THREE.Vector3( 1, 0.5, 5 ),
      //Wechsel in die Zwischenstufe
      new THREE.Vector3( 1, 5, 10 ),
      //Wechsel in die Vogelperspektive
      new THREE.Vector3( 0, 20, 0 ),
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
    scene.background = new THREE.Color(0x96A4B6);
    scene.fog = new THREE.Fog(0xFFFFFF, 15, 35);

    // 🔶 HELPER CUBES ✅ ----------------------- 

    // helper();

    // 👇 FLOOR ✅ -----------------------
    /*var floor = generateFloor(1000, 1000);
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
    }*/

    //Pedestal
    const pedestalgeo = new THREE.BoxGeometry(22, 2, 22);
    const pedestalmat = new THREE.MeshPhongMaterial( { color: 0x000000 } );
    var pedestal = new THREE.Mesh( pedestalgeo, pedestalmat );
    pedestal.position.y = -1;
    scene.add( pedestal );

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

      //Colors of the Roof

      var whiteroof = [
        new THREE.MeshPhysicalMaterial({color: 'rgb(255,255,255)', side: THREE.FrontSide, map: dynamicTexture.texture}),
        new THREE.MeshPhysicalMaterial({color: 'rgb(255,255,255)', side: THREE.FrontSide, map: dynamicTexture.texture}),
        new THREE.MeshBasicMaterial({color: 'rgb(245,245,235)', side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color: 'rgb(245,245,235)', side: THREE.DoubleSide}), 
        new THREE.MeshPhysicalMaterial({color: 'rgb(255,255,255)', side: THREE.FrontSide, map: dynamicTexture.texture}),
        new THREE.MeshPhysicalMaterial({color: 'rgb(255,255,255)', side: THREE.FrontSide, map: dynamicTexture.texture}),
      ];

      var blackroof = [
        new THREE.MeshPhysicalMaterial({color: 'rgb(255,255,255)', side: THREE.FrontSide, map: dynamicTexture.texture}),
        new THREE.MeshPhysicalMaterial({color: 'rgb(255,255,255)', side: THREE.FrontSide, map: dynamicTexture.texture}),
        new THREE.MeshBasicMaterial({color: 'rgb(5,8,12)', side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color: 'rgb(5,8,12)', side: THREE.DoubleSide}), 
        new THREE.MeshPhysicalMaterial({color: 'rgb(255,255,255)', side: THREE.FrontSide, map: dynamicTexture.texture}),
        new THREE.MeshPhysicalMaterial({color: 'rgb(255,255,255)', side: THREE.FrontSide, map: dynamicTexture.texture}),
      ];

      var blackroof = new THREE.MeshFaceMaterial(blackroof); 
      var mesh = new THREE.Mesh(geometry, blackroof);

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

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
				hemiLight.position.set( 0, 20, 0 );
				scene.add( hemiLight );

				const dirLight = new THREE.DirectionalLight( 0xffffff );
				dirLight.position.set( - 3, 10, - 10 );
				dirLight.castShadow = true;
				dirLight.shadow.camera.top = 2;
				dirLight.shadow.camera.bottom = - 2;
				dirLight.shadow.camera.left = - 2;
				dirLight.shadow.camera.right = 2;
				dirLight.shadow.camera.near = 0.1;
				dirLight.shadow.camera.far = 40;
				scene.add( dirLight );

    // 👉 🌇 MAKE IT VISIBLE -------------------------- 

    scene.add(groupedObjectsA);
    //scene.add(floor);
    //Want to see Camera-Path? ->
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

});