/* Tigrinya Learn — path.js. The guided learning path.
   Each unit is built around one vocabulary category (V[cat]) and mixes the
   existing activities. Step codes:
     learn            flashcards for the unit's words
     quiz             10-question quiz on the unit's words
     listen / type    listening or typing on the unit's words
     match            one round of Match Pairs
     talk:i,j,…       "Talk to…" with GENDER_DRILLS[i], [j]…
     grammar:n        GRAMMAR_LESSONS[n] (read, then mark done)
     story:id         STORIES entry with that id
     convo:id         CONVOS entry with that id
     build            5 Sentence Builder exercises
   Units unlock in order; a learner can also jump ahead. */
const PATH_UNITS = [
  {id:'u01', cat:'greetings', title:'Hello!',          steps:['learn','quiz','talk:0,1,2,5,14','listen','convo:greeting']},
  {id:'u02', cat:'numbers',   title:'Numbers',         steps:['learn','quiz','listen','match']},
  {id:'u03', cat:'family',    title:'Family',          steps:['learn','grammar:1','quiz','grammar:7','story:family']},
  {id:'u04', cat:'food',      title:'Food & Drink',    steps:['learn','grammar:0','quiz','listen','story:market','convo:market']},
  {id:'u05', cat:'colors',    title:'Colours',         steps:['learn','grammar:6','quiz','match']},
  {id:'u06', cat:'time',      title:'Days & Time',     steps:['learn','quiz','listen','type']},
  {id:'u07', cat:'body',      title:'The Body',        steps:['learn','quiz','match','type']},
  {id:'u08', cat:'places',    title:'Around Town',     steps:['learn','grammar:9','quiz','convo:directions']},
  {id:'u09', cat:'animals',   title:'Animals',         steps:['learn','quiz','listen','match']},
  {id:'u10', cat:'nature',    title:'Nature',          steps:['learn','quiz','listen','story:sea']},
  {id:'u11', cat:'emotions',  title:'Feelings',        steps:['learn','grammar:2','quiz','talk:16,17,18,19,20,21']},
  {id:'u12', cat:'clothing',  title:'Clothing',        steps:['learn','quiz','type','match']},
  {id:'u13', cat:'actions',   title:'Doing Things',    steps:['learn','grammar:3','quiz','grammar:5','grammar:8']},
  {id:'u14', cat:'phrases',   title:'Everyday Phrases',steps:['learn','grammar:4','quiz','talk:3,4,6,7,8,9,10,11,12,13,15','convo:coffee']},
  {id:'u15', cat:'sentences', title:'Full Sentences',  steps:['learn','quiz','build']},
];
