(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggleFab');
  if (!btn) return;

  const saved = localStorage.getItem('theme');
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (preferredDark ? 'dark' : 'light');

  root.setAttribute('data-theme', theme);

  function paintIcon(currentTheme) {
    const isDark = currentTheme === 'dark';
    btn.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  paintIcon(theme);

  btn.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    paintIcon(next);
    if (typeof Cal !== 'undefined') {
      Cal('ui', { theme: next });
      if (Cal.ns) {
        Object.keys(Cal.ns).forEach((ns) => {
          if (Cal.ns[ns]) Cal.ns[ns]('ui', { theme: next });
        });
      }
    }
  });
})();

(function typewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const words = [
    'tinkerer',
    'minecrafter',
    'thinker',
    'problem solver',
    'developer',
    'learner',
    'youtuber',
    'tech enthusiast',
    'builder',
    'tinkerer'
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const word = words[wordIndex % words.length];
    const visible = word.slice(0, charIndex);
    el.textContent = visible;

    if (!deleting && charIndex < word.length) {
      charIndex += 1;
      return setTimeout(tick, 120);
    }

    if (!deleting && charIndex === word.length) {
      deleting = true;
      return setTimeout(tick, 900);
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      return setTimeout(tick, 60);
    }

    deleting = false;
    wordIndex += 1;
    setTimeout(tick, 220);
  }

  setTimeout(tick, 300);
})();

