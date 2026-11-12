# MELO AI — Music Recognition Engine

## Trạng thái triển khai

Nhánh `feature/melo-music-recognition-engine` sử dụng ứng dụng React + TypeScript + Vite có sẵn làm nền, không tạo dự án frontend trùng lặp. Mọi thay đổi vẫn nằm trên nhánh tính năng; `main` không bị sửa.

### Đã triển khai trong Music Data Engine

- Mô hình dữ liệu chuẩn hóa phiên bản `1.0`: Score, Part, Measure, Event, Pitch.
- MusicXML `score-partwise`: đọc bè, ô nhịp, nốt, dấu lặng, cao độ, alter, octave, duration, voice, staff, tie, articulation và một phần thuộc tính key/time/clef.
- MIDI Standard MIDI Files: đọc header, track chunks, variable-length quantities, running status, note-on/note-off, velocity, tên track, tempo, time signature và key signature; ghép nốt theo channel + pitch, chia dữ liệu thành ô nhịp theo nhịp chỉ định và tách sự kiện kéo dài qua vạch nhịp.
- Hai bộ phân tích trả cùng một `ParseSummary` và cùng cấu trúc `Score`.
- Giao diện đã kết nối parser thực cho MusicXML/MIDI; ảnh/PDF/audio/YouTube vẫn chưa được nhận dạng nội dung.\n- Bộ dựng khuông nhạc SVG thử nghiệm hiển thị khóa, nốt, dấu hóa, hóa biểu theo vòng quãng năm, số chỉ nhịp, dấu lặng theo trường độ cơ bản, dấu chấm, dấu nối và vạch nhịp.

## Giới hạn kỹ thuật hiện tại

- MusicXML `score-timewise` được nhận diện nhưng chưa chuyển đổi; cần xuất `score-partwise`.
- Các thuộc tính MusicXML thay đổi theo từng ô nhịp; mô hình hiện lưu thuộc tính ở cấp ô nhịp nhưng chưa hỗ trợ đầy đủ mọi notation, tuplet, grace note, direction, lyric, multi-staff mapping và layout.
- MIDI hiện quy đổi onset/duration theo PPQ, ghép note event và lưu metadata cơ bản. Chưa có quantization, voice separation, sustain pedal, controller automation, tempo map theo thời gian, nhiều tempo segment, hay chuyển thành notation engraving-ready. Tên nốt enharmonic đang dùng cách viết đơn giản.
- MIDI format 2 được giữ track riêng và có cảnh báo; cách biểu diễn sequence độc lập sẽ được hoàn thiện.
- Bộ dựng khuông nhạc hiện là preview, chưa phải Music Editor có thể chỉnh sửa; chưa có playback engine hoặc export MusicXML từ model. Cách viết dấu lặng và trường độ vẫn là quy ước hiển thị gần đúng, chưa thay thế bộ engraving chuyên dụng.

## Kiểm thử và nghiệm thu

Cần chạy `npm ci`, `npm run build`, `npm run lint` trong môi trường Node tương thích (Vite yêu cầu Node `^20.19.0 || >=22.12.0`). Cần bổ sung fixture MusicXML/MIDI được phép sử dụng và kiểm thử tự động trước khi coi parser là production-ready. Không đánh dấu build/test là đạt khi chưa thực thi.

## Lộ trình kế tiếp

1. Bổ sung fixture và unit tests cho MusicXML/MIDI, sửa các trường hợp sai sau khi chạy build.
2. Tạo màn hình xem dữ liệu nốt/ô nhịp từ Score model.
3. Xây renderer khuông nhạc và playback piano tối thiểu.
4. Nghiên cứu pipeline OMR ảnh/PDF mã nguồn mở.
5. Mở rộng audio transcription và handwriting sau khi có cơ sở dữ liệu/đánh giá phù hợp.
