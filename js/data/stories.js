/* Tigrinya Learn — stories.js. Loaded as a classic script; top-level consts are shared globals. */
/* ══════════════════════════════════════════
   STORY DATA
══════════════════════════════════════════ */
const STORIES=[
  {id:'market',title:'At the Market',titleGe:'ኣብ ዕዳጋ',ico:'🏪',level:'Beginner',wordCount:8,
   desc:'Yonas visits the Asmara market and buys bread and coffee.',
   paragraphs:[
    {en:'Yonas goes to the market in Asmara.',tokens:[{g:'ዮናስ',e:'Yonas (a name)'},{g:'ናብ',e:'to/towards'},{g:'ዕዳጋ',e:'market'},{g:'ኣስመራ',e:'Asmara'},{g:'ይኸይድ',e:'goes'}]},
    {en:'He sees bread and coffee at the stalls.',tokens:[{g:'ዳቦ',e:'bread'},{g:'ምስ',e:'and/with'},{g:'ቡን',e:'coffee'},{g:'ይርኢ',e:'he sees'}]},
    {en:'"How much does the bread cost?" he asks.',tokens:[{g:'ክንደይ',e:'how much'},{g:'ዋጋ',e:'cost/price'},{g:'ዳቦ',e:'bread'}]},
    {en:'"Five Nakfa," says the seller.',tokens:[{g:'ሓሙሽተ',e:'five'},{g:'ናቕፋ',e:'Nakfa (currency)'},{g:'ሸያጢ',e:'seller'}]},
    {en:'Yonas buys the bread and thanks the seller.',tokens:[{g:'ዳቦ',e:'bread'},{g:'ይዕድግ',e:'buys'},{g:'የቐንየለይ',e:'thank you'}]},
  ]},
  {id:'family',title:'Sara and Her Family',titleGe:'ሳርኣ ምስ ስድርኣ',ico:'👨‍👩‍👧',level:'Beginner',wordCount:10,
   desc:'A short story about Sara, her mother, and a traditional coffee ceremony.',
   paragraphs:[
    {en:'Sara lives in a village near Asmara.',tokens:[{g:'ሳርኣ',e:'Sara (a name)'},{g:'ኣብ',e:'in/at'},{g:'ዓዲ',e:'village'},{g:'ጥቓ',e:'near'},{g:'ኣስመራ',e:'Asmara'},{g:'ትነብር',e:'she lives'}]},
    {en:'Her mother is at home making coffee.',tokens:[{g:'ኣዲኣ',e:'her mother'},{g:'ኣብ',e:'at'},{g:'ቤት',e:'home/house'},{g:'ቡን',e:'coffee'},{g:'ተፍልሕ',e:'she brews'}]},
    {en:'The coffee ceremony takes a long time but it is beautiful.',tokens:[{g:'ቡን',e:'coffee'},{g:'ስነ-ስርዓት',e:'ceremony'},{g:'ነዊሕ',e:'long'},{g:'ጽቡቕ',e:'beautiful / good'}]},
    {en:'Sara loves her family very much.',tokens:[{g:'ሳርኣ',e:'Sara'},{g:'ስድርኣ',e:'her family'},{g:'ብዙሕ',e:'very much'},{g:'ትፈቱ',e:'she loves'}]},
    {en:'"Eritrea is our homeland," says Sara with pride.',tokens:[{g:'ኤርትራ',e:'Eritrea'},{g:'ሃገርና',e:'our homeland'},{g:'ትብል',e:'she says'},{g:'ሳርኣ',e:'Sara'}]},
  ]},
  {id:'sea',title:'The Red Sea',titleGe:'ቀይሕ ባሕሪ',ico:'🌊',level:'Intermediate',wordCount:14,
   desc:'Tesfay, a fisherman from Massawa, tells of life on the Red Sea.',
   paragraphs:[
    {en:'Tesfay is a fisherman from Massawa.',tokens:[{g:'ተስፋይ',e:'Tesfay (a name)'},{g:'ካብ',e:'from'},{g:'ምጽዋ',e:'Massawa'},{g:'ገፋፊ ዓሳ',e:'fisherman'},{g:'እዩ',e:'he is'}]},
    {en:'Every morning he goes to the Red Sea before sunrise.',tokens:[{g:'ኩሉ',e:'every'},{g:'ጽባሕ',e:'morning'},{g:'ናብ',e:'to'},{g:'ባሕሪ',e:'sea'},{g:'ይኸይድ',e:'he goes'}]},
    {en:'He catches many fish. The sea is generous.',tokens:[{g:'ብዙሕ',e:'many'},{g:'ዓሳ',e:'fish'},{g:'ይሕዝ',e:'he catches'},{g:'ባሕሪ',e:'sea'},{g:'ለጋሲ',e:'generous'}]},
    {en:'The sun sets beautifully over the water in the evening.',tokens:[{g:'ጸሓይ',e:'sun'},{g:'ማይ',e:'water'},{g:'ልዕሊ',e:'over'},{g:'ትዓርብ',e:'sets'},{g:'ብጽቡቕ',e:'beautifully'}]},
    {en:'"The sea is my homeland and my love," says Tesfay.',tokens:[{g:'ባሕሪ',e:'sea'},{g:'ሃገረይ',e:'my homeland'},{g:'ፍቕረይ',e:'my love'},{g:'ይብል',e:'he says'},{g:'ተስፋይ',e:'Tesfay'}]},
  ]},
];

