# Kiến trúc MeloLegacy: Core độc lập, AI tùy chọn

**Trạng thái:** Quyết định kiến trúc được chủ dự án yêu cầu thiết lập; tài liệu đặc tả, chưa phải bằng chứng rằng toàn bộ chức năng đã được lập trình hoặc triển khai.

## 1. Quyết định nền tảng

MeloLegacy phải vận hành được các chức năng âm nhạc, học tập, sáng tác, biểu diễn, quản lý tài sản và quản trị cốt lõi mà không cần kết nối bất kỳ mô hình AI nào.

AI là một lớp trí tuệ mở rộng, không phải nền móng bắt buộc và không phải điểm lỗi duy nhất. Khi AI ngoại tuyến, hết hạn mức, lỗi API hoặc bị ngắt kết nối, các chức năng Core không phụ thuộc AI vẫn phải tiếp tục hoạt động.

## 2. Mô hình hai lớp

### Lớp A — MeloLegacy Core (bắt buộc)

Core sở hữu nghiệp vụ và dữ liệu chính thức của hệ sinh thái. Các chức năng cốt lõi không được gọi AI để hoàn thành những tác vụ vốn có thể xử lý bằng quy tắc, thuật toán xác định hoặc thao tác trực tiếp.

Các nhóm dịch vụ:

- **Music Workspace:** tạo, đọc, chỉnh sửa, lưu và phát tác phẩm; MusicXML và MIDI là định dạng dữ liệu làm việc chính.
- **Score Reader:** hiển thị bản nhạc, zoom, pan, chuyển trang, điều khiển phát và các lớp chú giải.
- **Audio Engine:** phát âm thanh, metronome, tuner bằng xử lý tín hiệu số, ghi âm và phát lại.
- **Learning Engine:** bài học, bài tập, đáp án, chấm điểm theo quy tắc và theo dõi tiến độ.
- **Performance Tools:** trình chiếu, lời ca, video, điều khiển buổi biểu diễn và ghi hình theo các chức năng được triển khai.
- **MeloBox & Thư viện MeloBox:** quản lý, phân loại, tìm kiếm, truy xuất và chia sẻ tài sản theo quyền.
- **Identity & Access:** tài khoản, vai trò, quyền truy cập và kiểm soát dữ liệu.
- **Data & Sync:** cơ sở dữ liệu, đồng bộ, sao lưu, phục hồi và nhật ký.
- **MeloCloud:** hạ tầng/mạng lưới máy chủ cung cấp năng lực vận hành cho các dịch vụ cần máy chủ.

Core có thể phụ thuộc mạng hoặc máy chủ đối với một số chức năng như đăng nhập, đồng bộ và lưu trữ đám mây. “Không cần AI” không đồng nghĩa “mọi chức năng đều chạy offline”. Khả năng offline phải được thiết kế và kiểm thử riêng cho từng chức năng PWA.

### Lớp B — AI Intelligence Layer (tùy chọn)

Lớp AI kết nối thông qua giao diện dịch vụ (AI adapter/API boundary), không sở hữu dữ liệu gốc và không được trở thành điều kiện bắt buộc để Core khởi động hoặc xử lý nghiệp vụ cơ bản.

Các năng lực có thể bổ sung:

- Melobot: hội thoại, lập kế hoạch, điều phối và báo cáo.
- OMR thông minh và nhận dạng ký âm viết tay.
- Phân tích bản nhạc, âm thanh và biểu diễn.
- Hỗ trợ sáng tác, giải thích lý thuyết và cá nhân hóa bài tập.
- Kết nối các mô hình AI bên ngoài theo quyền được cấp.

Nếu AI không sẵn sàng, giao diện phải báo rõ tính năng AI tạm thời không khả dụng; không được làm treo, khóa hoặc làm mất dữ liệu của chức năng Core. Với tác vụ có thể làm thủ công, cung cấp đường đi thay thế khi phù hợp.

## 3. Quy tắc ranh giới kiến trúc

1. **Core không phụ thuộc AI:** các module Core không gọi trực tiếp SDK của OpenAI, Anthropic, Google hoặc nhà cung cấp AI khác.
2. **AI không sở hữu dữ liệu gốc:** MusicXML, MIDI, bản ghi âm, tệp người dùng và dữ liệu thư viện được quản lý bởi Core/MeloBox.
3. **Tích hợp qua hợp đồng rõ ràng:** AI nhận dữ liệu tối thiểu cần thiết và trả kết quả có cấu trúc để Core kiểm tra trước khi chấp nhận.
4. **Có thể thay thế nhà cung cấp:** đổi mô hình hoặc AI provider không buộc phải viết lại nghiệp vụ Core.
5. **Có chế độ suy giảm an toàn:** timeout, lỗi API, hết quota hoặc mất mạng AI không làm hỏng luồng Core.
6. **Không âm thầm thay đổi dữ liệu:** kết quả AI đề xuất phải được xác minh; các thay đổi có ảnh hưởng đến tác phẩm hoặc tài sản phải theo quyền và quy trình phê duyệt.
7. **Không khóa tài khoản vào AI:** người dùng vẫn truy cập được dữ liệu và chức năng Core khi không có gói AI hoặc API key.
8. **Tách chi phí:** chi phí AI được đo lường/giới hạn riêng; không tự phát sinh dịch vụ trả phí.

