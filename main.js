import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { OBJLoader } from 'three/examples/jsm/Addons.js';
// import { MTLLoader } from 'three/examples/jsm/Addons.js';

const width = window.innerWidth,
  height = window.innerHeight;

// init

const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
camera.position.x = -3;
camera.position.y = 3;
camera.position.z = -3;
// camera.lookAt(0,2,0);

const scene = new THREE.Scene();

const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);
// const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
// const material = new THREE.MeshPhongMaterial();

// const mesh = new THREE.Mesh( geometry, material );
// scene.add( mesh );

const size = 20;
const divisions = size * 2;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

const balkPoints = [
  [-1.5, 0, -2.5],
  [1.5, 0, -2.5],
  [-1.5, 0, 0],
  [1.5, 0, 0],
  [-1.5, 0, 2.5],
  [1.5, 0, 2.5],
];
const angles = [
	[0, Math.PI * 1.5],
	[Math.PI, Math.PI * 1.5],
	[Math.PI / 2, Math.PI * 1.5],
	[Math.PI / 2, Math.PI * 1.5],
	[Math.PI / 2, 0],
	[Math.PI / 2, Math.PI],
];
const balkCorners = balkPoints.reduce((prev, curr, ndx) => {
  return [
    ...prev,
    {
      position: curr,
      rotation: angles[ndx][0],
    },
    {
      position: curr,
      rotation: angles[ndx][1],
    },
  ];
}, []);
let roofBalkPoints = [
	[0, 0, -2.5],
  [0, 0, -2.5],
  [-1.5, 0, 0],
  [1.5, 0, 0],
  [0, 0, 2.5],
  [0, 0, 2.5],
]
//manager

function loadModel() {
  render();
}

const manager = new THREE.LoadingManager(loadModel);

// texture

const textureLoader = new THREE.TextureLoader(manager);
const normalMap = textureLoader.load('public/textures/texture_wood_normal.jpg', render);
const texture = textureLoader.load('public/textures/texture_wood.jpg', render);
texture.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.PlaneGeometry(3, 5);
const material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, map: texture });
const plane = new THREE.Mesh(geometry, material);
// plane.position.x = 1.5;
// plane.position.z = 2.5;

plane.rotateX(Math.PI / 2);
scene.add(plane);

// model

function onBalkLoad(obj) {
  obj.children[0].material.map = texture;
  obj.children[0].material.normalMap = normalMap;
  for (const point of balkPoints) {
    const clone = obj.clone();
    clone.position.x = point[0];
    clone.position.z = point[2];
    scene.add(clone);
  }
}
function onCornerLoad(obj) {
  obj.children[0].material.map = texture;
  obj.children[0].material.normalMap = normalMap;
  for (const corner of balkCorners) {
    const clone = obj.clone();
    clone.position.x = corner.position[0];
    clone.position.z = corner.position[2];
    clone.rotateY(corner.rotation);
    scene.add(clone);
  }
}

function onRoofBalkLoad(obj) {
  obj.children[0].material.map = texture;
  obj.children[0].material.normalMap = normalMap;
  for (const point of roofBalkPoints) {
    const clone = obj.clone();

		if (point[2] === 0) {
			clone.scale.set(5,1,1);
			clone.rotateY(Math.PI / 2)
			clone.position.x = point[0];
			clone.position.z = point[2] + 2.5;
		} else {
			clone.scale.set(3,1,1);
			clone.position.x = point[0] - 1.5;
			clone.position.z = point[2];
		}
    clone.position.y = 2.1;
    scene.add(clone);
  }
}

function onProgress(xhr) {
  if (xhr.lengthComputable) {
    const percentComplete = (xhr.loaded / xhr.total) * 100;
    console.log('model ' + percentComplete.toFixed(2) + '% downloaded');
  }
}

function onError() {}

// const mttlLoader = new MTLLoader();
// mttlLoader.load('public/models/ruberoid_1000x1000x2.mtl', function ( mat ) {
// 	// material = mat;
// 	// scene.add(obj);
// }, onProgress, onError );

const objLoader = new OBJLoader(manager);
// objLoader.load('public/models/roof_edge/roof_edge_1m.obj', onLoad, onProgress, onError);
// objLoader.load('public/models/roof_edge/roof_edge_1m2.obj', onLoad, onProgress, onError);
// objLoader.load('public/models/roof_edge/roof_edge_corner.obj', onLoad, onProgress, onError);
// objLoader.load('public/models/roof_edge/roof_edge_corner2.obj', onLoad, onProgress, onError);
// objLoader.load('public/models/lodge_150x50x1000.obj', onLoad, onProgress, onError);
objLoader.load('public/models/balk_150x150x1000.obj', onRoofBalkLoad, onProgress, onError);
objLoader.load('public/models/balk_150x150x2200.obj', onBalkLoad, onProgress, onError);
objLoader.load('public/models/balk_corner.obj', onCornerLoad, onProgress, onError);
// objLoader.load('public/models/Lodge_20x200x1000.obj', onLoad, onProgress, onError);
// objLoader.load('public/models/Lodge_20x190x1000_bevel.obj', onLoad, onProgress, onError);
// objLoader.load('public/models/ruberoid_1000x1000x2.obj', onLoad, onProgress, onError);
// objLoader.load('public/models/profile_canopy_perimeter_closed.obj', onLoad, onProgress, onError);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.minDistance = 1;
// controls.maxDistance = 10;
// controls.addEventListener('change', render);

window.addEventListener('resize', onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// animation

function animate(time) {
  // mesh.rotation.x = time / 2000;
  // mesh.rotation.y = time / 1000;

  render();
}

function render() {
  renderer.render(scene, camera);
}
