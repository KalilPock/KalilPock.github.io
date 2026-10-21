#!/usr/bin/env node
/**
 * Busca as estatísticas do Pi-hole e grava src/data/homelab.json.
 *
 * Modos:
 *   --write   (npm run fetch:homelab)  busca e grava; falha com exit 1
 *   --if-env  (predev / prebuild)      só busca se houver env; nunca quebra o build
 *
 * Suporta Pi-hole v6 (sessão via /api/auth) e v5 (?summaryRaw&auth=).
 * O JSON gerado é público: apenas agregados e, opcionalmente, domínios.
 * Nunca grava IPs, hostnames internos ou o token.
 */
import { writeFile, mkdir, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = resolve(root, "src/data/homelab.json");

const args = new Set(process.argv.slice(2));
const IF_ENV = args.has("--if-env");
const TIMEOUT_MS = 8000;

const log = (msg) => console.log(`[homelab] ${msg}`);
const warn = (msg) => console.warn(`[homelab] ${msg}`);

const empty = (reason) => ({
  available: false,
  source: null,
  fetchedAt: null,
  reason,
  showDomains: false,
  queries: {
    today: 0,
    blocked: 0,
    blockedPct: 0,
    uniqueDomains: 0,
    clients: 0,
    forwarded: 0,
    cached: 0,
  },
  topBlocked: [],
});

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const baseUrl = (process.env.PIHOLE_URL ?? "").trim().replace(/\/+$/, "");
const apiKey = (process.env.PIHOLE_API_KEY ?? "").trim();
const showDomains = (process.env.PIHOLE_SHOW_DOMAINS ?? "").toLowerCase() === "true";

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} em ${url.replace(/auth=.*/, "auth=***")}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function readV6() {
  const auth = await fetchJson(`${baseUrl}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: apiKey }),
  });

  const sid = auth?.session?.sid;
  if (!sid) throw new Error("v6: sessão não retornada por /api/auth");

  const headers = { "X-FTL-SID": sid };
  const summary = await fetchJson(`${baseUrl}/api/stats/summary`, { headers });

  let topBlocked = [];
  if (showDomains) {
    try {
      const top = await fetchJson(
        `${baseUrl}/api/stats/top_domains?blocked=true&count=5`,
        { headers },
      );
      topBlocked = (top?.domains ?? [])
        .slice(0, 5)
        .map((d) => ({ domain: String(d.domain ?? ""), count: num(d.count) }))
        .filter((d) => d.domain);
    } catch {
      topBlocked = [];
    }
  }

  return {
    source: "v6",
    queries: {
      today: num(summary?.queries?.total),
      blocked: num(summary?.queries?.blocked),
      blockedPct: num(summary?.queries?.percent_blocked),
      uniqueDomains: num(summary?.queries?.unique_domains),
      clients: num(summary?.clients?.active ?? summary?.clients?.total),
      forwarded: num(summary?.queries?.forwarded),
      cached: num(summary?.queries?.cached),
    },
    topBlocked,
  };
}

async function readV5() {
  const auth = encodeURIComponent(apiKey);
  const summary = await fetchJson(`${baseUrl}/api.php?summaryRaw&auth=${auth}`);

  let topBlocked = [];
  if (showDomains) {
    try {
      const top = await fetchJson(`${baseUrl}/api.php?topAds&auth=${auth}`);
      topBlocked = (Array.isArray(top) ? top : [])
        .slice(0, 5)
        .map((d) => ({ domain: String(d.domain ?? ""), count: num(d.count) }))
        .filter((d) => d.domain);
    } catch {
      topBlocked = [];
    }
  }

  return {
    source: "v5",
    queries: {
      today: num(summary?.dns_queries_today),
      blocked: num(summary?.ads_blocked_today),
      blockedPct: num(summary?.ads_percentage_today),
      uniqueDomains: num(summary?.unique_domains),
      clients: num(summary?.clients_ever_seen),
      forwarded: num(summary?.queries_forwarded),
      cached: num(summary?.queries_cached),
    },
    topBlocked,
  };
}

async function fetchStats() {
  try {
    return await readV6();
  } catch (v6Error) {
    if (v6Error.status === 401 || v6Error.status === 403) throw v6Error;
    log(`v6 indisponível (${v6Error.message}); tentando v5…`);
    return readV5();
  }
}

async function writeData(payload) {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + ".tmp";
  await writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await rename(tmp, DATA_FILE);
}

async function main() {
  if (!baseUrl || !apiKey) {
    if (IF_ENV) {
      log("sem PIHOLE_URL/PIHOLE_API_KEY — mantendo o JSON já commitado.");
      return;
    }
    warn("defina PIHOLE_URL e PIHOLE_API_KEY (veja .env.example).");
    process.exitCode = 1;
    return;
  }

  try {
    const stats = await fetchStats();
    const payload = {
      available: true,
      source: stats.source,
      fetchedAt: new Date().toISOString(),
      reason: null,
      showDomains,
      queries: stats.queries,
      topBlocked: showDomains ? stats.topBlocked : [],
    };
    await writeData(payload);
    log(
      `ok (${stats.source}): ${payload.queries.today} queries, ` +
        `${payload.queries.blocked} bloqueadas (${payload.queries.blockedPct.toFixed(1)}%).`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    warn(`falha ao buscar: ${message}`);
    if (IF_ENV) return;
    process.exitCode = 1;
  }
}

if (!existsSync(DATA_FILE)) {
  await writeData(empty("ainda não coletado"));
}

await main();
