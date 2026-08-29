const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');

const store = require('./lib/store');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-doi-di-nha';

const ALLOWED_ICONS = ['discord', 'instagram', 'tiktok', 'youtube', 'twitter', 'github', 'spotify', 'link'];
const ALLOWED_UPLOAD_KINDS = ['avatar', 'song', 'background', 'cursor', 'songCover', 'discordManualAvatar'];
const ALLOWED_POSITION_KEYS = ['avatar', 'username', 'bio', 'views', 'discord', 'links', 'music'];
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 tiếng
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// ---------- Upload config (lưu vào bộ nhớ tạm, rồi đẩy qua store.saveUpload) ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const kind = req.uploadKind;
    const okImage = /image\/(png|jpe?g|webp|gif|x-icon|vnd\.microsoft\.icon)/.test(file.mimetype);
    const okAudio = /audio\/(mpeg|mp3|wav|ogg)/.test(file.mimetype) || file.originalname.endsWith('.mp3');
    if (kind === 'song' && !okAudio) return cb(new Error('File nhạc phải là audio (mp3/wav/ogg)'));
    if (kind !== 'song' && !okImage) return cb(new Error('File phải là ảnh (png/jpg/webp/gif)'));
    cb(null, true);
  },
});

// ---------- Public API ----------
app.get('/api/settings', async (req, res) => {
  try {
    res.json(await store.getSettings());
  } catch (e) {
    res.status(500).json({ error: 'không đọc được settings' });
  }
});

// Phục vụ file lưu trong GridFS (chỉ dùng ở chế độ mongo; chế độ file dùng express.static bên dưới)
app.get('/uploads/file/:id', (req, res) => store.streamFile(req, res));

// ---------- Auth ----------
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'sai mật khẩu' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.loggedIn) });
});

// ---------- Protected: update settings ----------
app.post('/api/settings', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const patch = {};

    // ----- Thông tin cơ bản -----
    if (typeof b.username === 'string' && b.username.trim()) {
      patch.username = b.username.trim().slice(0, 40);
    }
    if (Array.isArray(b.bioLines)) {
      patch.bioLines = b.bioLines
        .filter((l) => typeof l === 'string' && l.trim())
        .slice(0, 8)
        .map((l) => l.slice(0, 120));
    }
    if (Array.isArray(b.links)) {
      patch.links = b.links
        .filter((l) => l && typeof l.url === 'string' && l.url.trim())
        .slice(0, 12)
        .map((l) => ({
          label: String(l.label || 'Link').slice(0, 30),
          url: String(l.url).slice(0, 300),
          icon: ALLOWED_ICONS.includes(l.icon) ? l.icon : 'link',
        }));
    }
    if (typeof b.songTitle === 'string') patch.songTitle = b.songTitle.slice(0, 80);

    // ----- Giao diện -----
    if (typeof b.backgroundColor === 'string' && HEX_RE.test(b.backgroundColor)) patch.backgroundColor = b.backgroundColor;
    if (typeof b.textColor === 'string' && HEX_RE.test(b.textColor)) patch.textColor = b.textColor;
    if (typeof b.accentColor === 'string' && HEX_RE.test(b.accentColor)) patch.accentColor = b.accentColor;
    if (b.overlayOpacity !== undefined) {
      const n = Number(b.overlayOpacity);
      if (!Number.isNaN(n)) patch.overlayOpacity = Math.min(90, Math.max(0, n));
    }
    if (typeof b.fontFamily === 'string') patch.fontFamily = b.fontFamily.slice(0, 60);
    if (typeof b.customFontFamily === 'string') patch.customFontFamily = b.customFontFamily.slice(0, 60);

    // ----- Discord -----
    if (typeof b.discordEnabled === 'boolean') patch.discordEnabled = b.discordEnabled;
    if (['manual', 'live'].includes(b.discordMode)) patch.discordMode = b.discordMode;
    if (typeof b.discordId === 'string') patch.discordId = b.discordId.trim().slice(0, 32);
    if (typeof b.discordManualName === 'string') patch.discordManualName = b.discordManualName.slice(0, 40);
    if (typeof b.discordManualTag === 'string') patch.discordManualTag = b.discordManualTag.slice(0, 40);
    if (['online', 'idle', 'dnd', 'offline'].includes(b.discordManualStatus)) patch.discordManualStatus = b.discordManualStatus;
    if (typeof b.discordManualMessage === 'string') patch.discordManualMessage = b.discordManualMessage.slice(0, 140);

    // ----- Popup khi click -----
    if (typeof b.clickEnabled === 'boolean') patch.clickEnabled = b.clickEnabled;
    if (Array.isArray(b.clickMessages)) {
      patch.clickMessages = b.clickMessages
        .filter((m) => typeof m === 'string' && m.trim())
        .slice(0, 15)
        .map((m) => m.slice(0, 60));
    }
    if (typeof b.clickFont === 'string') patch.clickFont = b.clickFont.slice(0, 60);
    if (typeof b.clickColor === 'string' && HEX_RE.test(b.clickColor)) patch.clickColor = b.clickColor;

    // ----- Vị trí tự do (merge nông theo từng khối để không mất phần chưa gửi) -----
    if (b.positions && typeof b.positions === 'object') {
      const posPatch = {};
      for (const key of ALLOWED_POSITION_KEYS) {
        const p = b.positions[key];
        if (p && typeof p === 'object') {
          const top = Number(p.top);
          const left = Number(p.left);
          if (!Number.isNaN(top) && !Number.isNaN(left)) {
            posPatch[key] = { top: Math.min(100, Math.max(0, top)), left: Math.min(100, Math.max(0, left)) };
          }
        }
      }
      if (Object.keys(posPatch).length) {
        const current = await store.getSettings();
        patch.positions = { ...(current.positions || {}), ...posPatch };
      }
    }

    const next = await store.updateSettings(patch);
    res.json({ ok: true, settings: next });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'lỗi khi lưu settings' });
  }
});

// ---------- Protected: upload chung (avatar / song / background / cursor / songCover / discordManualAvatar) ----------
app.post('/api/upload/:kind', requireAuth, (req, res, next) => {
  const kind = req.params.kind;
  if (!ALLOWED_UPLOAD_KINDS.includes(kind)) {
    return res.status(400).json({ error: 'loại file không hợp lệ' });
  }
  req.uploadKind = kind;
  next();
}, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'chưa chọn file' });
    const { url } = await store.saveUpload(req.uploadKind, req.file);
    res.json({ ok: true, url, kind: req.uploadKind });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'lỗi khi lưu file' });
  }
});

// multer / upload error handler
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || 'upload thất bại' });
  next();
});

// ---------- Static ----------
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/health', (req, res) => res.send('ok'));

// ---------- Khởi động ----------
store.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
      console.log(`Admin: http://localhost:${PORT}/admin`);
      console.log(`Chế độ lưu trữ: ${store.mode}`);
    });
  })
  .catch((err) => {
    console.error('Không khởi tạo được storage:', err);
    process.exit(1);
  });
