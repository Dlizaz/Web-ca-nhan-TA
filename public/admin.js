const loginScreen = document.getElementById('login-screen');
const adminScreen = document.getElementById('admin-screen');

const ICONS = ['discord', 'instagram', 'tiktok', 'youtube', 'twitter', 'github', 'spotify', 'link'];

// Danh sách font gợi ý, dùng chung cho font chữ chính và font riêng từng phần bên dưới
const FONT_OPTIONS = [
  'Space Grotesk', 'Inter', 'Poppins', 'Quicksand', 'Be Vietnam Pro', 'Nunito',
  'Montserrat', 'Comfortaa', 'Josefin Sans', 'Playfair Display', 'Dancing Script', 'Pacifico',
];

// Từng "phần chữ" ngoài trang có thể tự chọn riêng font + cỡ chữ (khớp key với script.js: TEXT_STYLE_KEYS)
const TEXT_STYLE_FIELDS = [
  { key: 'username', label: 'Tên hiển thị', min: 12, max: 48, def: 22 },
  { key: 'bio', label: 'Tiểu sử', min: 10, max: 28, def: 13 },
  { key: 'views', label: 'Lượt xem', min: 8, max: 20, def: 11 },
  { key: 'discordName', label: 'Tên Discord', min: 10, max: 24, def: 13 },
  { key: 'discordTag', label: 'Tag Discord', min: 8, max: 18, def: 11 },
  { key: 'discordMessage', label: 'Dòng trạng thái Discord', min: 8, max: 18, def: 11 },
  { key: 'musicTitle', label: 'Tên bài hát', min: 8, max: 22, def: 12 },
  { key: 'musicTime', label: 'Giờ nhạc', min: 8, max: 16, def: 10 },
  { key: 'links', label: 'Chữ nút link', min: 10, max: 24, def: 13 },
];

// Vị trí & kích thước mặc định (phải khớp với lib/store.js) — dùng cho nút "Khôi phục mặc định"
const DEFAULT_POSITIONS = {
  avatar:   { top: 10, left: 50 },
  username: { top: 24, left: 50 },
  bio:      { top: 30, left: 50 },
  views:    { top: 36, left: 50 },
  discord:  { top: 55, left: 18 },
  links:    { top: 80, left: 50 },
  music:    { top: 92, left: 20 },
};
const DEFAULT_SIZES = {
  avatar:   { scale: 1 },
  username: { scale: 1 },
  bio:      { scale: 1 },
  views:    { scale: 1 },
  discord:  { width: 280, height: 0 },
  links:    { scale: 1 },
  music:    { width: 300, height: 0 },
};

async function checkSession() {
  const res = await fetch('/api/session');
  const data = await res.json();
  if (data.loggedIn) showAdmin();
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const d = await res.json();
      errEl.textContent = d.error || 'Đăng nhập thất bại';
      return;
    }
    showAdmin();
  } catch {
    errEl.textContent = 'Lỗi kết nối';
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
});

async function showAdmin() {
  loginScreen.classList.add('hidden');
  adminScreen.classList.remove('hidden');
  await loadSettings();
}

let settings = null;

