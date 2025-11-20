import './style.css'
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

let scene;
let camera;
let renderer;
let blochSphere;
let axes;
let blochVector;
let controls;

function init() {

  //Scene setup
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0.1);


  camera.position.set(2, 1.2, 2);
  camera.lookAt(0, 0, 0);

  controls = new OrbitControls(camera, renderer.domElement);

  //Bloch sphere
  const geometry = new THREE.SphereGeometry(1, 40, 40);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.18,
    wireframe: true
  });

  blochSphere = new THREE.Mesh(geometry, material);
  scene.add(blochSphere);


  //Axes
  axes = new THREE.AxesHelper(2);
  scene.add(axes);


  //Bloch vector
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

  //TODO make the inputs and start implementing logic and then updating the vector. 
  
}


//Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
  //Optional rotation:
  // blochSphere.rotation.y += 0.002;
  // axes.rotation.y += 0.002;
}

//Start everything
init();
animate();

// --- UI Elements ---
const thetaSlider = document.getElementById("theta-slider");
const phiSlider = document.getElementById("phi-slider");
const thetaValueDisplay = document.getElementById("theta-value");
const phiValueDisplay = document.getElementById("phi-value");

function updateDisplayedAngles() {
  thetaValueDisplay.textContent = thetaSlider.value + "°";
  phiValueDisplay.textContent = phiSlider.value + "°";
  updateBlochVector();
}

// Listen for slider changes
thetaSlider.addEventListener("input", () => {
  updateDisplayedAngles();
});

phiSlider.addEventListener("input", () => {
  updateDisplayedAngles();
});

function updateBlochVector() {
  const theta = Number(thetaSlider.value);
  const phi = Number(phiSlider.value);

  // Convert to radians
  const th = theta * Math.PI / 180;
  const ph = phi * Math.PI / 180;

  // Calculate coordinates
  const x = Math.sin(th) * Math.cos(ph);
  const y = Math.sin(th) * Math.sin(ph);
  const z = Math.cos(th);

  // Update the arrow direction
  const newDirection = new THREE.Vector3(x, y, z).normalize();
  blochVector.setDirection(newDirection);
}

function applyGateRotation(matrix) {
  // Current direction vector
  const theta = Number(thetaSlider.value);
  const phi = Number(phiSlider.value);

  const th = theta * Math.PI / 180;
  const ph = phi * Math.PI / 180;

  let x = Math.sin(th) * Math.cos(ph);
  let y = Math.sin(th) * Math.sin(ph);
  let z = Math.cos(th);

  // Apply rotation matrix
  const newX = matrix[0][0]*x + matrix[0][1]*y + matrix[0][2]*z;
  const newY = matrix[1][0]*x + matrix[1][1]*y + matrix[1][2]*z;
  const newZ = matrix[2][0]*x + matrix[2][1]*y + matrix[2][2]*z;

  // Convert new vector back to theta/phi
  const newTheta = Math.acos(newZ) * 180 / Math.PI;
  const newPhi = Math.atan2(newY, newX) * 180 / Math.PI;

  // Update sliders
  thetaSlider.value = newTheta;
  phiSlider.value = (newPhi + 360) % 360;

  // Refresh UI & arrow
  updateDisplayedAngles();
}

function applyXGate() {
  // Rotation by π around X axis
  const Rx = [
    [1, 0, 0],
    [0, -1, 0],
    [0, 0, -1]
  ];
  applyGateRotation(Rx);
}

function applyYGate() {
  // Rotation by π around Y axis
  const Ry = [
    [-1, 0, 0],
    [0, 1, 0],
    [0, 0, -1]
  ];
  applyGateRotation(Ry);
}

function applyZGate() {
  // Rotation by π around Z axis
  const Rz = [
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, 1]
  ];
  applyGateRotation(Rz);
}

function applyHGate() {
  const invSqrt2 = 1 / Math.sqrt(2);

  const RH = [
    [ invSqrt2, 0,         invSqrt2 ],
    [ 0,       -1,         0        ],
    [ invSqrt2, 0,        -invSqrt2 ]
  ];

  applyGateRotation(RH);
}

document.querySelectorAll(".control-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const text = btn.textContent;

    if (text.includes("X Gate")) applyXGate();
    else if (text.includes("Y Gate")) applyYGate();
    else if (text.includes("Z Gate")) applyZGate();
    else if (text.includes("Hadamard H Gate")) applyHGate();
  });
});