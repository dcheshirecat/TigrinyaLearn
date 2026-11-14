/* STATE */
const SK='tigrinya_v5';
let S=(()=>{try{const r=localStorage.getItem(SK);if(r)return JSON.parse(r);}catch(e){}
  return{xp:0,cor:0,tot:0,streak:0,best:0,matches:0,hunts:0,perfectQuiz:0,visited:[],wl:[],cw:{},coins:0,collection:[],packsOpened:0,fidelLearned:0,fidelSeen:[],writeSessions:0,rqCorrect:0,sbCorrect:0,ttsCount:0,bestAccuracy:0};
})();
let mode=null,cat=null,currentGrammarTab=0,currentCardsTab='shop',currentScriptTab='chart';
let fcDeck=[],fcIdx=0,fcFlipped=false,fcReview=[];
let qDeck=[],qIdx=0,qDone=false,qSesErr=0;
let mPairs=[],mSel=null,mFound=0,mTI=null,mSecs=0;
let wsGrid=[],wsTarget=[],wsSel=[],wsFound=[],wsDragging=false,wsPlaced=[];
let sbExIdx=0,writeXPclaimed=false,rqDoneFlag=false,rqQueue=[];
let canvas,ctx,drawing=false,strokePoints=[],targetPixelSet=null;

function save(){try{localStorage.setItem(SK,JSON.stringify(S));}catch(e){}}
function lv(xp){return Math.max(1,Math.floor(1+Math.sqrt(xp/50)));}
function lvXP(l){return Math.pow(l-1,2)*50;}
function addXP(amt,x,y){const pl=lv(S.xp);S.xp+=amt;save();updateHome();showPop('+'+amt+' XP',x,y,'xp-pop');if(lv(S.xp)>pl)setTimeout(()=>toast('🎉 Level Up! Level '+lv(S.xp)+'!'),400);}
function addCoins(amt,x,y){S.coins=Math.max(0,(S.coins||0)+amt);save();updateHome();if(amt>0)showPop('+'+amt+'🪙',x,y,'coin-pop');}
function showPop(txt,x,y,cls){const el=document.createElement('div');el.className=cls;el.textContent=txt;el.style.left=(x||window.innerWidth/2-20)+'px';el.style.top=(y||window.innerHeight*0.55)+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),1200);}
function checkAch(){ACHS.forEach(a=>{if(!S.wl.includes('A:'+a.id)&&a.ok(S)){S.wl.push('A:'+a.id);S.xp+=a.xp;save();updateHome();setTimeout(()=>toast('🏆 '+a.nm+'! +'+a.xp+' XP'),600);}});}
function markWord(c,word){const k=c+':'+word.t;if(!S.wl.includes(k)){S.wl.push(k);S.cw=S.cw||{};S.cw[c]=(S.cw[c]||0)+1;save();}}
function visitCat(c){if(!(S.visited||[]).includes(c)){S.visited=S.visited||[];S.visited.push(c);save();}}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200);}

function goNav(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const nb=document.getElementById('nb-'+id);if(nb)nb.classList.add('active');
  if(id==='home')updateHome();
  if(id==='grammar'){buildGrammarTabs();renderGrammar(currentGrammarTab);}
  if(id==='cards'){renderCards();}
  if(id==='script')initScript();
  if(id==='prog')renderProg();
  if(id==='learn'){initLearn();}
  if(id==='stories'){initStoriesScreen();}
  if(id==='social'){initSocial();}
  if(id==='build')initBuild();
  if(id==='wordbuild')initWB();
}
function updateHome(){
  const level=lv(S.xp),lxp=lvXP(level),nxp=lvXP(level+1);
  const pct=Math.min(100,((S.xp-lxp)/(nxp-lxp))*100);
  document.getElementById('h-level').textContent='Level '+level;
  document.getElementById('h-xp').textContent=(S.xp-lxp)+' / '+(nxp-lxp)+' XP';
  document.getElementById('h-xpbar').style.width=pct+'%';
  document.getElementById('h-streak').textContent=S.streak;
  document.getElementById('h-words').textContent=S.wl.filter(k=>!k.startsWith('A:')).length;
  document.getElementById('h-coins').textContent=S.coins;
  document.getElementById('h-cards-ct').textContent=(S.collection||[]).length;
  initDailyWord();
}

/* TTS */
function speakCurrent(){
  if(!currentWord)return;
  S.ttsCount=(S.ttsCount||0)+1;save();checkAch();
  speak(currentWord.g,currentWord.t);
}
function speakFidel(){
  if(!currentFidelChar)return;
  speak(currentFidelChar.ch,currentFidelChar.fam.name);
}

/* MODES */
function startMode(m){
  mode=m;
  const titles={flash:'Flashcards',quiz:'Quiz',match:'Match Pairs',search:'Word Hunt'};
  document.getElementById('play-title').textContent=titles[m]+' — Pick Topic';
  const g=document.getElementById('cat-grid');g.innerHTML='';
  CATS.forEach(c=>{
    const d=V[c],learned=S.cw?.[c]||0,total=d.words.length,pct=Math.round(learned/total*100);
    const el=document.createElement('div');el.className='cat-card';
    el.innerHTML='<div class="cat-ico">'+d.icon+'</div><span class="cat-ge ge">'+d.ge+'</span><span class="cat-en">'+d.label+'</span><div class="cat-pbar"><div class="cat-pfill" style="width:'+pct+'%"></div></div>';
    el.onclick=()=>launch(m,c);g.appendChild(el);
  });
  goNav('play');
}
function launch(m,c){cat=c;visitCat(c);currentWord=null;if(m==='flash')startFlash(c);else if(m==='quiz')startQuiz(c);else if(m==='match')startMatch(c);else if(m==='search')startSearch(c);}

/* FLASHCARD */
function startFlash(c){fcDeck=shuf([...V[c].words]);fcReview=[];fcIdx=0;fcFlipped=false;showFC();goNav('flash');}
function showFC(){
  const w=fcDeck[fcIdx];currentWord=w;
  document.getElementById('fc-ge').textContent=w.g;
  document.getElementById('fc-en').textContent=w.e;
  document.getElementById('fc-tr').textContent=w.t;
  document.getElementById('fc-tip').textContent='🔊 '+w.p;
  document.getElementById('fc-note').textContent=w.n;
  const mn=getMnemonic(w);const mnEl=document.getElementById('fc-mnem');if(mnEl)mnEl.textContent=mn;
  document.getElementById('fc-prog').textContent=(fcIdx+1)+'/'+fcDeck.length;
  document.getElementById('fc-str').textContent='🔥 '+S.streak;
  document.getElementById('fc-btns').style.display='none';
  fcFlipped=false;document.getElementById('flashcard').classList.remove('flipped');
}
function fcFlip(){if(!fcFlipped){fcFlipped=true;document.getElementById('flashcard').classList.add('flipped');document.getElementById('fc-btns').style.display='flex';}}
function fcAns(knew){
  const w=fcDeck[fcIdx];
  if(knew){markWord(cat,w);S.cor++;S.tot++;S.streak++;if(S.streak>S.best)S.best=S.streak;addXP(5);addCoins(1);checkAch();}
  else{fcReview.push(w);S.streak=0;S.tot++;}
  save();fcIdx++;
  if(fcIdx>=fcDeck.length){if(fcReview.length){fcDeck=shuf(fcReview);fcReview=[];fcIdx=0;toast('Reviewing '+fcDeck.length+' more 💪');showFC();}else{addXP(15);toast('🌟 Deck complete!');setTimeout(()=>goNav('play'),1500);}}
  else showFC();
}

/* QUIZ */
function startQuiz(c){qDeck=srWeightedDeck(c);qIdx=0;qDone=false;qSesErr=0;showQ();goNav('quiz');}
function showQ(){
  qDone=false;const w=qDeck[qIdx%qDeck.length];currentWord=w;
  const geToEn=Math.random()>0.35;
  document.getElementById('q-ge').textContent=w.g;
  document.getElementById('q-tr').textContent=geToEn?w.t:'';
  document.getElementById('q-prompt').textContent=geToEn?'What does this mean in English?':'Which Tigrinya word means "'+w.e+'"?';
  document.getElementById('qz-prog').textContent='Q '+(qIdx+1);
  const badge=document.getElementById('q-sr-badge');if(badge){const b=srBadge(w,cat);badge.innerHTML=b;badge.style.display=b?'inline-block':'none';}
  document.getElementById('qz-str').textContent='🔥 '+S.streak;
  document.getElementById('q-result').innerHTML='';
  const wrong=shuf(V[cat].words.filter(x=>x.t!==w.t)).slice(0,3);
  const opts=shuf([w,...wrong]);const ci=opts.indexOf(w);
  const wrap=document.getElementById('opts');wrap.innerHTML='';
  opts.forEach((o,i)=>{const btn=document.createElement('button');btn.className='opt';const txt=geToEn?o.e:'<span class="ge">'+o.g+'</span>';btn.innerHTML='<span class="opt-ltr">'+['A','B','C','D'][i]+'</span>'+txt;btn.onclick=ev=>ansQ(i,ci,opts,w,ev);wrap.appendChild(btn);});
}
function ansQ(chosen,correct,opts,word,ev){
  if(qDone)return;qDone=true;
  document.querySelectorAll('.opt').forEach((b,i)=>{b.disabled=true;if(i===correct)b.classList.add('c');else if(i===chosen)b.classList.add('w');b.querySelector('.opt-ltr').textContent=i===correct?'✓':(i===chosen?'✗':['A','B','C','D'][i]);});
  const ok=chosen===correct;S.tot++;
  if(ok){S.cor++;S.streak++;if(S.streak>S.best)S.best=S.streak;markWord(cat,word);addXP(15+(S.streak>=5?5:0),ev.clientX,ev.clientY);addCoins(3,ev.clientX,ev.clientY-30);checkAch();}
  else{S.streak=0;qSesErr++;}
  save();document.getElementById('qz-str').textContent='🔥 '+S.streak;
  document.getElementById('q-result').innerHTML='<div class="result-box '+(ok?'rc':'rw')+'"><div class="rv">'+(ok?'✓ Correct!':'✗ Answer: '+opts[correct].e)+'</div><div class="rn">'+word.n+'</div></div><button class="next-btn" onclick="nextQ()">Next →</button>';
}
function nextQ(){qIdx++;if(qIdx>0&&qIdx%qDeck.length===0){if(qSesErr===0){S.perfectQuiz++;save();checkAch();toast('💎 Perfect round!');}qDeck=shuf([...V[cat].words]);qSesErr=0;}showQ();}

/* MATCH */
function startMatch(c){
  const words=shuf([...V[c].words]).slice(0,4);mSel=null;mFound=0;mSecs=0;
  const ge=shuf(words.map((w,i)=>({id:i,type:'g',txt:w.g,w})));
  const en=shuf(words.map((w,i)=>({id:i,type:'e',txt:w.e,w})));
  mPairs=[];for(let i=0;i<4;i++){mPairs.push(ge[i],en[i]);}
  renderMatch();goNav('match');stopMatch();
  mTI=setInterval(()=>{mSecs++;const m=Math.floor(mSecs/60),s=mSecs%60;document.getElementById('m-timer').textContent=m+':'+(s<10?'0':'')+s;},1000);
  document.getElementById('m-str').textContent='🔥 '+S.streak;document.getElementById('m-result').innerHTML='';
}
function stopMatch(){if(mTI){clearInterval(mTI);mTI=null;}}
function renderMatch(){const g=document.getElementById('m-grid');g.innerHTML='';mPairs.forEach((c,i)=>{const el=document.createElement('div');el.className='mc'+(c.type==='g'?' ge-mc':'');el.textContent=c.txt;el.dataset.i=i;el.onclick=()=>tapMatch(i);g.appendChild(el);});}
function tapMatch(i){
  const p=mPairs[i];if(p.matched)return;
  const els=[...document.querySelectorAll('.mc')];
  if(mSel===null){mSel=i;els[i].classList.add('sel');return;}
  if(mSel===i){els[i].classList.remove('sel');mSel=null;return;}
  const prev=mPairs[mSel],hit=prev.id===p.id&&prev.type!==p.type;
  if(hit){
    prev.matched=p.matched=true;
    els[mSel].classList.remove('sel');els[mSel].classList.add('mat');els[i].classList.add('mat');
    mFound++;mSel=null;S.streak++;if(S.streak>S.best)S.best=S.streak;
    if(mFound===4){
      stopMatch();S.matches++;S.cor+=4;S.tot+=4;
      mPairs.filter(c=>c.type==='g').forEach(c=>markWord(cat,c.w));
      const tb=Math.max(0,60-mSecs);addXP(25+tb);addCoins(5);save();checkAch();
      document.getElementById('m-result').innerHTML='<div class="match-done"><div class="match-done-ico">🎉</div><div class="match-done-title">All Matched!</div><div class="match-done-xp">+5🪙 earned!</div><button class="play-again" onclick="startMatch(\''+cat+'\')">Play Again</button></div>';
    }
  }else{
    S.streak=0;S.tot++;els[mSel].classList.remove('sel');
    [els[mSel],els[i]].forEach(e=>{e.classList.add('bad');setTimeout(()=>e.classList.remove('bad'),420);});
    mSel=null;save();
  }
  document.getElementById('m-str').textContent='🔥 '+S.streak;
}

