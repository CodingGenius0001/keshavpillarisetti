(function () {
  const root = document.documentElement;
  root.setAttribute('data-theme', 'dark');
})();

(function mobileTopNav() {
  const topbar = document.querySelector('.topbar');
  const toggle = document.getElementById('navMenuToggle');
  const nav = document.getElementById('topNavLinks');
  if (!topbar || !toggle || !nav) return;

  const mobileQuery = window.matchMedia('(max-width: 640px)');

  function closeMenu() {
    topbar.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    topbar.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', () => {
    if (topbar.classList.contains('menu-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!mobileQuery.matches) return;
    if (topbar.contains(e.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  function handleViewportChange() {
    if (!mobileQuery.matches) closeMenu();
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }
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
      orbCount: mobile ? 5 : 10,
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
  const leafTextures = [];
  const tintedLeafTextures = [];

  function buildTintedLeaf(img) {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return null;
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const octx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!octx) return null;
    octx.imageSmoothingEnabled = false;
    octx.drawImage(img, 0, 0, width, height);
    const imageData = octx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (!alpha) continue;
      const luma = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      data[i] = Math.round(68 + luma * 104);
      data[i + 1] = Math.round(148 + luma * 102);
      data[i + 2] = Math.round(52 + luma * 70);
      data[i + 3] = Math.min(255, Math.round(alpha * 0.95));
    }
    octx.putImageData(imageData, 0, 0);
    return offscreen;
  }

  for (let i = 0; i < 12; i += 1) {
    const img = new Image();
    img.onload = () => {
      tintedLeafTextures[i] = buildTintedLeaf(img);
    };
    img.src = `/src/cherry_${i}.png`;
    leafTextures.push(img);
    tintedLeafTextures.push(null);
  }

  const orbImg = new Image();
  orbImg.src = '/src/experienceorb.png';

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
      size: 10 + Math.random() * 7,
      vx: (Math.random() - 0.5) * 0.25,
      vy: 0.35 + Math.random() * 0.55,
      swing: 1.1 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.72 + Math.random() * 0.2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.045,
      variant: Math.floor(Math.random() * leafTextures.length)
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

  function drawLeaf(x, y, size, alpha, angle, variant) {
    const tex = tintedLeafTextures[variant] || leafTextures[variant] || leafTextures[0];
    const texWidth = tex ? tex.naturalWidth || tex.width : 0;
    if (!tex || !texWidth) return;
    const drawSize = Math.max(10, Math.round(size));
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    const left = Math.round(-drawSize / 2);
    const top = Math.round(-drawSize / 2);
    ctx.drawImage(tex, left, top, drawSize, drawSize);
    ctx.restore();
    ctx.globalAlpha = 1;
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
      l.angle += l.spin;

      if (l.y > canvas.height + 26 || l.x < -26 || l.x > canvas.width + 26) {
        leaves.splice(i, 1);
        continue;
      }

      drawLeaf(l.x, l.y, l.size, l.alpha, l.angle, l.variant);
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

      // Orb sprite — no glow, drawn bright
      if (orbImg.complete && (orbImg.naturalWidth || orbImg.width)) {
        const sz = Math.max(12, Math.round(p.size * 2.2 + boost * 6));
        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha + 0.25);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(orbImg, Math.round(px - sz * 0.5), Math.round(py - sz * 0.5), sz, sz);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
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

(function heroEnchantingTable() {
  const ico = document.getElementById('heroIcosa');
  if (!ico) return;

  const img = document.createElement('img');
  img.src = '/src/Enchanting_Table.gif';
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  img.draggable = false;
  ico.textContent = '';
  ico.appendChild(img);
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
