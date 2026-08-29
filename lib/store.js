// lib/store.js
// Lớp trừu tượng lưu trữ: nếu có MONGODB_URI -> dùng MongoDB (settings + GridFS cho file).
// Nếu không -> dùng file JSON + ổ đĩa cục bộ (tiện cho chạy thử ở máy local).

const fs = require('fs');
const path = require('path');

const MODE = process.env.MONGODB_URI ? 'mongo' : 'file';

const DEFAULT_SETTINGS = {
  username: 'milky',
  bioLines: [
    'developer • gamer • mơ mộng ban đêm',
    'code dạo, ngủ trễ, cà phê đen',
  ],
  avatar: '',
  song: '',
  links: [
    { label: 'Discord', url: 'https://discord.com/users/yourid', icon: 'discord' },
    { label: 'Instagram', url: 'https://instagram.com/yourhandle', icon: 'instagram' },
    { label: 'TikTok', url: 'https://tiktok.com/@yourhandle', icon: 'tiktok' },
    { label: 'YouTube', url: 'https://youtube.com/@yourhandle', icon: 'youtube' },
  ],
};

let impl;

if (MODE === 'mongo') {
  impl = require('./store.mongo')(DEFAULT_SETTINGS);
} else {
  impl = require('./store.file')(DEFAULT_SETTINGS);
}

module.exports = {
  mode: MODE,
  init: impl.init,
  getSettings: impl.getSettings,
  updateSettings: impl.updateSettings,
  saveUpload: impl.saveUpload,       // (kind, {buffer, mimetype, originalname}) -> { url }
  streamFile: impl.streamFile,       // (req, res, fileParam) -> streams a stored file (mongo mode only; file mode uses express.static)
};
