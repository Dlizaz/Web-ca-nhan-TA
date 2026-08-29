// ================= CONFIG =================
const TYPE_SPEED = 55; // ms mỗi ký tự
const ERASE_SPEED = 30;
const PAUSE_AFTER_TYPE = 1800;
let BIO_LINES = ["chào mừng đến trang của tôi"];
const LANYARD_POLL_MS = 20000;
// ============================================================================

const ICON_PATHS = {
  discord: '<path d="M20.3 4.4A19.7 19.7 0 0 0 15.7 3l-.3.5a14 14 0 0 1 4 1.6 13.7 13.7 0 0 0-11.9 0 14 14 0 0 1 4-1.6L11.2 3a19.7 19.7 0 0 0-4.6 1.4C3.6 8.3 2.8 12 3.2 15.7a20 20 0 0 0 6 3l1-1.6a12.8 12.8 0 0 1-1.9-.9l.5-.4a14.3 14.3 0 0 0 12.4 0l.5.4c-.6.4-1.2.6-1.9.9l1 1.6a20 20 0 0 0 6-3c.5-4.3-.7-8-3-11.3ZM9.7 13.9c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Zm5.6 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8Z"/>',
  instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .25 2.4.42.6.24 1 .53 1.5 1 .47.48.76.9 1 1.5.17.4.36 1.2.42 2.4.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 2-.42 2.4-.24.6-.53 1-1 1.5-.48.47-.9.76-1.5 1-.4.17-1.2.36-2.4.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-2-.25-2.4-.42-.6-.24-1-.53-1.5-1-.47-.48-.76-.9-1-1.5-.17-.4-.36-1.2-.42-2.4C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-2 .42-2.4.24-.6.53-1 1-1.5.48-.47.9-.76 1.5-1 .4-.17 1.2-.36 2.4-.42C8.4 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-1 .05-1.6.2-1.9.35a3 3 0 0 0-1.1.7 3 3 0 0 0-.7 1.1c-.15.4-.3.9-.35 1.9C3.2 8.5 3.2 8.9 3.2 12s0 3.5.07 4.7c.05 1 .2 1.6.35 1.9.16.4.36.75.7 1.1.35.34.7.54 1.1.7.4.15.9.3 1.9.35 1.2.06 1.6.07 4.7.07s3.5 0 4.7-.07c1-.05 1.6-.2 1.9-.35a3 3 0 0 0 1.1-.7 3 3 0 0 0 .7-1.1c.15-.4.3-.9.35-1.9.06-1.2.07-1.6.07-4.7s0-3.5-.07-4.7c-.05-1-.2-1.6-.35-1.9a3 3 0 0 0-.7-1.1 3 3 0 0 0-1.1-.7c-.4-.15-.9-.3-1.9-.35C15.5 4 15.1 4 12 4Zm0 3.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm4.8-2a1.1 1.1 0 1 1 0 2.1 1.1 1.1 0 0 1 0-2.1Z"/>',
  tiktok: '<path d="M14.7 2h2.9c.2 1.3.9 2.5 1.9 3.4 1 .8 2.2 1.3 3.5 1.4v3c-1.5 0-2.9-.4-4.2-1.2v6.6c0 3.4-2.7 6.1-6.1 6.1S6.6 18.6 6.6 15.2c0-3.2 2.5-5.9 5.7-6.1v3c-1.5.2-2.7 1.5-2.7 3.1 0 1.7 1.4 3.1 3.1 3.1s3.1-1.4 3.1-3.1V2Z"/>',
  youtube: '<path d="M22 12s0-3.2-.4-4.7a2.8 2.8 0 0 0-2-2C17.9 5 12 5 12 5s-5.9 0-7.6.3a2.8 2.8 0 0 0-2 2C2 8.8 2 12 2 12s0 3.2.4 4.7c.3 1 1 1.7 2 2C6.1 19 12 19 12 19s5.9 0 7.6-.3a2.8 2.8 0 0 0 2-2c.4-1.5.4-4.7.4-4.7ZM10 15.5v-7l6 3.5-6 3.5Z"/>',
  twitter: '<path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2 8 8 0 0 1-2.5 1 4 4 0 0 0-6.9 3.6A11.4 11.4 0 0 1 3.9 4.9a4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.7-.5v.1a4 4 0 0 0 3.2 3.9 4 4 0 0 1-1.8.1 4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.6a11.3 11.3 0 0 0 6.1 1.8c7.3 0 11.3-6.1 11.3-11.3v-.5c.8-.6 1.4-1.3 1.9-2.1-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.2Z"/>',
  github: '<path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.6-.1-.3-.5-1.4.1-2.8 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .6 1.4.2 2.5.1 2.8.6.6 1 1.5 1 2.6 0 3.8-2.4 4.6-4.6 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/>',
  spotify: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.4 14.4a.6.6 0 0 1-.8.2c-2.3-1.4-5.2-1.7-8.6-1a.6.6 0 1 1-.3-1.2c3.7-.8 6.9-.5 9.5 1.1.3.2.4.6.2.9Zm1.2-2.8a.8.8 0 0 1-1 .3c-2.6-1.6-6.6-2.1-9.7-1.1a.8.8 0 1 1-.5-1.5c3.5-1.1 7.9-.6 10.9 1.3.4.2.5.7.3 1Zm.1-2.9C14.7 9 8.9 8.8 5.9 9.7a.9.9 0 1 1-.5-1.8c3.5-1 9.9-.8 13.1 1.1a.9.9 0 1 1-.8 1.6Z"/>',
  link: '<path d="M10.6 13.4a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.6 1.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M13.4 10.6a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.5-1.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
};