async function loadSettings() {
  const res = await fetch('/api/settings');
  settings = await res.json();

  // ---- Thông tin cơ bản ----
  document.getElementById('field-username').value = settings.username || '';
  renderBioLines(settings.bioLines || []);
  renderLinks(settings.links || []);

  // ---- Avatar ----
  const avatarPreview = document.getElementById('avatar-preview');
  avatarPreview.src = settings.avatar || '';
  avatarPreview.style.visibility = settings.avatar ? 'visible' : 'hidden';

  // ---- Nền trang (ảnh hoặc video, tự nhận diện theo đuôi file) ----
  renderBackgroundPreview(settings.background || '');
  document.getElementById('field-backgroundColor').value = settings.backgroundColor || '#07070b';
  const overlayVal = settings.overlayOpacity ?? 45;
  document.getElementById('field-overlayOpacity').value = overlayVal;
  document.getElementById('overlay-value').textContent = overlayVal;

  // ---- Màu chữ & font ----
  document.getElementById('field-textColor').value = settings.textColor || '#eaeaf2';
  // Site cũ chỉ có 1 "accentColor" duy nhất (trước khi tách 3 chỗ) -> dùng tạm màu đó làm giá trị khởi điểm
  const legacyAccent = settings.accentColor || '#7c5cff';
  document.getElementById('field-accentBorderColor').value = settings.accentBorderColor || legacyAccent;
  document.getElementById('field-accentIconColor').value = settings.accentIconColor || legacyAccent;
  document.getElementById('field-accentCursorColor').value = settings.accentCursorColor || legacyAccent;
  document.getElementById('field-mutedColor').value = settings.mutedColor || '#b7b7c6';
  const fontSelect = document.getElementById('field-fontFamily');
  const customFontInput = document.getElementById('field-customFontFamily');
  const knownFont = Array.from(fontSelect.options).some((o) => o.value === settings.fontFamily);
  if (settings.fontFamily === 'custom' || (settings.fontFamily && !knownFont)) {
    fontSelect.value = 'custom';
    customFontInput.value = settings.customFontFamily || settings.fontFamily || '';
    customFontInput.classList.remove('hidden');
  } else {
    fontSelect.value = settings.fontFamily || 'Space Grotesk';
    customFontInput.classList.add('hidden');
  }

  // ---- Con trỏ chuột ----
  const cursorPreview = document.getElementById('cursor-preview');
  cursorPreview.src = settings.cursor || '';
  cursorPreview.style.visibility = settings.cursor ? 'visible' : 'hidden';

  // ---- Discord ----
  document.getElementById('field-discordEnabled').checked = !!settings.discordEnabled;
  document.getElementById('field-discordMode').value = settings.discordMode || 'manual';
  toggleDiscordModeFields();
  document.getElementById('field-discordManualName').value = settings.discordManualName || '';
  document.getElementById('field-discordManualTag').value = settings.discordManualTag || '';
  document.getElementById('field-discordManualStatus').value = settings.discordManualStatus || 'online';
  document.getElementById('field-discordManualMessage').value = settings.discordManualMessage || '';
  const marqueeVal = settings.discordMarqueeSpeed ?? 18;
  document.getElementById('field-discordMarqueeSpeed').value = marqueeVal;
  document.getElementById('discordMarqueeSpeed-value').textContent = marqueeVal;
  document.getElementById('field-discordId').value = settings.discordId || '';
  const discordAvatarPreview = document.getElementById('discord-avatar-preview');
  discordAvatarPreview.src = settings.discordManualAvatar || '';
  discordAvatarPreview.style.visibility = settings.discordManualAvatar ? 'visible' : 'hidden';

  // ---- Khung ảnh đại diện ----
  document.getElementById('field-avatarFrameEnabled').checked = !!settings.avatarFrameEnabled;
  document.getElementById('field-avatarFrameMode').value = settings.avatarFrameMode || 'manual';
  toggleAvatarFrameModeFields();
  const avatarFramePreview = document.getElementById('avatar-frame-preview');
  avatarFramePreview.src = settings.avatarFrameManual || '';
  avatarFramePreview.style.visibility = settings.avatarFrameManual ? 'visible' : 'hidden';

  // ---- Popup khi click avatar ----
  document.getElementById('field-clickEnabled').checked = !!settings.clickEnabled;
  renderClickMessages(settings.clickMessages || []);
  document.getElementById('field-clickFont').value = settings.clickFont || '';
  document.getElementById('field-clickColor').value = settings.clickColor || '#ff9ecb';

  // ---- Màn hình "nhấn để vào trang" ----
  document.getElementById('field-enterText').value = settings.enterText || '';
  document.getElementById('field-enterFont').value = settings.enterFont || '';
  const enterSizeVal = settings.enterSize || 13;
  document.getElementById('field-enterSize').value = enterSizeVal;
  document.getElementById('enterSize-value').textContent = enterSizeVal;
  document.getElementById('field-enterColor').value = settings.enterColor || '#b7b7c6';

  // ---- Nhạc nền ----
  const songPreview = document.getElementById('song-preview');
  if (settings.song) songPreview.src = settings.song;
  const songCoverPreview = document.getElementById('song-cover-preview');
  songCoverPreview.src = settings.songCover || '';
  songCoverPreview.style.visibility = settings.songCover ? 'visible' : 'hidden';
  document.getElementById('field-songTitle').value = settings.songTitle || '';

  // ---- Màu khung Discord / nhạc / link ----
  const boxStyles = settings.boxStyles || {};
  fillBoxStyleFields('discord', boxStyles.discord || {});
  fillBoxStyleFields('music', boxStyles.music || {});
  fillBoxStyleFields('links', boxStyles.links || {});

  // ---- Hiệu ứng phát sáng chữ & icon ----
  document.getElementById('field-glowColor').value = settings.glowColor || '#7c5cff';
  const glowVal = settings.glowIntensity ?? 0;
  document.getElementById('field-glowIntensity').value = glowVal;
  document.getElementById('glowIntensity-value').textContent = glowVal;

  // ---- Hiệu ứng kim tuyến: 3 loại riêng biệt (con trỏ / tên / cả trang) ----
  document.getElementById('field-sparkleCursorColor').value = settings.sparkleCursorColor || '#7c5cff';
  document.getElementById('field-usernameSparkleColor').value = settings.usernameSparkleColor || '#ff5c9a';
  document.getElementById('field-sparklePageColor').value = settings.sparklePageColor || '#ff5c9a';
  document.getElementById('field-pageParticlesConfig').value = settings.pageParticlesConfig || '';

  // ---- Font & cỡ chữ riêng từng phần ----
  fillTextStyleFields(settings.textStyles || {});

  // ---- Reset danh sách thay đổi vị trí/kích thước đang chờ lưu ----
  pendingPositions = {};
  pendingSizes = {};
}

