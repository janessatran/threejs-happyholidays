import "./style.css";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { InteractionManager } from "three.interactive";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let mouse = { X: 0, Y: 0 };

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
gui.close();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Fog
const fog = new THREE.Fog("#c1e2e3", 1, 20);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load(
  "./textures/door/synthetic_wood_diff_4k.jpg"
);
const doorAlphaTexture = textureLoader.load("./textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
  "./textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load(
  "./textures/door/synthetic_wood_disp_4k.png"
);
const doorNormalTexture = textureLoader.load("./textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load(
  "./textures/door/metalness.jpg"
);
const doorRoughnessTexture = textureLoader.load(
  "./textures/door/roughness.jpg"
);

const bricksColorTexture = textureLoader.load("./textures/bricks/color.jpg");
const bricksAmbientOcclusionTexture = textureLoader.load(
  "./textures/bricks/ambientOcclusion.jpg"
);
const bricksNormalTexture = textureLoader.load("./textures/bricks/normal.jpg");
const bricksRoughnessTexture = textureLoader.load(
  "./textures/bricks/roughness.jpg"
);

const snowColorTexture = textureLoader.load(
  "./textures/snow/snow_02_diff_4k.jpg"
);
const snowRoughnessTexture = textureLoader.load(
  "./textures/snow/snow_02_rough_4k.jpg"
);
const snowNormalTexture = textureLoader.load(
  "./textures/snow/snow_02_nor_gl_4k.exr"
);

const snowflakeTexture1 = textureLoader.load(
  "./textures/snowflake/snowflake1.png"
);

const snowflakeTexture2 = textureLoader.load(
  "./textures/snowflake/snowflake2.png"
);
const snowflakeTexture3 = textureLoader.load(
  "./textures/snowflake/snowflake3.png"
);
const snowflakeTexture4 = textureLoader.load(
  "./textures/snowflake/snowflake4.png"
);
const snowflakeTexture5 = textureLoader.load(
  "./textures/snowflake/snowflake5.png"
);

// roof texture
const roofTexture = textureLoader.load(
  "./textures/roof/roof_tiles_14_diff_4k.jpg"
);

snowColorTexture.repeat.set(8, 8);
snowRoughnessTexture.repeat.set(8, 8);
snowNormalTexture.repeat.set(8, 8);
snowColorTexture.wrapS = THREE.RepeatWrapping;
snowRoughnessTexture.wrapS = THREE.RepeatWrapping;
snowNormalTexture.wrapS = THREE.RepeatWrapping;
snowColorTexture.wrapT = THREE.RepeatWrapping;
snowRoughnessTexture.wrapT = THREE.RepeatWrapping;
snowNormalTexture.wrapT = THREE.RepeatWrapping;

const materials = [];
let snowParams;

const createParticleSystems = () => {
  // Create the geometry that will hold all our vertices
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const particleSystems = [];

  // create the vertices and store them in our vertices array
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 2000 - 1000; // generate random number between -1000 to 1000
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;

    vertices.push(x, y, z);
  }

  // Add the vertices stored in our array to set
  // the position attribute of our geometry.
  // Position attribute will be read by threejs
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  snowParams = [
    [[1.0, 0.2, 0.5], snowflakeTexture1, 4],
    [[0.95, 0.2, 0.5], snowflakeTexture2, 3],
    [[0.9, 0.2, 0.5], snowflakeTexture3, 2],
    [[0.85, 0.2, 0.5], snowflakeTexture4, 5],
    [[0.8, 0.2, 0.5], snowflakeTexture5, 1],
  ];

  for (let i = 0; i < snowParams.length; i++) {
    const color = snowParams[i][0];
    const sprite = snowParams[i][1];
    const size = snowParams[i][2];

    // Create the material that will be used to render each vertex of our geometry
    materials[i] = new THREE.PointsMaterial({
      size,
      map: sprite,
      fog: false,
      //   color: "white",
      blending: THREE.AdditiveBlending,
      depthTest: true,
      transparent: true,
    });
    // materials[i].color.setHSL(color[0], color[1], color[2]);

    // Create the particle system
    const particleSystem = new THREE.Points(geometry, materials[i]);

    /* Offset the particle system x, y, z to different random points to break
      uniformity in the direction of movement during animation */
    particleSystem.rotation.x = Math.random() * 6;
    particleSystem.rotation.y = Math.random() * 6;
    particleSystem.rotation.z = Math.random() * 6;

    particleSystems.push(particleSystem);
  }
  return particleSystems;
};