function iconSvg(name) {
  const path = ICON_PATHS[name] || ICON_PATHS.link;
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">${path}</svg>`;
}

// Đổi mã màu hex (#rrggbb hoặc #rgb) + độ mờ (0-100) thành chuỗi rgba() dùng cho CSS
function hexToRgba(hex, opacityPercent) {
  if (!hex) return null;
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const bch = parseInt(h.substring(4, 6), 16);
  const a = Math.min(100, Math.max(0, Number(opacityPercent ?? 100))) / 100;
  return `rgba(${r}, ${g}, ${bch}, ${a})`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}

// Có đang mở ở chế độ chỉnh vị trí (được nhúng qua iframe từ trang admin) không
const params = new URLSearchParams(location.search);
const EDIT_POSITIONS = params.get('editPositions') === '1';

// ---------- Load settings từ server ----------
let siteSettings = null;

async function loadSiteSettings() {
  try {
    const res = await fetch('/api/settings');
    siteSettings = await res.json();
  } catch {
    siteSettings = { username: 'milky', bioLines: ['...'], links: [] };
  }

  applyIdentity();
  applyAppearance();
  applyDiscord();
  applyLinks();
  applyMusic();
  applyPositions();
  applySizesAndColors();
}

// ---------- Tên / avatar / bio ----------
function applyIdentity() {
  document.getElementById('username-text').textContent = siteSettings.username || 'milky';
  BIO_LINES = (siteSettings.bioLines && siteSettings.bioLines.length) ? siteSettings.bioLines : BIO_LINES;

  const avatarImg = document.getElementById('avatar-img');
  if (siteSettings.avatar) {
    avatarImg.src = siteSettings.avatar;
    avatarImg.style.display = '';
  }
}

