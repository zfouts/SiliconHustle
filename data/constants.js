// ===== ALL GAME DATA & CONFIG =====

export const ASSETS = [
    { id: 'btc',    name: 'BitCoin',        icon: '₿', basePrice: 4200,  volatility: 0.6,  category: 'crypto' },
    { id: 'eth',    name: 'EtherBlock',     icon: 'Ξ', basePrice: 1800,  volatility: 0.5,  category: 'crypto' },
    { id: 'meme',   name: 'MemeCoin',       icon: '🐕', basePrice: 50,    volatility: 1.2,  category: 'crypto' },
    { id: 'nft',    name: 'CryptoApes',     icon: '🖼', basePrice: 800,   volatility: 0.9,  category: 'nft' },
    { id: 'gpu',    name: 'GPU Rigs',       icon: '🎮', basePrice: 2200,  volatility: 0.3,  category: 'hardware' },
    { id: 'data',   name: 'DataSets',       icon: '📊', basePrice: 350,   volatility: 0.4,  category: 'data' },
    { id: 'zero',   name: 'ZeroDayExploit', icon: '💀', basePrice: 6000,  volatility: 0.8,  category: 'contraband' },
    { id: 'creds',  name: 'StolenCreds',    icon: '🔑', basePrice: 180,   volatility: 0.9,  category: 'contraband' },
    { id: 'ransom', name: 'RansomKit',      icon: '🦠', basePrice: 8500,  volatility: 1.0,  category: 'contraband' },
    { id: 'ai',     name: 'AI Models',      icon: '🤖', basePrice: 3000,  volatility: 0.55, category: 'software' },
    { id: 'domain', name: 'PremiumDomains', icon: '🌐', basePrice: 600,   volatility: 0.45, category: 'digital' },
    { id: 'vpn',    name: 'VPN Accounts',   icon: '🔒', basePrice: 120,   volatility: 0.7,  category: 'service' },
];

// Heat per unit for contraband items (default 5 if not listed)
export const CONTRABAND_HEAT = { zero: 5, creds: 3, ransom: 8 };

// Full city pool — each game selects a subset
export const ALL_CITIES = [
    { id: 'sf',        name: 'San Francisco', vibe: 'VC money flows freely',        specialty: 'Cheap: Hardware | Pricey: Crypto, Software',  priceMod: { crypto: 1.2, hardware: 0.9, software: 1.3 },  coords: [37.77, -122.42] },
    { id: 'austin',    name: 'Austin',        vibe: 'Crypto bros paradise',          specialty: 'Cheap: Crypto | Pricey: Hardware, NFTs',      priceMod: { crypto: 0.8, hardware: 1.1, nft: 1.3 },      coords: [30.27, -97.74] },
    { id: 'nyc',       name: 'New York',      vibe: 'Wall Street meets Web3',        specialty: 'Cheap: Services | Pricey: Data, Crypto',      priceMod: { data: 1.3, crypto: 1.1, service: 0.8 },      coords: [40.71, -74.01] },
    { id: 'miami',     name: 'Miami',         vibe: 'Offshore vibes',                specialty: 'Cheap: Contraband | Pricey: NFTs',            priceMod: { crypto: 0.9, contraband: 0.7, nft: 1.2 },    coords: [25.76, -80.19] },
    { id: 'seattle',   name: 'Seattle',       vibe: 'Big tech backyard',             specialty: 'Cheap: Software, Hardware | Pricey: Data',     priceMod: { software: 0.7, hardware: 0.8, data: 1.1 },    coords: [47.61, -122.33] },
    { id: 'berlin',    name: 'Berlin',        vibe: 'Underground hacker scene',      specialty: 'Cheap: Services, Contraband',                 priceMod: { contraband: 0.8, service: 0.7, crypto: 0.9 }, coords: [52.52, 13.40] },
    { id: 'tokyo',     name: 'Tokyo',         vibe: 'Cutting edge tech market',      specialty: 'Cheap: Hardware | Pricey: Digital, Software',  priceMod: { hardware: 0.7, software: 1.1, digital: 1.3 }, coords: [35.68, 139.69] },
    { id: 'lagos',     name: 'Lagos',         vibe: "Africa's booming tech hub",     specialty: 'Cheap: Data, Digital | Pricey: Services',      priceMod: { service: 1.3, data: 0.7, digital: 0.8 },     coords: [6.52, 3.38] },
    { id: 'shenzhen',  name: 'Shenzhen',      vibe: 'Hardware factory of the world', specialty: 'Cheap: Hardware | Pricey: Software, Data',     priceMod: { hardware: 0.6, software: 1.2, data: 1.2 },   coords: [22.54, 114.06] },
    { id: 'dubai',     name: 'Dubai',         vibe: 'Crypto tax haven, zero chill',  specialty: 'Cheap: Contraband | Pricey: NFTs, Digital',    priceMod: { contraband: 0.65, nft: 1.3, digital: 1.2 },  coords: [25.20, 55.27] },
    { id: 'singapore', name: 'Singapore',     vibe: 'Fintech regulatory paradise',   specialty: 'Cheap: Digital, Services | Pricey: Crypto',    priceMod: { digital: 0.75, service: 0.8, crypto: 1.15 },  coords: [1.35, 103.82] },
    { id: 'bangalore', name: 'Bangalore',     vibe: "India's Silicon Valley",        specialty: 'Cheap: Software, Services | Pricey: Hardware', priceMod: { software: 0.6, service: 0.65, hardware: 1.3 }, coords: [12.97, 77.59] },
    { id: 'telaviv',   name: 'Tel Aviv',      vibe: 'Cybersecurity capital',         specialty: 'Cheap: Contraband, Data | Pricey: Hardware',   priceMod: { contraband: 0.75, data: 0.8, hardware: 1.2 }, coords: [32.09, 34.78] },
    { id: 'london',    name: 'London',        vibe: 'Old money meets Web3',          specialty: 'Cheap: Crypto | Pricey: NFTs, Data',           priceMod: { crypto: 0.85, nft: 1.3, data: 1.2 },         coords: [51.51, -0.13] },
];

