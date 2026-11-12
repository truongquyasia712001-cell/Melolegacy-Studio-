# MELO AI — Music Recognition Engine

## Trạng thái triển khai

Nhánh `feature/melo-music-recognition-engine` tiếp tục dùng React + TypeScript + Vite hiện có. Không tạo frontend trùng lặp; không sửa `main` hoặc Melobox.

### Đã có từ các bước trước

- Music Data Model phiên bản 1.0: Score, Part, Measure, Event, Pitch.
- Parser MusicXML score-partwise và MIDI Standard MIDI Files.
- SVG staff preview và MELO Piano Engine prototype (âm thanh piano-like tổng hợp, chưa phải grand piano thu âm).

### Bổ sung trong giai đoạn nhận dạng

- API sidecar FastAPI: `services/music-recognition/api.py`.
- OMR: tích hợp CLI Score-OMR/score-reader, nhận PDF/PNG/JPG/WEBP/TIFF và trả MusicXML cùng MIDI (nếu engine tạo được).
- Audio-to-MIDI: tích hợp CLI Spotify Basic Pitch, nhận WAV/MP3/M4A/OGG/FLAC và trả MIDI.
- Frontend gọi API, chuyển MusicXML/MIDI vào parser và Music Data Model hiện có, hiển thị preview, phát thử bằng piano engine và tải kết quả.
- Upload tạm thời, giới hạn 50 MB, whitelist phần mở rộng, timeout và tự xóa thư mục tạm sau request.

## Cài đặt

Xem `services/music-recognition/README.md`. Yêu cầu Python 3.10/3.11 và Java 17+ cho OMR; cài dependencies từ requirements rồi chạy FastAPI trên port 8000. Trong Vite dev server, `/api` được proxy sang sidecar.

## Giới hạn và điều kiện nghiệm thu

- Đây là tích hợp engine qua API, không phải OMR chạy trực tiếp trên iPad Safari. Cần một máy chạy sidecar hoặc server riêng có cài Java/Python/model.
- Audio-to-MIDI dùng Basic Pitch baseline; xử lý polyphonic được nhưng tốt nhất với một nhạc cụ nổi trội. Piano nhiều bè cần rà soát và chỉnh sửa.
- Bản OMR/audio chưa được chạy nghiệm thu trong môi trường này; cần cài runtime, tải model, chạy fixtures, kiểm tra MusicXML và MIDI đầu ra trước khi dùng công việc chính thức.
- API chưa có xác thực, quota, job queue hay hardening production. Không public endpoint trực tiếp trước khi bổ sung các lớp này.
- Chưa có Music Editor đầy đủ, sửa bản nhạc trực tiếp hoặc lưu trữ legacy; các kết quả hiện được xem trước và tải xuống.

## Bảo mật và giấy phép

- Score-OMR / score-reader: Apache-2.0 theo upstream; giữ lại thông báo giấy phép khi phân phối.
- Spotify Basic Pitch: Apache-2.0; giữ lại LICENSE/NOTICE khi phân phối.
- Tệp tải lên được xử lý trong thư mục tạm cục bộ và xóa sau khi request kết thúc. Không gửi file đến dịch vụ bên thứ ba từ frontend.