// ---------- Giao diện: nền, màu chữ, font, con trỏ ----------
function applyAppearance() {
  const root = document.documentElement;

  if (siteSettings.textColor) root.style.setProperty('--text', siteSettings.textColor);
  if (siteSettings.accentColor) root.style.setProperty('--accent', siteSettings.accentColor);
  root.style.setProperty('--overlay-opacity', (Number(siteSettings.overlayOpacity ?? 45) / 100).toString());

  // Nền
  const bgLayer = document.getElementById('bg-layer');
  if (siteSettings.background) {
    bgLayer.style.backgroundImage = `url('${siteSettings.background}')`;
  }
  if (siteSettings.backgroundColor) {
    bgLayer.style.backgroundColor = siteSettings.backgroundColor;
  }

  // Font: tải Google Font tương ứng rồi gán biến CSS
  const chosenFont = siteSettings.fontFamily === 'custom'
    ? (siteSettings.customFontFamily || 'Space Grotesk')
    : (siteSettings.fontFamily || 'Space Grotesk');

  if (chosenFont && chosenFont !== 'Space Grotesk') {
    const link = document.getElementById('dynamic-font-link');
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(chosenFont).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`;
  }
  root.style.setProperty('--font-display', `'${chosenFont}', sans-serif`);

  // Popup khi click: font + màu riêng
  if (siteSettings.clickFont) root.style.setProperty('--click-font', `'${siteSettings.clickFont}', sans-serif`);
  if (siteSettings.clickColor) root.style.setProperty('--click-color', siteSettings.clickColor);

  // Con trỏ chuột tùy chỉnh
  const body = document.body;
  if (siteSettings.cursor) {
    root.style.setProperty('--custom-cursor-url', `url('${siteSettings.cursor}') 4 4, auto`);
    body.classList.add('has-custom-cursor');
  } else {
    body.classList.remove('has-custom-cursor');
  }
}

// ---------- Widget Discord ----------
let lanyardTimer = null;

function applyDiscord() {
  const box = document.getElementById('el-discord');
  if (!siteSettings.discordEnabled) {
    box.hidden = true;
    if (lanyardTimer) clearInterval(lanyardTimer);
    return;
  }
  box.hidden = false;

  if (siteSettings.discordMode === 'live' && siteSettings.discordId) {
    fetchLanyard();
    if (lanyardTimer) clearInterval(lanyardTimer);
    lanyardTimer = setInterval(fetchLanyard, LANYARD_POLL_MS);
  } else {
    if (lanyardTimer) clearInterval(lanyardTimer);
    renderDiscordManual();
  }
}

function renderDiscordManual() {
  document.getElementById('discord-avatar').src = siteSettings.discordManualAvatar || '';
  document.getElementById('discord-name').textContent = siteSettings.discordManualName || 'discord';
  document.getElementById('discord-tag').textContent = siteSettings.discordManualTag ? `#${siteSettings.discordManualTag}` : '';
  document.getElementById('discord-message').textContent = siteSettings.discordManualMessage || '';
  document.getElementById('discord-status-dot').dataset.status = siteSettings.discordManualStatus || 'online';
}

async function fetchLanyard() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${siteSettings.discordId}`);
    const json = await res.json();
    if (!json.success) throw new Error('lanyard lỗi');
    const d = json.data;
    const u = d.discord_user;
    const avatarUrl = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`
      : `https://cdn.discordapp.com/embed/avatars/${Number(u.discriminator || 0) % 5}.png`;

    document.getElementById('discord-avatar').src = avatarUrl;
    document.getElementById('discord-name').textContent = u.global_name || u.username || 'discord';
    document.getElementById('discord-tag').textContent = u.discriminator && u.discriminator !== '0' ? `#${u.discriminator}` : '';

    const activity = (d.activities || []).find((a) => a.type !== 4) || (d.activities || [])[0];
    let msg = '';
    if (activity) msg = activity.name || '';
    else if (d.discord_status === 'online') msg = 'đang online';
    else if (d.discord_status === 'idle') msg = 'đang away';
    else if (d.discord_status === 'dnd') msg = 'không làm phiền';
    else msg = 'offline';
    document.getElementById('discord-message').textContent = msg;
    document.getElementById('discord-status-dot').dataset.status = d.discord_status || 'offline';
  } catch (e) {
    // API lỗi hoặc user chưa join server Lanyard -> tạm hiện dữ liệu thủ công nếu có
    renderDiscordManual();
  }
}

// ---------- Links ----------
function applyLinks() {
  const linksContainer = document.getElementById('el-links');
  linksContainer.innerHTML = '';
  (siteSettings.links || []).forEach((link) => {
    const a = document.createElement('a');
    a.className = 'link-btn';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `${iconSvg(link.icon)}<span>${escapeHtml(link.label || 'Link')}</span>`;
    linksContainer.appendChild(a);
  });
}