/* WORD HUNT */
const GE_LETTERS=['ሀ','ሁ','ሂ','ሃ','ለ','ሉ','ሊ','ላ','ሐ','ሑ','ሒ','ሓ','መ','ሙ','ሚ','ማ','ሰ','ሱ','ሲ','ሳ','ረ','ሩ','ሪ','ራ','ቀ','ቁ','ቂ','ቃ','በ','ቡ','ቢ','ባ','ተ','ቱ','ቲ','ታ','ነ','ኑ','ኒ','ና','አ','ኡ','ኢ','ኣ','ከ','ኩ','ኪ','ካ','ወ','ዉ','ዊ','ዋ'];
const GRID_SIZE=7;
function startSearch(c){const words=shuf([...V[c].words]).filter(w=>w.g.length<=4).slice(0,5);wsTarget=words;wsFound=[];wsSel=[];wsDragging=false;buildWSGrid(words);renderWSWords();document.getElementById('ws-found').textContent='0/'+words.length;document.getElementById('ws-str').textContent='🔥 '+S.streak;document.getElementById('ws-result').innerHTML='';goNav('search');}
function buildWSGrid(words){
  wsGrid=Array.from({length:GRID_SIZE},()=>Array(GRID_SIZE).fill(''));wsPlaced=[];
  words.forEach(w=>{const chars=[...w.g];let tries=0;while(tries<60){const horiz=Math.random()>0.5;const maxR=horiz?GRID_SIZE:GRID_SIZE-chars.length;const maxC=horiz?GRID_SIZE-chars.length:GRID_SIZE;if(maxR<=0||maxC<=0){tries++;continue;}const r=Math.floor(Math.random()*maxR);const c=Math.floor(Math.random()*maxC);let ok=true;chars.forEach((ch,i)=>{const rr=r+(horiz?0:i),cc=c+(horiz?i:0);if(wsGrid[rr][cc]&&wsGrid[rr][cc]!==ch)ok=false;});if(ok){chars.forEach((ch,i)=>{wsGrid[r+(horiz?0:i)][c+(horiz?i:0)]=ch;});wsPlaced.push({word:w,r,c,horiz,len:chars.length});break;}tries++;}});
  for(let r=0;r<GRID_SIZE;r++)for(let c=0;c<GRID_SIZE;c++)if(!wsGrid[r][c])wsGrid[r][c]=GE_LETTERS[Math.floor(Math.random()*GE_LETTERS.length)];
  const g=document.getElementById('ws-grid');g.style.gridTemplateColumns='repeat('+GRID_SIZE+',1fr)';g.innerHTML='';
  for(let r=0;r<GRID_SIZE;r++){for(let c=0;c<GRID_SIZE;c++){const el=document.createElement('div');el.className='ws-cell';el.textContent=wsGrid[r][c];el.dataset.r=r;el.dataset.c=c;el.addEventListener('pointerdown',e=>{wsDragging=true;wsSel=[[r,c]];renderWSsel();e.preventDefault();});el.addEventListener('pointerenter',()=>{if(wsDragging){addWSsel(r,c);renderWSsel();}});g.appendChild(el);}}
  document.getElementById('ws-grid').addEventListener('pointerup',checkWSsel);
}
function addWSsel(r,c){if(!wsSel.length){wsSel=[[r,c]];return;}const[fr,fc]=wsSel[0],[lr,lc]=wsSel[wsSel.length-1];const dr=Math.sign(r-fr),dc=Math.sign(c-fc);if(!dr&&!dc)return;const nr=lr+dr,nc=lc+dc;if(nr===r&&nc===c&&!wsSel.some(([a,b])=>a===r&&b===c))wsSel.push([r,c]);}
function renderWSsel(){document.querySelectorAll('.ws-cell').forEach(el=>{const r=+el.dataset.r,c=+el.dataset.c;el.classList.toggle('sel',wsSel.some(([a,b])=>a===r&&b===c));});}
function checkWSsel(){
  wsDragging=false;const selStr=wsSel.map(([r,c])=>wsGrid[r][c]).join('');
  const match=wsPlaced.find(p=>p.word.g===selStr&&!wsFound.includes(p.word.t));
  if(match){wsFound.push(match.word.t);markWord(cat,match.word);S.cor++;S.tot++;S.streak++;if(S.streak>S.best)S.best=S.streak;addXP(8);addCoins(2);wsSel.forEach(([r,c])=>{document.querySelectorAll('.ws-cell').forEach(el=>{if(+el.dataset.r===r&&+el.dataset.c===c)el.classList.add('found');});});const cnt=wsFound.length,tot=wsTarget.length;document.getElementById('ws-found').textContent=cnt+'/'+tot;document.getElementById('ws-str').textContent='🔥 '+S.streak;renderWSWords();if(cnt===tot){S.hunts++;addXP(12);addCoins(5);save();checkAch();document.getElementById('ws-result').innerHTML='<div class="match-done"><div class="match-done-ico">🌟</div><div class="match-done-title">All Found!</div><div class="match-done-xp">+5🪙 bonus!</div><button class="play-again" onclick="startSearch(\''+cat+'\')">Play Again</button></div>';}}
  wsSel=[];document.querySelectorAll('.ws-cell:not(.found)').forEach(el=>el.classList.remove('sel'));save();checkAch();
}
function renderWSWords(){const w=document.getElementById('ws-words');w.innerHTML='';wsTarget.forEach(word=>{const el=document.createElement('div');el.className='ws-word ge'+(wsFound.includes(word.t)?' found':'');el.textContent=word.g;w.appendChild(el);});}

/* ═══════════════════════════
   SCRIPT
═══════════════════════════ */
function initScript(){
  const vh=document.getElementById('vowel-hdr');
  if(!vh.children.length){vh.innerHTML='<div style="width:28px;flex-shrink:0"></div>'+VOWEL_LABELS.map(v=>'<div class="vowel-hdr-cell">'+v+'</div>').join('');}
  const chart=document.getElementById('fidel-chart');
  if(!chart.children.length){FIDEL.forEach((fam,fi)=>{const row=document.createElement('div');row.className='fidel-family';row.innerHTML='<div class="fidel-name">'+fam.name+'</div>';fam.forms.forEach((ch,vi)=>{const cell=document.createElement('div');cell.className='fidel-cell';cell.innerHTML='<span class="ge">'+ch+'</span>';cell.onclick=()=>showFidelDetail(fi,vi,cell);row.appendChild(cell);});chart.appendChild(row);});}
  const picker=document.getElementById('write-char-pick');
  if(!picker.children.length){FIDEL.forEach((fam,fi)=>{const btn=document.createElement('button');btn.className='wcp';btn.textContent=fam.forms[0];btn.onclick=()=>{document.querySelectorAll('.wcp').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.getElementById('trace-char').textContent=fam.forms[0];currentFidelChar={fam,vi:0,ch:fam.forms[0]};writeXPclaimed=false;allStrokes=[];strokePoints=[];currentStroke=[];clearCanvas();};picker.appendChild(btn);});picker.children[0]?.classList.add('active');currentFidelChar={fam:FIDEL[0],vi:0,ch:FIDEL[0].forms[0]};}
  initCanvas();
  switchScriptTab(currentScriptTab);
  if(!rqQueue.length)nextRQ();
}

function showFidelDetail(fi,vi,cell){
  const fam=FIDEL[fi];const ch=fam.forms[vi];
  currentFidelChar={fam,vi,ch};
  if(!S.fidelSeen)S.fidelSeen=[];const famKey='f:'+fi;
  if(!S.fidelSeen.includes(famKey)){S.fidelSeen.push(famKey);S.fidelLearned=S.fidelSeen.length;addXP(3);addCoins(1);save();checkAch();}
  document.querySelectorAll('.fidel-cell').forEach(c=>c.classList.remove('sel'));cell.classList.add('sel');
  const det=document.getElementById('fidel-detail');det.classList.add('show');
  det.innerHTML='<div class="fd-char ge">'+ch+'</div><button class="tts-btn" onclick="speakFidel()" style="display:block;margin:0.4rem auto">🔊 Listen</button><div class="fd-row"><span class="fd-label">Family</span><span class="fd-val">'+fam.name+'</span></div><div class="fd-row"><span class="fd-label">Vowel</span><span class="fd-val">'+VOWEL_NAMES[vi]+'</span></div><div class="fd-row"><span class="fd-label">Sound</span><span class="fd-val">'+fam.sound+'</span></div><div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--smoke);margin:0.7rem 0 0.25rem">All 7 forms</div><div class="fd-family-row">'+fam.forms.map((f,i)=>'<div class="fd-sib" onclick="showFidelDetail('+fi+','+i+',this)"><span class="ge">'+f+'</span><span class="fd-sib-tr">'+fam.name+(VOWEL_LABELS[i]==='ə'?'':VOWEL_LABELS[i])+'</span></div>').join('')+'</div><div class="fd-note">'+fam.note+'</div>';
  setTimeout(()=>det.scrollIntoView({behavior:'smooth',block:'nearest'}),100);
}

function switchScriptTab(tab){
  currentScriptTab=tab;
  ['chart','write','rquiz'].forEach(t=>{
    document.getElementById('stab-'+t).classList.toggle('active',t===tab);
    document.getElementById('stab-'+t+'-pane').style.display=t===tab?'block':'none';
  });
}

/* ═══════════════════════════
   CANVAS WITH STROKE ACCURACY
═══════════════════════════ */
let allStrokes = []; // array of point arrays, one per stroke
let currentStroke = [];

function initCanvas(){
  canvas=document.getElementById('writeCanvas');if(!canvas||canvas._init)return;canvas._init=true;
  const dpr=window.devicePixelRatio||1;
  function resize(){
    const w=canvas.offsetWidth;
    canvas.width=w*dpr;canvas.height=220*dpr;canvas.style.height='220px';
    ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    redrawAllStrokes();
  }
  resize();
  window.addEventListener('resize',()=>{resize();});
  function getPos(e){
    const rect=canvas.getBoundingClientRect();
    const src=e.touches?e.touches[0]:e;
    return{x:(src.clientX-rect.left),y:(src.clientY-rect.top)};
  }
  canvas.addEventListener('pointerdown',e=>{
    drawing=true;currentStroke=[];
    const p=getPos(e);
    ctx.strokeStyle='#f0c040';ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(p.x,p.y);
    currentStroke.push(p);strokePoints.push(p);
    e.preventDefault();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drawing)return;
    const p=getPos(e);
    ctx.lineTo(p.x,p.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(p.x,p.y);
    currentStroke.push(p);strokePoints.push(p);
    e.preventDefault();
  });
  canvas.addEventListener('pointerup',()=>{
    if(drawing&&currentStroke.length>1){allStrokes.push([...currentStroke]);}
    drawing=false;ctx.beginPath();
    updateAccuracy();
    updateStrokeCount();
  });
  canvas.addEventListener('pointerleave',()=>{
    if(drawing){
      if(currentStroke.length>1)allStrokes.push([...currentStroke]);
      drawing=false;ctx.beginPath();updateAccuracy();updateStrokeCount();
    }
  });
}

function redrawAllStrokes(){
  if(!ctx)return;
  ctx.clearRect(0,0,canvas.offsetWidth,220);
  ctx.strokeStyle='#f0c040';ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';
  allStrokes.forEach(stroke=>{
    if(stroke.length<2)return;
    ctx.beginPath();ctx.moveTo(stroke[0].x,stroke[0].y);
    stroke.forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.stroke();
  });
}

function undoStroke(){
  if(!allStrokes.length)return;
  allStrokes.pop();
  strokePoints=allStrokes.flat();
  redrawAllStrokes();
  updateAccuracy();
  updateStrokeCount();
}

function updateStrokeCount(){
  const el=document.getElementById('stroke-count');
  if(el) el.textContent=allStrokes.length+' stroke'+(allStrokes.length!==1?'s':'');
}

function showGuideAnim_legacy(){/* replaced by showGuideAnim in learn screen */}

function buildTargetMask(){
  const ch=document.getElementById('trace-char').textContent;
  const dpr=1;const w=canvas.offsetWidth,h=220;
  const offCanvas=document.createElement('canvas');offCanvas.width=w*dpr;offCanvas.height=h*dpr;
  const offCtx=offCanvas.getContext('2d');offCtx.scale(dpr,dpr);
  const fs=Math.min(w,h)*0.55;
  offCtx.font=fs+'px var(--font-ge)';
  offCtx.fillStyle='#fff';offCtx.textAlign='center';offCtx.textBaseline='middle';
  offCtx.fillText(ch,w/2,h/2);
  const data=offCtx.getImageData(0,0,w*dpr,h*dpr).data;
  const pixels=new Set();
  for(let i=0;i<data.length;i+=4){if(data[i+3]>40)pixels.add(Math.floor(i/4));}
  return {pixels,w:w*dpr,h:h*dpr,dpr};
}

