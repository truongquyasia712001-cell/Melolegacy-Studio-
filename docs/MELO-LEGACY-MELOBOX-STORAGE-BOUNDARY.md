# Melo Legacy — Ranh giới lưu trữ Melobox và kết nối hệ sinh thái

## Tầm nhìn hệ sinh thái

Melobox không chỉ là ổ lưu trữ bổ sung cho Melo Legacy. Melobox là **đám mây di sản cá nhân** của hệ sinh thái Melo, nơi mỗi học sinh/người dùng có thể đăng ký tài khoản miễn phí, sở hữu không gian riêng và lưu giữ tài sản âm nhạc của mình.

Melo Legacy là môi trường học tập, nghiên cứu, sáng tác và thực hành âm nhạc. Các chức năng phân tích và thống kê hỗ trợ người dùng hiểu quá trình học tập, hoạt động và tài sản âm nhạc dựa trên dữ liệu được phép sử dụng.

Luồng sản phẩm định hướng:

1. Học sinh đăng ký tài khoản Melobox miễn phí.
2. Mỗi tài khoản có vùng lưu trữ di sản cá nhân, hạn mức miễn phí do Melobox quy định và hiển thị minh bạch.
3. Người dùng lưu trữ, quản lý và bảo vệ các tài sản âm nhạc cá nhân.
4. Người dùng chủ động kết nối các chức năng phân tích, thống kê và Melo Legacy, cấp quyền theo từng phạm vi.
5. Melo Legacy có thể mở, đọc, chỉnh sửa và lưu lại những tài sản mà người dùng cho phép sử dụng; kết quả mới có thể được lưu trở lại Melobox.

## Vai trò của từng thành phần

### Melobox — tài khoản và đám mây di sản

- Đăng ký, đăng nhập và quản lý tài khoản cá nhân.
- Cấp không gian lưu trữ miễn phí cho học sinh; dung lượng và giới hạn gói phải do chính sách Melobox công bố, không mặc định một con số chưa được chốt.
- Lưu bản nhạc, PDF, ảnh, MusicXML, MIDI, bản thu âm, video biểu diễn, sáng tác, tài liệu học tập và các giá trị âm nhạc cá nhân.
- Quản lý thư mục, dung lượng, phiên bản, sao lưu, chia sẻ và quyền truy cập.
- Cho phép chủ tài khoản xem, tải xuống, xuất dữ liệu và quản lý quyền kết nối ứng dụng.

### Chức năng phân tích và thống kê

- Cung cấp phân tích tiến trình học tập, hoạt động âm nhạc và tài sản khi người dùng hoặc tổ chức có thẩm quyền cho phép.
- Phân biệt dữ liệu cá nhân, dữ liệu lớp học và dữ liệu cộng đồng.
- Chỉ nhận những trường dữ liệu cần thiết cho mục đích đã thông báo; không mặc nhiên đọc toàn bộ nội dung riêng tư trong Melobox.
- Cung cấp kết quả phân tích có thể được dùng trong Melo Legacy nếu người dùng cấp quyền phù hợp.

Tên gọi và phạm vi của chức năng phân tích, thống kê sẽ được xác định trong thiết kế tổng thể; hiện tại đây chỉ là mô tả chức năng, chưa phải tên một sản phẩm riêng.

### Melo Legacy — không gian làm việc âm nhạc

- Nhận dạng OMR và audio-to-MIDI, đọc, chỉnh sửa, phát, luyện tập, sáng tác và nghiên cứu âm nhạc.
- Có thể hoạt động độc lập trên iPad, kể cả khi người dùng chưa có tài khoản Melobox.
- Khi người dùng kết nối Melobox, cho phép chọn tài sản cá nhân để mở, nhập vào dự án, biên tập và lưu phiên bản mới trở lại kho.
- Không tự động biến tài sản riêng thành tài sản dùng chung.

## Ranh giới kỹ thuật và tích hợp

Melo Legacy và Melobox tiếp tục là hai dự án/repository độc lập. Không nhập code/backend Melobox vào repository Melo Legacy và không tạo phụ thuộc bắt buộc giữa hai ứng dụng.

