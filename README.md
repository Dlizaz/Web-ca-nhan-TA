# milky — trang bio-link cá nhân (có trang quản trị + lưu MongoDB)

Trang cá nhân kiểu "dark aesthetic" (giống guns.lol): nền động hiệu ứng hạt,
card kính mờ, hiệu ứng gõ chữ, nhạc nền, danh sách link mạng xã hội.

Có sẵn **trang quản trị tại `/admin`** để đổi tên, tiểu sử, upload avatar,
upload nhạc, thêm/sửa/xóa link — không cần đụng code.

## Hai chế độ lưu trữ

Project tự chọn chế độ dựa vào biến môi trường `MONGODB_URI`:

| Có `MONGODB_URI` | Không có |
|---|---|
| Lưu vào **MongoDB** — settings trong 1 document, avatar/nhạc trong **GridFS** (kho file nhị phân của Mongo) | Lưu vào file JSON (`data/settings.json`) + ổ đĩa (`public/uploads/`) |
| Dữ liệu **không bao giờ mất** khi redeploy, kể cả trên Railway free tier | Dữ liệu **mất khi container khởi động lại** — chỉ nên dùng để test ở máy local |

→ **Khi deploy thật, luôn set `MONGODB_URI`.**

## 1. Lấy chuỗi kết nối MongoDB

Hai cách phổ biến:

**A. MongoDB Atlas (miễn phí, khuyên dùng)**
1. Tạo tài khoản tại [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster free (M0) → **Connect → Drivers** → copy chuỗi dạng:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
3. Vào **Network Access** → Add IP `0.0.0.0/0` (cho phép Railway kết nối tới)

**B. Plugin MongoDB ngay trong Railway**
1. Trong project Railway → **New → Database → Add MongoDB**
2. Railway tự tạo biến `MONGO_URL` — bạn map nó sang `MONGODB_URI` ở bước dưới (hoặc đổi tên biến trong code cho khớp)

## 2. Chạy thử ở máy local

Không set `MONGODB_URI` → chạy chế độ file (nhanh, không cần Mongo):

```bash
npm install
ADMIN_PASSWORD=mat-khau-cua-ban npm start
```

Muốn test luôn với Mongo thật:

```bash
MONGODB_URI="mongodb+srv://..." ADMIN_PASSWORD=mat-khau-cua-ban npm start
```

- Trang chính: `http://localhost:3000`
- Trang quản trị: `http://localhost:3000/admin`

## 3. Đưa code lên GitHub

```bash
git init
git add .
git commit -m "init biolink site voi admin + mongodb"
gh repo create ten-repo-cua-ban --public --source=. --push
```

(Nếu chưa có `gh` CLI, tạo repo trống trên github.com rồi):

```bash
git remote add origin https://github.com/<username>/<ten-repo>.git
git branch -M main
git push -u origin main
```

## 4. Deploy lên Railway

1. Vào [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
2. Vào tab **Variables**, thêm:
   - `MONGODB_URI` = chuỗi kết nối lấy ở bước 1
   - `ADMIN_PASSWORD` = mật khẩu đăng nhập `/admin`
   - `SESSION_SECRET` = một chuỗi bất kỳ, càng dài càng random càng tốt
3. **Settings → Networking → Generate Domain** để lấy link public
4. Vào `https://<domain>/admin`, đăng nhập, upload avatar/nhạc/link — dữ liệu giờ nằm trong MongoDB nên **deploy lại bao nhiêu lần cũng không mất**.

Không cần dùng Railway Volume nữa vì file đã chuyển hẳn qua GridFS.

## 5. Cấu trúc project

```
lib/
  store.js         chọn backend (mongo hay file) dựa vào MONGODB_URI
  store.mongo.js    backend MongoDB: settings + GridFS cho avatar/nhạc
  store.file.js     backend file JSON + ổ đĩa (chỉ dùng local dev)
public/
  index.html        trang chính (đọc dữ liệu động từ /api/settings)
  admin.html/js/css trang quản trị
  script.js         hiệu ứng + fetch settings
  style.css         giao diện trang chính
server.js           Express server: API + phục vụ file tĩnh
```

## 6. Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `MONGODB_URI` | nên đặt khi deploy | chuỗi kết nối MongoDB; thiếu thì tự rơi về chế độ file |
| `MONGODB_DB` | không | tên database, mặc định `milky_biolink` |
| `PORT` | tự động (Railway cấp) | cổng server lắng nghe |
| `ADMIN_PASSWORD` | nên đặt | mật khẩu đăng nhập `/admin` |
| `SESSION_SECRET` | nên đặt | khoá bí mật để mã hoá session cookie |

## 7. Giới hạn upload

- Ảnh đại diện: png/jpg/webp/gif, tối đa 20MB
- Nhạc nền: mp3/wav/ogg, tối đa 20MB
- MongoDB Atlas free tier (M0) giới hạn tổng dung lượng 512MB — đủ dùng cho vài chục ảnh/nhạc, nhưng đừng upload file quá nặng liên tục.
