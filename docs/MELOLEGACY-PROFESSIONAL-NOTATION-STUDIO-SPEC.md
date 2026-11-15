# MELOLEGACY PROFESSIONAL NOTATION STUDIO
## Bản đặc tả tổng thể – Baseline kiến trúc và phát triển

- Phiên bản tài liệu: 1.0
- Ngày lập: 15/11/2026
- Dự án: MeloLegacy Studio
- Nhánh áp dụng: `research-room-prototype`
- Trạng thái: Baseline yêu cầu đã tổng hợp; chưa đồng nghĩa mọi chức năng đã được triển khai.

---

## 1. Mục tiêu sản phẩm

MeloLegacy Professional Notation Studio là không gian làm việc ký âm và học tập âm nhạc, kết hợp soạn nhạc có cấu trúc, trình diễn bản nhạc, nhập/chuyển đổi tài liệu âm nhạc, nhận dạng ký âm viết tay và huấn luyện AI.

Sản phẩm phải phục vụ giáo viên, học sinh, người sáng tác, ca sĩ, người chơi nhạc cụ và người yêu âm nhạc. Định hướng là công cụ giáo dục miễn phí, dễ tiếp cận, ưu tiên thiết bị iPad có Apple Pencil và Android; không phụ thuộc vào dịch vụ trả phí đắt đỏ để có thể sử dụng các chức năng nền tảng.

Đây không phải tập hợp các màn hình hoặc công cụ rời rạc. Các phần phải dùng chung một mô hình bản nhạc có cấu trúc và một lõi ký âm thống nhất.

### 1.1 Kết quả người dùng cần đạt được

Người dùng có thể:
1. Tạo bản nhạc mới và ký âm theo quy tắc âm nhạc.
2. Đọc, trình diễn, phát và chỉnh sửa cùng một bản nhạc.
3. Nhập ảnh, PDF, MusicXML và dữ liệu viết tay để đưa nội dung vào quy trình nhận dạng.
4. Sửa, xác nhận và xuất bản nhạc ở định dạng có cấu trúc.
5. Luyện viết ký hiệu, nghe thử, so sánh kết quả AI và đóng góp dữ liệu theo quyền cho phép.
6. Lưu trữ tác phẩm cá nhân và, nếu tự nguyện, chia sẻ dữ liệu đã được kiểm duyệt cho kho cộng đồng.

### 1.2 Nguyên tắc sản phẩm

- Giáo dục và bảo tồn di sản âm nhạc là trọng tâm.
- Miễn phí ở các chức năng học tập cốt lõi; ưu tiên công nghệ mở và phương án tiết kiệm.
- Giao diện tiếng Việt mặc định; giữ nguyên thương hiệu MeloLegacy.
- Thiết kế trang nhạc sáng, giao diện công cụ nền tối với điểm nhấn vàng cổ điển.
- Piano là bộ ký âm và âm thanh đầu tiên; mô hình dữ liệu phải mở rộng cho thanh nhạc và nhạc cụ khác.
- Không đặt marketplace hoặc mua bán làm trọng tâm.
- Không tuyên bố chức năng AI/OMR đã hoạt động khi mới có giao diện hoặc khung thử nghiệm.

---

## 2. Các nguyên tắc kiến trúc không được phá vỡ

### 2.1 Một bản nhạc – Một không gian – Hai chế độ

Trình diễn và Soạn nhạc là hai chế độ hiển thị của cùng một bản nhạc, không phải hai ứng dụng hoặc hai bản sao dữ liệu.

**Chế độ Trình diễn**
- Tập trung vào trang nhạc.
- Ẩn thanh công cụ biên tập và các thành phần không cần thiết.
- Có thể giữ các công cụ phục vụ biểu diễn như Piano, Tuner, Metronome và thư viện theo thiết kế đã thống nhất.
- Cho phép đọc, theo dõi và phát bản nhạc.

**Chế độ Soạn nhạc**
- Hiển thị thư viện, thanh công cụ ký âm và các công cụ chỉnh sửa.
- Cho phép tạo, chọn, di chuyển, sửa và xóa đối tượng theo quyền và thao tác.
- Hiển thị bảng thuộc tính khi cần, tránh làm giao diện luôn chật.

**Chuyển chế độ**
- Có nút Trình diễn/Trở về soạn nhạc.
- Thao tác chạm hai ngón tay trên trang nhạc có thể chuyển chế độ.
- Việc chuyển đổi không được làm mất dữ liệu, vị trí cuộn, vùng chọn hoặc trạng thái bản nhạc.
- Cần xử lý gesture có ngưỡng và vùng kích hoạt rõ ràng để tránh chuyển nhầm khi chạm/nhấc tay.

### 2.2 Một Notation Engine dùng chung

Một lõi ký âm có cấu trúc là nguồn dữ liệu chuẩn (single source of truth) cho:
- Trình soạn nhạc.
- Trình diễn bản nhạc.
- Phát lại âm thanh.
- Nhập và xuất MusicXML.
- OMR từ ảnh/PDF.
- Nhận dạng chữ viết tay.
- Bài tập luyện tập và phân tích âm nhạc.
- Lưu trữ và đồng bộ về sau.

Không xây các bộ dữ liệu bản nhạc riêng biệt cho từng tính năng. Mỗi tính năng là một cách nhập, xử lý, trình bày hoặc xuất cùng một mô hình bản nhạc.

### 2.3 MELO PRESERVATION RULE – Nguyên tắc bảo toàn khi phát triển

