#!/usr/bin/env bash
# Runs the proof tests: each one demonstrates a planted flaw is really there.
# They PASS while the flaw exists, and FAIL once someone fixes it.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d app/node_modules ] || (cd app && npm install)
ln -sfn ../app/node_modules interviewer/node_modules
cd app && npx vitest run --config ../interviewer/vitest.proofs.config.mts
