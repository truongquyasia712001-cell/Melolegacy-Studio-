# MELO Resource Breeding & Independence Policy
Version: 1.0
Date: 2026-11-20
Applies to: MeloLegacy, Melopad, Melobot, Melocloud and all Melo research, learning, data and AI workflows.

## 1. Core rule
**Borrow lawfully. Learn deeply. Breed independent assets. Verify rights. Become independent.**

Melo may receive temporary or conditional access to datasets, models, source code, APIs, compute, storage, expert support, institutional infrastructure and research knowledge. Those resources are the "parent hen" in the project's working metaphor. Melo's goal is not permanent dependence on the parent resource. The goal is to create a durable, independently maintainable Melo capability from work that Melo is legally entitled to retain.

The metaphor is a strategy, not a legal shortcut: an output is not automatically owned by Melo merely because Melo processed, annotated, cropped, relabelled or trained on a sponsor's resource.

## 2. What Melo aims to create
For music notation and sound, Melo's independently developed assets may include:
- A Melo notation-symbol taxonomy and versioned symbol registry.
- Original score-page and symbol-crop images created from Melo-authored compositions and legally usable glyph fonts.
- Staff geometry, notehead coordinates, pitch/clef/key context, duration, rest, accidental, articulation, instrument, voice and measure annotations.
- Teacher/student handwriting samples contributed with explicit informed permission and a defined retention/sharing choice.
- Synthetic score images generated from Melo-authored MusicXML and a documented rendering pipeline.
- Melo-authored quality-control sets, error taxonomies, test fixtures and benchmark protocols.
- Melo-trained models, weights and inference pipelines only where every training source, base model and applicable terms permit that use and retention.
- Documentation, transformation code and tools authored by Melo.

## 3. Lawful "offspring" routes
### Route A — independent creation (preferred)
Create original notation and audio examples in Melo's own notation engine; render them into images using fonts and glyph assets whose licenses allow the intended use; generate exact labels directly from Melo's structured score data. Apply controlled transformations (scale, rotation, blur, noise, skew, staff-line variation, scan artefacts) and preserve the generation seed and source MusicXML. This can create large, internally consistent training sets without copying third-party dataset images.

### Route B — contributed material
Collect new handwritten notation, recordings and score images from teachers, learners, composers and instrument players under clear consent and contributor terms. Record whether the contribution may be used privately, in shared training, for model training, for publication, and whether it can be withdrawn. Do not assume that a school upload grants public-training rights.

### Route C — open licensed resources
Use third-party datasets and models only within their exact licenses. Preserve attribution, notices, non-commercial conditions, ShareAlike duties, model-weight restrictions, dataset terms and version identifiers. Where the terms require derivative datasets or adaptations to remain under the same license, Melo must not put those assets into an incompatible closed/proprietary dataset.

### Route D — sponsored/private resources
Before access, obtain written terms covering: permitted use; copying and transformation; derivative data; training and fine-tuning; model weights; generated outputs; ownership; attribution; publication; confidentiality; retention; deletion; audit; export; termination; and post-grant rights. If terms are silent or ambiguous, do not treat the output as Melo-owned. Ask for clarification before using it to create a supposedly independent asset.

## 4. Rights and provenance ledger — mandatory for every asset
Every data item, dataset version, model, model checkpoint, code module and provider integration must record:
- asset_id, title, asset_type, version, owner/rightsholder, contributor and custodian;
- source URL or agreement reference, source checksum/hash, collection date and transformation lineage;
- license/contract version and attribution text;
- allowed actions: view, download, store, crop, annotate, adapt, train, fine-tune, redistribute, publish, commercial use (yes/no/conditional);
- restrictions: NC, SA, ND, confidentiality, territory, expiry, user/age limits, retention and deletion;
- consent record and whether private, teacher-reviewed, shared or public;
- derivative asset IDs and the legal basis for each derivative;
- model/data lineage, training run, code commit, evaluation and withdrawal/deletion status.

Never collapse code license, dataset license, model-weight license, API terms and source-material copyright into one field.