- Chỉ sửa đúng phạm vi đã yêu cầu.
- Giữ nguyên giao diện, bố cục, dữ liệu, chức năng và hành vi đã thống nhất nếu không được yêu cầu thay đổi.
- Không tự ý xóa, thay thế, đơn giản hóa hoặc thiết kế lại thành phần đang có.
- Không refactor hoặc đổi kiến trúc ngoài phạm vi nếu chưa được đồng ý.
- Ưu tiên thay đổi nhỏ, có thể kiểm tra và hoàn tác.
- Trước khi sửa phải xác định thành phần liên quan và phụ thuộc của nó.
- Sau khi sửa phải kiểm tra chức năng mới và hồi quy các chức năng cũ có thể bị ảnh hưởng.
- Nếu một yêu cầu buộc phải tác động sang vùng khác, giải thích nguyên nhân và xin ý kiến trước.

---

## 3. Cấu trúc sản phẩm và các không gian chức năng

### 3.1 Không gian bản nhạc (Notation Workspace)

Là trung tâm của Studio. Chứa trang nhạc, dữ liệu bản nhạc, các công cụ soạn và chế độ trình diễn. Không được tách thành các bản sao độc lập.

### 3.2 Thư viện bản nhạc

- Tạo bản nhạc mới.
- Mở bản nhạc đã lưu.
- Quản lý tên, tác giả, mô tả, nhạc cụ, thể loại và thông tin cần thiết.
- Nhóm/sắp xếp bản nhạc.
- Phân biệt bản nhạc cá nhân, bản nhạc được chia sẻ và tài liệu nguồn.
- Có thể mở rộng liên kết với Melocloud, nhưng không được giả định đồng bộ đám mây đã có trong prototype.

### 3.3 Phòng nghiên cứu và huấn luyện MOMD

Không gian dành cho việc chuẩn bị, thực hành, kiểm tra và xác nhận dữ liệu ký âm viết tay. Đây là môi trường nghiên cứu liên kết với Notation Engine, không phải một trình soạn nhạc độc lập.

Chức năng mục tiêu:
- Nhập ảnh, PDF, tài liệu, âm thanh hoặc nguồn tham khảo phù hợp.
- Hiển thị bản gốc và kết quả nhận dạng để so sánh.
- Luyện viết trên khuông nhạc.
- Nghe thử ký hiệu hoặc đoạn nhạc.
- Sửa và xác nhận kết quả.
- Lưu mẫu cá nhân vào Kho A theo quyền riêng tư.
- Chỉ chuyển dữ liệu sang Kho B khi có đồng ý rõ ràng và kiểm duyệt.

### 3.4 Công cụ âm nhạc dùng chung

- Piano ảo và bộ phát âm thanh.
- Tuner dùng chung cho giọng hát và nhạc cụ.
- Metronome.
- Công cụ nghe thử bản nhạc/đoạn nhạc.
- Các công cụ này phải dùng chung dịch vụ âm thanh khi kiến trúc đủ điều kiện, tránh mỗi phòng có một bộ phát độc lập gây xung đột.

---

## 4. Chuẩn trang nhạc và bố cục ký âm

### 4.1 Khổ giấy mặc định

- Khổ A4 dọc.
- Mặc định 10 hệ thống khuông nhạc trên một trang theo cấu hình đã chốt.
- Mỗi hệ thống có 5 dòng kẻ.
- Mỗi hệ thống mặc định có 5 ô nhịp.
- Khoảng cách và kích thước phải phân bố cân đối theo chiều cao trang A4.
- Có thể mở rộng số trang/hệ thống khi nội dung vượt trang; không nén ký hiệu đến mức khó đọc.

### 4.2 Thành phần đầu hệ thống

- Khóa nhạc ở đầu khuông.
- Số chỉ nhịp đặt sau khóa nhạc theo chuẩn ký âm.
- Dấu hóa đầu khuông (nếu có) phải nằm đúng vị trí và theo thứ tự chuẩn.
- Vạch nhịp phân chia ô nhịp.
- Số ô nhịp và chỉ dẫn chỉ hiển thị khi cần, không thay thế ký âm.

### 4.3 Hệ thống ô nhịp và dàn trang

- Thêm ô nhịp cuối bằng công cụ cộng đã có.
- Chèn ô nhịp giữa bằng công cụ vạch nhịp hoặc thao tác tương ứng.
- Khi chèn, hệ thống phải cập nhật cấu trúc ô nhịp và dàn lại nội dung phía sau; không chỉ vẽ thêm một đường trên ảnh.
- Các nốt, dấu, lời ca và đối tượng liên quan phải giữ quan hệ âm nhạc sau khi reflow.
- Hỗ trợ nhiều trang khi cần.
- Tách nội dung âm nhạc (semantic score data) khỏi tọa độ trình bày; tọa độ được tính lại khi thay đổi khổ giấy, số ô nhịp hoặc kích thước.

### 4.4 Ký âm chuẩn

Phải hỗ trợ theo từng giai đoạn:
- Khóa Sol, Fa và các khóa cần thiết.
- Số chỉ nhịp, vạch nhịp, dấu hóa đầu khuông.
- Nốt tròn, trắng, đen, móc đơn, móc kép và các biến thể.
- Dấu lặng tương ứng.
- Dấu thăng, giáng, bình.
- Chấm dôi, nối, luyến, dấu ngân.
- Các nhóm nốt, dấu hóa, cường độ, tốc độ, articulation, lời ca và ký hiệu biểu diễn.
- Nhiều bè/voice khi engine đã hỗ trợ.
- Tính toán vị trí nốt theo dòng/khe khuông, ledger lines, stem direction, beam grouping và collision avoidance.

Không coi glyph được đặt bằng tọa độ tự do là một đối tượng ký âm hoàn chỉnh. Một nốt phải có cao độ, trường độ, voice, ô nhịp và quan hệ nhịp học phù hợp.

