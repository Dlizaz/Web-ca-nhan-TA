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
  songCover: '',
  songTitle: 'nhạc nền',
  links: [
    { label: 'Discord', url: 'https://discord.com/users/yourid', icon: 'discord' },
    { label: 'Instagram', url: 'https://instagram.com/yourhandle', icon: 'instagram' },
    { label: 'TikTok', url: 'https://tiktok.com/@yourhandle', icon: 'tiktok' },
    { label: 'YouTube', url: 'https://youtube.com/@yourhandle', icon: 'youtube' },
  ],

  // ---- Giao diện ----
  background: '',             // ảnh/gif nền do admin upload
  backgroundColor: '#07070b', // màu nền dự phòng khi chưa có ảnh
  overlayOpacity: 45,         // độ tối lớp phủ lên ảnh nền (0-90)
  textColor: '#eaeaf2',
  // Màu nhấn: tách riêng 3 chỗ (viền / icon / con trỏ nhấp nháy), không gộp chung 1 màu nữa
  accentBorderColor: '#7c5cff',
  accentIconColor: '#7c5cff',
  accentCursorColor: '#7c5cff',
  mutedColor: '#b7b7c6',   // màu chữ phụ: tiểu sử, lượt xem, giờ nhạc, dòng phụ Discord...
  fontFamily: 'Space Grotesk',
  customFontFamily: '',       // tên Google Font tự nhập nếu fontFamily = 'custom'
  cursor: '',                  // ảnh con trỏ chuột tùy chỉnh

  // Hiệu ứng phát sáng nhẹ cho toàn bộ chữ & icon ngoài trang (0 = tắt hẳn)
  glowColor: '#7c5cff',
  glowIntensity: 0,

  // Font & cỡ chữ riêng cho từng phần chữ (username, bio, views, discordName, discordTag,
  // discordMessage, musicTitle, musicTime, links). Để trống {} = tất cả dùng mặc định của CSS.
  textStyles: {},

  // ---- Widget Discord ----
  discordEnabled: false,
  discordMode: 'manual',         // 'manual' | 'live'
  discordId: '',                  // dùng cho chế độ live (Lanyard API)
  discordManualName: '',
  discordManualTag: '',
  discordManualStatus: 'online',  // online | idle | dnd | offline
  discordManualMessage: '',
  discordManualAvatar: '',

  // ---- Khung ảnh đại diện (avatar decoration) quanh avatar chính ----
  avatarFrameEnabled: false,
  avatarFrameMode: 'manual',   // 'manual' = ảnh tự upload | 'live' = lấy thật từ Discord (dùng chung discordId ở trên)
  avatarFrameManual: '',        // ảnh khung PNG nền trong suốt do admin upload

  // ---- Nội dung khi click vào avatar ----
  clickEnabled: true,
  clickMessages: ['chào nè', 'xem mình à'],
  clickFont: '',
  clickColor: '#ff9ecb',

  // ---- Màn hình "nhấn để vào trang" ----
  enterText: 'nhấn để vào trang',
  enterFont: '',           // bỏ trống = dùng font chung
  enterSize: 13,           // px
  enterColor: '',          // bỏ trống = dùng màu chữ phụ (--muted)

  // ---- Vị trí tự do từng khối (phần trăm viewport, tính theo tâm phần tử) ----
  positions: {
    avatar:   { top: 10, left: 50 },
    username: { top: 24, left: 50 },
    bio:      { top: 30, left: 50 },
    views:    { top: 36, left: 50 },
    discord:  { top: 55, left: 18 },
    links:    { top: 80, left: 50 },
    music:    { top: 92, left: 20 },
  },

  // ---- Kích thước từng khối ----
  // avatar/username/bio/views/links: phóng to/nhỏ đều theo tỉ lệ (scale)
  // discord/music: khung có thể kéo giãn width/height độc lập (height 0 = tự động theo nội dung)
  sizes: {
    avatar:   { scale: 1 },
    username: { scale: 1 },
    bio:      { scale: 1 },
    views:    { scale: 1 },
    discord:  { width: 280, height: 0 },
    links:    { scale: 1 },
    music:    { width: 300, height: 0 },
  },

  // ---- Màu nền / viền của khung Discord, khung nhạc và các nút link ----
  boxStyles: {
    discord: { bg: '#101018', bgOpacity: 60, border: '#ffffff', borderOpacity: 10 },
    music:   { bg: '#101018', bgOpacity: 60, border: '#ffffff', borderOpacity: 10 },
    links:   { bg: '#101018', bgOpacity: 55, border: '#ffffff', borderOpacity: 12 },
  },
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