(function pixelField() {
  const canvas = document.getElementById('pixelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const orbs = [];
  const leaves = [];
  const pointer = { x: null, y: null };
  const ORB_BASE_FRAMES_8 = [
    ['00011000', '00132200', '01322310', '12222321', '12222321', '01322310', '00132200', '00011000'],
    ['00011000', '00133300', '01322310', '12222321', '12222321', '01322210', '00132200', '00011000'],
    ['00011000', '00132200', '01222310', '12222331', '12222321', '01322310', '00133300', '00011000'],
    ['00011000', '00132200', '01322210', '12222321', '12222331', '01322310', '00132200', '00011000'],
    ['00011000', '00132200', '01322310', '12222321', '13222321', '01322310', '00133300', '00011000'],
    ['00011000', '00133300', '01322310', '12222321', '12222321', '01322310', '00132200', '00011000']
  ];
  const ORB_FRAMES = ORB_BASE_FRAMES_8.map((frame) =>
    frame
      .map((row) => row.split('').map((ch) => ch + ch).join(''))
      .flatMap((row) => [row, row])
  );
  const LEAF_SPRITES_8 = [
    ['00023000', '00233200', '02333320', '23333332', '23333332', '02333320', '00233200', '00023000'],
    ['00032000', '00323300', '03233320', '23333332', '23333332', '02333320', '00233200', '00022000']
  ];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function seedOrbs() {
    orbs.length = 0;
    const count = 25;
    for (let i = 0; i < count; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 14 + Math.random() * 9,
        dx: (Math.random() - 0.5) * 0.9,
        dy: (Math.random() - 0.5) * 0.9,
        alpha: 0.65 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        wobble: 0.8 + Math.random() * 0.9,
        frameOffset: Math.floor(Math.random() * ORB_FRAMES.length)
      });
    }
  }

  function spawnLeaf() {
    leaves.push({
      x: Math.random() * canvas.width,
      y: -18 - Math.random() * 25,
      size: 12 + Math.random() * 8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: 0.35 + Math.random() * 0.55,
      swing: 1.1 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.65 + Math.random() * 0.25,
      variant: Math.floor(Math.random() * LEAF_SPRITES_8.length)
    });
  }

  function drawSprite(x, y, size, frame, palette, gridSize) {
    const pixel = Math.max(1, Math.round(size / gridSize));
    const spriteSize = pixel * gridSize;
    const left = Math.round(x - spriteSize / 2);
    const top = Math.round(y - spriteSize / 2);
    for (let row = 0; row < gridSize; row += 1) {
      const line = frame[row];
      for (let col = 0; col < gridSize; col += 1) {
        const key = line[col];
        if (key === '0') continue;
        ctx.fillStyle = palette[key] || palette['1'];
        ctx.fillRect(left + col * pixel, top + row * pixel, pixel, pixel);
      }
    }
  }

  function drawOrb(x, y, size, boost, alpha, t, frameOffset) {
    const pulse = 0.92 + 0.08 * Math.sin(t * 6.2 + size);
    const drawSize = Math.max(16, Math.round((size + boost * 2.1) * pulse));
    const hue = 95 + 18 * Math.sin(t * 2 + frameOffset);
    const frameIndex = (Math.floor(t * 8) + frameOffset) % ORB_FRAMES.length;
    const orbPalette = {
      '1': `hsla(${hue + 12}, 86%, ${26 + boost * 12}%, ${Math.min(1, alpha + 0.08)})`,
      '2': `hsla(${hue + 2}, 95%, ${47 + boost * 15}%, ${Math.min(1, alpha + 0.14)})`,
      '3': `hsla(${hue - 16}, 100%, ${66 + boost * 20}%, ${Math.min(1, alpha + 0.18)})`
    };
    drawSprite(x, y, drawSize, ORB_FRAMES[frameIndex], orbPalette, 16);
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    const t = (time || 0) / 1000;

    if (leaves.length < 24 && Math.random() < 0.008) {
      spawnLeaf();
    }

    for (let i = leaves.length - 1; i >= 0; i -= 1) {
      const l = leaves[i];
      l.x += l.vx + Math.sin(t * l.swing + l.phase) * 0.22;
      l.y += l.vy;

      if (l.y > canvas.height + 26 || l.x < -26 || l.x > canvas.width + 26) {
        leaves.splice(i, 1);
        continue;
      }

      const base = 38 + Math.sin(t * 1.2 + l.phase) * 5;
      const leafPalette = {
        '1': `hsla(105, 40%, ${base - 10}%, ${l.alpha})`,
        '2': `hsla(108, 44%, ${base}%, ${l.alpha})`,
        '3': `hsla(98, 46%, ${base + 8}%, ${l.alpha})`
      };
      drawSprite(l.x, l.y, l.size, LEAF_SPRITES_8[l.variant], leafPalette, 8);
    }

    orbs.forEach((p) => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      // pointer interaction
      let boost = 0;
      if (pointer.x !== null && pointer.y !== null) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          boost = (200 - dist) / 200;
          p.x += (dx / (dist || 1)) * 0.45;
          p.y += (dy / (dist || 1)) * 0.45;
        }
      }

      const bob = Math.sin(t * 2.2 + p.phase) * p.wobble;
      const px = p.x;
      const py = p.y + bob;
      const alpha = Math.min(1, p.alpha + boost * 0.35);

      const radius = p.size * 0.65 + boost * 2.4;
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius * 1.8);
      gradient.addColorStop(0, `rgba(178,255,64,${0.24 + boost * 0.2})`);
      gradient.addColorStop(1, 'rgba(56,180,32,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();

      drawOrb(px, py, p.size, boost, alpha, t, p.frameOffset);
    });

    requestAnimationFrame(draw);
  }

  resize();
  seedOrbs();
  draw();
  window.addEventListener('resize', () => {
    resize();
    seedOrbs();
    leaves.length = 0;
  });

  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  window.addEventListener('pointerleave', () => {
    pointer.x = null;
    pointer.y = null;
  });
})();

