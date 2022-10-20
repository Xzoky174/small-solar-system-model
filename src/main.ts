import "./style.css";

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  SphereGeometry,
  AmbientLight,
  TextureLoader,
  MeshBasicMaterial,
  RingGeometry,
  DoubleSide,
  MathUtils,
  MeshPhongMaterial,
  Raycaster,
  Vector2,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let width = window.innerWidth,
  height = window.innerHeight;

const scene = new Scene();
const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new WebGLRenderer({
  canvas: document.querySelector("#bg") as HTMLCanvasElement,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

camera.position.setZ(150);
camera.position.setY(80);

const ambient = new AmbientLight(0xffffff);
scene.add(ambient);

let distance = 89;

const earthMoonOrbit = new Mesh(
  new RingGeometry(distance - 40, distance - 41, 100),
  new MeshPhongMaterial({
    color: 0xffffff,
    side: DoubleSide,
  })
);
earthMoonOrbit.rotation.x = 300;
earthMoonOrbit.position.x = distance;

const earthSunOrbit = new Mesh(
  new RingGeometry(distance + 1, distance, 100),
  new MeshPhongMaterial({
    color: 0xffffff,
    side: DoubleSide,
  })
);
earthSunOrbit.rotation.x = 300;

const sun = new Mesh(
  new SphereGeometry(30, 100, 100),
  new MeshPhongMaterial({
    map: new TextureLoader().load("img/sun.jpg"),
  })
);

const earth = new Mesh(
  new SphereGeometry(20, 100, 100),
  new MeshPhongMaterial({
    map: new TextureLoader().load("img/earth.jpg"),
  })
);

const moon = new Mesh(
  new SphereGeometry(10, 100, 100),
  new MeshPhongMaterial({
    map: new TextureLoader().load("img/moon.jpg"),
  })
);

sun.add(earth);
earth.add(moon);

scene.add(earthSunOrbit, earthMoonOrbit);
scene.add(sun);

function addStar() {
  const star = new Mesh(
    new SphereGeometry(0.25, 24, 24),
    new MeshBasicMaterial({
      color: 0xffffff,
    })
  );

  const [x, y, z] = Array(3)
    .fill(0)
    .map(() => MathUtils.randFloatSpread(400));

  star.position.set(x, y, z);
  scene.add(star);
}
Array(200).fill(0).forEach(addStar);

const controls = new OrbitControls(camera, renderer.domElement);

const raycaster = new Raycaster();
const pointer = new Vector2();

const facts = {
  Sun: "Big AF",
  Earth: "Big",
  Moon: "Meh",
};

window.onresize = () => {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
};

window.onpointermove = (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children);

  document.body.style.cursor = "default";

  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";

    const intersect = intersects[0];

    let t: "Sun" | "Moon" | "Earth" | "" = "";
    switch (intersect.object.uuid) {
      case sun.uuid:
        t = "Sun";
        break;
      case moon.uuid:
        t = "Moon";
        break;
      case earth.uuid:
        t = "Earth";
        break;
    }

    if (t) {
      document.querySelector("#current")!.innerHTML = `${t}: ${facts[t]}`;
    }
  }
};

function animate() {
  requestAnimationFrame(animate);

  earth.position.set(0, 0, 0);
  earth.rotateY(0.002);
  earth.translateX(distance);

  moon.position.set(0, 0, 0);
  moon.rotateY(0.001);
  moon.translateX(distance - 41);

  earthMoonOrbit.position.setX(earth.position.x);
  earthMoonOrbit.position.setZ(earth.position.z);

  controls.update();

  renderer.render(scene, camera);
}
animate();
