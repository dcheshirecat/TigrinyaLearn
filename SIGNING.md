# Android signing key

Android only installs a new version of the app over an old one if both were signed with the **same key**. The build used to create a new key on every run, so every update meant uninstalling first, and losing your progress. The build now reads one permanent key from GitHub secrets.

## One-time setup (about 5 minutes)

1. **Create the key on your computer.** You need Java installed: Android Studio includes it, or install Temurin 17.
   ```
   bash tools/make-keystore.sh
   ```
   This creates `tigrinya-release.jks` and prints four values.
2. **Back up the key.** Save `tigrinya-release.jks` and the printed password somewhere safe, such as a password manager or a private cloud folder. **If they are lost, the app can never be updated again**, only reinstalled from scratch.
3. **Add the secrets on GitHub.** In the repository, open **Settings → Secrets and variables → Actions → New repository secret** and add these four:
   | Name | Value |
   |---|---|
   | `KEYSTORE_BASE64` | the long text the script printed |
   | `KEYSTORE_PASSWORD` | the password it printed |
   | `KEY_PASSWORD` | the same password |
   | `KEY_ALIAS` | `tigrinya` |
4. **Run a build.** Go to **Actions → Build Tigrinya APK → Run workflow**, or push to `main`. The log should say "Using the permanent signing key."

**Never commit the `.jks` file.** The repository is public, and `.gitignore` already excludes `*.jks`.

## After setup

- **One more fresh install.** Copies installed before the permanent key existed were signed with throwaway keys. Uninstall that copy once and install the new APK. From then on, every APK installs as an update and progress is kept.
- **Version numbers.** Each build gets a higher version number automatically (version 1.1.*N*, where *N* is the build's run number), so Android accepts it as an update.
- **Builds without the secrets.** The build still works, but it shows a "Temporary signing key" warning and the APK can't be updated later.
