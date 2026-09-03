import { readFile } from "node:fs/promises";
import type { Signal, SourceName } from "./types.js";

export interface SignalAdapter {
  readonly source: SourceName;
  fetchSignals(): Promise<Signal[]>;
}

/**
 * Safe default adapter: import a permitted export you saved locally.
 * It never logs in, scrapes a website, executes trades, or handles wallet secrets.
 */
export class JsonFileAdapter implements SignalAdapter {
  constructor(readonly source: SourceName, private readonly path: string) {}
  async fetchSignals(): Promise<Signal[]> {
    const raw: unknown = JSON.parse(await readFile(this.path, "utf8"));
    if (!Array.isArray(raw)) throw new Error(`${this.path} must contain a JSON array`);
    return raw.map((item) => ({ ...(item as Signal), source: this.source }));
  }
}

/** Configuration point for a future *documented and authorized* provider integration. */
export class UnavailableAdapter implements SignalAdapter {
  constructor(readonly source: SourceName, private readonly reason: string) {}
  async fetchSignals(): Promise<Signal[]> {
    console.warn(`[${this.source}] skipped: ${this.reason}`);
    return [];
  }
}

export function configuredAdapters(): SignalAdapter[] {
  return [
    new JsonFileAdapter("j7", process.env.J7_EXPORT_FILE ?? "data/j7-signals.json"),
    new JsonFileAdapter("fomo", process.env.FOMO_EXPORT_FILE ?? "data/fomo-signals.json"),
    // Do not replace this with scraping. Implement only from Axion's written API permission/export.
    new UnavailableAdapter("axion", "No verified, authorized meme-coin signal API configured; use a permitted JSON export when available.")
  ];
}
