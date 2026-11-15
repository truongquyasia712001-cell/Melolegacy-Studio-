# MELO AI — Music Recognition Engine

## Định hướng kiến trúc đã chốt

Melo Legacy được phát triển theo hướng **iPad-first, xử lý nhận dạng trực tiếp trên thiết bị**. Người dùng phải có thể mở PWA trên iPad, chọn ảnh/PDF bản nhạc, nhận dạng, xem trước, nghe thử và chỉnh sửa mà không cần máy tính, Python sidecar hay máy chủ riêng.

Ưu tiên triển khai:
1. Ảnh/PDF bản nhạc → MusicXML.
2. Audio → MIDI → MusicXML, tối ưu dần cho bản thu piano đa bè.

Không tạo frontend hoặc Music Data Model trùng lặp. Tiếp tục dùng React + TypeScript + Vite, Music Data Model, MusicXML/MIDI parser, staff preview và MELO Piano Engine hiện có.

## Những phần đã có

- Music Data Model phiên bản 1.0: Score, Part, Measure, Event, Pitch.
- Parser MusicXML score-partwise và MIDI Standard MIDI Files.
- SVG staff preview.
- MELO Piano Engine prototype: âm thanh piano-like tổng hợp, chưa phải grand piano thu âm.
- API sidecar FastAPI hiện tại là tích hợp thử nghiệm/đường chạy phụ để kiểm tra engine; **không còn là điều kiện bắt buộc của sản phẩm**.

## Kiến trúc đích: xử lý tại iPad

- PWA tiếp nhận PDF/ảnh qua bộ chọn tệp của iPad.
- PDF được tách trang và xử lý theo lô nhỏ; ảnh được chuẩn hóa, xoay/cắt và giảm kích thước khi cần.
- Bộ nhận dạng chạy trong trình duyệt bằng WebAssembly và/hoặc ONNX Runtime Web, ưu tiên Web Worker để không khóa giao diện.
- Kết quả được chuẩn hóa vào Music Data Model và xuất MusicXML bằng pipeline của Melo Legacy.
- Người dùng xem bản gốc cạnh bản nhận dạng, nghe thử bằng MELO Piano, sửa lỗi rồi mới lưu.
- Model assets có phiên bản, checksum, giấy phép và được cache cục bộ khi trình duyệt hỗ trợ. Có thông báo rõ khi cần tải model lần đầu.
- Tệp nguồn và kết quả không rời thiết bị trong luồng xử lý mặc định. Không gọi dịch vụ nhận dạng bên ngoài.

## Quy tắc hiệu năng và độ tin cậy trên iPad

- Không nạp toàn bộ PDF nhiều trang vào RAM cùng lúc; xử lý tuần tự hoặc theo lô nhỏ.
- Có trạng thái tiến trình, hủy tác vụ và giải phóng bitmap/worker sau mỗi trang.
- Giới hạn kích thước/độ phân giải có thể cấu hình; cảnh báo rõ thay vì treo trang.
- Tự động lưu bản nháp cục bộ khi có thể; không ghi đè bản gốc.
- Safari/iPadOS có giới hạn bộ nhớ và khả năng chạy nền. Không cam kết tốc độ/độ chính xác trước khi thử trên thiết bị thật.
- Mọi kết quả OMR/audio đều cần bước kiểm tra của người dùng; không tự coi kết quả nhận dạng là bản nhạc chính xác.

## Lộ trình nghiệm thu

### Mốc 1 — OMR tại iPad
- Chọn ảnh PNG/JPG và PDF nhiều trang từ Files.
- Xử lý một trang trước, sau đó mở rộng PDF theo từng trang.
- Nhận diện khuông, khóa, hóa biểu, nhịp, nốt và dấu lặng; tạo MusicXML.
- So sánh bản gốc/kết quả, nghe thử, sửa và tải MusicXML.
- Thử trên Safari iPad thật với tài liệu ngắn, nhiều trang, ảnh nghiêng/mờ và trang có nhiều khuông.

### Mốc 2 — Audio-to-MIDI tại iPad
- Đọc file âm thanh cục bộ bằng Web Audio API.
- Chạy mô hình đa cao độ tương thích trình duyệt trong Worker/WASM/ONNX khi giấy phép và hiệu năng được xác minh.
- Ưu tiên piano, nhiều nốt cùng lúc; giữ onset, duration, velocity và tempo ở mức tốt nhất có thể.
- Cho phép nghe đối chiếu và sửa MIDI trước khi chuyển sang MusicXML.

### Mốc 3 — Tối ưu và mở rộng
- Quantization, voice separation, tie, pedal/sustain và tempo map.
- Tải model theo nhu cầu, cache phiên bản và cập nhật an toàn.
- Đo bộ nhớ, thời gian và độ chính xác trên iPad đời thấp/trung bình trước khi mở rộng.

## Melobox — tích hợp lưu trữ trong tương lai

Melo Legacy và Melobox tiếp tục là hai dự án/repository độc lập. Không nhập code/backend Melobox vào repository này và không tạo phụ thuộc bắt buộc giữa hai ứng dụng.

Thiết kế một lớp giao tiếp lưu trữ trung lập (Storage Provider / Storage Adapter) để sau này có thể kết nối:
- Lưu và mở PDF, ảnh, MusicXML, MIDI, audio, video biểu diễn.
- Đồng bộ tài liệu và phiên bản; quản lý metadata, quyền riêng tư và chia sẻ.
- Liên kết tài liệu trong Melo Legacy với tài sản lưu trữ trong Melobox bằng ID ổn định, không phụ thuộc đường dẫn nội bộ.
- Hoạt động độc lập khi chưa kết nối Melobox; dùng lưu trữ cục bộ và xuất/tải tệp.

Việc kết nối sau này phải qua API được thống nhất, có xác thực, phân quyền, kiểm soát dung lượng và cơ chế đồng bộ/xung đột. Không tự ý truy cập database, secrets hoặc backend nội bộ của Melobox. Không gửi dữ liệu người dùng sang Melobox trước khi người dùng chủ động kết nối và cấp quyền.

## Trạng thái tích hợp thử nghiệm hiện tại

- services/music-recognition/api.py: FastAPI sidecar gọi Score-OMR/score-reader và Spotify Basic Pitch.
- src/music/recognitionApi.ts: client gọi API.
- vite.config.ts: proxy /api cho môi trường phát triển.

Các thành phần này chỉ là phương án kiểm thử/đường dự phòng trong giai đoạn chuyển đổi. Chưa được nghiệm thu end-to-end; không được mô tả là chức năng nhận dạng đã hoạt động trên iPad.

## Giấy phép và nguồn mô hình

Chỉ tích hợp thư viện/model sau khi kiểm tra giấy phép của cả mã nguồn, model weights và runtime. Không sao chép hoặc đưa thành phần AGPL vào ứng dụng phân phối nếu chưa đánh giá tác động và có quyết định rõ ràng. Giữ LICENSE/NOTICE và thông tin phiên bản của mọi dependency.

## Nguyên tắc repository

- Mọi thay đổi ở nhánh feature/melo-music-recognition-engine.
- Không sửa/merge vào main khi chưa được anh Quý duyệt.
- Không can thiệp repository Melobox.
