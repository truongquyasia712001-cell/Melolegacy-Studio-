# Composer Room — Phòng soạn nhạc Melolegacy

> Định hướng thiết kế và yêu cầu chức năng. Đây là tài liệu đặc tả, không đồng nghĩa các chức năng đã được lập trình hoặc triển khai.

## 1. Nguyên tắc

Composer Room là môi trường soạn nhạc trung tâm của Melolegacy. Giấy soạn nhạc, Solo, Piano/Grand Staff, nhiều bè và Orchestra đều là các bố cục trong cùng một phòng soạn nhạc, không phải các trình soạn nhạc tách biệt.

Ưu tiên khả năng đọc, viết nhạc, chỉnh sửa, nghe thử và tự động dàn trang. Người dùng tập trung vào âm nhạc; Melo tự cân chỉnh bố cục.

## 2. Music Manuscript / Giấy soạn nhạc

Cung cấp các mẫu bố cục có thể chọn:

- Solo: một khuông đơn, khóa Sol/Fa/Đô theo lựa chọn, khuông nhỏ hoặc tiêu chuẩn; nhiều khuông trên trang.
- Khuông lớn: khuông 5 dòng có kích thước lớn, khoảng cách rộng để viết tay hoặc ghi chi tiết.
- Grand Staff: hệ khóa Sol và Fa nối nhau, dành cho Piano/Keyboard.
- Orchestra score: tổng phổ nhiều nhạc cụ, nhóm khuông theo bộ dây, bộ gỗ, bộ đồng, bộ gõ, keyboard và nhạc cụ khác.
- Chamber/small ensemble: chọn các nhạc cụ và khuông cần thiết.
- Tùy chỉnh số khuông, kích thước, khoảng cách, lề, khổ giấy (A4/A3/Letter/custom), hướng dọc/ngang, khóa nhạc, số bè, nhịp, hóa biểu; có thể để trống các trường này khi cần.

## 3. Tự động dàn trang (Auto Music Layout)

Khi người dùng nhập hoặc viết nhạc, Melo tự động:

- Cân chỉnh vị trí và khoảng cách các nốt trong ô nhịp.
- Mở rộng ô nhịp khi nhiều nốt, dấu hóa, trường độ, articulation hoặc ký hiệu khiến nội dung cần thêm chỗ.
- Giữ đầu nốt, thân/đuôi nốt, dấu hóa và các ký hiệu đủ lớn, rõ, không chồng lấn và không quá sít.
- Không ép thu nhỏ ký hiệu để nhồi nhét vào một dòng.
- Tự phân bố lại các ô nhịp theo dòng; chuyển hệ thống khuông sang dòng kế khi cần.
- Tự chuyển trang khi hết không gian, giữ lề và tính liên tục của tác phẩm.
- Với tổng phổ, căn chỉnh các khuông trong cùng hệ thống và giữ quan hệ giữa các nhạc cụ.

Ưu tiên readability (dễ đọc) hơn mật độ nội dung.

## 4. Chỉnh sửa đầy đủ

Các bố cục giấy soạn nhạc sử dụng cùng năng lực chỉnh sửa của Composer Room, không phải editor rút gọn. Tùy ngữ cảnh, bao gồm:

- Thêm, xóa, chọn, di chuyển, sao chép/dán và chỉnh nốt; cao độ, quãng tám, trường độ.
- Khóa, hóa biểu, dấu hóa, nhịp, vạch nhịp, dấu nghỉ, nối nốt, chấm dôi.
- Articulation, dynamics, ornament, tempo, pedal và các ký hiệu biểu diễn.
- Bè, khuông, nhạc cụ, hệ thống khuông, cấu trúc đoạn, repeat, coda, segno và các ký hiệu cấu trúc.
- Undo/redo, chọn nhiều đối tượng, phát toàn bộ hoặc đoạn chọn, dừng/tua/lặp, điều chỉnh tempo, âm lượng, âm sắc và nghe lại sau chỉnh sửa.
- Hỗ trợ các chức năng mới của Composer Room trong các bố cục tương ứng; không tạo editor riêng cho mỗi mẫu giấy.

## 5. PDF / Ảnh chụp — nhận dạng bản nhạc in (OMR)

Đầu vào PDF và ảnh chụp bản nhạc in đi qua pipeline riêng với nhận dạng chữ viết tay. Quy tắc ký âm tiêu chuẩn và kiểm tra cấu trúc phải là nền tảng; AI hỗ trợ thị giác, không được âm thầm đoán dữ liệu không rõ.

Pipeline dự kiến:

