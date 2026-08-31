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
const ALLOWED_UPLOAD_KINDS = ['avatar', 'song', 'background', 'cursor', 'songCover', 'discordManualAvatar', 'avatarFrameManual'];
const ALLOWED_POSITION_KEYS = ['avatar', 'username', 'bio', 'views', 'discord', 'links', 'music'];
const ALLOWED_SCALE_KEYS = ['avatar', 'username', 'bio', 'views', 'links'];
const ALLOWED_BOX_KEYS = ['discord', 'music'];
const ALLOWED_BOXSTYLE_KEYS = ['discord', 'music', 'links'];
// Khớp với TEXT_STYLE_KEYS trong script.js / TEXT_STYLE_FIELDS trong admin.js
const ALLOWED_TEXTSTYLE_KEYS = [
  'username', 'bio', 'views', 'discordName', 'discordTag',
  'discordMessage', 'musicTitle', 'musicTime', 'links',
];
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
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB (nền dạng video cần nhỉnh hơn 1 chút)
  fileFilter: (req, file, cb) => {
    const kind = req.uploadKind;
    const okImage = /image\/(png|jpe?g|webp|gif|x-icon|vnd\.microsoft\.icon)/.test(file.mimetype);
    const okAudio = /audio\/(mpeg|mp3|wav|ogg)/.test(file.mimetype) || file.originalname.endsWith('.mp3');
    const okVideo = /video\/(mp4|webm|quicktime)/.test(file.mimetype) || /\.(mp4|webm|mov)$/i.test(file.originalname);
    if (kind === 'song' && !okAudio) return cb(new Error('File nhạc phải là audio (mp3/wav/ogg)'));
    if (kind === 'background' && !okImage && !okVideo) return cb(new Error('Ảnh nền phải là ảnh (png/jpg/webp/gif) hoặc video (mp4/webm)'));
    if (kind !== 'song' && kind !== 'background' && !okImage) return cb(new Error('File phải là ảnh (png/jpg/webp/gif)'));
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
    // Màu nhấn tách riêng 3 chỗ: viền / icon / con trỏ nhấp nháy (trước đây bị thiếu ở đây nên không lưu được)
    if (typeof b.accentBorderColor === 'string' && HEX_RE.test(b.accentBorderColor)) patch.accentBorderColor = b.accentBorderColor;
    if (typeof b.accentIconColor === 'string' && HEX_RE.test(b.accentIconColor)) patch.accentIconColor = b.accentIconColor;
    if (typeof b.accentCursorColor === 'string' && HEX_RE.test(b.accentCursorColor)) patch.accentCursorColor = b.accentCursorColor;
    // Màu riêng cho kim tuyến quanh tên (tách khỏi accentIconColor để không bị lẫn 2 màu)
    if (typeof b.usernameSparkleColor === 'string' && HEX_RE.test(b.usernameSparkleColor)) patch.usernameSparkleColor = b.usernameSparkleColor;
    // 2 loại kim tuyến còn lại: theo con trỏ chuột, và rải khắp trang (ambient)
    if (typeof b.sparkleCursorColor === 'string' && HEX_RE.test(b.sparkleCursorColor)) patch.sparkleCursorColor = b.sparkleCursorColor;
    if (typeof b.sparklePageColor === 'string' && HEX_RE.test(b.sparklePageColor)) patch.sparklePageColor = b.sparklePageColor;
    // Code cấu hình JSON (tsParticles) tự dán cho hiệu ứng rải khắp trang.
    // Chỉ chấp nhận JSON hợp lệ (dữ liệu thuần, không phải code thực thi) và giới hạn độ dài để tránh phình dữ liệu.
    if (typeof b.pageParticlesConfig === 'string') {
      const trimmed = b.pageParticlesConfig.trim();
      if (!trimmed) {
        patch.pageParticlesConfig = '';
      } else if (trimmed.length <= 20000) {
        try {
          JSON.parse(trimmed);
          patch.pageParticlesConfig = trimmed;
        } catch (e) {
          // JSON không hợp lệ -> bỏ qua, giữ nguyên giá trị cũ đã lưu
        }
      }
    }
    if (b.overlayOpacity !== undefined) {
      const n = Number(b.overlayOpacity);
      if (!Number.isNaN(n)) patch.overlayOpacity = Math.min(90, Math.max(0, n));
    }
    if (typeof b.fontFamily === 'string') patch.fontFamily = b.fontFamily.slice(0, 60);
    if (typeof b.customFontFamily === 'string') patch.customFontFamily = b.customFontFamily.slice(0, 60);

    // ----- Hiệu ứng phát sáng chữ & icon (trước đây bị thiếu ở đây nên không lưu được) -----
    if (typeof b.glowColor === 'string' && HEX_RE.test(b.glowColor)) patch.glowColor = b.glowColor;
    if (b.glowIntensity !== undefined) {
      const n = Number(b.glowIntensity);
      if (!Number.isNaN(n)) patch.glowIntensity = Math.min(100, Math.max(0, n));
    }

    // ----- Discord -----
    if (typeof b.discordEnabled === 'boolean') patch.discordEnabled = b.discordEnabled;
    if (['manual', 'live'].includes(b.discordMode)) patch.discordMode = b.discordMode;
    if (typeof b.discordId === 'string') patch.discordId = b.discordId.trim().slice(0, 32);
    if (typeof b.discordManualName === 'string') patch.discordManualName = b.discordManualName.slice(0, 40);
    if (typeof b.discordManualTag === 'string') patch.discordManualTag = b.discordManualTag.slice(0, 40);
    if (['online', 'idle', 'dnd', 'offline'].includes(b.discordManualStatus)) patch.discordManualStatus = b.discordManualStatus;
    if (typeof b.discordManualMessage === 'string') patch.discordManualMessage = b.discordManualMessage.slice(0, 140);
    if (b.discordMarqueeSpeed !== undefined) {
      const n = Number(b.discordMarqueeSpeed);
      if (!Number.isNaN(n)) patch.discordMarqueeSpeed = Math.min(60, Math.max(2, n));
    }

    // ----- Khung ảnh đại diện (avatar decoration) -----
    if (typeof b.avatarFrameEnabled === 'boolean') patch.avatarFrameEnabled = b.avatarFrameEnabled;
    if (['manual', 'live'].includes(b.avatarFrameMode)) patch.avatarFrameMode = b.avatarFrameMode;

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

    // ----- Màn hình "nhấn để vào trang" -----
    if (typeof b.enterText === 'string') patch.enterText = b.enterText.slice(0, 80);
    if (typeof b.enterFont === 'string') patch.enterFont = b.enterFont.slice(0, 60);
    if (b.enterSize !== undefined) {
      const n = Number(b.enterSize);
      if (!Number.isNaN(n)) patch.enterSize = Math.min(60, Math.max(8, Math.round(n)));
    }
    if (typeof b.enterColor === 'string' && (b.enterColor === '' || HEX_RE.test(b.enterColor))) patch.enterColor = b.enterColor;

    // ----- Màu chữ phụ (nhãn phụ / mô tả / giờ nhạc...) -----
    if (typeof b.mutedColor === 'string' && HEX_RE.test(b.mutedColor)) patch.mutedColor = b.mutedColor;

    // cần current settings nếu có patch merge nông (positions / sizes / boxStyles)
    let current = null;
    const needCurrent = (b.positions && typeof b.positions === 'object')
      || (b.sizes && typeof b.sizes === 'object')
      || (b.boxStyles && typeof b.boxStyles === 'object')
      || (b.textStyles && typeof b.textStyles === 'object');
    if (needCurrent) current = await store.getSettings();

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
        patch.positions = { ...(current.positions || {}), ...posPatch };
      }
    }

    // ----- Kích thước từng khối (merge nông theo từng khối) -----
    if (b.sizes && typeof b.sizes === 'object') {
      const sizePatch = {};
      for (const key of ALLOWED_SCALE_KEYS) {
        const s = b.sizes[key];
        if (s && typeof s === 'object' && s.scale !== undefined) {
          const scale = Number(s.scale);
          if (!Number.isNaN(scale)) sizePatch[key] = { scale: Math.min(3, Math.max(0.4, scale)) };
        }
      }
      for (const key of ALLOWED_BOX_KEYS) {
        const s = b.sizes[key];
        if (s && typeof s === 'object') {
          const width = Number(s.width);
          const height = Number(s.height);
          const entry = {};
          if (!Number.isNaN(width) && s.width !== undefined) entry.width = Math.min(1000, Math.max(120, width));
          if (!Number.isNaN(height) && s.height !== undefined) entry.height = Math.min(1000, Math.max(0, height));
          if (Object.keys(entry).length) sizePatch[key] = entry;
        }
      }
      if (Object.keys(sizePatch).length) {
        patch.sizes = { ...(current.sizes || {}), ...sizePatch };
      }
    }

    // ----- Màu nền / viền khung Discord, khung nhạc, nút link -----
    if (b.boxStyles && typeof b.boxStyles === 'object') {
      const boxPatch = {};
      for (const key of ALLOWED_BOXSTYLE_KEYS) {
        const s = b.boxStyles[key];
        if (s && typeof s === 'object') {
          const entry = {};
          if (typeof s.bg === 'string' && HEX_RE.test(s.bg)) entry.bg = s.bg;
          if (typeof s.border === 'string' && HEX_RE.test(s.border)) entry.border = s.border;
          if (s.bgOpacity !== undefined) {
            const n = Number(s.bgOpacity);
            if (!Number.isNaN(n)) entry.bgOpacity = Math.min(100, Math.max(0, n));
          }
          if (s.borderOpacity !== undefined) {
            const n = Number(s.borderOpacity);
            if (!Number.isNaN(n)) entry.borderOpacity = Math.min(100, Math.max(0, n));
          }
          if (Object.keys(entry).length) {
            boxPatch[key] = { ...((current.boxStyles || {})[key] || {}), ...entry };
          }
        }
      }
      if (Object.keys(boxPatch).length) {
        patch.boxStyles = { ...(current.boxStyles || {}), ...boxPatch };
      }
    }

    // ----- Font & cỡ chữ riêng từng phần (trước đây bị thiếu ở đây nên không lưu được) -----
    if (b.textStyles && typeof b.textStyles === 'object') {
      const tsPatch = {};
      for (const key of ALLOWED_TEXTSTYLE_KEYS) {
        const s = b.textStyles[key];
        if (s && typeof s === 'object') {
          const entry = {};
          if (typeof s.font === 'string') entry.font = s.font.slice(0, 60);
          if (typeof s.customFont === 'string') entry.customFont = s.customFont.slice(0, 60);
          if (s.size !== undefined) {
            const n = Number(s.size);
            if (!Number.isNaN(n)) entry.size = Math.min(72, Math.max(6, Math.round(n)));
          }
          if (Object.keys(entry).length) {
            tsPatch[key] = { ...((current.textStyles || {})[key] || {}), ...entry };
          }
        }
      }
      if (Object.keys(tsPatch).length) {
        patch.textStyles = { ...(current.textStyles || {}), ...tsPatch };
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
