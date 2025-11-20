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
let circuitQueue = [];

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
const circuitDisplay = document.getElementById("circuit-display");

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

circuitDisplay.addEventListener("input", () => {
  circuitDisplay.dataset.editing = "true"; // jelzi, hogy manuális szerkesztés folyik
});

// Functions
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

function applySGate() {
  const angle = Math.PI / 2; // 90°
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const Rz = [
    [ cos, -sin, 0 ],
    [ sin,  cos, 0 ],
    [  0,    0, 1 ]
  ];

  applyGateRotation(Rz);
}

function applyTGate() {
  const angle = Math.PI / 4; // 45°
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const Rz = [
    [ cos, -sin, 0 ],
    [ sin,  cos, 0 ],
    [  0,    0, 1 ]
  ];

  applyGateRotation(Rz);
}

function applyRxGate(angleDeg) {
  const angle = angleDeg * Math.PI / 180; // fok → radián
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const Rx = [
    [1,   0,    0],
    [0, cos, -sin],
    [0, sin,  cos]
  ];

  applyGateRotation(Rx);
}

function applyRyGate(angleDeg) {
  const angle = angleDeg * Math.PI / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const Ry = [
    [ cos, 0, sin],
    [   0, 1,   0],
    [-sin, 0, cos]
  ];

  applyGateRotation(Ry);
}

function applyRzGate(angleDeg) {
  const angle = angleDeg * Math.PI / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const Rz = [
    [ cos, -sin, 0],
    [ sin,  cos, 0],
    [   0,    0, 1]
  ];

  applyGateRotation(Rz);
}

function updateCircuitDisplay() {
  const display = document.getElementById("circuit-display");
  if (circuitQueue.length === 0) {
    display.textContent = "(empty)";
  } else {
    // Ha a felhasználó manuálisan nem szerkeszt, írjuk ki
    if (!display.isContentEditable || display.dataset.editing !== "true") {
      display.textContent = circuitQueue
        .map(g => g.gate + (g.angle ? `(${g.angle}°)` : ""))
        .join(" → ");
    }
  }
}

document.querySelectorAll(".control-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const text = btn.textContent;

    let gateName = null;
    let angle = 0;

    if (text.includes("X Gate")) gateName = "X";
    else if (text.includes("Y Gate")) gateName = "Y";
    else if (text.includes("Z Gate")) gateName = "Z";
    else if (text.includes("Hadamard H Gate")) gateName = "H";
    else if (text.includes("S Gate")) gateName = "S";
    else if (text.includes("T Gate")) gateName = "T";
    else if (text.includes("Apply Rx")) {
      gateName = "Rx";
      angle = Number(document.getElementById("rx-angle").value);
    }
    else if (text.includes("Apply Ry")) {
      gateName = "Ry";
      angle = Number(document.getElementById("ry-angle").value);
    }
    else if (text.includes("Apply Rz")) {
      gateName = "Rz";
      angle = Number(document.getElementById("rz-angle").value);
    }

    if (gateName) {
  // hozzáadjuk a circuitQueue-hoz
  circuitQueue.push({ gate: gateName, angle: angle });
  updateCircuitDisplay();

  // Azonnal futtatjuk a kaput a gömb frissítéséhez
  switch(gateName) {
    case "X": applyXGate(); break;
    case "Y": applyYGate(); break;
    case "Z": applyZGate(); break;
    case "H": applyHGate(); break;
    case "S": applySGate(); break;
    case "T": applyTGate(); break;
    case "Rx": applyRxGate(angle); break;
    case "Ry": applyRyGate(angle); break;
    case "Rz": applyRzGate(angle); break;
  }
}
  });
});

document.getElementById("run-circuit").addEventListener("click", () => {
  const displayText = circuitDisplay.textContent.trim();
  let queueToRun = [];

  if (displayText && displayText !== "(empty)" && circuitDisplay.dataset.editing === "true") {
    // Manuális input parsing
    const items = displayText.split("→").map(s => s.trim());
    items.forEach(item => {
      const match = item.match(/^([a-zA-Z]+)(\(([-+]?\d+(\.\d+)?)°\))?$/);
      if (match) queueToRun.push({ gate: match[1], angle: match[3] ? Number(match[3]) : 0 });
    });
  } else {
    // Ha nincs manuális input, a gombos queue
    queueToRun = [...circuitQueue];
  }

  // Végrehajtás
  for (const item of queueToRun) {
    switch(item.gate) {
      case "X": applyXGate(); break;
      case "Y": applyYGate(); break;
      case "Z": applyZGate(); break;
      case "H": applyHGate(); break;
      case "S": applySGate(); break;
      case "T": applyTGate(); break;
      case "Rx": applyRxGate(item.angle); break;
      case "Ry": applyRyGate(item.angle); break;
      case "Rz": applyRzGate(item.angle); break;
    }
  }

  // Manuális szerkesztés után visszaállítjuk a jelzőt
  circuitDisplay.dataset.editing = "false";
  updateCircuitDisplay(); // frissítjük a divet a queue alapján
});


document.getElementById("reset-circuit").addEventListener("click", () => {
  circuitQueue = [];
  updateCircuitDisplay();
});

/*        CIRCUIT USAGE
Használat
Kattints a kapugombokra (X, Y, Z, H, S, T vagy Apply Rx/Ry/Rz) → a kapu bekerül a circuitQueue-ba és a #circuit-display-ben megjelenik.
Több kaput is hozzáadhatsz egymás után, pl. H → X → Ry(45°).
Run Circuit → a sorban lévő kapuk egymás után végrehajtódnak, a Bloch-vektor frissül a végállapotra.
Reset Circuit → törli a kapusort.

A Circuit azt is kiírja, hogy milyen kapuk lettek eddig hozzáadva.

*/

