import React, { Component } from 'react';
import THREE from "three.js";
import PointerLockControls from "./libs/PointerLockControls";
import io from 'socket.io-client'

let socket = io(`http://localhost:4200`)
let StereoEffect = require('three-stereo-effect')(THREE);

export default React.createClass({
    getInitialState(){
        return {}
    },

    componentDidMount(){
        var socket = io.connect('http://localhost:4200');

        socket.on('wallVR', function (data) {
            console.log("yeah : ", data)
        });

        (function() {

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


            THREE.DeviceOrientationControls = function(object) {

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
                var q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));


                this.update = (function(delta) {

                    return function(delta) {

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
                        euler.set(this.beta, this.alpha, - this.gamma, 'YXZ');

                        quaternion.setFromEuler(euler);
                        quaternionLerp.slerp(quaternion, 0.5); // interpolate

                        // orient the device
                        if (this.autoAlign) this.orientationQuaternion.copy(quaternion); // interpolation breaks the auto alignment
                        else this.orientationQuaternion.copy(quaternionLerp);

                        // camera looks out the back of the device, not the top
                        this.orientationQuaternion.multiply(q1);

                        // adjust for screen orientation
                        this.orientationQuaternion.multiply(q0.setFromAxisAngle(zee, - this.orient));

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

                this.align = function() {

                    tempVector3
                        .set(0, 0, -1)
                        .applyQuaternion( tempQuaternion.copy(this.orientationQuaternion).inverse(), 'ZXY' );

                    tempEuler.setFromQuaternion(
                        tempQuaternion.setFromRotationMatrix(
                            tempMatrix4.lookAt(tempVector3, v0, up)
                        )
                    );

                    tempEuler.set(0, tempEuler.y, 0);
                    this.alignQuaternion.setFromEuler(tempEuler);

                };

                this.connect = function() {
                    this.freeze = false;
                };

                this.disconnect = function() {
                    this.freze = true;
                };

            };

        })();


        var camera, scene, renderer, glRenderer, stereoEffect;
        var geometry, material, mesh;
        var controls;
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
            }, false);
        } else {
            activate.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
        }


        init();
        animate();
        var controlsEnabled = false;
        var moveForward = false;
        var moveBackward = false;
        var moveLeft = false;
        var moveRight = false;
        var canJump = false;
        var prevTime = performance.now();
        var velocity = new THREE.Vector3();

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

            var WORLD_SIZE = 5;


            //ground
            var cube = new THREE.BoxGeometry(1, 1, 1);
            cube.rotateX(-Math.PI / 2);
            var grassTexture = THREE.ImageUtils.loadTexture('./images/tile.png');
            var grassMesh = new THREE.MeshBasicMaterial({map: grassTexture});
            for (var x = -WORLD_SIZE; x < WORLD_SIZE; x++) {
                for (var z = -WORLD_SIZE; z < WORLD_SIZE; z++) {
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
            for (var y = 1; y < 4; y++) {
                for (var x = -WORLD_SIZE; x < WORLD_SIZE; x++) {
                    for (var z = -WORLD_SIZE; z < WORLD_SIZE; z++) {
                        if (x === -WORLD_SIZE || z === -WORLD_SIZE || x === WORLD_SIZE - 1 || z === WORLD_SIZE - 1) {
                            var wallCube = new THREE.Mesh(cube, wallMesh);
                            wallCube.position.x = x;
                            wallCube.position.z = z;
                            wallCube.position.y = y;
                            scene.add(wallCube);
                        }
                    }
                }
            }

            //ceiling
            var ceilingTexture = THREE.ImageUtils.loadTexture('./images/ceiling.png');
            var ceilingMesh = new THREE.MeshBasicMaterial({map: ceilingTexture});
            for (var x = -WORLD_SIZE; x < WORLD_SIZE; x++) {
                for (var z = -WORLD_SIZE; z < WORLD_SIZE; z++) {
                    var ceilingCube = new THREE.Mesh(cube, ceilingMesh);
                    ceilingCube.position.x = x;
                    ceilingCube.position.z = z;
                    ceilingCube.position.y = 4;
                    scene.add(ceilingCube);
                }
            }

            renderer = glRenderer = new THREE.WebGLRenderer();
            renderer.setClearColor(0xffffff);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            stereoEffect = new StereoEffect(renderer);
            stereoEffect.eyeSeparation = 1;
            stereoEffect.setSize( window.innerWidth, window.innerHeight );
            window.addEventListener('resize', onWindowResize, false);
        }

        function setOrientationControls(e) {
            console.log(e)
            if (!e.alpha) {
                return;
            }

            controls = new THREE.DeviceOrientationControls(camera, true);
            controls.connect();
            controls.update();


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
                raycaster.ray.origin.copy(controls.getObject().position);
                raycaster.ray.origin.y -= 10;
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
                if (isOnObject === true) {
                    velocity.y = Math.max(0, velocity.y);
                }
                controls.getObject().translateX(velocity.x * delta);
                controls.getObject().translateY(velocity.y * delta);
                controls.getObject().translateZ(velocity.z * delta);
                controls.getObject().position.y = 2;
                prevTime = time;
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
            </div>
        );
    }
});