---

## 5. Công cụ soạn nhạc và tương tác

### 5.1 Nhóm công cụ

Giữ các nhóm chức năng đã có và mở rộng theo nhu cầu:
- Chọn/di chuyển.
- Hoàn tác/làm lại.
- Ký hiệu nốt và dấu lặng.
- Dấu hóa và ký hiệu âm nhạc.
- Bút viết tay/ghi chú.
- Bút chì, bút mực, bút đánh dấu.
- Tẩy.
- Văn bản/lời ca.
- Vạch nhịp, thêm hệ thống và thêm ô nhịp.
- Bảng thuộc tính.
- Nhập tệp và xuất tệp.
- Thiết lập hệ thống ở góc phải dưới như giao diện đã thống nhất.

### 5.2 Bút và nét tự do

- Hỗ trợ Apple Pencil và cảm ứng.
- Lưu dữ liệu nét (stroke) gồm các điểm, thời gian, áp lực/nghiêng nếu thiết bị cung cấp.
- Cho phép chỉnh màu, độ dày, kiểu bút và tẩy.
- Phân biệt nét ghi chú tự do với ký hiệu âm nhạc có cấu trúc.
- Không tự biến mọi nét thành ký hiệu âm nhạc khi chưa đủ độ tin cậy.

### 5.3 Bảng thuộc tính

Bảng thuộc tính chỉ xuất hiện khi có đối tượng được chọn hoặc khi người dùng yêu cầu. Tùy đối tượng, cho phép chỉnh:
- Kích thước.
- Vị trí.
- Độ dày/độ dài nét.
- Màu.
- Cao độ/trường độ và thuộc tính nhạc lý đối với ký hiệu có cấu trúc.
- Căn chỉnh và thứ tự lớp đối với ghi chú tự do.

---

## 6. Mô hình dữ liệu ký âm chuẩn

Notation Engine cần mô hình dữ liệu độc lập với giao diện và tọa độ màn hình.

### 6.1 Thực thể cốt lõi

- Score: tác phẩm/bản nhạc.
- Metadata: tên, tác giả, bản quyền, mô tả, ngôn ngữ, nguồn.
- Part: phần nhạc cụ/giọng hát.
- Staff: khuông nhạc.
- Measure: ô nhịp.
- Voice: bè/luồng nhịp trong khuông.
- Event: sự kiện âm nhạc theo thời gian.
- Note: cao độ, quãng tám, trường độ, voice, vị trí nhịp và thuộc tính.
- Rest: trường độ và vị trí nhịp.
- Pitch: bước âm, alter, octave và cách biểu diễn.
- Duration: trường độ có cấu trúc, gồm giá trị cơ bản, dấu chấm dôi và tuplets khi hỗ trợ.
- Clef, KeySignature, TimeSignature.
- Accidental.
- Tie, Slur, Beam, Articulation, Dynamic, Tempo.
- Lyric/Text.
- Annotation/FreehandStroke.
- Layout: khổ giấy, hệ thống, khoảng cách, vị trí trình bày.
- SourceAsset: ảnh/PDF/tệp nguồn và thông tin xuất xứ.
- RecognitionResult: kết quả OMR/handwriting, confidence và trạng thái review.

### 6.2 Nguyên tắc dữ liệu

- Dữ liệu âm nhạc có cấu trúc là nguồn chuẩn.
- Tọa độ hiển thị không phải nguồn chuẩn cho cao độ/trường độ.
- Lưu lịch sử thay đổi và khả năng hoàn tác.
- Có schema version và migration.
- Nhập lỗi phải an toàn: không làm mất hoặc ghi đè bản nhạc đang mở.
- Lưu cục bộ trước; đồng bộ đám mây là lớp mở rộng, không bắt buộc để chạy chức năng cốt lõi.

---

## 7. Nhập, nhận dạng, chuyển đổi và xuất

Phải phân biệt rõ **nhận tệp**, **đọc nội dung**, **nhận dạng**, và **chuyển thành bản nhạc chỉnh sửa được**. Một nút chọn tệp không có nghĩa định dạng đó đã được hỗ trợ đầy đủ.

### 7.1 Nguồn đầu vào mục tiêu

1. Ảnh chụp hoặc ảnh quét bản nhạc.
2. PDF bản nhạc.
3. MusicXML (tên định dạng chính xác; không phải “MusicML”).
4. Nét viết tay từ Apple Pencil/ngón tay.
5. Bản nhạc được người dùng sửa/xác nhận.
6. Các nguồn âm thanh/tài liệu khác trong lộ trình nghiên cứu, khi có bộ chuyển đổi phù hợp.

### 7.2 MusicXML

- Đọc MusicXML và tạo mô hình Score có cấu trúc.
- Giữ các thuộc tính nhạc lý được hỗ trợ.
- Báo rõ thành phần chưa hỗ trợ, không âm thầm bỏ dữ liệu.
- Xuất MusicXML từ mô hình thực, phản ánh các nốt, dấu, nhịp, bè và cấu trúc đã chỉnh sửa.
- Có kiểm tra round-trip: nhập → lưu/chỉnh sửa → xuất → nhập lại và so sánh dữ liệu.
- Hỗ trợ các biến thể phổ biến của MusicXML theo phạm vi được kiểm thử.

### 7.3 OMR: ảnh/PDF sang ký âm có cấu trúc

