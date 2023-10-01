import "./style.css";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import image from "./earth_map.png"
const IS_DEV = import.meta.env.VITE_NODE_ENV !== 'production';

let renderer, camera, scene, controls, Globe;
const rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const hitBoxMeshes = [];

init();

if(IS_DEV){
 mockGlobeData();
}

function init() {
  setupRenderer();
  setupScene();
  setupCamera();
  setupControls();
  setupLights();
  animate();
}

// call from flutter end
window.updateGlobeFromFlutter = function(newDataString) {
  try {
    const newData = JSON.parse(newDataString);
    const generatedArcs = generateArcsFromMap(newData);
    initGlobe(generatedArcs, newData);
  } catch (error) {
    console.error("Failed to parse data from Flutter:", error);
  }
}


function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.domElement.addEventListener('mousedown', onMouseDown, false);
  renderer.domElement.addEventListener('touchstart', onTouchStart, false);
  window.addEventListener('resize', onWindowResize, false);
}
function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x215483);
  scene.fog = new THREE.Fog(0x215483, 400, 2000);
}
function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls, {
    enableDamping: true,
    dynamicDampingFactor: 0.01,
    enablePan: false,
    minDistance: 200,
    maxDistance: 800,
    rotateSpeed: 0.8,
    zoomSpeed: 1,
    autoRotate: false,
    minPolarAngle: Math.PI / 5,
    maxPolarAngle: Math.PI - Math.PI / 3
  });
}
function setupCamera() {
  camera = new THREE.PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 460);

  scene.add(camera);
}
function setupLights() {
  const ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3);
  scene.add(ambientLight);

  const dLight = new THREE.DirectionalLight(0xffffff, 1);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  const dLight1 = new THREE.DirectionalLight(0xffffff, 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);
}

function latLngToXYZ(lat, lng, altitude = 0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const r = 100 + altitude;

  const x = -r * Math.sin(phi) * Math.sin(theta);  // added negative sign
  const y = r * Math.cos(phi);
  const z = -r * Math.sin(phi) * Math.cos(theta);  // added negative sign

  return { x, y, z };
}
function initGlobe(generatedArcs, mapData) {
  if (Globe) {
    scene.remove(Globe);
  }

  Globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
      .showAtmosphere(true).globeImageUrl(image)
      .atmosphereColor("#215483")
      .atmosphereAltitude(0.10);

  Globe.pointsData(mapData.maps)
      .pointColor(() => "#ffffff")
      .pointsMerge(true)
      .pointAltitude(0.02)
      .pointRadius(0.25);

  mapData.maps.forEach(point => {
    const { x, y, z } = latLngToXYZ(point.lat, point.lng, 0.02); // altitude is set to 0.02
    const hitBoxGeometry = new THREE.SphereGeometry(1.5);
    const hitBoxMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 1, color: "red" });
    const hitBoxMesh = new THREE.Mesh(hitBoxGeometry, hitBoxMaterial);
    hitBoxMesh.dataID = point.id;
    hitBoxMesh.position.set(x, y, z);
    hitBoxMeshes.push(hitBoxMesh);
  });

  hitBoxMeshes.forEach(mesh => scene.add(mesh));

  Globe.arcsData(generatedArcs)
      .arcColor(() => "#ffffff")
      .labelsData(mapData.maps)
      .labelColor(() => "#ffffff")
      .labelSize(0.7)
      .labelResolution(1);

  // Globe.rotateY(-Math.PI * (5 / 9));
  // Globe.rotateZ(-Math.PI / 6);

  const globeMaterial = Globe.globeMaterial();
  globeMaterial.side = THREE.Color;
  globeMaterial.needsUpdate = true;
  scene.add(Globe);
}

function generateArcsFromMap(mapData) {
  const arcs = [];
  for (let i = 0; i < mapData.maps.length - 1; i++) {
    const start = mapData.maps[i];
    const end = mapData.maps[i + 1];
    arcs.push({
      type: "pull",
      from: start.text,
      to: end.text,
      startLat: parseFloat(start.lat),
      startLng: parseFloat(start.lng),
      endLat: parseFloat(end.lat),
      endLng: parseFloat(end.lng),
      color: start.color
    });
  }
  return arcs;
}
function animate() {
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function onTouchStart(event){
  event.preventDefault();
  const intersectedObject = getIntersectedObject(event);
  if(intersectedObject && intersectedObject.dataID){
    console.log(`Touched ID: ${intersectedObject.dataID}`);
  }
}

function onMouseDown(event) {
  const intersectedObject = getIntersectedObject(event);
  if(intersectedObject && intersectedObject.dataID){
    console.log(`Clicked ID: ${intersectedObject.dataID}`);
  }
}

function getIntersectedObject(event) {
  let x, y;
  const rect = renderer.domElement.getBoundingClientRect();

  if(event.touches){
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  }else {
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }

  mouse.x = (x / rect.width) * 2 - 1;
  mouse.y = -(y / rect.height) * 2 + 1;
  rayCaster.setFromCamera(mouse,camera);
  const intersects = rayCaster.intersectObjects(hitBoxMeshes, true);
  if(intersects.length > 0){
    return intersects[0].object;
  }
  return null;
}
function mockGlobeData() {
  const mockData = JSON.stringify({
    type: "Map",
    maps: [
      {
        id:"berlin",
        text: "Berlin MD, USA",
        size: 1.0,
        city: "Berlin MD, USA",
        lat: 38.3226153,
        lng: -75.2176892
      },
      {
        id:"spain",
        text: "Benidorm Spain",
        size: 1.0,
        city: "Benidorm Spain",
        lat: 38.5411928,
        lng: -0.1233831
      },
      {
        id:"burma",
        text: "He Hoe Myanmar (Burma)",
        size: 1.0,
        city: "He Hoe Myanmar (Burma)",
        lat: 20.723192,
        lng: 96.82170169999999
      },
      {
        id:"italy",
        text: "Lucca Province of Lucca, Italy",
        size: 1.0,
        city: "Lucca Province of Lucca, Italy",
        lat: 43.8429197,
        lng: 10.5026977
      },
      {
        id:"india",
        text: "Shivamogga Karnataka, India",
        size: 1.0,
        city: "Shivamogga Karnataka, India",
        lat: 13.9299299,
        lng: 75.568101
      }
  ]
  });

  setTimeout(() => {
    window.updateGlobeFromFlutter(mockData);
  }, 1000);
}
