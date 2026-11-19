# Borrow, Learn, Build, Own — Chiến lược tiếp nhận và làm chủ công nghệ MeloLegacy

> Trạng thái: đặc tả nghiên cứu/triển khai. Không có nghĩa các bộ máy đã được tích hợp hoặc các quyền sử dụng đã được cấp.
> Nguyên tắc: tận dụng tối đa công nghệ, dữ liệu và tri thức bên ngoài trong phạm vi giấy phép; từng bước tạo năng lực, dữ liệu và sản phẩm độc lập của MeloLegacy.

## 1. Mục tiêu

MeloLegacy không tự viết lại mọi thuật toán đã có. Melo tiếp nhận các công cụ, mô hình, dữ liệu, chuẩn và tài nguyên được cung cấp hợp pháp; đánh giá chúng; kết nối qua adapter; dùng kết quả để xây dựng năng lực nội bộ; và chỉ thay thế/hoàn trả/ngừng sử dụng tài nguyên bên ngoài theo đúng điều kiện cấp phép hoặc tài trợ.

Mô hình ẩn dụ:
- Gà mái: dự án mã nguồn mở, nhà tài trợ, trường/viện, kho dữ liệu, nhà cung cấp hạ tầng.
- Trứng: kết quả xử lý, mẫu đã gán nhãn, quy trình, benchmark, kinh nghiệm.
- Gà con: mô hình, dữ liệu, bộ kiểm thử, thư viện và quy trình Melo tự xây dựng được quyền giữ lại.
- Nông trại: hệ sinh thái MeloLegacy tự chủ.

Không mặc định rằng có thể giữ lại trọng số mô hình, dữ liệu đầu vào, bản sửa đổi hoặc kết quả phái sinh sau khi ngừng sử dụng tài nguyên được tài trợ. Mỗi thành phần phải có hồ sơ quyền riêng.

## 2. Phạm vi năng lực cần tiếp nhận

| Năng lực | Đầu vào | Kết quả trung gian | Đích trong Melo |
|---|---|---|---|
| OMR PDF | PDF nhiều trang | ảnh trang, staff geometry, symbol regions, confidence | Melo Notation Core, MusicXML |
| OMR ảnh | ảnh chụp/scan | deskew, staff, glyph, pitch/rhythm candidates | Notation Core |
| Nhận dạng ký âm viết tay | ảnh/luồng bút | nét, symbol candidates, quan hệ hình học | Handwriting Core |
| Nhận dạng cao độ | audio/mic | pitch contour, Hz, cents, MIDI pitch | Notation Core, Tuner |
| Nhận dạng trường độ/nhịp | audio/mic | onset, offset, beat, tempo, rests | Notation Core |
| Audio-to-MIDI | audio được phép xử lý | MIDI, pitch bend, confidence | Composer Room |
| Tách âm đa bè | audio được phép xử lý | vocal, drums, bass, other stems | Sound Lab |
| Video/YouTube | URL, metadata, phụ đề được phép, video embed | metadata, transcript/caption khi được phép, đồng bộ tham chiếu | Research Room |
| MusicXML/MIDI/MEI | tệp chuẩn | parse, validate, normalized notation | Notation Core |
| Phân tích âm nhạc | notation/audio hợp lệ | harmony, rhythm, form, instrumentation, key | Composer Room, Learning |
| Dàn trang/phát nhạc | Notation Core | SVG/canvas, playback events, audio | Reader, Composer, Practice |

**Thứ tự ưu tiên đã chốt:** PDF → MusicXML trước; ảnh và các luồng khác tiếp theo. YouTube không được làm lẫn hoặc đẩy lùi ưu tiên PDF.

## 3. Ứng viên công nghệ ban đầu

Các mục dưới đây là ứng viên cần kiểm thử, không phải xác nhận đã tích hợp. Kiểm tra lại phiên bản, giấy phép, model weights, phụ thuộc và điều kiện phân phối trước mỗi lần đưa vào sản phẩm.