Pipeline mục tiêu:
1. Nhận tệp và kiểm tra chất lượng.
2. Tiền xử lý ảnh/PDF: xoay, deskew, khử nhiễu, phân trang/crop.
3. Phát hiện khuông, dòng kẻ, khóa, dấu nhịp và cấu trúc trang.
4. Nhận dạng ký hiệu và quan hệ không gian.
5. Phân tích ngữ cảnh âm nhạc và nhịp học.
6. Tạo MusicXML hoặc mô hình Score nội bộ.
7. Hiển thị vùng chưa chắc chắn để người dùng sửa.
8. Lưu nguồn gốc, confidence và lịch sử xác nhận.

Không tự nhận là OMR hoàn chỉnh nếu chỉ tải được ảnh hoặc PDF.

### 7.4 Nhập ảnh và PDF

- Cho phép xem bản gốc song song với kết quả nhận dạng.
- Không ghi đè bản gốc.
- Có thể nhập nhiều trang.
- Giữ liên kết giữa vùng ảnh nguồn và sự kiện âm nhạc được nhận dạng để người dùng đối chiếu.

### 7.5 Xuất

- MusicXML có cấu trúc.
- JSON dự án có schema version.
- PDF/in theo khổ giấy và dàn trang.
- Các định dạng ảnh hoặc âm thanh có thể bổ sung sau khi có engine tương ứng.

---

## 8. MOMD – Melolegacy Original Music Dataset

### 8.1 Mục tiêu

MOMD là hệ thống dữ liệu phục vụ nhận dạng ký âm viết tay và cải thiện mô hình theo cách viết thực tế của người học, giáo viên và cộng đồng.

Triết lý: **Cùng học. Cùng điều chỉnh và cùng thay đổi.**

AI cần học các biến thể chữ viết hợp lệ. Người viết được hướng dẫn làm rõ ký hiệu khi nét viết mơ hồ. Không ép người dùng viết giống hệt máy móc và cũng không ép AI đoán khi dữ liệu không đủ.

### 8.2 Hai kho dữ liệu

**Kho A – Personal Training Dataset**
- Mẫu cá nhân/riêng tư.
- Theo tài khoản hoặc phạm vi người dùng.
- Mặc định không chia sẻ ra cộng đồng.
- Người dùng có quyền xem, sửa, xóa và quản lý mẫu theo chính sách dữ liệu.

**Kho B – Verified Community Dataset**
- Dữ liệu cộng đồng đã được người dùng đồng ý chia sẻ.
- Có kiểm duyệt, nhãn chuẩn, nguồn gốc, giấy phép/quyền sử dụng và kiểm tra riêng tư.
- Không tự động nhận dữ liệu từ Kho A.
- Chỉ dùng dữ liệu đáp ứng tiêu chí chất lượng và quyền sử dụng.

### 8.3 Các nhóm mô hình logic

- A1 Personal Symbol AI: nhận dạng ký hiệu cá nhân.
- A2 Personal Score AI: hiểu cấu trúc bản nhạc cá nhân.
- B1 Global Symbol AI: nhận dạng ký hiệu từ dữ liệu cộng đồng đã xác minh.
- B2 Global Score AI: hiểu cấu trúc bản nhạc từ dữ liệu cộng đồng.
- Music Understanding Engine: hợp nhất ngữ cảnh, kiểm tra tính hợp lệ và tạo mô hình Score/MusicXML.

Đây là phân chia logic; cách triển khai mô hình thực tế có thể thay đổi theo đánh giá kỹ thuật, nhưng ranh giới quyền riêng tư và dữ liệu phải giữ.

### 8.4 Pipeline nhận dạng viết tay

1. Thu thập nét từ Apple Pencil/ngón tay.
2. Lưu stroke vector cùng thông tin thời gian/áp lực nếu có.
3. Phân nhóm nét thành ký hiệu đang hình thành.
4. Theo dõi trạng thái: đang viết → nhóm đang hình thành → kiểm tra ngữ cảnh → hoàn thành.
5. Nhận dạng hình dạng và hướng.
6. Kiểm tra vị trí trên khuông, thời gian, quan hệ với các ký hiệu khác.
7. Tính confidence.
8. Nếu chưa chắc, yêu cầu thêm nét hoặc người dùng xác nhận.
9. Khi người dùng sửa, lưu phiên bản trước/sau và lý do sửa nếu có.
10. Chỉ dùng mẫu cho huấn luyện khi có quyền và đáp ứng tiêu chí dữ liệu.

Ví dụ: đầu nốt có thể được viết trước thân hoặc đuôi; hệ thống phải chờ và cập nhật nhóm ký hiệu khi nét tiếp theo xuất hiện. Dấu hóa phải liên hệ với nốt và phạm vi áp dụng phù hợp, không phân loại tách rời khỏi ngữ cảnh.

### 8.5 Bộ mẫu khởi đầu

Mười ký hiệu cơ bản đã thống nhất để bắt đầu:
- Nốt tròn, nốt trắng, nốt đen, nốt móc đơn, nốt móc kép.
- Lặng tròn, lặng trắng, lặng đen, lặng đơn, lặng kép.

Mỗi mẫu cần có:
- Ví dụ chuẩn và các biến thể hợp lệ.
- Bài tập viết.
- Nhận dạng theo thời gian thực.
- Phát âm thanh/nghe thử khi có thể.
- Sửa, xác nhận và lưu mẫu.
- Phân biệt đúng/sai về mặt ký âm với khác biệt phong cách viết hợp lệ.

Sau nhóm cơ bản, mở rộng dấu thăng/giáng/bình, chấm dôi, nối, luyến, khóa, số chỉ nhịp và nhóm ký hiệu phức tạp.


### 8.5.1 Bộ luyện viết theo từng loại ký hiệu

