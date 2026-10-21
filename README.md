# KalilPock.github.io

Portfólio pessoal: full stack, ensino e homelab. Site estático gerado com Astro,
publicado no GitHub Pages.

**Stack:** Astro 7 · Tailwind CSS 4 · Motion (vanilla) · TypeScript

## Rodando

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # gera dist/
npm run preview  # serve o build
npm run check    # astro check (tipos + templates)
```

Requer Node **≥ 22.22** (veja `.nvmrc`).

## Onde editar

Todo o conteúdo fica em `src/data/`:

| Arquivo | Conteúdo |
| --- | --- |
| `site.ts` | nome, descrição, links, e-mail, local, hero e sobre |
| `stack.ts` | grupos de tecnologias |
| `projects.ts` | cards de projetos |
| `teaching.ts` | seção de ensino |
| `homelab.ts` | tipos + leitura de `homelab.json` |
| `homelab.json` | estatísticas do Pi-hole (gerado) |

Ajustes visuais: `src/styles/global.css` (tokens em `@theme`) e
`astro.config.mjs` (fontes, site, sitemap).

Seções: `src/components/sections/`, primitivos: `src/components/ui/`,
efeitos: `src/scripts/`.

## Assets

- `public/avatar.svg` — avatar (SVG gerado)
- `public/og.png` — Open Graph 1200×630
- `public/favicon.svg`

## Homelab

As estatísticas do Pi-hole são coletadas **no servidor**, que commita
`src/data/homelab.json` e faz push. O CI não acessa a LAN. Instalação,
segredos e systemd em [`deploy/homelab/README.md`](deploy/homelab/README.md).

A seção de estatísticas (`HomelabStats.astro`) só deve ser reativada em
`src/pages/index.astro` quando `homelab.json` tiver `available: true` — hoje ela
está fora do render para não exibir um bloco vazio.

Coleta local (opcional):

```bash
cp .env.example .env    # preencha PIHOLE_URL / PIHOLE_API_KEY
npm run fetch:homelab   # grava src/data/homelab.json
```

## Deploy

O workflow `.github/workflows/deploy.yml` roda em push para `main`:
`check` → `build` → `upload-pages-artifact` → `deploy-pages`.

No GitHub: **Settings → Pages → Source: GitHub Actions**.

Commits automáticos do homelab (sem `[skip ci]`) disparam o deploy normalmente.
