/* ══════════════════════════════════════════════════════════════
   REVAMP — spaced repetition, daily goal, "Talk to…" drills,
   listening, typing and the on-screen Tigrinya keyboard
══════════════════════════════════════════════════════════════ */
function $id(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function todayN(){const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);}

/* ── State additions (merged into older saves) ── */
function ensureState(){
  S.srs=S.srs||{};S.newPerDay=S.newPerDay||8;S.goal=S.goal||20;
  S.daily=S.daily||{d:0,n:0,newN:0};S.dayStreak=S.dayStreak||0;S.lastDay=S.lastDay||0;
  S.gdCorrect=S.gdCorrect||0;S.lsCorrect=S.lsCorrect||0;S.tyCorrect=S.tyCorrect||0;S.reviews=S.reviews||0;
  if(S.daily.d!==todayN())S.daily={d:todayN(),n:0,newN:0};
}
function currentDayStreak(){ensureState();return S.lastDay>=todayN()-1?S.dayStreak:0;}
function logActivity(){
  ensureState();const t=todayN();
  if(S.lastDay!==t){S.dayStreak=(S.lastDay===t-1)?S.dayStreak+1:1;S.lastDay=t;}
  S.daily.n++;
  if(S.daily.n===S.goal)setTimeout(()=>toast('🎯 Daily goal reached! See you tomorrow.'),350);
  save();checkAch();
}

/* ── Spaced repetition (SM-2 style) ──
   Each word gets {i: interval in days, e: ease, d: due day, r: successful reps, l: lapses}.
   Grades: 0 again · 1 hard · 2 good · 3 easy. */
function srsKey(c,w){return c+'|'+w.g;}
function srsNext(prev,g){
  const x=Object.assign({i:0,e:2.5,d:0,r:0,l:0},prev||{});const t=todayN();
  if(g===0){x.l++;x.r=0;x.i=0;x.e=Math.max(1.3,x.e-0.2);x.d=t;return x;}
  x.r++;
  if(x.r===1)x.i=[0,1,1,3][g];
  else if(x.r===2)x.i=[0,2,3,6][g];
  else x.i=Math.max(x.i+1,Math.round(x.i*[0,1.2,x.e,x.e*1.3][g]));
  x.e=Math.max(1.3,x.e+[0,-0.15,0,0.15][g]);x.d=t+x.i;return x;
}
function srsGrade(c,w,g){
  ensureState();const k=srsKey(c,w),isNew=!S.srs[k];
  S.srs[k]=srsNext(S.srs[k],g);if(isNew)S.daily.newN++;save();
}
/* Called from the games: only schedules when the word is new or due,
   so replaying a quiz can't inflate intervals; a wrong answer always counts. */
function srsTouch(c,w,ok){
  ensureState();const x=S.srs[srsKey(c,w)];
  if(!x||x.d<=todayN()||!ok)srsGrade(c,w,ok?2:0);
  logActivity();
}
function fmtIvl(d){return d<=0?'now':d===1?'1 day':d<30?d+' days':d<365?Math.round(d/30)+' mo':(d/365).toFixed(1)+' yr';}
function allWords(){const out=[];CATS.forEach(c=>V[c].words.forEach(w=>out.push({c,w})));return out;}
function srsDue(){ensureState();const t=todayN();return allWords().filter(({c,w})=>{const x=S.srs[srsKey(c,w)];return x&&x.d<=t;});}
function srsNewAvailable(){ensureState();return Math.max(0,S.newPerDay-S.daily.newN);}
function srsNew(){const lim=srsNewAvailable();return allWords().filter(({c,w})=>!S.srs[srsKey(c,w)]).slice(0,lim);}
function srsStats(){
  ensureState();let learning=0,young=0,mature=0;
  allWords().forEach(({c,w})=>{const x=S.srs[srsKey(c,w)];if(!x)return;if(x.i<1)learning++;else if(x.i<21)young++;else mature++;});
  return{learning,young,mature,total:learning+young+mature,all:allWords().length};
}

