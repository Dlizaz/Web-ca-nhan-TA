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

// Danh sách các "phần chữ" có thể tự chọn riêng font & cỡ chữ (khớp với admin.js: TEXT_STYLE_FIELDS)
const TEXT_STYLE_KEYS = [
  'username', 'bio', 'views', 'discordName', 'discordTag',
  'discordMessage', 'musicTitle', 'musicTime', 'links',
];

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

  loadGoogleFonts();
  applyIdentity();
  applyAppearance();
  applyEnterOverlay();
  applyGlow();
  applySparkleEffects();
  applyCursorParticlesConfig();
  applyUsernameParticlesConfig();
  applyPageParticlesConfig();
  applyTextStyles();
  applyDiscord();
  applyAvatarFrame();
  refreshLanyardIfNeeded();
  applyLinks();
  applyMusic();
  applyPositions();
  applySizesAndColors();
  // Lúc này #stage còn ẩn (display:none) nên đo kích thước sẽ ra 0 — gọi lại lần nữa
  // trong enterSite() sau khi trang thật sự hiển thị mới có tác dụng.
  requestAnimationFrame(clampPositionsToViewport);
}

// ---------- Font chữ: gom hết tên font đang được dùng ở mọi nơi (font chung, font riêng
// từng phần, font popup click, font "nhấn để vào trang"...) rồi tải chung 1 lượt bằng
// đúng 1 thẻ <link>, thay vì tạo nhiều thẻ link riêng lẻ như trước. ----------
function collectFontNames() {
  const names = new Set();
  const s = siteSettings;

  const globalFont = s.fontFamily === 'custom' ? (s.customFontFamily || '') : (s.fontFamily || '');
  if (globalFont && globalFont !== 'Space Grotesk') names.add(globalFont);

  if (s.enterFont) names.add(s.enterFont);
  if (s.clickFont) names.add(s.clickFont);

  const textStyles = s.textStyles || {};
  TEXT_STYLE_KEYS.forEach((key) => {
    const st = textStyles[key] || {};
    const fontName = st.font === 'custom' ? (st.customFont || '') : (st.font || '');
    if (fontName) names.add(fontName);
  });

  return Array.from(names);
}