// Snow
const particleSystems = createParticleSystems();

// Add particleSystems to scene
for (let i = 0; i < particleSystems.length; i++) {
  scene.add(particleSystems[i]);
}

/**
 * House
 */

// Group
const house = new THREE.Group();
scene.add(house);

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(5, 4, 4.15),
  new THREE.MeshStandardMaterial({
    // map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
  })
);
walls.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = 3 / 2;
house.add(walls);

// Windows
const hexWindowPositions = [1.5, -1.5];
hexWindowPositions.forEach((x) => {
  const houseWindow = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2),
    new THREE.MeshStandardMaterial({
      color: "#9dc7c9",
    })
  );
  houseWindow.rotation.set(2.1, 1.5, 2.66);
  houseWindow.scale.set(0.3, 0.3, 0.3);
  houseWindow.position.y = 3 / 2;
  houseWindow.position.z = 2;
  houseWindow.position.x = x;
  //   gui.add(houseWindow.rotation, "x").min(-5).max(5).step(0.001);
  //   gui.add(houseWindow.rotation, "y").min(-5).max(5).step(0.001);
  //   gui.add(houseWindow.rotation, "z").min(-5).max(5).step(0.001);
  house.add(houseWindow);
});

// square windows
const squareWindowPosition = [-1.6, -0.8, 0, 0.8, 1.6];
squareWindowPosition.forEach((x) => {
  const squareWindow = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 0.2),
    new THREE.MeshStandardMaterial({
      color: "#9dc7c9",
    })
  );
  squareWindow.scale.set(0.3, 0.3, 0.3);
  squareWindow.position.y = 2.8;
  squareWindow.position.z = 2.1;
  squareWindow.position.x = x;
  house.add(squareWindow);
});

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(4, 1.5, 4),
  new THREE.MeshStandardMaterial({ map: roofTexture })
);
roof.position.y = 4.2;
roof.rotation.y = Math.PI / 4;
house.add(roof);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: textureLoader,
    alphaMap: doorAlphaTexture,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  })
);
door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.z = 2 + 0.01;
door.position.y = 1;
house.add(door);

// snowman
const sphereGeometry1 = new THREE.SphereGeometry(0.6, 20, 16);
const snowmanMaterial = new THREE.MeshBasicMaterial({ color: "#e6f2f0" });
const snowmanBase = new THREE.Mesh(sphereGeometry1, snowmanMaterial);
snowmanBase.position.z = 3;
snowmanBase.position.y = 0.5;
snowmanBase.position.x = -2.7;
scene.add(snowmanBase);

const sphereGeometry2 = new THREE.SphereGeometry(0.5, 20, 16);
const snowmanBody = new THREE.Mesh(sphereGeometry2, snowmanMaterial);
snowmanBody.position.z = 3;
snowmanBody.position.y = 1.3;
snowmanBody.position.x = -2.7;
scene.add(snowmanBody);

const sphereGeometry3 = new THREE.SphereGeometry(0.37, 20, 16);
const snowmanHead = new THREE.Mesh(sphereGeometry3, snowmanMaterial);
snowmanHead.position.z = 3;
snowmanHead.position.y = 2;
snowmanHead.position.x = -2.7;
scene.add(snowmanHead);

