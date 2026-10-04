# 🐃 Bé Vui Học

Ứng dụng **học và chơi lành mạnh** cho trẻ **3–10 tuổi** ở Việt Nam. Đây là bản chạy thử (MVP), dạng web app (PWA) cài được lên màn hình điện thoại và máy tính bảng như một app thường.

## Tính năng

**Khung chương trình:** 7 cấp (Mầm non nhỏ 3–4 tuổi, Mầm non lớn 5 tuổi, Lớp 1–5) × 3 mức độ.

| Mức | Hệ số điểm | Điều kiện mở |
|---|---|---|
| 🌱 Trung bình | ×1 | Mở sẵn |
| 🌿 Khá | ×2 | 3 bài gần nhất ở mức Trung bình đạt trung bình ≥ 80% |
| 🌳 Nâng cao | ×3 | 3 bài gần nhất ở mức Khá đạt trung bình ≥ 80% |

Phụ huynh có thể bật "Mở tất cả mức độ" cho từng bé.

| Môn | Nội dung (bám mạch kiến thức GDPT 2018) |
|---|---|
| 📖 **Tiếng Việt** | Chữ cái, chữ đầu, chữ hoa/thường → ghép vần, dấu thanh, chính tả c/k, g/gh, ng/ngh → từ chỉ sự vật/hoạt động/đặc điểm, kiểu câu → so sánh, thành ngữ → danh/động/tính từ, chủ ngữ/vị ngữ/trạng ngữ, nhân hóa → đồng nghĩa, nhiều nghĩa, đồng âm, đại từ, kết từ, câu ghép |
| 🔢 **Toán** | Sinh tự động, không giới hạn: đếm, hình, so sánh → cộng trừ trong 10/20/100/1000 → bảng nhân chia, chu vi → số lớn, nhân chia nhiều chữ số, phân số, trung bình cộng, diện tích → số thập phân, %, vận tốc, diện tích tam giác/hình thang, thể tích |
| 🔤 **Tiếng Anh** | Từ vựng theo chủ đề cho từng lớp (nghe chọn hình → nhìn hình chọn từ → nghĩa); lớp 3–5 thêm mẫu câu, ngữ pháp cơ bản. Đọc bằng giọng tiếng Anh |
| 🔬 **Khoa học** | Mầm non: khám phá tự nhiên; Lớp 1–3: mạch Tự nhiên và Xã hội; Lớp 4–5: chất, năng lượng, thực vật–động vật, nấm, vi khuẩn, con người và sức khỏe, môi trường. **12 clip hoạt hình** có lời đọc |
| 🏛️ **Lịch sử & Địa lý** | Mầm non–Lớp 3: văn hóa, truyền thuyết, quê hương, kì quan thế giới; Lớp 4: các vùng địa lí Việt Nam; Lớp 5: các triều đại, kháng chiến, văn minh thế giới, châu lục. **4 clip truyện** (Thánh Gióng, Bánh chưng bánh giầy, Sơn Tinh Thủy Tinh, Bạch Đằng 938) |
| 🛡️ **Kỹ năng sống** | Vệ sinh, an toàn giao thông, phòng cháy, đuối nước, người lạ, an toàn mạng, sơ cứu, cảm xúc, làm việc nhóm, quản lí tiền và thời gian |

**Số lượng câu soạn sẵn:** 952 câu (Khoa học 316, Lịch sử & Địa lý 315, Kỹ năng sống 135, Tiếng Việt 140, Tiếng Anh mẫu câu 46), cộng thêm 111 từ vựng tiếng Anh và câu Toán/Tiếng Việt sinh tự động.

**🎮 Trò chơi sau giờ học:** Học xong 1 bài được 1 lượt 🎟️, mỗi trò chơi tốn 1 lượt.

