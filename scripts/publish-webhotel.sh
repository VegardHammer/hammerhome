#!/usr/bin/env bash
set -euo pipefail

repository=/home/hammelir/hammerhome
web_root=/home/hammelir/public_html

/usr/bin/git -C "$repository" fetch --quiet origin main
/usr/bin/git -C "$repository" reset --hard --quiet origin/main

/usr/bin/rsync -a \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude '.gitignore' \
  --exclude 'README.md' \
  --exclude 'scripts/' \
  --exclude '.well-known/' \
  --exclude 'cgi-bin/' \
  --exclude 'hammerorchestra/' \
  --exclude 'vegard/' \
  --exclude 'tobias.hammerhome.no/' \
  --exclude 'tracy.hammerhome.no/' \
  "$repository/" "$web_root/"