const eyesGeometry1 = new THREE.SphereGeometry(0.03, 20, 16);
const eyeMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const snowmanEye1 = new THREE.Mesh(eyesGeometry1, eyeMaterial);
snowmanEye1.position.z = 3.36;
snowmanEye1.position.y = 2;
snowmanEye1.position.x = -2.8;
scene.add(snowmanEye1);
const eyesGeometry = new THREE.SphereGeometry(0.03, 20, 16);
const snowmanEye2 = new THREE.Mesh(eyesGeometry, eyeMaterial);
snowmanEye2.position.z = 3.33;
snowmanEye2.position.y = 2.05;
snowmanEye2.position.x = -2.5;
scene.add(snowmanEye2);

const geometry = new THREE.ConeGeometry(5, 20, 32);
const material = new THREE.MeshBasicMaterial({ color: "orange" });
const cone = new THREE.Mesh(geometry, material);
cone.rotation.set(1, 1.5, 0.5);
cone.scale.set(0.01, 0.01, 0.01);
cone.position.z = 3.45;
cone.position.x = -2.6;
cone.position.y = 2;
gui.add(cone.rotation, "x").min(-5).max(5).step(0.001);
gui.add(cone.rotation, "y").min(-5).max(5).step(0.001);
gui.add(cone.rotation, "z").min(-5).max(5).step(0.001);
gui.add(cone.position, "x").min(-5).max(5).step(0.001);
gui.add(cone.position, "y").min(-5).max(5).step(0.001);
gui.add(cone.position, "z").min(-5).max(5).step(0.001);
scene.add(cone);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: "#193b1a" });
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.1);
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.3, 0.3, 0.3);
bush4.position.set(-1, 0.05, 2.6);
house.add(bush1);
house.add(bush2);
house.add(bush3);
house.add(bush4);

// Trees
const trees = new THREE.Group();
scene.add(trees);

for (let i = 0; i < 100; i++) {
  let tree = new THREE.Group();
  let scale = Math.random();
  const radius = 10 + 20 * Math.random();
  const angle = Math.random() * Math.PI * 2;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const treeColorCodes = ["#549165", "#27591c", "#7f9979", "#bdd1b8"];
  const randomColor = Math.floor(Math.random() * treeColorCodes.length);

  for (let h = 0; h < 3; h++) {
    let coneGeometry = null;

    const coneMesh = new THREE.MeshStandardMaterial({
      color: treeColorCodes[randomColor],
    });
    let cone = null;
    if (h == 2) {
      coneGeometry = new THREE.ConeGeometry(0.5, 1.2 - 0.2 * h, 32);
      cone = new THREE.Mesh(coneGeometry, coneMesh);
      cone.position.y = h + 0.05;
    } else if (h == 1) {
      coneGeometry = new THREE.ConeGeometry(0.7, 1.4 - 0.2 * h, 32);
      cone = new THREE.Mesh(coneGeometry, coneMesh);
      cone.position.y = h + 0.3;
    } else {
      coneGeometry = new THREE.ConeGeometry(0.9, 1.7 - 0.2 * h, 32);
      cone = new THREE.Mesh(coneGeometry, coneMesh);
      cone.position.y = h + 0.4;
    }

    // cone.position.y = h + 0.5;
    cone.position.z = z;
    cone.position.x = x;
    cone.castShadow = true;
    tree.add(cone);
  }
  tree.position.y = 0.5 * scale;
  tree.scale.set(scale, scale, scale);
  trees.add(tree);
}

// Tombstones
// const tombstones = new THREE.Group();
// scene.add(tombstones);
// const tombstoneGeo = new THREE.BoxGeometry(0.6, 0.8, 0.2);
// const tombstoneMaterial = new THREE.MeshStandardMaterial({ color: "grey" });

// for (let i = 0; i < 50; i++) {
//   const angle = Math.random() * Math.PI * 2;
//   const radius = 3 + Math.random() * 6;
//   const x = Math.sin(angle) * radius;
//   const z = Math.cos(angle) * radius;

