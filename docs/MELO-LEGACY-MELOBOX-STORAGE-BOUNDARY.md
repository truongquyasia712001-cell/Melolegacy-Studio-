# Melo Legacy — iPad-first và kết nối Melobox

## Mục tiêu

Melo Legacy là ứng dụng học tập, nghiên cứu và sáng tạo âm nhạc có thể vận hành độc lập trên iPad. Melobox là dự án lưu trữ độc lập, có thể kết nối trong tương lai để mở rộng không gian lưu trữ cá nhân.

## Ranh giới sản phẩm

### Melo Legacy sở hữu
- Music Data Model và các định dạng âm nhạc chuẩn.
- Nhận dạng OMR và audio-to-MIDI chạy cục bộ trên thiết bị.
- Đọc, chỉnh sửa, phát, luyện tập và nghiên cứu bản nhạc.
- Metadata chuyên môn âm nhạc: tác giả, tác phẩm, giọng, nhịp, bè, phiên bản, chú giải và tiến trình học tập.

### Melobox sở hữu (khi kết nối trong tương lai)
- Lưu trữ file và tài sản số dung lượng lớn.
- Quản lý thư mục, dung lượng, chia sẻ, sao lưu và đồng bộ theo chính sách của Melobox.
- Quyền truy cập và vòng đời của tài sản lưu trữ.

## Hợp đồng tích hợp dự kiến

Melo Legacy không truy cập trực tiếp database hoặc filesystem nội bộ của Melobox. Tích hợp thông qua API/SDK công khai, được hai dự án thống nhất.

Storage Adapter nên cung cấp các thao tác trung lập:
- connect() / disconnect()
- list() / getMetadata()
- upload() / download()
- createFolder() / move() / delete() (chỉ khi API Melobox cho phép và người dùng xác nhận)
- getShareLink() (chỉ khi quyền chia sẻ được cấp)

Các kiểu dữ liệu gợi ý:
- StorageProvider: local, melobox, future providers.
- StoredAsset: ID ổn định, tên, MIME type, kích thước, checksum, createdAt, updatedAt, quyền truy cập và provider.
- MusicAssetMetadata: loại tài liệu, tác giả, tác phẩm, nhạc cụ, khóa, nhịp, tempo, phiên bản MusicXML/MIDI và liên kết với Score ID.
- SyncState: local-only, uploading, synced, conflict, error.

Đây là bản phác thảo hợp đồng, chưa phải API Melobox đã tồn tại. Không cố định endpoint, token format hoặc schema backend khi chưa khảo sát và được thống nhất.

## Nguyên tắc dữ liệu và quyền riêng tư

- Melo Legacy hoạt động bình thường khi chưa kết nối Melobox.
- Không tự động tải lên tài liệu; người dùng chủ động kết nối và chọn tài liệu/nhóm tài liệu.
- Không đưa access token vào mã nguồn hoặc localStorage dạng văn bản thuần.
- Tách metadata âm nhạc khỏi metadata lưu trữ; liên kết bằng ID ổn định.
- Giữ bản gốc và lịch sử phiên bản; tránh ghi đè âm thầm.
- Có trạng thái đồng bộ, xử lý xung đột và khả năng hủy.
- Hỗ trợ xuất toàn bộ tài sản về định dạng phổ biến để tránh khóa chặt vào một nhà cung cấp.

## Trình tự triển khai

1. Hoàn thành luồng nhận dạng cục bộ trên iPad.
2. Hoàn thiện lưu trữ cục bộ và xuất/nhập tài liệu.
3. Khảo sát API và mô hình quyền của Melobox khi dự án Melobox sẵn sàng.
4. Chốt API contract và luồng OAuth/token an toàn.
5. Xây adapter Melobox ở nhánh riêng, kiểm thử độc lập; không làm Melo Legacy phụ thuộc bắt buộc.