function fillBoxStyleFields(key, style) {
  const defaults = {
    discord: { bg: '#101018', bgOpacity: 60, border: '#ffffff', borderOpacity: 10 },
    music:   { bg: '#101018', bgOpacity: 60, border: '#ffffff', borderOpacity: 10 },
    links:   { bg: '#101018', bgOpacity: 55, border: '#ffffff', borderOpacity: 12 },
  }[key];
  const bg = style.bg || defaults.bg;
  const bgOpacity = style.bgOpacity ?? defaults.bgOpacity;
  const border = style.border || defaults.border;
  const borderOpacity = style.borderOpacity ?? defaults.borderOpacity;

  document.getElementById(`field-${key}Bg`).value = bg;
  document.getElementById(`field-${key}BgOpacity`).value = bgOpacity;
  document.getElementById(`${key}BgOpacity-value`).textContent = bgOpacity;
  document.getElementById(`field-${key}Border`).value = border;
  document.getElementById(`field-${key}BorderOpacity`).value = borderOpacity;
  document.getElementById(`${key}BorderOpacity-value`).textContent = borderOpacity;
}

// ---------- Font & cỡ chữ riêng cho từng phần chữ ----------
// Tạo sẵn 9 khối (mỗi khối: chọn font + ô nhập font tự do + thanh trượt cỡ chữ) bằng JS,
// thay vì viết tay 9 lần trong admin.html, để đỡ trùng lặp và dễ sửa cỡ min/max sau này.
function buildTextStyleFields() {
  const container = document.getElementById('textstyle-grid');
  if (!container) return;

  container.innerHTML = TEXT_STYLE_FIELDS.map(({ key, label, min, max, def }) => `
    <div class="textstyle-col">
      <h3>${label}</h3>
      <label>Font chữ</label>
      <select id="field-ts-${key}-font">
        <option value="">Dùng font chung</option>
        ${FONT_OPTIONS.map((f) => `<option value="${f}">${f}</option>`).join('')}
        <option value="custom">Tự nhập tên Google Font khác...</option>
      </select>
      <input type="text" id="field-ts-${key}-fontCustom" placeholder="ví dụ: Baloo 2" class="hidden" />
      <label>Cỡ chữ: <span id="ts-${key}-size-value">${def}</span>px</label>
      <input type="range" id="field-ts-${key}-size" min="${min}" max="${max}" step="1" value="${def}" />
    </div>
  `).join('');

  TEXT_STYLE_FIELDS.forEach(({ key }) => {
    const select = document.getElementById(`field-ts-${key}-font`);
    const customInput = document.getElementById(`field-ts-${key}-fontCustom`);
    select.addEventListener('change', () => {
      customInput.classList.toggle('hidden', select.value !== 'custom');
    });

    const range = document.getElementById(`field-ts-${key}-size`);
    const valueLabel = document.getElementById(`ts-${key}-size-value`);
    range.addEventListener('input', () => (valueLabel.textContent = range.value));
  });
}
buildTextStyleFields();

