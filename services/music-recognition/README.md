# MELO Music Recognition Sidecar

Bộ xử lý cục bộ cho hai tác vụ: ảnh/PDF bản nhạc → MusicXML/MIDI và âm thanh → MIDI. Frontend PWA gọi API này; tệp được xử lý trong thư mục tạm và tự xóa sau mỗi yêu cầu.

## 1. Yêu cầu

- Python 3.10 hoặc 3.11.
- Java 17+ trong PATH (Score-OMR cần Java decoder).
- Máy có RAM/CPU đủ để chạy mô hình nhận dạng.
- Node/Vite chỉ cần cho frontend; không bắt buộc trên máy chạy API.

## 2. Cài đặt và chạy

Từ thư mục gốc repository:

```bash
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1

python -m pip install -r services/music-recognition/requirements.txt
cd services/music-recognition
uvicorn api:app --host 0.0.0.0 --port 8000
```

Kiểm tra `http://localhost:8000/api/health`. Kết quả mong đợi có `omr_installed: true` và `audio_installed: true`.

## 3. Kết nối PWA

Trong môi trường phát triển, Vite proxy `/api` sang `http://localhost:8000`. Khi triển khai, cấu hình reverse proxy cùng origin hoặc đặt biến `VITE_MUSIC_RECOGNITION_API` thành URL API HTTPS. Cấu hình `MELO_ALLOWED_ORIGINS` bằng danh sách origin được phép, phân tách dấu phẩy.

Ví dụ:

```bash
MELO_ALLOWED_ORIGINS=https://studio.example.org uvicorn api:app --host 0.0.0.0 --port 8000
```

Không mở API này trực tiếp ra Internet nếu chưa bổ sung xác thực, giới hạn tốc độ, quota và chính sách lưu trữ phù hợp. Bản hiện tại giới hạn tệp 50 MB, chỉ nhận phần mở rộng cho phép, timeout engine và xóa tệp tạm sau request.

## 4. API

- `GET /api/health`: kiểm tra trạng thái engine.
- `POST /api/recognize/omr`: multipart field `file`, nhận PDF/PNG/JPG/WEBP/TIFF; trả MusicXML và MIDI base64 nếu engine tạo được.
- `POST /api/recognize/audio`: multipart field `file`, nhận WAV/MP3/M4A/OGG/FLAC; trả MIDI base64.

OMR chạy bằng `score-reader` (Score-OMR, Apache-2.0). Audio chạy bằng `basic-pitch` (Spotify Basic Pitch, Apache-2.0). Tuân thủ LICENSE/NOTICE của các dependency khi phân phối.

## 5. Chất lượng và giới hạn

- OMR có thể sai với ảnh mờ, nghiêng, bản viết tay, ký hiệu hiếm, nhiều khuông hoặc bản scan chất lượng thấp. Luôn xem lại MusicXML trước khi dùng chính thức.
- Basic Pitch là mô hình đa cao độ tổng quát; bản thu piano nhiều bè có thể bị gộp/nhầm nốt, sustain và âm vang. Kết quả cần bước biên tập MIDI.
- API hiện trả MusicXML/MIDI thô; chưa tự động khẳng định độ chính xác hoặc tự ghi vào thư viện người dùng.
- Chưa có xác thực tài khoản, job queue, tiến trình phần trăm, GPU scheduling hay triển khai production.
