# MELO AI — Music Recognition Engine

## Mục tiêu

Xây dựng một engine nhận dạng và phân tích âm nhạc dùng chung cho MeloLegacy Studio. Engine không phải một ứng dụng chuyển đổi tách rời: kết quả phải trở thành dữ liệu ký âm có cấu trúc để Music Editor có thể mở, phát, chỉnh sửa và lưu thành tác phẩm.

## Trạng thái repository

Tại thời điểm khởi tạo nhánh `feature/melo-music-recognition-engine`, thư mục gốc của repository chỉ có `README.md`. Chưa tìm thấy mã nguồn ứng dụng, Music Editor, cấu hình build hoặc framework frontend. Vì vậy tài liệu này là nền tảng kiến trúc; chưa khẳng định có giao diện hay chức năng nhận dạng đã chạy.

## Nguyên tắc kiến trúc

1. Một luồng dữ liệu âm nhạc thống nhất, nhiều bộ tiếp nhận đầu vào.
2. MusicXML là định dạng trao đổi ký âm có cấu trúc ưu tiên để chuyển kết quả sang Music Editor.
3. Không làm mất dữ liệu nguồn: lưu nguồn nhập, kết quả nhận dạng, độ tin cậy và các chỉnh sửa của người dùng.
4. Phân biệt dữ liệu được đọc chính xác với dữ liệu suy đoán; vùng không chắc chắn phải được đánh dấu để người dùng xác nhận.
5. Ưu tiên xử lý cục bộ và thư viện mã nguồn mở; mọi dịch vụ bên ngoài phải là tùy chọn, có đánh giá chi phí, quyền riêng tư và giấy phép.
6. Không tải hoặc trích xuất nội dung YouTube trái với điều khoản, quyền truy cập hoặc bản quyền. Chỉ phân tích nội dung người dùng có quyền cung cấp hoặc truy cập hợp lệ.

## Sơ đồ luồng

```text
Ảnh / PDF ──> OMR ─────────────┐
MusicXML ──> XML Parser ───────┤
MIDI ──────> MIDI Parser ─────┤
Audio ─────> Audio Analysis ──┤
YouTube ───> Authorized Input ┤
Viết tay ──> Handwriting OMR ─┘
                              |
                              v
                  Music Data Normalization
                              |
                              v
                 MusicXML + Internal Model
                              |
                 Validation / Confidence Map
                              |
                              v
                 Music Editor Integration
                              |
                 Playback / Edit / Save / Export
```

## Các bộ tiếp nhận đầu vào

### 1. MusicXML — ưu tiên nền tảng

- Đọc và kiểm tra cấu trúc XML.
- Hỗ trợ score-partwise và score-timewise khi phù hợp.
- Bảo toàn part, staff, measure, clef, key, time, note, rest, duration, voice, tie, tuplet, articulation, dynamics và direction.
- Báo lỗi XML hoặc thành phần không hỗ trợ; không âm thầm bỏ dữ liệu.
- Cho phép xuất lại MusicXML sau khi chỉnh sửa.

### 2. MIDI

- Đọc track, channel, tempo, time signature, program, note-on/note-off và velocity.
- Chuẩn hóa thời điểm và trường độ.
- Phân tích phân bè/nhạc cụ ở mức có thể suy ra; không tự khẳng định tên nhạc cụ khi MIDI không cung cấp đủ thông tin.
- Chuyển sang ký âm là quá trình suy luận: cần xử lý quantization, enharmonic spelling, voice assignment và cách nhóm trường độ.
- Giữ MIDI gốc để đối chiếu và xuất lại.

### 3. Ảnh bản nhạc và PDF — ưu tiên tính năng nhận dạng thực tế

- PDF có lớp văn bản/vector: kiểm tra và tận dụng nội dung có sẵn trước khi rasterize.
- PDF scan và ảnh: tiền xử lý, deskew, phát hiện khuông nhạc, dòng nhạc và ký hiệu.
- Nhận dạng nốt, khóa, hóa biểu, nhịp, dấu hóa bất thường, dấu lặng, dấu nối và ký hiệu liên quan.
- Kết quả phải có confidence theo vùng/ký hiệu và màn hình xác nhận trước khi lưu.
- Đầu ra chuẩn hóa thành MusicXML để mở trong Editor.

### 4. Audio

- Tách/chuyển đổi âm thanh sang đặc trưng phù hợp, phát hiện cao độ và onset.
- Ước lượng nhịp, tempo, nốt và bè; đa âm và nhiều nhạc cụ là bài toán khó hơn đơn âm.
- Kết quả phải được đánh dấu là bản chép ước lượng, không cam kết chính xác tuyệt đối.
- Có thể đối chiếu bản chép với audio bằng playback.

### 5. YouTube

- Chỉ tiếp nhận URL và metadata trước; không mặc định tải video hoặc trích xuất audio.
- Chỉ phân tích luồng/nội dung khi có quyền truy cập và phương thức được phép.
- Tách riêng bước nhận diện nguồn, quyền sử dụng và bước phân tích âm thanh.
- Nếu không thể truy cập hợp lệ, hướng dẫn người dùng nhập tệp âm thanh mà họ có quyền sử dụng.

### 6. Ký âm viết tay

- Xây dựng bộ nhận dạng riêng theo taxonomy ký hiệu âm nhạc.
- Thu thập mẫu theo thiết lập teacher_student; phân tách kho mẫu cá nhân và kho mẫu dùng chung đã được duyệt.
- Mẫu được giáo viên xác nhận hoặc người học sửa lại cần được gắn nhãn chất lượng; mẫu viết lại có thể được ưu tiên trọng số huấn luyện.
- Không ép nhận dạng nét viết mơ hồ; yêu cầu người dùng viết lại hoặc xác nhận.
- Thiết kế quyền riêng tư, thời hạn lưu và quyền kiểm duyệt trước khi thu thập dữ liệu học sinh.