| Thành phần | Có thể học hỏi/tận dụng | Ràng buộc / kiểm tra |
|---|---|---|
| Audiveris | OMR bản nhạc in, xử lý và xuất MusicXML | Mã nguồn AGPL-3.0; đánh giá nghĩa vụ khi sửa đổi/phân phối/chạy dịch vụ |
| oemer | OMR ảnh sang MusicXML | Xác minh giấy phép, khả năng bảo trì, benchmark và giới hạn đầu vào |
| MUSCIMA++ | dữ liệu ký âm viết tay và chú giải | CC BY-NC-SA 4.0; không dùng mặc định cho sản phẩm/huấn luyện có mục đích thương mại |
| Smashcima / HOMUS / CVC-MUSCIMA / DeepScores / DoReMi | dữ liệu và sinh dữ liệu OMR | Kiểm tra giấy phép từng dataset, từng ảnh, chú giải và quyền tái phân phối |
| SMuFL | tên/ký hiệu và từ vựng glyph chuẩn | Duy trì metadata tách biệt font; kiểm tra riêng giấy phép font và tài sản đồ họa |
| Spotify Basic Pitch | audio-to-MIDI, pitch bend, thử nghiệm đơn nhạc cụ và polyphonic | Mã nguồn Apache-2.0; kiểm tra model và điều kiện triển khai thực tế |
| Demucs | tách vocal/drums/bass/other | Mã nguồn MIT không tự động cấp quyền mọi model weights/dữ liệu huấn luyện; phải rà soát riêng |
| OpenAI Whisper | nhận dạng lời nói, ngôn ngữ, phụ đề/transcript | MIT cho mã và weights theo kho chính thức; không coi là bộ nhận dạng nốt nhạc |
| music21 | phân tích lý thuyết, cấu trúc và ký âm bằng máy | Mã BSD; corpus đi kèm có giấy phép riêng theo từng tác phẩm |
| Verovio | render ký âm từ MusicXML/MEI | Kiểm tra giấy phép, bản build WASM và tương thích PWA |
| MusicXML / MEI | chuẩn trao đổi và lưu trữ ký âm | Chuẩn hóa qua adapter; giữ metadata và thông tin nguồn |
| IIIF / OAI-PMH | truy cập ảnh và metadata thư viện | Chỉ lấy nội dung theo quyền và API của từng đơn vị |

Nguồn gốc cần kiểm tra:
- Audiveris: https://github.com/Audiveris/audiveris
- oemer: https://github.com/BreezeWhite/oemer
- OMR Datasets: https://apacha.github.io/OMR-Datasets/
- MUSCIMA++ và OMR Research: https://github.com/OMR-Research
- Basic Pitch: https://github.com/spotify/basic-pitch
- Demucs: https://github.com/facebookresearch/demucs
- Whisper: https://github.com/openai/whisper
- music21: https://music21.org/music21docs/
- Verovio: https://www.verovio.org/
- SMuFL: https://github.com/w3c-cg/smufl

## 4. YouTube và quyền xử lý nội dung

YouTube API/Developer Policies không cho phép ứng dụng tùy ý tải, lưu, tách hoặc cung cấp track âm thanh từ nội dung YouTube. Không triển khai downloader, audio ripper, stem separator hoặc cơ chế vượt hạn chế dựa trên URL YouTube.

Hai luồng phải tách biệt:
1. **YouTube reference connector:** mở/phát video bằng trình phát được phép; tra cứu metadata theo API chính thức; dùng phụ đề/transcript chỉ khi API và quyền sử dụng cho phép; lưu URL tham chiếu và mốc thời gian, không sao chép audiovisual content trái phép.
2. **Authorized audio connector:** nhận file người dùng tự thu/tải lên, file do chủ sở hữu cấp phép, hoặc nguồn có quyền xử lý rõ ràng; mới chạy source separation, pitch/rhythm transcription và lưu kết quả theo giấy phép.

Nguồn chính sách: https://developers.google.com/youtube/terms/developer-policies/ và https://developers.google.com/youtube/terms/developer-policies-guide

## 5. Kiến trúc adapter — quản lý tập trung, dữ liệu phân tán, quyền sở hữu độc lập

Melo điều phối tập trung nhưng không buộc các nút phải chuyển dữ liệu gốc về Melo.

### 5.1 Các lớp

1. **Melo Provider Registry:** danh mục provider, công cụ, phiên bản, endpoint, khả năng, trạng thái, chi phí, giấy phép và điều kiện vận hành.
2. **Melo Connector/Adapter:** một adapter cho mỗi engine hoặc nguồn dữ liệu; cô lập phụ thuộc bên ngoài.
3. **Melo Job Orchestrator:** điều phối tác vụ, retry, timeout, hàng đợi, trạng thái, quota và lựa chọn engine.
4. **Melo Notation Core:** mô hình ký âm chuẩn độc lập nhà cung cấp.
5. **Melo Provenance & Rights:** ghi nguồn gốc, giấy phép, chủ sở hữu, sự đồng ý, phiên bản, quyền xử lý và thời hạn.
6. **Melo Quality Gate:** kiểm tra đầu ra ở cấp ký hiệu, ô nhịp, trang/tác phẩm và hiệu năng provider.
7. **Melo Storage Boundary:** dữ liệu cá nhân, dữ liệu cộng tác, dữ liệu cộng đồng được duyệt và dữ liệu nguồn bên ngoài phải tách vùng.
8. **Melo Audit & Portability:** nhật ký truy cập, export chuẩn mở, checksum, sao lưu, xóa/thu hồi và chuyển nhà cung cấp.

