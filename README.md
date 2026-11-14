# ትግርኛ Learn

A Tigrinya learning app. It runs in any browser, and GitHub Actions packages it as an Android app (a WebView).

## Project layout

```
index.html              Page markup: screens, navigation, the keyboard
css/app.css             Base styles for every screen
css/theme.css           Design tokens (colours, fonts, spacing) and newer components
js/data/                All learning content. Edit these to add or fix words
  vocabulary.js         V: 15 topic categories of words (g = Ge'ez, t = transliteration,
                        e = English, p = pronunciation, n = note)
  fidel.js              The 32 alphabet families, 7 vowel forms each
  grammar.js            Grammar lessons and the sentence-building exercises
  drills.js             "Talk to…" phrases in masculine / feminine / plural forms
  stories.js            Short stories and the conversation role-plays
  culture.js            Culture topics and dialect notes
  cards.js              Trading cards and card packs
  achievements.js       Achievements
  audio.js              AUDIO_FILES: maps Ge'ez text to recordings in audio/
js/tts.js               Text-to-speech, plus playback of recorded audio
js/app.js               Core app: state, navigation, games, alphabet, cards, stories
js/practice.js          Spaced-repetition review, Talk to…, Listen, Type it, keyboard
js/main.js              Startup
tools/validate-data.js  Checks the content files for common mistakes
tests/e2e.js            Plays through the app in a headless browser
CORRECTIONS.md          Accuracy review log, with items still awaiting a native speaker
```

There is no build step. The scripts are plain `<script>` tags (not ES modules), so the app still works when Android loads it from `file:///android_asset/`. Script order in `index.html` matters: data files load first.

## Editing content

- **Add a word:** add an entry to a category in `js/data/vocabulary.js`:
  ```js
  {g:'ገዛ', t:'geza', e:'house / home', p:'GE-za', n:'Very common in Eritrea.'},
  ```
- **Punctuation:** use the Ethiopic full stop **።** (U+1362) and comma **፣**, not look-alike characters from other scripts.
- **After any content change, run:**
  ```
  node tools/validate-data.js
  ```
  It reports problems such as wrong punctuation, Latin letters in a Ge'ez field, a scrambled alphabet row, or a sentence exercise whose word tiles don't match its answer.

## Adding native-speaker audio

1. Record each word or phrase. Short MP3 or M4A files work best.
2. Put the files in an `audio/` folder at the root of the repo.
3. List each recording in `js/data/audio.js`:
   ```js
   const AUDIO_FILES = { 'ሰላም': 'selam.mp3', 'የቐንየለይ': 'yeqenyeley.mp3' };
   ```

Wherever the app plays a word that has a recording, it uses the recording instead of the computer voice. The Android build includes the `audio/` folder automatically.

## Testing

```
npm install        # installs Playwright (only needed for the browser test)
npm test           # content checks + end-to-end browser test
npm run validate   # content checks only (no install needed)
```

Screenshots from the browser test are saved in `tests/screenshots/`.

## Android build

`.github/workflows/build.yml` runs on every push to `main`. It:

1. Runs the content checks.
2. Copies `index.html`, `css/`, `js/` and `audio/` into the app.
3. Builds a signed APK, which you can download from the workflow run's artifacts.

Known issue: the workflow creates a new signing key on every run. Android only installs an update over an existing app when both are signed with the same key, so each new APK has to be installed fresh. The fix is to store one keystore as a GitHub secret.