Mỗi loại ký hiệu có 10 ô luyện viết ban đầu riêng biệt; không chia 10 mẫu cho toàn bộ thư viện. Danh mục khởi đầu bao gồm:
- Nốt: tròn, trắng, đen, các dạng chấm dôi, móc đơn, móc kép và biến thể.
- Dấu lặng: từng loại trường độ tương ứng.
- Dấu hóa: thăng, giáng, bình.
- Dấu diễn tấu: nối, luyến, staccato, tenuto, accent, marcato.
- Cường độ: ppp, pp, p, mp, mf, f, ff, fff.
- Biến đổi cường độ và dấu khác: crescendo, diminuendo, fermata, trill, turn; danh mục được mở rộng theo taxonomy.

Mỗi ô lưu vector stroke cá nhân, loại ký hiệu, vị trí mẫu và thời điểm tạo. Người dùng có thể xóa nét trước khi lưu. Dữ liệu luyện ban đầu thuộc Kho A cá nhân.

### 8.5.2 Bổ sung 20 mẫu trong quá trình sáng tác

Mục tiêu tham chiếu là 30 mẫu cho từng loại: 10 mẫu luyện ban đầu + 20 mẫu được thu thập từ quá trình sáng tác. Khi người dùng chủ động bật chế độ thu mẫu, hệ thống ghi nhận nét viết trên khuông nhạc cùng loại ký hiệu đang chọn, gắn nguồn composer và trạng thái chờ xác nhận. Không tự động coi mẫu mới là nhãn đúng; cần bước review/xác nhận trước khi dùng huấn luyện. Mục tiêu 30 không phải giới hạn tổng số mẫu.

Bản prototype hiện mới lưu dữ liệu stroke và metadata cục bộ; chưa có mô hình nhận dạng, bộ phân loại, kiểm tra confidence hay pipeline huấn luyện AI thực tế. Không được mô tả đây là tính năng nhận dạng đã hoạt động.

### 8.6 Chất lượng dữ liệu và huấn luyện

- Tách Canonical Set và Validation Set.
- Không dùng cùng mẫu đánh giá để huấn luyện.
- Số lượng mẫu cho mỗi ký hiệu là mục tiêu đánh giá, không phải quota cứng.
- Mẫu được sửa và xác nhận có thể được tăng trọng số (đề xuất x3) sau khi qua validation và kiểm tra chất lượng.
- Có deduplication, kiểm tra nhãn và nguồn gốc.
- Mô hình có version; quy trình candidate → offline evaluation → staged rollout → promotion.
- Có rollback nếu chất lượng giảm.
- Không hardcode số lớp ký hiệu cố định; taxonomy phải mở rộng được.

### 8.7 Bảo vệ dữ liệu

- Consent rõ ràng, riêng cho việc sử dụng dữ liệu huấn luyện cộng đồng.
- Không mặc định chia sẻ dữ liệu học sinh.
- Có quyền và cơ chế kiểm duyệt của giáo viên theo chính sách đã thống nhất.
- Phân quyền tài khoản, kiểm soát truy cập và nhật ký.
- Giới hạn lưu trữ và loại bỏ mẫu kém giá trị/trùng lặp theo chính sách minh bạch.
- Ưu tiên lưu vector stroke, chỉ tạo raster khi cần; cache có thời hạn.
- Không thu thập thông tin không cần thiết.

### 8.8 Mục tiêu tốc độ

Mục tiêu thiết kế ban đầu cho nhận dạng viết tay là khoảng 3 giây trong điều kiện thiết bị và độ phức tạp phù hợp. Đây là mục tiêu cần đo bằng benchmark, không phải cam kết hiệu năng trước khi kiểm thử.

---

## 9. Âm thanh, Piano, Tuner và Metronome

### 9.1 Audio Engine dùng chung

Một Audio Engine phục vụ:
- Phát bản nhạc.
- Piano ảo.
- Tuner.
- Metronome.
- Nghe mẫu MOMD.
- Luyện tai và bài tập cao độ/nhịp điệu trong lộ trình sau.

Phải có quản lý trạng thái phát, dừng, âm lượng, thiết bị đầu ra và tránh nhiều nguồn phát xung đột.

### 9.2 Piano

- Piano là nhạc cụ đầu tiên.
- Bố cục bàn phím trên iPad: quãng tám 4 ở trung tâm, quãng tám 3 và 5 ở hai bên.
- Có điều chỉnh tuning.
- Ưu tiên soundfont/nguồn âm piano chất lượng; oscillator hiện tại chỉ là âm thử nghiệm.
- Phát đúng cao độ và trường độ từ Notation Engine.

### 9.3 Tuner

- Dùng chung cho giọng hát và nhạc cụ.
- Hiển thị nốt, tần số Hz và độ lệch cents.
- Chuẩn tham chiếu: 430, 440, 442, 444 Hz và tùy chỉnh.
- Cần quyền microphone; có trạng thái quyền truy cập và xử lý lỗi.
- Không hiển thị kết quả đo giả khi chưa kết nối bộ phân tích âm thanh thực.

### 9.4 Metronome

- BPM có thể thiết lập.
- Có nhịp/phách và nhấn phách đầu khi cấu hình nhịp hỗ trợ.
- Đồng bộ với tempo của bản nhạc khi cần.
- Điều khiển phát/dừng rõ ràng.

### 9.5 Âm lượng và phiên cộng tác

- Âm lượng phát bản nhạc là cục bộ theo thiết bị.
- Phân biệt âm lượng bản nhạc với âm lượng phòng/luồng truyền.
- Không đồng nhất điều chỉnh âm lượng trên thiết bị này với thiết bị khác.

---

## 10. Kiến trúc kỹ thuật mục tiêu

### 10.1 Hình thái ứng dụng

