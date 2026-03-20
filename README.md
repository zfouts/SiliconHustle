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

You start with cash, debt, and a time limit (customizable). Travel between 8 cities buying assets where they're cheap and selling where they're expensive. Pay off your loan shark before interest buries you. Watch out for feds, rival traders, and your own greed.

Each game features a different mix of cities drawn from a pool of 14 global tech hubs -- some are always present, others rotate for replayability.

---

## Game Mechanics

### Assets

12 tradeable digital assets, each with different base prices, volatility, and category modifiers per city:

| Asset | Category | Volatility | Notes |
|-------|----------|-----------|-------|
| BitCoin | Crypto | Medium | Blue chip, Elon tweets move it |
| EtherBlock | Crypto | Medium | Solid performer |
| MemeCoin | Crypto | Very High | Wild swings, rug pull risk |
| CryptoApes | NFT | High | Trendy, volatile |
| GPU Rigs | Hardware | Low | Stable, safe plays |
| DataSets | Data | Low | Steady earner |
| ZeroDayExploit | Contraband | High | Big margins, 5 heat/unit |
| StolenCreds | Contraband | High | Cheap, high volume, 3 heat/unit |
| RansomKit | Contraband | Very High | Expensive, huge margins, 8 heat/unit |
| AI Models | Software | Medium | Tech darling |
| PremiumDomains | Digital | Medium | Niche market |
| VPN Accounts | Service | Medium | Goes viral sometimes |

### Cities

Each game selects 8 cities from a pool of 14. Three cities are always present (San Francisco, New York, Tokyo), while 5 are randomly drawn from the remaining pool:

| City | Vibe | Specialty |
|------|------|-----------|
| **San Francisco** | VC money flows freely | Cheap: Hardware / Pricey: Crypto, Software |
| **Austin** | Crypto bros paradise | Cheap: Crypto / Pricey: Hardware, NFTs |
| **New York** | Wall Street meets Web3 | Cheap: Services / Pricey: Data, Crypto |
| **Miami** | Offshore vibes | Cheap: Contraband / Pricey: NFTs |
| **Seattle** | Big tech backyard | Cheap: Software, Hardware / Pricey: Data |
| **Berlin** | Underground hacker scene | Cheap: Services, Contraband |
| **Tokyo** | Cutting edge tech market | Cheap: Hardware / Pricey: Digital, Software |
| **Lagos** | Africa's booming tech hub | Cheap: Data, Digital / Pricey: Services |
| **Shenzhen** | Hardware factory of the world | Cheap: Hardware / Pricey: Software, Data |
| **Dubai** | Crypto tax haven | Cheap: Contraband / Pricey: NFTs, Digital |
| **Singapore** | Fintech regulatory paradise | Cheap: Digital, Services / Pricey: Crypto |
| **Bangalore** | India's Silicon Valley | Cheap: Software, Services / Pricey: Hardware |
| **Tel Aviv** | Cybersecurity capital | Cheap: Contraband, Data / Pricey: Hardware |
| **London** | Old money meets Web3 | Cheap: Crypto / Pricey: NFTs, Data |

### Difficulty & Game Length

| Mode | Starting Cash | Debt | Interest |
|------|--------------|------|----------|
| Easy | $5,500 | $3,000 | 5%/day |
| Normal | $2,500 | $5,500 | 10%/day |
| Hard | $1,500 | $8,000 | 15%/day |

Game length is customizable from 10 to 60 days via slider, or slide all the way right for **unlimited mode** (play until you choose to retire).

### Loan Sharks

Loan sharks aren't in every city -- 2-3 random cities per game have them. The game tells you which cities on day 1. You must travel to a loan shark city to repay debt or borrow. Interest compounds daily and doesn't wait.

### Heat & Contraband

