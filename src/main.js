import * as THREE from 'three';
import { TerrainWorld } from './world';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const world = new TerrainWorld(64,16);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);
const controls = createControls();

/**
 * @returns {OrbitControls}
 */
function createControls() {
  const ctl = new OrbitControls(camera, renderer.domElement);
  // Optional settings:
  ctl.enableDamping = true; // Smooth movement
  ctl.dampingFactor = 0.05;
  ctl.screenSpacePanning = false;
  ctl.minDistance = 10; // Minimum zoom
  ctl.maxDistance = 500; // Maximum zoom
  ctl.maxPolarAngle = Math.PI / 2; // Restrict vertical movement  
  return ctl;
}



window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
} , false );

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  //renderer.render(scene, camera);
  renderer.render(world.scene(), camera);
}
animate();
