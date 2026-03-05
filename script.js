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
    'builder'
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
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const getMotionProfile = () => {
    const mobile = window.innerWidth <= 768;
    return {
      orbCount: mobile ? 18 : 25,
      leafMax: mobile ? 12 : 24,
      leafSpawnChance: mobile ? 0.0045 : 0.008,
      orbDrift: mobile ? 0.72 : 0.9
    };
  };
  let motion = getMotionProfile();
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
    const count = motion.orbCount;
    for (let i = 0; i < count; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 14 + Math.random() * 9,
        dx: (Math.random() - 0.5) * motion.orbDrift,
        dy: (Math.random() - 0.5) * motion.orbDrift,
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

    if (leaves.length < motion.leafMax && Math.random() < motion.leafSpawnChance) {
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
    motion = getMotionProfile();
    seedOrbs();
    leaves.length = 0;
  });

  window.addEventListener('pointermove', (e) => {
    if (!hasFinePointer) return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  window.addEventListener('pointerleave', () => {
    pointer.x = null;
    pointer.y = null;
  });
})();

(function heroCraftingSprite() {
  const ico = document.getElementById('heroIcosa');
  if (!ico) return;

  ico.textContent = '';
  const sprite = document.createElement('img');
  sprite.className = 'hero-crafting-sprite';
  sprite.src = '/src/crafting_table_front.png';
  sprite.alt = '';
  sprite.draggable = false;
  sprite.setAttribute('aria-hidden', 'true');
  ico.appendChild(sprite);

  let pointerInside = false;
  let targetX = 0;
  let targetY = 0;
  let targetRot = 0;
  let targetScale = 1;

  let smoothX = 0;
  let smoothY = 0;
  let smoothRot = 0;
  let smoothScale = 1;

  let pulseEnergy = 0;
  let idlePhase = Math.random() * Math.PI * 2;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function updatePointerTarget(clientX, clientY) {
    const rect = ico.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;
    const x = clamp(nx, -1, 1);
    const y = clamp(ny, -1, 1);

    targetX = x * 16;
    targetY = y * 12;
    targetRot = x * 11;
  }

  function onPointerMove(e) {
    if (!pointerInside) return;
    updatePointerTarget(e.clientX, e.clientY);
  }

  ico.addEventListener('pointerenter', (e) => {
    pointerInside = true;
    targetScale = 1.1;
    updatePointerTarget(e.clientX, e.clientY);
  });

  ico.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  ico.addEventListener('pointerleave', () => {
    pointerInside = false;
    targetX = 0;
    targetY = 0;
    targetRot = 0;
    targetScale = 1;
  });

  ico.addEventListener('pointerdown', (e) => {
    targetScale = 1.06;
    updatePointerTarget(e.clientX, e.clientY);
  });

  const onPointerRelease = () => {
    targetScale = pointerInside ? 1.1 : 1;
  };
  ico.addEventListener('pointerup', onPointerRelease);
  ico.addEventListener('pointercancel', onPointerRelease);

  ico.addEventListener('click', () => {
    pulseEnergy = 1;
    ico.classList.remove('rippling');
    ico.classList.remove('pulse');
    void ico.offsetWidth;
    ico.classList.add('rippling');
    ico.classList.add('pulse');
  });

  function animate() {
    idlePhase += 0.022;
    const idleX = Math.sin(idlePhase * 0.78) * 1.7;
    const idleY = Math.sin(idlePhase * 1.06) * 1.15;
    const idleRot = Math.sin(idlePhase * 0.56) * 1.5;

    if (pulseEnergy > 0) {
      pulseEnergy *= 0.88;
      if (pulseEnergy < 0.01) pulseEnergy = 0;
    }

    const follow = pointerInside ? 0.38 : 0.16;
    smoothX += ((targetX + idleX) - smoothX) * follow;
    smoothY += ((targetY + idleY) - smoothY) * follow;
    smoothRot += ((targetRot + idleRot) - smoothRot) * follow;

    const pulseScale = 1 + (pulseEnergy * 0.07);
    smoothScale += (((targetScale * pulseScale) - smoothScale) * 0.24);

    sprite.style.transform = `translate3d(${smoothX.toFixed(2)}px, ${smoothY.toFixed(2)}px, 0) rotate(${smoothRot.toFixed(2)}deg) scale(${smoothScale.toFixed(3)})`;
    requestAnimationFrame(animate);
  }

  animate();
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