//   const tombstone = new THREE.Mesh(tombstoneGeo, tombstoneMaterial);
//   tombstone.position.set(x, 0.3, z);
//   tombstone.rotation.y = Math.random() - 0.5 * 0.6;
//   tombstone.rotation.z = Math.random() - 0.5 * 0.6;
//   tombstone.castShadow = true;
//   tombstones.add(tombstone);
// }

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    map: snowColorTexture,
    // aoMap: grassAmbientOcclusionTexture,
    normalMap: snowNormalTexture,
    roughnessMap: snowRoughnessTexture,
  })
);
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Moving Lights
 */
const light1 = new THREE.PointLight("#f54242", 2, 3);
scene.add(light1);

const light2 = new THREE.PointLight("#15695a", 2, 3);
scene.add(light2);

const light3 = new THREE.PointLight("#36c943", 2, 3);
scene.add(light3);

// Text
let titleMesh;
const fontLoader = new FontLoader();
fontLoader.load("./fonts/helvetiker_regular.typeface.json", (font) => {
  const titleText = new TextGeometry("happy holidays! ", {
    font,
    size: 1,
    height: 0.2,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 3,
  });
  titleText.center();
  const titleMaterial = new THREE.MeshBasicMaterial({ color: "#e32a00" });
  titleMesh = new THREE.Mesh(titleText, titleMaterial);
  titleMesh.position.y = 8;
  scene.add(titleMesh);

  const messageText = new TextGeometry("click the present! ", {
    font,
    size: 0.3,
    height: 0.1,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 3,
  });
  messageText.center();
  const messageMaterial = new THREE.MeshBasicMaterial({ color: "#016e0b" });
  titleMesh = new THREE.Mesh(messageText, messageMaterial);
  titleMesh.position.y = 7;
  scene.add(titleMesh);
});

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#476694", 0.8);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#ffd75e", 0.5);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door Light
const doorLight = new THREE.PointLight("#ff7d46", 1, 4);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  100,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 5;
camera.position.z = 10;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Music
 */
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// create a global audio source
const sound = new THREE.Audio(listener);

const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load("./music/auld_lang_syne.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
});

pauseButton.setAttribute("hidden", true);

