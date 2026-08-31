
function destroyTsParticlesContainer(containerId) {
  destroyCustomButterflies(containerId);
  if (containerId === 'tsparticles-username') destroyCustomUsernameEffect();
  if (window.tsParticles && typeof window.tsParticles.dom === 'function') {
    const existing = window.tsParticles.dom().find((c) => c.id === containerId);
    if (existing) existing.destroy();
  }
}

function randomRange(value, fallbackMin = 0, fallbackMax = 1) {
  if (typeof value === 'number') return { min: value, max: value };
  if (value && typeof value === 'object') {
    const min = Number(value.min);
    const max = Number(value.max);
    if (Number.isFinite(min) && Number.isFinite(max)) return { min, max };
    if (Number.isFinite(min)) return { min, max: min };
    if (Number.isFinite(max)) return { min: max, max };
  }
  return { min: fallbackMin, max: fallbackMax };
}

function randomBetween(range) {
  return range.min + Math.random() * (range.max - range.min);
}

function normalizeColors(colors, fallback = ['#FFFFFF', '#C9B6FF', '#FFBDE6']) {
  const arr = Array.isArray(colors) ? colors.filter((c) => typeof c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(c)) : [];
  return arr.length ? arr.slice(0, 3) : fallback;
}

// ============================================================================
// UNIVERSAL PARTICLE SETTINGS
// Các thiết lập này là tùy chọn và dùng chung cho mọi hiệu ứng JSON.
// Nếu hiệu ứng không khai báo universal hoặc không có tính năng tương ứng,
// tsParticles vẫn chạy config gốc bình thường.
// ============================================================================
function cloneObject(value) {
  if (!value || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}

function mergeDefined(base, override) {
  const result = { ...(base || {}) };
  if (!override || typeof override !== 'object') return result;
  Object.keys(override).forEach((key) => {
    const v = override[key];
    if (v && typeof v === 'object' && !Array.isArray(v) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = mergeDefined(result[key], v);
    } else if (v !== undefined) {
      result[key] = cloneObject(v);
    }
  });
  return result;
}

function applyUniversalParticleSettings(config) {
  const universal = config && config.universal;
  if (!universal || typeof universal !== 'object') return config;

  const particles = config.particles || (config.particles = {});

  // 3 màu: chỉ ghi đè khi người dùng thực sự khai báo universal.colors.
  const colors = normalizeColors(universal.colors, []);
  if (colors.length) {
    particles.color = { ...(particles.color || {}), value: colors };
  }

  // Kích thước chung. Có thể là số hoặc {min,max}.
  if (universal.size !== undefined) {
    particles.size = { ...(particles.size || {}), value: cloneObject(universal.size) };
  }

  // Độ mờ + fade native của tsParticles.
  if (universal.opacity !== undefined) {
    const opacity = universal.opacity;
    if (typeof opacity === 'number' || (opacity && typeof opacity === 'object' && (opacity.min !== undefined || opacity.max !== undefined))) {
      const current = particles.opacity || {};
      particles.opacity = { ...current, value: cloneObject(opacity) };
    }
    if (opacity && typeof opacity === 'object' && opacity.animation) {
      particles.opacity = { ...(particles.opacity || {}), animation: cloneObject(opacity.animation) };
    }
  }

  // fade là tên dễ nhớ ở tầng universal. Với tsParticles, fade được biểu diễn
  // bằng opacity.animation; nếu người dùng đã khai báo animation cụ thể thì ưu tiên nó.
  if (universal.fade && universal.fade.enable === true && !particles.opacity?.animation?.enable) {
    particles.opacity = {
      ...(particles.opacity || {}),
      animation: {
        ...(particles.opacity?.animation || {}),
        enable: true,
        speed: Number(universal.fade.speed ?? 0.3),
        sync: universal.fade.sync === true,
      },
    };
  }

  // Tốc độ / hướng / random / straight. Chỉ áp dụng trường nào có trong universal.
  if (universal.move && typeof universal.move === 'object') {
    particles.move = mergeDefined(particles.move, universal.move);
  }

  // Random rotation cho các shape mà tsParticles hỗ trợ rotate.
  if (universal.rotation && typeof universal.rotation === 'object') {
    const r = universal.rotation;
    const rotate = { ...(particles.rotate || {}) };
    if (r.enable !== false) {
      if (r.min !== undefined || r.max !== undefined) {
        rotate.value = {
          min: Number(r.min ?? 0),
          max: Number(r.max ?? 360),
        };
      }
      if (r.random === true || r.direction !== undefined) rotate.direction = r.direction || 'random';
      if (r.speed !== undefined || r.animation !== undefined) {
        rotate.animation = mergeDefined(rotate.animation, r.animation || {});
        if (r.speed !== undefined) {
          rotate.animation.enable = true;
          rotate.animation.speed = cloneObject(r.speed);
          if (rotate.animation.sync === undefined) rotate.animation.sync = false;
        }
      }
    }
    particles.rotate = rotate;
  }

  // universal không bị gửi sang tsParticles vì đây là namespace riêng của app.
  delete config.universal;
  return config;
}

function buildButterflyConfig(butterfly, universal) {
  // Butterfly-specific luôn được ưu tiên; universal chỉ làm giá trị mặc định.
  const u = universal && typeof universal === 'object' ? universal : {};
  const b = butterfly && typeof butterfly === 'object' ? butterfly : {};
  const result = { ...b };

  if (result.colors === undefined && u.colors !== undefined) result.colors = cloneObject(u.colors);
  if (result.size === undefined && u.size !== undefined) result.size = cloneObject(u.size);
  if (result.opacity === undefined && u.opacity !== undefined) result.opacity = cloneObject(u.opacity);
  if (result.move === undefined && u.move !== undefined) result.move = cloneObject(u.move);
  else if (u.move && typeof u.move === 'object') result.move = mergeDefined(u.move, result.move);

  if (result.rotate === undefined && u.rotation !== undefined) result.rotate = cloneObject(u.rotation);
  else if (u.rotation && typeof u.rotation === 'object') result.rotate = mergeDefined(u.rotation, result.rotate);

  // Lifecycle là phần custom của app, nên chỉ bật khi universal.fade/timing được khai báo.
  if (result.fadeTime === undefined && u.fade && u.fade.time !== undefined) result.fadeTime = cloneObject(u.fade.time);
  if (result.visibleTime === undefined && u.timing && u.timing.visible !== undefined) result.visibleTime = cloneObject(u.timing.visible);
  if (result.hiddenTime === undefined && u.timing && u.timing.hidden !== undefined) result.hiddenTime = cloneObject(u.timing.hidden);

  if (result.opacity && typeof result.opacity === 'object' && u.fade) {
    result.fade = cloneObject(u.fade);
  }

  return result;
}

function colorizeButterflyImage(sourceImage, color) {
  const cacheKey = `${color}|${sourceImage.src}`;
  if (!colorizeButterflyImage.cache) colorizeButterflyImage.cache = new Map();
  if (colorizeButterflyImage.cache.has(cacheKey)) return colorizeButterflyImage.cache.get(cacheKey);

  const w = sourceImage.naturalWidth || sourceImage.width;
  const h = sourceImage.naturalHeight || sourceImage.height;
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d', { willReadFrequently: true });
  octx.drawImage(sourceImage, 0, 0, w, h);

  const imageData = octx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const hex = color.replace('#', '');
  const expanded = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex.slice(0, 6);
  const cr = parseInt(expanded.slice(0, 2), 16) || 255;
  const cg = parseInt(expanded.slice(2, 4), 16) || 255;
  const cb = parseInt(expanded.slice(4, 6), 16) || 255;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (!a) continue;

    // Giữ độ sáng/chi tiết của bướm gốc nhưng thay hue bằng màu được chọn.
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const brightness = 0.48 + luminance * 0.72;
    data[i] = Math.min(255, cr * brightness);
    data[i + 1] = Math.min(255, cg * brightness);
    data[i + 2] = Math.min(255, cb * brightness);
  }

  octx.putImageData(imageData, 0, 0);
  colorizeButterflyImage.cache.set(cacheKey, off);
  return off;
}

