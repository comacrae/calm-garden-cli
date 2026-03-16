# Config, Visuals & Economy Overhaul

## Overview

Add a settings system, multiple breathing visualizers, color palettes, exotic ASCII plants with lore, a garden encyclopedia, and a reworked economy with independent difficulty and price scaling controls.

## 1. Config System

### Storage

Config persisted as a `config` key in the existing `~/.breathe-app/` node-persist store, alongside `breathingData`.

### Shape

```typescript
interface Config {
  colorPalette: "garden" | "ocean" | "sunset" | "monochrome" | "aurora";
  difficulty: "chill" | "normal" | "focused" | "monk" | "ascetic";
  priceScale: "cheap" | "normal" | "expensive" | "premium" | "luxury";
  visualizer: "progress-bar" | "circle" | "wave" | "orb" | "particles";
}
```

### Defaults

```typescript
const defaultConfig: Config = {
  colorPalette: "garden",
  difficulty: "chill",
  priceScale: "normal",
  visualizer: "progress-bar",
};
```

Defaults use the easiest earn rate (1 tick = 1 coin) and doubled base prices (2x) compared to the current economy, since current prices are too easy. This is an intentional rebalance, not a preservation of current behavior. Existing users will notice higher prices.

### Access Pattern

`loadConfig()` and `saveConfig()` functions in `src/config.ts`, called at startup and from the settings menu. Config passed into overlay, shop, and rendering systems as needed.

## 2. Settings Menu

New "Settings" option in the main CLI menu. Submenu with four choices:

1. **Color Palette** — cycle through 5 palettes with live preview name/description
2. **Difficulty** — select earn rate tier
3. **Price Scale** — select shop price multiplier tier
4. **Visualizer** — select breathing visualization style

Each setting uses an enquirer select prompt showing current value and available options.

## 3. Color Palettes

Each palette defines a set of chalk color functions used throughout the app.

```typescript
interface Palette {
  name: string;
  description: string;
  primary: ChalkFunction;    // headings, titles
  secondary: ChalkFunction;  // subheadings, labels
  accent: ChalkFunction;     // highlights, selections
  dim: ChalkFunction;        // muted text, borders
  inhale: ChalkFunction;     // inhale phase color
  exhale: ChalkFunction;     // exhale phase color
  hold: ChalkFunction;       // hold phase color
  bar: ChalkFunction;        // progress bar fill
  garden: ChalkFunction;     // garden plant tint (for ASCII plants)
}
```

### Palette Definitions

- **Garden** (default): cyan primary, green exhale, yellow hold — matches current hardcoded colors exactly
- **Ocean**: blue primary, teal exhale, steel blue hold — cool and calming
- **Sunset**: warm orange primary, magenta exhale, amber hold — warm tones
- **Monochrome**: white primary, gray exhale, dim hold — minimalist
- **Aurora**: purple primary, green exhale, cyan hold — vibrant northern lights

Applied globally to: breathing overlay, garden display, menu chrome, shop, progress stats, encyclopedia.

## 4. Difficulty (Earn Rate)

Controls how many ticks (seconds) of breathing earn one coin. Independent from price scaling.

| Difficulty | Ticks per coin | Description |
|---|---|---|
| Chill | 1 | "A gentle pace. Coins flow freely." |
| Normal | 5 | "Steady growth. Patience rewarded." |
| Focused | 15 | "Deliberate progress. Each coin earned." |
| Monk | 30 | "Deep practice. Gardens grow slowly." |
| Ascetic | 60 | "One breath, one coin. True mastery." |

Implementation: a tick counter in the breathing loop. Increment each second, award a coin when counter reaches threshold, reset counter.

## 5. Price Scale

Controls a multiplier applied to all shop item base prices. Independent from difficulty.

| Scale | Multiplier | Description |
|---|---|---|
| Cheap | 1x | "Bargain garden. Everything's on sale." |
| Normal | 2x | "Fair prices for fair flora." |
| Expensive | 3x | "Quality costs. Choose wisely." |
| Premium | 5x | "Luxury botanicals. Worth the wait." |
| Luxury | 8x | "Only the most devoted gardeners." |

Applied at purchase time: `effectivePrice = basePrice * multiplier`. Display the effective price in the shop. Garden expansion prices also scale.

Sell values also scale proportionally: `getPlantValue()` uses the same multiplier so that the buy/sell ratio stays consistent across price scales.

Note: "Normal" at 2x means base prices are doubled from the current values, addressing the current economy being too easy.