- PWA cài đặt được, ưu tiên iPad và Android.
- Giao diện web đáp ứng, ưu tiên trải nghiệm tablet; điện thoại có chế độ bố cục phù hợp.
- Có thể hoạt động offline cho các chức năng cốt lõi sau khi đã tải ứng dụng/tài nguyên cần thiết.
- Không yêu cầu Mac để phát triển hoặc sử dụng.

### 10.2 Các lớp logic

1. **Presentation/UI:** Reader, Editor, Library, Research Studio, dialogs, toolbars.
2. **Application Services:** thao tác score, import/export, undo/redo, settings, file management.
3. **Notation Domain/Engine:** schema và quy tắc ký âm, layout/reflow, validation.
4. **Audio Engine:** playback, piano, tuner, metronome.
5. **Recognition Adapters:** OMR, handwriting recognition, MusicXML parser.
6. **MOMD Data Services:** consent, dataset, review, versioning, evaluation.
7. **Persistence:** local project storage, asset storage, schema migration.
8. **Cloud/Identity (giai đoạn sau):** tài khoản, đồng bộ, phân quyền, Melocloud.

Có thể triển khai dần trong cùng repo; không cần tách microservices sớm khi chưa có quy mô hoặc ngân sách. Ranh giới module và API phải rõ để không tạo phụ thuộc vòng.

### 10.3 Công nghệ và nguyên tắc lựa chọn

- Ưu tiên web standards và thư viện mã nguồn mở có giấy phép phù hợp.
- Tránh phụ thuộc dịch vụ trả phí cho luồng cơ bản.
- Lựa chọn thư viện OMR/notation/audio phải đánh giá khả năng chạy trên thiết bị, giấy phép, kích thước, hiệu năng và khả năng bảo trì.
- Không thêm framework hoặc thay đổi stack chỉ vì sở thích; cần lý do kỹ thuật và kế hoạch migration.
- Bảo đảm font ký âm có phương án nhúng hoặc fallback rõ ràng, không phụ thuộc ngẫu nhiên vào font có sẵn trên thiết bị.

### 10.4 Lưu trữ

- Giai đoạn đầu: lưu cục bộ, export/import có kiểm tra.
- Tách metadata bản nhạc khỏi asset ảnh/PDF và dữ liệu stroke.
- Có autosave an toàn, trạng thái chưa lưu và phục hồi sau lỗi.
- Không ghi đè bản gốc khi import hoặc convert.
- Đồng bộ tài khoản/Melocloud là giai đoạn sau, có conflict resolution và version history.

---

## 11. Bảo mật, quyền riêng tư và quản trị

- Dữ liệu cá nhân mặc định riêng tư.
- Kho A và Kho B tách biệt về quyền truy cập và mục đích sử dụng.
- Không huấn luyện mô hình cộng đồng trên dữ liệu chưa có consent.
- Dữ liệu trẻ em/học sinh cần bảo vệ tăng cường, quyền kiểm soát và chính sách rõ ràng.
- Có phân quyền người dùng/giáo viên/quản trị theo nguyên tắc tối thiểu cần thiết.
- Có audit log cho hoạt động kiểm duyệt và thay đổi quyền.
- Có cơ chế khóa/thu hồi quyền truy cập theo chính sách quản trị đã thống nhất; không được dùng cơ chế này để xóa trái phép tác phẩm cá nhân hoặc vi phạm quyền người dùng.
- Tài nguyên cộng đồng phải có provenance, quyền sử dụng và điều kiện chia sẻ.

---

## 12. Lộ trình triển khai và phụ thuộc

Lộ trình dưới đây là thứ tự kỹ thuật đề xuất. Không có nghĩa phải chờ hoàn thành toàn bộ giai đoạn mới được thử nghiệm từng phần. Mỗi giai đoạn phải có kiểm thử và tiêu chí nghiệm thu.

### Giai đoạn 0 – Baseline và kiểm kê
- Chốt tài liệu đặc tả này làm chuẩn.
- Đối chiếu UI/code hiện tại với yêu cầu.
- Ghi rõ tính năng có thật, mô phỏng, chưa có.
- Xác định hồi quy và các rủi ro.
- Không redesign hoặc thay đổi UI trong bước kiểm kê.

### Giai đoạn 1 – Notation Domain và Engine nền
- Xây schema Score có cấu trúc.
- Nốt, dấu lặng, cao độ, trường độ, nhịp, khóa, dấu hóa, ô nhịp.
- Tính vị trí nốt trên khuông.
- Render từ dữ liệu có cấu trúc.
- Undo/redo dựa trên thao tác dữ liệu.
- Reflow khi thêm/chèn ô nhịp và thêm hệ thống.
- Bảo toàn Reader/Editor hiện tại.

**Nghiệm thu:** một nốt tạo ra phải có dữ liệu nhạc lý thực, phát và xuất được; không chỉ là glyph đặt tự do.

### Giai đoạn 2 – MusicXML và tài liệu
- Import MusicXML.
- Export MusicXML từ dữ liệu thật.
- Round-trip tests.
- Quản lý ảnh/PDF nguồn và liên kết đối chiếu.
- JSON schema version và migration.

**Nghiệm thu:** bản nhạc nhập vào mở được, chỉnh sửa được, xuất lại không mất các trường thuộc phạm vi hỗ trợ.

### Giai đoạn 3 – Playback và công cụ âm thanh
- Playback từ Score.
- Piano có cao độ/trường độ.
- Tuner microphone thật.
- Metronome thật.
- Audio state và volume management.

**Nghiệm thu:** nốt và nhịp phát đúng; tuner chỉ hiển thị phép đo thực khi được cấp quyền.