Trading contraband raises your heat level. Different contraband items generate different amounts of heat (StolenCreds: 3/unit, ZeroDayExploit: 5/unit, RansomKit: 8/unit). High heat means feds can raid you, confiscating inventory and cash. Heat decays 8 points daily (16 with VPN Shield perk).

### Supply & Demand

Buying large quantities raises the local price. Selling lowers it. Pressure decays daily. The Market Maker perk reduces the impact. The rival trader NPC also affects supply/demand in whichever city they're trading in.

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
- Supply and demand -- your trades move local prices
- Deal/Peak/Volatile tags for price analysis
- Auto-save with resume support

### Market Dynamics

| System | Description |
|--------|-------------|
| **Market Cycles** | Bull, bear, and neutral phases rotate every 3-7 days, biasing all prices |
| **Volatile Assets** | Random assets enter 2x volatility mode for 3-5 days (pulsing yellow tag) |
| **Price Rumors** | Hear about upcoming price spikes/crashes in other cities 1-2 days early |
| **Flash City Events** | Daily chance: Flash Sale (-25%), Tech Boom (+30%), or Police Crackdown |
| **Rival Trader** | AI-controlled "ShadowTrader" moves between cities, buying/selling and shifting prices |
| **Trade Streaks** | Consecutive profitable sells earn escalating cash bonuses (capped at $3,000) |
| **Lucky Trades** | 8% chance on any trade for a 15% discount (buy) or premium (sell) |
| **Passive Dividends** | Assets held 3+ days generate daily income by category (capped at $2,000/day) |

### Player Actions

| Action | Description |
|--------|-------------|
| **Market Manipulation [M]** | Spend $2,000 + 15 heat to pump (+25-40%) or crash (-25-40%) any asset locally |
| **Cargo Insurance** | Buy raid protection (cost scales with inventory). Next raid is completely blocked |
| **City Contacts** | 15% chance on arrival to make a contact: 10% buy discount for 4-7 days |
| **Smuggling Routes** | 3 random underground routes per game. Traveling them reduces heat by 30% |

### Risk & Reward

| System | Description |
|--------|-------------|
| **Wanted Bounty** | At 80+ heat, survive 5 days to collect $3,000-$8,000. Raids deal double damage during bounty |
| **Federal Raids** | Heat 60+ triggers raids: 20-50% inventory seized + 10-30% cash fined |
| **Explorer Bonus** | First visit to a new city grants $200-$800 cash |

### Missions
Side quests offered when you travel -- up to 2 active at once:
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
| Private Jet | $5,000 | 50% chance travel costs no day or airfare |
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

### Achievements (31)
Unlockable milestones persisted across games:

| Achievement | Description |
|-------------|-------------|
| Baby Steps | Make your first trade |
| Debt Free | Pay off all your debt |
| Five Figures | Reach $10,000 net worth |
| Baller | Reach $50,000 net worth |
| Legend | Reach $100,000 net worth |
| Deal Hunter | Buy an asset marked DEAL |
| Globe Trotter | Visit every city on the map |
| Dark Net | Buy 10+ ZeroDayExploits |
| Survivor | Survive a fed raid |
| Whale | Hold $50,000+ in assets |
| Speed Run | Reach $25,000 net worth by day 10 |
| Diamond Hands | Hold same asset for 15+ days |
| Mission Master | Complete 5 missions |
| Perked Up | Buy 3 perks |
| Shadow Trader | Buy from the black market |
| AI Ascension | Buy the AI Trading Bot ($1M) |
| Full Degen | Make 50+ trades in a single game |
| Paper Hands | Sell at a loss 5 times |
| HODL Gang | End the game holding 8+ asset types |
| Rock Bottom | Get wiped out (go completely broke) |
| Hot Streak | 5 consecutive profitable trades |
| Bull Rider | Earn $10,000+ profit during a bull market |
| Explorer | Visit 5 different cities |
| Chaos Trader | Profit from selling a volatile asset |
| Bounty Hunter | Collect 3 wanted bounties |
| Passive Income | Earn $5,000+ in asset dividends |
| Lucky Trader | Get 5 lucky trades |
| Puppet Master | Manipulate the market 5 times |
| Better Safe | Block a raid with insurance |
| Smuggler | Use a smuggling route 3 times |

