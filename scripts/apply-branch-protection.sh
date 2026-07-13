#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RULESET="${ROOT}/.github/rulesets/main-security.json"

if ! command -v gh >/dev/null 2>&1; then
  echo "Instalá GitHub CLI: https://cli.github.com/"
  exit 1
fi

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
EXISTING="$(gh api "repos/${REPO}/rulesets" --jq '.[] | select(.name=="Protección main — Security CI obligatorio") | .id' 2>/dev/null || true)"

if [ -n "${EXISTING}" ]; then
  echo "Actualizando ruleset id=${EXISTING} en ${REPO}"
  gh api "repos/${REPO}/rulesets/${EXISTING}" --method PUT --input "${RULESET}"
else
  echo "Creando ruleset en ${REPO}"
  gh api "repos/${REPO}/rulesets" --method POST --input "${RULESET}"
fi

echo ""
echo "Branch protection aplicada. Checks obligatorios para merge:"
echo "  - security / gitleaks"
echo "  - security / semgrep"
echo "  - security / client-secrets"
echo "  - ci / required"
echo ""
echo "Activá también en GitHub → Settings → Actions → General:"
echo "  'Workflow permissions' → Read and write"
echo "  'Allow GitHub Actions to create and approve pull requests' (si aplica)"
