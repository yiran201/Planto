#!/usr/bin/env bash
# One-click startup script (REQ-056, the Linux/macOS counterpart of
# start-planto.bat; REQ-084 renamed from start-lifespark.sh when the
# project was renamed to Planto; REQ-085 comments/messages translated to
# English to match start-planto.bat, which switched away from Chinese
# text entirely to sidestep a Windows cmd.exe encoding pitfall - this
# script was never affected by that bug, translated purely for
# consistency between the two scripts):
# cd into the script's own directory -> auto npm install on first run ->
# start the Vite dev server with --open so the browser opens
# automatically. Since REQ-063 the port is fixed to 6060 in
# vite.config.js (strictPort:true - Google OAuth's authorized origin
# must match the port exactly), so `npm run dev` fails immediately if
# the port is already taken instead of silently switching to another
# port like 5174. Before first use, run `chmod +x start-planto.sh` to
# make it executable (whether git preserves this permission bit depends
# on the file mode at commit time - it being non-executable right after
# a fresh clone is expected, see README).
set -euo pipefail

# Use BASH_SOURCE instead of $0 so this still resolves to the script's
# real location when double-clicked, symlinked, or sourced from another
# script - same purpose as "%~dp0" in the .bat version.
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "node_modules" ]; then
  echo "First run detected, installing dependencies, please wait..."
  if ! npm install; then
    echo "Dependency installation failed, see the error above."
    exit 1
  fi
fi

npm run dev -- --open

echo
echo "Dev server stopped."