1. Tiếp nhận PDF/ảnh; phân trang, xử lý độ phân giải, xoay/nghiêng và chất lượng ảnh.
2. Phát hiện khuông, dòng/khe, hệ thống khuông và vùng ký hiệu.
3. Nhận dạng ký hiệu, khóa, cao độ, trường độ, dấu hóa, nhịp, bè, articulation và cấu trúc.
4. Kiểm tra ngữ cảnh âm nhạc và cấu trúc; đối chiếu kết quả với ảnh gốc.
5. Tạo dữ liệu nhạc nội bộ và MusicXML khi đạt điều kiện.
6. Nếu còn vùng không đủ chắc chắn, không tự xác nhận; hiển thị lớp hiệu chỉnh.

Không cam kết mọi ảnh bất kể chất lượng đều có thể được máy tự nhận dạng chính xác. Mục tiêu là ngăn sai sót chưa phát hiện được trở thành kết quả đã xác minh.

## 6. Recognition Overlay — lớp phủ Composer Room

Lớp phủ chính là “cái bóng” của Composer Room, không phải công cụ sửa lỗi riêng.

- Lớp gốc (PDF/ảnh) được bảo toàn, làm nền đối chiếu; không bị chỉnh sửa hoặc biến đổi.
- Lớp ký âm Melo được căn chỉnh phía trên, là dữ liệu âm nhạc thực sự có thể chỉnh sửa.
- Lớp Melo có đầy đủ chức năng Composer Room phù hợp ngữ cảnh: chỉnh nốt/ký hiệu, bè, nhịp, cấu trúc, phát thử, undo/redo và các công cụ soạn nhạc.
- Bật/tắt lớp gốc, lớp nhận dạng; điều chỉnh độ trong suốt để đối chiếu.
- Chạm ký hiệu để chọn, sửa hoặc phóng to. Thao tác sửa cập nhật dữ liệu âm nhạc, không chỉ kéo hình đồ họa.
- Ký hiệu hoặc ô nhịp chưa rõ được phủ màu cảnh báo trực tiếp trên lớp Melo (ví dụ đỏ), không làm biến đổi ảnh gốc.
- Các phần rõ ràng vẫn được xử lý; chỉ vùng cần kiểm tra yêu cầu người dùng can thiệp.

## 7. Luồng tự động hoàn tất

### Trường hợp A — Đạt xác minh ngay

Nhận dạng → kiểm tra cấu trúc và đối chiếu → đạt điều kiện xác minh → bỏ qua màn hình overlay → tự mở bản nhạc hoàn chỉnh.

### Trường hợp B — Có vùng mơ hồ

Nhận dạng các phần có thể → mở Recognition Overlay với cảnh báo ngay trên nốt/ký hiệu hoặc ô nhịp liên quan → người dùng sửa trực tiếp bằng Composer Room → Melo xác minh lại.

Khi mọi điểm cần xử lý đã được giải quyết và kiểm tra đạt:

- Hiển thị trạng thái xanh xác nhận hoàn tất.
- Tự chuyển sang bản nhạc hoàn chỉnh, không yêu cầu đóng bảng hoặc điều hướng thủ công.

Nếu vẫn không đủ bằng chứng xác minh, giữ cảnh báo và không tự kết luận.

## 8. Phân biệt sửa lỗi và sáng tác lại

- **Correction / sửa nhận dạng:** thay đổi nhằm khớp bản gốc; phải được kiểm tra đối chiếu.
- **Composition edit / biên soạn:** người dùng chủ động thay đổi tác phẩm (chuyển giọng, thêm bè, sửa nội dung sáng tạo). Lưu như thay đổi sáng tác, không coi là bản chuyển đổi nguyên bản đã xác minh.

## 9. Tiêu chuẩn trạng thái

- Đang nhận dạng: tiến trình xử lý.
- Đạt xác minh: chuyển thẳng sang bản hoàn chỉnh, không hiện lớp trung gian.
- Có mơ hồ: hiển thị lớp phủ, đánh dấu trực tiếp tại vùng cần kiểm tra.
- Đang hiệu chỉnh: chỉnh sửa ngay trên lớp phủ.
- Đã sửa và xác minh đạt: trạng thái xanh, tự chuyển sang bản hoàn chỉnh.
- Chưa xác minh được: giữ cảnh báo, không âm thầm chấp nhận.

## 10. Đầu ra

Bản nhạc hoàn chỉnh trở thành dữ liệu âm nhạc trong Melolegacy, hỗ trợ mở và tiếp tục chỉnh sửa, phát piano/nhạc cụ, luyện tập, chuyển giọng và xuất MusicXML (các định dạng khác theo khả năng triển khai).

## 11. Lưu ý triển khai

Đây là yêu cầu sản phẩm/thiết kế. Khi triển khai thực tế cần xây dựng và kiểm thử riêng các thành phần: engraver/layout engine, editor interaction, OMR, image-to-score alignment, validation, audio playback, MusicXML import/export, trạng thái xác minh và luồng chuyển giao. Đặc tả không tự chứng minh các chức năng này đã tồn tại trong ứng dụng.