/* ── Daily Review screen ── */
let rvQ=[],rvI=0,rvN=0;
function startReview(){
  ensureState();
  const due=shuf(srsDue()),nw=srsNew().map(x=>Object.assign({},x,{isNew:true}));
  rvQ=[...due,...nw];
  if(!rvQ.length){toast('✅ All caught up! New words unlock again tomorrow.');return;}
  rvI=0;rvN=0;goNav('review');showRv();
}
function showRv(){
  if(rvI>=rvQ.length){finishRv();return;}
  const it=rvQ[rvI],w=it.w,x=S.srs[srsKey(it.c,w)];currentWord=w;
  it.reverse=!!(x&&x.r>=2&&Math.random()<0.4);
  $id('rv-prog').textContent=(rvI+1)+' / '+rvQ.length;
  $id('rv-bar').style.width=(rvI/rvQ.length*100)+'%';
  const tag=$id('rv-tag');tag.className='ex-tag'+(it.isNew?' new':'');
  tag.textContent=it.isNew?'New word · '+V[it.c].label:it.reverse?'Say it in Tigrinya':'What does it mean?';
  $id('rv-front').innerHTML=it.reverse?'<div class="big-en">'+esc(w.e)+'</div>':'<div class="big-ge">'+esc(w.g)+'</div>';
  $id('rv-back').hidden=true;$id('rv-grades').hidden=true;$id('rv-show').hidden=false;
  $id('rv-listen').hidden=it.reverse;
  if(!it.reverse)speak(w.g,w.t);
}
function rvSpeak(){const it=rvQ[rvI];if(it){S.ttsCount=(S.ttsCount||0)+1;speak(it.w.g,it.w.t);}}
function rvReveal(){
  const it=rvQ[rvI];if(!it)return;const w=it.w;
  $id('rv-back').innerHTML=(it.reverse?'<div class="big-ge">'+esc(w.g)+'</div>':'<div class="big-en">'+esc(w.e)+'</div>')+
    '<div class="ex-tr">'+esc(w.t)+(w.p?' · '+esc(w.p):'')+'</div>'+(w.n?'<div class="ex-note">'+esc(w.n)+'</div>':'');
  $id('rv-back').hidden=false;$id('rv-show').hidden=true;
  const x=S.srs[srsKey(it.c,w)];
  $id('rv-grades').querySelectorAll('[data-g]').forEach(b=>{const g=+b.dataset.g;b.querySelector('small').textContent=fmtIvl(srsNext(x,g).d-todayN());});
  $id('rv-grades').hidden=false;$id('rv-listen').hidden=false;
  if(it.reverse)speak(w.g,w.t);
}
function rvGrade(g){
  const it=rvQ[rvI];if(!it||$id('rv-grades').hidden)return;
  srsGrade(it.c,it.w,g);S.reviews++;rvN++;logActivity();
  if(g===0)rvQ.splice(Math.min(rvQ.length,rvI+4),0,{c:it.c,w:it.w});
  else{markWord(it.c,it.w);S.cor++;S.tot++;addXP(g>=2?6:4);}
  save();rvI++;showRv();
}
function finishRv(){
  $id('rv-bar').style.width='100%';
  const st=srsStats();
  $id('rv-body').dataset.done='1';
  $id('rv-front').innerHTML='<div class="done-card"><div class="done-ico">🎉</div><div class="done-title">Review complete</div><div class="done-sub">'+rvN+' answers · '+st.total+' of '+st.all+' words in your deck.<br>Come back tomorrow — the schedule keeps each word just before you would forget it.</div></div>';
  $id('rv-back').hidden=true;$id('rv-grades').hidden=true;
  $id('rv-show').hidden=false;$id('rv-show').textContent='Back to home';$id('rv-show').onclick=()=>{$id('rv-show').textContent='Show answer';$id('rv-show').onclick=rvReveal;goNav('home');};
  $id('rv-tag').textContent='Done';
}

