#!/usr/bin/env bash
# Creates the permanent Android signing key for Tigrinya Learn and prints the
# four values to paste into GitHub → Settings → Secrets and variables → Actions.
# Run it ONCE, on your own computer. Needs Java's `keytool` (installed with
# Java or Android Studio). See SIGNING.md.
set -euo pipefail

OUT="${1:-tigrinya-release.jks}"
if [ -e "$OUT" ]; then echo "$OUT already exists — refusing to overwrite your key." >&2; exit 1; fi
command -v keytool >/dev/null || { echo "keytool not found: install Java (e.g. Temurin 17) first." >&2; exit 1; }

PASS=$(openssl rand -hex 20 2>/dev/null || LC_ALL=C tr -dc 'a-f0-9' </dev/urandom | head -c 40)
keytool -genkeypair -keystore "$OUT" -alias tigrinya -keyalg RSA -keysize 4096 \
  -validity 36500 -storepass "$PASS" -keypass "$PASS" \
  -dname "CN=Tigrinya Learn, OU=dcheshirecat" >/dev/null

if base64 --help 2>&1 | grep -q -- '-w'; then B64=$(base64 -w0 "$OUT"); else B64=$(base64 -i "$OUT" | tr -d '\n'); fi

cat <<EOF

Created $OUT  — keep this file and the password below somewhere safe
(a password manager). If you lose them you can never update the app again.

Add these 4 repository secrets on GitHub:

  KEYSTORE_PASSWORD   $PASS
  KEY_PASSWORD        $PASS
  KEY_ALIAS           tigrinya
  KEYSTORE_BASE64     (long value below, all on one line)

$B64

Do not commit $OUT to the repository.
EOF
