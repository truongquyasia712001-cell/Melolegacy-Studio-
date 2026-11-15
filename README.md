# MeloLegacy Studio

## Hệ sinh thái Di sản Âm nhạc

MeloLegacy là nền tảng giáo dục âm nhạc trực tuyến miễn phí, giúp mọi người học tập, sáng tác, thực hành và lưu giữ những giá trị âm nhạc.

## Bản thử nghiệm hiện tại: Professional Notation Studio

Mở `index.html` trên trình duyệt để chạy bản thử nghiệm giao diện và tương tác ban đầu.

### Một bản nhạc, hai chế độ hiển thị

- **Trình diễn:** tập trung vào bản nhạc, ẩn thư viện và thanh công cụ biên tập.
- **Soạn nhạc:** mở thư viện bên trái và toàn bộ công cụ biên tập.
- Chạm hai ngón tay để chuyển qua lại giữa hai chế độ; trạng thái bản nhạc được giữ nguyên.

### Những phần đã có trong prototype

- Khung bản nhạc nhiều hệ thống; mặc định 12 hệ thống, 5 ô nhịp mỗi hệ thống.
- Công cụ chọn, thêm nốt/dấu lặng, văn bản, bút ghi chú, bút đánh dấu, tẩy và bảng màu.
- Thêm hệ thống/ô nhịp; hoàn tác thao tác.
- Đàn phím ảo phát âm tổng hợp cơ bản; phát thử các nốt đã nhập.
- Tuner dùng micro (cần cấp quyền) và máy đếm nhịp.
- Lưu/mở bản nhạc trong bộ nhớ trình duyệt; xuất JSON, MusicXML sơ bộ và in/lưu PDF qua hộp thoại in.
- Phòng nghiên cứu MOMD bước đầu: lưu nhãn mẫu cá nhân vào Kho A trên thiết bị sau khi người dùng xác nhận.

### Giới hạn cần biết

Đây là prototype nền tảng giao diện và tương tác, **chưa phải trình soạn nhạc chuyên nghiệp hoàn chỉnh**. Ký âm hiện còn tối giản; phát âm thanh chưa dùng soundfont piano; MusicXML mới là cấu trúc xuất thử nghiệm, chưa ánh xạ đầy đủ cao độ/trường độ/vị trí; chưa có OMR, nhận dạng chữ viết tay, huấn luyện mô hình AI thật, đồng bộ tài khoản hay Kho B cộng đồng. Những phần này sẽ được phát triển và kiểm thử theo từng giai đoạn trên cùng một Notation Engine, không tạo hai trình soạn nhạc tách rời.

## Nguyên tắc kiến trúc

- Progressive Web App, ưu tiên iPad và Apple Pencil.
- Piano là bộ ký âm đầu tiên; kiến trúc hướng tới mở rộng cho thanh nhạc và nhạc cụ khác.
- Một Notation Engine dùng chung cho soạn nhạc, trình diễn, nhận dạng, phát lại và xuất dữ liệu.
- Dữ liệu cá nhân (Kho A) tách biệt với dữ liệu cộng đồng đã xác minh (Kho B); không tự động đưa dữ liệu người dùng vào huấn luyện chung.
- Ưu tiên công cụ miễn phí, mã nguồn tự phát triển và sử dụng tài nguyên tiết kiệm.

## Tầm nhìn

Cùng học tập, sáng tác, bảo tồn và trao truyền di sản âm nhạc.