| Trò chơi | Cách chơi |
|---|---|
| 🧩 Đuổi hình bắt chữ | Ghép các hình thành từ ghép (nhỏ tuổi) hoặc thành ngữ, tục ngữ (lớp 3–5) |
| 🔔 Rung chuông vàng | 10 câu trộn tất cả các môn ở những mức đã mở, có 3 tim và đồng hồ đếm ngược. Đúng hết 10 câu: rung chuông, +10 ⭐ |
| 🔠 Ô chữ | Bấm chữ cái theo đúng thứ tự; lớp 3–5 có thêm chữ gây nhiễu |
| 🔗 Nối cặp | Con vật–tiếng kêu, số–chấm, từ tiếng Anh–hình/nghĩa, từ trái nghĩa, nhân vật–sự kiện, kì quan–đất nước |
| 🃏 Lật thẻ | Tìm cặp hình giống nhau |
| 🖍️ Bảng vẽ | Miễn phí, không tốn lượt |

**🔒 Phụ huynh / 🛡️ An toàn:** khóa bằng phép tính; xem tiến độ theo môn ở lớp hiện tại; đổi lớp; mở tất cả mức; giới hạn phút/ngày; nhắc nghỉ mắt; không quảng cáo, không mua hàng, không chat, không tài khoản; dữ liệu chỉ lưu trên máy; chạy được khi không có mạng.

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

## Clip: giai đoạn 1 và giai đoạn 2

1. **Giai đoạn 1 (hiện tại):** clip là hoạt hình dựng trong app (hình + hiệu ứng + lời đọc), không cần mạng. Kịch bản nằm trong `js/clips.js`.
2. **Giai đoạn 2:** khi có video tự sản xuất, chép vào `videos/<mã clip>.mp4` (ví dụ `videos/nuoc.mp4`) và thêm mã vào `videos/manifest.json` (ví dụ `["nuoc"]`). App sẽ tự phát video thay cho hoạt hình.

## Cấu trúc mã

```
index.html              khung trang
css/styles.css          giao diện
js/core.js              khung lớp × mức độ, tiện ích sinh câu hỏi
js/content.js           điều phối môn × lớp × mức → bài học
js/subjects/*.js        NỘI DUNG từng môn (sửa/bổ sung câu hỏi ở đây; mỗi dòng: hình|câu hỏi|đúng|sai|sai)
js/clips.js             kịch bản clip hoạt hình
js/games.js, games-data.js   trò chơi và dữ liệu trò chơi
js/app.js               màn hình, bài học, Rung chuông vàng, giới hạn giờ, khu phụ huynh
js/storage.js           lưu dữ liệu trên máy (localStorage)
js/speech.js            giọng đọc + âm báo
sw.js                   chạy offline (đổi VERSION mỗi lần phát hành)
tests/                  kiểm tra tự động: đáp án Toán đúng, đủ câu mỗi mức, không trùng phương án, cơ chế mở khóa…
```

## Giới hạn đã biết của bản MVP

- **Nội dung cần chuyên môn duyệt:** câu hỏi bám mạch kiến thức GDPT 2018 nhưng **chưa đối chiếu với một bộ sách giáo khoa cụ thể** (Kết nối tri thức / Chân trời sáng tạo / Cánh diều). Cần giáo viên rà soát trước khi phổ biến rộng.
- **Câu hỏi địa lí tránh tên tỉnh** đã thay đổi sau đợt sắp xếp đơn vị hành chính năm 2025.
- **Khóa phụ huynh là phép nhân 2 chữ số × 1 chữ số:** đủ chặn trẻ nhỏ, nhưng trẻ 9–10 tuổi có thể tự giải được.
- **Dữ liệu chỉ nằm trên một máy:** xóa dữ liệu trình duyệt hoặc đổi máy sẽ mất tiến độ. Hiện chưa có sao lưu.
- **Chất lượng giọng đọc phụ thuộc máy:** iPhone và Android đời mới đọc khá tốt, máy cũ có thể không có giọng tiếng Việt.
- Thời gian dùng được tính khi app đang mở trên màn hình. Nếu mở app ở nhiều tab cùng lúc, số liệu có thể bị lệch.

## Hướng phát triển đề xuất

1. Thu âm giọng người thật cho các câu hay dùng (chữ cái, lời khen, từ vựng tiếng Anh).
2. Đối chiếu nội dung với bộ sách giáo khoa nhà trường đang dùng; bổ sung lên 30–50 câu mỗi mức.
3. Thêm chức năng xuất/nhập tiến độ để chuyển sang máy khác (vẫn không cần tài khoản).
4. Thêm thiết lập độ khó thích ứng: bé làm tốt thì tự tăng mức khó.