async function startCustomButterflyEffect(containerId, butterflyConfig, totalParticleCount) {
  destroyCustomButterflies(containerId);
  if (!butterflyConfig || butterflyConfig.enable === false) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const src = butterflyConfig.src || '/uploads/butterfly.svg';
  const image = new Image();
  image.decoding = 'async';
  image.src = src;

  try {
    await image.decode();
  } catch {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
  }

  const ratio = Math.min(1, Math.max(0, Number(butterflyConfig.ratio ?? 0.333333)));
  const butterflyCount = Math.max(0, Math.round(totalParticleCount * ratio));
  if (!butterflyCount) return;

  const colors = normalizeColors(butterflyConfig.colors);
  const sizeRange = randomRange(butterflyConfig.size, 18, 32);
  const opacityRange = randomRange(butterflyConfig.opacity, 0.35, 0.85);
  const speedConfig = butterflyConfig.move && butterflyConfig.move.speed !== undefined
    ? butterflyConfig.move.speed
    : { min: 0.05, max: 0.25 };
  const speedRange = randomRange(speedConfig, 0.05, 0.25);
  const rotateConfig = butterflyConfig.rotate || {};
  const angleRange = randomRange(
    { min: Number(rotateConfig.min ?? 0), max: Number(rotateConfig.max ?? 360) },
    0,
    360,
  );
  const rotationSpeedRange = randomRange(rotateConfig.speed, 0.15, 0.6);

  // Fade in/out + thời gian hiện + thời gian nghỉ đều random riêng cho từng con.
  // Có thể cấu hình bằng:
  // fadeTime:     {min, max}  - thời gian fade IN và fade OUT (ms)
  // visibleTime:  {min, max}  - thời gian giữ ở trạng thái hiện rõ (ms)
  // hiddenTime:   {min, max}  - thời gian nghỉ/ẩn trước khi xuất hiện lại (ms)
  const fadeRange = randomRange(butterflyConfig.fadeTime, 900, 1800);
  const visibleRange = randomRange(butterflyConfig.visibleTime, 2500, 5500);
  const hiddenRange = randomRange(butterflyConfig.hiddenTime, 1800, 4500);

  const canvas = document.createElement('canvas');
  canvas.className = 'custom-butterfly-canvas';
  container.appendChild(canvas);
  customButterflyCanvases.set(containerId, canvas);

  const ctx = canvas.getContext('2d');
  const particles = [];
  let width = window.innerWidth;
  let height = window.innerHeight;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();

  function randomPhase(initial) {
    // Khi trang vừa mở, mỗi con được rải ngẫu nhiên trong một chu kỳ khác nhau,
    // tránh cả đàn cùng xuất hiện/biến mất một lúc.
    if (!initial) return { state: 'hidden', timer: randomBetween(hiddenRange) };

    const roll = Math.random();
    if (roll < 0.25) {
      return { state: 'hidden', timer: randomBetween(hiddenRange) };
    }
    if (roll < 0.55) {
      return { state: 'fadeIn', timer: randomBetween(fadeRange) };
    }
    if (roll < 0.82) {
      return { state: 'visible', timer: randomBetween(visibleRange) };
    }
    return { state: 'fadeOut', timer: randomBetween(fadeRange) };
  }

  function spawnParticle(initial = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(speedRange);
    const rotationDirection = Math.random() < 0.5 ? -1 : 1;
    const size = randomBetween(sizeRange);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const phase = randomPhase(initial);

    const p = {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color,
      opacity: 0,
      targetOpacity: randomBetween(opacityRange),
      state: phase.state,
      stateTimer: phase.timer,
      fadeDuration: randomBetween(fadeRange),
      visibleDuration: randomBetween(visibleRange),
      hiddenDuration: randomBetween(hiddenRange),
      rotation: randomBetween(angleRange) * Math.PI / 180,
      rotationDirection,
      rotationSpeed: randomBetween(rotationSpeedRange),
      wave: Math.random() * Math.PI * 2,
      waveSpeed: 0.004 + Math.random() * 0.009,
      image: null,
    };

    // Đặt opacity hợp lý cho phase ban đầu.
    if (p.state === 'visible') p.opacity = p.targetOpacity;
    else if (p.state === 'fadeOut') p.opacity = p.targetOpacity;

    p.image = colorizeButterflyImage(image, color);
    particles.push(p);
  }

  for (let i = 0; i < butterflyCount; i++) spawnParticle(true);

  let lastTime = performance.now();

  function advanceVisibility(p, dt) {
    p.stateTimer -= dt;

    if (p.state === 'hidden') {
      p.opacity = 0;
      if (p.stateTimer <= 0) {
        p.state = 'fadeIn';
        p.fadeDuration = randomBetween(fadeRange);
        p.stateTimer = p.fadeDuration;
      }
      return;
    }

    if (p.state === 'fadeIn') {
      const progress = Math.max(0, Math.min(1, 1 - p.stateTimer / p.fadeDuration));
      // Smoothstep để fade mềm hơn, không bật/tắt đột ngột.
      const eased = progress * progress * (3 - 2 * progress);
      p.opacity = p.targetOpacity * eased;
      if (p.stateTimer <= 0) {
        p.opacity = p.targetOpacity;
        p.state = 'visible';
        p.visibleDuration = randomBetween(visibleRange);
        p.stateTimer = p.visibleDuration;
      }
      return;
    }

    if (p.state === 'visible') {
      p.opacity = p.targetOpacity;
      if (p.stateTimer <= 0) {
        p.state = 'fadeOut';
        p.fadeDuration = randomBetween(fadeRange);
        p.stateTimer = p.fadeDuration;
      }
      return;
    }

    // fadeOut
    const progress = Math.max(0, Math.min(1, 1 - p.stateTimer / p.fadeDuration));
    const eased = progress * progress * (3 - 2 * progress);
    p.opacity = p.targetOpacity * (1 - eased);
    if (p.stateTimer <= 0) {
      p.opacity = 0;
      p.state = 'hidden';
      p.hiddenDuration = randomBetween(hiddenRange);
      p.stateTimer = p.hiddenDuration;
      // Mỗi chu kỳ có thể đổi màu/độ sáng nhẹ, nhưng vẫn chỉ lấy trong 3 màu đã chọn.
      p.targetOpacity = randomBetween(opacityRange);
    }
  }

  function frame(now) {
    if (!customButterflyCanvases.has(containerId)) return;

    const dt = Math.min(40, now - lastTime);
    lastTime = now;
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      advanceVisibility(p, dt);

      p.x += p.vx * dt / 16.67;
      p.y += p.vy * dt / 16.67;
      p.x += Math.sin(now * 0.001 * p.waveSpeed * 60 + p.wave) * 0.08;
      p.y += Math.cos(now * 0.001 * p.waveSpeed * 45 + p.wave) * 0.05;
      p.rotation += p.rotationDirection * p.rotationSpeed * dt / 1000;

      const margin = p.size * 3 + 20;
      if (p.x < -margin || p.x > width + margin || p.y < -margin || p.y > height + margin) {
        particles.splice(i, 1);
        spawnParticle(false);
        continue;
      }

      // Khi đang nghỉ hoàn toàn thì không vẽ, nhưng bướm vẫn bay ngầm để lần xuất hiện
      // tiếp theo không bị đứng yên một chỗ.
      if (p.opacity <= 0.001) continue;

      const ratio = p.image.width / Math.max(1, p.image.height);
      const drawHeight = p.size;
      const drawWidth = drawHeight * ratio;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.drawImage(p.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }

    const raf = requestAnimationFrame(frame);
    customButterflyAnimations.set(containerId, raf);
  }

  canvas._milkyResize = resize;
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
}

