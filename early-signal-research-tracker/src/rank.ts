import type { RankedCandidate, RiskFlag, Signal } from "./types.js";

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const latest = <T extends Signal>(signals: T[]) => signals.reduce((a, b) =>
  Date.parse(a.observedAt) > Date.parse(b.observedAt) ? a : b);

export function rankSignals(signals: Signal[], now = new Date()): RankedCandidate[] {
  const groups = new Map<string, Signal[]>();
  for (const signal of signals) {
    const key = `${signal.chain}:${signal.tokenAddress.toLowerCase()}`;
    groups.set(key, [...(groups.get(key) ?? []), signal]);
  }
  return [...groups.values()].map((group) => rankGroup(group, now))
    .sort((a, b) => b.score - a.score);
}

function rankGroup(signals: Signal[], now: Date): RankedCandidate {
  const sample = latest(signals);
  const sources = [...new Set(signals.map((s) => s.source))];
  const flags: RiskFlag[] = [];
  const add = (flag: RiskFlag, when: boolean) => { if (when) flags.push(flag); };
  const age = sample.ageMinutes;
  const fresh = age === undefined ? 0 : clamp(30 - age / 4); // discovery preference, not quality
  const liquidity = sample.liquidityUsd === undefined ? 0 : clamp(Math.log10(Math.max(1, sample.liquidityUsd)) * 10 - 20);
  const activity = sample.volume1hUsd === undefined || sample.liquidityUsd === undefined ? 0 :
    clamp((sample.volume1hUsd / Math.max(sample.liquidityUsd, 1)) * 25);
  const buyers = sample.uniqueBuyers1h === undefined ? 0 : clamp(sample.uniqueBuyers1h / 4);
  const consensus = sources.length * 12;
  const concentrationPenalty = (sample.topHolderPct ?? 0) > 20 ? 20 : 0;
  const creatorPenalty = (sample.creatorPct ?? 0) > 10 ? 20 : 0;
  const sniperPenalty = (sample.sniperPct ?? 0) > 15 ? 15 : 0;
  const sellPenalty = sample.isHoneypot || sample.canSell === false ? 100 : 0;
  const stale = Date.parse(now.toISOString()) - Date.parse(sample.observedAt) > 15 * 60_000;
  add("UNVERIFIED_ADDRESS", !/^[1-9A-HJ-NP-Za-km-z]{32,44}$|^0x[a-fA-F0-9]{40}$/.test(sample.tokenAddress));
  add("VERY_NEW", age !== undefined && age < 10); add("LOW_LIQUIDITY", (sample.liquidityUsd ?? 0) < 20_000);
  add("CONCENTRATED_HOLDERS", (sample.topHolderPct ?? 0) > 20); add("CREATOR_CONCENTRATION", (sample.creatorPct ?? 0) > 10);
  add("SNIPER_CONCENTRATION", (sample.sniperPct ?? 0) > 15); add("HONEYPOT_OR_SELL_RISK", sellPenalty > 0);
  add("SINGLE_SOURCE", sources.length < 2); add("STALE_SIGNAL", stale);
  add("MISSING_RISK_DATA", [sample.liquidityUsd, sample.topHolderPct, sample.creatorPct, sample.sniperPct, sample.canSell].some((v) => v === undefined));
  const breakdown = { freshness: fresh, liquidity, activity, buyers, crossSourceConsensus: consensus,
    concentrationPenalty: -concentrationPenalty, creatorPenalty: -creatorPenalty, sniperPenalty: -sniperPenalty, sellRiskPenalty: -sellPenalty };
  return { chain: sample.chain, tokenAddress: sample.tokenAddress, symbol: sample.symbol, sources,
    latestObservation: sample.observedAt, score: Math.round(clamp(Object.values(breakdown).reduce((a, b) => a + b, 0))), scoreBreakdown: breakdown, riskFlags: flags, signals };
}
