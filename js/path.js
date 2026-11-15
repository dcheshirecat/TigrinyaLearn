/* ══════════════════════════════════════════════════════════════
   Guided learning path, shared lesson chrome, reward indicator,
   and redirects for screens that were merged into Learn.
   Loaded after app.js and practice.js.
══════════════════════════════════════════════════════════════ */
const PATH_QUIZ_LEN = 10;
const PATH_BUILD_LEN = 5;
let pathCtx = null;   // {ui, si, code, type, arg, count} while a path lesson is running

/* Which screen each step type runs on — leaving it abandons the step. */
const STEP_SCREEN = {learn:'flash', quiz:'quiz', match:'match', listen:'listen', type:'listen', talk:'gender', grammar:'learn', story:'story-reader', convo:'convo', build:'build'};

function pathState(){ S.path = S.path || {}; return S.path; }
function stepIsDone(u, i){ return !!(pathState()[u.id] || [])[i]; }
function unitDoneCount(u){ return u.steps.filter((_, i) => stepIsDone(u, i)).length; }
function unitComplete(u){ return unitDoneCount(u) === u.steps.length; }
function unitUnlocked(ui){
  if (ui === 0) return true;
  const u = PATH_UNITS[ui];
  return unitComplete(PATH_UNITS[ui - 1]) || unitDoneCount(u) > 0 || !!(S.pathJump || {})[u.id];
}
function currentUnitIdx(){
  for (let i = 0; i < PATH_UNITS.length; i++) if (!unitComplete(PATH_UNITS[i]) && unitUnlocked(i)) return i;
  for (let i = 0; i < PATH_UNITS.length; i++) if (!unitComplete(PATH_UNITS[i])) return i;
  return PATH_UNITS.length - 1;
}
function nextStepIdx(u){ const i = u.steps.findIndex((_, j) => !stepIsDone(u, j)); return i < 0 ? 0 : i; }

function stepInfo(code){
  const [type, arg] = code.split(':');
  switch (type){
    case 'learn':  return {ico:'🃏', label:'Learn the words'};
    case 'quiz':   return {ico:'❓', label:'Quiz'};
    case 'listen': return {ico:'🎧', label:'Listen'};
    case 'type':   return {ico:'⌨️', label:'Type it'};
    case 'match':  return {ico:'🔗', label:'Match pairs'};
    case 'talk':   return {ico:'👥', label:'Talk to…'};
    case 'build':  return {ico:'🧩', label:'Build sentences'};
    case 'grammar':return {ico:'📝', label:'Grammar: ' + (GRAMMAR_LESSONS[+arg] || {}).title};
    case 'story':  return {ico:'📖', label:'Story: ' + ((STORIES.find(s => s.id === arg) || {}).title || arg)};
    case 'convo':  return {ico:'💬', label:'Talk: ' + ((CONVOS.find(c => c.id === arg) || {}).title || arg)};
  }
  return {ico:'•', label:code};
}

function startStep(ui, si){
  const u = PATH_UNITS[ui], code = u.steps[si], [type, arg] = code.split(':');
  pathCtx = {ui, si, code, type, arg, count:0};
  cat = u.cat; visitCat(u.cat);
  switch (type){
    case 'learn':  startFlash(u.cat); break;
    case 'quiz':   startQuiz(u.cat); break;
    case 'match':  startMatch(u.cat); break;
    case 'listen': startListen('pick', u.cat); break;
    case 'type':   startListen('type', u.cat); break;
    case 'talk':   startGender(arg.split(',').map(Number)); break;
    case 'build':  goNav('build'); break;
    case 'grammar':openLearnTab('grammar', +arg); break;
    case 'story':  openStory(STORIES.find(s => s.id === arg)); break;
    case 'convo':  openConvo(CONVOS.find(c => c.id === arg)); break;
  }
}
function continuePath(){ const ui = currentUnitIdx(); startStep(ui, nextStepIdx(PATH_UNITS[ui])); }
function exitLesson(fallback){ if (pathCtx){ pathCtx = null; goNav('path'); } else goNav(fallback); }