let gdQ=[],gdI=0,gdDone=false,gdRight=0;
function startGender(subset){
  const pool=Array.isArray(subset)&&subset.length?subset.map(i=>GENDER_DRILLS[i]).filter(Boolean):GENDER_DRILLS;
  const n=Array.isArray(subset)?Math.min(10,Math.max(6,pool.length)):12;
  const qs=[];while(qs.length<n)shuf([...pool]).forEach(d=>{if(qs.length<n)qs.push({d,who:['m','f','p'][Math.floor(Math.random()*3)]});});
  gdQ=qs;gdI=0;gdRight=0;gdTab('p');goNav('gender');showGd();
}
function gdTab(t){
  $id('gd-tab-p').classList.toggle('on',t==='p');$id('gd-tab-r').classList.toggle('on',t==='r');
  $id('gd-practice').style.display=t==='p'?'flex':'none';$id('gd-ref').style.display=t==='r'?'flex':'none';
  if(t==='r')renderGdRef();
}
function showGd(){
  gdDone=false;
  $id('gd-prog').textContent=Math.min(gdI+1,gdQ.length)+' / '+gdQ.length;
  $id('gd-bar').style.width=(gdI/gdQ.length*100)+'%';
  const box=$id('gd-practice');
  if(gdI>=gdQ.length){
    if(typeof pathCtx!=='undefined'&&pathCtx&&pathCtx.type==='talk'){pathStepDone();return;}
    $id('gd-bar').style.width='100%';
    box.innerHTML='<div class="done-card"><div class="done-ico">'+(gdRight>=gdQ.length-2?'🌟':'💪')+'</div><div class="done-title">'+gdRight+' / '+gdQ.length+' correct</div><div class="done-sub">Tigrinya changes the ending depending on who you talk to. Check the <b>Patterns</b> tab to see them side by side.</div><div class="btn-row"><button class="btn ghost" onclick="gdTab(\'r\')">See patterns</button><button class="btn" onclick="startGender()">Play again</button></div></div>';
    return;
  }
  const {d,who}=gdQ[gdI],lbl=WHO[d.k][who];
  const opts=shuf(['m','f','p']);
  box.innerHTML='<span class="ex-tag">'+(d.k==='you'?'Who are you talking to?':'Who is it about?')+'</span>'+
    '<div class="ex-card"><div class="ex-prompt">Say it '+(d.k==='you'?'':'about ')+'…</div><div class="big-en" style="margin-top:0.35rem">'+esc(d.en)+'</div><div class="who"><span>'+lbl[0]+'</span>'+esc(lbl[1])+'</div></div>'+
    '<div id="gd-opts" style="display:flex;flex-direction:column;gap:0.5rem">'+opts.map(o=>'<button class="choice" data-o="'+o+'" onclick="ansGd(\''+o+'\',event)"><span class="c-ge">'+esc(d[o][0])+'</span><span class="c-sub">'+esc(d[o][1])+'</span></button>').join('')+'</div><div id="gd-fb"></div>';
}
function ansGd(o,ev){
  if(gdDone)return;gdDone=true;
  const {d,who}=gdQ[gdI],ok=o===who;
  document.querySelectorAll('#gd-opts .choice').forEach(b=>{b.disabled=true;if(b.dataset.o===who)b.classList.add('c');else if(b.dataset.o===o)b.classList.add('w');});
  if(ok){gdRight++;S.gdCorrect++;addXP(8,ev&&ev.clientX,ev&&ev.clientY);addCoins(2);}
  logActivity();speak(d[who][0],d[who][1]);
  const L=WHO[d.k];
  $id('gd-fb').innerHTML='<div class="feedback '+(ok?'good':'bad')+'"><b>'+(ok?'✓ Correct!':'✗ Not quite')+'</b>'+
    ['m','f','p'].map(k=>L[k][0]+' <span class="ge" style="font-size:1.05rem">'+esc(d[k][0])+'</span> <span style="color:var(--smoke)">'+esc(L[k][1])+'</span>').join('<br>')+
    '</div><button class="btn" style="margin-top:0.6rem" onclick="gdI++;showGd()">Continue</button>';
}
function renderGdRef(){
  const tbl=k=>'<table class="pt"><tr><th></th>'+['m','f','p'].map(x=>'<th>'+WHO[k][x][0]+' '+esc(WHO[k][x][1])+'</th>').join('')+'</tr>'+
    GENDER_DRILLS.filter(d=>d.k===k).map(d=>'<tr><td style="color:var(--smoke);font-size:0.74rem">'+esc(d.en)+'</td>'+['m','f','p'].map(x=>'<td class="ge">'+esc(d[x][0])+'<span class="tr">'+esc(d[x][1])+'</span></td>').join('')+'</tr>').join('')+'</table>';
  $id('gd-ref').innerHTML=
    '<div class="pt-wrap"><div class="pt-title">Talking to someone</div><div class="pt-tip">"You/your" endings: <span class="hl">-ka / -kha</span> (man) · <span class="hl">-ki / -khi</span> (woman) · <span class="hl">-kum / -khum</span> (group). Commands end in nothing / <span class="hl">-i</span> / <span class="hl">-u</span>. The plural is also used to address elders politely.</div><div style="overflow-x:auto">'+tbl('you')+'</div></div>'+
    '<div class="pt-wrap"><div class="pt-title">Talking about someone</div><div class="pt-tip">"To be": <span class="hl">እዩ</span> he · <span class="hl">እያ</span> she · <span class="hl">እዮም</span> they. Present verbs: <span class="hl">ይ-</span> he · <span class="hl">ት-</span> she · <span class="hl">ይ-…-ኡ</span> they.</div><div style="overflow-x:auto">'+tbl('3rd')+'</div></div>';
}