(function heroIcosa() {
  const ico = document.getElementById('heroIcosa');
  if (!ico) return;
  const CRAFTING_MODEL_URL = '/src/craftingtableminecraft3d.stl';
  const CRAFTING_COLOR_TEXTURES = {
    top: '/src/crafting_table_top.png',
    side: '/src/crafting_table_side.png',
    front: '/src/crafting_table_front.png'
  };
  const THREE_URL = 'https://unpkg.com/three@0.160.0/build/three.min.js';

  const failVisual = () => {
    ico.style.background = 'rgba(0, 0, 0, 0.12)';
    ico.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  };

  const loadScript = (src, readyCheck, onReady, onError) => {
    if (readyCheck()) return onReady();
    const s = document.createElement('script');
    s.src = src;
    s.onload = onReady;
    s.onerror = onError;
    document.head.appendChild(s);
  };

  loadScript(
    THREE_URL,
    () => !!window.THREE,
    initScene,
    failVisual
  );

  function initScene() {
    const width = ico.clientWidth || 140;
    const height = ico.clientHeight || 140;
    const canvasOverscan = 1.36;
    const drawWidth = Math.round(width * canvasOverscan);
    const drawHeight = Math.round(height * canvasOverscan);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, drawWidth / drawHeight, 0.1, 1000);
    camera.position.set(0, 14, 96);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(drawWidth, drawHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NoToneMapping;
    ico.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.62);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.86);
    keyLight.position.set(24, 46, 32);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-28, 14, -18);
    scene.add(ambient);
    scene.add(keyLight);
    scene.add(fillLight);

    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    const clamp01 = (n) => Math.min(1, Math.max(0, n));
    const quantize = (v, cells = 16) => {
      const clamped = clamp01(v);
      const cell = Math.min(cells - 1, Math.max(0, Math.floor(clamped * cells)));
      return (cell + 0.5) / cells;
    };
    const textureLoader = new THREE.TextureLoader();

    function configureNearestTexture(tex) {
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      return tex;
    }

    function loadNearestTexture(url) {
      return new Promise((resolve, reject) => {
        textureLoader.load(
          url,
          (tex) => resolve(configureNearestTexture(tex)),
          undefined,
          () => reject(new Error(`tex-load:${url}`))
        );
      });
    }

    const textureMapsPromise = Promise.all([
      loadNearestTexture(CRAFTING_COLOR_TEXTURES.top),
      loadNearestTexture(CRAFTING_COLOR_TEXTURES.side),
      loadNearestTexture(CRAFTING_COLOR_TEXTURES.front)
    ]).then(([top, side, front]) => ({ top, side, front }));

    function buildCraftingMappedGeometry(rawGeometry) {
      const geometry = rawGeometry.index ? rawGeometry.toNonIndexed() : rawGeometry.clone();
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (!box) return geometry;

      const dx = (box.max.x - box.min.x) || 1;
      const dy = (box.max.y - box.min.y) || 1;
      const dz = (box.max.z - box.min.z) || 1;
      const pos = geometry.getAttribute('position');
      if (!pos || (pos.count % 3) !== 0) return geometry;

      const uv = new Float32Array(pos.count * 2);
      geometry.clearGroups();

      function setUv(idx, u, v) {
        uv[idx * 2] = quantize(u);
        uv[(idx * 2) + 1] = quantize(v);
      }

      for (let i = 0; i < pos.count; i += 3) {
        const x0 = pos.getX(i);
        const y0 = pos.getY(i);
        const z0 = pos.getZ(i);
        const x1 = pos.getX(i + 1);
        const y1 = pos.getY(i + 1);
        const z1 = pos.getZ(i + 1);
        const x2 = pos.getX(i + 2);
        const y2 = pos.getY(i + 2);
        const z2 = pos.getZ(i + 2);

        const e1x = x1 - x0;
        const e1y = y1 - y0;
        const e1z = z1 - z0;
        const e2x = x2 - x0;
        const e2y = y2 - y0;
        const e2z = z2 - z0;
        let nx = (e1y * e2z) - (e1z * e2y);
        let ny = (e1z * e2x) - (e1x * e2z);
        let nz = (e1x * e2y) - (e1y * e2x);
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;

        const ax = Math.abs(nx);
        const ay = Math.abs(ny);
        const az = Math.abs(nz);
        let materialIndex = 1;
        let planeMode = 'side-y';
        if (az >= ax && az >= ay) {
          materialIndex = nz >= 0 ? 0 : 3;
          planeMode = 'top';
        } else if (ax >= ay) {
          materialIndex = nx >= 0 ? 2 : 1;
          planeMode = 'side-x';
        }

        const coords = [
          [x0, y0, z0],
          [x1, y1, z1],
          [x2, y2, z2]
        ];
        for (let j = 0; j < 3; j += 1) {
          const [x, y, z] = coords[j];
          let u = 0;
          let v = 0;
          if (planeMode === 'top') {
            u = (x - box.min.x) / dx;
            v = (y - box.min.y) / dy;
          } else if (planeMode === 'side-x') {
            u = (y - box.min.y) / dy;
            v = (z - box.min.z) / dz;
          } else {
            u = (x - box.min.x) / dx;
            v = (z - box.min.z) / dz;
          }
          setUv(i + j, u, v);
        }
        geometry.addGroup(i, 3, materialIndex);
      }

      geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geometry.computeVertexNormals();
      return geometry;
    }

    function setModelGeometry(rawGeometry, textures) {
      const geometry = buildCraftingMappedGeometry(rawGeometry);
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.center();

      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 31;
      const scale = targetSize / maxDim;

      const topMat = new THREE.MeshLambertMaterial({ map: textures.top, color: 0xffffff });
      const sideMat = new THREE.MeshLambertMaterial({ map: textures.side, color: 0xffffff });
      const frontMat = new THREE.MeshLambertMaterial({ map: textures.front, color: 0xffffff });
      const bottomMat = new THREE.MeshLambertMaterial({ map: textures.side, color: 0x8e7a5c });
      const mesh = new THREE.Mesh(geometry, [topMat, sideMat, frontMat, bottomMat]);

      // Most printable STLs are Z-up; rotate into Three.js Y-up.
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.setScalar(scale);
      modelRoot.clear();
      modelRoot.add(mesh);
    }

    function setFallbackModel() {
      const geometry = new THREE.BoxGeometry(34, 34, 34);
      const material = new THREE.MeshStandardMaterial({
        color: 0xbd9667,
        roughness: 0.84,
        metalness: 0.02,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      modelRoot.clear();
      modelRoot.add(mesh);
    }

    function parseBinaryStl(arrayBuffer) {
      if (arrayBuffer.byteLength < 84) return null;
      const dv = new DataView(arrayBuffer);
      const faceCount = dv.getUint32(80, true);
      const expected = 84 + (faceCount * 50);
      if (expected > arrayBuffer.byteLength || faceCount === 0) return null;

      const vertices = new Float32Array(faceCount * 9);
      let offset = 84;
      let idx = 0;
      for (let i = 0; i < faceCount; i += 1) {
        offset += 12; // normal
        for (let v = 0; v < 3; v += 1) {
          vertices[idx] = dv.getFloat32(offset, true);
          vertices[idx + 1] = dv.getFloat32(offset + 4, true);
          vertices[idx + 2] = dv.getFloat32(offset + 8, true);
          idx += 3;
          offset += 12;
        }
        offset += 2; // attribute byte count
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      return geometry;
    }

    function parseAsciiStl(text) {
      const vertexPattern = /vertex\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
      const vertices = [];
      let match = null;
      while ((match = vertexPattern.exec(text)) !== null) {
        vertices.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
      }
      if (vertices.length < 9 || (vertices.length % 9) !== 0) return null;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      return geometry;
    }

    function parseStl(arrayBuffer) {
      const headBytes = new Uint8Array(arrayBuffer, 0, Math.min(arrayBuffer.byteLength, 256));
      const header = new TextDecoder('ascii').decode(headBytes).trimStart().toLowerCase();
      const looksAscii = header.startsWith('solid');

      if (looksAscii) {
        const ascii = new TextDecoder().decode(arrayBuffer);
        const asciiGeom = parseAsciiStl(ascii);
        if (asciiGeom) return asciiGeom;
      }

      const binaryGeom = parseBinaryStl(arrayBuffer);
      if (binaryGeom) return binaryGeom;

      if (!looksAscii) {
        const ascii = new TextDecoder().decode(arrayBuffer);
        return parseAsciiStl(ascii);
      }

      return null;
    }

    fetch(CRAFTING_MODEL_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`stl http ${res.status}`);
        return res.arrayBuffer();
      })
      .then((buf) => {
        const geometry = parseStl(buf);
        if (!geometry) throw new Error('stl parse failed');
        return textureMapsPromise.then((textures) => ({ geometry, textures }));
      })
      .then(({ geometry, textures }) => {
        setModelGeometry(geometry, textures);
      })
      .catch(() => {
        setFallbackModel();
      });

    let pulseEnergy = 0;
    let baseScale = 1;
    let smoothScale = 1;
    let tiltX = 0.11;
    let rotY = 0;
    let velX = 0;
    let velY = 0.007;
    let pointerYaw = 0;
    let pointerPitch = 0;
    let pointerInside = false;
    let lastMoveAt = 0;

    function animate() {
      const now = performance.now();
      const pointerDriving = pointerInside && (now - lastMoveAt) < 230;

      pointerYaw *= 0.9;
      pointerPitch *= 0.9;

      const targetVelY = pointerDriving ? pointerYaw : 0.007;
      const targetVelX = pointerDriving ? pointerPitch : 0;
      velY += (targetVelY - velY) * (pointerDriving ? 0.42 : 0.06);
      velX += (targetVelX - velX) * (pointerDriving ? 0.37 : 0.1);

      tiltX = Math.max(-0.35, Math.min(0.35, tiltX + velX));
      rotY += velY;

      if (pulseEnergy > 0) {
        pulseEnergy *= 0.89;
        if (pulseEnergy < 0.02) pulseEnergy = 0;
      }

      const pulseScale = 1 + pulseEnergy * 0.055;
      const targetScale = baseScale * pulseScale;
      smoothScale += (targetScale - smoothScale) * 0.2;
      modelRoot.scale.setScalar(smoothScale);
      modelRoot.rotation.set(tiltX, rotY, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    function resize() {
      const w = ico.clientWidth || width;
      const h = ico.clientHeight || height;
      const dw = Math.round(w * canvasOverscan);
      const dh = Math.round(h * canvasOverscan);
      camera.aspect = dw / dh;
      camera.updateProjectionMatrix();
      renderer.setSize(dw, dh);
    }
    window.addEventListener('resize', resize);

    ico.addEventListener('pointerenter', () => {
      pointerInside = true;
      baseScale = 1.06;
    });
    ico.addEventListener('pointermove', (e) => {
      lastMoveAt = performance.now();
      const dx = Math.max(-16, Math.min(16, e.movementX || 0));
      const dy = Math.max(-16, Math.min(16, e.movementY || 0));
      pointerYaw = Math.max(-0.072, Math.min(0.072, dx * 0.00345));
      pointerPitch = Math.max(-0.045, Math.min(0.045, dy * 0.0027));
    });
    ico.addEventListener('pointerleave', () => {
      pointerInside = false;
      baseScale = 1;
      pointerYaw *= 0.45;
      pointerPitch *= 0.45;
    });
    ico.addEventListener('click', () => {
      pulseEnergy = 1;
      ico.classList.remove('rippling');
      ico.classList.remove('pulse');
      void ico.offsetWidth;
      ico.classList.add('rippling');
      ico.classList.add('pulse');
    });
  }
})();