### 5.2 Hợp đồng adapter tối thiểu

Mỗi adapter phải công bố:
- provider_id, engine_id, phiên bản, nguồn và giấy phép.
- capabilities và định dạng đầu vào/đầu ra.
- Yêu cầu tài nguyên, giới hạn kích thước/thời lượng, timeout, quota và chi phí.
- rights_policy: quyền xử lý, lưu trữ, chia sẻ, huấn luyện, lưu kết quả và xóa.
- input_manifest: checksum, MIME, nguồn gốc, chủ sở hữu, sự đồng ý và giấy phép.
- job_status: queued/running/succeeded/partial/needs_review/failed.
- output_manifest: phiên bản engine, checksum, confidence, lỗi, provenance và giấy phép kết quả.
- Khả năng export và thay thế bằng provider khác mà không đổi Notation Core.

Không để ứng dụng giao diện phụ thuộc trực tiếp vào API riêng của một nhà cung cấp.

## 6. Melo Notation Core — chuẩn dữ liệu nội bộ

Mọi đầu vào hợp lệ phải được chuyển thành cùng một mô hình ký âm có cấu trúc, không lấy hình ảnh glyph hoặc MIDI làm nguồn chân lý duy nhất.

Các thực thể tối thiểu:
- Work, Movement, Page, System, Staff, Part, Instrument, Voice, Measure.
- Note, Rest, Pitch, Octave, Duration, Dot, Tuplet, Tie, Beam.
- Clef, KeySignature, TimeSignature, Accidental, Barline.
- Articulation, Ornament, Dynamic, Tempo, TextDirection, Slur, Pedal.
- SourceRegion, RecognitionCandidate, Confidence, ValidationIssue, Provenance.

Lưu song song:
- bản gốc bất biến;
- kết quả máy đề xuất;
- kết quả đã được người dùng/chuyên gia sửa;
- bản đã xác minh;
- bản biên soạn mới tách khỏi bản chuyển đổi nguyên gốc.

MusicXML là định dạng trao đổi ưu tiên; MEI có thể dùng cho lưu trữ/nghiên cứu; MIDI phục vụ phát và xử lý sự kiện, không thay thế đầy đủ ký hiệu âm nhạc.

## 7. Quality Gate và vòng học

1. Kiểm tra ký hiệu: loại, vị trí, confidence, quan hệ đầu nốt/thân/đuôi/dấu.
2. Kiểm tra âm nhạc: clef, key signature, accidental scope, pitch, duration, nhịp ô, tie/beam, voice continuity.
3. Kiểm tra tác phẩm: tính liên tục trang/hệ thống/khuông, cấu trúc bè và đối chiếu nguồn.
4. Người dùng/giáo viên xác minh các vùng mơ hồ; sửa đổi được lưu như nhãn có nguồn gốc và quyền sử dụng riêng.
5. Benchmark provider theo symbol accuracy, note accuracy, rhythm accuracy, measure correctness, MusicXML validity, latency, chi phí và lỗi theo loại bản nhạc.
6. Chỉ đưa mẫu đã được phép và kiểm duyệt vào tập dữ liệu Melo. Mẫu không rõ quyền, dữ liệu cá nhân hoặc mẫu chất lượng thấp không được đưa vào huấn luyện chung.

## 8. Mô hình tài sản và quyền sử dụng — Melo Data Passport

Mỗi tài nguyên có một passport:
- ID, tên, loại, chủ sở hữu, tổ chức/cá nhân cung cấp.
- URL/nguồn, ngày nhận, phiên bản, checksum.
- License/SPDX hoặc hợp đồng cấp quyền; bản quyền tác phẩm và quyền đối với bản ghi tách riêng.
- Quyền: xem, xử lý, sửa đổi, lưu, phân phối, nghiên cứu, huấn luyện AI, tạo sản phẩm phái sinh.
- Hạn sử dụng, vùng lãnh thổ, yêu cầu ghi công, share-alike, non-commercial, copyleft.
- Trạng thái: approved/restricted/research-only/expired/revoked.
- Nghĩa vụ khi kết thúc tài trợ: giữ lại, chuyển giao, xóa, trả lại, hoặc xin gia hạn.
- Lịch sử truy cập, xử lý, xuất, sửa, xóa và người phê duyệt.

Phân biệt bốn loại quyền:
A. Quyền dùng công cụ/mã nguồn.
B. Quyền dùng model weights và dữ liệu huấn luyện.
C. Quyền dùng dữ liệu đầu vào.
D. Quyền sở hữu/quyền tái sử dụng đầu ra và dữ liệu do Melo tạo.

