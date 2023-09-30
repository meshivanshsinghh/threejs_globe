import "./style.css";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import countries from "./assets/custom.geo.json";

let renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let Globe;
let currentArcIndex = 0;

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();
  let ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3);
  scene.add(ambientLight);
  scene.background = new THREE.Color(0xFF5F5F5);

  // camera
  camera = new THREE.PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  let dLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  let dLight1 = new THREE.DirectionalLight(0x7982f6, 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  // modifying scene
  scene.add(camera);
  scene.fog = new THREE.Fog(0x535ef3, 400, 2000);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1;
  controls.autoRotate = false;
  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  // listener
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function animateArcsSequentially(generatedArcs) {
  if (currentArcIndex < generatedArcs.length - 1) {
    setTimeout(() => {
      currentArcIndex++;
      Globe.arcsData([generatedArcs[currentArcIndex]]);
      animateArcsSequentially(generatedArcs);
    }, 1000); // Delay for 1 second
  }
}


function initGlobe(generatedArcs, mapData) {
  Globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
      .hexPolygonsData(countries.features)
      .hexPolygonColor(() => "#ffffff")
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.65)
      .showAtmosphere(true)
      .atmosphereColor("#cecece")
      .atmosphereAltitude(0.30);

  // Initial setting of arcs with just the first arc
  Globe.arcsData([generatedArcs[currentArcIndex]])
      .arcColor(() => "#ffffff")
      .arcStroke(1.2)
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(1000)
      .arcsTransitionDuration(1000)
      .arcDashInitialGap(1)
      .labelsData(mapData.maps)
      .labelColor(() => "#ffffff")
      .labelDotRadius(0.6)
      .labelSize(2)
      .labelText("city")
      .labelResolution(10)
      .labelAltitude(0.02)
      .pointsData(mapData.maps)
      .pointColor(() => "#ffffff")
      .pointsMerge(true)
      .pointAltitude(0.08)
      .pointRadius(0.1);

  Globe.rotateY(-Math.PI * (5 / 9));
  Globe.rotateZ(-Math.PI / 6);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new THREE.Color(0x0021ab8);
  globeMaterial.emissive = new THREE.Color(0x0021ab8);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  scene.add(Globe);

  animateArcsSequentially(generatedArcs);
}

function animate() {
  camera.position.x +=
    Math.abs(mouseX) <= windowHalfX / 2
      ? (mouseX / 2 - camera.position.x) * 0.005
      : 0;
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  controls.autoRotate = false;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowHalfX = window.innerWidth / 1.5;
  windowHalfY = window.innerHeight / 1.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// flutter call
window.updateGlobeFromFlutter = function(newDataString) {
  const newData = JSON.parse(newDataString)
  const generatedArcs = generateArcsFromMap(newData);
  init();
  initGlobe(generatedArcs, newData);
  onWindowResize();
  animate();
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
    });
  }
  return arcs;
}