function updateAccuracy(){
  if(strokePoints.length<5)return;
  let mask;try{mask=buildTargetMask();}catch(e){return;}
  const {pixels:targetPixels,w:mw,h:mh,dpr}=mask;
  if(!targetPixels.size)return;
  // Check how many user stroke points fall on target pixels
  let hits=0;
  strokePoints.forEach(p=>{
    // Check a small radius around each stroke point
    for(let dx=-3;dx<=3;dx++){for(let dy=-3;dy<=3;dy++){
      const px=Math.round(p.x*dpr+dx),py=Math.round(p.y*dpr+dy);
      if(px>=0&&px<mw&&py>=0&&py<mh&&targetPixels.has(py*mw+px))hits++;
    }}
  });
  const maxHits=strokePoints.length*49; // 7x7 radius per point
  const rawAcc=Math.min(100,Math.round((hits/Math.min(maxHits,targetPixels.size*2))*100*2.5));
  const acc=Math.min(100,rawAcc);
  // Update UI
  const badge=document.getElementById('accuracy-badge');
  const cv=document.getElementById('writeCanvas');
  cv.classList.remove('acc-great','acc-good','acc-low');
  if(acc>=75){badge.textContent='🎯 Accuracy: '+acc+'% — Great trace!';badge.style.color='#6ab387';cv.classList.add('acc-great');}
  else if(acc>=45){badge.textContent='✏️ Accuracy: '+acc+'% — Good effort!';badge.style.color='var(--gold)';cv.classList.add('acc-good');}
  else{badge.textContent='↺ Accuracy: '+acc+'% — Try tracing the ghost';badge.style.color='#e05565';cv.classList.add('acc-low');}
  // Track best accuracy for achievement
  if(acc>(S.bestAccuracy||0)){S.bestAccuracy=acc;save();checkAch();}
}

function clearCanvas(){
  if(!canvas)return;
  allStrokes=[];strokePoints=[];currentStroke=[];writeXPclaimed=false;
  ctx.clearRect(0,0,canvas.offsetWidth,220);
  const badge=document.getElementById('accuracy-badge');if(badge)badge.textContent='';
  const sc=document.getElementById('stroke-count');if(sc)sc.textContent='';
  const cv=document.getElementById('writeCanvas');cv.classList.remove('acc-great','acc-good','acc-low');
  cv.style.borderColor='rgba(212,160,23,0.18)';
}
function claimWriteXP(){
  if(writeXPclaimed){toast('Clear and try again for more XP!');return;}
  writeXPclaimed=true;S.writeSessions=(S.writeSessions||0)+1;addXP(10);addCoins(2);save();checkAch();
  toast('✍️ Practice saved! +10 XP +2🪙');
}

/* RECOGNIZE QUIZ */
function nextRQ(){
  rqDoneFlag=false;if(!rqQueue.length)rqQueue=shuf(FIDEL.flatMap(fam=>fam.forms.map((f,vi)=>({fam,vi,ch:f}))));
  const item=rqQueue.pop();if(!item)return;
  currentFidelChar=item;
  document.getElementById('rq-ge').textContent=item.ch;
  const askSound=Math.random()>0.4;
  document.getElementById('rq-prompt').textContent=askSound?'What sound does this character make?':'Which consonant family is this?';
  document.getElementById('rq-result').innerHTML='';
  const correct=askSound?(item.fam.name+(VOWEL_LABELS[item.vi]==='ə'?'ä':VOWEL_LABELS[item.vi])):item.fam.name;
  const wrongFams=shuf(FIDEL.filter(f=>f.name!==item.fam.name)).slice(0,3);
  const opts=shuf([correct,...wrongFams.map(f=>askSound?(f.name+(VOWEL_LABELS[item.vi]==='ə'?'ä':VOWEL_LABELS[item.vi])):f.name)]);
  const wrap=document.getElementById('rq-opts');wrap.innerHTML='';
  opts.forEach(o=>{const btn=document.createElement('button');btn.className='rq-opt';btn.textContent=o;btn.onclick=()=>ansRQ(o,correct,item,btn);wrap.appendChild(btn);});
}
function ansRQ(chosen,correct,item,btn){
  if(rqDoneFlag)return;rqDoneFlag=true;const ok=chosen===correct;
  document.querySelectorAll('.rq-opt').forEach(b=>{b.disabled=true;if(b.textContent===correct)b.classList.add('c');else if(b===btn&&!ok)b.classList.add('w');});
  S.tot++;if(ok){S.cor++;S.streak++;if(S.streak>S.best)S.best=S.streak;S.rqCorrect=(S.rqCorrect||0)+1;addXP(8);addCoins(2);checkAch();}else S.streak=0;
  if(!S.fidelSeen)S.fidelSeen=[];const famKey='f:'+FIDEL.indexOf(item.fam);if(!S.fidelSeen.includes(famKey)){S.fidelSeen.push(famKey);S.fidelLearned=S.fidelSeen.length;save();}
  save();document.getElementById('rq-result').innerHTML='<div class="result-box '+(ok?'rc':'rw')+'" style="margin:0.65rem 1rem 0"><div class="rv">'+(ok?'✓ Correct!':'✗ It was: '+correct)+'</div><div class="rn">'+item.fam.note+'</div></div><button class="next-btn" onclick="nextRQ()">Next →</button>';
}

/* ═══════════════════════════
   GRAMMAR
═══════════════════════════ */
function buildGrammarTabs(){
  const wrap=document.getElementById('grammar-tabs');if(wrap.children.length)return;
  GRAMMAR_LESSONS.forEach((l,i)=>{const b=document.createElement('button');b.className='gtab'+(i===0?' active':'');b.textContent=l.title;b.onclick=()=>switchGrammar(i);wrap.appendChild(b);});
}
function switchGrammar(idx){
  currentGrammarTab=idx;
  document.querySelectorAll('.gtab').forEach((b,i)=>b.classList.toggle('active',i===idx));
  renderGrammar(idx);
}
function renderGrammar(idx){
  const lesson=GRAMMAR_LESSONS[idx];
  const ex=SB_EXERCISES[sbExIdx%SB_EXERCISES.length];
  window._sbCurrent=ex;window._sbShuffled=shuf([...ex.words]);window._sbPlaced=[];
  document.getElementById('grammar-content').innerHTML=
    '<div class="lesson-card"><div class="lesson-hdr"><div class="lesson-title">'+lesson.title+'</div><div class="lesson-subtitle">'+lesson.sub+'</div></div><div class="lesson-body">'+lesson.content+'</div></div>'+
    '<div style="margin:0 1rem"><div class="sec-label" style="margin:0 0 0.4rem">Sentence Builder</div><div class="sb-counter">Exercise '+(sbExIdx%SB_EXERCISES.length+1)+' / '+SB_EXERCISES.length+'</div><div class="sb-eng">Build: "'+ex.eng+'"</div></div>'+
    '<div class="sb-wrap"><div class="sb-target" id="sb-target"><span class="sb-hint">Tap words below in order →</span></div><div class="sb-bank" id="sb-bank">'+window._sbShuffled.map((w,i)=>'<button class="sb-word" id="sbw-'+i+'" onclick="sbTap('+i+')"><span class="ge">'+w+'</span></button>').join('')+'</div><div class="sb-actions"><button class="sb-btn sb-check" onclick="sbCheck()">✓ Check</button><button class="sb-btn sb-reset" onclick="sbReset()">↺ Reset</button></div><div class="sb-result" id="sb-result"></div></div><div class="sgap"></div>';
}
function sbTap(i){const w=window._sbShuffled[i];const btn=document.getElementById('sbw-'+i);if(btn.classList.contains('placed'))return;window._sbPlaced.push({word:w,idx:i});btn.classList.add('placed');const target=document.getElementById('sb-target');if(window._sbPlaced.length===1)target.innerHTML='';const placed=document.createElement('span');placed.className='sb-placed ge';placed.textContent=w;placed.onclick=()=>sbRemove(i,placed);target.appendChild(placed);}
function sbRemove(i,el){window._sbPlaced=window._sbPlaced.filter(p=>p.idx!==i);document.getElementById('sbw-'+i)?.classList.remove('placed');el.remove();if(!window._sbPlaced.length){document.getElementById('sb-target').innerHTML='<span class="sb-hint">Tap words below in order →</span>';}}
function sbCheck(){
  const answer=window._sbCurrent.answer;const placed=window._sbPlaced.map(p=>p.word);
  const ok=placed.length===answer.length&&placed.every((w,i)=>w===answer[i]);
  const res=document.getElementById('sb-result');res.className='sb-result show '+(ok?'ok':'bad');
  if(ok){res.innerHTML='✓ Correct! Well done! +10 XP +3🪙';S.sbCorrect=(S.sbCorrect||0)+1;addXP(10);addCoins(3);save();checkAch();setTimeout(()=>{sbExIdx++;renderGrammar(currentGrammarTab);},1600);}
  else res.innerHTML='✗ Not quite. Hint: '+window._sbCurrent.hint+'<br><span style="font-family:var(--font-ge);font-size:1rem">'+answer.join(' ')+'</span>';
}
function sbReset(){window._sbPlaced=[];document.querySelectorAll('.sb-word').forEach(b=>b.classList.remove('placed'));document.getElementById('sb-target').innerHTML='<span class="sb-hint">Tap words below in order →</span>';document.getElementById('sb-result').className='sb-result';}

