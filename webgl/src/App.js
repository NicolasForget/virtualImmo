import React, { Component } from 'react';
import $ from "jquery";
import PointerLockControls from "./libs/PointerLockControls";
import io from 'socket.io-client';

let socket = io(`http://mayl.me:8080`);
let StereoEffect = require('three-stereo-effect')(THREE);
let pi = Math.PI ;
let walls = [
    {
        type: "wall",
        x: 0,
        y: 0,
        length: 15,
        radius: 0
    },
    {
        type: "wall",
        x: 15,
        y: 0,
        length: 6,
        radius: 270
    },
    {
        type: "wall",
        x: 15,
        y: 6,
        length: 2,
        radius: 270
    },
    {
        type: "door",
        x: 15,
        y: 8,
        length: 2,
        radius: 270
    },
    {
        type: "wall",
        x: 15,
        y: 10,
        length: 5,
        radius: 270
    },
    {
        type: "wall",
        x: 7.5,
        y: 6,
        length: 15,
        radius: 0
    },
    {
        type: "wall",
        x: 30,
        y: 6,
        length: 9,
        radius: 270
    },
    {
        type: "wall",
        x: 11,
        y: 15,
        length: 11,
        radius: 180
    },
    {
        type: "door",
        x: 5.5,
        y: 15,
        length: 2,
        radius: 0
    },
    {
        type: "wall",
        x: 6.5,
        y: 15,
        length: 2,
        radius: 0
    },
    {
        type: "wall",
        x: 7.5,
        y: 15,
        length: 15,
        radius: 0
    },
    {
        type: "wall",
        x: 0,
        y: 0,
        length: 15,
        radius: 270
    },
    {
        type: "roof",
        x: 0,
        y: 0,
        xLength: 15,
        yLength: 15
    },
    {
        type: "roof",
        x: 15,
        y: 6,
        xLength: 15,
        yLength: 9
    }
];


