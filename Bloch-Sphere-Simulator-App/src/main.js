import './style.css'
import * as THREE from  "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(2,1.2,2);
camera.lookAt(0,0,0);


const geometry = new THREE.SphereGeometry(1, 40, 40);
const material = new THREE.MeshBasicMaterial({color: 0x00aaff, transparent:true, opacity: 0.18, wireframe: true});
const blochSphere = new THREE.Mesh(geometry, material);
const contRotation = 0.002;
scene.add(blochSphere);

const axes = new THREE.AxesHelper(2);
scene.add(axes);

const direction = new THREE.Vector3(0,0,1);
const origin = new THREE.Vector3(0,0,0);
const length = 1;
const color = 0xff0000;
const blochVector = new THREE.ArrowHelper(direction.normalize(), origin, length, color);
scene.add(blochVector);


//functions from here

function animate()
{
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  //blochSphere.rotation.y += contRotation;
  //axes.rotation.y += contRotation;
  //blochVector.setY += contRotation;
}
animate();