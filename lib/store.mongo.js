// lib/store.mongo.js
// Backend lưu trữ bằng MongoDB: settings trong 1 document, file (avatar/nhạc) trong GridFS.
// Dùng khi có biến môi trường MONGODB_URI.

const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');

module.exports = function (DEFAULT_SETTINGS) {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'milky_biolink';

  let client;
  let db;
  let bucket;
  const SETTINGS_ID = 'site'; // luôn 1 document duy nhất

  async function init() {
    if (!uri) throw new Error('Thiếu biến môi trường MONGODB_URI');
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    db = client.db(dbName);
    bucket = new GridFSBucket(db, { bucketName: 'media' });

    const col = db.collection('settings');
    const existing = await col.findOne({ _id: SETTINGS_ID });
    if (!existing) {
      await col.insertOne({ _id: SETTINGS_ID, ...DEFAULT_SETTINGS });
    }
    console.log(`[store] chế độ MONGODB — kết nối tới db "${dbName}"`);
  }

  async function getSettings() {
    const col = db.collection('settings');
    const doc = await col.findOne({ _id: SETTINGS_ID });
    const { _id, ...rest } = doc;
    // bỏ các trường theo dõi ID nội bộ (vd. avatarFileId, cursorFileId...) khỏi dữ liệu trả ra ngoài
    for (const k of Object.keys(rest)) {
      if (k.endsWith('FileId')) delete rest[k];
    }
    return rest;
  }

  async function updateSettings(patch) {
    const col = db.collection('settings');
    await col.updateOne({ _id: SETTINGS_ID }, { $set: patch });
    return getSettings();
  }

  async function saveUpload(kind, file) {
    const col = db.collection('settings');
    const current = await col.findOne({ _id: SETTINGS_ID });
    // mỗi loại file (avatar, song, cursor, background, songCover, discordManualAvatar...)
    // có khóa theo dõi ID riêng, tránh việc upload loại này xóa nhầm file của loại khác
    const fieldIdKey = `${kind}FileId`;
    const oldFieldId = current[fieldIdKey];

    // xóa file cũ trong GridFS nếu có, để không tích rác
    if (oldFieldId) {
      try {
        await bucket.delete(new ObjectId(oldFieldId));
      } catch (e) {
        // file cũ có thể đã không tồn tại, bỏ qua
      }
    }

    const uploadStream = bucket.openUploadStream(file.originalname || kind, {
      contentType: file.mimetype,
      metadata: { kind },
    });

    await new Promise((resolve, reject) => {
      uploadStream.once('error', reject);
      uploadStream.once('finish', resolve);
      uploadStream.end(file.buffer);
    });

    const fileId = uploadStream.id;
    const url = `/uploads/file/${fileId.toString()}`;

    await col.updateOne(
      { _id: SETTINGS_ID },
      { $set: { [kind]: url, [fieldIdKey]: fileId } }
    );

    return { url };
  }

  async function streamFile(req, res) {
    const { id } = req.params;
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).send('id không hợp lệ');
    }

    const files = await db.collection('media.files').findOne({ _id: objectId });
    if (!files) return res.status(404).send('không tìm thấy file');

    res.set('Content-Type', files.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on('error', () => res.status(404).end());
    downloadStream.pipe(res);
  }

  return { init, getSettings, updateSettings, saveUpload, streamFile };
};
