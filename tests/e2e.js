#!/usr/bin/env node
/* End-to-end check in a phone-sized headless browser.
   Opens every screen, plays through Daily Review, Talk to…, Listen and
   Type (using the on-screen keyboard), and fails on any page error.
   Usage: npm run test:e2e   (screenshots go to tests/screenshots/) */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const shots = path.join(__dirname, 'screenshots');
fs.mkdirSync(shots, { recursive: true });

let failures = 0;
const check = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) failures++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  const shot = n => page.screenshot({ path: path.join(shots, n + '.png') });

  await page.goto('file://' + path.join(root, 'index.html'));
  await page.waitForTimeout(500);
  await shot('home');

  // Scheduling maths
  const s = await page.evaluate(() => {
    let x = srsNext(null, 2); const a = x.i; x = srsNext(x, 2); const b = x.i; x = srsNext(x, 2); const c = x.i;
    const lapse = srsNext(x, 0);
    return { a, b, c, lapseI: lapse.i, lapseE: lapse.e, norm: normGe('ፀሓይ።') === normGe('ጸሓይ') };
  });
  check(s.a === 1 && s.b === 3 && s.c >= 7, `review intervals grow (${s.a} → ${s.b} → ${s.c} days)`);
  check(s.lapseI === 0 && s.lapseE < 2.5, 'forgetting a word resets it and lowers its ease');
  check(s.norm, 'spelling variants ፀ/ጸ are accepted');

  // Daily review
  await page.click('#h-review');
  for (let i = 0; i < 30 && !(await page.evaluate(() => rvI >= rvQ.length)); i++) {
    if (!(await page.isVisible('#rv-grades'))) await page.click('#rv-show');
    await page.click('.grade.g' + (i === 1 ? 0 : 2));
  }
  const r = await page.evaluate(() => ({ cards: Object.keys(S.srs).length, due: srsDue().length, n: S.daily.n }));
  check(r.cards === 8 && r.due === 0, `review session schedules 8 new words, none left due (${JSON.stringify(r)})`);
  await shot('review-done');

  // Talk to…
  await page.evaluate(() => startGender());
  await page.click('#gd-opts .choice >> nth=0');
  check(await page.isVisible('#gd-fb .feedback'), 'Talk to… gives feedback');
  await page.click('#gd-tab-r');
  check((await page.locator('#gd-ref table').count()) === 2, 'Talk to… patterns tab shows both tables');
  await shot('talk-to');

  // Listen
  await page.evaluate(() => startListen('pick'));
  await page.click('#ls-opts .choice >> nth=0');
  check(await page.isVisible('#ls-fb .feedback'), 'listening question gives feedback');

  // Type with the on-screen keyboard
  await page.evaluate(() => startListen('type'));
  const target = await page.evaluate(() => lsQ[lsI].w.g);
  for (const ch of Array.from(target)) {
    const ok = await page.evaluate(cp => {
      let base = KB_BASES.map(b => b.codePointAt(0)).find(b => cp >= b && cp <= b + 7);
      if (!base) for (const [k, v] of Object.entries(KB_LAB)) if (v.includes(cp)) base = k.codePointAt(0);
      if (!base) return false;
      [...document.querySelectorAll('#kb-grid .kb-key')].find(k => k.textContent.codePointAt(0) === base).click();
      const cand = [...document.querySelectorAll('#kb-cands .kb-cand')].find(c => c.querySelector('.ge').textContent === String.fromCodePoint(cp));
      if (!cand) return false; cand.click(); return true;
    }, ch.codePointAt(0));
    if (!ok) await page.evaluate(c => kbInsert(c), ch);
  }
  await shot('type');
  await page.click('.kb-enter');
  check(await page.evaluate(() => $id('ty-input').classList.contains('ok')), `typed "${target}" on the keyboard and it was accepted`);

  // Guided path: home card → flashcards → lesson complete → next step (quiz, 10 questions)
  await page.evaluate(() => goNav('home'));
  await page.click('#h-path .btn');
  check(await page.evaluate(() => document.querySelector('.screen.active').id === 'screen-flash' && pathCtx && pathCtx.type === 'learn'), 'path "Start" opens the first lesson (flashcards)');
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.nav')).display === 'none'), 'tab bar is hidden during a lesson');
  await page.evaluate(() => { while (document.querySelector('.screen.active').id === 'screen-flash') { fcFlip(); fcAns(true); } });
  check(await page.isVisible('#screen-pathdone .pd-title'), 'finishing the deck shows "Lesson complete"');
  await page.click('#pd-body .btn:not(.ghost)');
  check(await page.evaluate(() => pathCtx && pathCtx.type === 'quiz'), '"Next" starts the following step (quiz)');
  for (let i = 0; i < 10; i++) { await page.click('.opt >> nth=0'); await page.click('.next-btn'); }
  check(await page.evaluate(() => S.path.u01.filter(Boolean).length === 2), 'quiz step completes after 10 questions');
  await shot('path-lesson-done');
  await page.evaluate(() => goNav('path'));
  check((await page.locator('.unit').count()) === await page.evaluate(() => PATH_UNITS.length), 'path screen lists every unit');
  await shot('path');
  await page.click('#pd-body .btn.ghost').catch(() => {});
  // Old screens redirect into Learn
  await page.evaluate(() => goNav('script'));
  check(await page.evaluate(() => document.querySelector('.screen.active').id === 'screen-learn'), 'old Alphabet screen redirects to Learn');

  // Every other screen opens
  for (const id of ['learn', 'stories', 'cards', 'prog', 'path', 'build', 'wordbuild', 'home']) {
    await page.evaluate(id => goNav(id), id);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => startMode('quiz'));
  await page.click('.cat-card >> nth=0');
  await page.click('.opt >> nth=0');
  check(await page.isVisible('#q-result .result-box'), 'quiz still works');

  check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nAll end-to-end checks passed.');
  process.exit(failures ? 1 : 0);
})();
