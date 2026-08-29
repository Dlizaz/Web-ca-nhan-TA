const loginScreen = document.getElementById('login-screen');
const adminScreen = document.getElementById('admin-screen');

const ICONS = ['discord', 'instagram', 'tiktok', 'youtube', 'twitter', 'github', 'spotify', 'link'];

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

  document.getElementById('field-username').value = settings.username || '';

  renderBioLines(settings.bioLines || []);
  renderLinks(settings.links || []);

  const avatarPreview = document.getElementById('avatar-preview');
  avatarPreview.src = settings.avatar || '';
  avatarPreview.style.visibility = settings.avatar ? 'visible' : 'hidden';

  const songPreview = document.getElementById('song-preview');
  if (settings.song) songPreview.src = settings.song;
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

document.getElementById('save-basic').addEventListener('click', async () => {
  const username = document.getElementById('field-username').value;
  const bioLines = Array.from(document.querySelectorAll('#bio-lines input')).map((i) => i.value);

  const statusEl = document.getElementById('status-basic');
  statusEl.textContent = 'Đang lưu...';
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, bioLines }),
  });
  statusEl.textContent = res.ok ? '✓ đã lưu' : 'lỗi khi lưu';
  setTimeout(() => (statusEl.textContent = ''), 2000);
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

document.getElementById('save-links').addEventListener('click', async () => {
  const rows = document.querySelectorAll('#links-list .link-row');
  const links = Array.from(rows).map((row) => ({
    icon: row.querySelector('.icon-select').value,
    label: row.querySelector('.label-input').value,
    url: row.querySelector('.url-input').value,
  })).filter((l) => l.url.trim());

  const statusEl = document.getElementById('status-links');
  statusEl.textContent = 'Đang lưu...';
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ links }),
  });
  statusEl.textContent = res.ok ? '✓ đã lưu' : 'lỗi khi lưu';
  setTimeout(() => (statusEl.textContent = ''), 2000);
});

// ---------- Avatar upload ----------
document.getElementById('upload-avatar').addEventListener('click', async () => {
  const input = document.getElementById('avatar-input');
  const statusEl = document.getElementById('status-avatar');
  if (!input.files[0]) { statusEl.textContent = 'chọn ảnh trước đã'; return; }

  const fd = new FormData();
  fd.append('file', input.files[0]);
  statusEl.textContent = 'Đang tải lên...';

  const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd });
  const data = await res.json();
  if (res.ok) {
    document.getElementById('avatar-preview').src = data.avatar;
    document.getElementById('avatar-preview').style.visibility = 'visible';
    statusEl.textContent = '✓ đã tải lên';
  } else {
    statusEl.textContent = data.error || 'lỗi khi tải lên';
  }
  setTimeout(() => (statusEl.textContent = ''), 2500);
});

// ---------- Song upload ----------
document.getElementById('upload-song').addEventListener('click', async () => {
  const input = document.getElementById('song-input');
  const statusEl = document.getElementById('status-song');
  if (!input.files[0]) { statusEl.textContent = 'chọn file nhạc trước đã'; return; }

  const fd = new FormData();
  fd.append('file', input.files[0]);
  statusEl.textContent = 'Đang tải lên...';

  const res = await fetch('/api/upload/song', { method: 'POST', body: fd });
  const data = await res.json();
  if (res.ok) {
    document.getElementById('song-preview').src = data.song;
    statusEl.textContent = '✓ đã tải lên';
  } else {
    statusEl.textContent = data.error || 'lỗi khi tải lên';
  }
  setTimeout(() => (statusEl.textContent = ''), 2500);
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}

checkSession();
