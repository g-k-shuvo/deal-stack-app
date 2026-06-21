// Centralized currency/number formatting (PRD NFR-13).

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUSD(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return USD.format(value);
}

/** Compact form for KPIs/headers, e.g. 4200000 -> "$4.2M". */
export function formatUSDCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return USD.format(value);
}