// Nạp/gỡ hiệu ứng. JSON có thể chứa thêm "butterfly"; phần này được app xử lý riêng,
// còn particles.* vẫn được giao cho tsParticles như trước.
async function applyCustomParticles(containerId, configRaw, setMode) {
  const raw = (configRaw || '').trim();

  if (!raw) {
    setMode('default');
    destroyTsParticlesContainer(containerId);
    return;
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    console.warn(`Code kim tuyến tùy chỉnh (${containerId}) không phải JSON hợp lệ, dùng hiệu ứng mặc định:`, err);
    setMode('default');
    destroyTsParticlesContainer(containerId);
    return;
  }

  setMode('custom');
  destroyTsParticlesContainer(containerId);

  try {
    const customConfig = JSON.parse(JSON.stringify(config));
    const universal = customConfig.universal;
    const butterfly = customConfig.butterfly
      ? buildButterflyConfig(customConfig.butterfly, universal)
      : null;
    const total = Math.max(0, Number(customConfig.particles?.number?.value ?? 45));

    // Universal settings chỉ ghi đè những trường được khai báo. Nếu không có
    // universal thì config từ particles.js.org được giữ nguyên.
    applyUniversalParticleSettings(customConfig);

    // Nếu có bướm: particles.number.value là TỔNG số particle mong muốn.
    // tsParticles chỉ nhận phần kim tuyến, còn bướm do canvas riêng vẽ.
    if (butterfly?.enable !== false && butterfly) {
      const ratio = Math.min(1, Math.max(0, Number(butterfly.ratio ?? 0.333333)));
      const butterflyCount = Math.round(total * ratio);
      const sparkleCount = Math.max(0, total - butterflyCount);
      if (!customConfig.particles) customConfig.particles = {};
      if (!customConfig.particles.number) customConfig.particles.number = {};
      customConfig.particles.number.value = sparkleCount;
      customConfig.background = { ...(customConfig.background || {}), color: 'transparent' };
    }

    await ensureTsParticlesLoaded();
    await window.tsParticles.load({ id: containerId, options: customConfig });

    if (butterfly?.enable !== false && butterfly) {
      await startCustomButterflyEffect(containerId, butterfly, total);
    }
  } catch (err) {
    console.warn(`Không tải được hiệu ứng kim tuyến tùy chỉnh (${containerId}), quay về hiệu ứng mặc định:`, err);
    setMode('default');
    destroyTsParticlesContainer(containerId);
  }
}

