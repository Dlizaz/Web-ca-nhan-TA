const loginScreen = document.getElementById('login-screen');
const adminScreen = document.getElementById('admin-screen');

const ICONS = ['discord', 'instagram', 'tiktok', 'youtube', 'twitter', 'github', 'spotify', 'link'];

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

  // ---- Nền trang ----
  const backgroundPreview = document.getElementById('background-preview');
  backgroundPreview.src = settings.background || '';
  backgroundPreview.style.visibility = settings.background ? 'visible' : 'hidden';
  document.getElementById('field-backgroundColor').value = settings.backgroundColor || '#07070b';
  const overlayVal = settings.overlayOpacity ?? 45;
  document.getElementById('field-overlayOpacity').value = overlayVal;
  document.getElementById('overlay-value').textContent = overlayVal;

  // ---- Màu chữ & font ----
  document.getElementById('field-textColor').value = settings.textColor || '#eaeaf2';
  document.getElementById('field-accentColor').value = settings.accentColor || '#7c5cff';
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
  document.getElementById('field-discordId').value = settings.discordId || '';
  const discordAvatarPreview = document.getElementById('discord-avatar-preview');
  discordAvatarPreview.src = settings.discordManualAvatar || '';
  discordAvatarPreview.style.visibility = settings.discordManualAvatar ? 'visible' : 'hidden';

  // ---- Popup khi click avatar ----
  document.getElementById('field-clickEnabled').checked = !!settings.clickEnabled;
  renderClickMessages(settings.clickMessages || []);
  document.getElementById('field-clickFont').value = settings.clickFont || '';
  document.getElementById('field-clickColor').value = settings.clickColor || '#ff9ecb';

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

function toggleDiscordModeFields() {
  const mode = document.getElementById('field-discordMode').value;
  document.getElementById('discord-manual-fields').classList.toggle('hidden', mode !== 'manual');
  document.getElementById('discord-live-fields').classList.toggle('hidden', mode !== 'live');
}
document.getElementById('field-discordMode').addEventListener('change', toggleDiscordModeFields);

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
    <input type="text" class="url-input" maxlength="300" placeholder="https://..." value="${escapeHtml(link.url || '')}" style="flex:2" />
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

// ---------- Giao diện: nền ----------
document.getElementById('save-appearance-bg').addEventListener('click', () => {
  const backgroundColor = document.getElementById('field-backgroundColor').value;
  const overlayOpacity = Number(document.getElementById('field-overlayOpacity').value);
  saveSettings({ backgroundColor, overlayOpacity }, 'status-appearance-bg');
});

// ---------- Giao diện: màu chữ & font ----------
document.getElementById('save-appearance-text').addEventListener('click', () => {
  const textColor = document.getElementById('field-textColor').value;
  const accentColor = document.getElementById('field-accentColor').value;
  const fontSelectValue = document.getElementById('field-fontFamily').value;
  const customFontFamily = document.getElementById('field-customFontFamily').value.trim();
  const fontFamily = fontSelectValue === 'custom' && customFontFamily ? 'custom' : fontSelectValue;
  saveSettings({ fontFamily, customFontFamily }, 'status-appearance-text');
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
  };
  saveSettings(patch, 'status-discord');
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
async function uploadFile(kind, inputEl, statusElId, onDone) {
  const statusEl = document.getElementById(statusElId);
  if (!inputEl.files[0]) { statusEl.textContent = 'chọn file trước đã'; setTimeout(() => (statusEl.textContent = ''), 2000); return; }

  const fd = new FormData();
  fd.append('file', inputEl.files[0]);
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

document.getElementById('upload-avatar').addEventListener('click', () => {
  uploadFile('avatar', document.getElementById('avatar-input'), 'status-avatar', (url) => {
    const el = document.getElementById('avatar-preview');
    el.src = url;
    el.style.visibility = 'visible';
  });
});

document.getElementById('upload-background').addEventListener('click', () => {
  uploadFile('background', document.getElementById('background-input'), 'status-background', (url) => {
    const el = document.getElementById('background-preview');
    el.src = url;
    el.style.visibility = 'visible';
  });
});

document.getElementById('upload-cursor').addEventListener('click', () => {
  uploadFile('cursor', document.getElementById('cursor-input'), 'status-cursor', (url) => {
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