// ---------- Nhạc nền: ảnh bìa, tiêu đề, thanh tua ----------
function applyMusic() {
  const box = document.getElementById('el-music');
  const audio = document.getElementById('bg-audio');

  if (!siteSettings.song) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  audio.src = siteSettings.song;

  const cover = document.getElementById('music-cover');
  if (siteSettings.songCover) {
    cover.src = siteSettings.songCover;
    cover.style.display = '';
  } else {
    cover.style.display = 'none';
  }

  document.getElementById('music-title').textContent = siteSettings.songTitle || 'nhạc nền';
}

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ---------- Vị trí tự do ----------
function applyPositions() {
  const positions = siteSettings.positions || {};
  document.querySelectorAll('.pos-el').forEach((el) => {
    const key = el.dataset.posKey || el.id.replace('el-', '');
    const p = positions[key];
    if (p) {
      el.style.top = `${p.top}%`;
      el.style.left = `${p.left}%`;
    }
  });
}

// ---------- Kích thước & màu khung tự chỉnh ----------
const SCALE_KEYS = ['avatar', 'username', 'bio', 'views', 'links'];
const BOX_KEYS = ['discord', 'music'];

function applySizesAndColors() {
  const sizes = siteSettings.sizes || {};
  const boxStyles = siteSettings.boxStyles || {};

  // Phóng to/nhỏ đều theo tỉ lệ
  SCALE_KEYS.forEach((key) => {
    const el = document.getElementById(`el-${key}`);
    if (!el) return;
    const s = sizes[key];
    el.style.setProperty('--el-scale', s && s.scale ? s.scale : 1);
  });

  // Kéo giãn width/height cho khung Discord & khung nhạc
  BOX_KEYS.forEach((key) => {
    const el = document.getElementById(`el-${key}`);
    if (!el) return;
    const s = sizes[key];
    if (s && s.width) {
      el.style.width = `${s.width}px`;
      el.style.maxWidth = 'none';
    }
    if (s && s.height) {
      el.style.height = `${s.height}px`;
    } else {
      el.style.height = '';
    }
  });

  // Màu nền / viền khung Discord & khung nhạc
  BOX_KEYS.forEach((key) => {
    const el = document.getElementById(`el-${key}`);
    if (!el) return;
    const st = boxStyles[key];
    if (!st) return;
    if (st.bg) el.style.setProperty('--box-bg', hexToRgba(st.bg, st.bgOpacity));
    if (st.border) el.style.setProperty('--box-border', hexToRgba(st.border, st.borderOpacity));
  });

  // Màu nền / viền các nút link (đặt biến CSS trên khối chứa để các nút con thừa hưởng)
  const linksEl = document.getElementById('el-links');
  const lst = boxStyles.links;
  if (linksEl && lst) {
    if (lst.bg) linksEl.style.setProperty('--links-box-bg', hexToRgba(lst.bg, lst.bgOpacity));
    if (lst.border) linksEl.style.setProperty('--links-box-border', hexToRgba(lst.border, lst.borderOpacity));
  }
}

// gán data-pos-key cho từng khối để đồng bộ với settings.positions
['avatar', 'username', 'bio', 'views', 'discord', 'links', 'music'].forEach((key) => {
  const el = document.getElementById(`el-${key}`);
  if (el) el.dataset.posKey = key;
});

