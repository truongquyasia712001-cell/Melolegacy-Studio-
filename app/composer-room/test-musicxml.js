"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const start = html.indexOf("function toMusicXml()");
const end = html.indexOf('\n$("exportXml").onclick', start);
assert.ok(start >= 0 && end > start, "Could not locate the Composer Room MusicXML exporter");
const functionSource = html.slice(start, end).trim();

const buildMusicXml = new Function("notes", functionSource + "\nreturn toMusicXml;");
const notes = [
  { pitch: "C4", duration: 16 },
  { pitch: "D4", duration: 8 },
  { pitch: "E4", duration: 4 },
  { pitch: "F4", duration: 2 },
  { pitch: "G4", duration: 1 },
];
const xml = buildMusicXml(notes)();
const exportedNotes = [...xml.matchAll(/<note>[\s\S]*?<duration>(\d+)<\/duration>[\s\S]*?<type>([^<]+)<\/type>[\s\S]*?<\/note>/g)];

assert.deepEqual(exportedNotes.map((match) => Number(match[1])), [16, 8, 4, 2, 1]);
assert.deepEqual(exportedNotes.map((match) => match[2]), ["whole", "half", "quarter", "eighth", "16th"]);

const measures = [...xml.matchAll(/<measure number="(\d+)">([\s\S]*?)<\/measure>/g)];
assert.equal(measures.length, 2, "A whole note should fill the first 4/4 measure");
assert.equal([...measures[0][2].matchAll(/<note>/g)].length, 1);
assert.equal([...measures[1][2].matchAll(/<note>/g)].length, 4);

console.log("Composer Room MusicXML duration export: 5 duration mappings and measure boundaries passed.");
