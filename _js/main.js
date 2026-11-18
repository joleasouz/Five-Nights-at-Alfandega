import * as THREE from 'three';

const tela = '_img/Panoramica.png';
const angulo = 140;     
const area_da_borda = 0.25;    
const velocidade_max = 0.7;
const suavidade = 20; 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.rotation.order = 'YXZ';

let arco = THREE.MathUtils.degToRad(angulo);
let limiteYaw = 0;

new THREE.TextureLoader().load(tela, (textura) => {
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const proporcao = textura.image.width / textura.image.height;
  const R = 10;
  const largura = R * arco;
  const altura = largura / proporcao;

  const geo = new THREE.CylinderGeometry(R, R, altura, 96, 1, true, Math.PI - arco / 2, arco);
  geo.scale(-1, 1, 1);
  const mat = new THREE.MeshBasicMaterial({ map: textura });
  scene.add(new THREE.Mesh(geo, mat));

  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(altura / 2 / R));
  ajustar();
});

function ajustar() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
  limiteYaw = Math.max(0, (arco - fovH) / 2);
}
window.addEventListener('resize', ajustar);

let mouseX = 0.5;
window.addEventListener('mousemove', (e) => { mouseX = e.clientX / window.innerWidth; });
window.addEventListener('mouseleave', () => { mouseX = 0.5; });

let yaw = 0;
let velocidade = 0;
const relogio = new THREE.Clock();

function velocidadeAlvo() {
  if (mouseX < area_da_borda) return ((area_da_borda - mouseX) / area_da_borda) * velocidade_max;
  if (mouseX > 1 - area_da_borda) return -((mouseX - (1 - area_da_borda)) / area_da_borda) * velocidade_max;
  return 0;
}

function loop() {
  const dt = Math.min(relogio.getDelta(), 0.05);
  velocidade += (velocidadeAlvo() - velocidade) * Math.min(1, suavidade * dt);
  yaw = THREE.MathUtils.clamp(yaw + velocidade * dt, -limiteYaw, limiteYaw);
  camera.rotation.y = yaw;
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();