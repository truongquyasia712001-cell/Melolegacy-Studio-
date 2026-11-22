# MeloLegacy Composer Room — first usable slice

This static browser prototype provides:
- Local PDF opening and page-by-page viewing with PDF.js.
- A simple treble-clef, single-line melody editor.
- Note pitch/duration entry, deletion, and basic synthesized playback.
- MusicXML export and MusicXML note import.

## Run locally
Serve this directory over HTTP (for example, `python -m http.server 8080`) and open `/app/composer-room/`. The PDF.js library is loaded from cdnjs, so an internet connection is needed for PDF rendering.

## Important scope boundary
This version does **not** perform optical music recognition (OMR) on the PDF. It does not infer notes from page pixels. It lets a user view a PDF and manually transcribe/edit a basic melody, then export MusicXML. The editor currently supports one monophonic treble-clef line in C major / 4/4; it is not yet a full piano grand-staff score editor. The generated MusicXML can be opened in compatible notation software, but must be checked there.

## Next engineering milestone
Integrate a licensed, reproducible OMR backend (PDF/image → staff geometry → symbol recognition → MusicXML candidates) and route each stage through Melobot's task conveyor. Low-confidence candidates must remain unconfirmed until reviewed.