### Polish
- CRT scanline overlay and glitch text effects
- Synth sound effects via Web Audio API (no audio files)
- Matrix rain background on title screen (auto-pauses during gameplay)
- Travel transition animations
- Toast notifications
- Animated HUD value changes
- Responsive design (mobile-friendly)
- High score leaderboard (local)
- Private leaderboards (Cloudflare Workers API)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| T | Travel |
| W | Wait 1 day |
| L | Loan Shark |
| P | Perk Shop |
| M | Manipulate Market |
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
    state.js                 Game state, save/load, validation, city selection
    prices.js                Price generation, mean reversion, supply/demand
    trading.js               Buy/sell/dump with P&L tracking, streaks, lucky trades
    travel.js                City travel, smuggling routes, contacts, explorer bonus
    day.js                   Day advancement, market cycles, rival trader, flash events,
                             volatile assets, rumors, bounty, dividends
    events.js                Random events, federal raids, insurance
    bank.js                  Loan shark (city-restricted), storage upgrades
    achievements.js          Achievement system (localStorage)
    scores.js                High score leaderboard (localStorage)
    leaderboard.js           Private leaderboards (Cloudflare Workers API)
    missions.js              Side quest system
    perks.js                 Perk shop (permanent upgrades)
    encounters.js            Choice-based random encounters
    blackmarket.js           Rare discounted deals
    aibot.js                 AI Trading Bot recommendations engine
    manipulation.js          Market manipulation (pump/crash)
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

- **HTML5** -- semantic markup
- **CSS3** -- custom properties, grid, flexbox, animations, CRT effects
- **Vanilla JavaScript** -- ES modules, zero dependencies
- **Web Audio API** -- procedural synth sounds, no audio files
- **Canvas 2D** -- sparklines, price charts, net worth graphs
- **localStorage** -- game saves, high scores, achievements
- **GitHub Pages** -- hosting
- **Cloudflare Workers + D1** -- private leaderboard API
- **Google AdSense** -- advertisements

No frameworks. No bundlers. No transpilers. No npm packages at runtime.

## Local Development

```bash
git clone https://github.com/zfouts/SiliconHustle.git
cd SiliconHustle
python3 -m http.server 8080
# Open http://localhost:8080
```

## Security

The codebase has been through multiple rounds of security audits:

- All dynamic text rendered via `textContent` (XSS-immune)
- Full save game validation with deep type/range checks and key whitelisting
- Content Security Policy via HTTP headers
- All localStorage operations wrapped in try/catch
- Race condition guards on async operations
- Price overflow caps ($300,000 max) and mean reversion
- Input validation on all user-facing controls
- No `eval`, no `innerHTML` with user data, no `document.write`
- Backward-compatible save migration for new state fields
- Gameplay exploit prevention: streak bonus cap ($3k), dividend cap ($2k/day), insurance cost cap ($50k)
- Leaderboard codes validated with strict regex (`/^[A-Z0-9]{4,8}$/`)
- High score names sanitized (HTML stripped, control chars removed, length capped)

## Privacy

- No personal data collected directly
- Game data stored locally in the browser via `localStorage`
- Optional private leaderboards transmit display name, score, difficulty, and days played to Cloudflare Workers API (auto-expire after 90 days)
- Google AdSense may use cookies for ad personalization (see in-game privacy policy)
- Cloudflare sets essential security cookies only
- Full privacy policy accessible in-game

## Legal

Silicon Hustle is a fictional game for entertainment only. Not financial advice. All characters, assets, events, and scenarios are fictional. See the in-game disclaimer for full details.

## License

MIT License. See [LICENSE](LICENSE) for details.
