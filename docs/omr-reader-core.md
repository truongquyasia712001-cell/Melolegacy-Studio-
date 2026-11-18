# OMR Reader Core — Quy trình đọc bản nhạc in

> Mục tiêu: bắt đầu xây dựng bộ đọc bản nhạc PDF/ảnh thật cho MeloLegacy. Tài liệu này là hợp đồng kỹ thuật cho giai đoạn đầu; không tuyên bố bộ nhận dạng đã hoạt động.

## Phạm vi đầu tiên

Đầu vào: một trang PDF hoặc ảnh raster bản nhạc in.

Đầu ra giai đoạn 1: tọa độ và hình học khuông nhạc đã phát hiện, gồm 5 dòng, khoảng cách dòng, vùng khuông và mức tin cậy. Chưa tự kết luận MusicXML ở giai đoạn này.


## Pipeline

1. **Load** — đọc PDF theo trang; ảnh raster; giữ nguồn và kích thước pixel gốc.
2. **Preprocess** — grayscale, threshold/adaptive binarization, khử nhiễu nhẹ, deskew; giữ ảnh gốc không thay đổi.
3. **Staff detection** — phát hiện các dòng ngang dài; gom thành bộ 5 dòng; ước lượng spacing; tách hệ khuông và staff.
4. **Staff geometry** — lưu y-coordinates của 5 dòng, spacing trung bình, vùng, skew/rotation và confidence. Mọi tọa độ có quy chiếu về ảnh nguồn.
5. **Symbol regions** — tách vùng ký hiệu theo staff/system; chưa phân loại ngữ nghĩa nếu chưa có bằng chứng.
6. **Recognition** — phân loại ký hiệu, notehead, stem, flag, rest, clef, accidental, barline và các thành phần khác.
7. **Musical interpretation** — kết hợp staff position + clef + key signature + accidental state + measure để tính pitch; rhythm từ note/rest value và beam/dot/tie.
8. **Validation** — kiểm tra cấu trúc, nhịp ô, voice continuity, pitch spelling, accidental scope và các quan hệ liên quan; cảnh báo mơ hồ.
9. **Export** — chỉ chuyển notation model đã kiểm tra sang MusicXML; giữ liên kết vị trí nguồn để overlay.

## Staff geometry model (draft)

Mỗi staff lưu:
- page index và system/staff index
- 5 dòng theo thứ tự từ trên xuống (pixel coordinates)
- staff-line spacing trung bình và độ lệch/skew
- bounding box
- confidence và detection notes


Không suy ra cao độ chỉ từ pixel y trước khi xác định staff và clef. Với staff spacing d, mỗi nửa khoảng cách d/2 tương ứng một bước vị trí diatonic (dòng/khe). Vị trí cần được chuẩn hóa theo staff reference, rồi mới áp dụng clef và accidental/key-signature rules.


## Nguyên tắc an toàn nhận dạng

- Không thay đổi PDF/ảnh nguồn.
- Không biến dự đoán low-confidence thành dữ liệu đã xác minh.
- Giữ confidence theo trang, system, staff và symbol.
- Mọi lỗi/mơ hồ phải có tọa độ nguồn để người dùng kiểm tra.
- Các lớp nhận dạng riêng biệt: staff geometry, glyph classification và musical semantics.
- MusicXML export phải dựa trên notation model có cấu trúc, không dựa vào ảnh hay glyph Unicode.


## Kiểm thử giai đoạn 1

- Staff 5 dòng sạch, spacing đều.
- Staff bị nghiêng nhẹ.
- Nhiều system trên một trang.
- Khuông lớn piano (treble + bass).
- Dòng khuông mờ/nhiễu hoặc giao với ký hiệu.
- Trang có kích thước và độ phân giải khác nhau.


Tiêu chí nghiệm thu: phát hiện đúng số staff và vị trí 5 dòng trên bộ test được gán nhãn; báo lỗi hoặc confidence thấp khi không đủ bằng chứng, không âm thầm tạo staff sai.


## Các bước kế tiếp

1. Chọn và tích hợp image-processing backend phù hợp với PWA/runtime hiện có.
2. Implement preprocess + staff detection + geometry normalization.
3. Tạo bộ test có ground-truth staff coordinates và metrics (precision/recall, line-coordinate error).
4. Sau khi staff geometry đạt, mới triển khai notehead detection và pitch resolver.