function pathStepDone(){
  if (!pathCtx) return;
  const {ui, si} = pathCtx, u = PATH_UNITS[ui], st = pathState();
  st[u.id] = st[u.id] || [];
  const first = !st[u.id][si];
  st[u.id][si] = true;
  pathCtx = null;
  const complete = unitComplete(u);
  if (first){ addXP(complete ? 70 : 20); addCoins(complete ? 15 : 5); }
  ensureState(); logActivity(); save(); checkAch();
  showPathDone(ui, si, first, complete);
}

function showPathDone(ui, si, first, complete){
  const u = PATH_UNITS[ui], info = stepInfo(u.steps[si]), done = unitDoneCount(u), n = u.steps.length;
  const nextUi = complete ? Math.min(ui + 1, PATH_UNITS.length - 1) : ui;
  const nu = PATH_UNITS[nextUi], ns = nextStepIdx(nu), ninfo = stepInfo(nu.steps[ns]);
  const allDone = PATH_UNITS.every(unitComplete);
  $id('pd-body').innerHTML =
    '<div class="pd-hero"><div class="pd-ico">' + (complete ? '🏆' : '✅') + '</div>' +
    '<div class="pd-title">' + (complete ? 'Unit complete!' : 'Lesson complete') + '</div>' +
    '<div class="pd-sub">' + info.ico + ' ' + esc(info.label) + '</div>' +
    (first ? '<div class="pd-reward">+' + (complete ? 70 : 20) + ' XP · +' + (complete ? 15 : 5) + ' 🪙</div>' : '<div class="pd-reward muted">Practised again — nice!</div>') + '</div>' +
    '<div class="unit-card"><div class="uc-top"><span class="uc-ico">' + V[u.cat].icon + '</span><div><div class="uc-kicker">Unit ' + (ui + 1) + '</div><div class="uc-title">' + esc(u.title) + '</div></div><span class="uc-count">' + done + '/' + n + '</span></div>' +
    '<div class="seg-bar">' + u.steps.map((_, i) => '<i class="' + (stepIsDone(u, i) ? 'on' : '') + '"></i>').join('') + '</div></div>' +
    (allDone ? '<div class="notice">You have finished every unit. Keep your words fresh with Daily Review!</div>' : '') +
    '<div class="btn-row" style="margin-top:auto">' +
      '<button class="btn ghost" onclick="goNav(\'path\')">Path</button>' +
      (allDone ? '<button class="btn" onclick="startReview()">Daily Review</button>'
               : '<button class="btn" onclick="startStep(' + nextUi + ',' + ns + ')">' + (complete ? 'Start Unit ' + (nextUi + 1) : 'Next: ' + esc(ninfo.label)) + ' →</button>') +
    '</div>';
  goNav('pathdone');
}