// Cities always present in every game
export const FIXED_CITY_IDS = ['sf', 'nyc', 'tokyo'];
export const GAME_CITY_COUNT = 8;

// Legacy export for backward compat — DO NOT USE in game logic, use getGameCities() from state.js
export const CITIES = ALL_CITIES;

export const EVENTS = [
    // Spikes: 1.3x–2.2x range (was 1.5x–5x — way too extreme)
    { text: '🚀 Elon just tweeted about {asset}! Price is mooning!', type: 'spike', assetFilter: ['meme', 'btc'], mult: [1.5, 2.2], class: 'event-good', icon: '🚀' },
    { text: '📰 Major exchange just listed {asset}. Prices surging!', type: 'spike', mult: [1.3, 1.8], class: 'event-good', icon: '📰' },
    { text: '🐋 A whale just bought massive amounts of {asset}!', type: 'spike', mult: [1.4, 2.0], class: 'event-good', icon: '🐋' },
    { text: '💎 New partnership announced for {asset}. Diamond hands!', type: 'spike', mult: [1.2, 1.6], class: 'event-good', icon: '💎' },
    { text: '🏗️ {asset} ICO launch! Early investors are piling in!', type: 'spike', assetFilter: ['meme', 'nft', 'eth'], mult: [1.4, 1.9], class: 'event-good', icon: '🏗️' },
    { text: '💼 VC firm just pumped $100M into {asset} ecosystem!', type: 'spike', mult: [1.3, 1.7], class: 'event-good', icon: '💼' },

    // Crashes: 0.4x–0.7x range (was 0.1x–0.5x — too devastating)
    { text: '🔨 SEC announces crackdown on {asset}! Prices plummet!', type: 'crash', mult: [0.4, 0.65], class: 'event-bad', icon: '🔨' },
    { text: '🏴‍☠️ Major {asset} hack reported! Market in freefall!', type: 'crash', mult: [0.35, 0.6], class: 'event-bad', icon: '💀' },
    { text: '📉 {asset} rug pull! The devs vanished overnight!', type: 'crash', assetFilter: ['meme', 'nft'], mult: [0.3, 0.55], class: 'event-bad', icon: '📉' },
    { text: '🏦 China bans {asset} (again). Market dumping.', type: 'crash', mult: [0.45, 0.7], class: 'event-bad', icon: '🏦' },
    { text: '⚖️ New regulation makes {asset} trading illegal in 3 countries!', type: 'crash', mult: [0.4, 0.65], class: 'event-bad', icon: '⚖️' },

    { text: '💰 You found a forgotten wallet with ${amount} in it!', type: 'cash_gain', amount: [500, 3000], class: 'event-good', icon: '💰' },
    { text: '🕵️ Feds are watching. You had to pay ${amount} in "consulting fees".', type: 'cash_loss', amount: [200, 1500], class: 'event-bad', icon: '🕵️' },
    { text: '🎰 A hacker offered you a deal. You made ${amount}!', type: 'cash_gain', amount: [800, 4000], class: 'event-good', icon: '🎰' },
    { text: '💸 Your hardware wallet got bricked. Lost ${amount} in recovery fees.', type: 'cash_loss', amount: [300, 2000], class: 'event-bad', icon: '💸' },
    { text: '🥷 A pickpocket stole ${amount} from you!', type: 'cash_loss', amount: [100, 800], class: 'event-bad', icon: '🥷' },
    { text: '🎪 You won a hackathon! Prize: ${amount}!', type: 'cash_gain', amount: [1000, 5000], class: 'event-good', icon: '🎪' },
    { text: '📱 Your side project got acquired! You made ${amount}!', type: 'cash_gain', amount: [2000, 8000], class: 'event-good', icon: '📱' },

    { text: '🔫 You got mugged in a dark alley! Lost {stolen} units of {asset}!', type: 'mugging', class: 'event-bad', icon: '🔫' },

    { text: '🔥 Market-wide FOMO! All prices are surging!', type: 'market_boom', class: 'event-warning', icon: '🔥' },
    { text: '💥 Market-wide panic sell! Everything is crashing!', type: 'market_crash', class: 'event-bad', icon: '💥' },
    { text: '🎁 An angel investor liked your hustle. Storage +25!', type: 'storage_up', class: 'event-good', icon: '🎁' },
    { text: '🔍 Insider tip: {asset} prices in {city} are insanely cheap right now.', type: 'tip', class: 'event-info', icon: '🔍' },
    { text: '📺 {asset} went viral on TikTok! Normies are buying!', type: 'spike', assetFilter: ['meme', 'nft', 'vpn'], mult: [1.5, 2.0], class: 'event-good', icon: '📺' },
    { text: '🧊 Crypto winter hits. Everything frozen.', type: 'market_crash', class: 'event-bad', icon: '🧊' },

    // Grift events
    { text: '🃏 A fake {asset} exchange popped up. Some traders lost big.', type: 'crash', mult: [0.5, 0.7], class: 'event-bad', icon: '🃏' },
    { text: '🎭 Someone cloned the {asset} project. Market confused, prices dipping.', type: 'crash', mult: [0.55, 0.75], class: 'event-bad', icon: '🎭' },
    { text: '💬 Pump-and-dump group targeted {asset}. Price spiked then crashed!', type: 'crash', mult: [0.45, 0.65], class: 'event-bad', icon: '💬' },
    { text: '🕸️ Phishing attack drained {asset} holders. Confidence shaken.', type: 'crash', mult: [0.5, 0.7], class: 'event-bad', icon: '🕸️' },
    { text: '🤥 {asset} founders caught lying about partnerships. Sell-off!', type: 'crash', mult: [0.4, 0.6], class: 'event-bad', icon: '🤥' },
    { text: '🐒 Someone airdropped fake {asset} tokens. Market rattled.', type: 'crash', assetFilter: ['meme', 'nft'], mult: [0.5, 0.7], class: 'event-bad', icon: '🐒' },
    { text: '💼 Insiders dumped {asset} before the announcement. Price tanking.', type: 'crash', mult: [0.45, 0.65], class: 'event-bad', icon: '📉' },
    { text: '🎲 A gambling site accepted {asset} — price pumped from degen demand!', type: 'spike', mult: [1.3, 1.8], class: 'event-good', icon: '🎲' },
    { text: '🧹 Money launderers cycling through {asset}. Volume up, price up.', type: 'spike', mult: [1.2, 1.5], class: 'event-warning', icon: '🧹' },

    // Funny / meme events
    { text: '🐸 You posted {asset} gains on r/wallstreetbets. "Positions or ban." Made ${amount} from the hype.', type: 'cash_gain', amount: [500, 3000], class: 'event-good', icon: '🐸' },
    { text: '📱 Your {asset} shitpost went viral on r/memecoin. You made ${amount} in tips!', type: 'cash_gain', amount: [200, 1500], class: 'event-good', icon: '📱' },
    { text: '🤡 You tried to day-trade {asset} on your phone during a meeting. Boss saw. Fined ${amount}.', type: 'cash_loss', amount: [300, 1200], class: 'event-bad', icon: '🤡' },
    { text: '🍕 Someone paid 10,000 {asset} for a pizza. The market is confused.', type: 'crash', assetFilter: ['meme', 'btc'], mult: [0.5, 0.7], class: 'event-bad', icon: '🍕' },
    { text: '👴 Your grandma asked about {asset} at Thanksgiving. Top signal confirmed.', type: 'crash', mult: [0.5, 0.7], class: 'event-bad', icon: '👴' },
    { text: '🏎️ A rapper made {asset} his personality. Price surging from clout.', type: 'spike', assetFilter: ['meme', 'nft'], mult: [1.3, 1.8], class: 'event-good', icon: '🏎️' },
    { text: '📺 CNBC says {asset} is dead. Contrarians buying. Price pumping.', type: 'spike', mult: [1.2, 1.6], class: 'event-good', icon: '📺' },
    { text: '💀 A CEO tweeted "Have fun staying poor" about {asset} holders. Price dumping.', type: 'crash', mult: [0.45, 0.65], class: 'event-bad', icon: '💀' },
    { text: '🎮 A Twitch streamer accidentally showed their {asset} wallet on stream. Hackers incoming.', type: 'crash', mult: [0.5, 0.7], class: 'event-bad', icon: '🎮' },
    { text: '🦊 Someone found a way to mine {asset} with a toaster. Difficulty plummeting.', type: 'crash', assetFilter: ['btc', 'eth'], mult: [0.5, 0.7], class: 'event-bad', icon: '🦊' },
    { text: '🌙 {asset} community declared "we\'re going to the moon." They were not.', type: 'crash', assetFilter: ['meme'], mult: [0.4, 0.6], class: 'event-bad', icon: '🌙' },
    { text: '🧑‍💻 You fell asleep and your cat walked on your keyboard. Accidentally bought ${amount} of {asset}. It pumped.', type: 'cash_gain', amount: [300, 2000], class: 'event-good', icon: '🐱' },
    { text: '📸 Your {asset} NFT got screenshot-ted. Someone said "I right-clicked your NFT." Value dropping.', type: 'crash', assetFilter: ['nft'], mult: [0.4, 0.6], class: 'event-bad', icon: '📸' },
    { text: '🤖 ChatGPT recommended {asset}. Everyone\'s buying it now.', type: 'spike', mult: [1.3, 1.7], class: 'event-good', icon: '🤖' },
    { text: '🧻 Toilet paper shortage! People panic buying {asset} for some reason.', type: 'spike', mult: [1.2, 1.5], class: 'event-warning', icon: '🧻' },
    { text: '🐕 Elon changed his Twitter bio to a {asset} emoji. Market going crazy.', type: 'spike', assetFilter: ['meme', 'btc'], mult: [1.4, 2.0], class: 'event-good', icon: '🐕' },
    { text: '☕ A barista in {city} told you about {asset}. Shoe-shine boy moment?', type: 'tip', class: 'event-info', icon: '☕' },
    { text: '🎵 A SoundCloud rapper made a song about {asset}. It slaps. Price vibing.', type: 'spike', assetFilter: ['meme', 'nft'], mult: [1.2, 1.5], class: 'event-good', icon: '🎵' },
    { text: '🏋️ You flex your {asset} portfolio at the gym. Someone reports you. -${amount} fine.', type: 'cash_loss', amount: [100, 500], class: 'event-bad', icon: '🏋️' },
    { text: '🧓 Warren Buffett said {asset} is "rat poison squared." Boomers selling, millennials buying.', type: 'spike', mult: [1.1, 1.4], class: 'event-good', icon: '🧓' },
    { text: '🎂 It\'s {asset}\'s birthday! Community celebrating. Price up from pure vibes.', type: 'spike', mult: [1.15, 1.4], class: 'event-good', icon: '🎂' },
    { text: '🤳 You accidentally sent your {asset} wallet address instead of your Venmo. Made ${amount}!', type: 'cash_gain', amount: [100, 800], class: 'event-good', icon: '🤳' },
    { text: '🚽 You were trading {asset} on the toilet and dropped your phone. Lost ${amount} in the chaos.', type: 'cash_loss', amount: [200, 1000], class: 'event-bad', icon: '🚽' },
    { text: '🎤 At a crypto conference, you yelled "HODL!" The crowd went wild. +${amount} from speaking fees.', type: 'cash_gain', amount: [500, 2500], class: 'event-good', icon: '🎤' },
];