/* ═══════════════════════════
   TRADING CARDS
═══════════════════════════ */
function switchCardsTab(tab){currentCardsTab=tab;document.getElementById('ctab-shop').classList.toggle('active',tab==='shop');document.getElementById('ctab-collection').classList.toggle('active',tab==='collection');renderCards();}
function renderCards(){
  document.getElementById('cards-coins').textContent=S.coins;
  const content=document.getElementById('cards-content');
  if(currentCardsTab==='shop'){
    let html='<div class="sec-label">Buy a Pack</div><div class="pack-row">';
    PACKS.forEach(p=>{html+='<div class="pack-card '+p.color+'" onclick="buyPack(\''+p.id+'\')"><div class="pack-ico">'+p.ico+'</div><div class="pack-name">'+p.name+'</div><div class="pack-cost">🪙 '+p.cost+'</div><div class="pack-desc">'+p.desc+'</div></div>';});
    html+='</div><div class="sec-label" style="margin-top:0.4rem">Earn Coins 🪙</div><div style="margin:0 1rem 0.75rem;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:0.85rem;font-size:0.75rem;color:var(--smoke);line-height:2.1">✅ Quiz correct: <strong style="color:var(--gold)">+3🪙</strong> · 🃏 Flashcard: <strong style="color:var(--gold)">+1🪙</strong><br>🔗 Match round: <strong style="color:var(--gold)">+5🪙</strong> · 🔎 Word Hunt: <strong style="color:var(--gold)">+2🪙</strong><br>📝 Sentence Builder: <strong style="color:var(--gold)">+3🪙</strong> · ✍️ Writing: <strong style="color:var(--gold)">+2🪙</strong><br>📜 Fidel explore: <strong style="color:var(--gold)">+1🪙</strong> · 👁️ Recognition: <strong style="color:var(--gold)">+2🪙</strong></div><div class="sgap"></div>';
    content.innerHTML=html;
  }else{
    const owned=S.collection||[];
    if(!owned.length){content.innerHTML='<div class="empty-collection">No cards yet!<br>Buy packs in the Shop tab. 🃏</div>';return;}
    const counts={};owned.forEach(id=>{counts[id]=(counts[id]||0)+1;});
    const unique=[...new Set(owned)].sort((a,b)=>{const order={legendary:0,rare:1,common:2};return (order[ALL_CARDS.find(c=>c.id===a)?.rarity]||2)-(order[ALL_CARDS.find(c=>c.id===b)?.rarity]||2);});
    let html='<div style="padding:0 1rem 0.4rem;font-size:0.7rem;color:var(--smoke)">'+unique.length+' unique · '+owned.length+' total · '+ALL_CARDS.length+' collectible</div><div class="card-grid">';
    unique.forEach(id=>{const card=ALL_CARDS.find(c=>c.id===id);if(!card)return;html+='<div class="card-item card-'+card.rarity+'"><div class="card-rarity">'+card.rarity+'</div><div class="card-art">'+card.art+'</div><div class="card-ge ge">'+card.g+'</div><div class="card-en">'+card.e+'</div><div class="card-tr">'+card.t+'</div>'+(counts[id]>1?'<div class="card-count">×'+counts[id]+'</div>':'')+'</div>';});
    html+='</div><div class="sgap"></div>';content.innerHTML=html;
  }
}
function buyPack(packId){
  const pack=PACKS.find(p=>p.id===packId);
  if((S.coins||0)<pack.cost){toast('Need 🪙'+pack.cost+' — keep playing to earn more!');return;}
  S.coins-=pack.cost;S.packsOpened=(S.packsOpened||0)+1;
  const count=packId==='starter'?5:3;const drawn=[];
  for(let i=0;i<count;i++){
    let pool;
    if(pack.guaranteed==='rare'&&i===0)pool=ALL_CARDS.filter(c=>c.rarity==='rare');
    else if(packId==='legend'){const r=Math.random();if(i===0&&r<0.25)pool=ALL_CARDS.filter(c=>c.rarity==='legendary');else if(r<0.5)pool=ALL_CARDS.filter(c=>c.rarity==='rare');else pool=ALL_CARDS.filter(c=>c.rarity==='common');}
    else if(pack.draw)pool=pack.draw(i);
    else pool=ALL_CARDS.filter(c=>c.rarity==='common');
    if(!pool.length)pool=ALL_CARDS.filter(c=>c.rarity==='common');
    drawn.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  drawn.forEach(card=>{S.collection=S.collection||[];S.collection.push(card.id);});
  save();updateHome();checkAch();
  const overlay=document.getElementById('pack-overlay');
  const revealWrap=document.getElementById('pack-cards-reveal');revealWrap.innerHTML='';
  const rarityColors={common:'var(--smoke)',rare:'var(--rare)',legendary:'var(--legend)'};
  drawn.forEach((card,i)=>{
    const div=document.createElement('div');div.className='reveal-card card-'+card.rarity;
    div.innerHTML='<div class="reveal-rarity" style="color:'+rarityColors[card.rarity]+'">★ '+card.rarity+'</div><div class="reveal-art">'+card.art+'</div><div class="card-ge ge" style="font-size:1.6rem">'+card.g+'</div><div style="font-size:0.82rem;color:var(--smoke);margin-top:0.2rem">'+card.e+'</div><div style="font-size:0.7rem;font-style:italic;color:var(--gold)">'+card.t+'</div>';
    revealWrap.appendChild(div);setTimeout(()=>div.classList.add('show'),(i+1)*350);
  });
  overlay.classList.remove('hidden');
}
function closePackOverlay(){document.getElementById('pack-overlay').classList.add('hidden');renderCards();}

/* PROGRESS */
function renderProg(){
  const list=document.getElementById('prog-list');list.innerHTML='';
  CATS.forEach(c=>{const d=V[c],learned=S.cw?.[c]||0,total=d.words.length,pct=Math.round(learned/total*100);const el=document.createElement('div');el.className='prog-item';el.innerHTML='<div class="prog-hdr"><div class="prog-cat">'+d.icon+' '+d.label+'</div><div class="prog-ct">'+learned+'/'+total+'</div></div><div class="prog-bar"><div class="prog-fill" style="width:'+pct+'%"></div></div>';list.appendChild(el);});
  [{cat:'✍️ Fidel Script',ct:(S.fidelLearned||0)+'/'+FIDEL.length,pct:Math.round((S.fidelLearned||0)/FIDEL.length*100)},{cat:'📝 Grammar Exercises',ct:(S.sbCorrect||0)+' done',pct:Math.min(100,Math.round((S.sbCorrect||0)/SB_EXERCISES.length*100))},{cat:'🃏 Card Collection',ct:[...new Set(S.collection||[])].length+'/'+ALL_CARDS.length,pct:Math.round([...new Set(S.collection||[])].length/ALL_CARDS.length*100)},{cat:'🔊 TTS Listens',ct:(S.ttsCount||0)+' times',pct:Math.min(100,(S.ttsCount||0)*5)}].forEach(({cat,ct,pct})=>{const el=document.createElement('div');el.className='prog-item';el.innerHTML='<div class="prog-hdr"><div class="prog-cat">'+cat+'</div><div class="prog-ct">'+ct+'</div></div><div class="prog-bar"><div class="prog-fill" style="width:'+pct+'%"></div></div>';list.appendChild(el);});
  const el=document.createElement('div');el.className='prog-item prog-total';const totW=CATS.reduce((s,c)=>s+V[c].words.length,0);const totL=S.wl.filter(k=>!k.startsWith('A:')).length;el.innerHTML='<div class="prog-hdr"><div class="prog-cat" style="color:var(--gold)">🌟 All Vocabulary</div><div class="prog-ct">'+totL+'/'+totW+'</div></div><div class="prog-bar"><div class="prog-fill" style="width:'+Math.round(totL/totW*100)+'%"></div></div>';list.appendChild(el);
  // Achievements summary
  const unlocked=ACHS.filter(a=>S.wl.includes('A:'+a.id));
  const achEl=document.createElement('div');achEl.className='prog-item';achEl.innerHTML='<div class="prog-hdr"><div class="prog-cat">🏆 Achievements</div><div class="prog-ct">'+unlocked.length+'/'+ACHS.length+'</div></div><div class="prog-bar"><div class="prog-fill" style="width:'+Math.round(unlocked.length/ACHS.length*100)+'%"></div></div>';list.appendChild(achEl);
}



let bdIdx=0, bdPlaced=[], bdDone=false, bdCompleted=[];

function initBuild(){
  bdCompleted = S.bdCompleted || [];
  bdIdx = bdCompleted.length < BD_EXERCISES.length ? bdCompleted.length : 0;
  bdDone = false;
  renderBuildExercise();
  renderBuildList();
}

function renderBuildExercise(){
  bdPlaced=[];bdDone=false;
  const ex=BD_EXERCISES[bdIdx];
  if(!ex) return;
  // Header
  document.getElementById('bd-prog').textContent=(bdIdx+1)+' / '+BD_EXERCISES.length;
  document.getElementById('bd-str').textContent='🔥 '+S.streak;
  // Level label
  const levelColors={Beginner:'#6ab387',Intermediate:var_gold(),Advanced:'#e05565'};
  document.getElementById('bd-type-label').textContent=ex.level+' · Build the sentence';
  document.getElementById('bd-type-label').style.color=levelColors[ex.level]||'var(--smoke)';
  // English prompt
  document.getElementById('bd-english').textContent='"'+ex.eng+'"';
  document.getElementById('bd-hint').textContent='Hint: '+ex.tip;
  // Reset zone
  const zone=document.getElementById('bd-zone');
  zone.innerHTML='<span style="font-size:0.7rem;color:rgba(240,230,211,0.25);font-style:italic" id="bd-zone-hint">Tap words below to place them here →</span>';
  zone.style.borderColor='rgba(212,160,23,0.2)';
  // Word bank
  const bank=document.getElementById('bd-bank');
  const BDPUNCT=new Set(['።','።','?','!','።','።']);
  const shuffled=shuf([...ex.words].filter(w=>!BDPUNCT.has(w)));
  bank.innerHTML='';
  shuffled.forEach((w,i)=>{
    const btn=document.createElement('button');
    btn.id='bdbtn-'+i;
    btn.setAttribute('data-word',w);
    btn.style.cssText='background:var(--accent);color:#fff;border:none;border-radius:8px;padding:0.45rem 0.75rem;font-family:var(--font-ge);font-size:1rem;cursor:pointer;transition:opacity 0.2s;';
    btn.textContent=w;
    btn.onclick=()=>bdTapWord(i,w,btn);
    bank.appendChild(btn);
  });
  // Result
  const res=document.getElementById('bd-result');
  res.style.display='none';res.innerHTML='';
}

function var_gold(){ return '#d4a017'; }

function bdTapWord(i,w,btn){
  if(btn.style.opacity==='0.3') return; // already placed
  bdPlaced.push({i,w,btn});
  btn.style.opacity='0.3';
  btn.style.cursor='default';
  const zone=document.getElementById('bd-zone');
  // Remove hint text
  const hint=document.getElementById('bd-zone-hint');
  if(hint)hint.remove();
  const chip=document.createElement('span');
  chip.style.cssText='background:rgba(212,160,23,0.18);border:1px solid rgba(212,160,23,0.3);border-radius:8px;padding:0.4rem 0.65rem;font-family:var(--font-ge);font-size:1rem;color:var(--gold);cursor:pointer;';
  chip.textContent=w;
  chip.onclick=()=>bdRemoveChip(i,btn,chip);
  zone.appendChild(chip);
}

function bdRemoveChip(i,btn,chip){
  if(bdDone)return;
  bdPlaced=bdPlaced.filter(p=>p.i!==i);
  btn.style.opacity='1';btn.style.cursor='pointer';
  chip.remove();
  const zone=document.getElementById('bd-zone');
  if(!zone.children.length){
    zone.innerHTML='<span style="font-size:0.7rem;color:rgba(240,230,211,0.25);font-style:italic" id="bd-zone-hint">Tap words below to place them here →</span>';
  }
}

function bdCheck(){
  if(bdDone)return;
  const ex=BD_EXERCISES[bdIdx];
  // Strip punctuation tokens before comparing so ። and ? do not cause false failures
  const PUNCT=new Set(['።','።','?','!','።','።','.','،',',']);
  const placed=bdPlaced.map(p=>p.w).filter(w=>!PUNCT.has(w));
  const answer=ex.answer.filter(w=>!PUNCT.has(w));
  const ok=placed.length===answer.length&&placed.every((w,i)=>w===answer[i]);
  bdDone=true;
  const zone=document.getElementById('bd-zone');
  zone.style.borderColor=ok?'rgba(74,124,89,0.6)':'rgba(155,35,53,0.5)';
  const res=document.getElementById('bd-result');
  res.style.display='block';
  if(ok){
    res.style.cssText='display:block;border-radius:12px;padding:0.75rem 0.9rem;font-size:0.8rem;line-height:1.6;margin-bottom:0.5rem;background:rgba(74,124,89,0.12);border-left:3px solid var(--green);color:#6ab387;';
    res.innerHTML='<strong>✓ Correct!</strong> '+ex.tr+'<br><span style="font-size:0.72rem;color:var(--smoke)">'+ex.tip+'</span><br><button onclick="bdNext()" style="margin-top:0.6rem;padding:0.65rem 1.5rem;background:var(--accent);border:none;border-radius:10px;color:#fff;font-family:inherit;font-weight:700;font-size:0.75rem;cursor:pointer">Next Exercise →</button>';
    S.cor++;S.tot++;S.streak++;if(S.streak>S.best)S.best=S.streak;
    S.bdCompleted=S.bdCompleted||[];
    if(!S.bdCompleted.includes(bdIdx))S.bdCompleted.push(bdIdx);
    S.sbCorrect=(S.sbCorrect||0)+1;
    addXP(10);addCoins(4);save();checkAch();
    renderBuildList();
  } else {
    res.style.cssText='display:block;border-radius:12px;padding:0.75rem 0.9rem;font-size:0.8rem;line-height:1.6;margin-bottom:0.5rem;background:rgba(155,35,53,0.1);border-left:3px solid var(--red);color:#e05565;';
    const correct_str=ex.answer.join(' ');
    res.innerHTML='<strong>✗ Not quite.</strong><br><span style="font-size:0.72rem;color:var(--smoke)">Correct order: </span><span style="font-family:var(--font-ge);font-size:0.95rem;color:var(--sand)">'+correct_str+'</span><br><span style="font-size:0.7rem;color:rgba(240,230,211,0.45)">'+ex.tip+'</span><br><button onclick="bdReset()" style="margin-top:0.6rem;padding:0.65rem 1.5rem;background:rgba(240,230,211,0.1);border:1px solid var(--border);border-radius:10px;color:var(--sand);font-family:inherit;font-weight:700;font-size:0.75rem;cursor:pointer">↺ Try Again</button>';
    S.streak=0;S.tot++;save();
  }
  document.getElementById('bd-str').textContent='🔥 '+S.streak;
}

function bdReset(){
  bdPlaced=[];bdDone=false;
  const zone=document.getElementById('bd-zone');
  zone.innerHTML='<span style="font-size:0.7rem;color:rgba(240,230,211,0.25);font-style:italic" id="bd-zone-hint">Tap words below to place them here →</span>';
  zone.style.borderColor='rgba(212,160,23,0.2)';
  document.getElementById('bd-bank').querySelectorAll('button').forEach(b=>{b.style.opacity='1';b.style.cursor='pointer';});
  const res=document.getElementById('bd-result');res.style.display='none';res.innerHTML='';
}

function bdNext(){
  bdIdx=(bdIdx+1)%BD_EXERCISES.length;
  renderBuildExercise();
  renderBuildList();
}

function bdSpeak(){
  const ex=BD_EXERCISES[bdIdx];
  if(ex) speak(ex.tigrinya,ex.tr);
}

function bdJump(i){
  bdIdx=i;
  renderBuildExercise();
  renderBuildList();
  // Scroll to top
  document.querySelector('#screen-build .scroll-area').scrollTo({top:0,behavior:'smooth'});
}

function renderBuildList(){
  const completed=S.bdCompleted||[];
  const list=document.getElementById('bd-list');
  list.innerHTML='';
  BD_EXERCISES.forEach((ex,i)=>{
    const done=completed.includes(i);
    const active=i===bdIdx;
    const el=document.createElement('div');
    el.style.cssText='background:var(--card);border:1px solid '+(active?'rgba(193,68,14,0.5)':done?'rgba(74,124,89,0.3)':'var(--border)')+';border-radius:12px;padding:0.7rem 0.85rem;display:flex;align-items:center;gap:0.7rem;cursor:pointer;transition:border-color 0.15s;';
    const levelColors={Beginner:'#6ab387',Intermediate:'#d4a017',Advanced:'#e05565'};
    el.innerHTML='<span style="font-size:1.1rem">'+(done?'✅':active?'▶️':'⭕')+'</span>'
      +'<div style="flex:1"><div style="font-size:0.78rem;color:var(--sand);font-weight:700">'+ex.eng+'</div>'
      +'<div style="font-size:0.62rem;color:'+levelColors[ex.level]+';margin-top:0.1rem">'+ex.level+'</div></div>'
      +'<span style="font-family:var(--font-ge);font-size:0.8rem;color:var(--smoke)">'+ex.tigrinya+'</span>';
    el.onclick=()=>bdJump(i);
    list.appendChild(el);
  });
}



let wbIdx=0, wbPlaced=[], wbDone=false, wbCompleted=[];

function initWB(){
  wbCompleted = S.wbCompleted || [];
  // Find first uncompleted, or loop
  wbIdx = WB_WORDS.findIndex((_,i)=>!wbCompleted.includes(i));
  if(wbIdx<0) wbIdx=0;
  wbDone=false;
  renderWBWord();
  renderWBDots();
}

// Split Geez word into array of Unicode characters (each is one syllable)
function splitGe(word){ return [...word]; }

function renderWBWord(){
  wbPlaced=[];wbDone=false;
  const w=WB_WORDS[wbIdx];
  document.getElementById('wb-prog').textContent=(wbIdx+1)+' / '+WB_WORDS.length;
  document.getElementById('wb-str').textContent='🔥 '+S.streak;
  document.getElementById('wb-cat-label').textContent=w.cat;
  document.getElementById('wb-english').textContent=w.eng;
  document.getElementById('wb-roman').textContent=w.roman;
  // Set current word for TTS
  currentWord={g:w.ge,t:w.roman,e:w.eng};
  // Zone reset
  const zone=document.getElementById('wb-zone');
  zone.style.borderColor='rgba(212,160,23,0.25)';
  zone.innerHTML='<span id="wb-zone-hint" style="font-size:0.72rem;color:rgba(240,230,211,0.25);font-style:italic">Tap syllable tiles below →</span>';
  // Build shuffled syllable bank
  const syllables=splitGe(w.ge);
  // Add 1-2 distractor syllables from other words
  const allSyl=[...new Set(WB_WORDS.flatMap(x=>splitGe(x.ge)).filter(s=>!syllables.includes(s)))];
  const distractors=shuf(allSyl).slice(0,Math.min(2,syllables.length));
  const bank_items=shuf([...syllables.map((s,i)=>({s,idx:i,real:true})),
                          ...distractors.map((s,i)=>({s,idx:syllables.length+i,real:false}))]);
  const bank=document.getElementById('wb-bank');bank.innerHTML='';
  bank_items.forEach(item=>{
    const btn=document.createElement('button');
    btn.id='wbbtn-'+item.idx;
    btn.style.cssText='font-family:var(--font-ge);font-size:1.8rem;background:var(--card2);border:2px solid rgba(212,160,23,0.3);border-radius:12px;padding:0.5rem 0.65rem;color:var(--sand);cursor:pointer;transition:all 0.15s;min-width:52px;';
    btn.textContent=item.s;
    btn.onclick=()=>wbTap(item,btn);
    bank.appendChild(btn);
  });
  // Result
  const res=document.getElementById('wb-result');res.style.display='none';res.innerHTML='';
}

function speakWB(){
  const w=WB_WORDS[wbIdx];
  if(w) speak(w.ge,w.roman);
}

function wbTap(item,btn){
  if(btn.style.opacity==='0.25'||wbDone) return;
  btn.style.opacity='0.25';btn.style.cursor='default';
  wbPlaced.push({...item,btn});
  const zone=document.getElementById('wb-zone');
  const hint=document.getElementById('wb-zone-hint');if(hint)hint.remove();
  const chip=document.createElement('span');
  chip.style.cssText='font-family:var(--font-ge);font-size:1.8rem;background:rgba(212,160,23,0.15);border:2px solid rgba(212,160,23,0.4);border-radius:12px;padding:0.45rem 0.6rem;color:var(--gold);cursor:pointer;min-width:52px;text-align:center;display:inline-flex;align-items:center;justify-content:center;';
  chip.textContent=item.s;
  chip.onclick=()=>wbRemove(item,btn,chip);
  zone.appendChild(chip);
}

function wbRemove(item,btn,chip){
  if(wbDone)return;
  wbPlaced=wbPlaced.filter(p=>p.idx!==item.idx);
  btn.style.opacity='1';btn.style.cursor='pointer';
  chip.remove();
  const zone=document.getElementById('wb-zone');
  if(!zone.children.length)zone.innerHTML='<span id="wb-zone-hint" style="font-size:0.72rem;color:rgba(240,230,211,0.25);font-style:italic">Tap syllable tiles below →</span>';
}

function wbCheck(){
  if(wbDone)return;
  const w=WB_WORDS[wbIdx];
  const target=splitGe(w.ge);
  const placed=wbPlaced.map(p=>p.s);
  const ok=placed.join('')===w.ge;
  wbDone=true;
  const zone=document.getElementById('wb-zone');
  zone.style.borderColor=ok?'rgba(74,124,89,0.6)':'rgba(155,35,53,0.5)';
  const res=document.getElementById('wb-result');
  res.style.display='block';
  if(ok){
    res.style.cssText='display:block;border-radius:12px;padding:0.8rem 0.9rem;font-size:0.8rem;line-height:1.7;background:rgba(74,124,89,0.12);border-left:3px solid var(--green);color:#6ab387;';
    res.innerHTML='<strong>✅ Correct!</strong> You spelled <span style="font-family:var(--font-ge);font-size:1rem;color:var(--sand)">'+w.ge+'</span> perfectly!<br>'
      +'<span style="font-size:0.72rem;color:var(--smoke)">'+w.roman+' — '+w.eng+'</span><br>'
      +'<button onclick="wbNext()" style="margin-top:0.55rem;padding:0.6rem 1.4rem;background:var(--accent);border:none;border-radius:10px;color:#fff;font-family:inherit;font-weight:700;font-size:0.75rem;cursor:pointer">Next Word →</button>';
    S.cor++;S.tot++;S.streak++;if(S.streak>S.best)S.best=S.streak;
    S.wbCompleted=S.wbCompleted||[];
    if(!S.wbCompleted.includes(wbIdx))S.wbCompleted.push(wbIdx);
    addXP(8);addCoins(3);save();checkAch();
    renderWBDots();
    document.getElementById('wb-str').textContent='🔥 '+S.streak;
  } else {
    res.style.cssText='display:block;border-radius:12px;padding:0.8rem 0.9rem;font-size:0.8rem;line-height:1.7;background:rgba(155,35,53,0.1);border-left:3px solid var(--red);color:#e05565;';
    res.innerHTML='<strong>✗ Not quite!</strong> You placed: <span style="font-family:var(--font-ge);font-size:1rem">'+placed.join('')+'</span><br>'
      +'<span style="font-size:0.72rem;color:var(--smoke)">The word is: <span style="font-family:var(--font-ge);font-size:0.95rem;color:var(--sand)">'+w.ge+'</span> ('+w.roman+')</span><br>'
      +'<button onclick="wbReset()" style="margin-top:0.55rem;padding:0.6rem 1.4rem;background:rgba(240,230,211,0.1);border:1px solid var(--border);border-radius:10px;color:var(--sand);font-family:inherit;font-weight:700;font-size:0.75rem;cursor:pointer">↺ Try Again</button>';
    S.streak=0;S.tot++;save();
    document.getElementById('wb-str').textContent='🔥 '+S.streak;
  }
}

function wbReset(){
  wbPlaced=[];wbDone=false;
  const zone=document.getElementById('wb-zone');
  zone.style.borderColor='rgba(212,160,23,0.25)';
  zone.innerHTML='<span id="wb-zone-hint" style="font-size:0.72rem;color:rgba(240,230,211,0.25);font-style:italic">Tap syllable tiles below →</span>';
  document.getElementById('wb-bank').querySelectorAll('button').forEach(b=>{b.style.opacity='1';b.style.cursor='pointer';});
  const res=document.getElementById('wb-result');res.style.display='none';
}

function wbNext(){
  wbIdx=(wbIdx+1)%WB_WORDS.length;
  renderWBWord();renderWBDots();
  document.querySelector('#screen-wordbuild .scroll-area').scrollTo({top:0,behavior:'smooth'});
}

function renderWBDots(){
  const completed=S.wbCompleted||[];
  const dots=document.getElementById('wb-dots');if(!dots)return;
  dots.innerHTML='';
  WB_WORDS.forEach((_,i)=>{
    const dot=document.createElement('div');
    dot.style.cssText='width:10px;height:10px;border-radius:50%;cursor:pointer;transition:all 0.2s;'
      +(i===wbIdx?'background:var(--accent);transform:scale(1.4);':
        completed.includes(i)?'background:var(--green);opacity:0.7;':
        'background:rgba(240,230,211,0.15);');
    dot.title=WB_WORDS[i].eng;
    dot.onclick=()=>{wbIdx=i;renderWBWord();renderWBDots();document.querySelector('#screen-wordbuild .scroll-area').scrollTo({top:0,behavior:'smooth'});};
    dots.appendChild(dot);
  });
}

/* ═══════════════════════════════════════════
   CANVAS — stroke tracing with guide + undo
═══════════════════════════════════════════ */





/* ══════════════════════════════════════════
   SPACED REPETITION
══════════════════════════════════════════ */
function srScore(word,catKey){
  const k=catKey+':'+word.t;
  const e=(S.wordErrors||{})[k]||0,c=(S.wordCorrect||{})[k]||0,t=e+c;
  return t===0?0:c/t;
}
function srWeightedDeck(catKey){
  const words=V[catKey].words,weighted=[];
  words.forEach(w=>{const s=srScore(w,catKey);const reps=s<0.3?4:s<0.6?2:1;for(let i=0;i<reps;i++)weighted.push(w);});
  return shuf(weighted);
}
function srMarkCorrect(word,cat){if(!S.wordCorrect)S.wordCorrect={};const k=cat+':'+word.t;S.wordCorrect[k]=(S.wordCorrect[k]||0)+1;}
function srMarkError(word,cat){if(!S.wordErrors)S.wordErrors={};const k=cat+':'+word.t;S.wordErrors[k]=(S.wordErrors[k]||0)+1;}
function srBadge(word,cat){
  const score=srScore(word,cat);
  const total=((S.wordErrors||{})[cat+':'+word.t]||0)+((S.wordCorrect||{})[cat+':'+word.t]||0);
  if(total===0)return '';
  if(score<0.4)return '<span class="q-sr-badge q-sr-weak">⚠ Weak word</span>';
  if(score<0.75)return '<span class="q-sr-badge q-sr-review">↻ Reviewing</span>';
  return '<span class="q-sr-badge q-sr-strong">✓ Strong</span>';
}

/* ══════════════════════════════════════════
   DAILY WORD
══════════════════════════════════════════ */
function getDailyWord(){
  const allWords=CATS.flatMap(c=>V[c].words);
  const day=Math.floor(Date.now()/86400000);
  return allWords[day%allWords.length];
}
function initDailyWord(){
  const w=getDailyWord();
  const ge=document.getElementById('daily-ge'),en=document.getElementById('daily-en');
  if(ge)ge.textContent=w.g;if(en)en.textContent=w.e+' · tap to hear';
}
function speakDaily(){const w=getDailyWord();speak(w.g,w.t);}

/* ══════════════════════════════════════════
   LEARN SCREEN
══════════════════════════════════════════ */
let currentLearnTab='script';
const LTAB_ON='background:var(--accent);border-color:var(--accent);color:#fff';
const LTAB_OFF='background:var(--card);border-color:var(--border);color:var(--smoke)';

function switchLearnTab(tab){
  currentLearnTab=tab;
  ['script','grammar','culture','dialect'].forEach(t=>{
    const btn=document.getElementById('ltab-'+t);if(btn)btn.classList.toggle('on',t===tab);
    const pane=document.getElementById('learn-'+t+'-pane');if(pane)pane.style.display=t===tab?'block':'none';
  });
  if(tab==='grammar')buildLearnGrammar();
  if(tab==='culture')buildCultureList();
  if(tab==='dialect')buildDialectList();
  if(tab==='script')initLearnScript();
}
function initLearn(){['script','grammar','culture','dialect'].forEach(t=>{const btn=document.getElementById('ltab-'+t);if(btn)btn.classList.toggle('on',t===currentLearnTab);});switchLearnTab(currentLearnTab);}

/* Script sub-tabs */
let currentScriptTab2='chart';
function switchScriptTab(tab){
  currentScriptTab2=tab;
  ['chart','write','rquiz'].forEach(t=>{
    const btn=document.querySelector('#screen-learn #stab-'+t);if(btn)btn.classList.toggle('on',t===tab);
    const pane=document.getElementById('stab-'+t+'-pane2');if(pane)pane.style.display=t===tab?'block':'none';
  });
  if(tab==='rquiz'&&!rqQueue2.length)nextRQ2();
}
function initLearnScript(){
  const vh=document.getElementById('vowel-hdr2');
  if(vh&&!vh.children.length){vh.innerHTML='<div style="width:25px;flex-shrink:0"></div>'+VOWEL_LABELS.map(v=>'<div style="flex:1;text-align:center;font-size:0.48rem;color:var(--gold);font-weight:700">'+v+'</div>').join('');}
  const chart=document.getElementById('fidel-chart2');
  if(chart&&!chart.children.length){
    FIDEL.forEach((fam,fi)=>{
      const row=document.createElement('div');row.style.cssText='display:flex;gap:2px;padding:0 1rem;margin-bottom:2px;align-items:center';
      row.innerHTML='<div style="width:25px;font-size:0.48rem;color:var(--smoke);text-align:right;padding-right:3px">'+fam.name+'</div>';
      fam.forms.forEach((ch,vi)=>{
        const cell=document.createElement('div');
        cell.style.cssText='flex:1;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:var(--card);border:1px solid var(--border);border-radius:5px;cursor:pointer';
        cell.innerHTML='<span style="font-family:var(--font-ge);font-size:0.95rem;color:var(--sand)">'+ch+'</span>';
        cell.onclick=()=>showFidelDetail2(fi,vi,cell);
        row.appendChild(cell);
      });
      chart.appendChild(row);
    });
  }
  const picker=document.getElementById('write-char-pick2');
  if(picker&&!picker.children.length){
    FIDEL.forEach((fam,fi)=>{
      const btn=document.createElement('button');
      btn.style.cssText='background:var(--card);border:1px solid var(--border);border-radius:7px;padding:0.32rem 0.42rem;font-family:var(--font-ge);font-size:0.95rem;color:var(--sand);cursor:pointer';
      btn.textContent=fam.forms[0];
      btn.onclick=()=>{picker.querySelectorAll('button').forEach(b=>b.style.borderColor='var(--border)');btn.style.borderColor='var(--gold)';document.getElementById('trace-char2').textContent=fam.forms[0];currentFidelChar={fam,vi:0,ch:fam.forms[0]};writeXPclaimed2=false;clearCanvas2();};
      picker.appendChild(btn);
    });
    if(picker.children[0]){picker.children[0].style.borderColor='var(--gold)';currentFidelChar={fam:FIDEL[0],vi:0,ch:FIDEL[0].forms[0]};}
  }
  initCanvas2();
  switchScriptTab(currentScriptTab2);
}

function showFidelDetail2(fi,vi,cell){
  const fam=FIDEL[fi],ch=fam.forms[vi];currentFidelChar={fam,vi,ch};
  if(!S.fidelSeen)S.fidelSeen=[];const k='f:'+fi;
  if(!S.fidelSeen.includes(k)){S.fidelSeen.push(k);S.fidelLearned=S.fidelSeen.length;addXP(3);addCoins(1);save();checkAch();}
  document.querySelectorAll('#fidel-chart2 div>div').forEach(c=>c.style.background='var(--card)');
  cell.style.background='rgba(212,160,23,0.15)';
  const det=document.getElementById('fidel-detail2');det.style.display='block';
  det.innerHTML='<div style="font-family:var(--font-ge);font-size:2.8rem;color:var(--sand);text-align:center">'+ch+'</div>'
    +'<button class="tts-btn" onclick="speakFidel2()" style="display:block;margin:0.4rem auto">🔊 Listen</button>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.4rem"><span style="font-size:0.58rem;color:var(--smoke);text-transform:uppercase">Family</span><span style="font-size:0.82rem;color:var(--sand);font-weight:600">'+fam.name+'</span></div>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.35rem"><span style="font-size:0.58rem;color:var(--smoke);text-transform:uppercase">Sound</span><span style="font-size:0.82rem;color:var(--sand);font-weight:600">'+fam.sound+'</span></div>'
    +'<div style="font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--smoke);margin:0.7rem 0 0.25rem">All 7 forms</div>'
    +'<div style="display:flex;gap:0.32rem;flex-wrap:wrap;justify-content:center">'+fam.forms.map((f,i)=>'<div style="display:flex;flex-direction:column;align-items:center;gap:2px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:0.4rem 0.32rem;min-width:34px;cursor:pointer" onclick="showFidelDetail2('+fi+','+i+',this)"><span style="font-family:var(--font-ge);font-size:1.1rem;color:var(--sand)">'+f+'</span><span style="font-size:0.48rem;color:var(--smoke)">'+fam.name+(VOWEL_LABELS[i]==='ə'?'':VOWEL_LABELS[i])+'</span></div>').join('')+'</div>'
    +'<div style="font-size:0.66rem;color:var(--smoke);margin-top:0.65rem;line-height:1.55;border-top:1px solid var(--border);padding-top:0.55rem">'+fam.note+'</div>';
  setTimeout(()=>det.scrollIntoView({behavior:'smooth',block:'nearest'}),80);
}
function speakFidel2(){if(currentFidelChar)speak(currentFidelChar.ch,currentFidelChar.fam.name+(VOWEL_LABELS[currentFidelChar.vi]==='ə'?'':VOWEL_LABELS[currentFidelChar.vi]));}

/* Canvas 2 */
let canvas2,ctx2,drawing2=false,strokePoints2=[],allStrokes2=[],currentStroke2=[],writeXPclaimed2=false;
function initCanvas2(){
  canvas2=document.getElementById('writeCanvas2');if(!canvas2||canvas2._init)return;canvas2._init=true;
  const dpr=window.devicePixelRatio||1;
  function resize(){const w=canvas2.offsetWidth;canvas2.width=w*dpr;canvas2.height=220*dpr;canvas2.style.height='220px';ctx2=canvas2.getContext('2d');ctx2.scale(dpr,dpr);redrawStrokes2();}
  resize();window.addEventListener('resize',resize);
  function gp(e){const rect=canvas2.getBoundingClientRect();const src=e.touches?e.touches[0]:e;return{x:src.clientX-rect.left,y:src.clientY-rect.top};}
  canvas2.addEventListener('pointerdown',e=>{drawing2=true;currentStroke2=[];const p=gp(e);ctx2.strokeStyle='#f0c040';ctx2.lineWidth=4;ctx2.lineCap='round';ctx2.lineJoin='round';ctx2.beginPath();ctx2.moveTo(p.x,p.y);currentStroke2.push(p);strokePoints2.push(p);e.preventDefault();});
  canvas2.addEventListener('pointermove',e=>{if(!drawing2)return;const p=gp(e);ctx2.lineTo(p.x,p.y);ctx2.stroke();ctx2.beginPath();ctx2.moveTo(p.x,p.y);currentStroke2.push(p);strokePoints2.push(p);e.preventDefault();});
  canvas2.addEventListener('pointerup',()=>{if(drawing2&&currentStroke2.length>1)allStrokes2.push([...currentStroke2]);drawing2=false;ctx2.beginPath();updateAccuracy2();updateStrokeCount2();runHWR2();});
  canvas2.addEventListener('pointerleave',()=>{if(drawing2){if(currentStroke2.length>1)allStrokes2.push([...currentStroke2]);drawing2=false;ctx2.beginPath();updateAccuracy2();updateStrokeCount2();runHWR2();}});
}
function redrawStrokes2(){if(!ctx2)return;ctx2.clearRect(0,0,canvas2.offsetWidth,220);ctx2.strokeStyle='#f0c040';ctx2.lineWidth=4;ctx2.lineCap='round';ctx2.lineJoin='round';allStrokes2.forEach(s=>{if(s.length<2)return;ctx2.beginPath();ctx2.moveTo(s[0].x,s[0].y);s.forEach(p=>ctx2.lineTo(p.x,p.y));ctx2.stroke();});}
function undoStroke2(){if(!allStrokes2.length)return;allStrokes2.pop();strokePoints2=allStrokes2.flat();redrawStrokes2();updateAccuracy2();updateStrokeCount2();}
function clearCanvas2(){if(!canvas2)return;allStrokes2=[];strokePoints2=[];currentStroke2=[];writeXPclaimed2=false;redrawStrokes2();const ab=document.getElementById('accuracy-badge2');if(ab){ab.textContent='';ab.style.color='';}const sc=document.getElementById('stroke-count2');if(sc)sc.textContent='';const hr=document.getElementById('hw-result2');if(hr)hr.textContent='';canvas2.style.borderColor='rgba(212,160,23,0.18)';}
function updateStrokeCount2(){const el=document.getElementById('stroke-count2');if(el)el.textContent=allStrokes2.length+' stroke'+(allStrokes2.length!==1?'s':'');}
function updateAccuracy2(){
  if(strokePoints2.length<5)return;
  const w=canvas2.offsetWidth,h=220,dpr=window.devicePixelRatio||1;
  const ch=document.getElementById('trace-char2')?.textContent||'ሀ';
  const off=document.createElement('canvas');off.width=w*dpr;off.height=h*dpr;
  const oc=off.getContext('2d');oc.scale(dpr,dpr);
  const fs=Math.min(w,h)*0.55;oc.font=fs+'px var(--font-ge)';oc.fillStyle='#fff';oc.textAlign='center';oc.textBaseline='middle';oc.fillText(ch,w/2,h/2);
  const data=oc.getImageData(0,0,w*dpr,h*dpr).data;
  const tpx=new Set();for(let i=0;i<data.length;i+=4)if(data[i+3]>40)tpx.add(Math.floor(i/4));
  if(!tpx.size)return;
  let hits=0;strokePoints2.forEach(p=>{for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++){const px=Math.round(p.x*dpr+dx),py=Math.round(p.y*dpr+dy);if(px>=0&&px<w*dpr&&py>=0&&py<h*dpr&&tpx.has(py*(w*dpr)+px))hits++;}});
  const acc=Math.min(100,Math.round((hits/Math.min(strokePoints2.length*49,tpx.size*2))*100*2.5));
  const ab=document.getElementById('accuracy-badge2');
  if(acc>=75){if(ab){ab.textContent='🎯 '+acc+'% — Great!';ab.style.color='#6ab387';}canvas2.style.borderColor='rgba(74,124,89,0.7)';}
  else if(acc>=45){if(ab){ab.textContent='✏️ '+acc+'% — Good effort';ab.style.color='var(--gold)';}canvas2.style.borderColor='rgba(212,160,23,0.7)';}
  else{if(ab){ab.textContent='↺ '+acc+'% — Trace the ghost';ab.style.color='#e05565';}canvas2.style.borderColor='rgba(155,35,53,0.6)';}
  if(acc>(S.bestAccuracy||0)){S.bestAccuracy=acc;save();checkAch();}
}
function claimWriteXP2(){if(writeXPclaimed2){toast('Clear and try again!');return;}writeXPclaimed2=true;S.writeSessions=(S.writeSessions||0)+1;addXP(10);addCoins(2);save();checkAch();toast('✍️ Practice saved! +10 XP +2🪙');}
function runHWR2(){
  if(strokePoints2.length<10)return;
  const w=canvas2.offsetWidth,h=220,dpr=window.devicePixelRatio||1;
  const allChars=FIDEL.flatMap(f=>f.forms);
  const scores=[];
  allChars.forEach(ch=>{
    const off=document.createElement('canvas');off.width=w*dpr;off.height=h*dpr;
    const oc=off.getContext('2d');oc.scale(dpr,dpr);
    const fs=Math.min(w,h)*0.55;
    oc.font=fs+'px var(--font-ge)';
    oc.fillStyle='#fff';oc.textAlign='center';oc.textBaseline='middle';
    oc.fillText(ch,w/2,h/2);
    const data=oc.getImageData(0,0,w*dpr,h*dpr).data;
    const tpx=new Set();for(let i=0;i<data.length;i+=4)if(data[i+3]>40)tpx.add(Math.floor(i/4));
    if(!tpx.size){scores.push({ch,score:0});return;}
    let hits=0;
    strokePoints2.forEach(p=>{
      for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++){
        const px=Math.round(p.x*dpr+dx),py=Math.round(p.y*dpr+dy);
        if(px>=0&&px<w*dpr&&py>=0&&py<h*dpr&&tpx.has(py*(w*dpr)+px))hits++;
      }
    });
    scores.push({ch,score:hits/Math.max(1,Math.min(strokePoints2.length*49,tpx.size*2))});
  });
  scores.sort((a,b)=>b.score-a.score);
  const top3=scores.slice(0,3);
  const target=document.getElementById('trace-char2')?.textContent||'';
  if(top3[0]?.ch===target){S.hwCorrect=(S.hwCorrect||0)+1;save();checkAch();}
  const hr=document.getElementById('hw-result2');
  if(!hr)return;
  const isMatch=top3[0]?.ch===target;
  let html2='<div style="font-size:0.58rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--smoke);margin-bottom:0.28rem">Your drawing looks like:</div>';
  html2+='<div style="display:flex;gap:0.42rem">';
  top3.forEach((s,i)=>{
    const pct=Math.min(99,Math.round(s.score*250));
    const border=i===0?'rgba(212,160,23,0.4)':'var(--border)';
    html2+='<div style="background:var(--card2);border:1px solid '+border+';border-radius:9px;padding:0.42rem 0.58rem;text-align:center;cursor:pointer" onclick="speak(this.dataset.ch,this.dataset.ch)" data-ch="'+s.ch+'">';
    html2+='<span style="font-family:var(--font-ge);font-size:1.6rem;display:block">'+s.ch+'</span>';
    html2+='<span style="font-size:0.52rem;color:var(--smoke)">'+pct+'%</span></div>';
  });
  html2+='</div>';
  html2+=isMatch
    ?'<div style="font-size:0.65rem;color:#6ab387;margin-top:0.3rem">Great match!</div>'
    :'<div style="font-size:0.65rem;color:var(--smoke);margin-top:0.3rem">Tap a character to hear it</div>';
  hr.innerHTML=html2;
}