function fillTextStyleFields(textStyles) {
  TEXT_STYLE_FIELDS.forEach(({ key, def }) => {
    const st = textStyles[key] || {};
    const select = document.getElementById(`field-ts-${key}-font`);
    const customInput = document.getElementById(`field-ts-${key}-fontCustom`);
    const knownFont = FONT_OPTIONS.includes(st.font);

    if (st.font === 'custom' || (st.font && !knownFont)) {
      select.value = 'custom';
      customInput.value = st.customFont || st.font || '';
      customInput.classList.remove('hidden');
    } else {
      select.value = st.font || '';
      customInput.value = '';
      customInput.classList.add('hidden');
    }

    const size = st.size || def;
    document.getElementById(`field-ts-${key}-size`).value = size;
    document.getElementById(`ts-${key}-size-value`).textContent = size;
  });
}

function toggleDiscordModeFields() {
  const mode = document.getElementById('field-discordMode').value;
  document.getElementById('discord-manual-fields').classList.toggle('hidden', mode !== 'manual');
  document.getElementById('discord-live-fields').classList.toggle('hidden', mode !== 'live');
}
document.getElementById('field-discordMode').addEventListener('change', toggleDiscordModeFields);

function toggleAvatarFrameModeFields() {
  const mode = document.getElementById('field-avatarFrameMode').value;
  document.getElementById('avatar-frame-manual-fields').classList.toggle('hidden', mode !== 'manual');
  document.getElementById('avatar-frame-live-fields').classList.toggle('hidden', mode !== 'live');
}
document.getElementById('field-avatarFrameMode').addEventListener('change', toggleAvatarFrameModeFields);

document.getElementById('field-fontFamily').addEventListener('change', (e) => {
  document.getElementById('field-customFontFamily').classList.toggle('hidden', e.target.value !== 'custom');
});

// ---------- Thanh trượt hiển thị số % trực tiếp ----------
function wireRangeDisplay(rangeId, labelId) {
  const el = document.getElementById(rangeId);
  const label = document.getElementById(labelId);
  if (!el || !label) return;
  el.addEventListener('input', () => (label.textContent = el.value));
}
wireRangeDisplay('field-overlayOpacity', 'overlay-value');
wireRangeDisplay('field-discordBgOpacity', 'discordBgOpacity-value');
wireRangeDisplay('field-discordBorderOpacity', 'discordBorderOpacity-value');
wireRangeDisplay('field-musicBgOpacity', 'musicBgOpacity-value');
wireRangeDisplay('field-musicBorderOpacity', 'musicBorderOpacity-value');
wireRangeDisplay('field-linksBgOpacity', 'linksBgOpacity-value');
wireRangeDisplay('field-linksBorderOpacity', 'linksBorderOpacity-value');
wireRangeDisplay('field-glowIntensity', 'glowIntensity-value');
wireRangeDisplay('field-discordMarqueeSpeed', 'discordMarqueeSpeed-value');

// ---------- Helper lưu settings ----------
async function saveSettings(patch, statusElId) {
  const statusEl = document.getElementById(statusElId);
  statusEl.textContent = 'Đang lưu...';
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      if (data.settings) settings = data.settings;
      statusEl.textContent = '✓ đã lưu';
    } else {
      statusEl.textContent = data.error || 'lỗi khi lưu';
    }
  } catch {
    statusEl.textContent = 'lỗi kết nối';
  }
  setTimeout(() => (statusEl.textContent = ''), 2200);
}

// ---------- Bio lines ----------
function renderBioLines(lines) {
  const container = document.getElementById('bio-lines');
  container.innerHTML = '';
  (lines.length ? lines : ['']).forEach((line) => addBioLineRow(line));
}

