$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Ruleset = Join-Path $Root '.github\rulesets\main-security.json'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error 'Instalá GitHub CLI: https://cli.github.com/'
}

$Repo = gh repo view --json nameWithOwner -q .nameWithOwner
$Existing = gh api "repos/$Repo/rulesets" --jq '.[] | select(.name=="Protección main — Security CI obligatorio") | .id' 2>$null

if ($Existing) {
  Write-Host "Actualizando ruleset id=$Existing en $Repo"
  gh api "repos/$Repo/rulesets/$Existing" --method PUT --input $Ruleset
} else {
  Write-Host "Creando ruleset en $Repo"
  gh api "repos/$Repo/rulesets" --method POST --input $Ruleset
}

Write-Host ''
Write-Host 'Branch protection aplicada. Checks obligatorios para merge:'
Write-Host '  - security / gitleaks'
Write-Host '  - security / semgrep'
Write-Host '  - security / client-secrets'
Write-Host '  - ci / required'
