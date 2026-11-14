/* Tigrinya Learn — drills.js. Loaded as a classic script; top-level consts are shared globals. */
/* ── "Talk to…" — gender & number drills ──
   m = to a man / he, f = to a woman / she, p = to a group (also polite) / they */
const GENDER_DRILLS=[
  {k:'you',en:'How are you?',m:['ከመይ ኣለኻ?','kemey alekha?'],f:['ከመይ ኣለኺ?','kemey alekhi?'],p:['ከመይ ኣለኹም?','kemey alekhum?']},
  {k:'you',en:'Good morning (how did you sleep?)',m:['ከመይ ሓዲርካ?','kemey hadirka?'],f:['ከመይ ሓዲርኪ?','kemey hadirki?'],p:['ከመይ ሓዲርኩም?','kemey hadirkum?']},
  {k:'you',en:'Good afternoon (how was your day?)',m:['ከመይ ውዒልካ?',"kemey wi'ilka?"],f:['ከመይ ውዒልኪ?',"kemey wi'ilki?"],p:['ከመይ ውዒልኩም?',"kemey wi'ilkum?"]},
  {k:'you',en:'What is your name?',m:['ስምካ መን እዩ?','simka men iyu?'],f:['ስምኪ መን እዩ?','simki men iyu?'],p:['ስምኩም መን እዩ?','simkum men iyu?']},
  {k:'you',en:'Where are you from?',m:['ካብ ኣበይ ኢኻ?','kab abey ikha?'],f:['ካብ ኣበይ ኢኺ?','kab abey ikhi?'],p:['ካብ ኣበይ ኢኹም?','kab abey ikhum?']},
  {k:'you',en:'Please',m:['በጃኻ','bejakha'],f:['በጃኺ','bejakhi'],p:['በጃኹም','bejakhum']},
  {k:'you',en:'Welcome!',m:['እንቋዕ ብደሓን መጻእካ',"inkwa'e bidehan metsa'ka"],f:['እንቋዕ ብደሓን መጻእኪ',"inkwa'e bidehan metsa'ki"],p:['እንቋዕ ብደሓን መጻእኩም',"inkwa'e bidehan metsa'kum"]},
  {k:'you',en:'Come!',m:['ንዓ','ni\'a'],f:['ንዒ','ni\'i'],p:['ንዑ','ni\'u']},
  {k:'you',en:'Sit down',m:['ኮፍ በል','kof bel'],f:['ኮፍ በሊ','kof beli'],p:['ኮፍ በሉ','kof belu']},
  {k:'you',en:'Eat!',m:['ብላዕ','bila\''],f:['ብልዒ','bil\'i'],p:['ብልዑ','bil\'u']},
  {k:'you',en:'Speak slowly',m:['ቀስ ኢልካ ተዛረብ','qes ilka tezareb'],f:['ቀስ ኢልኪ ተዛረቢ','qes ilki tezarebi'],p:['ቀስ ኢልኩም ተዛረቡ','qes ilkum tezarebu']},
  {k:'you',en:'Help me',m:['ሓግዘኒ','hagzeni'],f:['ሓግዝኒ','hagzini'],p:['ሓግዙኒ','hagzuni']},
  {k:'you',en:'Do you speak Tigrinya?',m:['ትግርኛ ትዛረብ ዶ?','tigrinya tizareb do?'],f:['ትግርኛ ትዛረቢ ዶ?','tigrinya tizarebi do?'],p:['ትግርኛ ትዛረቡ ዶ?','tigrinya tizarebu do?']},
  {k:'you',en:'What do you want?',m:['እንታይ ትደሊ?','intay tideli?'],f:['እንታይ ትደልዪ?','intay tideliyi?'],p:['እንታይ ትደልዩ?','intay tideliyu?']},
  {k:'you',en:'Goodbye (be well)',m:['ደሓን ኩን','dehan kun'],f:['ደሓን ኩኒ','dehan kuni'],p:['ደሓን ኩኑ','dehan kunu']},
  {k:'you',en:'Your house',m:['ቤትካ','betka'],f:['ቤትኪ','betki'],p:['ቤትኩም','betkum']},
  {k:'3rd',en:'… is a student',m:['ተምሃራይ እዩ','temharay iyu'],f:['ተምሃሪት እያ','temharit iya'],p:['ተምሃሮ እዮም','temharo iyom']},
  {k:'3rd',en:'… speaks Tigrinya',m:['ትግርኛ ይዛረብ','tigrinya yizareb'],f:['ትግርኛ ትዛረብ','tigrinya tizareb'],p:['ትግርኛ ይዛረቡ','tigrinya yizarebu']},
  {k:'3rd',en:'… is coming',m:['ይመጽእ ኣሎ',"yimets'i alo"],f:['ትመጽእ ኣላ',"timets'i ala"],p:['ይመጽኡ ኣለዉ',"yimets'u alewu"]},
  {k:'3rd',en:'… is at home',m:['ኣብ ገዛ ኣሎ','ab geza alo'],f:['ኣብ ገዛ ኣላ','ab geza ala'],p:['ኣብ ገዛ ኣለዉ','ab geza alewu']},
  {k:'3rd',en:'… has gone',m:['ከይዱ','keyidu'],f:['ከይዳ','keyida'],p:['ከይዶም','keyidom']},
  {k:'3rd',en:'… is tired',m:['ደኺሙ','dekhimu'],f:['ደኺማ','dekhima'],p:['ደኺሞም','dekhimom']},
];

const WHO={you:{m:['👨','to a man'],f:['👩','to a woman'],p:['👥','to a group / politely']},'3rd':{m:['👨','he'],f:['👩','she'],p:['👥','they']}};
