# MeloBot AI Command Center — Kế hoạch triển khai

## Mục tiêu
Người dùng chỉ giao việc tại một nơi bằng tiếng Việt hoặc giọng nói. Melobot phân loại yêu cầu, chọn mô hình phù hợp, giao nhiệm vụ, nhận kết quả, kiểm tra và báo cáo.

## Nguyên tắc điều hành
- Melobot là bộ điều phối duy nhất; các mô hình bên ngoài không tự chọn việc hoặc tự cấp quyền.
- Mỗi tác vụ có mã, người yêu cầu, mô hình được giao, phạm vi dữ liệu, quyền thao tác, trạng thái và nhật ký.
- Mặc định chỉ đọc và làm việc trên nhánh thử nghiệm. Không ghi vào `main`, không xóa dữ liệu, không triển khai production nếu chưa được chủ dự án phê duyệt.
- API key chỉ lưu trong biến môi trường/secret manager của máy chủ; tuyệt đối không đưa vào mã nguồn, GitHub hoặc hội thoại.
- Kết quả chỉ được báo hoàn thành khi có bằng chứng: commit/PR, log, và kiểm thử phù hợp.

## Kiến trúc tối thiểu
1. **Giao diện điều khiển**: một hộp thoại tiếng Việt; nhận yêu cầu văn bản trước, bổ sung giọng nói sau.
2. **Melobot Orchestrator**: phân tích ý định, lập kế hoạch, chọn nhà cung cấp, cấp quyền tối thiểu, quản lý trạng thái và yêu cầu kiểm tra chéo.
3. **AI Gateway / Provider adapters**: bộ chuyển đổi riêng cho Anthropic Claude và Google Gemini; ChatGPT/OpenAI được bổ sung qua API tương thích khi có quyền truy cập phù hợp.
4. **Tool executor**: công cụ GitHub và kiểm thử có allowlist; mỗi hành động ghi nhật ký.
5. **Secrets & audit**: secret manager, nhật ký tác vụ, giới hạn chi phí/tốc độ và nút dừng.

## Luồng tác vụ
1. Người dùng nói yêu cầu với Melobot.
2. Melobot xác định mục tiêu, dữ liệu và quyền cần thiết; hỏi xác nhận nếu tác động lớn.
3. Melobot giao việc cho mô hình phù hợp qua adapter.
4. Mô hình đề xuất hoặc thực hiện thao tác trong phạm vi được cấp.
5. Bộ kiểm tra chạy kiểm thử và/hoặc mô hình thứ hai phản biện.
6. Melobot trả báo cáo: đã làm gì, bằng chứng, kiểm thử, việc còn lại.

## Lộ trình
- **Pha 1 — nền móng an toàn**: giao thức tác vụ, adapter interface, cấu hình môi trường mẫu, nhật ký và quy tắc quyền.
- **Pha 2 — Claude**: kết nối Anthropic API, thử nghiệm tác vụ chỉ đọc trên nhánh riêng.
- **Pha 3 — Gemini**: thêm Google Gemini API adapter.
- **Pha 4 — điều phối**: định tuyến theo loại việc, kiểm tra chéo, báo cáo thống nhất.
- **Pha 5 — giao diện**: hộp thoại tiếng Việt và giọng nói.

## Những gì chưa được kết nối
Hiện tại chưa có Anthropic API key, Gemini API key, dịch vụ máy chủ/secret store được xác nhận hoặc kết nối chạy thử giữa các mô hình. Tài liệu này là đặc tả khởi đầu, không tuyên bố các kết nối đã hoạt động.

## Điều kiện để chạy thử thật
Chủ dự án đăng nhập nhà cung cấp và tạo API key; nhập key trực tiếp vào secret manager của môi trường triển khai (không gửi key trong chat). Sau đó chạy thử trên dữ liệu giả lập/nhánh thử nghiệm, xác minh log, quyền và kết quả trước khi mở rộng.
