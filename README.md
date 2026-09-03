# Early-Signal Research Tracker

This is a **research queue**, not a trading bot or investment recommendation. It combines permitted observations from J7 Tracker, FOMO, and Axion into a consistent token schema, then ranks candidates for manual due diligence. It does not place orders, connect to wallets, retain credentials, or scrape websites.

## Integration status

| Source | Default | What to do |
| --- | --- | --- |
| J7 Tracker | Local JSON import | No official public API was verified. Save a permitted export as `data/j7-signals.json`. |
| FOMO app | Local JSON import | Provide a permitted export or documented/authorized feed as `data/fomo-signals.json`. |
| Axion Trade | Disabled | No verified meme-coin signal integration is configured. Enable only with written API/export permission. |

The tracker intentionally does **not** claim any of these services exposes a public API. Do not add browser scraping, private endpoints, or credentials to the repository.

## Quick start

1. Install Node.js 20+.
2. Copy `data/example-signals.json` to `data/j7-signals.json` and/or `data/fomo-signals.json`; replace every example value with data from a permitted source. A token address is the join key—never join only by ticker symbol.
3. Run `npm install`, then `npm start`.
4. Read the sorted table, then independently verify the contract address, liquidity lock, holder distribution, deployer history, taxes/transfer behavior, and social claims before considering any action.

Set `J7_EXPORT_FILE` or `FOMO_EXPORT_FILE` to use a different local file. The program emits both a compact table and full JSON for a dashboard/database layer.

## Browser app (no install required)

Open `app/index.html` in a modern browser. Import permitted JSON exports or paste JSON directly to get a local, interactive research queue. The app processes data only in the browser; it makes no network requests, stores no credentials, connects to no wallet, and cannot execute a trade. Use **Export visible JSON** to save the filtered queue.

### Publish a public GitHub Pages link

This repository includes `.github/workflows/deploy-pages.yml`, which publishes the `app/` folder whenever changes are pushed to `main`.

1. In the GitHub repository, choose **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** and save.
3. Commit and push the `.github` folder included in this download. GitHub will run **Deploy Signal Scout to GitHub Pages** under the repository's **Actions** tab.
4. When the run completes, the Pages settings screen shows your live URL. It normally follows `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/`.

The repository must be public unless your GitHub plan supports Pages for private repositories.

## Score model (0–100)

The score prioritizes items worth researching soon: freshness (up to 30), liquidity (up to 50), activity relative to liquidity (up to 25), unique buyers (up to 25), and agreement among sources (12 each). It subtracts 20 for holder concentration above 20%, 20 for creator concentration above 10%, 15 for sniper concentration above 15%, and 100 for a honeypot/failed-sell indication. Values are clamped to 0–100.

This model intentionally favors **cross-source confirmation and liquidity**, not hype. A high score does not mean a coin is safe, legitimate, or likely to rise; a low score does not mean it is bad. Tune thresholds in `src/rank.ts` only after you have evaluated paper-trading or historical results.

## Input schema

Each JSON file contains an array of observations. Required: `source`, `sourceSignalId`, `observedAt` (ISO 8601), `chain`, and `tokenAddress`. Useful optional fields are `liquidityUsd`, `volume1hUsd`, `marketCapUsd`, `ageMinutes`, `uniqueBuyers1h`, `topHolderPct`, `creatorPct`, `sniperPct`, `isHoneypot`, and `canSell`. See `data/example-signals.json`.

## Non-negotiable filters / flags

`HONEYPOT_OR_SELL_RISK` should exclude a candidate. Treat `UNVERIFIED_ADDRESS`, `LOW_LIQUIDITY`, `CONCENTRATED_HOLDERS`, `CREATOR_CONCENTRATION`, `SNIPER_CONCENTRATION`, `SINGLE_SOURCE`, `STALE_SIGNAL`, and `MISSING_RISK_DATA` as mandatory manual-review flags. Very new coins are especially prone to manipulation and rug pulls.