function loadGoogleFonts() {
  const link = document.getElementById('dynamic-fonts-link');
  if (!link) return;
  const names = collectFontNames();
  if (!names.length) { link.href = ''; return; }
  const families = names
    .map((n) => `family=${encodeURIComponent(n).replace(/%20/g, '+')}:wght@400;500;600;700`)
    .join('&');
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// ---------- Font & cỡ chữ riêng cho từng phần (tên, tiểu sử, lượt xem, Discord, nhạc, link...) ----------
function applyTextStyles() {
  const root = document.documentElement;
  const textStyles = siteSettings.textStyles || {};
  TEXT_STYLE_KEYS.forEach((key) => {
    const st = textStyles[key] || {};

    if (st.size) root.style.setProperty(`--ts-${key}-size`, `${st.size}px`);
    else root.style.removeProperty(`--ts-${key}-size`);

    const fontName = st.font === 'custom' ? (st.customFont || '') : (st.font || '');
    if (fontName) root.style.setProperty(`--ts-${key}-font`, `'${fontName}', sans-serif`);
    else root.style.removeProperty(`--ts-${key}-font`);
  });
}

// ---------- Hiệu ứng phát sáng nhẹ cho toàn bộ chữ & icon (0 = tắt hẳn) ----------
function applyGlow() {
  const root = document.documentElement;
  const glowColor = siteSettings.glowColor || '#7c5cff';
  const intensity = Math.min(100, Math.max(0, Number(siteSettings.glowIntensity ?? 0)));
  buildGlowVars(root, glowColor, intensity);
}

function buildGlowVars(root, glowColor, intensity) {
  if (!intensity) {
    root.style.setProperty('--glow-shadow', 'none');
    root.style.setProperty('--glow-filter', 'none');
    return;
  }
  const t = intensity / 100;
  const size1 = (2 + t * 10).toFixed(1);   // quầng sáng gần, sát chữ/icon
  const size2 = (4 + t * 22).toFixed(1);   // quầng sáng lan rộng hơn, nhẹ hơn
  const alphaPercent = Math.round(25 + t * 55); // 25% -> 80%
  const glowRgba = hexToRgba(glowColor, alphaPercent) || glowColor;

  root.style.setProperty('--glow-shadow', `0 0 ${size1}px ${glowRgba}, 0 0 ${size2}px ${glowRgba}`);
  root.style.setProperty('--glow-filter', `drop-shadow(0 0 ${size1}px ${glowRgba}) drop-shadow(0 0 ${size2}px ${glowRgba})`);
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

  // Màu nhấn: 3 chỗ tách riêng. Nếu site cũ chỉ có "accentColor" (trước khi tách),
  // dùng tạm màu đó cho cả 3 để không bị mất màu, cho đến khi admin lưu lại.
  const legacyAccent = siteSettings.accentColor || '#7c5cff';
  root.style.setProperty('--accent-border', siteSettings.accentBorderColor || legacyAccent);
  root.style.setProperty('--accent-icon', siteSettings.accentIconColor || legacyAccent);
  root.style.setProperty('--accent-cursor', siteSettings.accentCursorColor || legacyAccent);
  // Kim tuyến quanh tên: màu riêng, không dùng chung/lẫn với accent-icon nữa
  root.style.setProperty('--accent-sparkle', siteSettings.usernameSparkleColor || '#ff5c9a');

  if (siteSettings.mutedColor) root.style.setProperty('--muted', siteSettings.mutedColor);
  root.style.setProperty('--overlay-opacity', (Number(siteSettings.overlayOpacity ?? 45) / 100).toString());

  // Nền: tự nhận diện ảnh (jpg/png/gif/webp) hay video (mp4/webm) theo đuôi file
  const bgLayer = document.getElementById('bg-layer');
  const bgVideo = document.getElementById('bg-video');
  if (siteSettings.background) {
    const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(siteSettings.background);
    if (isVideo) {
      if (bgVideo.src !== siteSettings.background) bgVideo.src = siteSettings.background;
      bgVideo.hidden = false;
      bgVideo.play().catch(() => {}); // một số trình duyệt mobile cần user tương tác mới auto-play được
      bgLayer.style.backgroundImage = 'none';
    } else {
      bgVideo.hidden = true;
      bgVideo.removeAttribute('src');
      bgLayer.style.backgroundImage = `url('${siteSettings.background}')`;
    }
  }
  if (siteSettings.backgroundColor) {
    bgLayer.style.backgroundColor = siteSettings.backgroundColor;
  }

  // Font chung: việc tải Google Font đã gom chung vào loadGoogleFonts(), ở đây chỉ cần gán biến CSS
  const chosenFont = siteSettings.fontFamily === 'custom'
    ? (siteSettings.customFontFamily || 'Space Grotesk')
    : (siteSettings.fontFamily || 'Space Grotesk');
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

// ---------- Màn hình "nhấn để vào trang" ----------
function applyEnterOverlay() {
  const root = document.documentElement;
  const textEl = document.getElementById('enter-text');
  if (textEl) textEl.textContent = siteSettings.enterText || 'nhấn để vào trang';

  // Font riêng cho chữ này (nếu có) — việc tải Google Font đã gom chung vào loadGoogleFonts()
  if (siteSettings.enterFont) {
    root.style.setProperty('--enter-font', `'${siteSettings.enterFont}', sans-serif`);
  } else {
    root.style.removeProperty('--enter-font');
  }

  if (siteSettings.enterSize) root.style.setProperty('--enter-size', `${siteSettings.enterSize}px`);
  else root.style.removeProperty('--enter-size');

  if (siteSettings.enterColor) root.style.setProperty('--enter-color', siteSettings.enterColor);
  else root.style.removeProperty('--enter-color');
}

// ---------- Widget Discord ----------
let lanyardTimer = null;

function applyDiscord() {
  const box = document.getElementById('el-discord');
  box.hidden = !siteSettings.discordEnabled;
  if (siteSettings.discordEnabled && siteSettings.discordMode !== 'live') {
    renderDiscordManual();
  }
}

function renderDiscordManual() {
  document.getElementById('discord-avatar').src = siteSettings.discordManualAvatar || '';
  document.getElementById('discord-name').textContent = siteSettings.discordManualName || 'discord';
  document.getElementById('discord-tag').textContent = siteSettings.discordManualTag ? `#${siteSettings.discordManualTag}` : '';
  setDiscordMessage(siteSettings.discordManualMessage || '');
}

// Đặt chữ cho dòng trạng thái Discord; chữ sẽ luôn tự chạy (marquee) liên tục từ đầu
// đến cuối rồi lặp lại, tốc độ tính theo độ dài chữ để chữ ngắn hay dài đều chạy đều tay.
function setDiscordMessage(text) {
  const wrap = document.getElementById('discord-message');
  const inner = document.getElementById('discord-message-inner');
  inner.textContent = text || '';
  wrap.classList.remove('marquee');

  if (!inner.textContent.trim()) return;

  requestAnimationFrame(() => {
    const PX_PER_SEC = Number(siteSettings && siteSettings.discordMarqueeSpeed) || 18;
    const distance = wrap.clientWidth + inner.scrollWidth;
    const duration = Math.max(3.5, distance / PX_PER_SEC);
    wrap.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
    wrap.classList.add('marquee');
  });
}

// Tính lại tốc độ chạy chữ dòng trạng thái Discord sau khi #stage đã hiển thị thật sự.
// Cần thiết vì lần tính đầu tiên (lúc trang vừa load) diễn ra trong khi #stage vẫn còn
// display:none (chưa bấm "nhấn để vào trang"), nên clientWidth/scrollWidth đều = 0 và
// tốc độ đã lưu bị bỏ qua, luôn rơi về thời lượng tối thiểu mặc định.
function refreshDiscordMarquee() {
  const inner = document.getElementById('discord-message-inner');
  if (inner && inner.textContent.trim()) setDiscordMessage(inner.textContent);
}

// Khung avatar (avatar decoration): 'manual' = ảnh admin tự upload, 'live' = lấy thật
// từ Discord (được cập nhật trong fetchLanyard bên dưới khi bật chế độ Discord Live).
function applyAvatarFrame() {
  const frameImg = document.getElementById('avatar-frame-img');
  if (!siteSettings.avatarFrameEnabled) {
    frameImg.hidden = true;
    frameImg.src = '';
    return;
  }
  if (siteSettings.avatarFrameMode === 'manual') {
    if (siteSettings.avatarFrameManual) {
      frameImg.src = siteSettings.avatarFrameManual;
      frameImg.hidden = false;
    } else {
      frameImg.hidden = true;
      frameImg.src = '';
    }
  }
  // chế độ 'live' sẽ được fetchLanyard() cập nhật ảnh khung khi có dữ liệu
}

// Có cần gọi Lanyard API không: cần khi widget Discord ở chế độ live, HOẶC khung avatar
// đang lấy trực tiếp từ Discord — cả hai dùng chung 1 lượt fetch/poll để đỡ tốn request.
function refreshLanyardIfNeeded() {
  if (lanyardTimer) { clearInterval(lanyardTimer); lanyardTimer = null; }
  const discordLive = siteSettings.discordEnabled && siteSettings.discordMode === 'live' && siteSettings.discordId;
  const frameLive = siteSettings.avatarFrameEnabled && siteSettings.avatarFrameMode === 'live' && siteSettings.discordId;
  if (discordLive || frameLive) {
    fetchLanyard();
    lanyardTimer = setInterval(fetchLanyard, LANYARD_POLL_MS);
  }
}

async function fetchLanyard() {
  const discordLive = siteSettings.discordEnabled && siteSettings.discordMode === 'live' && siteSettings.discordId;
  const frameLive = siteSettings.avatarFrameEnabled && siteSettings.avatarFrameMode === 'live' && siteSettings.discordId;
  const discordId = siteSettings.discordId;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
    const json = await res.json();
    if (!json.success) throw new Error('lanyard lỗi');
    const d = json.data;
    const u = d.discord_user;

    if (discordLive) {
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
      setDiscordMessage(msg);
    }

    if (frameLive) {
      const frameImg = document.getElementById('avatar-frame-img');
      const deco = u.avatar_decoration_data;
      if (deco && deco.asset) {
        frameImg.src = `https://cdn.discordapp.com/avatar-decoration-presets/${deco.asset}.png?size=240&passthrough=true`;
        frameImg.hidden = false;
      } else {
        // tài khoản Discord hiện không gắn khung nào -> không hiện gì
        frameImg.hidden = true;
        frameImg.src = '';
      }
    }
  } catch (e) {
    // API lỗi hoặc user chưa join server Lanyard -> tạm hiện dữ liệu thủ công nếu có
    if (discordLive) renderDiscordManual();
    if (frameLive) {
      document.getElementById('avatar-frame-img').hidden = true;
    }
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

// Vị trí % + kích thước cố định (px) do admin chỉnh trên desktop có thể khiến khối
// (đặc biệt khung Discord/nhạc) tràn ra ngoài mép màn hình trên điện thoại (viewport hẹp
// hơn nhiều) — ảnh bìa/nút bấm nằm ngoài vùng nhìn thấy nên không hiện, không bấm được.
// Hàm này chỉ "kéo" khối vào lại bằng 1 offset hiển thị (--el-shift-x), không đụng tới
// top/left admin đã lưu, nên không ảnh hưởng tới việc chỉnh vị trí ở trang admin.
function clampPositionsToViewport() {
  const margin = 8; // px cách mép màn hình
  document.querySelectorAll('.pos-el').forEach((el) => {
    if (el.classList.contains('dragging')) return; // đang kéo-thả trong admin thì để yên
    el.style.setProperty('--el-shift-x', '0px'); // reset trước khi đo lại
    const rect = el.getBoundingClientRect();
    let shift = 0;
    if (rect.left < margin) shift = margin - rect.left;
    else if (rect.right > window.innerWidth - margin) shift = (window.innerWidth - margin) - rect.right;
    if (shift) el.style.setProperty('--el-shift-x', `${shift.toFixed(1)}px`);
  });
}

let clampResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(clampResizeTimer);
  clampResizeTimer = setTimeout(clampPositionsToViewport, 120);
});

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
  let selectedEl = null;

  function selectElement(el) {
    if (selectedEl) selectedEl.classList.remove('selected-el');
    selectedEl = el;
    if (selectedEl) selectedEl.classList.add('selected-el');
  }

  function onPointerDown(e) {
    dragEl = e.currentTarget;
    dragEl.classList.add('dragging');
    selectElement(dragEl);
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
    selectElement(resizeEl);
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

  // ---- Nhận lệnh căn trái / giữa / phải từ trang admin, áp cho khối đang được chọn ----
  const EDGE_MARGIN_VW = 4; // khoảng cách với mép màn hình khi căn trái/phải, tính theo % chiều rộng
  window.addEventListener('message', (e) => {
    const data = e.data || {};
    if (data.type !== 'milky-align' || !selectedEl) return;
    const rect = selectedEl.getBoundingClientRect();
    const vw = window.innerWidth;
    let leftPct;
    if (data.align === 'left') {
      leftPct = EDGE_MARGIN_VW + (rect.width / vw) * 50;
    } else if (data.align === 'right') {
      leftPct = 100 - EDGE_MARGIN_VW - (rect.width / vw) * 50;
    } else {
      leftPct = 50;
    }
    leftPct = Math.min(100, Math.max(0, leftPct));
    selectedEl.style.left = `${leftPct}%`;
    const key = selectedEl.dataset.posKey;
    const top = parseFloat(selectedEl.style.top);
    if (window.parent) {
      window.parent.postMessage({ type: 'milky-position-update', key, top, left: leftPct }, '*');
    }
  });

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

// Tải settings ngay khi trang mở (không đợi click) để chữ "nhấn để vào trang"
// hiện đúng nội dung/font/màu admin đã đặt ngay từ đầu, thay vì chỉ sau khi bấm.
const settingsReady = loadSiteSettings();

async function enterSite() {
  await settingsReady;
  overlay.classList.add('fade-out');
  stage.classList.remove('hidden');
  requestAnimationFrame(() => {
    stage.classList.add('visible');
    refreshDiscordMarquee();
    clampPositionsToViewport();
  });

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
  initUsernameSparkles();
}

// ---------- Kim tuyến bơi lượn quanh tên ----------
function initUsernameSparkles() {
  // Nếu admin đã dán code cấu hình riêng (tsParticles) cho hiệu ứng quanh tên thì không
  // tạo thêm các ngôi sao mặc định nữa, nhường chỗ hẳn cho hiệu ứng tùy chỉnh.
  if (usernameEffectMode !== 'default') return;
  const container = document.getElementById('username-sparkles');
  if (!container || container.dataset.built) return;
  container.dataset.built = '1';

  const glyphs = ['✦', '✧', '★', '✩', '❋', '·'];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.color = 'var(--accent-sparkle)';
    s.style.fontSize = `${8 + Math.random() * 6}px`;
    s.style.animationDuration = `${(1.8 + Math.random() * 1.8).toFixed(2)}s`;
    s.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
    container.appendChild(s);
  }
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

function spawnParticle(x, y, rgb) {
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    life: 1,
    size: Math.random() * 2.5 + 1,
    hue: rgb || '124,92,255',
  });
  if (particles.length > 160) particles.shift();
}