## 4. Luồng xử lý chuẩn

### Tác vụ Core
Người dùng → giao diện MeloLegacy → dịch vụ nghiệp vụ Core → dữ liệu/Audio Engine/MeloBox → kết quả.

### Tác vụ có AI hỗ trợ
Người dùng → Core xác thực quyền và dữ liệu → AI adapter/Melobot → mô hình được cấp phép → kết quả đề xuất → Core kiểm tra/xác nhận → lưu dữ liệu theo quyền.

AI không được bỏ qua xác thực, phân quyền, kiểm tra dữ liệu hoặc quy trình phê duyệt của Core.

## 5. Ma trận khi AI ngoại tuyến

| Năng lực | Hành vi khi không có AI |
|---|---|
| Soạn và chỉnh sửa bản nhạc | Tiếp tục bằng công cụ soạn nhạc Core |
| Đọc bản nhạc | Tiếp tục |
| Phát MusicXML/MIDI | Tiếp tục bằng bộ phát/tổng hợp âm thanh |
| Metronome | Tiếp tục bằng bộ định thời |
| Tuner | Tiếp tục bằng xử lý tín hiệu số |
| Thu âm/phát lại | Tiếp tục bằng Audio Engine |
| Bài học và bài tập có sẵn | Tiếp tục |
| Chấm điểm theo đáp án/quy tắc | Tiếp tục |
| Quản lý MeloBox và thư viện | Tiếp tục nếu dịch vụ lưu trữ tương ứng khả dụng |
| Đồng bộ đám mây | Phụ thuộc kết nối MeloCloud, không phụ thuộc AI |
| OMR/nhận dạng viết tay bằng AI | Tạm ngừng hoặc chuyển sang công cụ OMR truyền thống/thao tác thủ công nếu có |
| Hội thoại và điều phối Melobot | Tạm ngừng; không ảnh hưởng Core |
| Phân tích/sáng tạo bằng AI | Tạm ngừng; giữ nguyên dữ liệu gốc |

## 6. Tiêu chí nghiệm thu bắt buộc

- Chạy kiểm thử Core với toàn bộ AI provider bị vô hiệu hóa và không có API key.
- Xác nhận người dùng vẫn tạo, mở, chỉnh sửa, lưu và phát được tác phẩm mẫu bằng định dạng làm việc được hỗ trợ.
- Xác nhận metronome, tuner, phát/ghi âm và các bài tập không phụ thuộc AI vẫn hoạt động.
- Mô phỏng timeout, lỗi xác thực và mất kết nối của AI provider; Core không bị treo hoặc mất dữ liệu.
- Xác nhận tính năng AI hiển thị trạng thái không khả dụng và không giả vờ đã hoàn tất.
- Xác nhận dữ liệu gốc không bị AI tự ý ghi đè.
- Kiểm tra quyền truy cập, nhật ký và khả năng khôi phục.

Không tuyên bố đạt tiêu chí nào trước khi có kết quả chạy thử và bằng chứng kiểm thử.

## 7. Phạm vi triển khai theo giai đoạn

1. Kiểm kê code hiện tại, phân loại module Core và module AI; ghi nhận các phụ thuộc AI đang tồn tại.
2. Xác định hợp đồng API nội bộ và ranh giới giữa Core với AI adapter.
3. Đưa các chức năng xác định được (metronome, tuner, playback, learning rules...) về Core nếu cần.
4. Tạo chế độ AI off và kiểm thử hồi quy.
5. Tích hợp Melobot/AI provider sau ranh giới đã định.
6. Kiểm thử lỗi, quyền, dữ liệu và chi phí trước khi triển khai production.

## 8. Nguyên tắc bất biến

**MeloLegacy là nền tảng âm nhạc hoàn chỉnh trước khi có AI. AI làm MeloLegacy thông minh hơn, không phải điều kiện để MeloLegacy tồn tại hoặc vận hành.**

**Melobot điều phối hệ sinh thái nhưng không phải điểm lỗi duy nhất. Khi Melobot ngoại tuyến, MeloLegacy Core vẫn phải hoạt động trong phạm vi dịch vụ và hạ tầng sẵn có.**

---

Tài liệu này xác lập định hướng kiến trúc. Việc hiện thực hóa phải qua kiểm kê mã nguồn, kế hoạch thay đổi, kiểm thử và phê duyệt riêng; không suy diễn rằng các chức năng nêu trên đã được triển khai.
