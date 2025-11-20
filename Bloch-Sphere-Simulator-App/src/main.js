import './style.css'
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js";

let scene;
let camera;
let renderer;
let blochSphere;
let axes;
let blochVector;

function init() {

  // --- Scene setup ---
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.position.set(2, 1.2, 2);
  camera.lookAt(0, 0, 0);


  // --- Bloch sphere ---
  const geometry = new THREE.SphereGeometry(1, 40, 40);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.18,
    wireframe: true
  });

  blochSphere = new THREE.Mesh(geometry, material);
  scene.add(blochSphere);


  // --- Axes ---
  axes = new THREE.AxesHelper(2);
  scene.add(axes);


  // --- Bloch vector (arrow) ---
  const direction = new THREE.Vector3(0, 0, 1);
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 1;
  const color = 0xff0000;

  blochVector = new THREE.ArrowHelper(
    direction.normalize(),
    origin,
    length,
    color
  );

  scene.add(blochVector);
}



// --- Animation loop ---
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // Optional rotation:
  // blochSphere.rotation.y += 0.002;
  // axes.rotation.y += 0.002;
}



// --- Start everything ---
init();
animate();