// Màu kim tuyến (dạng "r,g,b") cho 2 hiệu ứng particle: theo con trỏ chuột, và rải khắp trang.
// Cache lại thành biến để không phải đổi hex -> rgb mỗi lần spawn; applySparkleEffects() cập nhật khi settings tải xong.
let cursorParticleRgb = '124,92,255';
let pageParticleRgb = '255,92,154';

function applySparkleEffects() {
  cursorParticleRgb = hexToRgbTriplet(siteSettings.sparkleCursorColor) || '124,92,255';
  pageParticleRgb = hexToRgbTriplet(siteSettings.sparklePageColor) || '255,92,154';
}

// Đổi mã hex thành chuỗi "r,g,b" (không kèm độ mờ) để ghép vào rgba() lúc vẽ particle
function hexToRgbTriplet(hex) {
  if (!hex) return null;
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

window.addEventListener('pointermove', (e) => {
  // Nếu admin đã dán code cấu hình riêng (tsParticles) cho hiệu ứng theo con trỏ thì
  // dừng hẳn hiệu ứng particle tự chế ở đây, nhường chỗ cho hiệu ứng tùy chỉnh.
  if (cursorEffectMode !== 'default') return;
  spawnParticle(e.clientX, e.clientY, cursorParticleRgb);
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

// ---------- Hiệu ứng kim tuyến bằng JSON + particle bướm tùy chỉnh ----------
// Ngoài config tsParticles bình thường, pageParticlesConfig có thể dùng thêm:
// "butterfly": {
//   "enable": true,
//   "src": "/uploads/butterfly.svg",
//   "ratio": 0.333333,
//   "colors": ["#FFFFFF", "#C9B6FF", "#FFBDE6"],
//   "size": {"min": 8, "max": 16},
//   "opacity": {"min": 0.35, "max": 0.85},
//   "move": {"speed": {"min": 0.05, "max": 0.25}},
//   "rotate": {"min": 0, "max": 360, "speed": {"min": 0.15, "max": 0.6}, "direction": "random"}
// }
// Đây vẫn là JSON thuần, nên admin chỉ cần dán 1 khối JSON vào ô hiện có.
let cursorEffectMode = 'default';
let usernameEffectMode = 'default';
let pageEffectMode = 'default';

let tsParticlesLoadingPromise = null;
const customButterflyCanvases = new Map();
const customButterflyAnimations = new Map();

function ensureTsParticlesLoaded() {
  if (window.tsParticles) return Promise.resolve();
  if (tsParticlesLoadingPromise) return tsParticlesLoadingPromise;
  tsParticlesLoadingPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('không tải được thư viện tsParticles'));
    document.head.appendChild(s);
  });
  return tsParticlesLoadingPromise;
}