function showGuideAnim(){
  const gc=document.getElementById('guideCanvas2');if(!gc)return;
  const w=canvas2.offsetWidth,h=220,dpr=window.devicePixelRatio||1;
  gc.width=w*dpr;gc.height=h*dpr;gc.style.height='220px';
  const gCtx=gc.getContext('2d');gCtx.scale(dpr,dpr);gc.style.opacity='1';
  let frame=0;
  function af(){gCtx.clearRect(0,0,w,h);const t=frame/80;const pulse=0.7+0.3*Math.sin(frame*0.3);gCtx.beginPath();gCtx.arc(w/2-w*0.15,h/2-h*0.2,10*pulse,0,Math.PI*2);gCtx.fillStyle='rgba(193,68,14,'+pulse+')';gCtx.fill();gCtx.strokeStyle='rgba(212,160,23,0.7)';gCtx.lineWidth=3;gCtx.lineCap='round';gCtx.beginPath();if(t<0.5){gCtx.moveTo(w/2-w*0.15,h/2-h*0.15);gCtx.lineTo(w/2-w*0.15,h/2-h*0.15+t*2*h*0.3);}else{gCtx.moveTo(w/2-w*0.15,h/2+h*0.15);gCtx.lineTo(w/2-w*0.15+(t-0.5)*2*w*0.3,h/2+h*0.15);}gCtx.stroke();gCtx.font='bold 10px system-ui';gCtx.fillStyle='rgba(240,230,211,0.5)';gCtx.fillText('Start here',w/2-w*0.35,h/2-h*0.28);frame++;if(frame<160)requestAnimationFrame(af);else setTimeout(()=>{gc.style.opacity='0';},400);}
  requestAnimationFrame(af);
}

