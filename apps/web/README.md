# MeloLegacy PWA – Phòng Soạn Nhạc

This app was migrated from the standalone `Melolegacy-` repository into the unified `Melolegacy-Studio-` repository.

## Local development
```bash
npm ci
npm run dev
```

## Production build
```bash
npm run build
```

The app uses React, TypeScript, Vite and VexFlow. The service worker and web manifest are served from the site root, so deploy this app at the domain root unless the Vite base path and PWA scope are deliberately changed together.

## Current limitations
This is the existing Composer Room browser prototype, not the full product. It currently stores notation locally in the browser. It does not yet include authenticated cloud sync, automated PDF OMR integration, or the full multi-staff editor.