export const DIFFICULTY = {
    easy:   { days: 40, cash: 5500, debt: 3000, interest: 0.05, label: 'EASY',   color: '#00e676' },
    normal: { days: 30, cash: 2500, debt: 5500, interest: 0.10, label: 'NORMAL', color: '#00e5ff' },
    hard:   { days: 20, cash: 1500, debt: 8000, interest: 0.15, label: 'HARD',   color: '#ff1744' },
};

export const ACHIEVEMENTS = [
    { id: 'first_trade',   name: 'Baby Steps',       icon: '👶', desc: 'Make your first trade' },
    { id: 'debt_free',     name: 'Debt Free',        icon: '🔓', desc: 'Pay off all your debt' },
    { id: 'net_10k',       name: 'Five Figures',     icon: '💵', desc: 'Reach $10,000 net worth' },
    { id: 'net_50k',       name: 'Baller',           icon: '💎', desc: 'Reach $50,000 net worth' },
    { id: 'net_100k',      name: 'Legend',           icon: '👑', desc: 'Reach $100,000 net worth' },
    { id: 'deal_hunter',   name: 'Deal Hunter',      icon: '🎯', desc: 'Buy an asset marked DEAL' },
    { id: 'globe_trotter', name: 'Globe Trotter',    icon: '🌍', desc: 'Visit every city on the map' },
    { id: 'contraband',    name: 'Dark Net',         icon: '💀', desc: 'Buy 10+ ZeroDayExploits' },
    { id: 'survivor',      name: 'Survivor',         icon: '🛡️', desc: 'Survive a fed raid' },
    { id: 'whale',         name: 'Whale',            icon: '🐋', desc: 'Hold $50,000+ in assets' },
    { id: 'speed_run',     name: 'Speed Run',        icon: '⚡', desc: 'Reach $25,000 net worth by day 10' },
    { id: 'diamond_hands', name: 'Diamond Hands',    icon: '🙌', desc: 'Hold same asset for 15+ days' },
    { id: 'mission_master',name: 'Mission Master',   icon: '📋', desc: 'Complete 5 missions' },
    { id: 'perked_up',     name: 'Perked Up',        icon: '🧪', desc: 'Buy 3 perks' },
    { id: 'black_market',  name: 'Shadow Trader',    icon: '🕶️', desc: 'Buy from the black market' },
    { id: 'ai_ascension', name: 'AI Ascension',     icon: '🤖', desc: 'Buy the AI Trading Bot ($1M)' },
    { id: 'degen',        name: 'Full Degen',       icon: '🎰', desc: 'Make 50+ trades in a single game' },
    { id: 'paper_hands',  name: 'Paper Hands',      icon: '🧻', desc: 'Sell at a loss 5 times' },
    { id: 'hodler',       name: 'HODL Gang',        icon: '💎', desc: 'End the game holding 8+ asset types' },
    { id: 'wiped_out',   name: 'Rock Bottom',      icon: '🪦', desc: 'Get wiped out (go completely broke)' },
    { id: 'hot_streak',  name: 'Hot Streak',       icon: '🔥', desc: '5 consecutive profitable trades' },
    { id: 'bull_rider',  name: 'Bull Rider',       icon: '🐂', desc: 'Earn $10,000+ profit during a bull market' },
    { id: 'explorer',    name: 'Explorer',         icon: '🧭', desc: 'Visit 5 different cities' },
    { id: 'chaos_trader',name: 'Chaos Trader',     icon: '⚡', desc: 'Profit from selling a volatile asset' },
    { id: 'bounty_hunter',name: 'Bounty Hunter',   icon: '🎯', desc: 'Collect 3 wanted bounties' },
    { id: 'passive_income',name: 'Passive Income', icon: '💤', desc: 'Earn $5,000+ in asset dividends' },
    { id: 'lucky_trader',name: 'Lucky Trader',     icon: '🍀', desc: 'Get 5 lucky trades' },
    { id: 'market_manipulator', name: 'Puppet Master', icon: '🎭', desc: 'Manipulate the market 5 times' },
    { id: 'insured',    name: 'Better Safe',      icon: '🛡️', desc: 'Block a raid with insurance' },
    { id: 'smuggler',   name: 'Smuggler',         icon: '🛤️', desc: 'Use a smuggling route 3 times' },
];