### Giai đoạn 4 – Handwriting Capture và MOMD Studio
- Capture vector strokes.
- Bảng bài tập 4 khuông/4 ô nhịp theo yêu cầu phòng luyện tập.
- Bộ 10 ký hiệu cơ bản.
- So sánh bản viết gốc và kết quả.
- Workflow review và lưu mẫu Kho A.

**Nghiệm thu:** người dùng có thể viết, xem nét, sửa và xác nhận dữ liệu; chưa gọi đó là AI nhận dạng nếu chưa có mô hình thực.

### Giai đoạn 5 – Handwriting Recognition
- Nhận dạng theo nhóm nét và ngữ cảnh.
- Confidence và yêu cầu xác nhận.
- Personal model A1/A2.
- Benchmark mục tiêu latency khoảng 3 giây.
- Không tự động đưa mẫu vào Kho B.

**Nghiệm thu:** có bộ test độc lập, precision/recall theo lớp, confusion matrix và đánh giá trên người viết chưa có trong tập huấn luyện.

### Giai đoạn 6 – OMR ảnh/PDF
- Phát hiện khuông và ký hiệu.
- Nhận dạng cấu trúc.
- Chuyển thành Score/MusicXML.
- Review và sửa lỗi.
- Liên kết ảnh gốc với kết quả.

**Nghiệm thu:** bộ test đa dạng về scan/ảnh chụp, đo độ chính xác theo ký hiệu và cấu trúc ô nhịp; không chỉ demo trên một ảnh mẫu.

### Giai đoạn 7 – Kho B và mô hình cộng đồng
- Consent và governance.
- Review queue, provenance, license.
- Verified dataset.
- Global model B1/B2.
- Versioning, staged rollout, rollback.

**Nghiệm thu:** không thể đưa dữ liệu cá nhân vào kho chung nếu thiếu consent và review.

### Giai đoạn 8 – Đồng bộ và mở rộng hệ sinh thái
- Tài khoản, đồng bộ và phục hồi.
- Tích hợp Melocloud theo quyết định riêng.
- Mở rộng nhạc cụ/giọng hát.
- Kết nối các không gian học tập và cộng tác của hệ sinh thái Melo khi được phê duyệt.

---

## 13. Trạng thái prototype hiện tại – kiểm kê ngày 15/11/2026

Kiểm tra mã nguồn `index.html` trên nhánh `research-room-prototype` và README hiện tại cho thấy:

### 13.1 Đã có ở mức giao diện/tương tác cơ bản
- Một file HTML/CSS/JavaScript đơn.
- Giao diện nền tối, điểm nhấn vàng, trang A4.
- 10 hệ thống khuông, 5 dòng mỗi hệ thống, 5 ô nhịp mặc định trong code hiện tại.
- Khóa Sol và số chỉ nhịp 4/4 được vẽ.
- Nhóm công cụ chọn, ký hiệu glyph, bút, văn bản, thêm hệ thống, vạch nhịp.
- Nút tải lên và tải xuống.
- Nút thiết lập hệ thống góc phải dưới.
- Hai chế độ Soạn nhạc/Trình diễn và gesture hai ngón ở mức cơ bản.
- Lưu localStorage và xuất JSON.
- In qua hộp thoại in của trình duyệt.
- Piano thử âm bằng oscillator.
- Modal Tuner, Metronome và MOMD ở mức giao diện/thử nghiệm.

### 13.2 Có giới hạn hoặc chưa triển khai thật
- Chưa có Notation Engine hoàn chỉnh; ký hiệu hiện được đặt như glyph/đối tượng đơn giản.
- Chưa có mô hình cao độ/trường độ đầy đủ và kiểm tra nhạc lý.
- MusicXML export hiện là khung skeleton, không phản ánh đầy đủ các ký hiệu đã thêm.
- Chọn tệp MusicXML/XML hiện chỉ thông báo importer chưa triển khai; chưa chuyển thành bản nhạc chỉnh sửa được.
- Import JSON chỉ hỗ trợ cấu trúc prototype hiện tại.
- Chưa có OMR ảnh/PDF.
- Chưa có nhận dạng chữ viết tay hoặc mô hình AI huấn luyện thực tế.
- Chưa có pipeline MOMD thực tế, Kho B và governance vận hành.
- Piano chưa dùng soundfont.
- Tuner chưa kết nối microphone/analyzer.
- Metronome chưa có bộ phát nhịp hoàn chỉnh.
- Chưa có đồng bộ cloud/tài khoản.
- Gesture hai ngón cần kiểm thử trên iPad để tránh kích hoạt nhầm.
- Chưa có kiểm thử thực tế trên iPad được xác nhận trong hồ sơ hiện tại.

### 13.3 Sai khác tài liệu cần ghi nhận

README hiện tại còn mô tả một số tính năng và thông số khác với mã nguồn hiện tại, ví dụ số hệ thống khuông. Vì vậy README cần được đồng bộ trong một thay đổi riêng sau khi baseline này được duyệt/áp dụng. Không tự ý sửa README trong cùng thay đổi tài liệu này.

### 13.4 Kết luận kiểm kê

Prototype là nền giao diện và tương tác ban đầu, chưa phải phần mềm ký âm chuyên nghiệp hoàn chỉnh. Không được suy diễn trạng thái READY của deployment thành việc mọi chức năng nghiệp vụ đã hoạt động. Mọi nghiệm thu phải dựa trên kiểm thử chức năng thực tế.

---

## 14. Tiêu chí nghiệm thu xuyên suốt