Melo Legacy không truy cập trực tiếp database hoặc filesystem nội bộ của Melobox. Tích hợp thông qua API/SDK công khai, được hai dự án thống nhất. Thiết kế Storage Provider / Storage Adapter trung lập để có thể kết nối Melobox và các provider tương lai.

Các thao tác dự kiến:
- connect() / disconnect()
- list() / getMetadata()
- upload() / download()
- createFolder() / move() / delete() (chỉ khi API cho phép và người dùng xác nhận)
- getShareLink() (chỉ khi chủ tài sản cấp quyền chia sẻ)
- authorizeAnalytics() / revokeAnalytics() (quyền phân tích được quản lý riêng, không suy ra từ quyền lưu trữ)

Các kiểu dữ liệu gợi ý:
- StorageProvider: local, melobox, future providers.
- StoredAsset: ID ổn định, tên, MIME type, kích thước, checksum, createdAt, updatedAt, quyền truy cập và provider.
- MusicAssetMetadata: loại tài liệu, tác giả, tác phẩm, nhạc cụ, khóa, nhịp, tempo, phiên bản MusicXML/MIDI và liên kết với Score ID.
- SyncState: local-only, uploading, synced, conflict, error.
- ConsentGrant: chủ thể cấp quyền, ứng dụng nhận quyền, phạm vi tài sản/dữ liệu, mục đích, thời điểm cấp và trạng thái thu hồi.

Đây là bản phác thảo hợp đồng, chưa phải API Melobox hoặc dịch vụ phân tích, thống kê đã tồn tại. Không cố định endpoint, token format hoặc schema backend khi chưa khảo sát và thống nhất.

## Quyền riêng tư, sở hữu và bảo vệ di sản

- Tài khoản và kho cá nhân thuộc quyền quản lý của từng học sinh/người dùng.
- Tài sản cá nhân mặc định là riêng tư; chỉ chia sẻ khi chủ tài khoản chủ động cho phép.
- Kết nối Melobox với Melo Legacy không đồng nghĩa cấp quyền cho mọi tài sản; người dùng chọn tệp/thư mục/phạm vi cần dùng.
- Quyền cho phần phân tích và thống kê là một lựa chọn riêng, có mục đích rõ ràng và có thể thu hồi.
- Dữ liệu học sinh không được dùng cho huấn luyện AI, phân tích cộng đồng hoặc mục đích khác nếu chưa có cơ sở quyền và sự đồng ý phù hợp.
- Với học sinh chưa đủ tuổi, thiết kế đăng ký, đồng ý và chia sẻ phải tuân thủ yêu cầu bảo vệ trẻ em và quy định áp dụng.
- Không đưa access token vào mã nguồn hoặc localStorage dạng văn bản thuần.
- Giữ bản gốc và lịch sử phiên bản; tránh ghi đè âm thầm.
- Có trạng thái đồng bộ, xử lý xung đột và khả năng hủy.
- Hỗ trợ xuất dữ liệu để người dùng không bị khóa chặt vào một nhà cung cấp.
- Không tự động tải lên tài liệu từ iPad; người dùng phải chủ động chọn nội dung và xác nhận.

## Lộ trình triển khai

1. Hoàn thành luồng nhận dạng cục bộ trên iPad và lưu trữ cục bộ trong Melo Legacy.
2. Xác định luồng đăng ký tài khoản Melobox miễn phí, chính sách dung lượng và quản lý tài sản cá nhân trong dự án Melobox.
3. Chốt phạm vi và quyền dữ liệu của phần phân tích và thống kê.
4. Khảo sát API, mô hình xác thực, phân quyền và đồng bộ của Melobox.
5. Chốt API contract và luồng cấp/thu hồi quyền.
6. Xây adapter Melobox và kết nối các chức năng phân tích, thống kê ở nhánh riêng, kiểm thử độc lập; không làm Melo Legacy phụ thuộc bắt buộc.
7. Kiểm thử luồng học sinh: đăng ký miễn phí → lưu di sản → cấp quyền kết nối → mở/sử dụng trong Melo Legacy → lưu phiên bản mới trở lại Melobox.

## Nguyên tắc repository

- Mọi thay đổi Melo Legacy ở nhánh feature riêng, chờ anh Quý duyệt.
- Không sửa/merge vào main khi chưa được anh Quý duyệt.
- Không can thiệp repository Melobox khi đang làm Melo Legacy.
