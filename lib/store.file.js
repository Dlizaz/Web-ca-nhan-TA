// lib/store.file.js
// Backend lưu trữ bằng file JSON + ổ đĩa cục bộ. Dùng khi không có MONGODB_URI.
// LƯU Ý: ổ đĩa trên nhiều nền tảng hosting (kể cả Railway mặc định) là tạm thời.

const fs = require('fs');
const path = require('path');

module.exports = function (DEFAULT_SETTINGS) {
  const DATA_DIR = path.join(__dirname, '..', 'data');
  const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');
  const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

  async function init() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    if (!fs.existsSync(SETTINGS_PATH)) {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    }
    console.log('[store] chế độ FILE (local) — dữ liệu lưu tại ./data và ./public/uploads');
  }

  async function getSettings() {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  }

  async function updateSettings(patch) {
    const current = await getSettings();
    const next = { ...current, ...patch };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2));
    return next;
  }

  async function saveUpload(kind, file) {
    const ext = path.extname(file.originalname).toLowerCase() || (kind === 'song' ? '.mp3' : '.png');
    const filename = `${kind}${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer);
    const url = `/uploads/${filename}?v=${Date.now()}`;
    await updateSettings({ [kind]: url });
    return { url };
  }

  // Trong chế độ file, express.static đã phục vụ /uploads trực tiếp nên không cần streamFile.
  async function streamFile(req, res) {
    res.status(404).send('not used in file mode');
  }

  return { init, getSettings, updateSettings, saveUpload, streamFile };
};