function addBioLineRow(value = '') {
  const container = document.getElementById('bio-lines');
  const row = document.createElement('div');
  row.className = 'bio-line-row';
  row.innerHTML = `
    <input type="text" maxlength="120" value="${escapeHtml(value)}" placeholder="một dòng tiểu sử..." />
    <button type="button" class="remove-btn" title="xóa">✕</button>
  `;
  row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

document.getElementById('add-bio-line').addEventListener('click', () => addBioLineRow());

document.getElementById('save-basic').addEventListener('click', () => {
  const username = document.getElementById('field-username').value;
  const bioLines = Array.from(document.querySelectorAll('#bio-lines input')).map((i) => i.value);
  saveSettings({ username, bioLines }, 'status-basic');
});

// ---------- Links ----------
function renderLinks(links) {
  const container = document.getElementById('links-list');
  container.innerHTML = '';
  links.forEach((l) => addLinkRow(l));
}

function addLinkRow(link = { label: '', url: '', icon: 'link' }) {
  const container = document.getElementById('links-list');
  const row = document.createElement('div');
  row.className = 'link-row';
  row.innerHTML = `
    <select class="icon-select">
      ${ICONS.map((i) => `<option value="${i}" ${i === link.icon ? 'selected' : ''}>${i}</option>`).join('')}
    </select>
    <input type="text" class="label-input" maxlength="30" placeholder="Tên nút" value="${escapeHtml(link.label || '')}" />
    <input type="text" class="url-input" maxlength="300" placeholder="https://..." value="${escapeHtml(link.url || '')}" />
    <button type="button" class="remove-btn" title="xóa">✕</button>
  `;
  row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

document.getElementById('add-link').addEventListener('click', () => addLinkRow());

document.getElementById('save-links').addEventListener('click', () => {
  const rows = document.querySelectorAll('#links-list .link-row');
  const links = Array.from(rows).map((row) => ({
    icon: row.querySelector('.icon-select').value,
    label: row.querySelector('.label-input').value,
    url: row.querySelector('.url-input').value,
  })).filter((l) => l.url.trim());
  saveSettings({ links }, 'status-links');
});

// ---------- Nội dung khi click vào avatar ----------
function renderClickMessages(messages) {
  const container = document.getElementById('click-messages');
  container.innerHTML = '';
  (messages.length ? messages : ['']).forEach((m) => addClickMessageRow(m));
}

function addClickMessageRow(value = '') {
  const container = document.getElementById('click-messages');
  const row = document.createElement('div');
  row.className = 'bio-line-row';
  row.innerHTML = `
    <input type="text" maxlength="60" value="${escapeHtml(value)}" placeholder="một câu sẽ hiện ngẫu nhiên..." />
    <button type="button" class="remove-btn" title="xóa">✕</button>
  `;
  row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

document.getElementById('add-click-message').addEventListener('click', () => addClickMessageRow());

document.getElementById('save-click').addEventListener('click', () => {
  const clickEnabled = document.getElementById('field-clickEnabled').checked;
  const clickMessages = Array.from(document.querySelectorAll('#click-messages input')).map((i) => i.value);
  const clickFont = document.getElementById('field-clickFont').value;
  const clickColor = document.getElementById('field-clickColor').value;
  saveSettings({ clickEnabled, clickMessages, clickFont, clickColor }, 'status-click');
});

// ---------- Màn hình "nhấn để vào trang" ----------
document.getElementById('field-enterSize').addEventListener('input', (e) => {
  document.getElementById('enterSize-value').textContent = e.target.value;
});

let clearedEnterColor = false;
document.getElementById('clear-enter-color').addEventListener('click', () => {
  clearedEnterColor = true;
  document.getElementById('field-enterColor').value = '#b7b7c6';
});

document.getElementById('field-enterColor').addEventListener('input', () => {
  clearedEnterColor = false;
});

document.getElementById('save-enter').addEventListener('click', () => {
  const enterText = document.getElementById('field-enterText').value;
  const enterFont = document.getElementById('field-enterFont').value;
  const enterSize = document.getElementById('field-enterSize').value;
  const enterColor = clearedEnterColor ? '' : document.getElementById('field-enterColor').value;
  clearedEnterColor = false;
  saveSettings({ enterText, enterFont, enterSize, enterColor }, 'status-enter');
});

// ---------- Giao diện: nền ----------
document.getElementById('save-appearance-bg').addEventListener('click', () => {
  const backgroundColor = document.getElementById('field-backgroundColor').value;
  const overlayOpacity = Number(document.getElementById('field-overlayOpacity').value);
  saveSettings({ backgroundColor, overlayOpacity }, 'status-appearance-bg');
});

// ---------- Giao diện: màu chữ & font ----------
document.getElementById('save-appearance-text').addEventListener('click', () => {
  const textColor = document.getElementById('field-textColor').value;
  const accentBorderColor = document.getElementById('field-accentBorderColor').value;
  const accentIconColor = document.getElementById('field-accentIconColor').value;
  const accentCursorColor = document.getElementById('field-accentCursorColor').value;
  const mutedColor = document.getElementById('field-mutedColor').value;
  const fontSelectValue = document.getElementById('field-fontFamily').value;
  const customFontFamily = document.getElementById('field-customFontFamily').value.trim();
  const fontFamily = fontSelectValue === 'custom' && customFontFamily ? 'custom' : fontSelectValue;
  saveSettings({
    textColor, accentBorderColor, accentIconColor, accentCursorColor,
    mutedColor, fontFamily, customFontFamily,
  }, 'status-appearance-text');
});

// ---------- Hiệu ứng phát sáng chữ & icon ----------
document.getElementById('save-glow').addEventListener('click', () => {
  const glowColor = document.getElementById('field-glowColor').value;
  const glowIntensity = Number(document.getElementById('field-glowIntensity').value);
  saveSettings({ glowColor, glowIntensity }, 'status-glow');
});

// ---------- Hiệu ứng kim tuyến: 3 loại riêng biệt (con trỏ / tên / cả trang) ----------
document.getElementById('save-sparkle').addEventListener('click', () => {
  const sparkleCursorColor = document.getElementById('field-sparkleCursorColor').value;
  const usernameSparkleColor = document.getElementById('field-usernameSparkleColor').value;
  const sparklePageColor = document.getElementById('field-sparklePageColor').value;
  const pageParticlesConfig = document.getElementById('field-pageParticlesConfig').value.trim();
  if (pageParticlesConfig) {
    try {
      JSON.parse(pageParticlesConfig);
    } catch (e) {
      const statusEl = document.getElementById('status-sparkle');
      statusEl.textContent = 'Code JSON không hợp lệ, kiểm tra lại dấu ngoặc/dấu phẩy nhé.';
      setTimeout(() => (statusEl.textContent = ''), 3500);
      return;
    }
  }
  saveSettings({ sparkleCursorColor, usernameSparkleColor, sparklePageColor, pageParticlesConfig }, 'status-sparkle');
});

// ---------- Font & cỡ chữ riêng từng phần ----------
document.getElementById('save-textstyles').addEventListener('click', () => {
  const textStyles = {};
  TEXT_STYLE_FIELDS.forEach(({ key }) => {
    const selectValue = document.getElementById(`field-ts-${key}-font`).value;
    const customFont = document.getElementById(`field-ts-${key}-fontCustom`).value.trim();
    const font = selectValue === 'custom' && customFont ? 'custom' : selectValue;
    const size = Number(document.getElementById(`field-ts-${key}-size`).value);
    textStyles[key] = { font, customFont, size };
  });
  saveSettings({ textStyles }, 'status-textstyles');
});

// ---------- Widget Discord ----------
document.getElementById('save-discord').addEventListener('click', () => {
  const patch = {
    discordEnabled: document.getElementById('field-discordEnabled').checked,
    discordMode: document.getElementById('field-discordMode').value,
    discordId: document.getElementById('field-discordId').value,
    discordManualName: document.getElementById('field-discordManualName').value,
    discordManualTag: document.getElementById('field-discordManualTag').value,
    discordManualStatus: document.getElementById('field-discordManualStatus').value,
    discordManualMessage: document.getElementById('field-discordManualMessage').value,
    discordMarqueeSpeed: Number(document.getElementById('field-discordMarqueeSpeed').value),
  };
  saveSettings(patch, 'status-discord');
});

// ---------- Khung ảnh đại diện ----------
document.getElementById('save-avatar-frame').addEventListener('click', () => {
  const patch = {
    avatarFrameEnabled: document.getElementById('field-avatarFrameEnabled').checked,
    avatarFrameMode: document.getElementById('field-avatarFrameMode').value,
  };
  saveSettings(patch, 'status-avatar-frame');
});

// ---------- Tên bài hát ----------
document.getElementById('save-song-title').addEventListener('click', () => {
  const songTitle = document.getElementById('field-songTitle').value;
  saveSettings({ songTitle }, 'status-song-title');
});

// ---------- Màu khung Discord / nhạc / link ----------
document.getElementById('save-boxstyles').addEventListener('click', () => {
  const readBox = (key) => ({
    bg: document.getElementById(`field-${key}Bg`).value,
    bgOpacity: Number(document.getElementById(`field-${key}BgOpacity`).value),
    border: document.getElementById(`field-${key}Border`).value,
    borderOpacity: Number(document.getElementById(`field-${key}BorderOpacity`).value),
  });
  const boxStyles = {
    discord: readBox('discord'),
    music: readBox('music'),
    links: readBox('links'),
  };
  saveSettings({ boxStyles }, 'status-boxstyles');
});

// ---------- Upload chung (avatar / background / cursor / song / songCover / discordManualAvatar) ----------
async function uploadFile(kind, fileSource, statusElId, onDone) {
  const statusEl = document.getElementById(statusElId);
  const file = fileSource instanceof File ? fileSource : fileSource.files[0];
  if (!file) { statusEl.textContent = 'chọn file trước đã'; setTimeout(() => (statusEl.textContent = ''), 2000); return; }

  const fd = new FormData();
  fd.append('file', file);
  statusEl.textContent = 'Đang tải lên...';

  try {
    const res = await fetch(`/api/upload/${kind}`, { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      statusEl.textContent = '✓ đã tải lên';
      if (onDone) onDone(data.url);
    } else {
      statusEl.textContent = data.error || 'lỗi khi tải lên';
    }
  } catch {
    statusEl.textContent = 'lỗi kết nối';
  }
  setTimeout(() => (statusEl.textContent = ''), 2500);
}

// Trình duyệt chỉ hiển thị được con trỏ ảnh ở kích thước rất nhỏ (thường tối đa ~128px,
// khuyến nghị 32px). Ảnh gốc lớn hơn sẽ bị trình duyệt ÂM THẦM bỏ qua và quay về con trỏ
// mặc định — không báo lỗi gì, nên nhìn như "lưu rồi mà không hiện". Vì vậy luôn thu nhỏ
// ảnh về đúng kích thước con trỏ (giữ khung trong suốt, căn giữa) trước khi tải lên.
function resizeCursorImage(file, size = 32) {
  return new Promise((resolve) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) {
      resolve(file); // .cur/.ico: canvas không đọc được, giữ nguyên file gốc
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(objectUrl);
        resolve(blob ? new File([blob], 'cursor.png', { type: 'image/png' }) : file);
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

document.getElementById('upload-avatar').addEventListener('click', () => {
  uploadFile('avatar', document.getElementById('avatar-input'), 'status-avatar', (url) => {
    const el = document.getElementById('avatar-preview');
    el.src = url;
    el.style.visibility = 'visible';
  });
});

document.getElementById('upload-background').addEventListener('click', () => {
  uploadFile('background', document.getElementById('background-input'), 'status-background', (url) => {
    renderBackgroundPreview(url);
  });
});

// Hiện đúng ô xem trước (ảnh hoặc video) tuỳ theo đuôi file nền
function renderBackgroundPreview(url) {
  const img = document.getElementById('background-preview');
  const video = document.getElementById('background-preview-video');
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url || '');
  if (isVideo) {
    img.hidden = true;
    img.style.visibility = 'hidden';
    video.src = url;
    video.hidden = false;
  } else {
    video.hidden = true;
    video.removeAttribute('src');
    img.hidden = false;
    img.src = url || '';
    img.style.visibility = url ? 'visible' : 'hidden';
  }
}

document.getElementById('upload-cursor').addEventListener('click', async () => {
  const inputEl = document.getElementById('cursor-input');
  const statusEl = document.getElementById('status-cursor');
  if (!inputEl.files[0]) { statusEl.textContent = 'chọn file trước đã'; setTimeout(() => (statusEl.textContent = ''), 2000); return; }
  statusEl.textContent = 'Đang xử lý ảnh...';
  const resized = await resizeCursorImage(inputEl.files[0], 32);
  uploadFile('cursor', resized, 'status-cursor', (url) => {
    const el = document.getElementById('cursor-preview');
    el.src = url;
    el.style.visibility = 'visible';
  });
});

document.getElementById('upload-discord-avatar').addEventListener('click', () => {
  uploadFile('discordManualAvatar', document.getElementById('discord-avatar-input'), 'status-discord', (url) => {
    const el = document.getElementById('discord-avatar-preview');
    el.src = url;
    el.style.visibility = 'visible';
  });
});

document.getElementById('upload-avatar-frame').addEventListener('click', () => {
  uploadFile('avatarFrameManual', document.getElementById('avatar-frame-input'), 'status-avatar-frame', (url) => {
    const el = document.getElementById('avatar-frame-preview');
    el.src = url;
    el.style.visibility = 'visible';
  });
});

document.getElementById('upload-song').addEventListener('click', () => {
  uploadFile('song', document.getElementById('song-input'), 'status-song', (url) => {
    document.getElementById('song-preview').src = url;
  });
});

document.getElementById('upload-song-cover').addEventListener('click', () => {
  uploadFile('songCover', document.getElementById('song-cover-input'), 'status-song', (url) => {
    const el = document.getElementById('song-cover-preview');
    el.src = url;
    el.style.visibility = 'visible';
  });
});

// ---------- Vị trí & kích thước (kéo thả / kéo giãn trong iframe xem trước) ----------
let pendingPositions = {};
let pendingSizes = {};

window.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.type === 'milky-position-update' && data.key) {
    pendingPositions[data.key] = { top: data.top, left: data.left };
  } else if (data.type === 'milky-size-update' && data.key) {
    if (data.width !== undefined || data.height !== undefined) {
      pendingSizes[data.key] = { width: data.width, height: data.height };
    } else if (data.scale !== undefined) {
      pendingSizes[data.key] = { scale: data.scale };
    }
  }
});

// ---- Nút căn trái / căn giữa / căn phải: gửi lệnh vào iframe, áp cho khối đang được chọn ----
function sendAlign(align) {
  const iframe = document.getElementById('position-iframe');
  if (iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'milky-align', align }, '*');
  }
}
document.getElementById('align-left').addEventListener('click', () => sendAlign('left'));
document.getElementById('align-center').addEventListener('click', () => sendAlign('center'));
document.getElementById('align-right').addEventListener('click', () => sendAlign('right'));

