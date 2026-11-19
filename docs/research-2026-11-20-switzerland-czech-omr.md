# Sổ đăng ký tài nguyên OMR ưu tiên — Thụy Sĩ và Cộng hòa Séc
Ngày rà soát: 2026-11-20
Trạng thái: nghiên cứu nguồn chính thức; chưa xác nhận tài trợ trực tiếp hoặc chuyển giao riêng cho MeloLegacy.

## 1. Mục tiêu khẩn cấp
Đưa năng lực đọc bản nhạc in/ảnh vào quy trình soạn nhạc MeloLegacy để hỗ trợ chuẩn bị chương trình học sinh. Thứ tự ưu tiên giữ nguyên: PDF → MusicXML. Công cụ nghiên cứu và dữ liệu được nối qua adapter; không tạo sản phẩm/hệ sinh thái độc lập.

## 2. Thụy Sĩ — DeepScore / DeepScoresV2
### DeepScore project
- Đơn vị: ZHAW (Zurich University of Applied Sciences), Swiss AI Lab IDSIA và ScorePad.
- Dự án DeepScore do CTI tài trợ, tổng ngân sách dự án công bố 935.000 CHF, thời gian 07/2016–01/2019.
- Mục tiêu: OMR bản nhạc in, nhận diện ký hiệu bằng deep learning; tạo active sheet và hỗ trợ MusicXML. Dự án mô tả dùng Audiveris cho quy trình tổng thể, trong khi nghiên cứu DeepScore cải thiện nhận dạng đối tượng/ký hiệu.
- Đây là dự án đã hoàn tất, không phải lời mời tài trợ hoặc giấy phép dịch vụ dành cho MeloLegacy.

### DeepScoresV2 dataset
- Bộ dữ liệu công khai có 255.385 ảnh bản nhạc số hóa, 151 triệu đối tượng ký hiệu thuộc 135 lớp; gồm bounding boxes, oriented boxes, semantic segmentation và instance segmentation.
- Bản dense gồm 1.714 ảnh; bản đầy đủ khoảng 81.7 GB. Ưu tiên bản dense cho thử nghiệm ban đầu để tránh tải khối dữ liệu lớn khi chưa có hạ tầng.
- Giấy phép dataset DeepScoresV2: CC BY 4.0 (xác minh trên hồ sơ ZHAW/Zenodo). Ghi công đúng tác giả và dẫn DOI 10.5281/zenodo.4012193.
- Không nhầm giấy phép dataset với giấy phép mã nguồn, mô hình huấn luyện, hoặc các bản dữ liệu khác mang tên DeepScores. Mỗi snapshot/model phải có hồ sơ riêng.

Nguồn:
- ZHAW DeepScore project: https://www.zhaw.ch/en/research/project/70920
- ZHAW dataset record: https://digitalcollection.zhaw.ch/items/1376f518-211d-49c8-a658-dbc7f085d2b1
- Zenodo dataset: https://zenodo.org/records/4012193
- Dense dataset mirror reference: https://omr-datasets.readthedocs.io/en/latest/downloaders.html

## 3. Cộng hòa Séc — Charles University / Prague Music Computing Group / OmniOMR
### OmniOMR
- Đơn vị: Institute of Formal and Applied Linguistics (ÚFAL), Faculty of Mathematics and Physics, Charles University; phối hợp Moravian Library.
- Dự án DH23P03OVV008, thuộc chương trình NAKI III và được Ministry of Culture of the Czech Republic hỗ trợ; thời gian 2023–2027.
- Mục tiêu chính thức bao gồm phát hiện vùng ký âm trong tài liệu số, phân loại kiểu ký âm và trích xuất ngữ nghĩa âm nhạc: cao độ, trường độ và thời điểm bắt đầu nốt (onsets), sau đó lập chỉ mục và tìm kiếm.
- Các phần mềm công khai: https://github.com/orgs/OmniOMR/repositories

