#!/usr/bin/env bash
# Build with the GitHub Pages production configuration and push `out/` to the gh-pages branch.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${NEXT_PUBLIC_SITE_URL:=https://rajithdev.github.io}"
: "${NEXT_PUBLIC_BASE_PATH:=/student-tools}"
export NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_BASE_PATH
pnpm build
touch out/.nojekyll
REMOTE=$(git remote get-url origin)
SHA=$(git rev-parse --short HEAD)
TMP=$(mktemp -d)
git -C "$TMP" init -q -b gh-pages
cp -R out/. "$TMP"/
git -C "$TMP" add -A
git -C "$TMP" -c user.name="$(git config user.name)" -c user.email="$(git config user.email)" -c commit.gpgsign=false commit -q -m "Deploy $SHA"
git -C "$TMP" push -f "$REMOTE" gh-pages:gh-pages
rm -rf "$TMP"
echo "Deployed $SHA to gh-pages"
