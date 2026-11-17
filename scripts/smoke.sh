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
#    The snapshot is inlined into a public static build, and it publishes
#    public repositories only. This offline check reads the committed file;
#    test-privacy.mjs also compares against the live GitHub API.
check "snapshot has no private entries" \
  jq -e '[.repos[] | select(.private == true or (.name | test("^private-")))] | length == 0' lib/repos.json
check "no committed secrets" bash -c '! rg -q -e "GITHUB_TOKEN=gh[ps]_" -e "sk-[a-zA-Z0-9]{20}" --glob "!node_modules" .'

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ] || exit 1