/* ── Path screen ── */
function renderPath(){
  const cur = currentUnitIdx();
  const total = PATH_UNITS.reduce((a, u) => a + u.steps.length, 0);
  const doneAll = PATH_UNITS.reduce((a, u) => a + unitDoneCount(u), 0);
  $id('path-summary').innerHTML = '<span>' + doneAll + ' of ' + total + ' lessons</span><div class="ex-bar"><div style="width:' + (doneAll / total * 100) + '%"></div></div>';
  $id('path-list').innerHTML = PATH_UNITS.map((u, ui) => {
    const unlocked = unitUnlocked(ui), complete = unitComplete(u), open = ui === cur, d = V[u.cat];
    const steps = u.steps.map((code, si) => {
      const inf = stepInfo(code), done = stepIsDone(u, si), next = unlocked && !done && si === nextStepIdx(u);
      return '<button class="step' + (done ? ' done' : '') + (next ? ' next' : '') + '" ' + (unlocked ? 'onclick="startStep(' + ui + ',' + si + ')"' : 'disabled') + '>' +
        '<span class="step-ico">' + (done ? '✓' : inf.ico) + '</span><span class="step-lbl">' + esc(inf.label) + '</span>' + (next ? '<span class="step-go">Start</span>' : '') + '</button>';
    }).join('');
    return '<div class="unit' + (complete ? ' complete' : '') + (unlocked ? '' : ' locked') + (open ? ' open' : '') + '" id="unit-' + ui + '">' +
      '<button class="unit-head" onclick="toggleUnit(' + ui + ')"><span class="unit-node">' + (complete ? '✓' : unlocked ? d.icon : '🔒') + '</span>' +
      '<span class="unit-txt"><span class="uc-kicker">Unit ' + (ui + 1) + ' · <span class="ge">' + esc(d.ge) + '</span></span><span class="uc-title">' + esc(u.title) + '</span></span>' +
      '<span class="uc-count">' + unitDoneCount(u) + '/' + u.steps.length + '</span></button>' +
      '<div class="unit-body">' + (unlocked ? steps : '<div class="notice">Finish Unit ' + ui + ' to unlock — or <a href="#" onclick="jumpTo(' + ui + ');return false">jump ahead</a> if you already know this.</div>') + '</div></div>';
  }).join('');
  requestAnimationFrame(() => { const el = $id('unit-' + cur); if (el) el.scrollIntoView({block:'center'}); });
}
function toggleUnit(ui){ $id('unit-' + ui).classList.toggle('open'); }
function jumpTo(ui){ S.pathJump = S.pathJump || {}; S.pathJump[PATH_UNITS[ui].id] = true; save(); renderPath(); $id('unit-' + ui).classList.add('open'); }

/* ── Home: "Continue learning" card ── */
function renderHomePath(){
  const box = $id('h-path'); if (!box) return;
  const ui = currentUnitIdx(), u = PATH_UNITS[ui], si = nextStepIdx(u), inf = stepInfo(u.steps[si]), d = V[u.cat];
  const allDone = PATH_UNITS.every(unitComplete);
  box.innerHTML =
    '<div class="uc-top" onclick="goNav(\'path\')"><span class="uc-ico">' + d.icon + '</span><div style="flex:1;min-width:0"><div class="uc-kicker">Unit ' + (ui + 1) + ' of ' + PATH_UNITS.length + ' · <span class="ge">' + esc(d.ge) + '</span></div><div class="uc-title">' + esc(u.title) + '</div></div><span class="uc-link">All units ›</span></div>' +
    '<div class="seg-bar">' + u.steps.map((_, i) => '<i class="' + (stepIsDone(u, i) ? 'on' : i === si ? 'cur' : '') + '"></i>').join('') + '</div>' +
    (allDone ? '<button class="btn" onclick="goNav(\'path\')">Review the path</button>'
             : '<button class="btn" onclick="continuePath()"><span style="opacity:0.85">' + inf.ico + '</span> ' + (unitDoneCount(u) ? 'Continue' : 'Start') + ': ' + esc(inf.label) + '</button>');
}

/* ── Opening Learn on a specific tab (replaces the old Alphabet / Grammar screens) ── */
function openLearnTab(tab, lesson){
  if (tab === 'grammar' && lesson != null) learnGrammarTab2 = lesson;
  _pathGoNav('learn');
  switchLearnTab(tab);
  if (tab === 'grammar'){
    document.querySelectorAll('#grammar-tabs2 button').forEach((b, i) => { if (i === learnGrammarTab2) b.click(); });
  }
}

/* ── Step completion hooks into the existing games ── */
const _pathNextQ = nextQ;
nextQ = function(){ if (pathCtx && pathCtx.type === 'quiz' && qIdx + 1 >= PATH_QUIZ_LEN){ pathStepDone(); return; } _pathNextQ(); };

const _pathTapMatch = tapMatch;
tapMatch = function(i){
  _pathTapMatch(i);
  const bar = document.querySelector('#screen-match .hdr-bar'); if (bar) bar.style.width = (mFound / 4 * 100) + '%';
  if (mFound === 4 && pathCtx && pathCtx.type === 'match' && !pathCtx.count){ pathCtx.count = 1; setTimeout(pathStepDone, 900); }
};