Không suy luận quyền D từ A, B hoặc C.

## 9. Chi phí và lựa chọn vận hành

- Ưu tiên xử lý tại thiết bị/trình duyệt cho tác vụ nhẹ và dữ liệu riêng tư.
- Dùng server-side worker cho OMR/audio nặng khi có tài nguyên miễn phí hoặc tài trợ hợp lệ.
- Không giả định free tier vô hạn; theo dõi quota, giới hạn file, GPU, băng thông, lưu trữ, thời hạn và điều kiện thương mại.
- Mỗi provider cần ước lượng chi phí trên một trang PDF, một phút audio, một tác phẩm và một người dùng hoạt động.
- Không đưa provider vào production nếu không có phương án thay thế, export và xóa dữ liệu.
- Không đăng ký dịch vụ hoặc tạo tài khoản nhà cung cấp thay mặt người dùng nếu chưa có chấp thuận riêng.

## 10. Lộ trình ưu tiên

### Giai đoạn 0 — kiểm kê và cấp phép
- Xác minh repo/branch triển khai.
- Kiểm kê mã nguồn, dependency và chức năng hiện có.
- Lập provider registry và Data Passport.
- Kiểm tra giấy phép của code, model weights, dataset, fonts và nội dung mẫu.

### Giai đoạn 1 — PDF/ảnh sang MusicXML (ưu tiên số một)
- Benchmark Audiveris và oemer trên bộ PDF có quyền sử dụng.
- Chọn adapter OMR; giữ ảnh/PDF gốc bất biến.
- Tạo staff geometry, symbol candidates, confidence và MusicXML.
- Recognition Overlay để người dùng sửa vùng mơ hồ.
- Kiểm thử và đo độ chính xác trước khi công bố trạng thái hoàn tất.

### Giai đoạn 2 — MusicXML/MIDI và phân tích
- Import/export, validate, render, playback.
- music21 cho phân tích cấu trúc và lý thuyết.
- Giữ Notation Core làm nguồn dữ liệu thống nhất.

### Giai đoạn 3 — Audio/Sound Lab
- Basic Pitch cho audio-to-MIDI; đo riêng voice, piano và từng nhạc cụ.
- Demucs hoặc engine thay thế cho stem separation khi quyền model/data đã được duyệt.
- Onset/beat/pitch pipeline; so sánh với ground truth.
- Thu âm microphone và chuyển giai điệu ngân nga thành notation.

### Giai đoạn 4 — Handwriting AI
- Khảo sát MUSCIMA++, HOMUS, Smashcima và các nguồn phù hợp giấy phép.
- Tách dữ liệu nghiên cứu hạn chế khỏi dữ liệu Melo-owned.
- Thu thập mẫu giáo viên/học sinh có sự đồng ý, xác minh và quyền sử dụng rõ ràng.
- Tạo dataset Melo riêng và huấn luyện dần mô hình riêng.

### Giai đoạn 5 — Video/YouTube và mạng lưới bên ngoài
- Connector metadata/embed/caption theo chính sách.
- Chỉ phân tích audio/video đã được cấp quyền xử lý.
- Kết nối thư viện, trường/viện, cộng đồng và provider qua API/chuẩn mở.

## 11. Điều kiện nghiệm thu

Không báo cáo “đã tích hợp” chỉ vì đã thêm dependency hoặc giao diện. Mỗi adapter chỉ được xem là hoàn thành khi:
- build và chạy được trong môi trường mục tiêu;
- có test input/output và test lỗi;
- giấy phép đã được rà soát;
- có benchmark trên dữ liệu có quyền sử dụng;
- confidence và vùng không chắc chắn được giữ lại;
- có export, provenance, xóa/thu hồi và phương án thay thế;
- không làm hỏng chức năng hiện có trên iPad/Android PWA.

## 12. Giới hạn thay đổi

- Giữ nguyên kiến trúc đã chốt: quản lý tập trung, dữ liệu phân tán, quyền sở hữu độc lập.
- Không thay đổi main; mọi thử nghiệm qua branch riêng và PR để anh Quý xem xét.
- Không xóa lịch sử Git hoặc dữ liệu hiện có.
- Không tự liên hệ tổ chức/cá nhân, tạo tài khoản, đăng ký dịch vụ hoặc phát sinh chi phí.
- Không dùng dữ liệu có giấy phép hạn chế trái điều kiện; không tự động đưa dữ liệu người học vào tập huấn luyện chung.
- Không merge/release nếu chưa có phê duyệt của anh Quý.