## 6. Breathing Visualizers

All five render in the same screen area where the progress bar currently sits. Each is a pure function:

```typescript
type Visualizer = (
  progress: number,      // 0-1, how far into current phase
  phase: string,         // "Inhale", "Exhale", "Hold"
  palette: Palette,      // active color palette
  width: number          // terminal width
) => string[];           // lines to render
```

### 6.1 Progress Bar (default)

Current `████░░░░` behavior, unchanged except it uses palette colors instead of hardcoded cyan.

### 6.2 Circle

Concentric ASCII circle that expands on inhale, contracts on exhale. At progress 0 it's a small dot, at progress 1 during inhale it's fully expanded. Uses characters: `·` `◦` `○` `◎` `●` for varying density. Approximately 7-9 rows tall at full expansion.

Example at ~60% inhale:
```
      · · ·
    ·       ·
  ·     ●     ·
    ·       ·
      · · ·
```

### 6.3 Wave

Horizontal sine wave drawn across the terminal width. Amplitude rises on inhale, falls on exhale. Uses characters: `~` `∼` `≈` `∿`. Multiple rows (5-7) for depth, with the wave vertically centered.

Example at high amplitude:
```
                  ∿
            ∼  ∿     ∿
      ~  ∼              ∼  ~
   ~                          ~
∿                                ∿
```

### 6.4 Orb

Radiating rings from a center point that pulse outward on inhale, contract on exhale. Uses: `✦` at center, then `*` `•` `°` `·` for outer rings. Colored with palette gradient.

Example mid-pulse:
```
      · · ·
    ° • * • °
  · • ✦ ✦ ✦ • ·
    ° • * • °
      · · ·
```

### 6.5 Particles

Characters that float upward on inhale, drift downward on exhale. A field of particles at varying heights, with positions interpolated by progress. Uses: `·` `°` `•` `✧` `✦`. Sparse distribution across ~7 rows.

Example during inhale (particles rising):
```
    ✧       ✦
  ·    •        ·
      ✧    °
  °       •    ✧
    ·        °
        ·
  ·            ·
```

## 7. Exotic ASCII Plants

New rarity tier "exotic" between rare and epic in the shop. These use Unicode/ASCII glyphs instead of emoji, and are colored by the active palette's `garden` color.

All exotic shop items use `rarity: "exotic"`. Note: some glyphs (ꙮ, ꝏ, ᚡ, ᛝ) have limited font coverage — if they render as boxes in the user's terminal, the garden display should fall back to a simpler character like `✦`.

| Name | Latin Name | Char | Base Cost | Lore |
|---|---|---|---|---|
| Fern Glyph | *Filix inscripta* | ❧ | 220 | "Its fronds unfurl in patterns that ancient monks used as meditation guides. Said to improve focus when planted near sitting stones." |
| Star Moss | *Muscus stellaris* | ⍟ | 240 | "Bioluminescent moss harvested from cave ceilings. Glows faintly at night, guiding lost travelers back to their gardens." |
| Rune Sprout | *Runicus germinus* | ᚡ | 280 | "Sprouts in the shape of old Norse runes. Druids once read fortunes in the direction of its growth." |
| Hex Bloom | *Hexagonia flora* | ⌬ | 230 | "A crystalline flower with perfectly hexagonal petals. Mathematicians prize it; bees find it unsettling." |
| Sigil Vine | *Vitis sigilum* | ☸ | 300 | "A twisting vine that grows in circular patterns. Tibetan gardeners train it into prayer wheels." |
| Eye Cluster | *Oculus multiplicis* | ꙮ | 380 | "A deeply unsettling organism with multiple eye-like seed pods. Watches over the garden. Nobody asked it to." |
| Spiral Fern | *Spiralis perpetua* | ꝏ | 260 | "Grows in a perfect logarithmic spiral. Fibonacci himself kept one on his desk, or so the story goes." |
| Thorn Script | *Spina literata* | ᛝ | 320 | "Thorny stems that form legible text in a forgotten language. Translations are always unsettlingly personal." |

Added to `const/emoji.ts` (as character mappings) and `shop/items.ts` (as purchasable items).

## 8. Plant Lore & Latin Names

Every existing plant (not just exotics) gets a fake latin binomial name and a 1-2 sentence lore blurb. These are stored in a new `src/const/lore.ts` file as a record keyed by plant type.

