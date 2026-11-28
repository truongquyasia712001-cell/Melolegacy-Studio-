import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path) => readFile(resolve(root, path), 'utf8')

const [registryText, manifestText, palette, main, styles, packageText] = await Promise.all([
  read('data/notation/smufl-glyphnames.json'),
  read('data/notation/registry-manifest.json'),
  read('src/music/ComposerToolBubbles.tsx'),
  read('src/main.tsx'),
  read('src/App.css'),
  read('package.json'),
])

const registry = JSON.parse(registryText)
const manifest = JSON.parse(manifestText)
const packageJson = JSON.parse(packageText)
const nameByCodepoint = new Map(Object.entries(registry).map(([name, item]) => [item.codepoint, name]))
const entries = [...palette.matchAll(/\['([^']+)'\s*,\s*'(U\+[0-9A-F]+)'\]/g)]
const codepointByLabel = new Map(entries.map(([, label, codepoint]) => [label, codepoint]))

const expectedGlyphs = {
  'Nốt kép (breve)': 'noteDoubleWhole',
  'Nốt tròn': 'noteWhole',
  'Nốt trắng': 'noteHalfUp',
  'Nốt đen': 'noteQuarterUp',
  'Móc đơn': 'note8thUp',
  'Móc kép': 'note16thUp',
  'Móc ba': 'note32ndUp',
  'Móc bốn': 'note64thUp',
  'Móc năm': 'note128thUp',
  'Nốt 1/256': 'note256thUp',
  'Nốt 1/512': 'note512thUp',
  'Nốt 1/1024': 'note1024thUp',
  'Lặng kép (breve)': 'restDoubleWhole',
  'Lặng tròn': 'restWhole',
  'Lặng trắng': 'restHalf',
  'Lặng đen': 'restQuarter',
  'Lặng móc đơn': 'rest8th',
  'Lặng móc kép': 'rest16th',
  'Lặng móc ba': 'rest32nd',
  'Lặng móc bốn': 'rest64th',
  'Lặng móc năm': 'rest128th',
  'Lặng 1/256': 'rest256th',
  'Lặng 1/512': 'rest512th',
  'Lặng 1/1024': 'rest1024th',
  'Thăng': 'accidentalSharp',
  'Giáng': 'accidentalFlat',
  'Bình': 'accidentalNatural',
  'Thăng kép': 'accidentalDoubleSharp',
  'Giáng kép': 'accidentalDoubleFlat',
  'Khóa Sol': 'gClef',
  'Khóa Fa': 'fClef',
  'Khóa Đô': 'cClef',
  'Khóa Sol 8va': 'gClef8va',
  'Khóa Fa 8vb': 'fClef8vb',
  'Chấm dôi': 'augmentationDot',
  'Fermata': 'fermataAbove',
  'Staccato': 'articStaccatoAbove',
  'Tenuto': 'articTenutoAbove',
  'Accent': 'articAccentAbove',
  'Marcato': 'articMarcatoAbove',
  'pp': 'dynamicPP',
  'mp': 'dynamicMP',
  'mf': 'dynamicMF',
  'ff': 'dynamicFF',
  'fp': 'dynamicFortePiano',
  'sfz': 'dynamicSforzando1',
}

assert.equal(manifest.source_standard, 'SMuFL')
assert.equal(manifest.glyph_count, Object.keys(registry).length)
assert.equal(entries.length, Object.keys(expectedGlyphs).length, 'Every visible palette glyph must have an explicit standard mapping.')
assert.equal(codepointByLabel.size, entries.length, 'Palette labels must be unique.')

for (const [label, glyphName] of Object.entries(expectedGlyphs)) {
  const codepoint = codepointByLabel.get(label)
  assert.ok(codepoint, `Missing Composer palette glyph: ${label}`)
  assert.equal(nameByCodepoint.get(codepoint), glyphName, `${label} must use the SMuFL glyph ${glyphName}`)
}

assert.ok(packageJson.dependencies?.['@fontsource/bravura'], 'Bravura must be a bundled runtime dependency.')
assert.match(main, /import\s+['"]@fontsource\/bravura['"]/, 'Bravura must be loaded by the application entry point.')
assert.match(styles, /\.smufl-glyph\s*\{[^}]*font-family:\s*['"]Bravura['"]/s, 'Palette glyphs must use Bravura.')
assert.match(styles, /\.staff-svg[\s\S]*font-family:\s*['"]Bravura['"]/, 'Engraved score glyphs must use Bravura.')
