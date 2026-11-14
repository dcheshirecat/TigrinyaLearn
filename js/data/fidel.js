/* Tigrinya Learn — fidel.js. Loaded as a classic script; top-level consts are shared globals. */
/* FIDEL */
const VOWEL_LABELS=['ä','u','i','a','e','ə','o'];

const VOWEL_NAMES=['1st (ä)','2nd (u)','3rd (i)','4th (a)','5th (e)','6th (ə)','7th (o)'];

const FIDEL=[
  {name:'h',sound:'like English "h"',forms:['ሀ','ሁ','ሂ','ሃ','ሄ','ህ','ሆ'],note:'One of the softest consonants. "ሃ" begins ሃገር (country).'},
  {name:'l',sound:'like English "l"',forms:['ለ','ሉ','ሊ','ላ','ሌ','ል','ሎ'],note:'"ል" is one of the most common final consonants in Tigrinya.'},
  {name:'ḥ',sound:'breathy "h" from throat',forms:['ሐ','ሑ','ሒ','ሓ','ሔ','ሕ','ሖ'],note:'A pharyngeal sound — deeper than regular "h". Common in Semitic languages.'},
  {name:'m',sound:'like English "m"',forms:['መ','ሙ','ሚ','ማ','ሜ','ም','ሞ'],note:'"ማ" starts ማይ (water); "ም" starts many nouns like ምሸት (evening).'},
  {name:'s',sound:'like English "s"',forms:['ሰ','ሱ','ሲ','ሳ','ሴ','ስ','ሶ'],note:'"ሰ" begins "ሰላም" (selam/peace) — one of the most beautiful Tigrinya words.'},
  {name:'r',sound:'rolled "r"',forms:['ረ','ሩ','ሪ','ራ','ሬ','ር','ሮ'],note:'A tapped or rolled r, like Spanish or Italian "r".'},
  {name:'sh',sound:'like English "sh"',forms:['ሸ','ሹ','ሺ','ሻ','ሼ','ሽ','ሾ'],note:'"ሽሮ" (shiro — the beloved stew) starts with this sound.'},
  {name:'q',sound:'ejective "k" — popped from the back of the mouth',forms:['ቀ','ቁ','ቂ','ቃ','ቄ','ቅ','ቆ'],note:'An ejective stop. After a vowel it softens to ቐ (see the ቐ family).'},
  {name:'b',sound:'like English "b"',forms:['በ','ቡ','ቢ','ባ','ቤ','ብ','ቦ'],note:'"ብ" means "with" or "by" in Tigrinya.'},
  {name:'t',sound:'like English "t"',forms:['ተ','ቱ','ቲ','ታ','ቴ','ት','ቶ'],note:'"ትግርኛ" (Tigrinya) itself begins with this character!'},
  {name:'n',sound:'like English "n"',forms:['ነ','ኑ','ኒ','ና','ኔ','ን','ኖ'],note:'"ን" as a prefix means "to/for" (ንዓኻ — for you); as a suffix on two nouns it means "and" (ኣደን ኣቦን — mother and father).'},
  {name:'ʾ',sound:'glottal stop',forms:['አ','ኡ','ኢ','ኣ','ኤ','እ','ኦ'],note:'A brief catch in the throat. "ኣ" begins "ኣደ" (mother).'},
  {name:'k',sound:'like English "k"',forms:['ከ','ኩ','ኪ','ካ','ኬ','ክ','ኮ'],note:'"ካ" and "ኪ" are common suffixes meaning "your".'},
  {name:'w',sound:'like English "w"',forms:['ወ','ዉ','ዊ','ዋ','ዌ','ው','ዎ'],note:'"ወ" begins "ወዲ" (son) and "ወርቂ" (gold).'},
  {name:'z',sound:'like English "z"',forms:['ዘ','ዙ','ዚ','ዛ','ዜ','ዝ','ዞ'],note:'"ዝ" is a relative pronoun meaning "who/which".'},
  {name:'y',sound:'like English "y"',forms:['የ','ዩ','ዪ','ያ','ዬ','ይ','ዮ'],note:'"ይ" appears in many verb forms as a subject marker.'},
  {name:'d',sound:'like English "d"',forms:['ደ','ዱ','ዲ','ዳ','ዴ','ድ','ዶ'],note:'"ዳቦ" (dabo/bread) starts with this character.'},
  {name:'j',sound:'like English "j"',forms:['ጀ','ጁ','ጂ','ጃ','ጄ','ጅ','ጆ'],note:'Less common but important in loanwords.'},
  {name:'g',sound:'like English "g"',forms:['ገ','ጉ','ጊ','ጋ','ጌ','ግ','ጎ'],note:'"ጓል" (gwal/daughter) begins with this character.'},
  {name:'ṭ',sound:'ejective "t" — a sharp popped t',forms:['ጠ','ጡ','ጢ','ጣ','ጤ','ጥ','ጦ'],note:'Said with more tension in the throat than regular "t".'},
  {name:'f',sound:'like English "f"',forms:['ፈ','ፉ','ፊ','ፋ','ፌ','ፍ','ፎ'],note:'"ፊደል" (fidel/alphabet) starts with this character!'},
  {name:'p',sound:'like English "p"',forms:['ፐ','ፑ','ፒ','ፓ','ፔ','ፕ','ፖ'],note:'Rare in native Tigrinya — mainly used in loanwords.'},
  {name:'q̱ (qh)',sound:'"ch" as in Scottish "loch", but further back',forms:['ቐ','ቑ','ቒ','ቓ','ቔ','ቕ','ቖ'],note:'Unique to Tigrinya. ቅ softens to ቕ after a vowel — as in የቐንየለይ (thank you).'},
  {name:'ḵ (kh)',sound:'like "ch" in German "Bach"',forms:['ኸ','ኹ','ኺ','ኻ','ኼ','ኽ','ኾ'],note:'Unique to Tigrinya. ክ softens to ኽ after a vowel — that is why it is ከመይ ኣለኻ (alekha).'},
  {name:'ṣ (ts)',sound:'ejective "ts" — a sharp popped ts',forms:['ጸ','ጹ','ጺ','ጻ','ጼ','ጽ','ጾ'],note:'Very common: ጽቡቕ (good), ጸሓይ (sun), ጽባሕ (tomorrow).'},
  {name:'ṣ́ (ts, alt.)',sound:'same sound as ጸ',forms:['ፀ','ፁ','ፂ','ፃ','ፄ','ፅ','ፆ'],note:'Historically a separate letter; today it sounds the same as ጸ. Most Eritrean writing uses ጸ.'},
  {name:'č̣ (ch\')',sound:'ejective "ch"',forms:['ጨ','ጩ','ጪ','ጫ','ጬ','ጭ','ጮ'],note:'As in ጨው (salt) and ጫማ (shoes).'},
  {name:'ʿ (ayn)',sound:'voiced throat sound, like Arabic ع',forms:['ዐ','ዑ','ዒ','ዓ','ዔ','ዕ','ዖ'],note:'Deeper than the glottal stop. As in ዓሳ (fish), ዕዳጋ (market), ዓዲ (village).'},
  {name:'ñ (ny)',sound:'like "ny" in "canyon"',forms:['ኘ','ኙ','ኚ','ኛ','ኜ','ኝ','ኞ'],note:'Appears at the end of ትግርኛ (Tigrinya) itself!'},
  {name:'ž (zh)',sound:'like "s" in "measure"',forms:['ዠ','ዡ','ዢ','ዣ','ዤ','ዥ','ዦ'],note:'Rare — mostly in loanwords.'},
  {name:'v',sound:'like English "v"',forms:['ቨ','ቩ','ቪ','ቫ','ቬ','ቭ','ቮ'],note:'Used only for foreign words and names.'},
  {name:'p̣ (p\')',sound:'ejective "p"',forms:['ጰ','ጱ','ጲ','ጳ','ጴ','ጵ','ጶ'],note:'Rare — mostly in Ge\'ez church words and loanwords.'},
];
