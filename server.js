const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');

const store = require('./lib/store');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-doi-di-nha';

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
    const okImage = /image\/(png|jpe?g|webp|gif)/.test(file.mimetype);
    const okAudio = /audio\/(mpeg|mp3|wav|ogg)/.test(file.mimetype) || file.originalname.endsWith('.mp3');
    if (kind === 'avatar' && !okImage) return cb(new Error('File avatar phải là ảnh (png/jpg/webp/gif)'));
    if (kind === 'song' && !okAudio) return cb(new Error('File nhạc phải là audio (mp3/wav/ogg)'));
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
    const current = await store.getSettings();
    const patch = {};
    const { username, bioLines, links } = req.body || {};

    if (typeof username === 'string' && username.trim()) {
      patch.username = username.trim().slice(0, 40);
    }
    if (Array.isArray(bioLines)) {
      patch.bioLines = bioLines
        .filter((l) => typeof l === 'string' && l.trim())
        .slice(0, 6)
        .map((l) => l.slice(0, 120));
    }
    if (Array.isArray(links)) {
      patch.links = links
        .filter((l) => l && typeof l.url === 'string' && l.url.trim())
        .slice(0, 10)
        .map((l) => ({
          label: String(l.label || 'Link').slice(0, 30),
          url: String(l.url).slice(0, 300),
          icon: ['discord', 'instagram', 'tiktok', 'youtube', 'twitter', 'github', 'spotify', 'link'].includes(l.icon)
            ? l.icon
            : 'link',
        }));
    }

    const next = await store.updateSettings(patch);
    res.json({ ok: true, settings: next });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'lỗi khi lưu settings' });
  }
});

// ---------- Protected: uploads ----------
app.post('/api/upload/avatar', requireAuth, (req, res, next) => {
  req.uploadKind = 'avatar';
  next();
}, upload.single('file'), async (req, res) => {
  try {
    const { url } = await store.saveUpload('avatar', req.file);
    res.json({ ok: true, avatar: url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'lỗi khi lưu avatar' });
  }
});

app.post('/api/upload/song', requireAuth, (req, res, next) => {
  req.uploadKind = 'song';
  next();
}, upload.single('file'), async (req, res) => {
  try {
    const { url } = await store.saveUpload('song', req.file);
    res.json({ ok: true, song: url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'lỗi khi lưu nhạc' });
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
