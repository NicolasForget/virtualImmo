import React, { Component } from 'react';
import THREE from "three.js";
import $ from "jquery";
import PointerLockControls from "./libs/PointerLockControls";
import io from 'socket.io-client'

let socket = io(`http://localhost:4200`)
let StereoEffect = require('three-stereo-effect')(THREE);

let walls = [{
    id: 3,
    x: 0,
    y: 0,
    length: 10,
    radius: 0
}, {
    id: 4,
    x: 10,
    y: 0,
    length: 10,
    radius: 90
}, {
    id: 5,
    x: 10,
    y: 10,
    length: 10,
    radius: 180
}, {
    id: 5,
    x: 0,
    y: 10,
    length: 10,
    radius: 270
}];

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
                initWalls();
            });

            socket.on('objectVR', function (data) {
                var loader = new THREE.JSONLoader();
                loader.load(data, function (geometryss) {
                    var material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('../images/grass.png')});
                    var mesh = new THREE.Mesh(geometry, material);
                    mesh.position.x = -5;
                    mesh.position.y = 0.5;
                    mesh.position.z = -5;
                    scene.add(mesh);
                });
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

                // //debug
                // window.addEventListener('click', (function(){
                //   this.align();
                // }).bind(this));

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


        function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
            degreeX = (degreeX * Math.PI) / 180;
            degreeY = (degreeY * Math.PI) / 180;
            degreeZ = (degreeZ * Math.PI) / 180;
            object.rotateX(degreeX);
            object.rotateY(degreeY);
            object.rotateZ(degreeZ);
        }

        function initWalls() {
            for (var i = 0; i < walls.length; i++) {
                var wallBox = new THREE.BoxGeometry(walls[i].length, 5, 0.01);
                var material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('../images/brick.jpg')});
                var wall = new THREE.Mesh(wallBox, material);

                var pivot = new THREE.Object3D();
                pivot.position.x = 0;
                pivot.position.z = 0;
                pivot.position.y = 2.5;
                wall.position.x = walls[i].x - walls[i].length / 2;
                wall.position.z = walls[i].y;
                pivot.rotation.y = walls[i].radius * 0.00872665 * 2;
                pivot.add(wall);
                scene.add(pivot);


                var loader = new THREE.JSONLoader();
                loader.load('../images/sofa2.json', function (geometry) {
                    var sofaMaterial = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('../images/mufiber03.png')});
                    var mesh = new THREE.Mesh(geometry, sofaMaterial);
                    mesh.position.x = -5;
                    mesh.position.y = 0.5;
                    mesh.position.z = -5;
                    scene.add(mesh);

                });


            }
        }

        var camera, scene, renderer, glRenderer, stereoEffect;
        var geometry;
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
 
    function reportOnGamepad() {
        if(canGame){
            $(".key").html("can game");

            var gp = navigator.getGamepads()[0];
            var html = "";
            for(var i=0;i<gp.buttons.length;i++) {
                html+= "Button "+(i+1)+": ";
                html+= gp.buttons[i].pressed;
            }

            if (gp.buttons[3].pressed){
               console.log(gp.buttons[3].pressed);
               $(activate).trigger("click");
            }

            for(var i=0;i<gp.axes.length; i+=2) {
                html= "Stick "+(Math.ceil(i/2)+1)+": "+gp.axes[i]+","+gp.axes[i+1];
                if (gp.axes[i+1]==1){
                    moveBackward = true;
                    moveForward = false;
                    $(".key").html("moveBackward", moveBackward.toString());
                }
                else if (gp.axes[i+1]==-1){
                    moveForward = true;
                    moveBackward = false;
                    $(".key").html("moveForward", moveForward.toString());

                }
                else{
                    moveBackward = false;
                    moveForward = false;
                }

                if (gp.axes[i]==1){
                    moveRight = true;
                    moveLeft = false;
                    $(".key").html("moveRight", moveRight.toString());

                }
                else if (gp.axes[i]==-1){
                    moveLeft = true;
                    moveRight = false;
                    $(".key").html("moveLeft",moveLeft.toString());
                }
                else{
                    moveLeft = false;
                    moveRight = false;
                }
                
            }

     
            console.log(html);
        }
        else{
            $(".key").html("cant game");
        }
    }

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
                    case 90: // z
                        moveForward = true;
                        break;
                    case 37: // left
                    case 81: // q
                        moveLeft = true;
                        break;
                    case 40: // down
                    case 83: // s
                        moveBackward = true;
                        break;
                    case 39: // right
                    case 68: // d
                        moveRight = true;
                        break;
                }
            };
            var onKeyUp = function (event) {
                switch (event.keyCode) {
                    case 38: // up
                    case 90: // up
                        moveForward = false;
                        break;
                    case 37: // left
                    case 81: // q
                        moveLeft = false;
                        break;
                    case 40: // down
                    case 83: // s
                        moveBackward = false;
                        break;
                    case 39: // right
                    case 68: // d
                        moveRight = false;
                        break;
                }
            };
            document.addEventListener('keydown', onKeyDown, false);
            document.addEventListener('keyup', onKeyUp, false);
            raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

            // floor
            //        geometry = new THREE.PlaneGeometry(200, 200, 10, 10);
            //        geometry.rotateX(-Math.PI / 2);
            //
            //        for (var i = 0, l = geometry.faces.length; i < l; i++) {
            //            var face = geometry.faces[i];
            //            face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
            //            face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
            //            face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
            //        }
            //
            //        material = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('./images/grass.jpg')});
            //        mesh = new THREE.Mesh(geometry, material);
            //        scene.add(mesh);

            var WORLD_SIZE = 15;

            //ground
            var cube = new THREE.BoxGeometry(1, 1, 1);
            var grassTexture = THREE.ImageUtils.loadTexture('../images/ground.jpg   ');
            var grassMesh = new THREE.MeshBasicMaterial({map: grassTexture});
            for (var x = -WORLD_SIZE; x < WORLD_SIZE; x++) {
                for (var z = -WORLD_SIZE; z < WORLD_SIZE; z++) {
                    var grassCube = new THREE.Mesh(cube, grassMesh);
                    grassCube.position.x = x;
                    grassCube.position.z = z;
                    grassCube.position.y = 0;


                    scene.add(grassCube);
                    //var pivot = new THREE.Object3D();
                    //pivot.position.x = 0;
                    //pivot.position.z = 0;
                    //pivot.rotation.y = 0.3;
                    //scene.add(pivot);
                    //pivot.add(grassCube);

                }
            }

            //walls
            initWalls();

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

        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }

            controls2 = new THREE.DeviceOrientationControls(camera, true);
            controls2.connect();
            controls2.update();


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
                var intersections = raycaster.intersectObjects(objects);
                var isOnObject = intersections.length > 0;
                var time = performance.now();
                var delta = ( time - prevTime ) / 1000;
                velocity.x -= velocity.x * 10.0 * delta;
                velocity.z -= velocity.z * 10.0 * delta;
                velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
                if (moveForward) velocity.z -= 40.0 * delta;
                if (moveBackward) velocity.z += 40.0 * delta;
                if (moveLeft) velocity.x -= 40.0 * delta;
                if (moveRight) velocity.x += 40.0 * delta;

                if (moveForward) $(".animatelog").html("up");
                if (moveBackward) $(".animatelog").html("down");
                if (moveLeft) $(".animatelog").html("left");
                if (moveRight) $(".animatelog").html("right");

                if (isOnObject === true) {
                    velocity.y = Math.max(0, velocity.y);
                }
                controls.getObject().translateX(velocity.x * delta);
                controls.getObject().translateY(velocity.y * delta);
                controls.getObject().translateZ(velocity.z * delta);
                controls.getObject().position.y = 2;
                prevTime = time;
            }else{
                $(".animatelog").html("controls disabled");
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
                <div className = "animatelog">
                    animate
                </div>
                <div className = "key">
                    key
                </div>
            </div>
        );
    }
});