/* ── Listening & typing ── */
let lsQ=[],lsI=0,lsMode='pick',lsDone=false,lsRight=0,lsHint=false;
function ttsMode(){
  if(!('speechSynthesis' in window))return'none';
  const v=window.speechSynthesis.getVoices();
  if(v.some(x=>x.lang&&x.lang.startsWith('ti')))return'ti';
  if(v.some(x=>x.lang&&x.lang.startsWith('am')))return'am';
  return'approx';
}
function ttsNotice(){
  const m=ttsMode();
  if(m==='ti')return'';
  if(m==='am')return'<div class="notice">🔈 Using an Amharic voice — close, but sounds like ቐ, ኸ and ዐ are not exact.</div>';
  if(m==='none')return'<div class="notice">🔇 This device has no text-to-speech. Use the transliteration hint instead.</div>';
  return'<div class="notice">🔈 No Tigrinya voice on this device, so audio is an English-based approximation. Use the hint if a word is unclear.</div>';
}
function lsPool(type,onlyCat){
  let pool=allWords().filter(({w})=>!w.g.includes('...')&&!w.g.includes('/'));
  if(onlyCat){const inCat=pool.filter(({c})=>c===onlyCat);const short=inCat.filter(({w})=>w.g.replace(/[።?!]/g,'').length<=9);return type&&short.length>=5?short:inCat;}
  if(type)pool=pool.filter(({w})=>w.g.replace(/[።?!]/g,'').length<=9);
  const seen=pool.filter(({c,w})=>S.srs&&S.srs[srsKey(c,w)]);
  return seen.length>=10?seen:pool.filter(({c})=>['greetings','numbers','food','family','colors','animals','body','nature','time','places'].includes(c));
}
function startListen(mode,onlyCat){
  ensureState();lsMode=mode;lsQ=shuf(lsPool(mode==='type',onlyCat)).slice(0,10);lsI=0;lsRight=0;
  goNav('listen');showLs();
}
function lsExit(){kbHide();exitLesson('home');}
function lsSpeak(rate){const it=lsQ[lsI];if(it){S.ttsCount=(S.ttsCount||0)+1;speak(it.w.g,it.w.t,rate);}}
function showLs(){
  lsDone=false;lsHint=false;
  $id('ls-prog').textContent=Math.min(lsI+1,lsQ.length)+' / '+lsQ.length;
  $id('ls-bar').style.width=(lsI/lsQ.length*100)+'%';
  const body=$id('ls-body');
  if(lsI>=lsQ.length){
    kbHide();$id('ls-bar').style.width='100%';
    if(typeof pathCtx!=='undefined'&&pathCtx&&(pathCtx.type==='listen'||pathCtx.type==='type')){pathStepDone();return;}
    body.innerHTML='<div class="done-card"><div class="done-ico">'+(lsRight>=8?'🌟':'👂')+'</div><div class="done-title">'+lsRight+' / '+lsQ.length+' correct</div><div class="done-sub">'+(lsMode==='type'?'Typing in fidel is the fastest way to learn the script.':'Every answer also feeds your Daily Review schedule.')+'</div><div class="btn-row"><button class="btn ghost" onclick="lsExit()">Home</button><button class="btn" onclick="startListen(lsMode)">Again</button></div></div>';
    return;
  }
  const {c,w}=lsQ[lsI];currentWord=w;
  if(lsMode==='pick'){
    kbHide();
    const sameCat=V[c].words.filter(x=>x.g!==w.g&&!x.g.includes('...'));
    const others=shuf(sameCat.length>=3?sameCat:allWords().map(x=>x.w).filter(x=>x.g!==w.g)).slice(0,3);
    const opts=shuf([w,...others]);
    body.innerHTML='<span class="ex-tag">Listen and choose</span>'+ttsNotice()+
      '<div class="ex-card"><button class="audio-big" onclick="lsSpeak()" aria-label="Play">🔊</button><div class="audio-row"><button class="icon-btn" onclick="lsSpeak(0.55)">🐢 Slower</button><button class="icon-btn" id="ls-hint-btn" onclick="lsShowHint()">💡 Hint</button></div><div class="ex-tr" id="ls-hint" style="min-height:1.2em"></div></div>'+
      '<div id="ls-opts" style="display:flex;flex-direction:column;gap:0.5rem">'+opts.map((o,i)=>'<button class="choice" data-i="'+i+'" onclick="ansLsPick('+i+','+opts.indexOf(w)+',event)"><span class="c-ge">'+esc(o.g)+'</span><span class="c-sub">'+esc(o.e)+'</span></button>').join('')+'</div><div id="ls-fb"></div>';
    lsQ[lsI].opts=opts;
  }else{
    body.innerHTML='<span class="ex-tag">Type it in Tigrinya</span>'+ttsNotice()+
      '<div class="ex-card"><div class="ex-prompt">Write the Tigrinya for</div><div class="big-en" style="margin-top:0.3rem">'+esc(w.e)+'</div><div class="audio-row"><button class="icon-btn" onclick="lsSpeak()">🔊 Listen</button><button class="icon-btn" onclick="lsShowHint()">💡 Hint</button></div><div class="ex-tr" id="ls-hint" style="min-height:1.2em"></div></div>'+
      '<div class="type-box"><input class="type-input" id="ty-input" inputmode="none" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ፊደል…" aria-label="Your answer"></div>'+
      '<div id="ls-fb"></div>';
    const inp=$id('ty-input');inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();kbEnter();}});
    kbShow(inp,checkTyped);setTimeout(()=>inp.focus(),50);
  }
  setTimeout(()=>lsSpeak(),250);
}
function lsShowHint(){const it=lsQ[lsI];if(!it)return;lsHint=true;$id('ls-hint').textContent=it.w.t+(it.w.p?'  ·  '+it.w.p:'');}
function ansLsPick(i,ci,ev){
  if(lsDone)return;lsDone=true;const {c,w}=lsQ[lsI],ok=i===ci;
  document.querySelectorAll('#ls-opts .choice').forEach(b=>{b.disabled=true;const j=+b.dataset.i;if(j===ci)b.classList.add('c');else if(j===i)b.classList.add('w');});
  if(ok){lsRight++;S.lsCorrect++;addXP(lsHint?6:10,ev&&ev.clientX,ev&&ev.clientY);addCoins(2);}
  srsTouch(c,w,ok);
  $id('ls-fb').innerHTML='<div class="feedback '+(ok?'good':'bad')+'"><b>'+(ok?'✓ Correct!':'✗ It was '+esc(w.g))+'</b>'+esc(w.e)+' · <i style="color:var(--gold)">'+esc(w.t)+'</i></div><button class="btn" style="margin-top:0.6rem" onclick="lsI++;showLs()">Continue</button>';
}
/* Normalise for comparison: drop punctuation/spaces, treat ፀ-row as ጸ-row and አ-row as ኣ-row (common spelling variants). */
function normGe(s){
  return Array.from(String(s).replace(/[\s።፣፤፥፦፧!?.,'"…-]/g,'')).map(ch=>{
    const cp=ch.codePointAt(0);
    if(cp>=0x1340&&cp<=0x1346)return String.fromCodePoint(cp-8);
    if(cp===0x12A0)return'ኣ';
    return ch;
  }).join('');
}
function checkTyped(){
  if(lsDone)return;const inp=$id('ty-input');if(!inp)return;
  const {c,w}=lsQ[lsI],got=inp.value.trim();
  if(!got){toast('Type your answer with the keyboard below ⌨️');return;}
  lsDone=true;const ok=normGe(got)===normGe(w.g);
  inp.classList.add(ok?'ok':'bad');inp.readOnly=true;kbHide();
  if(ok){lsRight++;S.tyCorrect++;addXP(lsHint?8:14);addCoins(3);}
  srsTouch(c,w,ok);speak(w.g,w.t);
  let diff='';
  if(!ok){const a=Array.from(normGe(w.g)),b=Array.from(normGe(got));diff='<div class="diff" style="margin-top:0.4rem">Correct: '+a.map((ch,i)=>'<span class="'+(b[i]===ch?'d-ok':'d-bad')+'">'+esc(ch)+'</span>').join('')+'</div>';}
  $id('ls-fb').innerHTML='<div class="feedback '+(ok?'good':'bad')+'"><b>'+(ok?'✓ Perfect spelling!':'✗ Not quite')+'</b><span class="ge" style="font-size:1.2rem">'+esc(w.g)+'</span> · <i style="color:var(--gold)">'+esc(w.t)+'</i>'+diff+'</div><button class="btn" style="margin-top:0.6rem" onclick="lsI++;showLs()">Continue</button>';
}

/* ── On-screen Tigrinya keyboard ──
   Tap a consonant to show its 7 vowel orders (plus -wa / labialised forms). */
const KB_BASES=Array.from('ሀለሐመረሰሸቀቐበቨተቸነኘአከኸወዐዘዠየደጀገጠጨጰጸፀፈፐ');
const KB_WA=new Set(Array.from('ለሐመረሰሸበቨተቸነኘዘዠደጀጠጨጸፈፐ'));
const KB_LAB={'ቀ':[0x1248,0x124A,0x124B,0x124C,0x124D],'ቐ':[0x1258,0x125A,0x125B,0x125C,0x125D],'ከ':[0x12B0,0x12B2,0x12B3,0x12B4,0x12B5],'ኸ':[0x12C0,0x12C2,0x12C3,0x12C4,0x12C5],'ገ':[0x1310,0x1312,0x1313,0x1314,0x1315]};
const KB_VOWELS=['ä','u','i','a','e','ə','o'];
let kbTarget=null,kbOnEnter=null,kbFam=null;
function kbBuild(){
  const g=$id('kb-grid');if(g.childElementCount)return;
  KB_BASES.forEach(b=>{const k=document.createElement('button');k.className='kb-key';k.textContent=b;k.onclick=()=>kbPick(b,k);g.appendChild(k);});
}
function kbPick(base,keyEl){
  kbFam=base;document.querySelectorAll('#kb-grid .kb-key').forEach(k=>k.classList.toggle('on',k===keyEl));
  const cp=base.codePointAt(0);let html='';
  for(let i=0;i<7;i++){const ch=String.fromCodePoint(cp+i);html+='<button class="kb-cand" onclick="kbInsert(\''+ch+'\')"><span class="ge">'+ch+'</span><small>'+KB_VOWELS[i]+'</small></button>';}
  if(KB_WA.has(base)){const ch=String.fromCodePoint(cp+7);html+='<button class="kb-cand lab" onclick="kbInsert(\''+ch+'\')"><span class="ge">'+ch+'</span><small>wa</small></button>';}
  (KB_LAB[base]||[]).forEach((c,i)=>{const ch=String.fromCodePoint(c);html+='<button class="kb-cand lab" onclick="kbInsert(\''+ch+'\')"><span class="ge">'+ch+'</span><small>'+['wä','wi','wa','we','wə'][i]+'</small></button>';});
  $id('kb-cands').innerHTML=html;$id('kb-cands').scrollLeft=0;
}
function kbInsert(ch){
  const t=kbTarget;if(!t||t.readOnly)return;
  const s=t.selectionStart??t.value.length,e=t.selectionEnd??t.value.length;
  t.value=t.value.slice(0,s)+ch+t.value.slice(e);const p=s+ch.length;
  try{t.setSelectionRange(p,p);}catch(_){}
  t.classList.remove('bad');
}
function kbBackspace(){
  const t=kbTarget;if(!t||t.readOnly)return;
  const s=t.selectionStart??t.value.length,e=t.selectionEnd??t.value.length;
  if(s!==e){t.value=t.value.slice(0,s)+t.value.slice(e);try{t.setSelectionRange(s,s);}catch(_){}return;}
  if(s===0)return;const chars=Array.from(t.value.slice(0,s));const last=chars.pop()||'';
  t.value=chars.join('')+t.value.slice(s);const p=s-last.length;try{t.setSelectionRange(p,p);}catch(_){}
}
function kbEnter(){if(kbOnEnter)kbOnEnter();}
function kbShow(target,onEnter){kbBuild();kbTarget=target;kbOnEnter=onEnter;$id('kb').classList.remove('hidden');document.querySelector('.screen.active')?.classList.add('kb-open');}
function kbHide(){$id('kb').classList.add('hidden');document.querySelectorAll('.screen.kb-open').forEach(s=>s.classList.remove('kb-open'));kbTarget=null;kbOnEnter=null;}

/* ── Keyboard shortcuts for desktop / Chromebook users ── */
document.addEventListener('keydown',e=>{
  const act=document.querySelector('.screen.active');if(!act)return;
  if(act.id==='screen-review'){
    if(e.key===' '||e.key==='Enter'){if(!$id('rv-show').hidden){e.preventDefault();$id('rv-show').click();}}
    else if(['1','2','3','4'].includes(e.key)&&!$id('rv-grades').hidden){rvGrade(+e.key-1);}
  }
});

/* ── Hook the existing games into the review schedule ── */
const _ansQ=ansQ;
ansQ=function(chosen,correct,opts,word,ev){const was=qDone;_ansQ(chosen,correct,opts,word,ev);if(!was)srsTouch(cat,word,chosen===correct);};
const _fcAns=fcAns;
fcAns=function(knew){const w=fcDeck[fcIdx];if(w)srsTouch(cat,w,knew);_fcAns(knew);};

/* ── Navigation: initialise new screens, hide keyboard when leaving ── */
const _goNav=goNav;
goNav=function(id){if(id!=='listen')kbHide();_goNav(id);window.scrollTo(0,0);};

/* ── Home dashboard ── */
updateHome=function(){
  ensureState();
  const level=lv(S.xp),lxp=lvXP(level),nxp=lvXP(level+1);
  const pct=Math.min(100,((S.xp-lxp)/(nxp-lxp))*100);
  $id('h-level').textContent='Lv '+level;$id('h-lvname').textContent='Level '+level;
  $id('h-xp').textContent=(S.xp-lxp)+' / '+(nxp-lxp)+' XP';$id('h-xpbar').style.width=pct+'%';
  $id('h-streak').textContent=S.best||0;
  $id('h-words').textContent=S.wl.filter(k=>!k.startsWith('A:')).length;
  $id('h-coins').textContent=S.coins;$id('h-cards-ct').textContent=(S.collection||[]).length;
  const ds=currentDayStreak();$id('h-streak-line').innerHTML=ds?'🔥 <span id="h-days">'+ds+'</span>-day streak':'🌱 Start your streak today';
  const n=S.daily.n,goal=S.goal,C=213.6;
  $id('h-goal-n').textContent=Math.min(n,goal)===goal?'✓':n;
  $id('h-goal-l').textContent=n>=goal?'goal met':'of '+goal+' today';
  $id('h-ring').style.strokeDashoffset=C*(1-Math.min(1,n/goal));
  const due=srsDue().length,nw=Math.min(srsNewAvailable(),allWords().filter(({c,w})=>!S.srs[srsKey(c,w)]).length);
  const btn=$id('h-review');btn.classList.toggle('calm',due+nw===0);
  $id('h-review-sub').textContent=due+nw===0?'All caught up — come back tomorrow':(due?due+' to review':'')+(due&&nw?' · ':'')+(nw?nw+' new words':'');
  initDailyWord();
};

/* ── Progress screen: add a review-deck summary ── */
const _renderProg=renderProg;
renderProg=function(){
  _renderProg();const st=srsStats(),list=$id('prog-list');
  const el=document.createElement('div');el.className='prog-item';
  const seg=(n,col)=>'<div style="flex:'+n+';background:'+col+'"></div>';
  el.innerHTML='<div class="prog-hdr"><div class="prog-cat">🧠 Review deck</div><div class="prog-ct">'+st.total+'/'+st.all+'</div></div>'+
    '<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:rgba(243,234,217,0.07)">'+seg(st.learning,'var(--accent)')+seg(st.young,'var(--gold)')+seg(st.mature,'var(--green)')+seg(st.all-st.total,'transparent')+'</div>'+
    '<div style="display:flex;gap:0.9rem;font-size:0.72rem;color:var(--smoke);margin-top:0.5rem"><span>🟧 learning '+st.learning+'</span><span>🟨 young '+st.young+'</span><span>🟩 mature '+st.mature+'</span></div>'+
    '<div style="display:flex;gap:0.9rem;font-size:0.72rem;color:var(--smoke);margin-top:0.35rem"><span>🔥 '+currentDayStreak()+'-day streak</span><span>👥 '+(S.gdCorrect||0)+'</span><span>🎧 '+(S.lsCorrect||0)+'</span><span>⌨️ '+(S.tyCorrect||0)+'</span></div>'+
    '<div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.7rem;font-size:0.76rem;color:var(--smoke)">New words per day <select id="np-sel" style="background:var(--card2);color:var(--sand);border:1px solid var(--border2);border-radius:8px;padding:0.25rem 0.4rem;font-family:inherit">'+[4,8,12,20].map(v=>'<option'+(v===S.newPerDay?' selected':'')+'>'+v+'</option>').join('')+'</select> · goal <select id="goal-sel" style="background:var(--card2);color:var(--sand);border:1px solid var(--border2);border-radius:8px;padding:0.25rem 0.4rem;font-family:inherit">'+[10,20,30,50].map(v=>'<option'+(v===S.goal?' selected':'')+'>'+v+'</option>').join('')+'</select></div>';
  list.insertBefore(el,list.firstChild);
  $id('np-sel').onchange=e=>{S.newPerDay=+e.target.value;save();};
  $id('goal-sel').onchange=e=>{S.goal=+e.target.value;save();};
};

/* ── New achievements ── */
ACHS.push(
  {id:'days3',nm:'Daily Habit',ge:'ልማድ',d:'Practise 3 days in a row',ico:'📆',xp:40,ok:s=>(s.dayStreak||0)>=3},
  {id:'days7',nm:'One Week Strong',ge:'ሓደ ሰሙን',d:'Practise 7 days in a row',ico:'🗓️',xp:100,ok:s=>(s.dayStreak||0)>=7},
  {id:'rev100',nm:'Memory Builder',ge:'ዘኽታሪ',d:'Complete 100 reviews',ico:'🧠',xp:80,ok:s=>(s.reviews||0)>=100},
  {id:'gd25',nm:'Polite Speaker',ge:'ትሑት ተዛራቢ',d:'25 correct in Talk to…',ico:'👥',xp:50,ok:s=>(s.gdCorrect||0)>=25},
  {id:'ls20',nm:'Good Ear',ge:'ጽቡቕ እዝኒ',d:'20 correct listening answers',ico:'🎧',xp:50,ok:s=>(s.lsCorrect||0)>=20},
  {id:'ty10',nm:'Fidel Typist',ge:'ጸሓፊ ፊደል',d:'Type 10 words correctly',ico:'⌨️',xp:60,ok:s=>(s.tyCorrect||0)>=10}
);

ensureState();
