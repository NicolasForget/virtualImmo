import React, { Component } from 'react';
import THREE from "three.js";
import $ from "jquery";
import PointerLockControls from "./libs/PointerLockControls";
import io from 'socket.io-client'

let socket = io(`http://localhost:4200`)
let StereoEffect = require('three-stereo-effect')(THREE);

let walls = [
    {
        id: 1,
        x: 0,
        y: 0,
        length: 10,
        radius: 0
    }, {
        id: 2,
        x: 10,
        y: 0,
        length: 10,
        radius: 270
    }, {
        id: 3,
        x: 10,
        y: 10,
        length: 10,
        radius: 180
    }, {
        id: 4,
        x: 0,
        y: 10,
        length: 10,
        radius: 90
    }
];

export default React.createClass({
    getInitialState(){
        return {}
    },

    componentDidMount(){
        var socket = io.connect('http://localhost:4200');

        socket.on("connect", (server) => {
            console.log("connected");

            socket.on('wallVR', function (data) {
                walls = data;
                console.log("yeah : ", data)
            });
        });


        (function () {

            var deviceOrientation = {};
            var screenOrientation = window.orientation || 0;

            function onDeviceOrientationChangeEvent(evt) {
                deviceOrientation = evt;
            }

            window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

            function getOrientation() {
                switch (window.screen.orientation || window.screen.mozOrientation) {
                    case 'landscape-primary':
                        return 90;
                    case 'landscape-secondary':
                        return -90;
                    case 'portrait-secondary':
                        return 180;
                    case 'portrait-primary':
                        return 0;
                }
                // this returns 90 if width is greater then height
                // and window orientation is undefined OR 0
                // if (!window.orientation && window.innerWidth > window.innerHeight)
                //   return 90;
                return window.orientation || 0;
            }

            function onScreenOrientationChangeEvent() {
                screenOrientation = getOrientation();
            }

            window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);


            THREE.DeviceOrientationControls = function (object) {

                this.object = object;

                this.object.rotation.reorder('YXZ');

                this.freeze = true;

                this.movementSpeed = 1.0;
                this.rollSpeed = 0.005;
                this.autoAlign = true;
                this.autoForward = false;

                this.alpha = 0;
                this.beta = 0;
                this.gamma = 0;
                this.orient = 0;

                this.alignQuaternion = new THREE.Quaternion();
                this.orientationQuaternion = new THREE.Quaternion();

                var quaternion = new THREE.Quaternion();
                var quaternionLerp = new THREE.Quaternion();

                var tempVector3 = new THREE.Vector3();
                var tempMatrix4 = new THREE.Matrix4();
                var tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
                var tempQuaternion = new THREE.Quaternion();

                var zee = new THREE.Vector3(0, 0, 1);
                var up = new THREE.Vector3(0, 1, 0);
                var v0 = new THREE.Vector3(0, 0, 0);
                var euler = new THREE.Euler();
                var q0 = new THREE.Quaternion(); // - PI/2 around the x-axis
                var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));


                this.update = (function (delta) {

                    return function (delta) {

                        if (this.freeze) return;

                        // should not need this
                        //var orientation = getOrientation();
                        //if (orientation !== this.screenOrientation) {
                        //this.screenOrientation = orientation;
                        //this.autoAlign = true;
                        //}

                        this.alpha = deviceOrientation.gamma ?
                            THREE.Math.degToRad(deviceOrientation.alpha) : 0; // Z
                        this.beta = deviceOrientation.beta ?
                            THREE.Math.degToRad(deviceOrientation.beta) : 0; // X'
                        this.gamma = deviceOrientation.gamma ?
                            THREE.Math.degToRad(deviceOrientation.gamma) : 0; // Y''
                        this.orient = screenOrientation ?
                            THREE.Math.degToRad(screenOrientation) : 0; // O

                        // The angles alpha, beta and gamma
                        // form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

                        // 'ZXY' for the device, but 'YXZ' for us
                        euler.set(this.beta, this.alpha, -this.gamma, 'YXZ');

                        quaternion.setFromEuler(euler);
                        quaternionLerp.slerp(quaternion, 0.5); // interpolate

                        // orient the device
                        if (this.autoAlign) this.orientationQuaternion.copy(quaternion); // interpolation breaks the auto alignment
                        else this.orientationQuaternion.copy(quaternionLerp);

                        // camera looks out the back of the device, not the top
                        this.orientationQuaternion.multiply(q1);

                        // adjust for screen orientation
                        this.orientationQuaternion.multiply(q0.setFromAxisAngle(zee, -this.orient));

                        this.object.quaternion.copy(this.alignQuaternion);
                        this.object.quaternion.multiply(this.orientationQuaternion);

                        if (this.autoForward) {

                            tempVector3
                                .set(0, 0, -1)
                                .applyQuaternion(this.object.quaternion, 'ZXY')
                                .setLength(this.movementSpeed / 50); // TODO: why 50 :S

                            this.object.position.add(tempVector3);

                        }

                        if (this.autoAlign && this.alpha !== 0) {

                            this.autoAlign = false;

                            this.align();

                        }

                    };
                })();



                this.align = function () {

                    tempVector3
                        .set(0, 0, -1)
                        .applyQuaternion(tempQuaternion.copy(this.orientationQuaternion).inverse(), 'ZXY');

                    tempEuler.setFromQuaternion(
                        tempQuaternion.setFromRotationMatrix(
                            tempMatrix4.lookAt(tempVector3, v0, up)
                        )
                    );

                    tempEuler.set(0, tempEuler.y, 0);
                    this.alignQuaternion.setFromEuler(tempEuler);

                };

                this.connect = function () {
                    this.freeze = false;
                };

                this.disconnect = function () {
                    this.freze = true;
                };

            };

        })();


        function initWalls() {
            //walls
            var wallTexture = THREE.ImageUtils.loadTexture('./images/wall.png');
            var wallMesh = new THREE.MeshBasicMaterial({map: wallTexture});
            for (var i = 1; i < i.length; i++) {
                for (var y = 1; i < 4; y++) {
                    for (var x = walls[i].x1; x < walls[i].x2; x++) {
                        for (var z = walls[i].y1; z < walls[i].y2; z++) {
                            var wallCube = new THREE.Mesh(cube, wallMesh);
                            wallCube.position.x = x;
                            wallCube.position.z = z;
                            wallCube.position.y = y;
                            scene.add(wallCube);
                        }
                    }
                }
            }

        }

        var camera, scene, renderer, glRenderer, stereoEffect;
        var geometry, material, mesh;
        var controls;
        var controls2;
        var controlsEnabled = false;
        var moveForward = false;
        var moveBackward = false;
        var moveLeft = false;
        var moveRight = false;
        var canJump = false;
        var prevTime = performance.now();
        var velocity = new THREE.Vector3();
        var objects = [];
        var raycaster;
        var activate = document.getElementById('activate');
        var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
        if (havePointerLock) {
            var element = document.body;
            var pointerlockchange = function (event) {
                if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                    controlsEnabled = true;
                    controls.enabled = true;
                    activate.style.display = 'none';
                } else {
                    controls.enabled = false;
                    activate.style.display = 'block';
                }
            };
            var pointerlockerror = function (event) {
            };
            // Hook pointer lock state change events
            document.addEventListener('pointerlockchange', pointerlockchange, false);
            document.addEventListener('mozpointerlockchange', pointerlockchange, false);
            document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
            document.addEventListener('pointerlockerror', pointerlockerror, false);
            document.addEventListener('mozpointerlockerror', pointerlockerror, false);
            document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
            activate.addEventListener('click', function (event) {
                activate.style.display = 'none';
                // Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();
            }, false);
            activate.addEventListener('touchstart', function (event) {
                activate.style.display = 'none';
                // Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();
                controls.enabled = true;
                controlsEnabled = true;
            }, false);
            
        } else {
            activate.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
        }


        init();
        animate();


        /** for gamepad */
        var hasGP = false;
        var repGP;
     
        function canGame() {
            return "getGamepads" in navigator;
        }
     
        var canape_cube; 


        function init() {
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0xffffff, 0, 750);
            var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
            light.position.set(0.5, 1, 0.75);
            scene.add(light);
            controls = new PointerLockControls(THREE, camera);
            controls.getObject().position.y = 2;
            scene.add(controls.getObject());
            var onKeyDown = function (event) {
                switch (event.keyCode) {
                    case 38: // up
                        moveForward = true;
                        break;
                    case 37: // left
                        moveLeft = true;
                        break;
                    case 40: // down
                        moveBackward = true;
                        break;
                    case 39: // right
                        moveRight = true;
                        break;
                }
            };
            var onKeyUp = function (event) {
                switch (event.keyCode) {
                    case 38: // up
                        moveForward = false;
                        break;
                    case 37: // left
                        moveLeft = false;
                        break;
                    case 40: // down
                        moveBackward = false;
                        break;
                    case 39: // right
                        moveRight = false;
                        break;
                }
            };
            document.addEventListener('keydown', onKeyDown, false);
            document.addEventListener('keyup', onKeyUp, false);
            raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);


            var WORLD_SIZE = 5;


            //ground
            var cube = new THREE.BoxGeometry(1, 1, 1);
            cube.rotateX(-Math.PI / 2);
            var grassTexture = THREE.ImageUtils.loadTexture('./images/tile.png');
            var grassMesh = new THREE.MeshBasicMaterial({map: grassTexture});
            for (var x = -WORLD_SIZE * 5; x < WORLD_SIZE * 5; x++) {
                for (var z = -WORLD_SIZE * 5; z < WORLD_SIZE * 5; z++) {
                    var grassCube = new THREE.Mesh(cube, grassMesh);
                    grassCube.position.x = x;
                    grassCube.position.z = z;
                    grassCube.position.y = 0;
                    scene.add(grassCube);
                }
            }


            //walls
            var wallTexture = THREE.ImageUtils.loadTexture('./images/wall.png');
            var wallMesh = new THREE.MeshBasicMaterial({map: wallTexture});

            function rotateObject(object,degreeX=0, degreeY=0, degreeZ=0){
                degreeX = (degreeX * Math.PI)/180;
                degreeY = (degreeY * Math.PI)/180;
                degreeZ = (degreeZ * Math.PI)/180;
                object.rotateX(degreeX);
                object.rotateY(degreeY);
                object.rotateZ(degreeZ);
            }

            let colors = [0x00ff00, 0x0000ff, 0xff0000, 0xf0f0f0]

            for (var i = 0; i < walls.length; i++) {
                var wallBoxx = new THREE.BoxGeometry(walls[i].length, 10, 0.01);
                var material = new THREE.MeshBasicMaterial({color: colors[i]});
                var wall = new THREE.Mesh(wallBoxx, material);
                rotateObject(wall, 0, walls[i].radius, 0)
                wall.position.x = walls[i].x;
                wall.position.z = walls[i].y;
                if(i == 0){
                    wall.position.z = walls[i].length / 2;
                }
                if(i == 1){
                    wall.position.x = walls[i].length / 2;
                }
                if(i == 2){
                    wall.position.z = - walls[i].length / 2;
                    wall.position.x = 0;
                }
                if(i == 3){
                    wall.position.z = 0;
                    wall.position.x = - walls[i].length / 2;
                }
                scene.add(wall);
            }


            var canape_toile = THREE.ImageUtils.loadTexture('./images/tissu-de-toile.jpg');
            var canape_grass = THREE.ImageUtils.loadTexture('./images/grass.png');

            var canapeMesh = new THREE.MeshBasicMaterial({map: canape_toile});
            
            canape_cube = new THREE.Mesh(cube, canapeMesh);
            canape_cube.position.x = 2;
            canape_cube.position.z = 2;
            canape_cube.position.y = 1;
            scene.add(canape_cube);

            var i = 0;
            canape_cube.changeTexture = function() { 
                i = (i == 0)? 1:0;
                console.log(this);
                var tab = [canape_toile, canape_grass]
                canapeMesh = new THREE.MeshBasicMaterial({map: tab[i]});
                this.material = canapeMesh;
            }



            renderer = glRenderer = new THREE.WebGLRenderer();
            renderer.setClearColor(0xffffff);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            stereoEffect = new StereoEffect(renderer);
            stereoEffect.eyeSeparation = 1;
            stereoEffect.setSize(window.innerWidth, window.innerHeight);
            window.addEventListener('resize', onWindowResize, false);
        }

        var controls2_is_init = false 
        function setOrientationControls(e) {
            if (!e.alpha || controls2_is_init) {
                return;
            }
            controls2 = new THREE.DeviceOrientationControls(camera, true);
            controls2.connect();
            controls2_is_init = true;
        }

        window.addEventListener('deviceorientation', setOrientationControls, true);

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            stereoEffect.setSize(window.innerWidth, window.innerHeight);
        }


        function animate() {
            requestAnimationFrame(animate);

            if (controlsEnabled) {
                if(controls2_is_init){
                    controls2.update();
                    var rot = controls2.object.getWorldDirection();
                    
                    if(canGame()){
                        var gp = navigator.getGamepads()[0];

                        try{


                            var axes = gp.axes;
                            controls2.object.position.x +=  rot.x * (-axes[1]) * 0.2;
                            controls2.object.position.z +=  rot.z * (-axes[1]) * 0.2;
                            
                            controls2.object.position.x +=  rot.z * (-axes[0]) * 0.2;
                            controls2.object.position.z +=  -rot.x * (-axes[0]) * 0.2;

                           

                        }catch(err){}

                    }
                }else{
                    raycaster.ray.origin.copy(controls.getObject().position);
 
                    raycaster.ray.origin.y -= 10;
                    var intersections = raycaster.intersectObjects(objects);
                    var isOnObject = intersections.length > 0;
                    var time = performance.now();
                    var delta = ( time - prevTime ) / 1000;
                    velocity.x -= velocity.x * 10.0 * delta;
                    velocity.z -= velocity.z * 10.0 * delta;
                    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
                    if (moveForward ) velocity.x += 40.0 * delta;
                    if (moveBackward ) velocity.x -= 40.0 * delta;
                    if (moveLeft ) velocity.z -= 40.0 * delta;
                    if (moveRight ) velocity.z += 40.0 * delta;
                

                    if (isOnObject === true) {
                        velocity.y = Math.max(0, velocity.y);
                    }
                        controls.getObject().translateX(velocity.x * delta);
                        controls.getObject().translateY(velocity.y * delta);
                        controls.getObject().translateZ(velocity.z * delta);

                    controls.getObject().position.y = 2;

                    prevTime = time;
                }

                 //Control if element is in selector:
                    //

                    var pointer =  new THREE.Vector2();
                    pointer.x = 0;
                    pointer.y = 0; 
                    var selector = new THREE.Raycaster();
                    selector.setFromCamera(pointer, camera );

                    var intersects = selector.intersectObjects([canape_cube]); 

                    if ( intersects.length > 0 ) {
                        $(".selector").addClass('active');
                        //console.log(intersects[0].object);
                        if (canGame()){
                            var gp = navigator.getGamepads()[0];
                            var buttons = gp.buttons

                            /// TESTER LES BOUTONS POUR LE GACHETTE !!!!!
                            if(gp.buttons[4].pressed){
                                intersects[0].object.changeTexture();
                            }
                        }

                    }else{
                        $(".selector").removeClass('active');
                    }
            }else{
                //$(".animatelog").html("controls disabled");
            }
            stereoEffect.render(scene, camera);
        }
    },

    render() {
        return (
            <div id="blocker">
                <div id="activate">
                    <div className="text">
                        Pause, click anywhere to resume
                    </div>
                </div>
                <div className = "selector left">
                </div>
                <div className = "selector right">
                </div>
                <div className = "animatelog">
                </div>
                <div className = "key">
                </div>
            </div>
        );
    }
});