function applyCursorParticlesConfig() {
  return applyCustomParticles(
    'tsparticles-cursor',
    siteSettings && siteSettings.sparkleCursorConfig,
    (mode) => { cursorEffectMode = mode; },
  );
}

async function applyUsernameParticlesConfig() {
  const raw = (siteSettings && siteSettings.usernameSparkleConfig || '').trim();
  if (!raw) { usernameEffectMode='default'; destroyTsParticlesContainer('tsparticles-username'); return; }
  try {
    const config=JSON.parse(raw);
    if(config.usernameEffect && typeof config.usernameEffect==='object'){
      usernameEffectMode='custom';
      destroyTsParticlesContainer('tsparticles-username');
      const launch=()=>{
        if (usernameEffectMode !== 'custom') return;
        startCustomUsernameEffect(config.usernameEffect);
      };
      // loadSiteSettings chạy trước khi #stage được hiện. Khởi động lại sau layout để
      // canvas có đúng kích thước chữ tên thay vì bị tạo với width/height = 0.
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(launch), {once:true});
      } else {
        requestAnimationFrame(launch);
      }
      return;
    }
  } catch {}
  return applyCustomParticles('tsparticles-username',raw,(mode)=>{usernameEffectMode=mode;});
}

function applyPageParticlesConfig() {
  return applyCustomParticles(
    'tsparticles-page',
    siteSettings && siteSettings.pageParticlesConfig,
    (mode) => { pageEffectMode = mode; },
  );
}

// Ambient particles nhẹ khi chưa di chuột (chạy dù chưa vào trang để nền không tĩnh).
// Chỉ chạy khi đang ở chế độ mặc định (pageEffectMode === 'default'); nếu admin dán code
// cấu hình tsParticles riêng cho hiệu ứng rải khắp trang thì dừng, nhường chỗ cho tsParticles.
setInterval(() => {
  if (pageEffectMode !== 'default') return;
  spawnParticle(Math.random() * w, Math.random() * h, pageParticleRgb);
}, 300);

// Nếu đang ở chế độ chỉnh vị trí trong iframe admin, vào thẳng trang luôn (khỏi phải bấm "nhấn để vào trang")
if (EDIT_POSITIONS) {
  window.addEventListener('DOMContentLoaded', () => {
    overlay.click();
  });
}