// ---------- Chế độ chỉnh vị trí (mở trong iframe từ trang admin) ----------
function setupPositionEditing() {
  if (!EDIT_POSITIONS) return;
  document.body.classList.add('edit-positions');

  let dragEl = null;
  let resizeEl = null;
  let resizeStart = null;

  function onPointerDown(e) {
    dragEl = e.currentTarget;
    dragEl.classList.add('dragging');
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (resizeEl) return onResizeMove(e);
    if (!dragEl) return;
    const leftPct = Math.min(100, Math.max(0, (e.clientX / window.innerWidth) * 100));
    const topPct = Math.min(100, Math.max(0, (e.clientY / window.innerHeight) * 100));
    dragEl.style.left = `${leftPct}%`;
    dragEl.style.top = `${topPct}%`;
  }

  function onPointerUp() {
    if (resizeEl) return onResizeUp();
    if (!dragEl) return;
    const key = dragEl.dataset.posKey;
    const left = parseFloat(dragEl.style.left);
    const top = parseFloat(dragEl.style.top);
    dragEl.classList.remove('dragging');
    dragEl = null;
    if (window.parent) {
      window.parent.postMessage({ type: 'milky-position-update', key, top, left }, '*');
    }
  }

  // ---- Tay cầm kéo-giãn: đặt ở góc dưới-phải mỗi khối ----
  function onResizeDown(e) {
    e.stopPropagation();
    e.preventDefault();
    resizeEl = e.currentTarget.parentElement;
    resizeEl.classList.add('dragging');
    const rect = resizeEl.getBoundingClientRect();
    resizeStart = { x: e.clientX, y: e.clientY, width: rect.width, height: rect.height };
  }

  function onResizeMove(e) {
    if (!resizeEl || !resizeStart) return;
    const key = resizeEl.dataset.posKey;
    const dx = e.clientX - resizeStart.x;
    const dy = e.clientY - resizeStart.y;

    if (BOX_KEYS.includes(key)) {
      // Khung dạng hộp (Discord / nhạc): kéo giãn width/height độc lập, có thể kéo dài ra hoặc phóng to
      const newWidth = Math.max(160, Math.round(resizeStart.width + dx * 2));
      const newHeight = Math.max(48, Math.round(resizeStart.height + dy * 2));
      resizeEl.style.maxWidth = 'none';
      resizeEl.style.width = `${newWidth}px`;
      resizeEl.style.height = `${newHeight}px`;
    } else {
      // Khối dạng chữ/ảnh: phóng to/nhỏ đều theo tỉ lệ
      const baseScale = parseFloat(resizeEl.style.getPropertyValue('--el-scale')) || 1;
      const delta = (dx + dy) / 2 / 150;
      const newScale = Math.min(3, Math.max(0.4, baseScale + delta));
      resizeEl.style.setProperty('--el-scale', newScale.toFixed(2));
    }
  }

  function onResizeUp() {
    if (!resizeEl) return;
    const key = resizeEl.dataset.posKey;
    resizeEl.classList.remove('dragging');
    const payload = { type: 'milky-size-update', key };
    if (BOX_KEYS.includes(key)) {
      const rect = resizeEl.getBoundingClientRect();
      payload.width = Math.round(rect.width);
      payload.height = Math.round(rect.height);
    } else {
      payload.scale = parseFloat(resizeEl.style.getPropertyValue('--el-scale')) || 1;
    }
    resizeEl = null;
    resizeStart = null;
    if (window.parent) {
      window.parent.postMessage(payload, '*');
    }
  }

  document.querySelectorAll('.pos-el').forEach((el) => {
    el.addEventListener('pointerdown', onPointerDown);
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.title = 'kéo để đổi kích thước';
    handle.addEventListener('pointerdown', onResizeDown);
    el.appendChild(handle);
  });
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  if (window.parent) {
    window.parent.postMessage({ type: 'milky-editor-ready' }, '*');
  }
}

// ---------- Enter overlay + audio ----------
const overlay = document.getElementById('enter-overlay');
const stage = document.getElementById('stage');
const audio = document.getElementById('bg-audio');
const musicBtn = document.getElementById('music-toggle');
const musicSeek = document.getElementById('music-seek');
const musicCurrent = document.getElementById('music-current');
const musicDuration = document.getElementById('music-duration');

async function enterSite() {
  await loadSiteSettings();
  overlay.classList.add('fade-out');
  stage.classList.remove('hidden');
  requestAnimationFrame(() => stage.classList.add('visible'));

  audio.volume = 0.4;
  audio.play().then(() => {
    musicBtn.classList.add('playing');
  }).catch(() => {
    // nếu không có file nhạc hoặc bị chặn, im lặng bỏ qua
  });

  setTimeout(() => overlay.remove(), 600);
  startTyping();
  startViewCounter();
  setupClickBubble();
  setupPositionEditing();
}

