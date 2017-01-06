import React, { Component } from 'react';
import THREE from "three.js";
import PointerLockControls from "./libs/PointerLockControls";
let StereoEffect = require('three-stereo-effect')(THREE);

export default React.createClass({
    getInitialState(){
        return {}
    },

    componentDidMount(){
        var camera, scene, renderer, glRenderer, stereoEffect;
        var geometry, material, mesh;
        var controls;
        var objects = [];
        var raycaster;
        var activate = document.getElementById('activate');
        // http://www.html5rocks.com/en/tutorials/pointerlock/intro/
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
            var wallTexture = THREE.ImageUtils.loadTexture('./images/ceiling.png');
            var wallMesh = new THREE.MeshBasicMaterial({map: wallTexture});
            for (var x = -WORLD_SIZE; x < WORLD_SIZE; x++) {
                for (var z = -WORLD_SIZE; z < WORLD_SIZE; z++) {
                    var wallCube = new THREE.Mesh(cube, wallMesh);
                    wallCube.position.x = x;
                    wallCube.position.z = z;
                    wallCube.position.y = 4;
                    scene.add(wallCube);
                }
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

        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }

            controls = new THREE.DeviceOrientationControls(camera, true);
            controls.connect();
            controls.update();

            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }


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