### Musibot — đường thử nghiệm thực tế nhanh
- Repo: https://github.com/OmniOMR/musibot
- Mục đích: dịch vụ web OMR cho ảnh scan/ảnh chụp; đầu ra máy đọc được, ví dụ MusicXML.
- README của dự án công bố web UI: https://quest.ms.mff.cuni.cz/musibot/
- API có tài liệu tại /musibot/api/docs trên máy chủ công bố; hỗ trợ upload ảnh JPEG, pipeline, tải file kết quả. Tài liệu công khai mô tả public session được cấp token miễn phí khi instance bật public access, có quota tổng và phiên hết hạn. Không gửi tài liệu nhạy cảm hoặc bản nhạc chưa được phép lên dịch vụ công cộng.
- Mã nguồn Musibot: Apache-2.0. Giấy phép mã nguồn không tự động bao trùm dữ liệu hoặc model weights mà service gọi đến.
- Giới hạn thực tế cần ghi nhớ: README mô tả upload từng trang JPEG; chưa xác nhận API nhận PDF nhiều trang trực tiếp. Với PDF, xuất trang thành ảnh trước hoặc dùng Audiveris làm tuyến PDF chính.
- Trước khi tích hợp tự động, cần kiểm tra live instance, pipeline đang hoạt động, điều khoản public access, retention/xóa, CORS, dung lượng và model/pipeline license. Không coi endpoint công khai là SLA hay tài trợ hạ tầng cho Melo.

### Zeus — mô hình đọc khuông và grand staff
- Repo: https://github.com/OmniOMR/zeus
- Nhận diện staff/grand staff và có CLI predict xuất MusicXML cho ảnh khuông nhạc.
- Mã nguồn: MIT. README yêu cầu Python 3.10 (TensorFlow 2.12), nên nên chạy thành worker/CLI tách biệt thay vì nhúng vào PWA.
- Các model snapshot được README liệt kê có giấy phép riêng: snapshot 2026-08-03 CC BY-NC-SA; một số model 2024 CC BY-SA. Không được suy luận model weights mang MIT chỉ vì code repo MIT.
- Chỉ dùng snapshot tương thích với mục đích phi thương mại và tuân thủ ShareAlike/attribution. Kiểm tra license từng file snapshot trước khi tải và triển khai.

### MuNG / MUSCIMA++
- MuNG là biểu diễn đồ thị ký âm để nối primitives (notehead, stem, beam...) với quan hệ; repo thư viện MuNG công bố MIT.
- MUSCIMA++ dataset: 91.255 ký hiệu viết tay, 23.352 note; có bounding boxes, pixel masks và quan hệ cấu thành. Phù hợp làm benchmark/khởi đầu nghiên cứu nhận dạng viết tay.
- Dataset MUSCIMA++: CC BY-NC-SA 4.0; cần ghi công và tuân thủ ShareAlike. Không gộp giấy phép của thư viện MuNG (MIT) với giấy phép dataset.
- Dữ liệu ảnh nền CVC-MUSCIMA không được phân phối kèm MUSCIMA++ annotations; cần lấy từ nguồn CVC theo điều khoản riêng.
- MUSCIMA++ không phải bộ nhận dạng viết tay chạy sẵn; đây là dataset + annotation. Dùng để đánh giá/huấn luyện cần pipeline riêng.
- Trang chính thức: https://ufal.mff.cuni.cz/muscima
- Dữ liệu: https://github.com/OMR-Research/muscima-pp

### MusiCorpus dataset
- Dự án OmniOMR thông báo MusiCorpus 1.0 được phát hành trên LINDAT ngày 2026-04-30, gồm 1.309 trang bản thảo thực tế và hơn 880.000 ký hiệu chú giải, bao gồm symbol detection và end-to-end MusicXML.
- Định dạng/CLI code: https://github.com/OmniOMR/musicorpus (MIT); giấy phép dataset thành phần phải kiểm tra ở bản ghi LINDAT và từng nguồn (OmniOMR/Dolores) trước khi dùng hoặc huấn luyện. Không suy ra dataset cũng MIT từ package.
- Bản ghi dataset: http://hdl.handle.net/20.500.12800/1-6147

Nguồn dự án:
- OmniOMR grant/project: https://ufal.mff.cuni.cz/grants/omniomr
- Prague Music Computing Group: https://ufal.mff.cuni.cz/pmcg
- MUSCIMA++ license/data: https://ufal.mff.cuni.cz/node/1371
- Musibot code and docs: https://github.com/OmniOMR/musibot
- Zeus model and snapshot licenses: https://github.com/OmniOMR/zeus
- MuNG code: https://github.com/OMR-Research/mung

