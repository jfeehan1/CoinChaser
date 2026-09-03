import { configuredAdapters } from "./adapters.js";
import { rankSignals } from "./rank.js";

const results = await Promise.allSettled(configuredAdapters().map((adapter) => adapter.fetchSignals()));
const signals = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
for (const result of results) if (result.status === "rejected") console.warn(`Adapter failed: ${result.reason}`);

const candidates = rankSignals(signals);
console.table(candidates.map((c) => ({ symbol: c.symbol ?? "?", chain: c.chain, score: c.score,
  sources: c.sources.join(","), flags: c.riskFlags.join(","), address: c.tokenAddress })));
console.log(JSON.stringify(candidates, null, 2));