Mỗi tính năng chỉ được đánh dấu hoàn thành khi:
1. Đúng yêu cầu nghiệp vụ đã thống nhất.
2. Dữ liệu được lưu đúng và không mất sau thao tác.
3. Không phá vỡ chế độ Trình diễn/Soạn nhạc hoặc các tính năng hiện hữu.
4. Có trạng thái lỗi và thông báo rõ ràng.
5. Có kiểm thử trên trình duyệt mục tiêu; các thao tác Apple Pencil/touch phải được kiểm tra trên thiết bị thật trước khi tuyên bố tương thích.
6. Có kiểm thử dữ liệu biên và tệp lỗi.
7. Có kiểm thử hồi quy.
8. Có bằng chứng về kết quả kiểm thử; không dùng lời mô tả thay cho kiểm thử.

### 14.1 Kiểm thử ký âm
- Nốt ở dòng/khe/ledger line.
- Dấu hóa và phạm vi áp dụng.
- Nhịp/ô nhịp đủ, thiếu hoặc vượt trường độ.
- Stem/beam và va chạm ký hiệu.
- Chèn/xóa ô nhịp không mất dữ liệu.
- Nhiều hệ thống và nhiều trang.
- Đổi chế độ không đổi dữ liệu/vị trí.

### 14.2 Kiểm thử nhập/xuất
- MusicXML hợp lệ và không hợp lệ.
- PDF nhiều trang.
- Ảnh xoay/nghiêng/chất lượng thấp.
- JSON schema cũ/mới.
- Import lỗi không ghi đè bản nhạc đang mở.
- Round-trip không mất trường dữ liệu được hỗ trợ.

### 14.3 Kiểm thử AI/MOMD
- Nét viết rời và nét viết theo thứ tự khác nhau.
- Ký hiệu chưa hoàn chỉnh.
- Nét mơ hồ.
- Nhiều phong cách chữ viết.
- Người dùng sửa kết quả.
- Mẫu không có consent không được đưa vào Kho B.
- Rollback mô hình.

---

## 15. Quy tắc quản lý thay đổi

Mỗi yêu cầu mới cần được đối chiếu với tài liệu này:
- Nếu đã có trong baseline: triển khai theo phạm vi đó, không hỏi lại những điều đã chốt.
- Nếu là chi tiết chưa xác định: ghi nhận là open decision và hỏi đúng một câu cần thiết.
- Nếu mâu thuẫn với quyết định trước: nêu rõ điểm mâu thuẫn và ưu tiên quyết định mới nhất sau khi xác nhận.
- Nếu ảnh hưởng module khác: giải thích trước khi sửa.
- Mỗi thay đổi code nên có mô tả phạm vi, file bị tác động, kiểm thử và kết quả.
- Không cập nhật production chỉ vì code đã được sửa; phải kiểm tra build/deploy và smoke test phù hợp.

---

## 16. Các quyết định đã chốt và các điểm còn mở

### Đã chốt
- Tên sản phẩm: MeloLegacy Professional Notation Studio.
- PWA, ưu tiên iPad/Apple Pencil và Android.
- Một Notation Engine dùng chung.
- Một bản nhạc, hai chế độ Trình diễn/Soạn nhạc.
- A4 dọc, 10 hệ thống, 5 dòng mỗi khuông, 5 ô nhịp mặc định.
- Khóa và số chỉ nhịp theo chuẩn ký âm quốc tế.
- Piano là nhạc cụ đầu tiên.
- Nhập ảnh, PDF, MusicXML và viết tay là các nguồn đầu vào mục tiêu.
- OMR ảnh/PDF hướng tới MusicXML có cấu trúc.
- MOMD có Kho A cá nhân và Kho B cộng đồng đã xác minh.
- Không tự động chuyển dữ liệu A sang B.
- Nhận dạng phải hiểu nhóm nét và ngữ cảnh; không đoán khi chưa chắc.
- MELO PRESERVATION RULE.
- Ưu tiên công cụ miễn phí/chi phí thấp và dữ liệu riêng tư.

### Cần quyết định khi đến giai đoạn tương ứng
- Bộ thư viện/engine ký âm cụ thể sau khi đánh giá giấy phép và hiệu năng.
- Bộ parser MusicXML và phạm vi phiên bản/element hỗ trợ đầu tiên.
- Phương án OMR/handwriting model có thể chạy trong điều kiện ngân sách và thiết bị.
- Chính sách dung lượng tài khoản/cloud và thời gian lưu trữ chi tiết.
- Cơ chế đồng bộ, đăng nhập và quản trị khi triển khai backend.
- Các chỉ số chất lượng mục tiêu theo từng loại ký hiệu ngoài mục tiêu latency ban đầu.
- Lựa chọn soundfont và giấy phép phân phối.

---

## 17. Chỉ dẫn thực thi

Tài liệu này là baseline chức năng và kiến trúc. Bước triển khai tiếp theo phải là kiểm kê kỹ thuật có cấu trúc và thiết kế Notation Domain/Engine, không phải redesign giao diện.

Thứ tự ưu tiên gần nhất:
1. Giữ nguyên giao diện và chức năng hiện tại.
2. Thiết kế schema Score có cấu trúc.
3. Xây dựng adapter giữa UI hiện tại và Notation Engine.
4. Chuyển thao tác thêm nốt/dấu từ glyph tự do thành sự kiện âm nhạc có cấu trúc.
5. Bổ sung render, layout/reflow và kiểm thử.
6. Sau khi nền dữ liệu ổn định mới triển khai importer/exporter MusicXML thực.

**Không được đánh dấu OMR, handwriting AI, MusicXML importer, tuner microphone hoặc metronome là hoàn thành cho đến khi chức năng thực sự được triển khai và kiểm thử.**