## 4. Phân biệt “cao độ” trong hai nhóm năng lực
- OMR từ ảnh/PDF: đọc khuông, khóa, vị trí đầu nốt, dấu hóa, nhịp/trường độ rồi suy ra pitch theo ngữ cảnh ký âm. DeepScoresV2 và OmniOMR/Musibot/Zeus/MUSCIMA++ thuộc nhóm này.
- Audio pitch detection: nghe micro/ghi âm để lấy Hz, cents, pitch contour/MIDI. Các nguồn Thụy Sĩ và Séc ở trên không phải bằng chứng rằng đã có bộ audio-to-pitch cho MeloLegacy. Tiếp tục dùng một provider audio riêng (ví dụ Basic Pitch cho audio-to-MIDI) và Tuner/Audio Engine của Melo; không trộn hai pipeline.

## 5. Kế hoạch đưa vào một MeloLegacy duy nhất
1. **Dùng ngay để thử:** mở Musibot web UI; thử với một trang JPEG bản nhạc không nhạy cảm, kiểm tra kết quả MusicXML, soát thủ công trước khi đưa vào tác phẩm. Nếu nguồn là PDF, xuất từng trang thành JPEG; giữ PDF gốc riêng.
2. **PDF production path:** giữ Audiveris 5.11.0 là lựa chọn chính đã chốt cho PDF → MusicXML; Musibot/OmniOMR là nhánh đối chiếu và nâng chất lượng, không thay thứ tự ưu tiên.
3. **Printed-symbol recognition:** đưa DeepScoresV2 dense (CC BY 4.0) vào benchmark và training sandbox sau khi kiểm tra checksum/manifest, không đẩy toàn bộ 81.7 GB lên app.
4. **Handwriting:** dùng MUSCIMA++ làm benchmark nghiên cứu theo CC BY-NC-SA; kết hợp mẫu Melo do giáo viên/học sinh tự nguyện đóng góp, tách rõ dữ liệu riêng và dữ liệu dùng chung.
5. **OmniOMR model:** chạy Zeus/Musibot như provider worker độc lập; pin commit/tag, model snapshot và license; mọi đầu ra chuyển về Melo Notation Core/MusicXML, kèm confidence/provenance.
6. **Ứng dụng PWA:** không nhúng model Python/TensorFlow vào trình duyệt. PWA chỉ gửi job qua API adapter và nhận MusicXML; xử lý tệp riêng tư ưu tiên worker do Melo kiểm soát.
7. **Kiểm thử nghiệm thu:** thử 3 loại đầu vào (PDF xuất JPEG, ảnh scan, ảnh chụp); đo thời gian, tỷ lệ đúng pitch/duration/accidental/voice, lỗi MusicXML; phát lại và đối chiếu từng ô nhịp. Không báo “đã tích hợp” cho tới khi chạy build và kiểm thử end-to-end.

## 6. Giới hạn trạng thái
- Đã xác minh tài liệu dự án, mã nguồn, một số giấy phép và đường thử nghiệm công khai.
- Chưa xác minh instance Musibot đang hoạt động ngay thời điểm này, chưa gọi API thực tế, chưa upload/tải bất kỳ tài liệu nào, chưa xác nhận quota/retention cụ thể của instance.
- Chưa có bằng chứng MeloLegacy nhận được tài trợ trực tiếp, GPU/CPU, quyền truy cập riêng hoặc chuyển giao model từ ZHAW/IDSIA/ScorePad/Charles University/OmniOMR.
- Chưa tải dataset hoặc weights vào repository MeloLegacy; chưa cài/deploy engine; chưa sửa app code; chưa merge vào main.
- Không liên hệ đơn vị nghiên cứu, không đăng ký tài khoản/dịch vụ, không phát sinh chi phí nếu chưa được anh Quý chỉ đạo riêng.

## 7. Ghi công tối thiểu
DeepScoresV2: Tuggener, Lukas; Satyawan, Yvan Putra; Pacha, Alexander; Schmidhuber, Jürgen; Stadelmann, Thilo. DeepScoresV2 dataset. DOI: 10.5281/zenodo.4012193.
MUSCIMA++: Hajič jr., Jan; Pecina, Pavel. The MUSCIMA++ Dataset for Handwritten Optical Music Recognition. ICDAR 2017.
OmniOMR/Musicorpus: trích dẫn và ghi công theo README/bản ghi LINDAT của dataset cụ thể được sử dụng.