overlay.addEventListener('click', enterSite, { once: true });

musicBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
  } else {
    audio.pause();
    musicBtn.classList.remove('playing');
  }
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  musicSeek.value = (audio.currentTime / audio.duration) * 1000;
  musicCurrent.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  musicDuration.textContent = formatTime(audio.duration);
});

let seeking = false;
musicSeek.addEventListener('input', () => {
  seeking = true;
  if (audio.duration) {
    musicCurrent.textContent = formatTime((musicSeek.value / 1000) * audio.duration);
  }
});
musicSeek.addEventListener('change', () => {
  if (audio.duration) {
    audio.currentTime = (musicSeek.value / 1000) * audio.duration;
  }
  seeking = false;
});

// ---------- Popup khi click vào avatar ----------
function setupClickBubble() {
  const avatarImg = document.getElementById('avatar-img');
  const bubble = document.getElementById('click-bubble');
  let hideTimer = null;

  avatarImg.addEventListener('click', () => {
    if (!siteSettings || !siteSettings.clickEnabled) return;
    const messages = siteSettings.clickMessages && siteSettings.clickMessages.length
      ? siteSettings.clickMessages
      : ['xin chào'];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    bubble.textContent = msg;
    bubble.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bubble.classList.remove('show'), 2200);
  });
}

// ---------- Typing effect cho bio ----------
function startTyping() {
  const el = document.getElementById('typed-bio');
  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const currentLine = BIO_LINES[lineIndex];

    if (!deleting) {
      el.textContent = currentLine.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentLine.length) {
        deleting = true;
        return setTimeout(tick, PAUSE_AFTER_TYPE);
      }
      return setTimeout(tick, TYPE_SPEED);
    } else {
      el.textContent = currentLine.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % BIO_LINES.length;
        return setTimeout(tick, 300);
      }
      return setTimeout(tick, ERASE_SPEED);
    }
  }
  tick();
}

// ---------- View counter (đếm bằng localStorage giả lập, thay bằng API nếu muốn thật) ----------
function startViewCounter() {
  const el = document.getElementById('view-count');
  const key = 'milky_views';
  let count = parseInt(localStorage.getItem(key) || '0', 10);
  count += 1;
  localStorage.setItem(key, count);

  let shown = 0;
  const target = count;
  const step = Math.max(1, Math.ceil(target / 30));
  const iv = setInterval(() => {
    shown = Math.min(target, shown + step);
    el.textContent = shown.toLocaleString('vi-VN');
    if (shown >= target) clearInterval(iv);
  }, 20);
}

// ---------- Particle background theo con trỏ (giữ nguyên hiệu ứng gốc) ----------
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let w, h;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function spawnParticle(x, y) {
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    life: 1,
    size: Math.random() * 2.5 + 1,
    hue: Math.random() > 0.5 ? '124,92,255' : '255,92,154',
  });
  if (particles.length > 160) particles.shift();
}

window.addEventListener('pointermove', (e) => {
  spawnParticle(e.clientX, e.clientY);
});

function loop() {
  ctx.clearRect(0, 0, w, h);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.012;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${p.hue}, ${Math.max(p.life, 0)})`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  particles = particles.filter((p) => p.life > 0);
  requestAnimationFrame(loop);
}
loop();

// Ambient particles nhẹ khi chưa di chuột (chạy dù chưa vào trang để nền không tĩnh)
setInterval(() => {
  spawnParticle(Math.random() * w, Math.random() * h);
}, 300);

// Nếu đang ở chế độ chỉnh vị trí trong iframe admin, vào thẳng trang luôn (khỏi phải bấm "nhấn để vào trang")
if (EDIT_POSITIONS) {
  window.addEventListener('DOMContentLoaded', () => {
    overlay.click();
  });
}
