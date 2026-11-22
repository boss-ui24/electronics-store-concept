/* 3D-телефон в первом экране: модель из проекта zrish (процедурная, без файлов моделей).
   Рендер только по требованию: кадры идут, пока телефон крутится, потом цикл останавливается.
   Рендерер один на страницу — при перерисовке витрины холст просто переносится в новый блок. */
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { buildPhone } from './zrish/phone.js';

const B = window.BOSS;
const PI = Math.PI;
const FINISHES = [
  { name: 'Frost', glass: '#e8e7e3', plateau: '#e0dfdb', frame: '#cfcfcb', ring: '#dcdcd8', bgHi: '#f3f4f6', bgMid: '#4a4d53', bgLo: '#0c0d0f', accent: '#ffffff', glow: '#d3e2ff' },
  { name: 'Glacier', glass: '#9eacbf', plateau: '#94a3b8', frame: '#8495ab', ring: '#97a7bb', bgHi: '#a9cbff', bgMid: '#2d5aa6', bgLo: '#0b1934', accent: '#bcd8ff', glow: '#3f8cff' },
  { name: 'Rosé', glass: '#e3c9c2', plateau: '#dcc0b8', frame: '#c9a197', ring: '#d6b0a6', bgHi: '#f7b3c8', bgMid: '#c35a7c', bgLo: '#3b1123', accent: '#ffc3d5', glow: '#ff5c8e' },
  { name: 'Obsidian', glass: '#38393c', plateau: '#2f3033', frame: '#46474a', ring: '#505154', bgHi: '#ff9b63', bgMid: '#3b1f15', bgLo: '#0b0605', accent: '#ffab73', glow: '#ff5a1f' },
];

let ctx = null;

