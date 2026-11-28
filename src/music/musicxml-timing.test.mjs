import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveNoteOnsets } from './musicxml-timing.mjs'

test('advances sequential notes by their quarter-note durations', () => {
  assert.deepEqual(resolveNoteOnsets([
    { kind: 'note', duration: 1 },
    { kind: 'note', duration: 0.5 },
    { kind: 'note', duration: 2 },
  ]), [0, 1, 1.5])
})

test('places all chord tones at the base note onset', () => {
  assert.deepEqual(resolveNoteOnsets([
    { kind: 'note', duration: 2 },
    { kind: 'note', duration: 1, chord: true },
    { kind: 'note', duration: 1, chord: true },
    { kind: 'note', duration: 1 },
  ]), [0, 0, 0, 2])
})

test('backs up between piano staves so both hands begin together', () => {
  assert.deepEqual(resolveNoteOnsets([
    { kind: 'note', duration: 4 },
    { kind: 'backup', duration: 4 },
    { kind: 'note', duration: 4 },
  ]), [0, 0])
})

test('respects forward cursor movement between voices', () => {
  assert.deepEqual(resolveNoteOnsets([
    { kind: 'note', duration: 1 },
    { kind: 'forward', duration: 1 },
    { kind: 'note', duration: 1 },
  ]), [0, 2])
})

test('does not allow malformed backup data to create negative onsets', () => {
  assert.deepEqual(resolveNoteOnsets([
    { kind: 'backup', duration: 3 },
    { kind: 'note', duration: 1 },
  ]), [0])
})