document.getElementById('save-positions').addEventListener('click', async () => {
  const statusEl = document.getElementById('status-positions');
  if (!Object.keys(pendingPositions).length && !Object.keys(pendingSizes).length) {
    statusEl.textContent = 'chưa có thay đổi nào để lưu';
    setTimeout(() => (statusEl.textContent = ''), 2000);
    return;
  }
  const patch = {};
  if (Object.keys(pendingPositions).length) patch.positions = pendingPositions;
  if (Object.keys(pendingSizes).length) patch.sizes = pendingSizes;
  await saveSettings(patch, 'status-positions');
  pendingPositions = {};
  pendingSizes = {};
});

document.getElementById('reset-positions').addEventListener('click', async () => {
  const statusEl = document.getElementById('status-positions');
  statusEl.textContent = 'Đang khôi phục...';
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ positions: DEFAULT_POSITIONS, sizes: DEFAULT_SIZES }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.settings) settings = data.settings;
  pendingPositions = {};
  pendingSizes = {};
  const iframe = document.getElementById('position-iframe');
  iframe.src = `/?editPositions=1&t=${Date.now()}`; // reload để lấy vị trí/kích thước mặc định mới áp
  statusEl.textContent = res.ok ? '✓ đã khôi phục' : 'lỗi khi khôi phục';
  setTimeout(() => (statusEl.textContent = ''), 2000);
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}

checkSession();
