#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. Vérification secrets
echo "── Vérification des secrets…"
bash scripts/check_no_secrets.sh

# 2. Push vers GAS
echo "── Push vers Google Apps Script…"
npx clasp push

# 3. Déploiement (nouvelle version)
DESC="${1:-deploy $(date '+%Y-%m-%d %H:%M')}"
echo "── Déploiement : $DESC"
npx clasp deploy --description "$DESC"

# 4. Afficher l'URL
echo ""
echo "── Déploiements actifs :"
npx clasp deployments
echo ""
echo "✓ Terminé. Ouvre l'URL du dernier déploiement pour tester."
