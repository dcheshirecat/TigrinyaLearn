/* ═══════════════════════════
   TEXT-TO-SPEECH ENGINE
═══════════════════════════ */
let ttsSupported = 'speechSynthesis' in window;
let currentWord = null;
let currentFidelChar = null;

function speak(geezText, romanization, rate) {
  const rec = AUDIO_FILES[geezText];
  if (rec) { try { const a = new Audio('audio/' + rec); if (rate && rate < 0.8) a.playbackRate = 0.75; a.play(); return; } catch (e) {} }
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  // Phonetic respelling map — makes English TTS sound much closer to Tigrinya
  const phonetic = {
    'selam':'seh-lahm', 'tsbuk':'tsih-book', 'yeqenyeley':'yeh-ken-yeh-ley',
    'bejaka':'beh-jah-kah', 'yiqre':'yick-reh', 'iwe':'ih-weh',
    'ayfalen':'ay-fah-len', 'senay':'seh-nigh', 'mshet':'mih-shet',
    'ilet':'ih-let', 'mder':'mih-der', 'hade':'hah-deh', 'kilte':'kil-teh',
    'seleste':'seh-les-teh', 'arbaete':'ar-bah-eh-teh', 'hamushte':'hah-mush-teh',
    'injera':'in-jeh-rah', 'shiro':'shee-roh', 'may':'my', 'tseba':'tseh-bah',
    'dabo':'dah-boh', 'bun':'boon', 'shahi':'shah-hee', 'ade':'ah-deh',
    'abo':'ah-boh', 'haw':'how', 'habti':'hahb-tee', 'wedi':'weh-dee',
    'gwal':'gwahl', 'qeyh':'keh', 'tselim':'tseh-lim', 'tsaeda':'tsah-eh-dah',
    'semayawi':'seh-mah-yah-wee', 'bicha':'bee-chah', 'hamlay':'hahm-lay',
    'resi':'reh-see', 'ayni':'eye-nee', 'af':'ahf', 'id':'eed',
    'lbi':'libi', 'tsehay':'tseh-high', 'werhi':'wer-hee', 'kokhob':'ko-khob',
    'debri':'deb-ree', 'bahri':'bah-ree', 'semay':'seh-my', 'mdri':'mid-ree',
    'awel':'ah-wel', 'znam':'ze-nahm', 'hawi':'hah-wee', 'lomi':'lo-mee',
    'tsbah':'tseh-bah', 'tmali':'tih-mah-lee', 'saat':'sah-at', 'amet':'ah-met',
    'asmera':'as-meh-rah', 'mitswa':'mits-wah', 'bet':'bet', 'idaga':'ih-dah-gah',
    'hager':'hah-gher', 'ketema':'keh-teh-mah', 'adi':'ah-dee',
    'fiqri':'fiq-ree', 'hagos':'hah-gos', 'hazen':'hah-zen', 'firhi':'fir-hee',
    'tesfa':'tes-fah', 'mzgana':'miz-gah-nah', 'nafqot':'nahf-kot', 'haben':'hah-ben',
    'kdan':'kuh-dan', 'qemis':'keh-mis', 'suri':'soo-ree', 'chaqa':'chah-kah',
    'yzereb':'yih-zeh-reb', 'ybele':'yih-beh-leh', 'ysti':'yis-tee',
    'ykheyid':'yikh-hey-id', 'yri':'yir-ee', 'ysmae':'yis-mah-eh',
    'yfelt':'yih-felt', 'yfetu':'yih-feh-too', 'naqfa':'nahk-fah',
    'feres':'feh-res', 'lam':'lahm', 'kelbi':'kel-bee', 'uf':'oof',
    'asa':'ah-sah', 'anbesa':'an-beh-sah', 'nsri':'nis-ree',
    'kemey':'keh-mey', 'abey':'ah-bey', 'entay':'en-tie', 'men':'men',
    'kindey':'kin-dey', 'meas':'meh-ahs', 'slemntay':'slem-in-tie',
    'ayfeltn':'ay-fel-tin', 'bqes':'bih-kes', 'tzerab':'tseh-rab',
  };

  function doSpeak() {
    const voices = window.speechSynthesis.getVoices();
    // Prefer a native-sounding voice for Tigrinya
    const tiVoice = voices.find(v => v.lang && v.lang.startsWith('ti'));
    const amVoice = voices.find(v => v.lang && v.lang.startsWith('am'));
    const enVoice = voices.find(v => v.lang && v.lang.startsWith('en'))
                 || (voices.length ? voices[0] : null);

    if (tiVoice || amVoice) {
      // Speak the actual Ge'ez — native voice
      const u = new SpeechSynthesisUtterance(geezText);
      u.voice = tiVoice || amVoice;
      u.lang = (tiVoice || amVoice).lang;
      u.rate = rate || 0.8; u.pitch = 1.0;
      u.onstart = () => document.querySelectorAll('.tts-btn').forEach(b => b.classList.add('speaking'));
      u.onend = u.onerror = () => document.querySelectorAll('.tts-btn').forEach(b => b.classList.remove('speaking'));
      window.speechSynthesis.speak(u);
    } else {
      // Use phonetic respelling for English TTS
      const roman = romanization || '';
      const text = phonetic[roman] || roman;
      const u = new SpeechSynthesisUtterance(text);
      if (enVoice) u.voice = enVoice;
      u.lang = 'en-US';
      u.rate = rate ? Math.min(0.68, rate) : 0.68;  // Slower = clearer
      u.pitch = 1.05;
      u.onstart = () => document.querySelectorAll('.tts-btn').forEach(b => b.classList.add('speaking'));
      u.onend = u.onerror = () => document.querySelectorAll('.tts-btn').forEach(b => b.classList.remove('speaking'));
      window.speechSynthesis.speak(u);
    }
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
      window.speechSynthesis.onvoiceschanged = null;
    };
    setTimeout(() => { if (!window.speechSynthesis.speaking) doSpeak(); }, 400);
  }
}

function speakCurrent() {
  if (currentWord) speak(currentWord.g, currentWord.t);
}
function speakFidel() {
  if (currentFidelChar) speak(currentFidelChar.ch, currentFidelChar.fam.name + (currentFidelChar.vi > 0 ? VOWEL_LABELS[currentFidelChar.vi] : ''));
}

// Load voices async (required on some browsers)
if (ttsSupported) window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
