/* Tigrinya Learn — achievements.js. Loaded as a classic script; top-level consts are shared globals. */
/* ACHIEVEMENTS */
const ACHS=[
  {id:'first',nm:'First Steps',ge:'ቀዳማይ ስጉምቲ',d:'Answer your first question',ico:'🌱',xp:10,ok:s=>s.tot>=1},
  {id:'str5',nm:'Hot Streak',ge:'ሓዊ',d:'Get 5 correct in a row',ico:'⚡',xp:25,ok:s=>s.best>=5},
  {id:'str10',nm:'Unstoppable',ge:'ዘይቆጠን',d:'Get 10 correct in a row',ico:'🌪️',xp:50,ok:s=>s.best>=10},
  {id:'c50',nm:'Word Master',ge:'ሊቅ ቃላት',d:'Get 50 correct answers',ico:'📚',xp:50,ok:s=>s.cor>=50},
  {id:'c100',nm:'Scholar',ge:'ሊቅ',d:'Get 100 correct answers',ico:'🎓',xp:100,ok:s=>s.cor>=100},
  {id:'fidel5',nm:'Script Student',ge:'ተምሃራይ ፊደል',d:'Explore 5 fidel families',ico:'📜',xp:25,ok:s=>(s.fidelLearned||0)>=5},
  {id:'fidel22',nm:'Fidel Master',ge:'ሊቅ ፊደል',d:'Explore all fidel families',ico:'🏛️',xp:100,ok:s=>(s.fidelLearned||0)>=FIDEL.length},
  {id:'write5',nm:'First Strokes',ge:'ቀዳሞት ጽሑፍ',d:'Practice writing 5 times',ico:'✍️',xp:20,ok:s=>(s.writeSessions||0)>=5},
  {id:'acc80',nm:'Precise Strokes',ge:'ልክዕ ጽሑፍ',d:'Get 80%+ accuracy while tracing',ico:'🎯',xp:30,ok:s=>(s.bestAccuracy||0)>=80},
  {id:'gram5',nm:'Sentence Builder',ge:'ሰራሒ ሓሳብ',d:'Complete 5 sentence exercises',ico:'🏗️',xp:30,ok:s=>(s.sbCorrect||0)>=5},
  {id:'gram10',nm:'Grammar Expert',ge:'ሊቅ ሰዋስው',d:'Complete 10 sentence exercises',ico:'📝',xp:60,ok:s=>(s.sbCorrect||0)>=10},
  {id:'pack1',nm:'Card Collector',ge:'ኣኻብቢ ካርድ',d:'Open your first pack',ico:'📦',xp:20,ok:s=>(s.packsOpened||0)>=1},
  {id:'pack10',nm:'Pack Addict',ge:'ሓጋዚ ካርድ',d:'Open 10 packs',ico:'🎁',xp:60,ok:s=>(s.packsOpened||0)>=10},
  {id:'legend',nm:'Legendary',ge:'ዓቢ ዝናን',d:'Collect a Legendary card',ico:'🌟',xp:100,ok:s=>(s.collection||[]).some(id=>ALL_CARDS.find(c=>c.id===id)?.rarity==='legendary')},
  {id:'allcat',nm:'Completionist',ge:'ምሉእ ትምህርቲ',d:'Play all 14 word categories',ico:'🌍',xp:80,ok:s=>(s.visited||[]).length>=14},
  {id:'lv5',nm:'Rising Star',ge:'ደይቦ ኮኾብ',d:'Reach Level 5',ico:'⭐',xp:75,ok:s=>lv(s.xp)>=5},
  {id:'lv10',nm:'Tigrinya Adept',ge:'ፈላጢ ትግርኛ',d:'Reach Level 10',ico:'🌟',xp:150,ok:s=>lv(s.xp)>=10},
  {id:'tts10',nm:'Good Listener',ge:'ሰሚዒ',d:'Use TTS to listen 10 times',ico:'🔊',xp:20,ok:s=>(s.ttsCount||0)>=10},
];
