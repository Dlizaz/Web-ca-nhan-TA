# anhanh — trang bio-link cá nhân

Trang cá nhân kiểu "dark aesthetic" (giống guns.lol): nền động theo hiệu ứng hạt,
card kính mờ, hiệu ứng gõ chữ, nhạc nền, danh sách link mạng xã hội.

## 1. Tùy chỉnh nội dung

- **Tên hiển thị**: sửa dòng `<h1 class="username">anhanh...` trong `public/index.html`
- **Tiểu sử (chạy chữ)**: sửa mảng `BIO_LINES` ở đầu file `public/script.js`
- **Link mạng xã hội**: sửa các thẻ `<a class="link-btn" href="...">` trong `public/index.html`
- **Avatar**: đặt ảnh của bạn vào `public/assets/avatar.jpg` (đúng tên file này)
- **Nhạc nền**: đặt file mp3 vào `public/assets/song.mp3` (đúng tên file này).
  Nếu không có file, trang vẫn chạy bình thường, chỉ là im lặng.
- **Màu sắc**: sửa các biến ở đầu `public/style.css` (`--accent`, `--accent-2`, `--bg`...)

## 2. Chạy thử ở máy local

```bash
npm install
npm start
```

Mở trình duyệt vào `http://localhost:3000`

## 3. Đưa code lên GitHub

```bash
git init
git add .
git commit -m "init biolink site"
gh repo create ten-repo-cua-ban --public --source=. --push
```

(Nếu chưa có `gh` CLI, tạo repo trống trên github.com rồi):

```bash
git remote add origin https://github.com/<username>/<ten-repo>.git
git branch -M main
git push -u origin main
```

## 4. Deploy lên Railway

1. Vào [railway.app](https://railway.app), đăng nhập bằng GitHub.
2. **New Project → Deploy from GitHub repo** → chọn repo vừa tạo.
3. Railway tự nhận diện Node.js qua `package.json` và chạy lệnh `npm start`.
4. Vào tab **Settings → Networking → Generate Domain** để lấy link public
   (dạng `ten-app.up.railway.app`).
5. Xong — mỗi lần bạn `git push` code mới, Railway tự build và deploy lại.

### Lưu ý quan trọng
- Server đọc cổng từ biến môi trường `PORT` (Railway tự cấp), **không tự set cứng port**.
- Không commit file nhạc/ảnh quá nặng (>25MB) — Railway free tier có giới hạn dung lượng build.
- Nếu muốn gắn tên miền riêng: Settings → Networking → Custom Domain, rồi trỏ CNAME theo hướng dẫn Railway đưa ra.