## Mô hình dữ liệu trung tâm

Mỗi lần nhập tạo một Recognition Job gồm:

- `source`: loại nguồn, tên tệp/URL, định dạng và metadata.
- `status`: queued, processing, needs_review, completed hoặc failed.
- `artifacts`: tệp nguồn, ảnh trang, MusicXML/MIDI trung gian và bản xuất.
- `score`: cấu trúc tác phẩm chuẩn hóa: part, staff, measure, event và notation.
- `confidence`: độ tin cậy theo trang, khuông, ô nhịp hoặc ký hiệu.
- `warnings`: lỗi phân tích, thành phần không hỗ trợ và điểm cần xác nhận.
- `provenance`: bộ xử lý, phiên bản, thời điểm và các thao tác người dùng.
- `review`: xác nhận, sửa đổi và trạng thái duyệt.

Không ghi đè tệp nguồn. Mọi chỉnh sửa phải có thể truy vết và có khả năng hoàn tác.

## Hợp đồng tích hợp với Music Editor

Editor cần một giao diện dịch vụ ổn định, không phụ thuộc vào một nhà cung cấp OMR cụ thể:

- `importMusicXml(file)`
- `importMidi(file, options)`
- `recognizeImage(file, options)`
- `recognizePdf(file, options)`
- `analyzeAudio(file, options)`
- `analyzeAuthorizedVideoSource(source, options)`
- `getRecognitionJob(jobId)`
- `reviewRecognition(jobId, corrections)`
- `exportMusicXml(score)`

Đây là hợp đồng thiết kế, chưa phải API đã triển khai. Khi xác định được framework và cấu trúc ứng dụng, cần điều chỉnh tên hàm, kiểu dữ liệu và cơ chế xử lý bất đồng bộ theo codebase thực tế.

## Lộ trình triển khai

### Giai đoạn 0 — Khảo sát và dựng ứng dụng

- Xác nhận framework, công cụ build, cấu trúc thư mục và cách triển khai hiện có.
- Nếu repository thực sự chưa có ứng dụng, thống nhất stack tối thiểu trước khi khởi tạo.
- Không tạo một Music Editor thứ hai nếu đã có Editor trong repository khác.

### Giai đoạn 1 — Đường dữ liệu có thể kiểm thử

- Tạo mô hình score trung tâm và bộ kiểm tra dữ liệu.
- Nhập MusicXML và MIDI.
- Hiển thị dữ liệu trong một Music Editor tối thiểu, phát thử bằng piano và xuất lại MusicXML.
- Tạo bộ fixture kiểm thử cho các trường hợp nhiều khuông, nhiều bè, dấu nối, hóa biểu và nhịp phức hợp.

### Giai đoạn 2 — Nhận dạng ảnh/PDF

- Đánh giá các thư viện OMR mã nguồn mở theo giấy phép, chất lượng, khả năng chạy và chi phí tài nguyên.
- Tạo pipeline PDF/ảnh sang MusicXML.
- Thêm màn hình so sánh nguồn và kết quả, đánh dấu vùng chưa chắc chắn.
- Kiểm thử bằng bản nhạc piano thực tế do người dùng cung cấp.

### Giai đoạn 3 — Audio và YouTube hợp lệ

- Phân tích audio, ước lượng cao độ/nhịp và tạo bản chép có mức tin cậy.
- Chỉ mở rộng sang nguồn YouTube khi quyền truy cập và phương thức xử lý đã được xác nhận.

### Giai đoạn 4 — Nhận dạng viết tay

- Xây taxonomy, công cụ gán nhãn, tập kiểm thử và quy trình giáo viên duyệt.
- Thử nghiệm với dữ liệu Apple Pencil do người dùng tự nguyện cung cấp.
- Đo độ chính xác và độ trễ trên thiết bị thực tế trước khi công bố tính năng thời gian thực.

## Tiêu chí nghiệm thu ban đầu

- MusicXML hợp lệ có thể nhập, hiển thị, phát và xuất lại mà không mất các thành phần được hỗ trợ.
- MIDI được đọc và chuyển đổi có cảnh báo rõ về những quyết định suy luận.
- Ảnh/PDF cho ra kết quả có thể kiểm tra, sửa và lưu; vùng không chắc chắn không bị che giấu.
- Có bộ kiểm thử tự động và bộ bản nhạc mẫu được phép sử dụng.
- Chạy được trong môi trường triển khai đã xác định, không yêu cầu dịch vụ trả phí bắt buộc.

## Rủi ro và giới hạn

- OMR không thể đảm bảo đọc đúng mọi bản scan, bản in mờ hoặc ký hiệu phức tạp.
- MIDI không luôn chứa đủ thông tin để khôi phục chính xác cách viết ký âm ban đầu.
- Audio đa âm và bản phối nhiều nhạc cụ khó chuyển thành bản tổng phổ chính xác.
- Tốc độ nhận dạng viết tay phụ thuộc mô hình, thiết bị và chất lượng nét viết; mục tiêu độ trễ cần đo thực tế.
- Cần rà soát giấy phép thư viện và quyền sử dụng dữ liệu trước khi đưa vào sản phẩm.

---
Tài liệu này là bản thiết kế khởi đầu. Việc triển khai mã nguồn và tích hợp giao diện chỉ bắt đầu sau khi xác minh được cấu trúc ứng dụng hiện hữu hoặc thống nhất stack mới.