/* ══════════════════════════════════════════
   CONVERSATION DATA
══════════════════════════════════════════ */
const CONVOS=[
  {id:'greeting',title:'First Meeting',ico:'🤝',desc:'Meet someone new in Asmara.',
   scene:'You are walking in Asmara when a friendly local approaches you with a warm smile.',
   turns:[
    {them:{ge:'ሰላም! ከመይ ኣለኻ?',tr:'selam! kemey alekha?',en:'Hello! How are you?'},
     choices:[
      {ge:'ጽቡቕ ኣለኹ፣ የቐንየለይ!',en:'I am fine, thank you!',correct:true,fb:'Perfect! ጽቡቕ ኣለኹ (I am fine) + የቐንየለይ (thank you) is the ideal response.'},
      {ge:'ኣይፈልጥን',en:'I do not know',correct:false,fb:'This means I do not know — wrong here! Say ጽቡቕ ኣለኹ (I am fine).'},
      {ge:'ሰናይ ምሸት',en:'Good evening',correct:false,fb:'Only for evenings. Reply with ጽቡቕ ኣለኹ (I am fine).'},
     ]},
    {them:{ge:'ስምካ መን ዩ?',tr:'smka men yu?',en:'What is your name?'},
     choices:[
      {ge:'ስመይ [ስምካ] እዩ።',en:'My name is [your name].',correct:true,fb:'Excellent! ስመይ (my name) + name + እዩ (is). Perfect structure.'},
      {ge:'ካብ ኣበይ ኢኻ?',en:'Where are you from?',correct:false,fb:'That asks them a question! Answer: ስመይ ... እዩ (My name is ...).'},
      {ge:'ኣይፋል',en:'No',correct:false,fb:'"No" is not an answer to "what is your name?" Say ስመይ ... እዩ.'},
     ]},
    {them:{ge:'ካብ ኣበይ ኢኻ?',tr:'kab abey ikha?',en:'Where are you from?'},
     choices:[
      {ge:'ኣነ ካብ [ሃገርካ] እየ።',en:'I am from [your country].',correct:true,fb:'Well done! ኣነ (I) + ካብ (from) + place + እየ (am). Perfect SOV.'},
      {ge:'ቀስ ኢልካ ተዛረብ',en:'Please speak slowly',correct:false,fb:'You understood fine! Answer: ኣነ ካብ ... እየ (I am from ...).'},
      {ge:'ደሓን ኩን',en:'Goodbye',correct:false,fb:'That is a farewell! Say ኣነ ካብ ... እየ (I am from ...).'},
     ]},
   ]},
  {id:'market',title:'At the Market',ico:'🏪',desc:'Buy bread and negotiate at the market.',
   scene:'You are at the busy Asmara market. A seller has fresh bread, fruit and coffee.',
   turns:[
    {them:{ge:'ሰላም! እንታይ ትደሊ?',tr:'selam! entay tdeli?',en:'Hello! What would you like?'},
     choices:[
      {ge:'ዳቦ እደሊ። ዋጋኡ ክንደይ እዩ?',en:'I want bread. How much is it?',correct:true,fb:'Perfect! State what you want then ask the price — exactly right for Eritrean markets.'},
      {ge:'የቐንየለይ!',en:'Thank you!',correct:false,fb:'Thank you comes after buying! First say: ዳቦ እደሊ (I want bread).'},
      {ge:'ኣይፈልጥን',en:'I do not know',correct:false,fb:'Say what you want: ዳቦ እደሊ፣ ዋጋኡ ክንደይ እዩ? — I want bread, how much is it?'},
     ]},
    {them:{ge:'ሓሙሽተ ናቕፋ እዩ።',tr:'hamushte naqfa eyu.',en:'It is five Nakfa.'},
     choices:[
      {ge:'ጽቡቕ! ክወስዶ እየ።',en:'OK! I will take it.',correct:true,fb:'Great! Accepting the price politely — good market manners.'},
      {ge:'ክንደይ ዋጋ?',en:'How much?',correct:false,fb:'They already told you — five Nakfa! Say ጽቡቕ to accept.'},
      {ge:'ሰናይ ምሸት',en:'Good evening',correct:false,fb:'That is a greeting, not a response to a price! Say ጽቡቕ (OK).'},
     ]},
    {them:{ge:'ሓዝ! ሰናይ ዕለት!',tr:'haz! senay \'ilet!',en:'Here you go! Good day!'},
     choices:[
      {ge:'የቐንየለይ! ሰናይ ዕለት!',en:'Thank you! Good day!',correct:true,fb:'Perfect! Thanking the seller and returning good-day is ideal Eritrean etiquette.'},
      {ge:'ካብ ኣበይ ኢኻ?',en:'Where are you from?',correct:false,fb:'A bit odd here! Just say የቐንየለይ (Thank you)!'},
      {ge:'ኣይፋል',en:'No',correct:false,fb:'Do not say no after a purchase! Say የቐንየለይ (Thank you)!'},
     ]},
   ]},
  {id:'directions',title:'Asking Directions',ico:'🗺️',desc:'Find the church in town.',
   scene:'You are lost on a street in a Tigrinya-speaking town and need to find the church.',
   turns:[
    {them:{ge:'ሰላም! ናበይ ትኸይድ ኣለኻ?',tr:'selam! nabey tikheyid alekha?',en:'Hello! Where are you going?'},
     choices:[
      {ge:'ቤተ ክርስቲያን ኣበይ ዩ?',en:'Where is the church?',correct:true,fb:'Good! ኣበይ ዩ? (where is?) is the perfect way to ask for a location.'},
      {ge:'ጽቡቕ ኣለኹ!',en:'I am fine!',correct:false,fb:'They asked where you are going! Ask: ቤተ ክርስቲያን ኣበይ ዩ?'},
      {ge:'ጽቡቕ ጉዕዞ',en:'Have a good journey',correct:false,fb:'That is a farewell! Ask: ቤተ ክርስቲያን ኣበይ ዩ?'},
     ]},
    {them:{ge:'ቤተ ክርስቲያን ኣብ ዝቕጽል ጎደና እያ።',tr:'bete kristiyan ab ziqtsil godena iya.',en:'The church is on the next street.'},
     choices:[
      {ge:'የቐንየለይ! ሓጊዝካኒ!',en:'Thank you! You helped me!',correct:true,fb:'Perfect! ሓጊዝካኒ (you helped me) is a lovely phrase to thank someone who gave directions.'},
      {ge:'ክንደይ ዋጋ?',en:'How much?',correct:false,fb:'You do not pay for directions! Just say የቐንየለይ (Thank you)!'},
      {ge:'ኣይተረደኣንን',en:'I do not understand',correct:false,fb:'They gave you directions — say thank you! የቐንየለይ! ሓጊዝካኒ!'},
     ]},
   ]},
  {id:'coffee',title:'Coffee Ceremony',ico:'☕',desc:'You are invited to a traditional ceremony.',
   scene:'A kind family invites you into their home for the sacred three-round coffee ceremony.',
   turns:[
    {them:{ge:'እንቋዕ ብደሓን መጻእካ! እቶ ናብ ቤትና!',tr:'inkwa\'e bidehan metsa\'ka! ito nab betna!',en:'Welcome! Come into our home!'},
     choices:[
      {ge:'የቐንየለይ! ዓቢ ክብሪ እዩ!',en:'Thank you! It is a great honor!',correct:true,fb:'Beautiful! Expressing gratitude and honor is exactly right when welcomed into a home.'},
      {ge:'ማይ ትደሊ ዶ?',en:'Would you like water?',correct:false,fb:'You are the guest — the host offers! Say የቐንየለይ! ዓቢ ክብሪ እዩ!'},
      {ge:'ክንደይ ዋጋ?',en:'How much does it cost?',correct:false,fb:'Never ask the price at a ceremony! Say የቐንየለይ! ዓቢ ክብሪ እዩ!'},
     ]},
    {them:{ge:'ቡን ትሰቲ ዶ?',tr:'bun tisti do?',en:'Do you drink coffee?'},
     choices:[
      {ge:'እወ! ቡን ፍቕሪ እዩ!',en:'Yes! Coffee is love!',correct:true,fb:'Perfect! Enthusiastically accepting coffee honors the host and their sacred ceremony.'},
      {ge:'ኣይፋል፣ ማይ እደሊ',en:'No, I want water instead',correct:false,fb:'Refusing coffee at a ceremony is rude in Eritrean culture. Accept: እወ ቡን ፍቕሪ እዩ!'},
      {ge:'ሰናይ ምሸት',en:'Good evening',correct:false,fb:'You are accepting coffee, not saying goodbye! Say እወ! ቡን ፍቕሪ እዩ!'},
     ]},
   ]},
];