/* Recognize quiz 2 */
let rqQueue2=[];
function nextRQ2(){
  if(!rqQueue2.length)rqQueue2=shuf(FIDEL.flatMap(fam=>fam.forms.map((f,vi)=>({fam,vi,ch:f}))));
  const item=rqQueue2.pop();if(!item)return;
  currentFidelChar=item;
  document.getElementById('rq-ge2').textContent=item.ch;
  const askSound=Math.random()>0.4;
  document.getElementById('rq-prompt2').textContent=askSound?'What sound does this make?':'Which consonant family is this?';
  document.getElementById('rq-result2').innerHTML='';
  const correct=askSound?(item.fam.name+(VOWEL_LABELS[item.vi]==='ə'?'ä':VOWEL_LABELS[item.vi])):item.fam.name;
  const wrongs=shuf(FIDEL.filter(f=>f.name!==item.fam.name)).slice(0,3);
  const opts=shuf([correct,...wrongs.map(f=>askSound?(f.name+(VOWEL_LABELS[item.vi]==='ə'?'ä':VOWEL_LABELS[item.vi])):f.name)]);
  const wrap=document.getElementById('rq-opts2');wrap.innerHTML='';
  opts.forEach(o=>{const btn=document.createElement('button');btn.style.cssText='background:var(--card);border:2px solid var(--border);border-radius:11px;padding:0.7rem 0.4rem;text-align:center;cursor:pointer;font-family:inherit;font-size:0.76rem;color:var(--sand);width:100%';btn.textContent=o;btn.onclick=()=>{document.querySelectorAll('#rq-opts2 button').forEach(b=>{b.disabled=true;if(b.textContent===correct)b.style.cssText+='border-color:var(--green);background:rgba(74,124,89,0.12);color:#6ab387';else if(b===btn&&o!==correct)b.style.cssText+='border-color:var(--red);background:rgba(155,35,53,0.1);color:#e05565';});const ok=o===correct;S.tot++;if(ok){S.cor++;S.streak++;if(S.streak>S.best)S.best=S.streak;S.rqCorrect=(S.rqCorrect||0)+1;addXP(8);addCoins(2);checkAch();}else S.streak=0;if(!S.fidelSeen)S.fidelSeen=[];const fk='f:'+FIDEL.indexOf(item.fam);if(!S.fidelSeen.includes(fk)){S.fidelSeen.push(fk);S.fidelLearned=S.fidelSeen.length;}save();document.getElementById('rq-result2').innerHTML='<div class="result-box '+(ok?'rc':'rw')+'" style="margin:0.6rem 1rem 0"><div class="rv">'+(ok?'✓ Correct!':'✗ It was: '+correct)+'</div><div class="rn">'+item.fam.note+'</div></div><button class="next-btn" onclick="nextRQ2()">Next →</button>';};wrap.appendChild(btn);});
}