```typescript
interface PlantLore {
  latin: string;
  lore: string;
}

const plantLore: Record<string, PlantLore> = {
  seedling: {
    latin: "Germinula humilis",
    lore: "The humblest beginning. Ancient gardeners believed planting one at dawn would bring clarity for the day ahead."
  },
  herb: {
    latin: "Herba tranquilla",
    lore: "A calming herb whose scent sharpens the mind. Tea brewed from its leaves is said to make worries feel smaller."
  },
  // ... all plants
};
```

### Where Lore Appears

**Shop (inline):** When highlighting an item in the shop list, the latin name and lore appear below it, similar to how breathing pattern descriptions appear in the pattern menu.

```
  ▸ 🌼 Daisy — Bellis serenium              100☀️
    "Blooms only in gardens tended with
     consistent breath. A symbol of patience
     in the ancient gardening orders."

    🥀 Poppy — Papaver somnialis             100☀️
    🌵 Cactus — Cactus stoicus                120☀️
```

**Encyclopedia (dedicated view):** Shows latin name, lore, emoji/char, rarity, cost, and owned count.

## 9. Garden Encyclopedia

New "Encyclopedia" option in the main CLI menu. A scrollable list of all plants in the game, organized by rarity tier.

### Discovered vs Undiscovered

- **Discovered** (purchased at least once): shows full entry — emoji, name, latin name, lore, rarity, base cost, number owned
- **Undiscovered** (never purchased): shows locked entry — `???` for name and lore, rarity tier visible, silhouette hint

```
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  🌿  ENCYCLOPEDIA  🌿     12/35 discovered

  ── Common ──
  🌱 Seedling — Germinula humilis        ✓
  🌿 Herb — Herba tranquilla             ✓
  🍃 Leaves — Folia susurrens            ✓
  🥬 Arugula — ???                        🔒
  🍄 Mushroom — ???                       🔒
  🪨 Rock — ???                           🔒

  ── Uncommon ──
  🌼 Daisy — Bellis serenium             ✓
  ...
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
```

Selecting a discovered plant shows its full lore entry. Navigation with arrow keys, `q` to exit.

### Discovery Tracking

A `discovered: string[]` array added to `BreathingData` containing plant types the user has purchased at least once. Updated on purchase in the shop.

## 10. Updated Plant Table (All Plants with Latin Names & Lore)

### Common (base 10-25 coins)

| Plant | Latin | Base Cost | Lore |
|---|---|---|---|
| Seedling | *Germinula humilis* | 10 | "The humblest beginning. Ancient gardeners believed planting one at dawn would bring clarity for the day ahead." |
| Herb | *Herba tranquilla* | 20 | "A calming herb whose scent sharpens the mind. Tea brewed from its leaves is said to make worries feel smaller." |
| Leaves | *Folia susurrens* | 20 | "These whispering leaves rustle even without wind. Monks keep them to remind themselves that stillness is never truly silent." |
| Arugula | *Eruca amara* | 25 | "Bitter and bold. Peasant farmers chewed it before meditation, claiming the sharp taste anchored them to the present." |
| Mushroom | *Fungus mysticus* | 25 | "Appears overnight in well-tended gardens. Its spores carry a faint scent of petrichor and forgotten dreams." |
| Rock | *Petra immota* | 15 | "Not technically a plant. Gardeners place it as a reminder that some things need not grow to have purpose." |

### Uncommon (base 50-75 coins)

| Plant | Latin | Base Cost | Lore |
|---|---|---|---|
| Daisy | *Bellis serenium* | 50 | "Blooms only in gardens tended with consistent breath. A symbol of patience in the ancient gardening orders." |
| Poppy | *Papaver somnialis* | 50 | "Its petals droop like heavy eyelids. Historically placed beside beds to welcome restful sleep." |
| Cactus | *Cactus stoicus* | 60 | "Thrives on neglect. Desert philosophers admired its ability to endure long silences." |
| Bamboo | *Bambusa rapida* | 60 | "Grows a full inch during a single breathing session. Or so they claim. Nobody has actually measured." |
| Four Leaf Clover | *Trifolium fortunae* | 70 | "One leaf for hope, one for faith, one for love, one for breath. Finding one is said to double your next coin harvest." |
| Maple Leaf | *Acer contemplans* | 55 | "Falls slowly and deliberately, as if demonstrating the exhale phase to anyone watching." |
| Tomato | *Lycopersicum anxius* | 65 | "Technically a fruit. Grows redder the more you worry about whether it's a fruit or a vegetable." |
| Tulip | *Tulipa composita* | 75 | "Opens at sunrise, closes at sunset. Dutch merchants once traded entire breathing sessions for a single bulb." |