const _pathBdCheck = bdCheck;
bdCheck = function(){ const before = S.sbCorrect || 0; _pathBdCheck(); if (pathCtx && pathCtx.type === 'build' && (S.sbCorrect || 0) > before) pathCtx.count++; };
const _pathBdNext = bdNext;
bdNext = function(){ if (pathCtx && pathCtx.type === 'build' && pathCtx.count >= PATH_BUILD_LEN){ pathStepDone(); return; } _pathBdNext(); };

const _pathRenderLearnGrammar = renderLearnGrammar;
renderLearnGrammar = function(idx){
  _pathRenderLearnGrammar(idx);
  if (pathCtx && pathCtx.type === 'grammar' && +pathCtx.arg === idx){
    const c = $id('grammar-content2');
    c.insertAdjacentHTML('beforeend', '<div style="margin:0 1rem 1rem"><button class="btn ok" onclick="pathStepDone()">✓ I\'ve read this lesson</button></div>');
  }
};

const _pathOpenStory = openStory;
openStory = function(story){
  _pathOpenStory(story);
  if (pathCtx && pathCtx.type === 'story')
    $id('story-content').insertAdjacentHTML('beforeend', '<button class="btn ok" style="margin-top:0.5rem" onclick="pathStepDone()">✓ Finish story</button>');
};

const _pathShowConvoDone = showConvoDone;
showConvoDone = function(){
  _pathShowConvoDone();
  if (pathCtx && pathCtx.type === 'convo'){
    const btn = [...document.querySelectorAll('#cv-choices button')].pop();
    if (btn){ btn.textContent = 'Continue →'; btn.className = 'btn'; btn.style.cssText = ''; btn.onclick = pathStepDone; }
  }
};

/* ── Navigation: redirects, path screens, abandoning a step ── */
const _pathGoNav = goNav;
goNav = function(id){
  if (id === 'script') return openLearnTab('script');
  if (id === 'grammar') return openLearnTab('grammar');
  if (pathCtx && id !== STEP_SCREEN[pathCtx.type] && id !== 'pathdone') pathCtx = null;
  _pathGoNav(id);
  if (id === 'path') renderPath();
};

/* ── Lesson chrome: hide the tab bar during lessons, drive header progress bars ── */
const LESSON_SCREENS = new Set(['flash','quiz','match','search','build','wordbuild','review','gender','listen','story-reader','convo','pathdone']);
function syncChrome(){
  const act = document.querySelector('.screen.active');
  document.body.classList.toggle('in-lesson', !!act && LESSON_SCREENS.has(act.id.replace('screen-', '')));
}
new MutationObserver(syncChrome).observe(document.body, {subtree:true, attributes:true, attributeFilter:['class']});
document.querySelectorAll('.ex-hdr .ex-count').forEach(el => {
  const bar = el.parentElement.querySelector('.hdr-bar'); if (!bar) return;
  const upd = () => { const m = el.textContent.match(/(\d+)\s*\/\s*(\d+)/); if (m) bar.style.width = Math.min(100, (+m[1] - (el.dataset.done ? 0 : 1)) / +m[2] * 100) + '%'; };
  new MutationObserver(upd).observe(el, {childList:true, characterData:true, subtree:true}); upd();
});

/* ── One combined reward indicator instead of floating "+XP" text ── */
let rewardAcc = {xp:0, coin:0}, rewardT = null;
showPop = function(txt, x, y, cls){
  const n = parseInt(String(txt).replace(/[^\d]/g, ''), 10) || 0;
  if (cls === 'coin-pop') rewardAcc.coin += n; else rewardAcc.xp += n;
  clearTimeout(rewardT); rewardT = setTimeout(flushReward, 40);
};
function flushReward(){
  const el = $id('reward'); if (!el) return;
  el.innerHTML = (rewardAcc.xp ? '<b>+' + rewardAcc.xp + ' XP</b>' : '') + (rewardAcc.coin ? '<span>+' + rewardAcc.coin + ' 🪙</span>' : '');
  rewardAcc = {xp:0, coin:0};
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1300);
}

/* ── Home dashboard now includes the path card ── */
const _pathUpdateHome = updateHome;
updateHome = function(){ _pathUpdateHome(); renderHomePath(); };