/* Grammar in Learn */
let learnGrammarTab2=0;
function buildLearnGrammar(){
  const tabsEl=document.getElementById('grammar-tabs2');
  if(tabsEl&&!tabsEl.children.length){GRAMMAR_LESSONS.forEach((l,i)=>{const b=document.createElement('button');b.style.cssText='flex-shrink:0;padding:0.46rem 0.76rem;border-radius:9px;font-size:0.6rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;cursor:pointer;white-space:nowrap;border:1px solid;'+(i===0?LTAB_ON:LTAB_OFF);b.textContent=l.title;b.onclick=()=>{learnGrammarTab2=i;tabsEl.querySelectorAll('button').forEach((bb,ii)=>bb.style.cssText='flex-shrink:0;padding:0.46rem 0.76rem;border-radius:9px;font-size:0.6rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;cursor:pointer;white-space:nowrap;border:1px solid;'+(ii===i?LTAB_ON:LTAB_OFF));renderLearnGrammar(i);};tabsEl.appendChild(b);});}
  renderLearnGrammar(learnGrammarTab2);
}
function renderLearnGrammar(idx){
  const lesson=GRAMMAR_LESSONS[idx];
  const ex=SB_EXERCISES[idx%SB_EXERCISES.length];
  window._sbCurrent=ex;window._sbShuffled=shuf([...ex.words].filter(w=>!['።','።','?','!','።'].includes(w)));window._sbPlaced=[];
  const c=document.getElementById('grammar-content2');if(!c)return;
  c.innerHTML='<div class="lesson-card"><div class="lesson-hdr"><div class="lesson-title">'+lesson.title+'</div><div class="lesson-subtitle">'+lesson.sub+'</div></div><div class="lesson-body">'+lesson.content+'</div></div>'
    +'<div style="margin:0 1rem"><div style="font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--smoke);margin:0 0 0.38rem">Sentence Builder</div>'
    +'<div style="font-size:0.7rem;color:var(--smoke);margin-bottom:0.38rem;font-style:italic">Build: "'+ex.eng+'"</div>'
    +'<div id="sb-target2" style="background:var(--card2);border:1px solid rgba(212,160,23,0.2);border-radius:11px;padding:0.7rem;min-height:48px;margin-bottom:0.5rem;display:flex;flex-wrap:wrap;gap:0.3rem;align-items:flex-start"><span style="font-size:0.66rem;color:var(--smoke);font-style:italic">Tap words below →</span></div>'
    +'<div id="sb-bank2" style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.5rem">'+window._sbShuffled.map((w,i)=>'<button id="sbw2-'+i+'" onclick="sbTap2('+i+')" style="background:var(--accent);color:#fff;border:none;border-radius:7px;padding:0.36rem 0.58rem;font-family:var(--font-ge);font-size:0.86rem;cursor:pointer">'+w+'</button>').join('')+'</div>'
    +'<div style="display:flex;gap:0.4rem;margin-bottom:0.5rem"><button onclick="sbCheck2()" style="flex:1;padding:0.62rem;border:none;border-radius:10px;font-family:inherit;font-size:0.68rem;font-weight:700;text-transform:uppercase;cursor:pointer;background:var(--green);color:#fff;letter-spacing:0.07em">✓ Check</button><button onclick="sbReset2()" style="flex:0 0 68px;padding:0.62rem;border:none;border-radius:10px;font-family:inherit;font-size:0.68rem;font-weight:700;cursor:pointer;background:rgba(240,230,211,0.07);color:var(--smoke);border:1px solid var(--border)">↺ Reset</button></div>'
    +'<div id="sb-result2" style="display:none;border-radius:10px;padding:0.62rem 0.78rem;font-size:0.74rem;line-height:1.5;margin-bottom:0.45rem"></div></div><div style="height:0.7rem"></div>';
}
function sbTap2(i){const w=window._sbShuffled[i];const btn=document.getElementById('sbw2-'+i);if(!btn||btn.style.opacity==='0.3')return;window._sbPlaced.push({word:w,idx:i});btn.style.opacity='0.3';btn.style.cursor='default';const t=document.getElementById('sb-target2');if(window._sbPlaced.length===1)t.innerHTML='';const chip=document.createElement('span');chip.style.cssText='background:rgba(212,160,23,0.12);border:1px solid rgba(212,160,23,0.2);border-radius:7px;padding:0.36rem 0.58rem;font-family:var(--font-ge);font-size:0.86rem;color:var(--gold);cursor:pointer';chip.textContent=w;chip.onclick=()=>{window._sbPlaced=window._sbPlaced.filter(p=>p.idx!==i);btn.style.opacity='1';btn.style.cursor='pointer';chip.remove();if(!document.getElementById('sb-target2').children.length)document.getElementById('sb-target2').innerHTML='<span style="font-size:0.66rem;color:var(--smoke);font-style:italic">Tap words below →</span>';};t.appendChild(chip);}
function sbCheck2(){const PUNCT=new Set(['።','።','?','!']);const placed=window._sbPlaced.map(p=>p.word).filter(w=>!PUNCT.has(w));const answer=(window._sbCurrent.answer||[]).filter(w=>!PUNCT.has(w));const ok=placed.length===answer.length&&placed.every((w,i)=>w===answer[i]);const r=document.getElementById('sb-result2');r.style.display='block';r.style.cssText='display:block;border-radius:10px;padding:0.62rem 0.78rem;font-size:0.74rem;line-height:1.5;margin-bottom:0.45rem;'+(ok?'background:rgba(74,124,89,0.1);border-left:3px solid var(--green);color:#6ab387':'background:rgba(155,35,53,0.08);border-left:3px solid var(--red);color:#e05565');if(ok){r.innerHTML='✓ Correct! +10 XP +3🪙';S.sbCorrect=(S.sbCorrect||0)+1;addXP(10);addCoins(3);save();checkAch();setTimeout(()=>renderLearnGrammar(learnGrammarTab2),1500);}else r.innerHTML='✗ Hint: '+window._sbCurrent.hint+'<br><span style="font-family:var(--font-ge);font-size:0.93rem;color:var(--sand)">'+(window._sbCurrent.answer||[]).join(' ')+'</span>';}
function sbReset2(){window._sbPlaced=[];document.querySelectorAll('[id^="sbw2-"]').forEach(b=>{b.style.opacity='1';b.style.cursor='pointer';});document.getElementById('sb-target2').innerHTML='<span style="font-size:0.66rem;color:var(--smoke);font-style:italic">Tap words below →</span>';document.getElementById('sb-result2').style.display='none';}

