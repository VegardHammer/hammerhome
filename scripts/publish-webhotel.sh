#!/usr/bin/env bash
set -euo pipefail

repository=/home/hammerlir/hammerhome
web_root=/home/hammerlir/public_html

/usr/bin/git -C "$repository" fetch --quiet origin main
/usr/bin/git -C "$repository" reset --hard --quiet origin/main

/usr/bin/rsync -a --delete-after \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude '.gitignore' \
  --exclude 'README.md' \
  --exclude 'scripts/' \
  --exclude '.well-known/' \
  --exclude 'cgi-bin/' \
  --exclude 'hammerorchestra/' \
  --exclude 'vegard/' \
  "$repository/" "$web_root/"