export const PERKS = [
    { id: 'bulk_buyer',    name: 'Bulk Buyer',    cost: 3000, icon: '🏷️', desc: '5% discount on all purchases' },
    { id: 'vpn_shield',    name: 'VPN Shield',    cost: 4000, icon: '🛡️', desc: 'Heat decays 2x faster' },
    { id: 'insider_info',  name: 'Insider Info',  cost: 2500, icon: '📡', desc: 'See price predictions in travel menu' },
    { id: 'extra_storage', name: 'Cloud Storage', cost: 2000, icon: '☁️', desc: '+75 storage capacity' },
    { id: 'fast_travel',   name: 'Private Jet',   cost: 5000, icon: '✈️', desc: '50% chance travel is free (no day or airfare cost)' },
    { id: 'tax_lawyer',    name: 'Tax Lawyer',    cost: 3500, icon: '⚖️', desc: 'Halve loan interest rate' },
    { id: 'bodyguard',     name: 'Bodyguard',     cost: 3000, icon: '💪', desc: 'Immune to mugging events' },
    { id: 'market_maker',  name: 'Market Maker',  cost: 4500, icon: '📈', desc: 'Supply/demand impact reduced by 50%' },
    { id: 'global_terminal', name: 'Global Terminal', cost: 25000, icon: '🖥️', desc: 'Unlock the Global market tab with price comparisons' },
    { id: 'ai_trader',    name: 'AI Trading Bot', cost: 1000000, icon: '🤖', desc: 'Full AI analysis: signals, arb %, charts, and trade recommendations' },
];