### Rare (base 120-200 coins)

| Plant | Latin | Base Cost | Lore |
|---|---|---|---|
| Sunflower | *Helianthus devotus* | 120 | "Always faces the gardener. Some find this comforting. Others find it unnerving." |
| Pink Rose | *Rosa spiritus* | 150 | "Petals arranged in a perfect golden spiral. Smells faintly of the last thing that made you happy." |
| Hibiscus | *Hibiscus ignis* | 140 | "Burns a deep crimson at the center. Tropical healers prescribed staring at it for exactly four breaths." |
| Iris | *Iris oraculum* | 130 | "Named for the messenger goddess. Said to deliver insights to gardeners who tend it during the hold phase." |
| Marigold | *Calendula vigilans* | 160 | "Repels unwanted thoughts the way it repels unwanted insects. Effective in both cases." |
| Evergreen | *Pinus aeternus* | 180 | "Never loses its needles. A popular gift between monks, symbolizing commitment to daily practice." |
| Tree | *Arbor magnus* | 200 | "Takes a hundred sessions to fully appreciate. Provides shade for all the smaller plants in your garden." |
| Palm | *Palma placida* | 175 | "Sways gently even indoors. Scientists remain baffled. Gardeners remain unbothered." |

### Exotic (base 100-200 coins)

(See Section 7 above for the full exotic plant table.)

### Epic (base 400-600 coins)

| Plant | Latin | Base Cost | Lore |
|---|---|---|---|
| Lotus | *Nelumbo illuminata* | 400 | "Grows from mud into perfect beauty. The central metaphor of seven different philosophical traditions, all of which claim to have noticed it first." |
| Orchid | *Orchis enigmatica* | 450 | "Refuses to bloom on any predictable schedule. Botanists suspect it's doing this on purpose." |
| Cherry Blossom | *Prunus ephemera* | 500 | "Blooms briefly and brilliantly. Japanese poets wrote that watching one fall teaches more about impermanence than any sutra." |
| Bonsai | *Arbor minima disciplinae* | 600 | "A full tree compressed into a pot through years of patient trimming. A masterwork of controlled growth." |

### Legendary (base 1000-3000 coins)

| Plant | Latin | Base Cost | Lore |
|---|---|---|---|
| Dragon Fruit | *Draconis fructus* | 1000 | "Scales like a dragon, sweetness like enlightenment. Only fruits in gardens where the owner has practiced for over an hour total." |
| Crystal Flower | *Crystallum floris* | 1500 | "Petals of pure quartz that refract light into mantras. Geologists insist it's impossible. It doesn't care." |
| Golden Bloom | *Aurum perpetuum* | 2000 | "Radiates a warm golden light. Ancient texts claim it can only be grown by someone who has truly exhaled their worries." |
| Ancient Tree | *Arbor antiquissima* | 3000 | "Older than the garden it's planted in. Older than the soil. Possibly older than time. Excellent shade." |

## 11. File Changes Summary

### New Files

- `src/config.ts` — Config type, defaults, load/save, palette definitions
- `src/visualizers.ts` — All five visualizer functions (progress-bar, circle, wave, orb, particles)
- `src/settings.ts` — Settings menu UI using enquirer
- `src/const/lore.ts` — Latin names and lore for all plants
- `src/encyclopedia.ts` — Encyclopedia menu and display

### Modified Files

- `src/index.ts` — Add "Settings" and "Encyclopedia" to main menu routing, load config at startup
- `src/overlay.ts` — Use config for palette, visualizer, difficulty tick counter
- `src/breathe.ts` — Remove `performBreathing()` and `startBreathing()` (legacy code path with its own coin-earning loop that would bypass difficulty settings). Keep `getBreathingPatterns()` and `getCustomBreathingPatterns()` which are still used by `index.ts`
- `src/storage.ts` — Add `discovered: string[]` to `BreathingData`, config persistence
- `src/const/emoji.ts` — Add exotic ASCII plant character mappings
- `src/shop/items.ts` — Add exotic plants with `rarity: "exotic"`, apply price scale multiplier
- `src/shop/service.ts` — Show lore inline when highlighting items, update discovered list on purchase
- `src/cli.ts` — Add settings and encyclopedia menu choices

## 12. Migration

Existing users keep their data. Missing config fields get defaults. On first load after update, if `discovered` is missing, backfill it from the user's existing `plants` array (unique plant types) so returning users see their collection in the encyclopedia. After backfill, save the updated data.
