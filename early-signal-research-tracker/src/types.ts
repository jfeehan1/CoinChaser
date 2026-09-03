export type SourceName = "j7" | "fomo" | "axion";
export type Chain = "solana" | "base" | "ethereum" | "bnb" | "other";

/** A normalized observation, not an endorsement or a trade instruction. */
export interface Signal {
  source: SourceName;
  sourceSignalId: string;
  observedAt: string;
  chain: Chain;
  tokenAddress: string;
  symbol?: string;
  liquidityUsd?: number;
  volume1hUsd?: number;
  marketCapUsd?: number;
  ageMinutes?: number;
  uniqueBuyers1h?: number;
  topHolderPct?: number;
  creatorPct?: number;
  sniperPct?: number;
  isHoneypot?: boolean;
  canSell?: boolean;
  metadata?: Record<string, unknown>;
}

export type RiskFlag =
  | "UNVERIFIED_ADDRESS" | "VERY_NEW" | "LOW_LIQUIDITY" | "CONCENTRATED_HOLDERS"
  | "CREATOR_CONCENTRATION" | "SNIPER_CONCENTRATION" | "HONEYPOT_OR_SELL_RISK"
  | "SINGLE_SOURCE" | "STALE_SIGNAL" | "MISSING_RISK_DATA";

export interface RankedCandidate {
  chain: Chain;
  tokenAddress: string;
  symbol?: string;
  sources: SourceName[];
  latestObservation: string;
  score: number;
  scoreBreakdown: Record<string, number>;
  riskFlags: RiskFlag[];
  signals: Signal[];
}