(function calModal() {
  const btn = document.getElementById('bookCallBtn');
  const modal = document.getElementById('cal-modal');
  if (!btn || !modal) return;

  const closeBtn = modal.querySelector('.cal-close');
  const backdrop = modal.querySelector('.cal-modal-backdrop');
  const root = document.documentElement;
  const embedSelector = '#cal-embed';
  const embedRoot = modal.querySelector(embedSelector);
  if (!embedRoot) return;

  const CAL_NS = 'keshav-inline';
  const CAL_LINK = 'keshavpillarisetti/30min';
  const CAL_ORIGIN = 'https://cal.com';

  let loaderPromise = null;
  let calInitialized = false;
  let inlineMounted = false;
  let watchdogTimer = null;
  let loadingHintTimer = null;

  function setStatus(message, isError = false) {
    let status = modal.querySelector('.cal-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'cal-status';
      embedRoot.insertAdjacentElement('afterend', status);
    }
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'loading';
    if (!isError) {
      status.classList.remove('error');
    } else {
      status.classList.add('error');
    }
  }

  function clearStatus() {
    const status = modal.querySelector('.cal-status');
    if (status) status.remove();
  }

  function getCalApi() {
    if (typeof Cal !== 'undefined' && Cal.ns && Cal.ns[CAL_NS]) return Cal.ns[CAL_NS];
    return (typeof Cal !== 'undefined') ? Cal : null;
  }

  function ensureLoader() {
    if (typeof Cal !== 'undefined' && Cal.ns) return Promise.resolve();
    if (loaderPromise) return loaderPromise;

    loaderPromise = new Promise((resolve, reject) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      const fail = () => {
        if (settled) return;
        settled = true;
        reject(new Error('cal-loader-failed'));
      };

      (function (C, A, L) {
        const d = C.document;
        const p = function (a, ar) { a.q.push(ar); };
        C.Cal = C.Cal || function () {
          const cal = C.Cal;
          const ar = arguments;
          if (!cal.loaded) {
            cal.ns = cal.ns || {};
            cal.q = cal.q || [];
            const s = d.createElement('script');
            s.src = A;
            s.async = 1;
            s.onload = done;
            s.onerror = fail;
            d.head.appendChild(s);
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () { p(api, arguments); };
            const ns = ar[1];
            api.q = api.q || [];
            if (typeof ns === 'string') {
              cal.ns[ns] = cal.ns[ns] || api;
              p(cal.ns[ns], ar);
              p(cal, ['initNamespace', ns]);
            } else {
              p(cal, ar);
            }
            return;
          }
          p(cal, ar);
        };
      })(window, 'https://app.cal.com/embed/embed.js', 'init');

      const checkReady = setInterval(() => {
        if (typeof Cal !== 'undefined' && Cal.ns) {
          clearInterval(checkReady);
          done();
        }
      }, 40);

      setTimeout(() => {
        clearInterval(checkReady);
        fail();
      }, 10000);
    });

    return loaderPromise;
  }

  function syncTheme() {
    const api = getCalApi();
    if (api) {
      api('ui', {
        styles: { branding: { brandColor: '#2563eb' } },
        hideEventTypeDetails: false,
        theme: root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
      });
    }
  }

  function mountInline() {
    clearStatus();
    clearTimeout(loadingHintTimer);
    loadingHintTimer = setTimeout(() => {
      setStatus('loading calendar...');
    }, 1100);

    ensureLoader()
      .then(() => {
        if (!calInitialized) {
          Cal('init', CAL_NS, { origin: CAL_ORIGIN });
          calInitialized = true;

          const api = getCalApi();
          if (api) {
            api('on', {
              action: 'linkReady',
              callback: () => {
                clearTimeout(loadingHintTimer);
                clearStatus();
              }
            });

            api('on', {
              action: 'linkFailed',
              callback: (event) => {
                const code = event?.detail?.data?.code || 'unknown';
                setStatus(`calendar failed to load (code: ${code}).`, true);
              }
            });
          }
        }

        const api = getCalApi();
        if (!api) throw new Error('cal-api-missing');

        if (!inlineMounted) {
          api('inline', {
            elementOrSelector: embedSelector,
            calLink: CAL_LINK,
            config: { layout: 'month_view' }
          });
          inlineMounted = true;
        }

        syncTheme();
        clearTimeout(watchdogTimer);
        watchdogTimer = setTimeout(() => {
          const hasIframe = !!embedRoot.querySelector('iframe');
          if (!hasIframe) {
            setStatus('calendar is taking too long to load. check adblock/privacy settings.', true);
          }
        }, 9000);
      })
      .catch(() => {
        clearTimeout(loadingHintTimer);
        setStatus('could not load cal embed script. try reloading the page.', true);
      });
  }

  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.classList.add('modal-open');
    mountInline();
    setTimeout(syncTheme, 300);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    clearTimeout(watchdogTimer);
    clearTimeout(loadingHintTimer);
  }

  btn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