export const ENCOUNTERS = [
    {
        id: 'shady_usb', icon: '💾', title: 'Shady USB Drive',
        text: 'A stranger in a hoodie offers you a USB drive. "Trust me, this data is worth millions," they whisper.',
        choices: [
            { label: 'Buy it ($500)', risk: '60% chance: gain 5 DataSets. 40% chance: lose $500 + gain 10 heat.',
              execute(state, freeSpace) {
                if (state.cash < 500) return 'You can\'t afford it.';
                state.cash -= 500;
                if (Math.random() < 0.6) {
                    const qty = Math.min(5, freeSpace());
                    if (qty <= 0) return 'The data is legit but you have no storage! -$500.';
                    state.inventory.data += qty;
                    return `The data is legit! +${qty} DataSets!`;
                }
                else { state.heat = Math.min(100, state.heat + 10); return 'It was a honeypot! +10 heat, -$500.'; }
              }},
            { label: 'Report to authorities', risk: '-15 heat.',
              execute(state) { state.heat = Math.max(0, state.heat - 15); return 'You tipped off the feds. Heat reduced.'; }},
            { label: 'Walk away', risk: 'No effect.',
              execute() { return 'You keep walking.'; }},
        ]
    },
    {
        id: 'crypto_whale', icon: '🐋', title: 'Whale Insider',
        text: 'A crypto whale at a conference slips you a note: "I\'m about to dump everything. Want in on the short?"',
        choices: [
            { label: 'Go in ($2,000)', risk: '50% chance: gain $6,000. 50% chance: lose $2,000.',
              execute(state) {
                if (state.cash < 2000) return 'Not enough cash.';
                state.cash -= 2000;
                if (Math.random() < 0.5) { state.cash += 8000; return 'The short paid off! +$6,000 profit!'; }
                else { return 'The whale lied. You lost $2,000.'; }
              }},
            { label: 'Small bet ($500)', risk: '50% chance: gain $1,500. 50% chance: lose $500.',
              execute(state) {
                if (state.cash < 500) return 'Not enough cash.';
                state.cash -= 500;
                if (Math.random() < 0.5) { state.cash += 2000; return 'Nice! Small profit of $1,500.'; }
                else { return 'Bad bet. Lost $500.'; }
              }},
            { label: 'Pass', risk: 'No effect.',
              execute() { return 'Probably wise.'; }},
        ]
    },
    {
        id: 'fallen_laptop', icon: '💻', title: 'Found Laptop',
        text: 'You find an unlocked laptop at a coffee shop. It has several crypto wallets open...',
        choices: [
            { label: 'Drain the wallets', risk: '70% chance: +$1,000-$5,000. 30% chance: +20 heat (it was a trap).',
              execute(state) {
                if (Math.random() < 0.7) { const g = 1000 + Math.floor(Math.random() * 4000); state.cash += g; return `Score! Drained $${g.toLocaleString()} from the wallets!`; }
                else { state.heat = Math.min(100, state.heat + 20); return 'It was a honeypot sting! +20 heat!'; }
              }},
            { label: 'Return the laptop', risk: 'Karma: +$500 reward, -10 heat.',
              execute(state) { state.cash += 500; state.heat = Math.max(0, state.heat - 10); return 'The owner was grateful. $500 reward and good karma.'; }},
            { label: 'Ignore it', risk: 'No effect.',
              execute() { return 'Not your problem.'; }},
        ]
    },
    {
        id: 'underground_auction', icon: '🎭', title: 'Underground Auction',
        text: 'You get invited to an underground tech auction. Entry fee: $1,000.',
        choices: [
            { label: 'Pay and enter ($1,000)', risk: '65% chance: win rare items. 35% chance: scam, lose entry fee.',
              execute(state, freeSpace) {
                if (state.cash < 1000) return 'Can\'t afford the entry fee.';
                state.cash -= 1000;
                if (Math.random() < 0.65) {
                    const space = freeSpace();
                    const aiQty = Math.max(0, Math.min(3, space));
                    const zeroQty = Math.max(0, Math.min(1, space - aiQty));
                    state.inventory.ai += aiQty;
                    state.inventory.zero += zeroQty;
                    const total = aiQty + zeroQty;
                    if (total === 0) return 'You won items but have no storage space! -$1,000.';
                    return `Amazing haul! +${aiQty} AI Models, +${zeroQty} ZeroDayExploit!`;
                }
                else { return 'It was a scam. They took your $1,000 and vanished.'; }
              }},
            { label: 'Decline', risk: 'No effect.',
              execute() { return 'You politely decline the sketchy invitation.'; }},
        ]
    },
    {
        id: 'influencer', icon: '📸', title: 'Influencer Deal',
        text: 'A tech influencer offers to promote any asset you\'re holding. "My followers buy everything I recommend."',
        choices: [
            { label: 'Pick your biggest holding', risk: 'That asset\'s price +50-100% in current city.',
              execute(state) {
                let best = null, bestQty = 0;
                for (const a of ['btc','eth','meme','nft','gpu','data','zero','ai','domain','vpn']) {
                    if (state.inventory[a] > bestQty) { best = a; bestQty = state.inventory[a]; }
                }
                if (!best) return 'You don\'t own anything to promote!';
                const MAX_PRICE = 300_000;
                const mult = 1.5 + Math.random() * 0.5;
                state.prices[state.currentCity][best] = Math.min(MAX_PRICE, Math.round(state.prices[state.currentCity][best] * mult));
                return `The influencer pumped your ${best}! Price surged ${Math.round((mult-1)*100)}% locally!`;
              }},
            { label: 'Decline', risk: 'No effect.',
              execute() { return 'You pass on the offer.'; }},
        ]
    },
    {
        id: 'protection_racket', icon: '🔫', title: 'Protection Racket',
        text: 'A local gang approaches you. "Nice inventory. Would be a shame if something happened to it. $800 for protection."',
        choices: [
            { label: 'Pay $800', risk: 'Lose $800 but immunity from mugging for 5 days.',
              execute(state) {
                if (state.cash < 800) return 'You can\'t afford it. They let you go... this time.';
                state.cash -= 800;
                state.muggingImmunity = (state.muggingImmunity || 0) + 5;
                return 'Protection secured for 5 days.';
              }},
            { label: 'Refuse', risk: '40% chance: lose 10-30% of a random held asset.',
              execute(state) {
                if (Math.random() < 0.4) {
                    const owned = Object.keys(state.inventory).filter(k => state.inventory[k] > 0);
                    if (owned.length > 0) {
                        const t = owned[Math.floor(Math.random() * owned.length)];
                        const lost = Math.max(1, Math.ceil(state.inventory[t] * (0.1 + Math.random() * 0.2)));
                        state.inventory[t] = Math.max(0, state.inventory[t] - lost);
                        if (state.inventory[t] === 0) { state.costBasis[t] = 0; state.holdingSince[t] = 0; }
                        return `They retaliated! Lost ${lost} units of ${t}.`;
                    }
                }
                return 'They back off. For now.';
              }},
        ]
    },
    {
        id: 'ponzi_pitch', icon: '🤑', title: 'Ponzi Pitch',
        text: 'A guy in a rented Lambo pitches you his "guaranteed returns" fund. "100% returns in 3 days, bro. Trust me."',
        choices: [
            { label: 'Invest $3,000', risk: '30% chance: +$6,000. 70% chance: lose it all.',
              execute(state) {
                if (state.cash < 3000) return 'Not enough cash for this "opportunity."';
                state.cash -= 3000;
                if (Math.random() < 0.3) { state.cash += 9000; return 'Somehow it worked! +$6,000 profit. Get out while you can.'; }
                else { return 'Shocking: the Ponzi scheme collapsed. -$3,000.'; }
              }},
            { label: 'Invest $500', risk: '30% chance: +$1,000. 70% chance: lose it.',
              execute(state) {
                if (state.cash < 500) return 'Not enough cash.';
                state.cash -= 500;
                if (Math.random() < 0.3) { state.cash += 1500; return 'You got lucky! +$1,000 profit.'; }
                else { return 'Gone. All of it. -$500.'; }
              }},
            { label: 'Walk away', risk: 'No effect. Smart move.',
              execute() { return 'You walk away. Wise choice.'; }},
        ]
    },
    {
        id: 'fake_ico', icon: '🪙', title: 'Fake ICO',
        text: 'A slick website is selling tokens for "DecentraCoin" — a "revolutionary Layer 7 blockchain." The whitepaper is full of buzzwords.',
        choices: [
            { label: 'Buy in ($1,500)', risk: '25% chance: tokens moon (+$4,000). 75% chance: rug pull.',
              execute(state) {
                if (state.cash < 1500) return 'Can\'t afford these revolutionary tokens.';
                state.cash -= 1500;
                if (Math.random() < 0.25) { state.cash += 5500; return 'The tokens actually mooned?! +$4,000. Sell immediately.'; }
                else { return 'DecentraCoin exit scammed. -$1,500. The website is gone.'; }
              }},
            { label: 'Report as scam', risk: '-10 heat. Karma.',
              execute(state) { state.heat = Math.max(0, state.heat - 10); return 'Reported to the authorities. Good citizen. -10 heat.'; }},
            { label: 'Ignore', risk: 'No effect.',
              execute() { return 'Another day, another scam.'; }},
        ]
    },
    {
        id: 'pump_group', icon: '📱', title: 'Pump Group Invite',
        text: 'You get an invite to a "VIP trading signals" Telegram group. "We coordinate pumps. You get in early. $200 for access."',
        choices: [
            { label: 'Join ($200)', risk: '40% chance: insider tip (random asset +30% in your city). 60% chance: you are the exit liquidity.',
              execute(state) {
                if (state.cash < 200) return 'Can\'t afford the entry fee.';
                state.cash -= 200;
                if (Math.random() < 0.4) {
                    const assets = ['btc','eth','meme','nft','ai','domain'];
                    const pick = assets[Math.floor(Math.random() * assets.length)];
                    const MAX_PRICE = 300_000;
                    state.prices[state.currentCity][pick] = Math.min(MAX_PRICE, Math.round(state.prices[state.currentCity][pick] * 1.3));
                    return `Pump signal worked! ${pick} up 30% in this city!`;
                }
                else { state.cash -= Math.min(300, state.cash); return 'You were the exit liquidity. They dumped on you. Lost $200 + $300 in bad trades.'; }
              }},
            { label: 'Decline', risk: 'No effect.',
              execute() { return 'You know better than to trust strangers on Telegram.'; }},
        ]
    },
    {
        id: 'counterfeit_gpu', icon: '🖥️', title: 'Counterfeit Hardware',
        text: 'A guy at a shipping dock offers you "brand new GPU rigs, fell off a truck. $500 for 5 units. No questions asked."',
        choices: [
            { label: 'Buy them ($500)', risk: '50% chance: legit (+5 GPU Rigs). 50% chance: fake, worthless.',
              execute(state, freeSpace) {
                if (state.cash < 500) return 'Can\'t afford them.';
                state.cash -= 500;
                if (Math.random() < 0.5) {
                    const qty = Math.min(5, freeSpace());
                    if (qty <= 0) return 'They\'re real but you have no room! -$500.';
                    state.inventory.gpu += qty;
                    state.heat = Math.min(100, state.heat + 5);
                    return `They're legit! +${qty} GPU Rigs. +5 heat (stolen goods).`;
                }
                else { return 'They were cardboard boxes with rocks inside. -$500.'; }
              }},
            { label: 'Pass', risk: 'No effect.',
              execute() { return 'Too sketchy. You pass.'; }},
        ]
    },
    {
        id: 'crypto_tumbler', icon: '🌀', title: 'Crypto Tumbling Service',
        text: 'A dark web operator offers to "clean" your assets through a tumbling service. "Lose the heat, keep the goods. $1,000 flat fee."',
        choices: [
            { label: 'Pay $1,000 to tumble', risk: '75% chance: -30 heat. 25% chance: they steal half your cash.',
              execute(state) {
                if (state.cash < 1000) return 'Can\'t afford the service.';
                state.cash -= 1000;
                if (Math.random() < 0.75) {
                    state.heat = Math.max(0, state.heat - 30);
                    return 'Clean as a whistle. -30 heat.';
                }
                else {
                    const stolen = Math.floor(state.cash * 0.5);
                    state.cash -= stolen;
                    return `They ran off with your money! Lost an additional $${stolen.toLocaleString()}.`;
                }
              }},
            { label: 'Decline', risk: 'No effect.',
              execute() { return 'You don\'t trust anonymous operators. Smart.'; }},
        ]
    },
    {
        id: 'social_engineering', icon: '🎭', title: 'Social Engineering Attack',
        text: 'You get a call from "tech support" saying your exchange account is compromised. They need your credentials to "secure" it.',
        choices: [
            { label: 'Give them access', risk: '100% chance: lose 10-30% of cash. It\'s a scam.',
              execute(state) {
                const lost = Math.round(state.cash * (0.1 + Math.random() * 0.2));
                state.cash -= lost;
                return `It was a scam. They drained $${lost.toLocaleString()} from your account.`;
              }},
            { label: 'Hang up', risk: 'No effect.',
              execute() { return 'You hang up. Obviously a scam.'; }},
            { label: 'Counter-scam them ($0)', risk: '50% chance: +$500-2000. 50% chance: nothing.',
              execute(state) {
                if (Math.random() < 0.5) {
                    const gain = 500 + Math.floor(Math.random() * 1500);
                    state.cash += gain;
                    return `You reverse social-engineered them! Extracted $${gain.toLocaleString()}.`;
                }
                else { return 'They caught on and hung up. Oh well.'; }
              }},
        ]
    },
    {
        id: 'nft_bro', icon: '🖼️', title: 'NFT Bro',
        text: 'A guy with laser eyes in his profile pic corners you at a coffee shop. "Bro, I\'m minting a collection of 10,000 AI-generated apes. I need a marketing budget."',
        choices: [
            { label: 'Invest $2,000', risk: '35% chance: NFTs sell out (+$5,000). 65% chance: 0 mints.',
              execute(state) {
                if (state.cash < 2000) return 'You don\'t have $2,000. He calls you "ngmi."';
                state.cash -= 2000;
                if (Math.random() < 0.35) { state.cash += 7000; return 'The apes sold out?! You\'re a genius art investor. +$5,000.'; }
                else { return 'Zero mints. He pivoted to "AI-generated cats." You\'re out $2,000.'; }
              }},
            { label: '"I\'m good, bro"', risk: 'No effect. Self-respect intact.',
              execute() { return 'He mutters "few understand" and walks away.'; }},
        ]
    },
    {
        id: 'twitter_beef', icon: '🐦', title: 'Crypto Twitter Drama',
        text: 'Two crypto influencers are beefing on Twitter. One says "{asset} is going to zero." The other says "100x incoming." Your timeline is on fire.',
        choices: [
            { label: 'Side with the bull — buy the dip', risk: '50% chance: +20% local price. 50% chance: -15% local price.',
              execute(state) {
                let best = null;
                for (const a of ['btc','eth','meme','nft','gpu','data','zero','ai','domain','vpn']) {
                    if (!best || state.prices[state.currentCity][a] < state.prices[state.currentCity][best]) best = a;
                }
                if (!best) return 'No assets to pump.';
                const MAX_PRICE = 300_000;
                if (Math.random() < 0.5) {
                    state.prices[state.currentCity][best] = Math.min(MAX_PRICE, Math.round(state.prices[state.currentCity][best] * 1.2));
                    return `The bull was right! ${best} pumped 20% locally. Your timeline is celebrating.`;
                } else {
                    state.prices[state.currentCity][best] = Math.max(1, Math.round(state.prices[state.currentCity][best] * 0.85));
                    return `The bear was right. ${best} dumped 15%. "I told you so" tweets everywhere.`;
                }
              }},
            { label: 'Mute both and touch grass', risk: 'No effect. Mental health +100.',
              execute() { return 'You muted both accounts and went outside. You feel great.'; }},
            { label: 'Quote tweet "ratio" to both', risk: '+$200 from engagement farming.',
              execute(state) { state.cash += 200; return 'Your ratio went viral. Made $200 from engagement. Crypto Twitter is unhinged.'; }},
        ]
    },
    {
        id: 'metaverse_land', icon: '🏝️', title: 'Metaverse Real Estate',
        text: 'Someone is selling "prime oceanfront property in the metaverse" next to Snoop Dogg\'s virtual mansion. $3,000 for a plot.',
        choices: [
            { label: 'Buy the virtual land ($3,000)', risk: '20% chance: flip for $10,000. 80% chance: metaverse dies.',
              execute(state) {
                if (state.cash < 3000) return 'Can\'t afford virtual land. The irony.';
                state.cash -= 3000;
                if (Math.random() < 0.2) { state.cash += 13000; return 'Someone bought your virtual plot for $10,000! Virtual real estate mogul!'; }
                else { return 'The metaverse platform shut down. Your land is gone. You own pixels in a dead server.'; }
              }},
            { label: 'Decline', risk: 'Sanity preserved.',
              execute() { return 'You declined. Snoop wouldn\'t have been a good neighbor anyway.'; }},
        ]
    },
    {
        id: 'dating_app', icon: '💘', title: 'Crypto Date',
        text: 'Your dating profile says "crypto entrepreneur." Someone swiped right. They want to meet at an expensive restaurant.',
        choices: [
            { label: 'Go on the date ($500)', risk: '40% chance: they\'re an investor (+$3,000). 60% chance: expensive dinner, no ROI.',
              execute(state) {
                if (state.cash < 500) return 'Can\'t afford the restaurant. You suggest McDonald\'s. They unmatch.';
                state.cash -= 500;
                if (Math.random() < 0.4) { state.cash += 3500; return 'They were impressed by your "portfolio diversification." They invested $3,000!'; }
                else { return 'Nice dinner, but they ghosted you after you explained yield farming for 45 minutes. -$500.'; }
              }},
            { label: 'Unmatch — back to trading', risk: 'No effect.',
              execute() { return 'You unmatched. Relationships are temporary. Gains are forever. (Are they though?)'; }},
        ]
    },
    {
        id: 'garage_sale', icon: '🏷️', title: 'Tech Garage Sale',
        text: 'A guy is selling "vintage crypto mining rigs" from his garage. He also has a suspicious amount of Red Bull.',
        choices: [
            { label: 'Buy the rigs ($800)', risk: '55% chance: working GPU rigs. 45% chance: they\'re from 2013, worthless.',
              execute(state, freeSpace) {
                if (state.cash < 800) return 'Can\'t afford them. He offers a payment plan. You wisely decline.';
                state.cash -= 800;
                if (Math.random() < 0.55) {
                    const qty = Math.min(3, freeSpace());
                    if (qty <= 0) return 'The rigs are good but you have no storage! -$800.';
                    state.inventory.gpu += qty;
                    return `Score! ${qty} working GPU rigs for $800! This guy definitely didn't steal these.`;
                }
                else { return 'They\'re ancient ASIC miners from 2013. You can\'t even plug them in. -$800.'; }
              }},
            { label: 'Pass', risk: 'No effect.',
              execute() { return 'You pass. He yells "YOUR LOSS" and cracks another Red Bull.'; }},
        ]
    },
    {
        id: 'wrong_transfer', icon: '🫠', title: 'Fat Finger Transfer',
        text: 'You accidentally typed an extra zero on a transfer. ${amount} just went to a random wallet address.',
        choices: [
            { label: 'Pray they send it back', risk: '20% chance: they return it. 80% chance: gone forever.',
              execute(state) {
                const loss = Math.min(Math.round(state.cash * 0.15), 5000);
                state.cash -= loss;
                if (Math.random() < 0.2) {
                    state.cash += loss;
                    return `They actually sent it back! Faith in humanity restored. (For now.)`;
                }
                else { return `Gone forever. -$${loss.toLocaleString()}. They changed their wallet address immediately.`; }
              }},
            { label: 'Accept the L', risk: 'Lose 15% of cash (max $5,000).',
              execute(state) {
                const loss = Math.min(Math.round(state.cash * 0.15), 5000);
                state.cash -= loss;
                return `You accept the loss. -$${loss.toLocaleString()}. Expensive lesson in double-checking addresses.`;
              }},
        ]
    },
    {
        id: 'mom_calls', icon: '📞', title: 'Mom Calls',
        text: 'Your mom calls: "Honey, I heard about this BitCoin thing on the news. Should I invest my retirement savings?"',
        choices: [
            { label: '"Yes mom, all in"', risk: '50% chance: she makes money and you get a cut. 50% chance: family dinner is awkward forever.',
              execute(state) {
                if (Math.random() < 0.5) { state.cash += 2000; return 'Mom made money! She sent you $2,000 for the tip. You\'re the favorite child now.'; }
                else { return 'Mom lost her money. Thanksgiving is canceled. No financial effect on you but... guilt.'; }
              }},
            { label: '"No mom, please don\'t"', risk: 'No financial effect. +1 good child.',
              execute() { return 'Mom says "OK honey" and buys a savings bond instead. You made the right call.'; }},
            { label: '"Let me manage it for you"', risk: '+$5,000 cash (her money). You now carry the weight.',
              execute(state) { state.cash += 5000; return 'Mom wired you $5,000. "Don\'t lose it, sweetheart." No pressure.'; }},
        ]
    },
];

export const MISSION_TEMPLATES = [
    { type: 'deliver', desc: 'Deliver {qty} {asset} to {city}', rewardBase: 3000 },
    { type: 'profit',  desc: 'Make ${amount} in profit from selling', rewardBase: 2000 },
    { type: 'collect', desc: 'Own {qty} different asset types at once', rewardBase: 2500 },
    { type: 'visit',   desc: 'Visit {qty} different cities', rewardBase: 1500 },
    { type: 'trade',   desc: 'Complete {qty} trades', rewardBase: 1800 },
    { type: 'hoard',   desc: 'Accumulate {qty} units of {asset}', rewardBase: 3500 },
];

export const STARTING_STORAGE = 100;
export const STORAGE_UPGRADE_COST = 1500;
export const STORAGE_UPGRADE_AMOUNT = 50;

// Travel fare: base + per-km rate scaled by distance, with daily fuel surcharge fluctuation
export const TRAVEL_BASE_FARE = 50;       // minimum fare floor
export const TRAVEL_KM_RATE = 0.012;      // $ per km of great-circle distance
export const TRAVEL_SURGE_RANGE = 0.30;   // ±30% daily fuel/demand surcharge
