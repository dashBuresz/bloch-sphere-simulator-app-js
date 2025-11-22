import './style.css'
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

let scene;
let camera;
let renderer;
let blochSphere;
let axes;
let blochVector;
let controls;
let circuitQueue = [];
let grid;

//ui elements
let gridButton;
let thetaSlider, phiSlider;
let thetaValueDisplay;
let phiValueDisplay;
let circuitDisplay;

let alphaRealField;
let alphaImField;
let betaRealField;
let betaImField;

let alphaImDisplay;
let alphaRealDisplay;
let betaRealDisplay;
let betaImDisplay;

let alphaPrettySpan, betaPrettySpan; //α: 1 + 0i style lines
//MODEL START
//resembling a quantum state in code: 
const qubitState = {
  //amplitudes
  alpha: {re: 1, im: 0}, 
  beta: {re: 0, im: 0},
  //angles
  thetaDeg: 0, 
  phiDeg: 0,
};
//MODEL END
//running the scripts that make up the app
initCanvas();
initUI();
initEventListener();
animate();

//new stuff
function renderState()
{
  const {x, y, z, thetaDeg, phiDeg} = amplitudesToBloch(qubitState.alpha, qubitState.beta);
  //update the qubit state
  qubitState.thetaDeg = thetaDeg;
  qubitState.phiDeg = phiDeg;
  updateBlochVectorFromXYZ(x,y,z);
  //update slider values
  thetaSlider.value = thetaDeg;
  phiSlider.value = phiDeg;
  //update angle display values
  thetaValueDisplay.textContent = `${thetaDeg.toFixed(1)}°`;
  phiValueDisplay.textContent = `${phiDeg.toFixed(1)}°`;
  //update amplitude input fields
  alphaRealField.value = qubitState.alpha.re.toFixed(3); //toFixed sets the precision of the component to .000 decimal
  alphaImField.value = qubitState.alpha.im.toFixed(3);
  betaRealField.value = qubitState.beta.re.toFixed(3);
  betaImField.value = qubitState.beta.im.toFixed(3);
  //update amplitude display 
  alphaRealDisplay.textContent = qubitState.alpha.re.toFixed(3);
  alphaImDisplay.textContent = qubitState.alpha.im.toFixed(3);
  betaRealDisplay.textContent = qubitState.beta.re.toFixed(3);
  betaImDisplay.textContent = qubitState.beta.im.toFixed(3);
  //this is in advance in case we want to display the amplitudes themselves as well as their individual components
  const a = qubitState.alpha;
  const b = qubitState.beta;
  alphaPrettySpan.textContent = `${a.re.toFixed(3)} + ${a.im.toFixed(3)}i`;
  betaPrettySpan.textContent = `${b.re.toFixed(3)} + ${b.im.toFixed(3)}i`;
}
//if we use the sliders this will run
function onAngleschanged()
{
  //getting the values from the slider inputs
  const thetaDeg = Number(thetaSlider.value);
  const phiDeg = Number(phiSlider.value);
  //converting values
  const {alpha, beta} = anglesToAmplitudes(thetaDeg, phiDeg);
  //changing the model
  qubitState.alpha = alpha;
  qubitState.beta = beta;
  //and we update the state after our changes are made to the model
  renderState();
}
function onAmplitudeChanged()
{
  //getting the values from the amplitude input fields
  const ar = Number(alphaRealField.value || 0);
  const ai = Number(alphaImField.value || 0);
  const br = Number(betaRealField.value || 0);
  const bi = Number(betaImField.value || 0);
  //normalize alpha and beta since we need |α|² + |β|² = 1 to be true 
  const  normSq = ar*ar + ai*ai + br*br + bi*bi || 1;
  const norm = Math.sqrt(normSq);
  //update the model
  qubitState.alpha = {re: ar / norm, im: ai / norm};
  qubitState.beta = {re: br / norm, im: bi / norm};
  //render the changes onto the screen
  renderState();
}
function anglesToAmplitudes(thetaDeg, phiDeg)
{
  //converting to radians
  const theta = thetaDeg*Math.PI/180;
  const phi = phiDeg*Math.PI/180;

  const alphaRe = Math.cos(theta/2);
  const alphaIm = 0;

  const s = Math.sin(theta/2);
  const betaRe = s * Math.cos(phi);
  const betaIm = s * Math.sin(phi);
  return {
    alpha: {re: alphaRe, im: alphaIm}, 
    beta: {re: betaRe, im: betaIm},
  };
}
function amplitudesToBloch(alpha, beta)
{
  const {re: ar, im:ai} = alpha;
  const {re: br, im:bi} = beta;

  const x = 2 * (ar * br + ai * bi);
  const y = 2 * (ar * bi - ai * br);
  const z = (ar*ar + ai*ai) - (br*br + bi*bi);
  const theta = Math.acos(Math.max(-1, Math.min(1, z)));
  let phi = Math.atan2(y, x);

  const thetaDeg = theta * 180/Math.PI;
  let phiDeg = phi * 180/Math.PI;

  if (phiDeg < 0) phiDeg += 360; //we make sure that phi has a positive "phase", so if phi is -60° that would make it 300°, pretty simple. 
  return {x, y, z, thetaDeg, phiDeg};
}
//end of new stuff