## 5. Melo notation data model
For each symbol crop or page region, preserve both the visual and musical interpretation:
- page/system/staff/measure/part/voice IDs;
- bounding box or polygon, staff-line geometry, normalized x/y and staff position;
- visual class (notehead, stem, beam, flag, rest, clef, accidental, key/time signature, barline, articulation, dynamic, ornament, text, etc.);
- semantic interpretation (step, octave, alteration, sounding/written pitch if known, duration, dots, tuplets, ties, voice, instrument);
- context and relationships (notehead-to-stem, beam group, accidental scope, tie, slur, lyric attachment);
- source/provenance/license, annotation author, confidence, reviewer and correction history.

The visual crop is not sufficient by itself: keep its relationship to the complete score context and the MusicXML/MEI representation.

## 6. Separate stores and governance
- Private learner/teacher workspace: private by default; no automatic shared-model training.
- Melo shared training corpus: only material with explicit permission and rights clearance.
- Open research corpus: only items whose license and consent allow public distribution.
- Sponsor-restricted corpus: segregated, access-controlled, expiry-aware; never silently mix into Melo-owned data.
- Model registry: each model points to exact code, data, base weights, license and training run.
- Notation Core remains the common canonical structure across the single MeloLegacy application. Repositories are storage/work spaces, not separate products.

## 7. Exit test — the "return the hen" test
Before a provider, grant or sponsor resource is retired, verify:
1. Melo has exported all data it is entitled to keep in open formats.
2. Independently created datasets, code and models have a clear rights basis.
3. Restricted sponsor materials and prohibited derivatives are deleted or returned as required.
4. The system can switch provider without changing the canonical notation schema.
5. Tests still pass using Melo-owned or otherwise continuing lawful resources.
6. No expired credential, API, dataset, model or grant-only infrastructure remains a hidden runtime dependency.

## 8. Funding acceptance rule
A grant is not automatically beneficial. Score every offer against:
- eligibility and host-organization requirements;
- fit with free, non-commercial education and cultural preservation;
- whether cash/credits/in-kind compute are restricted to a narrow purpose;
- data/model/IP ownership and mandatory open-access or ShareAlike obligations;
- reporting, co-funding, matching funds, tax, ethics, safeguarding and community-consent costs;
- expiry and post-award operating costs;
- whether the funded work creates a lasting Melo capability.

Reject or ring-fence any award whose conditions would force Melo to misrepresent ownership, close off learner access, transfer core IP, or make the platform dependent on paid infrastructure after credits expire.

## 9. Current opportunities reviewed on 2026-11-20
### High-priority / potentially actionable
**AWS Education Equity Initiative**
- Benefit: AWS social-impact credits up to USD 10,000 for eligible organizations, plus targeted technical advising.
- Scope: digital learning solutions for underserved learners globally; strong thematic fit with Melo's free music education mission.
- Eligibility: edtechs, startups, nonprofits, governments and CSR teams; not individuals or individual educator use cases. Applications reviewed on a rolling basis; normally one award.
- Current status: official page presents an application route; no fixed close date stated.
- Decision: highest-priority cloud-credit lead, conditional on applying through a legally eligible organization. Do not create a company or incur fees just to qualify.
- Official: https://aws.amazon.com/about-aws/our-impact/education-equity-initiative/

**Google Cloud Research Credits**
- Benefit: up to USD 5,000 for faculty/postdoctoral/nonprofit-lab researchers; up to USD 1,000 for PhD students. Credits expire after 365 days and are restricted to the described research.
- Vietnam is on the country list. Applicant must be faculty, PhD student or postdoctoral researcher at an accredited academic institution or eligible nonprofit research institution. For-profit institutions are excluded.
- Decision: possible through a genuine eligible university/research-institution researcher and a defined OMR/music-AI research proposal; not directly available to an unaffiliated individual teacher on the information reviewed.
- Official eligibility: https://support.google.com/google-cloud-higher-ed/answer/10324705
- Official award terms: https://support.google.com/google-cloud-higher-ed/answer/10723679

