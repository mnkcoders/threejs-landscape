import * as THREE from 'three';
//import {default as SimplexNoise} from 'simplex-noise';
//import { makeNoise2D } from 'open-simplex-noise';
import FastNoiseLite from 'fastnoise-lite';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const seed = Math.floor(Math.random() * 1000) + 1000;

const noise2D = new FastNoiseLite(seed);
noise2D.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
//const noise2D = makeNoise2D(Date.now()); // Seeded noise
//const noise = new SimplexNoise(seed);

const randomColors = false;
const worldSize = 128; // Size of the looping terrain
const worldMaxHeight = Math.floor(Math.random() * 40) + 10;
const tileSize = 64;
const gridSize = 16;
const waterLevel = 0.3;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);

const controls = createControls();

/**
 * @param {Number} x 
 * @param {Number} z 
 * @param {Number} scale
 * @returns 
 */
 function generateHeight(x, z, scale = 10 ) {
  //return noise2D(x * 0.05, z * 0.05) * 10;
  return noise2D.GetNoise(x, z) * scale; // Adjust scale as needed
}

/**
 * @param {Number} x 
 * @param {Number} z 
 * @param {THREE.Color} tileColor 
 * @returns {THREE.Mesh}
 */
function createTerrainTile(x, z, tileColor) {
  const geometry = new THREE.PlaneGeometry(tileSize, tileSize, 32, 32);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const height = generateHeight(positions[i] + x, positions[i + 2] + z , worldMaxHeight );
    positions[i + 1] = height;
  }
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    //color: 0x228B22,
    color: tileColor,
    wireframe: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 0, z);
  scene.add(mesh);
  return mesh;
}
/**
 * 
 */
function createWater() {
  const waterGeometry = new THREE.PlaneGeometry(tileSize * gridSize, tileSize * gridSize, 10, 10);
  waterGeometry.rotateX(-Math.PI / 2);
  const waterMaterial = new THREE.MeshStandardMaterial({
    //color: 0x1E90FF,
    color: randomColors ? createRandomColor() : 0x1E20FF,
    transparent: true,
    //opacity: 0.5
    opacity: Math.floor(Math.random()) * 0.4 + 0.6
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = Math.floor(Math.random() * worldMaxHeight ) * waterLevel;
  scene.add(water);
}
/**
 * @returns {THREE.Color}
 */
function createRandomColor() {
  const hue = Math.floor(Math.random() * 360); // Random hue between 0-360
  return new THREE.Color(`hsl(${hue}, 80%, 70%)`); // Soft sky tones
}
/**
 * @returns {THREE.Mesh[]}
 */
function createTerrain() {
  const tiles = [];
  const color = randomColors ? createRandomColor() : 0x428B22;
  for (let i = -gridSize / 2; i < gridSize / 2; i++) {
    for (let j = -gridSize / 2; j < gridSize / 2; j++) {
      tiles.push(createTerrainTile(i * tileSize, j * tileSize, color));
    }
  }
  return tiles;
}
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



createTerrain();
createWater();

const light = new THREE.DirectionalLight(0xffffff, randomColors ? Math.floor(Math.random() * 5) + 5 : 12);
light.position.set(10, 50, 10);
scene.background = randomColors && createRandomColor() || new THREE.Color(`hsl(224, 100%, 90%)`);
scene.add(light);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
} , false );

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
