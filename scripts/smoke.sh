#!/usr/bin/env bash
#
# Smoke test for the site. Answers "is this obviously broken?" in a few
# seconds, without needing a dev server, network access, or a GitHub token.
#
# Deliberately does not run `next build`: that takes minutes and belongs in CI.
# Everything here checks an artefact already in the repo, so it stays fast
# enough to run before every commit.
#
# Usage: ./scripts/smoke.sh

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

pass=0
fail=0

check() {
  local name="$1"
  shift
  local output
  if output=$("$@" 2>&1); then
    echo "ok    $name"
    pass=$((pass + 1))
  else
    echo "FAIL  $name"
    echo "$output" | sed 's/^/        /' | head -20
    fail=$((fail + 1))
  fi
}

# 1. The files the build depends on exist and parse.
check "package.json is valid json"   jq -e . package.json
check "repos snapshot is valid json" jq -e . lib/repos.json
check "repos snapshot is non-empty"  jq -e '.repos | length > 0' lib/repos.json

# 2. The entry points the framework requires are present. Next.js fails at
#    build time without these, and that failure is slow and confusing; catching
#    a missing file here is instant and obvious.
check "root layout exists"           test -f app/layout.jsx
check "root page exists"             test -f app/page.jsx

# 3. The things worth being afraid of.
#    Private repository names are inlined into a public static build, so a bad
#    snapshot publishes them. Only the structural half of that guarantee is
#    checked here, because it reads the committed snapshot and nothing else.
#    The full assertion in test-privacy.mjs also compares against the live
#    GitHub API, which needs a token and fails on a merely stale snapshot; that
#    belongs in `npm test` and CI, not in a check meant to run offline.
check "private entries use placeholder names" \
  jq -e '[.repos[] | select(.private) | .name | test("^private-[0-9]+$")] | all' lib/repos.json
# An empty-string description counts as redacted; the sync blanks the field
# rather than dropping the key, so both "" and null are acceptable here.
check "private entries carry no identifying fields" \
  jq -e '[.repos[] | select(.private) | ((.description // "") == "") and .url == null and .homepage == null and .pushedAt == null and .createdAt == null] | all' lib/repos.json
check "no committed secrets" bash -c '! rg -q -e "GITHUB_TOKEN=gh[ps]_" -e "sk-[a-zA-Z0-9]{20}" --glob "!node_modules" .'

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