### Conditional near-term opportunity
**Endangered Material Knowledge Programme (EMKP) Legacy Digitisation Grant 2026/27**
- Benefit: up to GBP 20,000, up to one year; applicants may be of any nationality.
- Deadline: 1 December 2026, 12:00 GMT.
- Eligibility: individual affiliated with a host institution able to oversee ethics and funds, or an eligible host/community institution. The collection must be legacy material from completed research and primarily document endangered material knowledge.
- Possible Melo fit only if there is already an at-risk historical collection documenting musical instrument making, performance craft, endangered musical knowledge or related community practices. It is not a general grant to build the MeloLegacy platform or train an OMR engine.
- Crucial rights condition: EMKP outputs are deposited in the British Museum repository and made public under CC BY-NC-SA 4.0; derivative copies/adaptations containing those assets must follow ShareAlike and non-commercial terms. Creator/IP holders retain rights but grant the required license. Community consent and access restrictions for exceptional ethical/cultural cases must be addressed. Therefore ring-fence any EMKP corpus; do not use it as the basis of a closed Melo-owned dataset/model without specific legal review.
- Official call: https://www.emkp.org/digitisation-grants/
- Official guidelines: https://www.emkp.org/wp-content/uploads/2026/09/EMKP-Guidelines_Legacy-2026-2027.pdf

### Future / partnership leads, not open grant applications
**Endangered Archives Programme (British Library)**
- Round 22 closed 6 November 2026; Round 23 expected mid-September 2027.
- Potential fit for endangered pre-mid-20th-century archives located outside Western Europe/North America, including eligible Vietnam-based collections, subject to rights-holder permission and digitization requirements.
- This funds archive preservation, not a general software platform.
- Official: https://eap.bl.uk/applicants

**MEAP / UCLA Library**
- The 2026–27 planning/project/regional preliminary deadline (16 November 2026) has passed.
- A new audiovisual grant round is expected to open around April 2027, with awards up to USD 100,000; verify final call, geographic and institutional eligibility when published.
- Official: https://meap.library.ucla.edu/meap/call-for-applications/

**Hue City digital heritage economy pilot, 2026–2028**
- A city plan announced 19 November 2026 for controlled pilots involving digital heritage assets, digitization, digital products and services, data governance and heritage safeguards.
- This is a policy/pilot pipeline, not an open grant or confirmed award. Potential fit for a later proposal with a local heritage custodian or institution.
- Official summary: https://www.vietnam.vn/en/ung-dung-cong-nghe-so-thuc-day-kinh-te-di-san

**Vietnam Digital Music Center**
- On 13 November 2026, Vietnam Musicians Association and IMG Investment JSC announced sponsorship to establish a national digital music center for collecting, preserving, digitizing and presenting Vietnamese musical heritage.
- This is a potential ecosystem/knowledge-network lead, not a public funding call and not an award to Melo. Any future cooperation would need a written agreement protecting independent Melo expertise, learner data and IP.
- Official government report: https://baochinhphu.vn/bao-ton-so-hoa-luu-tru-cac-tac-pham-tu-lieu-di-san-am-nhac-viet-nam-tren-nen-tang-so-102261113132039969.htm

### Closed / not a current target
- RMIT Vietnam Digital Design & Art Grants 2026: deadline 24 April 2026; closed. Requires Vietnamese nationality, digital-art/design track record and public exhibition.
- Goethe-Institut Vietnam cultural education call 2026: deadline 15 May 2026; closed.
- British Council Digital Heritage Collection call cited in search is from 2024; closed.
- Microsoft for Startups Founders Hub requires a privately held for-profit company and therefore conflicts with Melo's non-commercial operating principle; do not pursue under the current model.
- CLIR digitization grants reviewed require eligible US organizations and US-based project work; not a direct Vietnam application route.

## 10. Priority sequence
1. Build a grant-ready one-page description of Melo's free music-learning impact, learner numbers/target group, work packages and measurable outcomes.
2. Identify whether an existing legal nonprofit/educational institution can be the applicant or host; do not invent a legal entity or misstate affiliation.
3. Prioritize AWS Education Equity credits if an eligible organization can apply.
4. Explore Google Cloud Research Credits only with a genuine eligible faculty/PhD/postdoctoral or nonprofit research-lab applicant.
5. Screen EMKP immediately only if a qualifying endangered legacy collection and host institution already exist before the deadline.
6. Prepare for EAP Round 23 and MEAP AV 2027 only if Melo has or can lawfully partner around a real endangered archive.
7. Track all future offers in a funding register with rights conditions before accepting them.

## 11. Actions not taken
No grant application was submitted. No organization, sponsor or institution was contacted. No account was created, no dataset/model was downloaded, no cloud credits were redeemed, no money was spent, and no source code/runtime was changed. This is a research and governance record only.
