# 🐃 Bé Vui Học

Ứng dụng **học và chơi lành mạnh** cho trẻ **3–10 tuổi** ở Việt Nam. Đây là bản chạy thử (MVP), dạng web app (PWA) cài được lên màn hình điện thoại và máy tính bảng như một app thường.

## Tính năng

| Nhóm | Nội dung |
|---|---|
| **Độ tuổi** | 3 nhóm: 3–5 tuổi (mầm non), 6–7 tuổi (lớp 1–2), 8–10 tuổi (lớp 3–5). Nội dung và độ khó tự đổi theo hồ sơ của bé. |
| **📖 Tiếng Việt** | 3–5: nhận biết 29 chữ cái, tìm chữ đầu của từ có hình. 6–7: dấu thanh, ghép vần, điền chữ thiếu. 8–10: chính tả, từ trái nghĩa, từ chỉ sự vật/hoạt động/đặc điểm. |
| **🔢 Toán** | 3–5: đếm 1–10, so sánh nhiều/ít, nhận biết hình. 6–7: cộng trừ trong 20 và 100, so sánh, số liền trước/sau. 8–10: bảng nhân chia, cộng trừ trong 1000, toán có lời văn. |
| **🌏 Khám phá** | Kỹ năng sống (vệ sinh, an toàn giao thông, phòng cháy, đuối nước, người lạ, an toàn mạng, bắt nạt) và văn hóa Việt (Tết, Trung thu, áo dài, quốc kỳ, truyền thuyết, địa danh). |
| **🎈 Chơi** | Lật thẻ tìm cặp (số cặp theo độ tuổi), bảng vẽ tự do. |
| **🏅 Khích lệ** | Sao và hình dán sưu tập. Không trừ điểm, không có "thua": bé được chọn lại đến khi đúng. |
| **🔊 Giọng đọc** | Mọi câu hỏi đều được đọc bằng giọng tiếng Việt, nên trẻ chưa biết chữ vẫn dùng được. |
| **🔒 Phụ huynh** | Khóa bằng phép tính. Xem tiến độ từng bé, giới hạn phút/ngày, nhắc nghỉ mắt định kỳ, gia hạn thêm 15 phút, đổi độ tuổi, xóa dữ liệu. |
| **🛡️ An toàn** | Không quảng cáo, không mua hàng trong app, không chat, không cần tài khoản. Dữ liệu chỉ lưu trên máy. Dùng được khi không có mạng. |

## Chạy thử trên máy tính

```bash
npm start          # hoặc: python3 -m http.server 8080
# mở http://localhost:8080
npm test           # kiểm tra tự động bộ câu hỏi
```

Không cần cài thư viện nào. Ứng dụng là HTML, CSS và JavaScript thuần.

## Đưa lên mạng để cài trên điện thoại

PWA chỉ cài được khi chạy qua **HTTPS**. Cách đơn giản và miễn phí là dùng GitHub Pages: vào repo → Settings → Pages → chọn nhánh, thư mục `/ (root)`. Có thể dùng Netlify hoặc Cloudflare Pages thay thế.

- **Android (Chrome):** mở link → menu ⋮ → *Cài đặt ứng dụng* (hoặc *Thêm vào màn hình chính*).
- **iPhone/iPad (Safari):** mở link → nút Chia sẻ → *Thêm vào MH chính*.

## Giọng đọc: giai đoạn 1 và giai đoạn 2

1. **Giai đoạn 1 (hiện tại):** dùng giọng đọc tiếng Việt có sẵn của máy. Nếu máy chưa có, khu Phụ huynh sẽ hiện hướng dẫn cài.
2. **Giai đoạn 2:** thu âm giọng người thật, chép file vào thư mục `audio/`, rồi khai báo trong `audio/manifest.json`:
   ```json
   { "Bé hãy tìm chữ bờ": "tim-chu-b.mp3", "Giỏi quá!": "gioi-qua.mp3" }
   ```
   Câu nào có file thu âm sẽ phát file đó. Câu chưa có vẫn dùng giọng máy, nên có thể thay dần từng phần.

## Cấu trúc mã

```
index.html              khung trang
css/styles.css          giao diện
js/content.js           NỘI DUNG HỌC + bộ sinh câu hỏi (sửa/bổ sung câu hỏi ở đây)
js/app.js               màn hình, trò chơi, giới hạn giờ, khu phụ huynh
js/storage.js           lưu dữ liệu trên máy (localStorage)
js/speech.js            giọng đọc + âm báo
sw.js                   chạy offline (đổi VERSION mỗi lần phát hành)
tests/                  kiểm tra tự động: đáp án đúng, không trùng phương án…
```

## Giới hạn đã biết của bản MVP

- **Nội dung cần chuyên môn duyệt:** câu hỏi đã soạn cẩn thận nhưng nên có giáo viên mầm non/tiểu học rà soát trước khi phổ biến rộng.
- **Khóa phụ huynh là phép nhân 2 chữ số × 1 chữ số:** đủ chặn trẻ nhỏ, nhưng trẻ 9–10 tuổi có thể tự giải được.
- **Dữ liệu chỉ nằm trên một máy:** xóa dữ liệu trình duyệt hoặc đổi máy sẽ mất tiến độ. Hiện chưa có sao lưu.
- **Chất lượng giọng đọc phụ thuộc máy:** iPhone và Android đời mới đọc khá tốt, máy cũ có thể không có giọng tiếng Việt.
- Thời gian dùng được tính khi app đang mở trên màn hình. Nếu mở app ở nhiều tab cùng lúc, số liệu có thể bị lệch.

## Hướng phát triển đề xuất

1. Thu âm giọng người thật cho các câu hay dùng (chữ cái, lời khen).
2. Thêm Tiếng Anh cơ bản và truyện tranh đọc to.
3. Thêm chức năng xuất/nhập tiến độ để chuyển sang máy khác (vẫn không cần tài khoản).
4. Thêm thiết lập độ khó thích ứng: bé làm tốt thì tự tăng mức khó.
