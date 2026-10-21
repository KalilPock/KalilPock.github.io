# Homelab → portfólio (opção A: cron no servidor)

O GitHub Actions **não** alcança a sua rede. Então quem coleta os dados é o
próprio servidor: ele roda `fetch-homelab.mjs`, commita `src/data/homelab.json`
e faz push. O push dispara o deploy no GitHub Pages.

```
systemd timer (6h)
  └─ update-stats.sh
       ├─ git pull --rebase
       ├─ node scripts/fetch-homelab.mjs --write   (lê /etc/kalil-homelab.env)
       ├─ git commit src/data/homelab.json (só se mudou)
       └─ git push  ──►  GitHub Actions  ──►  GitHub Pages
```

Sem env no CI, o passo `prebuild` apenas mantém o JSON já commitado — o build
nunca quebra.

## Pré-requisitos

- `git` e **Node.js ≥ 22.22**
- Uma **deploy key SSH com permissão de escrita** no repositório
  (Settings → Deploy keys → Add deploy key → marcar *Allow write access*)
- O Pi-hole acessível em `127.0.0.1` ou no IP da LAN a partir do servidor

## 1. Clonar

```bash
sudo install -d -o kalilpock -g kalilpock /opt/kalilpock
sudo -u kalilpock git clone https://github.com/KalilPock/KalilPock.github.io.git /opt/kalilpock/portfolio
cd /opt/kalilpock/portfolio
npm ci
```

> Ajuste usuário e caminho se o seu servidor usar outros.

## 2. Deploy key (escrita)

```bash
sudo -u kalilpock ssh-keygen -t ed25519 -C "homelab-portfolio" -f /home/kalilpock/.ssh/kalil_portfolio -N ""
sudo -u kalilpock cat /home/kalilpock/.ssh/kalil_portfolio.pub
```

Cole a chave pública em **Settings → Deploy keys** com *Allow write access*.
Depois configure o repositório para usá-la:

```bash
cd /opt/kalilpock/portfolio
sudo -u kalilpock git config core.sshCommand "ssh -i /home/kalilpock/.ssh/kalil_portfolio -o IdentitiesOnly=yes"
sudo -u kalilpock git remote set-url origin git@github.com:KalilPock/KalilPock.github.io.git
```

Teste: `sudo -u kalilpock git push` (ou `ssh -T git@github.com`).

## 3. Segredos

Crie `/etc/kalil-homelab.env` (somente leitura pelo serviço):

```ini
PIHOLE_URL=http://127.0.0.1
PIHOLE_API_KEY=sua-senha-ou-app-password
PIHOLE_SHOW_DOMAINS=false
```

```bash
sudo install -m 600 -o root -g root /dev/null /etc/kalil-homelab.env
sudo editor /etc/kalil-homelab.env
```

- **v6**: a chave é a senha de admin (o script autentica em `POST /api/auth`).
- **v5**: funciona com `?summaryRaw&auth=...` automaticamente.
- `PIHOLE_SHOW_DOMAINS=true` publica os top domínios bloqueados. O JSON é
  **público** — nunca são gravados IPs, hostnames internos ou o token.

Teste manual antes de agendar:

```bash
cd /opt/kalilpock/portfolio
sudo -u kalilpock env $(sudo cat /etc/kalil-homelab.env | xargs) node scripts/fetch-homelab.mjs --write
git --no-pager diff -- src/data/homelab.json
```

## 4. Instalar o timer

```bash
sudo cp deploy/homelab/kalil-homelab-fetch.service /etc/systemd/system/
sudo cp deploy/homelab/kalil-homelab-fetch.timer   /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now kalil-homelab-fetch.timer
```

Verificar:

```bash
systemctl list-timers kalil-homelab-fetch.timer
sudo systemctl start kalil-homelab-fetch.service
journalctl -u kalil-homelab-fetch.service -n 50 --no-pager
```

## Notas

- **Não** use `[skip ci]` na mensagem do commit: o push precisa disparar o
  workflow de deploy.
- O timer roda a cada **6 h** (`OnUnitActiveSec=6h`). Ajuste em
  `kalil-homelab-fetch.timer` se quiser outra cadência.
- Se o push falhar por non-fast-forward, o `git pull --rebase` na próxima
  execução resolve; o serviço não deixa o repositório sujo.
- O site mostra a data da coleta e marca “snapshot antigo” se passar de 24 h.
- Alternativa sem dar push na `main`: usar a API de Contents do GitHub com um
  PAT escopado apenas neste repositório (`contents: write`).

## Troubleshooting

| Sintoma | Causa provável |
|---|---|
| `401` / `403` | senha/API key incorreta no `/etc/kalil-homelab.env` |
| `v6 indisponível … tentando v5` e depois falha | URL errada ou Pi-hole offline |
| workflow não dispara | push feito com o `GITHUB_TOKEN` interno; use a deploy key |
| `Permission denied (publickey)` | deploy key não cadastrada ou `core.sshCommand` ausente |
| JSON não muda | Pi-hole reiniciou / poucas queries; o script só commita se houver diferença |
