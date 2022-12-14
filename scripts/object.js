// Import required source code
// Import three.js core
import * as THREE from "../build/three.module.js";

// Import pointer lock controls
import {
    PointerLockControls
} from "../src/PointerLockControls.js";

import {
    GLTFLoader
} from "../src/GLTFLoader.js";
import {
    FontLoader
} from "../src/FontLoader.js"

// Establish variables
let camera, scene, renderer, controls, material, particle, mixer1, mixer2, mixer3, mixer4, mixer5;

const objects = [];
let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

// Initialization and animation function calls
init();
animate();

// Initialize the scene
function init() {
    // Establish the camera
    camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        2,
        500
    );
    camera.position.y = 10;

    // Define basic scene parameters
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe6e6e6);
    scene.fog = new THREE.Fog(0xc7c7c7, 0, 200);
    // scene.fog = new THREE.Fog(0xb8d4c8, 0, 200);

    // Define scene lighting
    const light1 = new THREE.HemisphereLight(0xffffff, 0x15450f, 1);
    scene.add(light1);


    const light = new THREE.DirectionalLight(0xf7e9bc, 3);
    light.position.x = 50;
    light.position.y = 100;
    light.position.z = -20;
    scene.add(light);




    // Define controls
    controls = new PointerLockControls(camera, document.body);

    // Identify the html divs for the overlays
    const blocker = document.getElementById("blocker");
    const instructions = document.getElementById("instructions");

    // Listen for clicks and respond by removing overlays and starting mouse look controls
    // Listen
    instructions.addEventListener("click", function () {
        controls.lock();
    });
    // Remove overlays and begin controls on click
    controls.addEventListener("lock", function () {
        instructions.style.display = "none";
        blocker.style.display = "none";
    });
    // Restore overlays and stop controls on esc
    controls.addEventListener("unlock", function () {
        blocker.style.display = "block";
        instructions.style.display = "";
    });
    // Add controls to scene
    scene.add(controls.getObject());

    // Define key controls for WASD controls
    const onKeyDown = function (event) {
        switch (event.code) {
            case "ArrowUp":
            case "KeyW":
                moveForward = true;
                break;

            case "ArrowLeft":
            case "KeyA":
                moveLeft = true;
                break;

            case "ArrowDown":
            case "KeyS":
                moveBackward = true;
                break;

            case "ArrowRight":
            case "KeyD":
                moveRight = true;
                break;

                // case "Space":
                //     if (canJump === true) velocity.y += 200;
                //     canJump = false;
                //     break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case "ArrowUp":
            case "KeyW":
                moveForward = false;
                break;

            case "ArrowLeft":
            case "KeyA":
                moveLeft = false;
                break;

            case "ArrowDown":
            case "KeyS":
                moveBackward = false;
                break;

            case "ArrowRight":
            case "KeyD":
                moveRight = false;
                break;
        }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    // Add raycasting for mouse controls
    raycaster = new THREE.Raycaster(
        new THREE.Vector3(),
        new THREE.Vector3(0, -1, 0),
        0,
        10
    );

    // Generate the ground
    let floorGeometry = new THREE.PlaneGeometry(40, 2000, 10, 1);
    floorGeometry.rotateX(-Math.PI / 2);

    // Vertex displacement pattern for ground
    let position = floorGeometry.attributes.position;

    for (let i = 0, l = position.count; i < l; i++) {
        vertex.fromBufferAttribute(position, i);

        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;

        position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

    position = floorGeometry.attributes.position;
    const colorsFloor = [];

    for (let i = 0, l = position.count; i < l; i++) {
        color.setHSL(Math.random() * 0.5 + 0.75, Math.random() * 0.5 + 0.75, Math.random() * 0.5 + 0.75);
        // color.setHSL(0x4f2f2f, 0xffffff, 0x2f5f7f);
        colorsFloor.push(color.b, color.b, color.b);
    }

    floorGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colorsFloor, 3)
    );

    const floorMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    // Insert completed floor into the scene
    scene.add(floor);


    // ---------------------------Dome-Net_texture---------------------------
    // Add a polygon to the scene
    const geometry0 = new THREE.IcosahedronGeometry(400, 50);
    const matLineBasic = new THREE.LineBasicMaterial({
        color: 0xaa42f5,
        linewidth: 10
    });
    const wireframe = new THREE.WireframeGeometry(geometry0);
    const line = new THREE.LineSegments(wireframe, matLineBasic);
    line.position.set(0, 0, -50);
    scene.add(line);


    // ---------------------------Bonsai---------------------------
    // Image 1
    // Load image as texture
    const texture = new THREE.TextureLoader().load('assets/Still-Export/bonsai.png');
    // Immediately use the texture for material creation
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(10, 10);
    // Apply image texture to plane geometry
    const plane = new THREE.Mesh(geometry, material);
    // Position plane geometry
    plane.position.set(0, 7, -25);
    // Place plane geometry
    scene.add(plane);


    // ---------------------------Door---------------------------
    // Image 2
    // Load image as texture
    const texture2 = new THREE.TextureLoader().load('assets/Still-Export/screen-door-1.png');
    // immediately use the texture for material creation
    const material2 = new THREE.MeshBasicMaterial({
        map: texture2,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry2 = new THREE.PlaneGeometry(18, 18);
    // Apply image texture to plane geometry
    const plane2 = new THREE.Mesh(geometry2, material2);
    // Position plane geometry
    plane2.position.set(0, 12, -50);
    // Place plane geometry
    scene.add(plane2);


    // Image 3
    // Load image as texture
    const texture3 = new THREE.TextureLoader().load('assets/Still-Export/screen-door-2.png');
    // immediately use the texture for material creation
    const material3 = new THREE.MeshBasicMaterial({
        map: texture3,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry3 = new THREE.PlaneGeometry(15, 15);
    // Apply image texture to plane geometry
    // const plane3 = new THREE.Mesh(geometry3, material3);
    // Position plane geometry
    // plane3.position.set(1, 12, -51);
    // Place plane geometry
    // scene.add(plane3);

    mixer3 = new THREE.Object3D();
    var mesh3 = new THREE.Mesh(geometry3, material3);
    mixer3.add(mesh3);
    mixer3.position.set(1, 12, -51);
    scene.add(mixer3);


    // Image 4
    // Load image as texture
    const texture4 = new THREE.TextureLoader().load('assets/Still-Export/screen-door-3.png');
    // immediately use the texture for material creation
    const material4 = new THREE.MeshBasicMaterial({
        map: texture4,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry4 = new THREE.PlaneGeometry(15, 15);
    // Apply image texture to plane geometry
    // const plane4 = new THREE.Mesh(geometry4, material4);
    // Position plane geometry
    // plane4.position.set(-2, 12, -52);
    // Place plane geometry
    // scene.add(plane4);

    mixer4 = new THREE.Object3D();
    var mesh4 = new THREE.Mesh(geometry4, material4);
    mixer4.add(mesh4);
    mixer4.position.set(-2, 12, -52);
    scene.add(mixer4);


    // Image 5
    // Load image as texture
    const texture5 = new THREE.TextureLoader().load('assets/Still-Export/screen-door-4.png');
    // immediately use the texture for material creation
    const material5 = new THREE.MeshBasicMaterial({
        map: texture5,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry5 = new THREE.PlaneGeometry(15, 15);
    // Apply image texture to plane geometry
    const plane5 = new THREE.Mesh(geometry5, material5);
    // Position plane geometry
    plane5.position.set(2, 12, -53);
    // Place plane geometry
    scene.add(plane5);


    // ---------------------------Cloud---------------------------
    // Image 6
    // Load image as texture
    const texture6 = new THREE.TextureLoader().load('assets/Still-Export/cloud-1.png');
    // immediately use the texture for material creation
    const material6 = new THREE.MeshBasicMaterial({
        map: texture6,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry6 = new THREE.PlaneGeometry(25, 25);
    // Apply image texture to plane geometry
    const plane6 = new THREE.Mesh(geometry6, material6);
    // Position plane geometry
    plane6.position.set(0, 12, -70);
    // Place plane geometry
    scene.add(plane6);


    // Image 7
    // Load image as texture
    const texture7 = new THREE.TextureLoader().load('assets/Still-Export/cloud-2.png');
    // immediately use the texture for material creation
    const material7 = new THREE.MeshBasicMaterial({
        map: texture7,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry7 = new THREE.PlaneGeometry(30, 30);
    // Apply image texture to plane geometry
    const plane7 = new THREE.Mesh(geometry7, material7);
    // Position plane geometry
    plane7.position.set(0, 15, -80);
    // Place plane geometry
    scene.add(plane7);


    // Image 8
    // Load image as texture
    const texture8 = new THREE.TextureLoader().load('assets/Still-Export/cloud-3.png');
    // immediately use the texture for material creation
    const material8 = new THREE.MeshBasicMaterial({
        map: texture8,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry8 = new THREE.PlaneGeometry(35, 35);
    // Apply image texture to plane geometry
    const plane8 = new THREE.Mesh(geometry8, material8);
    // Position plane geometry
    plane8.position.set(0, 18, -90);
    // Place plane geometry
    scene.add(plane8);


    // Image 9
    // Load image as texture
    const texture9 = new THREE.TextureLoader().load('assets/Still-Export/cloud-4.png');
    // immediately use the texture for material creation
    const material9 = new THREE.MeshBasicMaterial({
        map: texture9,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry9 = new THREE.PlaneGeometry(40, 40);
    // Apply image texture to plane geometry
    const plane9 = new THREE.Mesh(geometry9, material9);
    // Position plane geometry
    plane9.position.set(0, 20, -100);
    // Place plane geometry
    scene.add(plane9);


    // ---------------------------Fish_pond---------------------------
    // Image 10
    // Load image as texture
    const texture10 = new THREE.TextureLoader().load('assets/Still-Export/koi-fish-0.png');
    // immediately use the texture for material creation
    const material10 = new THREE.MeshBasicMaterial({
        map: texture10,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry10 = new THREE.PlaneGeometry(20, 20);
    // Apply image texture to plane geometry
    // const plane10 = new THREE.Mesh(geometry10, material10);
    // Position plane geometry
    // plane10.position.set(0, 12, -130);
    // Place plane geometry
    // scene.add(plane10);

    mixer5 = new THREE.Object3D();
    var mesh5 = new THREE.Mesh(geometry10, material10);
    mixer5.add(mesh5);
    mixer5.position.set(0, 12, -130);
    scene.add(mixer5);


    // Image 11
    // Load image as texture
    const texture11 = new THREE.TextureLoader().load('assets/Still-Export/koi-fish-1.png');
    // immediately use the texture for material creation
    const material11 = new THREE.MeshBasicMaterial({
        map: texture11,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry11 = new THREE.PlaneGeometry(20, 20);
    // Apply image texture to plane geometry
    const plane11 = new THREE.Mesh(geometry11, material11);
    // Position plane geometry
    plane11.position.set(0, 12, -131);
    // Place plane geometry
    scene.add(plane11);


    // Image 12
    // Load image as texture
    const texture12 = new THREE.TextureLoader().load('assets/Still-Export/koi-fish-2.png');
    // immediately use the texture for material creation
    const material12 = new THREE.MeshBasicMaterial({
        map: texture12,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry12 = new THREE.PlaneGeometry(20, 20);
    // Apply image texture to plane geometry
    const plane12 = new THREE.Mesh(geometry12, material12);
    // Position plane geometry
    plane12.position.set(0, 12, -132);
    // Place plane geometry
    scene.add(plane12);


    // Image 13
    // Load image as texture
    const texture13 = new THREE.TextureLoader().load('assets/Still-Export/koi-fish-3.png');
    // immediately use the texture for material creation
    const material13 = new THREE.MeshBasicMaterial({
        map: texture13,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry13 = new THREE.PlaneGeometry(21, 21);
    // Apply image texture to plane geometry
    const plane13 = new THREE.Mesh(geometry13, material13);
    // Position plane geometry
    plane13.position.set(0, 12, -133);
    // Place plane geometry
    scene.add(plane13);


    // Image 14
    // Load image as texture
    const texture14 = new THREE.TextureLoader().load('assets/Still-Export/koi-fish-4.1.png');
    // immediately use the texture for material creation
    const material14 = new THREE.MeshBasicMaterial({
        map: texture14,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry14 = new THREE.PlaneGeometry(20, 20);

    mixer1 = new THREE.Object3D();
    var mesh2 = new THREE.Mesh(geometry14, material14);
    mixer1.add(mesh2);
    mixer1.position.set(0, 12, -134);
    scene.add(mixer1);



    // Image 15
    // Load image as texture
    const texture15 = new THREE.TextureLoader().load('assets/Still-Export/koi-fish-4.2.png');
    // immediately use the texture for material creation
    const material15 = new THREE.MeshBasicMaterial({
        map: texture15,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry15 = new THREE.PlaneGeometry(20, 20);

    mixer2 = new THREE.Object3D();
    var mesh2 = new THREE.Mesh(geometry15, material15);
    mixer2.add(mesh2);
    mixer2.position.set(0, 12, -135);
    scene.add(mixer2);


    // Image 16
    // Load image as texture
    const texture16 = new THREE.TextureLoader().load('assets/Still-Export/koi-fish-5.png');
    // immediately use the texture for material creation
    const material16 = new THREE.MeshBasicMaterial({
        map: texture16,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry16 = new THREE.PlaneGeometry(25, 25);
    // Apply image texture to plane geometry
    const plane16 = new THREE.Mesh(geometry16, material16);
    // Position plane geometry
    plane16.position.set(-1.5, 11, -136);
    // Place plane geometry
    scene.add(plane16);



    // Image 17
    // Load image as texture
    const texture17 = new THREE.TextureLoader().load('assets/Still-Export/bonsai-1.png');
    // immediately use the texture for material creation
    const material17 = new THREE.MeshBasicMaterial({
        map: texture17,
        side: THREE.DoubleSide,
        transparent: true
    });
    // Create plane geometry
    const geometry17 = new THREE.PlaneGeometry(7, 7);

    particle = new THREE.Object3D();
    scene.add(particle);
    for (var i = 0; i < 1000; i++) {
        var mesh1 = new THREE.Mesh(geometry17, material17);
        mesh1.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        mesh1.position.multiplyScalar(90 + (Math.random() * 700));
        mesh1.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
        particle.add(mesh1);
    }


    // Adding Video
    const video = document.getElementById('video');
    const videoTexture = new THREE.VideoTexture(video);

    var movieMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.FrontSide,
        toneMapped: false,
    });

    let movieGeometry = new THREE.BoxGeometry(60, 60, 1);

    let movieCubeScreen = new THREE.Mesh(movieGeometry, movieMaterial);

    movieCubeScreen.position.set(0, 60, -50);
    movieCubeScreen.rotation.set(-75, 0, 0);
    scene.add(movieCubeScreen);

    document.onkeydown = function (e) {
        if (e.keyCode === 32) {
            video.pause();
        } else if (e.keyCode === 80) {
            video.play();
        }
    };



    // Define Rendered and html document placement
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Listen for window resizing
    window.addEventListener("resize", onWindowResize);
}

// Window resizing function
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation function
function animate() {
    requestAnimationFrame(animate);

    //fish
    mixer1.rotation.z -= 0.003;
    mixer2.rotation.z += 0.00125;
    mixer5.rotation.z += 0.00025;


    //door
    if (mixer3.position.x <= 3) {
        mixer3.position.x += 0.0025;
    } else {
        mixer3.position.x = 1
    }

    if (mixer4.position.x >= -3) {
        mixer4.position.x -= 0.003;
    } else {
        mixer4.position.x = -2
    }


    //particle
    particle.rotation.x += 0.0005;
    particle.rotation.y += 0.0005;
    particle.rotation.z -= 0.001;

    // controls.update();
    // videoTexture.needsUpdate = true;

    const time = performance.now();

    // Check for controls being activated (locked) and animate scene according to controls
    if (controls.isLocked === true) {
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects(objects, false);

        const onObject = intersections.length > 0;

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 250.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 250.0 * delta;

        if (onObject === true) {
            velocity.y = Math.max(0, velocity.y);
            canJump = true;
        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        controls.getObject().position.y += velocity.y * delta; // new behavior

        if (controls.getObject().position.y < 10) {
            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;
        }
    }

    prevTime = time;

    renderer.render(scene, camera);
}
animate();