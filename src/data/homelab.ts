import raw from "./homelab.json";

export interface HomelabQueries {
  today: number;
  blocked: number;
  blockedPct: number;
  uniqueDomains: number;
  clients: number;
  forwarded: number;
  cached: number;
}

export interface TopDomain {
  domain: string;
  count: number;
}

export interface HomelabData {
  available: boolean;
  source: "v5" | "v6" | null;
  fetchedAt: string | null;
  reason: string | null;
  showDomains: boolean;
  queries: HomelabQueries;
  topBlocked: TopDomain[];
}

export const homelab = raw as HomelabData;

export function ageInHours(iso: string | null): number | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  return (Date.now() - time) / 3_600_000;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

export function isStale(iso: string | null, maxHours = 24): boolean {
  const age = ageInHours(iso);
  return age === null ? true : age > maxHours;
}
