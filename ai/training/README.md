# MeloLegacy AI training bootstrap

This branch adds the first reproducible training notebook for the PDF/printed-score pipeline.

## First milestone
Train a compact staff-line segmentation baseline in Google Colab. The notebook currently uses generated synthetic staff images so the training code can be exercised immediately without redistributing third-party data.

**Important:** this is not yet a trained production OMR model, and synthetic validation scores do not demonstrate performance on real sheet music.

## Run
1. Open [the Colab notebook](https://colab.research.google.com/github/truongquyasia712001-cell/Melolegacy-Studio-/blob/ai-training-bootstrap/ai/training/staffline_baseline_colab.ipynb).
2. In Colab, choose Runtime → Change runtime type → T4 GPU if available.
3. Run all cells.
4. Download the generated `staffline-segmentation-baseline.pt` checkpoint.

## Real-data follow-up
MUSCIMA++ v2 provides 91,255 annotated handwritten notation objects and MuNG relationships. Its license is CC BY-NC-SA 4.0, so use is restricted to compatible non-commercial/share-alike purposes and required attribution. The corresponding CVC-MUSCIMA page images are distributed separately; the MUSCIMA++ maintainers explain how to obtain them. Do not assume the annotations alone are image data.

- MUSCIMA++: https://github.com/OMR-Research/muscima-pp
- Download and license: https://ufal.mff.cuni.cz/muscima
- CVC-MUSCIMA: https://pages.cvc.uab.es/cvcmuscima/index_database.html

## Planned sequence
1. Staff geometry and line segmentation.
2. Symbol detection/classification.
3. Note position + clef + key/accidental interpretation.
4. Duration, rests, beams, dots and ties.
5. Dynamics, tempo, meter and expression marks.
6. Validation and MusicXML export.
7. Separate Apple Pencil handwriting collection and fine-tuning.

Keep printed-score OMR and personal handwriting recognition as separate data pipelines, then connect them through the shared notation model.