function init() {
  const canvas = document.createElement('canvas');
  canvas.className = 'stage-gl';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.2, 40);
  camera.position.set(0, 0, 4.9);

  // студийное окружение: купол + «софтбоксы», запекается в PMREM один раз на отделку
  const env = new THREE.Scene();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(20, 48, 24), new THREE.MeshBasicMaterial({ color: 0x1a1c20, side: THREE.BackSide }));
  env.add(dome);
  const box = (w, h, k, x, y, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); return m;
  };
  box(10, 4, 2.4, 0, 8, 1.5); box(1.3, 10, 3.6, -7.5, 1, 2.5); box(1.1, 10, 2.6, 7.5, 0.5, -2);
  box(4.5, 5.5, 1.7, -3.6, 2.4, 7); box(0.9, 7, 2.2, 5.2, -1, 6.2); box(0.5, 0.5, 14, 1.6, 3.2, 6.5);
  const rimBox = box(1, 9, 1, 4.2, 1, -7);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null;

  RectAreaLightUniformsLib.init();
  const keyRect = new THREE.RectAreaLight(0xffffff, 7, 2.4, 3.4); keyRect.position.set(-2.6, 2.4, 5.2); keyRect.lookAt(0, 0, 0);
  const strip = new THREE.RectAreaLight(0xffffff, 10, 0.5, 4.5); strip.position.set(3.4, 0.4, 3.2); strip.lookAt(0, 0, 0);
  const rim = new THREE.DirectionalLight(0xffffff, 2); rim.position.set(4, 2, -4);
  const key = new THREE.DirectionalLight(0xffffff, 0.5); key.position.set(-3, 4, 5);
  scene.add(keyRect, strip, rim, key);

  const phone = buildPhone();
  phone.group.scale.setScalar(0.01);
  const holder = new THREE.Group();
  holder.add(phone.group);
  scene.add(holder);
  phone.setScreen(1, 0);

  const C = (h) => new THREE.Color(h);
  function setFinish(i) {
    const f = FINISHES[i];
    phone.setFinish({ glass: C(f.glass), plateau: C(f.plateau), frame: C(f.frame), ring: C(f.ring) });
    phone.redraw(f);
    rimBox.material.color.copy(C(f.glow)).multiplyScalar(2.6);
    dome.material.color.copy(C(f.bgMid)).multiplyScalar(0.15);
    const rt = pmrem.fromScene(env, 0.02, 0.1, 60);
    if (envRT) envRT.dispose();
    envRT = rt; scene.environment = rt.texture;
  }

  // вращение: угол, скорость, перетаскивание
  const st = { ry: -2.6, rx: 0.08, vy: 0, tx: 0.08, drag: false, lx: 0, ly: 0, intro: performance.now(), raf: 0, fi: 0 };
  const REST = 0.42;

  function size() {
    const host = canvas.parentElement; if (!host) return;
    const w = host.clientWidth || 360, h = host.clientHeight || 440;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.75 ? 4.9 / (w / h / 0.75) : 4.9;
    camera.updateProjectionMatrix();
  }

  function frame(now) {
    st.raf = 0;
    let moving = false;
    const k = Math.min(1, (now - st.intro) / 1800);
    if (k < 1) {
      const e = 1 - Math.pow(1 - k, 3);
      st.ry = -2.6 + (REST + 2.6) * e;
      moving = true;
    } else if (!st.drag) {
      st.ry += st.vy;
      st.vy *= 0.94;
      if (Math.abs(st.vy) > 0.0005) moving = true;
    }
    st.rx += (st.tx - st.rx) * 0.15;
    if (Math.abs(st.tx - st.rx) > 0.001) moving = true;
    holder.rotation.set(st.rx, st.ry, 0);
    holder.position.y = Math.sin(st.ry * 0.5) * 0.02;
    // экран светится, когда телефон смотрит на зрителя
    const face = Math.max(0, Math.cos(st.ry));
    phone.setScreen(0.25 + 0.75 * face, 0);
    renderer.render(scene, camera);
    if (moving || st.drag) kick();
  }
  const kick = () => { if (!st.raf) st.raf = requestAnimationFrame(frame); };

  canvas.addEventListener('pointerdown', (e) => {
    st.drag = true; st.intro = -1e9; st.lx = e.clientX; st.ly = e.clientY; st.vy = 0;
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('grab'); kick();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!st.drag) return;
    const dx = e.clientX - st.lx, dy = e.clientY - st.ly;
    st.lx = e.clientX; st.ly = e.clientY;
    st.vy = dx * 0.012; st.ry += st.vy;
    st.tx = Math.max(-0.5, Math.min(0.5, st.tx + dy * 0.006));
    kick();
  });
  const up = () => { if (!st.drag) return; st.drag = false; canvas.classList.remove('grab'); st.tx = 0.08; kick(); };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  addEventListener('resize', () => { size(); kick(); });

  setFinish(0);
  return { canvas, size, kick, setFinish, st };
}

B.mount3d = (stage, sw) => {
  if (!stage) return;
  try { if (!ctx) ctx = init(); } catch (e) { console.warn('3D off:', e); return; }
  stage.prepend(ctx.canvas);
  stage.classList.add('has-gl');
  ctx.size();
  ctx.kick();
  if (sw) {
    sw.innerHTML = FINISHES.map((f, i) => `<button data-f="${i}" class="${i === ctx.st.fi ? 'on' : ''}" style="--c:${f.glass}" title="${f.name}"></button>`).join('');
    sw.onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      ctx.st.fi = +b.dataset.f; ctx.setFinish(ctx.st.fi);
      [...sw.children].forEach((x) => x.classList.toggle('on', x === b));
      ctx.st.vy = 0.12; ctx.kick();
    };
  }
};
B.unmount3d = () => { if (ctx && ctx.canvas.parentElement) ctx.canvas.remove(); };

// модуль грузится позже первой отрисовки — если главная уже на экране, подключаемся сразу
const stage = document.getElementById('stage');
if (stage) B.mount3d(stage, document.getElementById('sw'));