pauseButton.addEventListener("click", (e) => {
  e.stopPropagation();
  sound.pause();
  playButton.removeAttribute("hidden");
  pauseButton.setAttribute("hidden", true);
});
playButton.addEventListener("click", (e) => {
  e.stopPropagation();
  sound.play();
  playButton.setAttribute("hidden", true);
  pauseButton.removeAttribute("hidden");
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#c1e2e3");

/**
 * Interaction Manager
 */
const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
);

// Present
let present;
const loader = new GLTFLoader();
loader.load(
  "./models/presentRound.glb",
  (asset) => {
    const obj = asset.scene;
    present = obj;
    obj.scale.set(4, 3, 4);
    obj.position.y = 5.5;
    obj.position.x = 0;
    obj.rotation.set(0, 3, 0);
    obj.castShadow = true;
    scene.add(obj);
    interactionManager.add(present);
    present.addEventListener("click", (event) => {
      event.stopPropagation();
      // if (sound.isPlaying) {
      // sound.pause();
      // playButton.removeAttribute("hidden");
      // pauseButton.setAttribute("hidden", true);
      // }
      alert("Check back on Christmas Eve!");
    });

    const presentLight = new THREE.PointLight("white", 3, 5);
    presentLight.position.set(-0.654, 6.786, 1.15);
    const presentLight2 = new THREE.PointLight("#f0c95d", 3, 5);
    presentLight2.position.set(2, 7, -1);
    gui.add(presentLight.position, "x").min(-5).max(5).step(0.001);
    gui.add(presentLight.position, "y").min(-5).max(20).step(0.001);
    gui.add(presentLight.position, "z").min(-5).max(10).step(0.001);
    scene.add(presentLight);
    scene.add(presentLight2);

    presentLight.shadow.mapSize.width = 256;
    presentLight.shadow.mapSize.height = 256;
    presentLight.shadow.camera.far = 7;
  },
  undefined,
  (error) => console.error(error)
);

// Wreath
let wreath;
loader.load(
  "./models/wreath.glb",
  (asset) => {
    const obj = asset.scene;
    wreath = obj;
    obj.scale.set(2, 2, 2);
    obj.position.y = 0.6;
    obj.position.x = 0;
    obj.rotation.set(0, 3, 0);
    obj.castShadow = true;
    obj.position.z = 2 + 0.1;
    scene.add(obj);
  },
  undefined,
  (error) => console.error(error)
);

const frontLightPosX = [-2, -1, 0, 1, 2];
// front christmas lights
let christmasLights;
frontLightPosX.forEach((x) => {
  loader.load(
    "./models/lightsMulti.glb",
    (asset) => {
      const obj = asset.scene;
      christmasLights = obj;
      obj.scale.set(1, 1, 1);
      obj.position.y = 3.15;
      obj.position.x = x;
      obj.rotation.set(0, 3, 0);
      obj.castShadow = true;
      obj.position.z = 2 + 0.4;
      scene.add(obj);
      // Light them up!
      const color = x % 2 === 0 ? "#e00000" : "#55ff42";
      const xmasLight = new THREE.PointLight(color, 1, 4);
      xmasLight.position.set(
        obj.position.x,
        obj.position.y + 0.3,
        obj.position.z
      );
      scene.add(xmasLight);
    },
    undefined,
    (error) => console.error(error)
  );
});

const backLightPosX = [-2, -1, 0, 1, 2];
// front christmas lights
backLightPosX.forEach((x) => {
  loader.load(
    "./models/lightsMulti.glb",
    (asset) => {
      const obj = asset.scene;
      obj.scale.set(1, 1, 1);
      obj.position.y = 3.15;
      obj.position.x = x;
      obj.rotation.set(0, 3, 0);
      obj.castShadow = true;
      obj.position.z = -2 - 0.4;
      scene.add(obj);
      // Light them up!
      const color = x % 2 === 0 ? "#e00000" : "#55ff42";
      const xmasLight = new THREE.PointLight(color, 1, 4);
      xmasLight.position.set(
        obj.position.x,
        obj.position.y + 0.3,
        obj.position.z
      );
      scene.add(xmasLight);
    },
    undefined,
    (error) => console.error(error)
  );
});

const sideLightPosZ = [-2, -1, 0, 1, 2];
// side 1 christmas lights
sideLightPosZ.forEach((z) => {
  loader.load(
    "./models/lightsMulti.glb",
    (asset) => {
      const obj = asset.scene;
      obj.scale.set(1, 1, 1);
      obj.position.y = 3.15;
      obj.position.x = 2.52;
      obj.rotation.set(0, 89.5, 0);
      obj.castShadow = true;
      obj.position.z = z;
      scene.add(obj);
      // Light them up!
      const color = z % 2 === 0 ? "#e00000" : "#55ff42";
      const xmasLight = new THREE.PointLight(color, 1, 4);
      xmasLight.position.set(
        obj.position.x + 0.4,
        obj.position.y + 0.3,
        obj.position.z
      );
      scene.add(xmasLight);
    },
    undefined,
    (error) => console.error(error)
  );
});

sideLightPosZ.forEach((z) => {
  loader.load(
    "./models/lightsMulti.glb",
    (asset) => {
      const obj = asset.scene;
      obj.scale.set(1, 1, 1);
      obj.position.y = 3.15;
      obj.position.x = -2.52;
      obj.rotation.set(0, 89.5, 0);
      obj.castShadow = true;
      obj.position.z = z;
      scene.add(obj);
      // Light them up!
      const color = z % 2 === 0 ? "#e00000" : "#55ff42";
      const xmasLight = new THREE.PointLight(color, 1, 4);
      xmasLight.position.set(
        obj.position.x - 0.4,
        obj.position.y + 0.3,
        obj.position.z
      );
      scene.add(xmasLight);
    },
    undefined,
    (error) => console.error(error)
  );
});

// candycanes
const candyCanePosX = [-1.2, 1.2];
candyCanePosX.forEach((x) => {
  const redCandyCanePosZ = [3, 5, 7];
  const rotationYValue = x < 0 ? 10 : 18;
  redCandyCanePosZ.forEach((z) => {
    loader.load(
      "./models/candyCane.glb",
      (asset) => {
        const obj = asset.scene;
        obj.scale.set(2, 5, 2);
        obj.position.y = 0;
        obj.position.x = x;
        obj.rotation.set(0, rotationYValue, 0);
        obj.castShadow = true;
        obj.position.z = z;
        scene.add(obj);
        // Light them up!
        const xmasLight = new THREE.PointLight("white", 1, 1);
        xmasLight.position.set(obj.position.x, obj.position.y, obj.position.z);
        scene.add(xmasLight);
      },
      undefined,
      (error) => console.error(error)
    );
  });

  const greenCandyCanePosZ = [4, 6];
  greenCandyCanePosZ.forEach((z) => {
    loader.load(
      "./models/candyCaneMint.glb",
      (asset) => {
        const obj = asset.scene;
        obj.scale.set(2, 5, 2);
        obj.position.y = 0;
        obj.position.x = x;
        obj.rotation.set(0, rotationYValue, 0);
        obj.castShadow = true;
        obj.position.z = z;
        scene.add(obj);
        // Light them up!
        const xmasLight = new THREE.PointLight("white", 1, 1);
        xmasLight.position.set(obj.position.x, obj.position.y, obj.position.z);
        scene.add(xmasLight);
      },
      undefined,
      (error) => console.error(error)
    );
  });
});

/**
 * Shadows
 */
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
moonLight.castShadow = true;
doorLight.castShadow = true;
light1.castShadow = true;
light2.castShadow = true;
light3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

light1.shadow.mapSize.width = 256;
light1.shadow.mapSize.height = 256;
light1.shadow.camera.far = 7;

light2.shadow.mapSize.width = 256;
light2.shadow.mapSize.height = 256;
light2.shadow.camera.far = 7;

light3.shadow.mapSize.width = 256;
light3.shadow.mapSize.height = 256;
light3.shadow.camera.far = 7;
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Lights
  const light1Angle = elapsedTime * 0.5;
  light1.position.x = Math.cos(light1Angle) * 4;
  light1.position.z = Math.sin(light1Angle) * 4;
  light1.position.y = Math.sin(elapsedTime * 3);

  const light2Angle = -elapsedTime * 0.32;
  light2.position.x = Math.cos(light2Angle) * 5;
  light2.position.z = Math.sin(light2Angle) * 5;
  light2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  const light3Angle = -elapsedTime * 0.18;
  light3.position.x =
    Math.cos(light3Angle) * (7 + Math.sin(elapsedTime * 0.32));
  light3.position.z = Math.sin(light3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  light3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object instanceof THREE.Points) {
      object.rotation.y = (elapsedTime * (i < 4 ? i + 1 : -(i + 1))) / 8;
    }
  }

  for (let i = 0; i < materials.length; i++) {
    const color = snowParams[i][0];
    const h = (360 * ((color[0] + elapsedTime) % 360)) / 360;
    materials[i].color.setHSL(h, color[1], color[2]);
  }

  const rotationSpeed = 0.002;

  var yAxis = new THREE.Vector3(0, 1, 0);
  var quaternion = new THREE.Quaternion();
  camera.position.applyQuaternion(
    quaternion.setFromAxisAngle(yAxis, rotationSpeed)
  );
  camera.up.applyQuaternion(quaternion.setFromAxisAngle(yAxis, rotationSpeed));

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