/* Culture */
let openCultureId=null;
function buildCultureList(){
  const el=document.getElementById('culture-list');if(!el)return;el.innerHTML='';
  CULTURE_TOPICS.forEach(t=>{
    const card=document.createElement('div');card.className='culture-topic';
    card.innerHTML='<div class="culture-hdr"><div class="culture-ico2">'+t.ico+'</div><div><div class="culture-name">'+t.name+'</div><div class="culture-sub ge">'+t.sub+'</div></div></div><div id="cult-'+t.id+'" class="culture-body'+(openCultureId===t.id?' open':'')+'">'+t.content+'</div>';
    card.querySelector('.culture-hdr').onclick=()=>{const body=document.getElementById('cult-'+t.id);const was=body.classList.contains('open');document.querySelectorAll('.culture-body').forEach(b=>b.classList.remove('open'));if(!was){body.classList.add('open');openCultureId=t.id;if(!(S.cultureTopics||[]).includes(t.id)){S.cultureTopics=S.cultureTopics||[];S.cultureTopics.push(t.id);S.cultureRead=(S.cultureTopics.length);addXP(5);addCoins(2);save();checkAch();}}else openCultureId=null;};
    el.appendChild(card);
  });
}

/* Dialect */
function buildDialectList(){
  const el=document.getElementById('dialect-list');if(!el)return;el.innerHTML='';
  DIALECT_NOTES.forEach(d=>{
    const card=document.createElement('div');card.className='dialect-card';
    card.innerHTML='<div class="dialect-title">'+d.title+'</div><div class="dialect-cols"><div class="dialect-col"><div class="dialect-col-hdr dcol-eri">🇪🇷 Eritrean</div><div class="dialect-ge ge">'+d.eri.ge+'</div><div class="dialect-tr">'+d.eri.tr+'</div></div><div class="dialect-col"><div class="dialect-col-hdr dcol-tig">🏔️ Tigray</div><div class="dialect-ge ge">'+d.tig.ge+'</div><div class="dialect-tr">'+d.tig.tr+'</div></div></div><div class="dialect-note">'+d.note+'</div>';
    el.appendChild(card);
  });
}

/* ══════════════════════════════════════════
   STORIES
══════════════════════════════════════════ */
let currentStory=null,currentPopupWord=null,currentStoryLineIdx=0,currentStoryTab='stories';
let currentConvo=null,cvTurnIdx=0;

function switchStoryTab(tab){
  currentStoryTab=tab;
  ['stories','convo'].forEach(t=>{
    const btn=document.getElementById('stb-'+t);
    if(btn)btn.style.cssText='flex:1;padding:0.5rem;border-radius:9px;font-size:0.62rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;cursor:pointer;border:1px solid;transition:all 0.2s;'+(t===tab?LTAB_ON:LTAB_OFF);
    const pane=document.getElementById(t==='stories'?'stories-pane':'convo-pane');
    if(pane)pane.style.display=t===tab?'block':'none';
  });
}

function initStoriesScreen(){
  const sl=document.getElementById('story-list');
  if(sl&&!sl.children.length){STORIES.forEach(story=>{const card=document.createElement('div');card.className='story-card';card.innerHTML='<div class="story-ico">'+story.ico+'</div><div class="story-title">'+story.title+'</div><div class="story-ge ge">'+story.titleGe+'</div><div class="story-desc">'+story.desc+'</div><div class="story-chips"><span class="story-chip">'+story.level+'</span><span class="story-chip">'+story.wordCount+' key words</span></div>';card.onclick=()=>openStory(story);sl.appendChild(card);});}
  const cl=document.getElementById('convo-list');
  if(cl&&!cl.children.length){CONVOS.forEach(convo=>{const card=document.createElement('div');card.className='convo-card';card.innerHTML='<div class="convo-ico">'+convo.ico+'</div><div class="convo-title">'+convo.title+'</div><div class="convo-desc">'+convo.desc+'</div>';card.onclick=()=>openConvo(convo);cl.appendChild(card);});}
  switchStoryTab(currentStoryTab);
}

function openStory(story){
  currentStory=story;currentStoryLineIdx=0;
  document.getElementById('sr-title').textContent=story.title;
  const content=document.getElementById('story-content');content.innerHTML='';
  story.paragraphs.forEach(para=>{
    const p=document.createElement('p');p.className='story-para';
    para.tokens.forEach(tok=>{const span=document.createElement('span');span.className='story-word';span.textContent=tok.g;span.onclick=()=>showWordPopup(tok,span);p.appendChild(span);p.appendChild(document.createTextNode(' '));});
    const en=document.createElement('div');en.style.cssText='font-size:0.68rem;color:rgba(240,230,211,0.28);font-style:italic;margin-top:0.12rem;margin-bottom:0.5rem';en.textContent=para.en;p.appendChild(en);content.appendChild(p);
  });
  if(!(S.storiesReadIds||[]).includes(story.id)){S.storiesRead=(S.storiesRead||0)+1;S.storiesReadIds=S.storiesReadIds||[];S.storiesReadIds.push(story.id);addXP(15);addCoins(5);save();checkAch();setTimeout(()=>toast('📖 Story read! +15 XP +5🪙'),400);}
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-story-reader').classList.add('active');
}
function showWordPopup(tok,span){
  document.querySelectorAll('.story-word').forEach(s=>s.classList.remove('hl'));span.classList.add('hl');
  currentPopupWord=tok;
  document.getElementById('wp-ge').textContent=tok.g;
  document.getElementById('wp-tr').textContent=tok.t||'';
  document.getElementById('wp-en').textContent=tok.e||'';
  document.getElementById('word-popup').classList.remove('hidden');
}
function closeWordPopup(){document.getElementById('word-popup').classList.add('hidden');document.querySelectorAll('.story-word').forEach(s=>s.classList.remove('hl'));}
function speakPopupWord(){if(currentPopupWord)speak(currentPopupWord.g,currentPopupWord.t||currentPopupWord.g);}
function speakStoryLine(){if(!currentStory)return;const para=currentStory.paragraphs[currentStoryLineIdx%currentStory.paragraphs.length];if(para){speak(para.tokens.map(t=>t.g).join(' '),para.en);currentStoryLineIdx++;}}

/* Conversations */
function openConvo(convo){
  currentConvo=convo;cvTurnIdx=0;
  document.getElementById('cv-title').textContent=convo.title;
  document.getElementById('cv-scene-label').textContent='📍 Scene';
  document.getElementById('cv-scene-text').textContent=convo.scene;
  document.getElementById('cv-bubbles').innerHTML='';
  document.getElementById('cv-choices').innerHTML='';
  document.getElementById('cv-fb').style.display='none';
  document.getElementById('cv-next-wrap').innerHTML='';
  document.getElementById('cv-str').textContent='🔥 '+S.streak;
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-convo').classList.add('active');
  renderConvoTurn();
}
function renderConvoTurn(){
  if(!currentConvo||cvTurnIdx>=currentConvo.turns.length){showConvoDone();return;}
  const turn=currentConvo.turns[cvTurnIdx];
  const bubbles=document.getElementById('cv-bubbles');
  const bubble=document.createElement('div');bubble.className='bubble bubble-them';
  bubble.innerHTML='<span class="bge ge">'+turn.them.ge+'</span><span class="btr">'+turn.them.tr+'</span><span class="ben">'+turn.them.en+'</span>';
  bubbles.appendChild(bubble);setTimeout(()=>{bubbles.scrollTop=bubbles.scrollHeight;},50);
  speak(turn.them.ge,turn.them.tr);
  const choices=document.getElementById('cv-choices');choices.innerHTML='';
  turn.choices.forEach(ch=>{const btn=document.createElement('button');btn.className='choice-btn';btn.innerHTML='<span class="ge">'+ch.ge+'</span><span class="choice-en">'+ch.en+'</span>';btn.onclick=()=>handleChoice(ch,btn,bubbles);choices.appendChild(btn);});
  document.getElementById('cv-fb').style.display='none';
}
function handleChoice(ch,btn,bubbles){
  document.querySelectorAll('.choice-btn').forEach(b=>b.disabled=true);btn.classList.add(ch.correct?'correct-c':'wrong-c');
  const youBubble=document.createElement('div');youBubble.className='bubble bubble-you';youBubble.textContent=ch.en;bubbles.appendChild(youBubble);
  speak(ch.ge,ch.en);S.tot++;
  if(ch.correct){S.cor++;S.streak++;if(S.streak>S.best)S.best=S.streak;addXP(8);addCoins(3);}else{S.streak=0;}
  save();document.getElementById('cv-str').textContent='🔥 '+S.streak;
  const fb=document.getElementById('cv-fb');
  fb.style.cssText='margin:0.5rem 1rem;background:var(--card);border-radius:12px;padding:0.7rem 0.85rem;font-size:0.73rem;line-height:1.55;display:block;border-left:3px solid '+(ch.correct?'var(--green)':'var(--red)');
  fb.innerHTML=(ch.correct?'<strong style="color:#6ab387">✓ Correct!</strong> ':'<strong style="color:#e05565">✗ </strong>')+ch.fb;
  document.getElementById('cv-next-wrap').innerHTML='<button class="convo-next" onclick="nextConvoTurn()">Continue →</button>';
}
function nextConvoTurn(){cvTurnIdx++;document.getElementById('cv-choices').innerHTML='';document.getElementById('cv-fb').style.display='none';document.getElementById('cv-next-wrap').innerHTML='';renderConvoTurn();}
function showConvoDone(){
  S.convosCompleted=(S.convosCompleted||0)+1;addXP(15);addCoins(5);save();checkAch();
  const el=document.getElementById('cv-choices');
  const div=document.createElement('div');
  div.style.cssText='text-align:center;padding:1.5rem 1rem';
  div.innerHTML='<div style="font-size:2.2rem">🎉</div><div style="font-size:1rem;font-weight:800;color:var(--sand);margin:0.4rem 0 0.2rem">Conversation Complete!</div><div style="font-size:0.76rem;color:var(--smoke);margin-bottom:0.85rem">+15 XP · +5🪙</div>';
  const btn=document.createElement('button');
  btn.textContent='Back to Stories';
  btn.style.cssText='padding:0.7rem 1.8rem;background:var(--accent);border:none;border-radius:12px;color:#fff;font-family:inherit;font-weight:700;font-size:0.76rem;cursor:pointer';
  btn.onclick=()=>goNav('stories');
  div.appendChild(btn);el.innerHTML='';el.appendChild(div);
}

/* ══════════════════════════════════════════
   LEADERBOARD
══════════════════════════════════════════ */
const LB_KEY='tigrinya_lb_v1';
function initSocial(){
  const se=document.getElementById('lb-your-score'),le=document.getElementById('lb-your-level');
  if(se)se.textContent=S.xp;if(le)le.textContent=lv(S.xp);
  const inp=document.getElementById('lb-name-input');if(inp)inp.value=localStorage.getItem('tigrinya_lb_name')||'';
  loadLeaderboard();
}
function submitScore(){
  const inp=document.getElementById('lb-name-input');const name=inp?.value.trim();
  if(!name){toast('Enter your name first!');return;}
  localStorage.setItem('tigrinya_lb_name',name);
  let board=[];try{board=JSON.parse(localStorage.getItem(LB_KEY)||'[]');}catch(e){}
  const entry={name,xp:S.xp,level:lv(S.xp),cor:S.cor,ts:Date.now()};
  const idx=board.findIndex(e=>e.name===name);
  if(idx>=0){if(entry.xp>=board[idx].xp)board[idx]=entry;}else board.push(entry);
  board.sort((a,b)=>b.xp-a.xp);localStorage.setItem(LB_KEY,JSON.stringify(board));
  S.lbSubmitted=true;save();checkAch();toast('🏆 Score posted!');loadLeaderboard();
}
function loadLeaderboard(){
  let board=[];
  try{board=JSON.parse(localStorage.getItem(LB_KEY)||'[]');}catch(e){}
  const seeds=[
    {name:'ሳርኣ',xp:2450,level:7,cor:180},
    {name:'ዮናስ',xp:1820,level:6,cor:140},
    {name:'ተስፋይ',xp:1200,level:5,cor:95},
    {name:'ሃብቶም',xp:680,level:4,cor:55},
    {name:'ሊዓ',xp:320,level:3,cor:28}
  ];
  seeds.forEach(s=>{if(!board.find(e=>e.name===s.name))board.push(s);});
  board.sort((a,b)=>b.xp-a.xp);
  const savedName=localStorage.getItem('tigrinya_lb_name')||'';
  const list=document.getElementById('lb-list');
  if(!list)return;
  list.innerHTML='';
  const medals=['🥇','🥈','🥉'];
  board.slice(0,10).forEach((e,i)=>{
    const isYou=e.name===savedName;
    const div=document.createElement('div');
    div.className='lb-entry'+(isYou?' you':'');
    div.innerHTML=
      '<div class="lb-rank">'+(medals[i]||('#'+(i+1)))+'</div>'+
      '<div class="lb-info">'+
        '<div class="lb-name">'+e.name+(isYou?' (you)':'')+'</div>'+
        '<div class="lb-stats">Level '+e.level+' · '+e.cor+' correct</div>'+
      '</div>'+
      '<div class="lb-score">'+e.xp+' XP</div>';
    list.appendChild(div);
  });
}

/* ══════════════════════════════════════════
   MNEMONICS — show on flashcard back
══════════════════════════════════════════ */
function getMnemonic(word){return word.mn||'';}

function shuf(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
