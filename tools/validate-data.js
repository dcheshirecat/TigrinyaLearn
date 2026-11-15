#!/usr/bin/env node
/* Checks the content files in js/data/ for mistakes that are easy to make
   by hand: wrong punctuation characters, broken fidel rows, sentence
   exercises whose word bank doesn't match the answer, and so on.
   Usage: node tools/validate-data.js        (exit code 1 on any error) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dataFiles = [...html.matchAll(/<script src="(js\/data\/[^"]+)"><\/script>/g)].map(m => m[1]);

const ctx = vm.createContext({ console });
for (const f of dataFiles) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const D = vm.runInContext('({V,CATS,FIDEL,ALL_CARDS,PACKS,GRAMMAR_LESSONS,SB_EXERCISES,BD_EXERCISES,WB_WORDS,ACHS,STORIES,CONVOS,CULTURE_TOPICS,DIALECT_NOTES,GENDER_DRILLS,PATH_UNITS})', ctx);

const errors = [], warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

/* 1. No look-alike punctuation (Tibetan shad ། was once used for Ethiopic ።) */
for (const f of dataFiles) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  if (src.includes('།')) err(f, 'contains Tibetan shad "།" (U+0F0D) — use Ethiopic full stop "።" (U+1362)');
}

/* 2. Vocabulary */
const ETHIOPIC = /^[ሀ-፿\s።፣፤፥፦፧?!.…\-]+$/;
for (const c of D.CATS) {
  const seen = new Set();
  D.V[c].words.forEach((w, i) => {
    const at = `V.${c}[${i}] ${w.g || ''}`;
    for (const k of ['g', 't', 'e']) if (!w[k]) err(at, `missing "${k}"`);
    if (w.g && !ETHIOPIC.test(w.g.replace(/\.\.\./g, ''))) err(at, 'Tigrinya field "g" contains non-Ethiopic characters');
    if (seen.has(w.g)) err(at, 'duplicate word in this category');
    seen.add(w.g);
  });
}

/* 3. Fidel: 7 forms per family, consecutive code points (Unicode order = vowel order) */
D.FIDEL.forEach((f, i) => {
  const at = `FIDEL[${i}] ${f.name}`;
  if (!f.forms || f.forms.length !== 7) return err(at, 'needs exactly 7 forms');
  const base = f.forms[0].codePointAt(0);
  f.forms.forEach((ch, j) => { if (ch.codePointAt(0) !== base + j) err(at, `form ${j + 1} "${ch}" is out of order`); });
});
const famBases = new Set(D.FIDEL.map(f => f.forms[0]));
if (famBases.size !== D.FIDEL.length) err('FIDEL', 'duplicate family');

/* 4. Sentence exercises: bank and answer hold the same pieces */
const sameBag = (a, b) => [...a].sort().join('|') === [...b].sort().join('|');
D.SB_EXERCISES.forEach((e, i) => { if (!sameBag(e.words, e.answer)) err(`SB_EXERCISES[${i}] "${e.eng}"`, 'word bank ≠ answer pieces'); });
D.BD_EXERCISES.forEach((e, i) => {
  const at = `BD_EXERCISES[${i}] "${e.eng}"`;
  if (!sameBag(e.words, e.answer)) err(at, 'word bank ≠ answer pieces');
  const joined = e.answer.join(' ').replace(/ ([።?!])/g, '$1');
  if (joined !== e.tigrinya) err(at, `answer "${joined}" ≠ sentence "${e.tigrinya}"`);
});

/* 5. Cards */
const ids = new Set();
D.ALL_CARDS.forEach(c => { if (ids.has(c.id)) err(`ALL_CARDS ${c.id}`, 'duplicate id'); ids.add(c.id); });
D.PACKS.forEach(p => { if (p.draw && !p.draw(0).length) err(`PACKS ${p.id}`, 'draw() returns no cards'); });

/* 6. Conversations: exactly one correct choice per turn */
D.CONVOS.forEach(cv => cv.turns.forEach((t, i) => {
  const n = t.choices.filter(c => c.correct).length;
  if (n !== 1) err(`CONVOS ${cv.id} turn ${i + 1}`, `${n} correct choices (need 1)`);
}));

/* 7. Gender drills: three forms, each [script, transliteration], all different */
D.GENDER_DRILLS.forEach((d, i) => {
  const at = `GENDER_DRILLS[${i}] "${d.en}"`;
  for (const k of ['m', 'f', 'p']) if (!Array.isArray(d[k]) || d[k].length !== 2 || !d[k][0]) err(at, `form "${k}" must be [ge'ez, transliteration]`);
  if (new Set([d.m[0], d.f[0], d.p[0]]).size !== 3) warn(at, 'two forms are identical — the quiz cannot tell them apart');
});

/* 8. Learning path: every step points at something that exists */
const unitIds = new Set();
D.PATH_UNITS.forEach((u, ui) => {
  const at = `PATH_UNITS[${ui}] ${u.title}`;
  if (unitIds.has(u.id)) err(at, 'duplicate unit id'); unitIds.add(u.id);
  if (!D.V[u.cat]) return err(at, `unknown category "${u.cat}"`);
  u.steps.forEach(code => {
    const [type, arg] = code.split(':');
    const ok = {
      learn: () => true, quiz: () => true, match: () => D.V[u.cat].words.length >= 4, listen: () => true, build: () => true,
      type: () => D.V[u.cat].words.filter(w => !w.g.includes('...')).length >= 5,
      talk: () => arg.split(',').every(i => D.GENDER_DRILLS[+i]),
      grammar: () => !!D.GRAMMAR_LESSONS[+arg],
      story: () => D.STORIES.some(s => s.id === arg),
      convo: () => D.CONVOS.some(c => c.id === arg),
    }[type];
    if (!ok) err(at, `unknown step type "${code}"`);
    else if (!ok()) err(at, `step "${code}" points at missing content`);
  });
});

/* 9. Achievements */
const achIds = new Set();
D.ACHS.forEach(a => { if (achIds.has(a.id)) err(`ACHS ${a.id}`, 'duplicate id'); achIds.add(a.id); });

const words = D.CATS.reduce((n, c) => n + D.V[c].words.length, 0);
console.log(`Checked ${dataFiles.length} data files · ${words} words · ${D.FIDEL.length} fidel families · ${D.BD_EXERCISES.length + D.SB_EXERCISES.length} sentence exercises · ${D.GENDER_DRILLS.length} drills · ${D.PATH_UNITS.length} path units`);
warnings.forEach(w => console.log('  warn  ' + w));
errors.forEach(e => console.log('  ERROR ' + e));
if (errors.length) { console.log(`\n${errors.length} error(s)`); process.exit(1); }
console.log('All content checks passed.');
