// CLIP HOẠT HÌNH – dựng bằng hình + hiệu ứng + lời đọc, chạy offline.
// Giai đoạn 2: khi có video tự sản xuất, chép vào videos/<id>.mp4 và thêm id vào videos/manifest.json
// (vd: ["nuoc"]) – app sẽ phát video thay cho hoạt hình.
// Mỗi cảnh: { bg, items: [[hình, hiệu ứng]], say }
// Hiệu ứng: rise (bay lên), fall (rơi), grow (lớn dần), spin (xoay), pulse (nhấp nháy), slide (trượt), shake (rung), fade (mờ dần)

export const CLIPS = {
  nuoc: {
    title: 'Vòng tuần hoàn của nước', emoji: '💧',
    scenes: [
      { bg: 'sky', items: [['☀️', 'pulse'], ['🌊', 'shake']], say: 'Mặt Trời chiếu nắng làm nước ở sông, hồ, biển nóng lên.' },
      { bg: 'sky', items: [['🌊', ''], ['💨', 'rise'], ['💨', 'rise']], say: 'Nước bay hơi, biến thành hơi nước bay lên cao.' },
      { bg: 'sky', items: [['☁️', 'grow'], ['☁️', 'grow']], say: 'Lên cao gặp lạnh, hơi nước ngưng tụ thành những giọt nước rất nhỏ, tạo thành mây.' },
      { bg: 'rain', items: [['🌧️', ''], ['💧', 'fall'], ['💧', 'fall']], say: 'Các giọt nước trong mây lớn dần, nặng lên và rơi xuống thành mưa.' },
      { bg: 'land', items: [['⛰️', ''], ['🏞️', 'slide'], ['🌊', '']], say: 'Nước mưa chảy ra suối, ra sông, rồi lại chảy ra biển.' },
      { bg: 'sky', items: [['🔄', 'spin']], say: 'Cứ như vậy, nước tuần hoàn mãi trong tự nhiên.' },
    ],
  },
  hat: {
    title: 'Hạt nảy mầm thành cây', emoji: '🌱',
    scenes: [
      { bg: 'soil', items: [['🌰', 'pulse']], say: 'Đây là một hạt giống.' },
      { bg: 'soil', items: [['🌰', ''], ['💧', 'fall']], say: 'Gieo hạt xuống đất ẩm. Hạt cần nước, không khí và nhiệt độ thích hợp để nảy mầm.' },
      { bg: 'soil', items: [['🌱', 'grow']], say: 'Hạt nứt vỏ, rễ mọc xuống đất, mầm non nhú lên.' },
      { bg: 'sky', items: [['☀️', 'pulse'], ['🌿', 'grow']], say: 'Cây con cần ánh sáng mặt trời để ra lá xanh.' },
      { bg: 'sky', items: [['🌳', 'grow']], say: 'Được tưới nước, chăm sóc, cây lớn dần lên.' },
      { bg: 'sky', items: [['🌸', 'pulse'], ['🍎', 'grow']], say: 'Cây ra hoa. Hoa kết thành quả, trong quả có hạt mới.' },
    ],
  },
  buom: {
    title: 'Vòng đời của con bướm', emoji: '🦋',
    scenes: [
      { bg: 'leaf', items: [['🍃', ''], ['⚪', 'pulse']], say: 'Bướm mẹ đẻ trứng trên lá cây.' },
      { bg: 'leaf', items: [['🐛', 'slide'], ['🍃', 'shake']], say: 'Trứng nở ra sâu. Sâu ăn lá rất nhiều và lớn nhanh.' },
      { bg: 'leaf', items: [['🟤', 'pulse']], say: 'Sâu lớn lên rồi hóa thành nhộng. Nhộng nằm yên, cơ thể bên trong thay đổi dần.' },
      { bg: 'sky', items: [['🦋', 'rise']], say: 'Bướm chui ra khỏi vỏ nhộng, xòe cánh bay đi.' },
      { bg: 'sky', items: [['🥚', ''], ['➡️', ''], ['🐛', ''], ['➡️', ''], ['🟤', ''], ['➡️', ''], ['🦋', 'pulse']], say: 'Vòng đời của bướm là: trứng, sâu, nhộng, bướm.' },
    ],
  },
  ech: {
    title: 'Vòng đời của con ếch', emoji: '🐸',
    scenes: [
      { bg: 'pond', items: [['⚫', 'pulse'], ['⚫', 'pulse'], ['⚫', 'pulse']], say: 'Ếch mẹ đẻ trứng dưới nước.' },
      { bg: 'pond', items: [['〰️', 'slide']], say: 'Trứng nở thành nòng nọc. Nòng nọc có đuôi, sống dưới nước, thở bằng mang.' },
      { bg: 'pond', items: [['🦵', 'grow']], say: 'Nòng nọc mọc chân sau, rồi mọc chân trước. Đuôi ngắn dần.' },
      { bg: 'pond', items: [['🐸', 'grow']], say: 'Nòng nọc thành ếch con, có thể lên bờ.' },
      { bg: 'land', items: [['🐸', 'shake']], say: 'Ếch con lớn lên thành ếch trưởng thành. Vòng đời ếch: trứng, nòng nọc, ếch con, ếch trưởng thành.' },
    ],
  },
  ngaydem: {
    title: 'Vì sao có ngày và đêm?', emoji: '🌗',
    scenes: [
      { bg: 'space', items: [['☀️', 'pulse'], ['🌍', 'spin']], say: 'Trái Đất luôn tự quay quanh mình.' },
      { bg: 'space', items: [['☀️', ''], ['🌍', '']], say: 'Mặt Trời chỉ chiếu sáng được một nửa Trái Đất.' },
      { bg: 'sky', items: [['🏙️', ''], ['☀️', 'pulse']], say: 'Nửa được Mặt Trời chiếu sáng là ban ngày.' },
      { bg: 'night', items: [['🏙️', ''], ['🌙', 'pulse'], ['⭐', 'pulse']], say: 'Nửa không được chiếu sáng là ban đêm.' },
      { bg: 'space', items: [['🌍', 'spin']], say: 'Trái Đất quay một vòng hết khoảng hai mươi tư giờ, nên ngày và đêm cứ nối tiếp nhau.' },
    ],
  },
  bathe: {
    title: 'Ba thể của nước', emoji: '🧊',
    scenes: [
      { bg: 'room', items: [['🧊', 'pulse']], say: 'Nước đá là nước ở thể rắn. Nó có hình dạng nhất định.' },
      { bg: 'room', items: [['🧊', 'fade'], ['💧', 'grow']], say: 'Khi gặp nóng, nước đá nóng chảy thành nước ở thể lỏng. Nước lỏng chảy được và có hình dạng của vật chứa nó.' },
      { bg: 'room', items: [['🔥', 'shake'], ['♨️', 'rise']], say: 'Khi đun sôi, nước bay hơi thành hơi nước. Đó là nước ở thể khí.' },
      { bg: 'room', items: [['❄️', 'spin'], ['💧', ''], ['🧊', 'grow']], say: 'Khi làm lạnh, hơi nước ngưng tụ thành nước lỏng, nước lỏng đông đặc thành đá.' },
      { bg: 'room', items: [['🧊', ''], ['💧', ''], ['♨️', '']], say: 'Nước có ba thể: rắn, lỏng và khí.' },
    ],
  },
  quanghop: {
    title: 'Lá cây làm ra thức ăn', emoji: '🍃',
    scenes: [
      { bg: 'sky', items: [['☀️', 'pulse'], ['🍃', 'shake']], say: 'Lá cây hấp thụ ánh sáng Mặt Trời.' },
      { bg: 'soil', items: [['🌱', ''], ['💧', 'rise']], say: 'Rễ hút nước và chất khoáng từ đất, đưa lên lá.' },
      { bg: 'sky', items: [['💨', 'slide'], ['🍃', '']], say: 'Lá lấy khí các-bô-níc từ không khí.' },
      { bg: 'sky', items: [['🍃', 'grow']], say: 'Nhờ ánh sáng, lá tạo ra chất dinh dưỡng để nuôi cây. Quá trình này gọi là quang hợp.' },
      { bg: 'sky', items: [['🌳', ''], ['🫧', 'rise']], say: 'Khi quang hợp, cây thải ra khí ô-xi, giúp con người và động vật hô hấp.' },
    ],
  },
  amthanh: {
    title: 'Âm thanh đi đến tai', emoji: '🔊',
    scenes: [
      { bg: 'room', items: [['🥁', 'shake']], say: 'Khi gõ trống, mặt trống rung động.' },
      { bg: 'room', items: [['🥁', 'shake'], ['〰️', 'slide'], ['〰️', 'slide']], say: 'Rung động đó truyền qua không khí.' },
      { bg: 'room', items: [['〰️', 'slide'], ['👂', 'pulse']], say: 'Khi rung động truyền đến tai, ta nghe thấy âm thanh.' },
      { bg: 'pond', items: [['🐬', 'slide'], ['〰️', '']], say: 'Âm thanh còn truyền được qua nước và qua chất rắn như mặt bàn, bức tường.' },
      { bg: 'space', items: [['🚀', ''], ['🔇', 'pulse']], say: 'Trong chân không, không có không khí, âm thanh không truyền được.' },
    ],
  },
  tieuhoa: {
    title: 'Hành trình của thức ăn', emoji: '🍚',
    scenes: [
      { bg: 'room', items: [['🍚', ''], ['👄', 'pulse']], say: 'Thức ăn được răng nhai nhỏ và trộn với nước bọt ở miệng.' },
      { bg: 'room', items: [['⬇️', 'fall']], say: 'Thức ăn được nuốt xuống thực quản.' },
      { bg: 'room', items: [['🫙', 'shake']], say: 'Ở dạ dày, thức ăn được nhào trộn và tiêu hóa một phần.' },
      { bg: 'room', items: [['➰', 'spin']], say: 'Ở ruột non, chất dinh dưỡng được hấp thụ vào máu để nuôi cơ thể.' },
      { bg: 'room', items: [['🚽', '']], say: 'Phần bã đi xuống ruột già và được thải ra ngoài. Vì vậy cần ăn chín, uống sôi, ăn đủ bữa.' },
    ],
  },
  mach: {
    title: 'Mạch điện thắp sáng bóng đèn', emoji: '💡',
    scenes: [
      { bg: 'room', items: [['🔋', 'pulse']], say: 'Pin là nguồn điện.' },
      { bg: 'room', items: [['🔋', ''], ['〰️', ''], ['💡', '']], say: 'Dây dẫn nối pin với bóng đèn tạo thành một mạch điện kín.' },
      { bg: 'room', items: [['🔋', ''], ['〰️', 'slide'], ['💡', 'pulse']], say: 'Dòng điện chạy qua mạch kín làm bóng đèn sáng.' },
      { bg: 'night', items: [['🔋', ''], ['✂️', 'shake'], ['💡', 'fade']], say: 'Nếu mạch bị hở, dòng điện không chạy được, đèn tắt.' },
      { bg: 'room', items: [['⚠️', 'pulse'], ['🔌', '']], say: 'Điện trong nhà rất nguy hiểm. Không tự nghịch ổ cắm, không chạm tay ướt vào đồ điện.' },
    ],
  },
  vikhuan: {
    title: 'Rửa tay đánh bay vi khuẩn', emoji: '🧼',
    scenes: [
      { bg: 'room', items: [['🖐️', ''], ['🦠', 'pulse'], ['🦠', 'pulse']], say: 'Trên tay có những vi khuẩn rất nhỏ, mắt thường không nhìn thấy.' },
      { bg: 'room', items: [['🧼', 'shake'], ['💧', 'fall']], say: 'Làm ướt tay bằng nước sạch, xoa xà phòng.' },
      { bg: 'room', items: [['🙌', 'shake']], say: 'Chà lòng bàn tay, mu bàn tay, kẽ ngón tay và đầu ngón tay.' },
      { bg: 'room', items: [['🦠', 'fade'], ['💧', 'fall']], say: 'Xả sạch dưới vòi nước. Vi khuẩn bị trôi đi.' },
      { bg: 'room', items: [['✋', 'pulse'], ['✨', 'spin']], say: 'Nhớ rửa tay trước khi ăn và sau khi đi vệ sinh nhé!' },
    ],
  },
  chuoi: {
    title: 'Chuỗi thức ăn', emoji: '🌿',
    scenes: [
      { bg: 'sky', items: [['☀️', 'pulse'], ['🌿', 'grow']], say: 'Cỏ tự tạo ra chất dinh dưỡng nhờ ánh sáng mặt trời.' },
      { bg: 'land', items: [['🌿', ''], ['🐇', 'slide']], say: 'Thỏ ăn cỏ.' },
      { bg: 'land', items: [['🐇', ''], ['🦊', 'slide']], say: 'Cáo ăn thỏ.' },
      { bg: 'land', items: [['🌿', ''], ['➡️', ''], ['🐇', ''], ['➡️', ''], ['🦊', 'pulse']], say: 'Cỏ, thỏ, cáo tạo thành một chuỗi thức ăn. Chuỗi thức ăn thường bắt đầu từ thực vật.' },
    ],
  },
  // ---- Truyện lịch sử – truyền thuyết ----
  giong: {
    title: 'Thánh Gióng', emoji: '🐎',
    scenes: [
      { bg: 'village', items: [['👶', 'pulse']], say: 'Ngày xưa, ở làng Gióng có một cậu bé lên ba tuổi vẫn chưa biết nói, biết cười.' },
      { bg: 'village', items: [['📯', 'shake']], say: 'Khi giặc Ân đến xâm lược, nhà vua cho sứ giả đi khắp nơi tìm người tài giỏi cứu nước.' },
      { bg: 'village', items: [['👶', ''], ['💬', 'pulse']], say: 'Cậu bé bỗng cất tiếng nói, xin vua rèn ngựa sắt, roi sắt và áo giáp sắt.' },
      { bg: 'village', items: [['🍚', ''], ['🧒', 'grow']], say: 'Từ đó, Gióng lớn nhanh như thổi. Bà con cả làng góp gạo nuôi cậu.' },
      { bg: 'land', items: [['🐎', 'slide']], say: 'Gióng vươn vai thành tráng sĩ, mặc áo giáp sắt, cưỡi ngựa sắt xông ra trận.' },
      { bg: 'land', items: [['🎋', 'shake'], ['🎋', 'shake']], say: 'Roi sắt gãy, Gióng nhổ những bụi tre bên đường quật vào giặc.' },
      { bg: 'sky', items: [['🐎', 'rise'], ['☁️', '']], say: 'Đánh tan giặc, Gióng cưỡi ngựa bay về trời. Nhân dân lập đền thờ để tưởng nhớ.' },
    ],
  },
  banhchung: {
    title: 'Sự tích bánh chưng, bánh giầy', emoji: '🟩',
    scenes: [
      { bg: 'palace', items: [['👑', 'pulse']], say: 'Vua Hùng muốn chọn người nối ngôi, bảo các con tìm lễ vật dâng cúng tổ tiên.' },
      { bg: 'palace', items: [['💎', 'pulse'], ['🦞', '']], say: 'Các lang đi tìm của ngon vật lạ.' },
      { bg: 'village', items: [['🧑‍🌾', ''], ['🌾', 'shake']], say: 'Lang Liêu nghèo, chỉ có lúa gạo do mình trồng.' },
      { bg: 'night', items: [['💤', 'pulse']], say: 'Một đêm, thần báo mộng: trong trời đất, không gì quý bằng hạt gạo.' },
      { bg: 'village', items: [['🟩', 'grow']], say: 'Lang Liêu lấy gạo nếp làm bánh hình vuông tượng trưng cho Đất, gọi là bánh chưng,' },
      { bg: 'village', items: [['⚪', 'grow']], say: 'và bánh hình tròn tượng trưng cho Trời, gọi là bánh giầy.' },
      { bg: 'palace', items: [['👑', ''], ['🎉', 'spin']], say: 'Vua rất vui, truyền ngôi cho Lang Liêu. Từ đó, Tết đến người Việt gói bánh chưng, bánh giầy.' },
    ],
  },
  sontinh: {
    title: 'Sơn Tinh, Thủy Tinh', emoji: '⛰️',
    scenes: [
      { bg: 'palace', items: [['👸', 'pulse']], say: 'Vua Hùng thứ mười tám có người con gái xinh đẹp tên là Mị Nương.' },
      { bg: 'land', items: [['⛰️', 'grow'], ['🌊', 'shake']], say: 'Sơn Tinh, thần núi, và Thủy Tinh, thần nước, cùng đến cầu hôn.' },
      { bg: 'palace', items: [['🎁', 'pulse']], say: 'Vua hẹn: ai mang lễ vật đến trước thì được cưới Mị Nương.' },
      { bg: 'land', items: [['⛰️', ''], ['👸', 'slide']], say: 'Sơn Tinh đến trước và rước Mị Nương về núi.' },
      { bg: 'rain', items: [['🌊', 'rise'], ['🌧️', 'shake']], say: 'Thủy Tinh đến sau, tức giận dâng nước đánh Sơn Tinh.' },
      { bg: 'land', items: [['⛰️', 'grow']], say: 'Nước dâng cao bao nhiêu, đồi núi cao lên bấy nhiêu. Thủy Tinh thua, phải rút về.' },
      { bg: 'rain', items: [['🌧️', 'fall']], say: 'Người xưa kể rằng năm nào Thủy Tinh cũng dâng nước, để giải thích hiện tượng lũ lụt.' },
    ],
  },
  bachdang: {
    title: 'Chiến thắng Bạch Đằng năm 938', emoji: '🌊',
    scenes: [
      { bg: 'river', items: [['⛵', 'slide'], ['⛵', 'slide']], say: 'Năm chín trăm ba mươi tám, quân Nam Hán kéo sang xâm lược nước ta.' },
      { bg: 'river', items: [['🪵', 'fall'], ['🪵', 'fall'], ['🪵', 'fall']], say: 'Ngô Quyền cho cắm cọc gỗ đầu bịt sắt xuống lòng sông Bạch Đằng.' },
      { bg: 'river', items: [['🌊', 'rise']], say: 'Khi nước triều lên, bãi cọc bị nước che khuất.' },
      { bg: 'river', items: [['🛶', 'slide'], ['⛵', 'slide']], say: 'Ngô Quyền cho thuyền nhẹ ra khiêu chiến, rồi giả thua để nhử thuyền giặc vào sâu.' },
      { bg: 'river', items: [['🌊', 'fall'], ['⛵', 'shake'], ['🪵', '']], say: 'Nước triều rút, thuyền giặc to nặng đâm vào cọc, bị vỡ và đắm.' },
      { bg: 'sky', items: [['🚩', 'pulse'], ['🎉', 'spin']], say: 'Quân ta thắng lớn. Chiến thắng Bạch Đằng mở ra thời kì độc lập lâu dài cho dân tộc.' },
    ],
  },
};

// Clip theo môn × lớp
export const CLIPS_BY = {
  kh: {
    mn1: ['hat', 'vikhuan'], mn2: ['nuoc', 'buom', 'ngaydem'], l1: ['hat', 'vikhuan'],
    l2: ['nuoc', 'ech'], l3: ['ngaydem', 'quanghop', 'tieuhoa'],
    l4: ['bathe', 'nuoc', 'amthanh', 'chuoi', 'quanghop'], l5: ['mach', 'buom', 'ech', 'vikhuan'],
  },
  ls: {
    mn1: ['banhchung'], mn2: ['giong', 'sontinh'], l1: ['banhchung', 'giong'],
    l2: ['sontinh', 'giong'], l3: ['bachdang'], l4: ['bachdang'], l5: ['bachdang'],
  },
};
