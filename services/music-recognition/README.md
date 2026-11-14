# MELO Music Recognition — chuyển sang xử lý trực tiếp trên iPad

Mục tiêu sản phẩm là nhận dạng ảnh/PDF bản nhạc ngay trong PWA trên iPad, không yêu cầu người dùng cài Python, chạy máy tính hoặc thuê máy chủ. Tệp nguồn được xử lý cục bộ theo mặc định.

## Hướng triển khai

1. Ảnh/PDF → MusicXML bằng OMR chạy trong trình duyệt (WebAssembly/ONNX Runtime Web hoặc engine tương thích sau khi kiểm tra giấy phép).
2. Audio → MIDI bằng mô hình đa cao độ chạy trong trình duyệt.
3. Kết quả được đưa qua Music Data Model/parser hiện có, xem trước, nghe thử và chỉnh sửa.
4. Melobox sẽ là nhà cung cấp lưu trữ mở rộng trong tương lai thông qua Storage Adapter độc lập; Melo Legacy vẫn hoạt động khi chưa kết nối.

## Sidecar Python hiện tại

FastAPI sidecar trong thư mục này là tích hợp thử nghiệm cũ để đánh giá Score-OMR và Basic Pitch. Đây **không phải yêu cầu cài đặt cho người dùng cuối** và không phải kiến trúc đích của ứng dụng iPad. Chưa có kiểm thử xác nhận chất lượng đầu ra end-to-end.

Nếu nhà phát triển muốn thử sidecar trên máy phát triển, có thể tham khảo lịch sử triển khai và API trong mã nguồn; không public endpoint ra Internet nếu chưa có xác thực, quota và hardening bảo mật.

## Yêu cầu trước khi chọn engine chạy trên iPad

- Xác minh giấy phép mã nguồn, model weights và runtime.
- Kiểm tra tương thích Safari/iPadOS và kích thước model.
- Chạy trong Web Worker, xử lý PDF theo từng trang và giải phóng bộ nhớ.
- Đo thời gian, RAM và độ chính xác trên iPad thật.
- Không đưa engine vào ứng dụng phân phối khi chưa rõ nghĩa vụ giấy phép.

Chi tiết kiến trúc, lộ trình nghiệm thu và quy tắc kết nối Melobox: docs/MELO-MUSIC-RECOGNITION-ENGINE.md.