function initCanvas() {

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
    alpha: true,
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

  //adding grids. 
  grid = new THREE.GridHelper(20,20);
  grid.scale.setScalar(0.1);
  scene.add(grid);
}
//UI init - we might want to move all this to a function (WE DID HAHAHHA)
function initUI() {
  gridButton = document.getElementById("toggle-grid"); 

  thetaSlider       = document.getElementById("theta-slider");
  phiSlider         = document.getElementById("phi-slider");
  thetaValueDisplay = document.getElementById("theta-value");
  phiValueDisplay   = document.getElementById("phi-value");

  alphaRealField = document.getElementById("alpha-real");
  alphaImField   = document.getElementById("alpha-imag"); // FIXED
  betaRealField  = document.getElementById("beta-real");
  betaImField    = document.getElementById("beta-imag");

  alphaRealDisplay = document.getElementById("alpha-re-val");
  alphaImDisplay   = document.getElementById("alpha-im-val"); // FIXED
  betaRealDisplay  = document.getElementById("beta-re-val");
  betaImDisplay    = document.getElementById("beta-im-val");

  circuitDisplay = document.getElementById("circuit-display");
}

function initEventListener()
{
  gridButton.addEventListener("click", () => {grid.visible = !grid.visible;});
  thetaSlider.addEventListener("input", onAngleschanged);
  phiSlider.addEventListener("input", onAngleschanged);
  alphaRealField.addEventListener("input", onAmplitudeChanged);
  alphaImField.addEventListener("input", onAmplitudeChanged);
  betaRealField.addEventListener("input", onAmplitudeChanged);
  betaImField.addEventListener("input", onAmplitudeChanged);
  circuitDisplay.addEventListener("input", () => {
  circuitDisplay.dataset.editing = "true"; //jelzi, hogy manuális szerkesztés folyik
  });
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
        //Manual input parsing
      const items = displayText.split("→").map(s => s.trim());
      items.forEach(item => {
        const match = item.match(/^([a-zA-Z]+)(\(([-+]?\d+(\.\d+)?)°\))?$/);
        if (match) queueToRun.push({ gate: match[1], angle: match[3] ? Number(match[3]) : 0 });
      });
    } else {
      queueToRun = [...circuitQueue];
    }
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

    //resetting the display
    circuitDisplay.dataset.editing = "false";
    updateCircuitDisplay(); 
  });


  document.getElementById("reset-circuit").addEventListener("click", () => {
    circuitQueue = [];
    updateCircuitDisplay();
  });
}

//Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
/*        CIRCUIT USAGE
Használat
Kattints a kapugombokra (X, Y, Z, H, S, T vagy Apply Rx/Ry/Rz) → a kapu bekerül a circuitQueue-ba és a #circuit-display-ben megjelenik.
Több kaput is hozzáadhatsz egymás után, pl. H → X → Ry(45°).
Run Circuit → a sorban lévő kapuk egymás után végrehajtódnak, a Bloch-vektor frissül a végállapotra.
Reset Circuit → törli a kapusort.

A Circuit azt is kiírja, hogy milyen kapuk lettek eddig hozzáadva.

*/
//Functions
function updateBlochVectorFromXYZ(x, y, z)
{
  const newDirection = new THREE.Vector3(x, y, z).normalize();
  blochVector.setDirection(newDirection);
}

function applyGateRotation(matrix) {
  //Current direction vector
  const theta = Number(thetaSlider.value);
  const phi = Number(phiSlider.value);

  const th = theta * Math.PI / 180;
  const ph = phi * Math.PI / 180;

  let x = Math.sin(th) * Math.cos(ph);
  let y = Math.sin(th) * Math.sin(ph);
  let z = Math.cos(th);

  //Apply rotation matrix
  const newX = matrix[0][0]*x + matrix[0][1]*y + matrix[0][2]*z;
  const newY = matrix[1][0]*x + matrix[1][1]*y + matrix[1][2]*z;
  const newZ = matrix[2][0]*x + matrix[2][1]*y + matrix[2][2]*z;

  //Convert new vector back to theta/phi
  const newTheta = Math.acos(newZ) * 180 / Math.PI;
  const newPhi = Math.atan2(newY, newX) * 180 / Math.PI;ű

  const newThetaDeg = newTheta * 180 / Math.PI;
  let newPhiDeg = newPhi * 180 / Math.PI;

  if (newPhiDeg < 0) newPhiDeg += 360;
  //Update amplitudes
  const {alpha, beta} = anglesToAmplitudes(newThetaDeg, newPhiDeg);
  qubitState.alpha = alpha;
  qubitState.beta = beta;
  qubitState.thetaDeg = newThetaDeg;
  qubitState.phiDeg = newPhiDeg;

  //Refresh UI & arrow
  renderState();
}

function applyXGate() {
  //Rotation by π around X axis
  const Rx = [
    [1, 0, 0],
    [0, -1, 0],
    [0, 0, -1]
  ];
  applyGateRotation(Rx);
}

function applyYGate() {
  //Rotation by π around Y axis
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