function destroyCustomButterflies(containerId) {
  const raf = customButterflyAnimations.get(containerId);
  if (raf) cancelAnimationFrame(raf);
  customButterflyAnimations.delete(containerId);

  const canvas = customButterflyCanvases.get(containerId);
  if (canvas) canvas.remove();
  customButterflyCanvases.delete(containerId);
}

function destroyTsParticlesContainer(containerId) {
  destroyCustomButterflies(containerId);
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
  const sizeRange = randomRange(butterflyConfig.size, 8, 16);
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
  const fadeRange = randomRange(butterflyConfig.fadeTime, 900, 1800);

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
  window.addEventListener('resize', resize);

  function spawnParticle(initial = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(speedRange);
    const rotationDirection = Math.random() < 0.5 ? -1 : 1;
    const size = randomBetween(sizeRange);
    const color = colors[Math.floor(Math.random() * colors.length)];

    const p = {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color,
      opacity: 0,
      targetOpacity: randomBetween(opacityRange),
      age: initial ? Math.random() * 5000 : -Math.random() * 1600,
      fadeTime: randomBetween(fadeRange),
      rotation: randomBetween(angleRange) * Math.PI / 180,
      rotationDirection,
      rotationSpeed: randomBetween(rotationSpeedRange),
      wave: Math.random() * Math.PI * 2,
      waveSpeed: 0.004 + Math.random() * 0.009,
      image: null,
    };

    p.image = colorizeButterflyImage(image, color);
    particles.push(p);
  }

  for (let i = 0; i < butterflyCount; i++) spawnParticle(true);

  let lastTime = performance.now();

  function frame(now) {
    if (!customButterflyCanvases.has(containerId)) return;

    const dt = Math.min(40, now - lastTime);
    lastTime = now;
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age < 0) continue;

      const fadeIn = Math.min(1, p.age / p.fadeTime);
      p.opacity = p.targetOpacity * fadeIn;

      p.x += p.vx * dt / 16.67;
      p.y += p.vy * dt / 16.67;
      p.x += Math.sin(p.age * p.waveSpeed + p.wave) * 0.08;
      p.y += Math.cos(p.age * p.waveSpeed * 0.75 + p.wave) * 0.05;
      p.rotation += p.rotationDirection * p.rotationSpeed * dt / 1000;

      const margin = p.size * 3 + 20;
      if (p.x < -margin || p.x > width + margin || p.y < -margin || p.y > height + margin) {
        particles.splice(i, 1);
        spawnParticle(false);
        continue;
      }

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

  const oldResize = canvas._milkyResize;
  if (oldResize) window.removeEventListener('resize', oldResize);
  canvas._milkyResize = resize;
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
    const butterfly = customConfig.butterfly;
    const total = Math.max(0, Number(customConfig.particles?.number?.value ?? 45));

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

function applyUsernameParticlesConfig() {
  return applyCustomParticles(
    'tsparticles-username',
    siteSettings && siteSettings.usernameSparkleConfig,
    (mode) => { usernameEffectMode = mode; },
  );
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
