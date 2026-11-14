# Melo Legacy — local-first PWA foundation

## What is implemented in this branch

- IndexedDB stores original music files as Blobs and editable MusicXML score documents.
- The Local Music Library screen imports multiple files, lists saved assets, downloads a copy, deletes an asset, and displays browser storage estimates.
- The recognition import flow stores the original file before processing. When the current recognition API returns MusicXML or MIDI, the returned output is stored as another local asset.
- The app requests persistent browser storage when the user chooses that option. A browser may deny the request.
- A web app manifest, SVG identity icon, and production service worker provide the installable PWA shell and cache same-origin app resources after a successful online visit.

## Current limitations — do not treat these as completed features

- `device-local` is a temporary local owner key. It is not an account, authentication boundary, or teacher/student permission system. Users sharing one browser profile currently share this local library.
- IndexedDB is browser-managed storage, not an encrypted vault. Browser/site-data clearing, storage pressure, device loss, and browser policy can remove local data. Keep independent backups of important scores.
- The service worker caches the application shell and same-origin resources; it does not yet make OMR or audio recognition work offline.
- The existing recognition API is still an integration point. An iPad-native in-browser OMR and audio recognition engine has not yet been selected, licensed, bundled, or benchmarked.
- There is no cloud sync, multi-device replication, teacher review workflow, or Melobox adapter in this milestone.

## iPad installation smoke test

1. Deploy the built PWA to an HTTPS origin.
2. Open the origin in Safari on iPad and allow the first online load to finish.
3. Use Share → Add to Home Screen.
4. Launch from the Home Screen, import a small MusicXML/PDF/image/audio file, and confirm it appears in the local library.
5. Close and reopen the PWA; confirm the library entry remains.
6. Download the stored source file and compare it with the original.
7. After the app shell has been cached, enable Airplane Mode and reopen the PWA. Confirm the shell loads. Do not expect OMR/audio recognition to work offline yet.
8. Verify the browser storage estimate and test the persistent-storage request where Safari exposes it.

## Next engineering milestones

1. Replace the temporary owner key with authenticated user/profile IDs and enforce teacher/student authorization in a real data boundary.
2. Add safe export/backup and restore for the local library.
3. Add local score-document browsing, autosave, and recovery in Music Composer.
4. Select an OMR model/runtime with verified licenses; benchmark on real iPad hardware and move inference into a Web Worker.
5. Add handwritten notation capture, teacher verification, and the private/shared training data split.
6. Design an explicit sync protocol with conflict handling and a separate Melobox storage adapter.
