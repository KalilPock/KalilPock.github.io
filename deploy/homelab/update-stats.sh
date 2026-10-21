#!/usr/bin/env bash
# Roda no servidor do homelab: puxa o código, coleta as estatísticas do
# Pi-hole, commita o JSON e faz push. O push dispara o deploy no GitHub Pages.
#
# Requer: git, node >= 22, deploy key com permissão de escrita no repositório.
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/kalilpock/portfolio}"
BRANCH="${BRANCH:-main}"

cd "$REPO_DIR"

echo "[homelab] sincronizando $BRANCH…"
git pull --rebase --autostash --quiet

echo "[homelab] coletando estatísticas…"
node scripts/fetch-homelab.mjs --write

git add -- src/data/homelab.json

if git diff --cached --quiet; then
  echo "[homelab] sem mudanças; nada a publicar."
  exit 0
fi

git -c user.name="homelab-bot" -c user.email="homelab-bot@localhost" \
  commit --quiet -m "chore(data): atualiza estatísticas do homelab"

echo "[homelab] publicando…"
git push --quiet origin "$BRANCH"
echo "[homelab] ok."
