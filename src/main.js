import "./style.css";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import countries from "./assets/custom.geo.json";
let renderer, camera, scene, controls;
import image from "./assets/earth_map.png"
let Globe;

// let currentArcIndex = 0;
const newData = {
  "type": "Map",
  "maps": [
    {
      "text": "Berlin MD, USA",
      "size": 1.0,
      "city": "Berlin MD, USA",
      "lat": 38.3226153,
      "lng": -75.2176892,
      "color": "#c700ff"
    },
    {
      "text": "Benidorm Spain",
      "size": 1.0,
      "city": "Benidorm Spain",
      "lat": 38.5411928,
      "lng": -0.1233831,
      "color": "#ff0000"
    },
    {
      "text": "He Hoe Myanmar (Burma)",
      "size": 1.0,
      "city": "He Hoe Myanmar (Burma)",
      "lat": 20.723192,
      "lng": 96.82170169999999,
      "color": "#00ffff"
    },
    {
      "text": "Lucca Province of Lucca, Italy",
      "size": 1.0,
      "city": "Lucca Province of Lucca, Italy",
      "lat": 43.8429197,
      "lng": 10.5026977,
      "color": "#ffcd00"
    },
    {
      "text": "Shivamogga Karnataka, India",
      "size": 1.0,
      "city": "Shivamogga Karnataka, India",
      "lat": 13.9299299,
      "lng": 75.568101,
      "color": "#00ff2e"
    }
  ]
};

// const generatedArcs = generateArcsFromMap(newData);
// console.log(generatedArcs);
// init();
// initGlobe(generatedArcs, newData);
// onWindowResize();
// animate();
const generatedArcs = generateArcsFromMap(newData);
init();
initGlobe(generatedArcs, newData);
onWindowResize();
animate();


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

  let dLight = new THREE.DirectionalLight(0xffffff, 1);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  let dLight1 = new THREE.DirectionalLight(0xffffff, 1);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  camera.position.z = 460;
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
}



// function animateArcsSequentially(generatedArcs) {
//   if (currentArcIndex < generatedArcs.length - 1) {
//     setTimeout(() => {
//       currentArcIndex++;
//       Globe.arcsData([generatedArcs[currentArcIndex]]);
//       animateArcsSequentially(generatedArcs);
//     }, 1000); // Delay for 1 second
//   }
// }
function initGlobe(generatedArcs, mapData) {
  Globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
      .showAtmosphere(true).globeImageUrl(image)
      .atmosphereColor("#ffffff")
      .atmosphereAltitude(0.10);

  Globe.pointsData(mapData.maps)
      .pointColor(() => "#ffffff") // Marker color
      .pointsMerge(true)
      .pointAltitude(0.08) // Adjust if needed
      .pointRadius(0.1);   // Adjust if needed

  // Set all arcs at once without animation
  // Globe.arcsData(generatedArcs)
  //     .arcColor(d=> d.color)
  //     .arcStroke(1.2)
  //     .labelsData(mapData.maps)
  //     .labelColor(() => "#ffffff")
  //     .labelDotRadius(0.6)
  //     .labelSize(2)
  //     .labelText("city")
  //     .labelResolution(10)
  //     .labelAltitude(0.02)
  //     .pointsData(mapData.maps)
  //     .pointColor(() => "#ffffff")
  //     .pointsMerge(true)
  //     .pointAltitude(0.08)
  //     .pointRadius(0.1);

  Globe.rotateY(-Math.PI * (5 / 9));
  Globe.rotateZ(-Math.PI / 6);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.side = THREE.Color;
  globeMaterial.needsUpdate = true;
  scene.background = new THREE.Color(0xffffff);
  scene.add(Globe);
}


// function initGlobe(generatedArcs, mapData) {
//   // Globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
//   //     .hexPolygonsData(countries.features)
//   //     .hexPolygonColor(() => "#ffffff")
//   //     .hexPolygonResolution(3)
//   //     .hexPolygonMargin(0.65)
//   //     .showAtmosphere(true)
//   //     .atmosphereColor("#cecece")
//   //     .atmosphereAltitude(0.30);
//   Globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
//       .showAtmosphere(true)
//       .atmosphereColor("#cecece")
//       .atmosphereAltitude(0.30);
//
//   // Set all arcs at once without animation
//   Globe.arcsData(generatedArcs)
//       .arcColor(d=> d.color)
//       .arcStroke(1.2)
//       .labelsData(mapData.maps)
//       .labelColor(() => "#ffffff")
//       .labelDotRadius(0.6)
//       .labelSize(2)
//       .labelText("city")
//       .labelResolution(10)
//       .labelAltitude(0.02)
//       .pointsData(mapData.maps)
//       .pointColor(() => "#ffffff")
//       .pointsMerge(true)
//       .pointAltitude(0.08)
//       .pointRadius(0.1);
//
//   Globe.rotateY(-Math.PI * (5 / 9));
//   Globe.rotateZ(-Math.PI / 6);
//   const globeMaterial = Globe.globeMaterial();
//   earthTexture.wrapS = THREE.RepeatWrapping;
//   earthTexture.wrapT = THREE.RepeatWrapping;
//   globeMaterial.map = earthTexture;
//   globeMaterial.side = THREE.DoubleSide;
//   globeMaterial.needsUpdate = true;
//   // globeMaterial.color = new THREE.Color(0x0021ab8);
//   // globeMaterial.emissive = new THREE.Color(0x0021ab8);
//   // globeMaterial.emissiveIntensity = 0.1;
//   // globeMaterial.shininess = 0.7;
//   scene.background = new THREE.Color(0xffffff);  // Black for space representation
//
//   scene.add(Globe);
// }

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
  // camera.position.x +=
  //   Math.abs(mouseX) <= windowHalfX / 2
  //     ? (mouseX / 2 - camera.position.x) * 0.005
  //     : 0;
  // camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  controls.autoRotate = false;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// flutter call
window.updateGlobeFromFlutter = function() {
  // const newData = JSON.parse(newDataString)
  const generatedArcs = generateArcsFromMap(newData);
  init();
  initGlobe(generatedArcs, newData);
  onWindowResize();
  animate();
}
