#!/usr/bin/env bash
# Builds the candidate zip from the CLEAN `main` branch, never from the working tree,
# so annotations on interviewer-copy can never leak into what you hand over.
set -euo pipefail
cd "$(dirname "$0")/.."
name="$(basename "$PWD")"
mkdir -p dist
rm -f "dist/${name}-candidate.zip"
branch=main
git archive --format=zip --prefix="${name}/" --output "dist/${name}-candidate.zip" "${branch}:app"
echo "Wrote dist/${name}-candidate.zip (from branch $branch)"
