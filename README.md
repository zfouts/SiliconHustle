# Silicon Hustle

A modernized [Dope Wars](https://en.wikipedia.org/wiki/Drugwars) style trading game set in the tech world. Flip volatile digital assets across global tech hubs, dodge the feds, pay off your loan shark, and hustle your way to the top.

Created by [Zachary Fouts](https://fouts.dev).

**[Play Now](https://silicon-hustle.com)** | **[siliconwars.org](https://siliconwars.org)** | **[siliconhustle.org](https://siliconhustle.org)**

Zero dependencies. No build step. No frameworks. Pure vanilla HTML, CSS, and JavaScript ES modules.

---

## Screenshots

> *Coming soon*

---

## How to Play

You start with cash, debt, and 30 days (customizable). Travel between 8 global tech hub cities buying assets where they're cheap and selling where they're expensive. Pay off your loan shark before interest buries you. Watch out for feds, scammers, and your own greed.

---

## Game Mechanics

### Assets

10 tradeable digital assets, each with different base prices, volatility, and category modifiers per city:

| Asset | Category | Volatility | Notes |
|-------|----------|-----------|-------|
| BitCoin | Crypto | Medium | Blue chip, Elon tweets move it |
| EtherBlock | Crypto | Medium | Solid performer |
| MemeCoin | Crypto | Very High | Wild swings, rug pull risk |
| CryptoApes | NFT | High | Trendy, volatile |
| GPU Rigs | Hardware | Low | Stable, safe plays |
| DataSets | Data | Low | Steady earner |
| ZeroDayExploit | Contraband | High | Big margins, raises heat |
| AI Models | Software | Medium | Tech darling |
| PremiumDomains | Digital | Medium | Niche market |
| VPN Accounts | Service | Medium | Goes viral sometimes |

### Cities

8 cities, each with unique price modifiers. Buy where it's cheap, sell where it's expensive:

| City | Cheap | Expensive |
|------|-------|-----------|
| San Francisco | Hardware | Crypto, Software |
| Austin | Crypto | Hardware, NFTs |
| New York | Services | Data, Crypto |
| Miami | Contraband | NFTs |
| Seattle | Software, Hardware | Data |
| Berlin | Services, Contraband | Crypto |
| Tokyo | Hardware | Digital, Software |
| Lagos | Data, Digital | Services |

### Difficulty & Game Length

| Mode | Starting Cash | Debt | Interest |
|------|--------------|------|----------|
| Easy | $5,000 | $3,000 | 5%/day |
| Normal | $2,000 | $5,500 | 10%/day |
| Hard | $1,000 | $8,000 | 15%/day |

Game length is customizable from 10 to 60 days via slider, or slide all the way right for **unlimited mode** (play until you choose to retire).

### Loan Sharks

Loan sharks aren't in every city — 2-3 random cities per game have them. The game tells you which cities on day 1. You must travel to a loan shark city to repay debt or borrow. Interest compounds daily and doesn't wait.

### Heat System

Trading contraband (ZeroDayExploits) raises your heat level. High heat means feds can raid you, confiscating inventory and cash. Heat decays daily (faster with the VPN Shield perk). Buy insurance through encounters or perks for protection.

### Supply & Demand

Buying large quantities raises the local price. Selling lowers it. Pressure decays daily. The Market Maker perk reduces the impact.

### Price Intelligence

- **Click any asset name** to see a detailed modal with cross-city price comparison, all-time high/low, historical average, and P&L
- **Global tab** (requires Global Terminal perk, $25k) shows global average prices and spread indicators
- **AI Trading Bot** (requires AI Trading Bot perk, $1M) unlocks full analysis: exact arbitrage percentages, global sparkline charts, BUY/SELL/HOLD signals, and a sidebar with prioritized trade recommendations

---

## Features

### Core Gameplay
- Buy/sell with cost basis tracking and real-time P&L
- Sparkline price charts per asset (local and global)
- Cross-city price comparison with cheapest/priciest labels
- Supply and demand — your trades move local prices
- Deal/Peak tags for historical price analysis
- Auto-save with resume support

### Missions
Side quests offered when you travel — up to 2 active at once:
- Deliver assets to specific cities
- Hit profit targets
- Collect asset sets
- Visit cities
- Complete trade counts
- Hoard specific assets

### Perk Shop
10 permanent upgrades:

| Perk | Cost | Effect |
|------|------|--------|
| Bulk Buyer | $3,000 | 5% discount on purchases |
| VPN Shield | $4,000 | Heat decays 2x faster |
| Insider Info | $2,500 | Price trend predictions in travel menu |
| Cloud Storage | $2,000 | +75 storage capacity |
| Private Jet | $5,000 | 50% chance travel costs no day |
| Tax Lawyer | $3,500 | Halve loan interest rate |
| Bodyguard | $3,000 | Immune to mugging |
| Market Maker | $4,500 | Supply/demand impact -50% |
| Global Terminal | $25,000 | Unlock global market tab |
| AI Trading Bot | $1,000,000 | Full AI analysis, signals, and recommendations |

### Random Events (50+)
Market spikes, crashes, whale buys, SEC crackdowns, rug pulls, TikTok virality, Elon tweets, ChatGPT recommendations, crypto winter, phishing attacks, pump-and-dump groups, SoundCloud rapper collabs, grandma asking about Bitcoin at Thanksgiving, and more.

### Encounters (20+)
Choice-based events with risk/reward decisions:
- Shady USB Drive, Whale Insider, Underground Auction, Influencer Deal, Protection Racket
- Ponzi Pitch, Fake ICO, Pump Group Invite, Counterfeit Hardware, Crypto Tumbling
- NFT Bro, Crypto Twitter Drama, Metaverse Real Estate, Crypto Date, Fat Finger Transfer, Mom Calls
- ...and more

### Black Market
~8% chance per day. A shady dealer appears with 1-3 assets at 30-70% below market. Limited time.

### Achievements (18)
Unlockable milestones persisted across games: Baby Steps, Debt Free, Legend, Globe Trotter, Diamond Hands, Full Degen, Paper Hands, HODL Gang, AI Ascension, and more.

### Polish
- CRT scanline overlay and glitch text effects
- Synth sound effects via Web Audio API (no audio files)
- Matrix rain background on title screen (auto-pauses during gameplay)
- Travel transition animations
- Toast notifications
- Animated HUD value changes
- Responsive design (mobile-friendly)
- High score leaderboard

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| T | Travel |
| L | Loan Shark |
| P | Perk Shop |
| Esc | Close modal |

---

## Scoring

| Net Worth | Rank |
|-----------|------|
| $100,000+ | Silicon Valley Legend |
| $50,000+ | Tech Mogul |
| $25,000+ | Startup Founder |
| $10,000+ | Crypto Bro |
| $5,000+ | Junior Dev |
| $0+ | Broke Intern |
| Negative | Bankrupt Degen |

---

## Project Structure

```
SiliconHustle/
  index.html                 Game UI
  style.css                  Styles
  main.js                    Entry point & event wiring
  data/
    constants.js             Assets, cities, events, encounters, perks, missions, achievements
  systems/
    audio.js                 Web Audio API synth engine
    state.js                 Game state, save/load, validation
    prices.js                Price generation, mean reversion, supply/demand
    trading.js               Buy/sell/dump with P&L tracking
    travel.js                City travel, transition animation
    day.js                   Day advancement orchestrator
    events.js                Random events + federal raids
    bank.js                  Loan shark (city-restricted), storage upgrades
    achievements.js          Achievement system (localStorage)
    scores.js                High score leaderboard (localStorage)
    missions.js              Side quest system
    perks.js                 Perk shop (permanent upgrades)
    encounters.js            Choice-based random encounters
    blackmarket.js           Rare discounted deals
    aibot.js                 AI Trading Bot recommendations engine
  ui/
    screens.js               Screen/modal management
    toast.js                 Toast notifications
    matrix.js                Matrix rain background (start/stop)
    charts.js                Sparkline & chart canvas rendering
    hud.js                   HUD, day bar, heat bar, game over
    market.js                Market table, global tab, asset detail modal
    log.js                   News feed rendering
```

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, grid, flexbox, animations, CRT effects
- **Vanilla JavaScript** — ES modules, zero dependencies
- **Web Audio API** — procedural synth sounds, no audio files
- **Canvas 2D** — sparklines, price charts, net worth graphs
- **localStorage** — game saves, high scores, achievements
- **GitHub Pages** — hosting

No frameworks. No bundlers. No transpilers. No npm packages at runtime.

## Local Development

```bash
git clone https://github.com/zfouts/SiliconHustle.git
cd SiliconHustle
python3 -m http.server 8080
# Open http://localhost:8080
```

## Security

The codebase has been through 6 rounds of red/blue team security audits:

- All dynamic text rendered via `textContent` (XSS-immune)
- Full save game validation with deep type/range checks
- Content Security Policy via HTTP headers
- All localStorage operations wrapped in try/catch
- Race condition guards on async operations
- Price overflow caps and mean reversion
- Input validation on all user-facing controls
- No `eval`, no `innerHTML` with user data, no `document.write`

## Privacy

- No personal data collected or transmitted
- No tracking, no analytics cookies
- All game data stored locally in the browser via `localStorage`
- Cloudflare sets essential security cookies only
- Full privacy policy accessible in-game

## Legal

Silicon Hustle is a fictional game for entertainment only. Not financial advice. All characters, assets, events, and scenarios are fictional. See the in-game disclaimer for full details.

## License

MIT License. See [LICENSE](LICENSE) for details.