export default React.createClass({
    getInitialState(){
        return {}
    },

    componentDidMount(){
        socket = io.connect('http://mayl.me:8080');
        var les_meubles = [];
        var meubles_colors = [0xff0000, 0xf283b6, 0xb5bfa1, 0xedbfb7];
        THREE.ImageUtils.crossOrigin = '';
        socket.on("connect", () => {
            console.log("connected");

            socket.on('wallVR', function (data) {
                walls = data;
                initWalls();
            });

            socket.on('addFurniture', function (data) {
                for (var i = 0; i < les_meubles.length; i++) {
                    if (les_meubles[i].furnitureIndex == data.index) {
                        if (les_meubles[i].furnitureType == data.type) {
                            scene.remove(les_meubles[i]);
                        }
                    }
                }

                var mtlLoader = new THREE.MTLLoader();
                mtlLoader.setPath("../furnitures/");
                console.log(data.textures_availables[data.selected_texture].texture);
                mtlLoader.load(data.textures_availables[data.selected_texture].texture, function (materials) {

                    materials.preload();

                    var objLoader = new THREE.OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.setPath("http://mayl.me:3000/");
                    console.log(data.model3D);
                    objLoader.load(data.model3D, function (object) {
                        /*object.traverse( function ( child ) {
                            if ( child instanceof THREE.Mesh ) {
                                child.material.color.setHex(0xFFF3E0);
                            }
                        });*/
                        console.log(object)
                        object.position.x = data.position.x ;
                        object.position.y = 0.5;
                        object.position.z = data.position.z ;
                        scene.add(object);
                        


                        object.textures_availables = data.textures_availables;
                        object.selected_texture = data.selected_texture;
                        object.furnitureType = data.type;
                        object.furnitureId = data.id;
                        object.furnitureIndex = data.index;

                        if(object.furnitureId == 0 && object.furnitureType =="table"){
                        	//object.
                        }

                        console.log("after made",object);
                        console.log("les_meubles",les_meubles);
                        les_meubles.push(object);
                    });
                });

            });

            socket.on("changedFurnitureTexture", function (data) {
                var id = data.id;

                for (var i = 0; i < les_meubles.length; i++) {
                    if (les_meubles[i].furnitureIndex == data.index &&
                        les_meubles[i].furnitureType == data.type) {
                        var image = new Image();
                        var texture = new THREE.Texture();
                        image.src = "data:image/jpeg;base64," + les_meubles[i].textures_availables[data.texture_id].texture;
                        texture.image = image;
                        image.onload = function () {
                            texture.needsUpdate = true;
                        };
                        les_meubles[i].selected_texture = data.texture_id;

                        les_meubles[i].material = new THREE.MeshBasicMaterial({map: texture});
                    }
                }
            });

            socket.on('removeFurniture', function (data) {
                console.log("removing", data.index);
                var index = data.index;
                console.log(les_meubles);

                for (var i = 0; i < les_meubles.length; i++) {
                    if (les_meubles[i].furnitureIndex == data.index) {
                        if (les_meubles[i].furnitureType == data.type) {
                            scene.remove(les_meubles[i]);
                        }
                    }
                }
            });

            socket.on('movedFurniture', function (data) {
                console.log("moving", data);
                console.log(les_meubles);
                for (var i = 0; i < les_meubles.length; i++) {
                    if (les_meubles[i].furnitureIndex == data.index && les_meubles[i].furnitureType == data.type) {
                        console.log(les_meubles[i]);
                        les_meubles[i].position.x = data.position.x;
                        les_meubles[i].position.y = data.position.y;
                        les_meubles[i].position.z = data.position.z;
                        // (angle en radian) = (angles en degrés)*(2.0*pi)/360.0 
                        les_meubles[i].rotation.y = data.position.angle * (2.0 * pi) / 360.0;
                    }
                }
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


        function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
            degreeX = (degreeX * Math.PI) / 180;
            degreeY = (degreeY * Math.PI) / 180;
            degreeZ = (degreeZ * Math.PI) / 180;
            object.rotateX(degreeX);
            object.rotateY(degreeY);
            object.rotateZ(degreeZ);
        }

        function initWalls() {
            var colors = [0xff0000, 0x00ff00, 0x0000ff, 0x000000];
            var a = new THREE.MeshBasicMaterial({color: 0x00ff00});
            var b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5), a);

            for (var i = 0; i < walls.length; i++) {
                if (walls[i].type === "roof") {
                   /* console.log(walls[i].x, walls[i].y);
                    var roofBox = new THREE.BoxGeometry(walls[i].xLength, 0.1, walls[i].yLength);
                    var textureRoof = THREE.ImageUtils.loadTexture('../images/wall.jpg');
                    textureRoof.wrapS = textureRoof.wrapT = THREE.RepeatWrapping;
                    textureRoof.repeat.set(5, 5);
                    var materialRoof = new THREE.MeshBasicMaterial({map: textureRoof});
                    var roof = new THREE.Mesh(roofBox, materialRoof);
                    roof.position.x = walls[i].x + walls[i].xLength / 2;
                    roof.position.z = walls[i].y + walls[i].yLength / 2;
                    roof.position.y = 6;
                    scene.add(roof);*/
                } else {
                    var wallBox;
                    var pivotMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
                    var pivot = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0), pivotMaterial);
                    //var pivot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2));
                    var wallHeight;
                    pivot.position.x = walls[i].x;
                    pivot.position.z = walls[i].y;
                    if (walls[i].type == "door") {
                        wallHeight = 2;
                        wallBox = new THREE.BoxGeometry(walls[i].length, 2, 0.01);
                        pivot.position.y = 5;
                    } else {
                        wallHeight = 6;
                        wallBox = new THREE.BoxGeometry(walls[i].length, 6, 0.01);
                        pivot.position.y = 3;
                    }

                    var textureWall = THREE.ImageUtils.loadTexture('../images/wall.jpg');
                    textureWall.wrapS = textureWall.wrapT = THREE.RepeatWrapping;
                    textureWall.repeat.set(walls[i].length / 2, wallHeight / 2);
                    var material = new THREE.MeshBasicMaterial({map: textureWall});
                    var wall = new THREE.Mesh(wallBox, material);

                    pivot.add(wall);

                    switch (walls[i].radius) {
                        case 0:
                            wall.position.x = pivot.position.x + walls[i].length / 2;
                            break;
                        case 90:
                            wall.position.x = -walls[i].length / 2;
                            break;
                        case 180:
                            wall.position.x = walls[i].x - walls[i].length / 2;
                            break;
                        case 270:
                            wall.position.x = walls[i].length / 2;
                            break;
                    }
                    pivot.rotation.y = walls[i].radius * 0.00872665 * 2;

                    scene.add(pivot);

                }
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

        function init() {
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, 1000);
            scene = new THREE.Scene();
            //scene.fog = new THREE.Fog(0xffffff, 0, 750);
            //var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
            var light = new THREE.SpotLight( 0xffffff );
            light.position.set( 5, 5, 10 );

            light.castShadow = true;

            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;

            light.shadow.camera.near = 8000;
            light.shadow.camera.far = 20;
            light.shadow.camera.fov = 30;


            scene.add(light);
            controls = new PointerLockControls(THREE, camera);
            controls.getObject().position.y = 3;

            scene.add(controls.getObject());
            var onKeyDown = function (event) {
                switch (event.keyCode) {
                    case 38: // up
                    case 68:
                        moveForward = true;
                        break;
                    case 37: // left
                    case 90:
                        moveLeft = true;
                        break;
                    case 40: // down
                    case 81:
                        moveBackward = true;
                        break;
                    case 39: // right
                    case 83:
                        moveRight = true;
                        break;
                }
            };
            var onKeyUp = function (event) {
                switch (event.keyCode) {
                    case 38: // up
                    case 68:
                        moveForward = false;
                        break;
                    case 37: // left
                    case 90:
                        moveLeft = false;
                        break;
                    case 40: // down
                    case 81:
                        moveBackward = false;
                        break;
                    case 39: // right
                    case 83:
                        moveRight = false;
                        break;
                }
            };
            document.addEventListener('keydown', onKeyDown, false);
            document.addEventListener('keyup', onKeyUp, false);
            raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
            var WORLD_SIZE = 30;

            //ground
            var cube = new THREE.BoxGeometry(5, 1, 5);
            var grassTexture = THREE.ImageUtils.loadTexture('../images/wood.png');

            var grassMesh = new THREE.MeshBasicMaterial({map: grassTexture});
            for (var x = -WORLD_SIZE; x < WORLD_SIZE * 2; x += 5) {
                for (var z = -WORLD_SIZE; z < WORLD_SIZE * 2; z += 5) {
                    var grassCube = new THREE.Mesh(cube, grassMesh);
                    grassCube.position.x = x;
                    grassCube.position.z = z;
                    grassCube.position.y = 0;

                    grassCube.castShadow = true;
                    grassCube.receiveShadow = false;

                    scene.add(grassCube);
                }
            }
            var zeroTexture = THREE.ImageUtils.loadTexture('../images/wood.png');
            var zeroMesh = new THREE.MeshBasicMaterial({map: zeroTexture});

            var zero = new THREE.Mesh(cube, zeroMesh);
            zero.position.x = 0;
            zero.position.y = 0;
            zero.position.z = 0;
            scene.add(zero);


            //walls
            initWalls();
      

            renderer = glRenderer = new THREE.WebGLRenderer();
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = 1;
            renderer.shadowMap.soft = true;

            console.log(renderer.shadowMap);
            //renderer.setClearColor(0xffffff);
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

        var gachetteR = false;
        var gachetteD = false;
        var buttonRemove = false;

        controls.getObject().position.x = 5;
        controls.getObject().position.z = 5;
        function animate() {
            requestAnimationFrame(animate);

            if (controlsEnabled) {
                if (controls2_is_init) {
                    controls2.update();
                    var rot = controls2.object.getWorldDirection();

                    if (canGame()) {
                        var gp = navigator.getGamepads()[0];

                        try {


                            var axes = gp.axes;
                            controls2.object.position.x += rot.x * (-axes[1]) * 0.2;
                            controls2.object.position.z += rot.z * (-axes[1]) * 0.2;

                            controls2.object.position.x += rot.z * (-axes[0]) * 0.2;
                            controls2.object.position.z += -rot.x * (-axes[0]) * 0.2;


                        } catch (err) {
                        }

                    }
                } else {
                    raycaster.ray.origin.copy(controls.getObject().position);

                    raycaster.ray.origin.y -= 10;
                    var intersections = raycaster.intersectObjects(objects);
                    var isOnObject = intersections.length > 0;
                    var time = performance.now();
                    var delta = ( time - prevTime ) / 1000;
                    velocity.x -= velocity.x * 10.0 * delta;
                    velocity.z -= velocity.z * 10.0 * delta;
                    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
                    if (moveForward) velocity.x += 40.0 * delta;
                    if (moveBackward) velocity.x -= 40.0 * delta;
                    if (moveLeft) velocity.z -= 40.0 * delta;
                    if (moveRight) velocity.z += 40.0 * delta;


                    if (isOnObject === true) {
                        velocity.y = Math.max(0, velocity.y);
                    }
                    controls.getObject().translateX(velocity.x * delta);
                    controls.getObject().translateY(velocity.y * delta);
                    controls.getObject().translateZ(velocity.z * delta);

                    controls.getObject().position.y = 3;

                    prevTime = time;
                }

                //Control if element is in selector:
                //

                var pointer = new THREE.Vector2();
                pointer.x = 0;
                pointer.y = 0;
                var selector = new THREE.Raycaster();
                selector.setFromCamera(pointer, camera);

                var intersects = selector.intersectObjects(les_meubles, true);
                if (intersects.length > 0) {
                    $(".selector").addClass('active');
                    console.log(intersects[0]);
                    /*
                    console.log(intersects[0].object.selected_texture);
                    var texture_keys = Object.keys(intersects[0].object.textures_availables);*/
                    if (navigator.getGamepads()[0]) {
                        var gp = navigator.getGamepads()[0];
                        var buttons = gp.buttons
                        //$("#infos").html(gp.buttons[4].pressed+" "+ gachetteR);
                        if (gp.buttons[4].pressed) {
                            //$("#infos").html(gp.buttons[4].pressed+" "+ gachetteR);

                            gachetteR = true;
                        }
                        else if(gachetteR == true && (!gp.buttons[4].pressed) ){
                            gachetteR = false;
                            for (var i = 0; i < texture_keys.length; i++){
                              /*if (texture_keys[i] == intersects[0].object.selected_texture){

                                    i++;
                                    i = (i >=texture_keys.length )?0:i;

                                    var image = new Image();
                                    var texture = new THREE.Texture();
                                    image.src = "data:image/jpeg;base64," + intersects[0].object.textures_availables[texture_keys[i]].texture;
                                    texture.image = image;
                                    image.onload = function () {
                                        texture.needsUpdate = true;
                                    };
                                    intersects[0].object.selected_texture = texture_keys[i];
                                    intersects[0].object.material = new THREE.MeshBasicMaterial({map: texture});

                                    var data = {
                                        id : intersects[0].object.furnitureId,
                                        index : intersects[0].object.furnitureIndex,

                                        type: intersects[0].object.furnitureType,
                                        texture_id: texture_keys[i]
                                    }
                                    socket.emit("changeFurnitureTexture",data);
                                }*/
                            }
                        }else{
                            gachetteR = false;
                        }


                        if (gp.buttons[3].pressed) {
                            //$("#infos").html(gp.buttons[4].pressed+" "+ gachetteR);

                            gachetteD = true;
                        }
                        else if(gachetteD == true && (!gp.buttons[3].pressed) ){
                            gachetteD = false;
                            /*for (var i = texture_keys.length; i >=0 ; i--){
                               if (texture_keys[i] == intersects[0].object.selected_texture){

                                    i--;
                                    i = (i < 0 )?(texture_keys.length-1):i;

                                    var image = new Image();
                                    var texture = new THREE.Texture();
                                    image.src = "data:image/jpeg;base64," + intersects[0].object.textures_availables[texture_keys[i]].texture;
                                    texture.image = image;
                                    image.onload = function () {
                                        texture.needsUpdate = true;
                                    };
                                    intersects[0].object.selected_texture = texture_keys[i];
                                    intersects[0].object.material = new THREE.MeshBasicMaterial({map: texture});

                                    var data = {
                                        id : intersects[0].object.furnitureId,
                                        index : intersects[0].object.furnitureIndex,

                                        type: intersects[0].object.furnitureType,
                                        texture_id: texture_keys[i]
                                    }
                                    socket.emit("changeFurnitureTexture",data);
                                }
                            }*/
                        }else{
                            gachetteD = false;
                        }

                        

                        if (gp.buttons[2].pressed) {
                            //$("#infos").html(gp.buttons[4].pressed+" "+ gachetteR);

                            buttonRemove = true;
                        }
                        else if(buttonRemove == true && (!gp.buttons[2].pressed) ){
                            buttonRemove = false;

                            var index = intersects[0].object.parent.furnitureIndex;
                            var type = intersects[0].object.parent.furnitureType;

                                  
                            socket.emit("removeFurniture",{index : index,
                                type: intersects[0].object.parent.furnitureType});
                            for (var i = 0; i < les_meubles.length; i++){
                                if (les_meubles[i].furnitureIndex == index && les_meubles[i].furnitureType == type ){

                                    scene.remove(les_meubles[i]);
                                }
                            }
                                            
                        }else{
                            buttonRemove = false;
                        }
                    }
                    
                } else {
                    $(".selector").removeClass('active');
                }
            } else {
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
                <div className="selector left">
                </div>
                <div className="selector right">
                </div>
                <div className="animatelog">
                </div>
                <div className="key">
                </div>
            </div>
        );
    }
});
