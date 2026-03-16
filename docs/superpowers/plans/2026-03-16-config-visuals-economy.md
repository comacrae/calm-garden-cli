# Config, Visuals & Economy Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add settings system, color palettes, 5 breathing visualizers, exotic ASCII plants with lore, garden encyclopedia, and reworked economy with independent difficulty/price controls.

**Architecture:** Config persisted via node-persist alongside existing breathing data. Palette and visualizer are pure-function systems consumed by the overlay renderer. Lore is a static data module consumed by shop and encyclopedia. All new menu options route through the existing enquirer-based CLI menu.

**Tech Stack:** TypeScript, chalk v4, enquirer, node-persist, ANSI escape sequences

**Spec:** `docs/superpowers/specs/2026-03-16-config-visuals-economy-design.md`

---

## Chunk 1: Foundation (Config, Lore Data, Exotic Plants)

### Task 1: Config System

**Files:**
- Create: `src/config.ts`
- Modify: `src/storage.ts`

- [ ] **Step 1: Create `src/config.ts` with types, defaults, palettes, difficulty/price tables, load/save**

```typescript
import storage from "node-persist";
import chalk from "chalk";

// ─── Types ──────────────────────────────────────────────────────────

export type PaletteName = "garden" | "ocean" | "sunset" | "monochrome" | "aurora";
export type DifficultyName = "chill" | "normal" | "focused" | "monk" | "ascetic";
export type PriceScaleName = "cheap" | "normal" | "expensive" | "premium" | "luxury";
export type VisualizerName = "progress-bar" | "circle" | "wave" | "orb" | "particles";

export interface Config {
  colorPalette: PaletteName;
  difficulty: DifficultyName;
  priceScale: PriceScaleName;
  visualizer: VisualizerName;
}

export interface Palette {
  name: string;
  description: string;
  primary: chalk.Chalk;
  secondary: chalk.Chalk;
  accent: chalk.Chalk;
  dim: chalk.Chalk;
  inhale: chalk.Chalk;
  exhale: chalk.Chalk;
  hold: chalk.Chalk;
  bar: chalk.Chalk;
  garden: chalk.Chalk;
}

export interface DifficultyTier {
  name: DifficultyName;
  ticksPerCoin: number;
  description: string;
}

export interface PriceScaleTier {
  name: PriceScaleName;
  multiplier: number;
  description: string;
}

// ─── Defaults ───────────────────────────────────────────────────────

export const defaultConfig: Config = {
  colorPalette: "garden",
  difficulty: "chill",
  priceScale: "normal",
  visualizer: "progress-bar",
};

// ─── Palettes ───────────────────────────────────────────────────────

export const palettes: Record<PaletteName, Palette> = {
  garden: {
    name: "Garden",
    description: "Lush greens and earthy tones",
    primary: chalk.cyan.bold,
    secondary: chalk.green,
    accent: chalk.cyan,
    dim: chalk.dim,
    inhale: chalk.cyan.bold,
    exhale: chalk.green.bold,
    hold: chalk.yellow.bold,
    bar: chalk.cyan,
    garden: chalk.green,
  },
  ocean: {
    name: "Ocean",
    description: "Cool blues and deep teals",
    primary: chalk.blue.bold,
    secondary: chalk.blueBright,
    accent: chalk.cyanBright,
    dim: chalk.dim,
    inhale: chalk.cyanBright.bold,
    exhale: chalk.blue.bold,
    hold: chalk.blueBright.bold,
    bar: chalk.blue,
    garden: chalk.cyanBright,
  },
  sunset: {
    name: "Sunset",
    description: "Warm oranges and soft magentas",
    primary: chalk.hex("#FF6B35").bold,
    secondary: chalk.yellow,
    accent: chalk.magenta,
    dim: chalk.dim,
    inhale: chalk.hex("#FF6B35").bold,
    exhale: chalk.magenta.bold,
    hold: chalk.yellow.bold,
    bar: chalk.hex("#FF6B35"),
    garden: chalk.yellow,
  },
  monochrome: {
    name: "Monochrome",
    description: "Clean whites and soft grays",
    primary: chalk.white.bold,
    secondary: chalk.gray,
    accent: chalk.whiteBright,
    dim: chalk.dim,
    inhale: chalk.white.bold,
    exhale: chalk.gray.bold,
    hold: chalk.whiteBright.bold,
    bar: chalk.white,
    garden: chalk.whiteBright,
  },
  aurora: {
    name: "Aurora",
    description: "Vivid purples and northern greens",
    primary: chalk.magenta.bold,
    secondary: chalk.green,
    accent: chalk.cyan,
    dim: chalk.dim,
    inhale: chalk.magenta.bold,
    exhale: chalk.green.bold,
    hold: chalk.cyan.bold,
    bar: chalk.magenta,
    garden: chalk.greenBright,
  },
};

// ─── Difficulty tiers ───────────────────────────────────────────────

export const difficultyTiers: DifficultyTier[] = [
  { name: "chill", ticksPerCoin: 1, description: "A gentle pace. Coins flow freely." },
  { name: "normal", ticksPerCoin: 5, description: "Steady growth. Patience rewarded." },
  { name: "focused", ticksPerCoin: 15, description: "Deliberate progress. Each coin earned." },
  { name: "monk", ticksPerCoin: 30, description: "Deep practice. Gardens grow slowly." },
  { name: "ascetic", ticksPerCoin: 60, description: "One breath, one coin. True mastery." },
];

// ─── Price scale tiers ──────────────────────────────────────────────

export const priceScaleTiers: PriceScaleTier[] = [
  { name: "cheap", multiplier: 1, description: "Bargain garden. Everything's on sale." },
  { name: "normal", multiplier: 2, description: "Fair prices for fair flora." },
  { name: "expensive", multiplier: 3, description: "Quality costs. Choose wisely." },
  { name: "premium", multiplier: 5, description: "Luxury botanicals. Worth the wait." },
  { name: "luxury", multiplier: 8, description: "Only the most devoted gardeners." },
];

// ─── Helpers ────────────────────────────────────────────────────────

export function getPalette(config: Config): Palette {
  return palettes[config.colorPalette];
}

export function getDifficultyTier(config: Config): DifficultyTier {
  return difficultyTiers.find((t) => t.name === config.difficulty)!;
}

export function getPriceMultiplier(config: Config): number {
  return priceScaleTiers.find((t) => t.name === config.priceScale)!.multiplier;
}

// ─── Persistence ────────────────────────────────────────────────────

export async function loadConfig(): Promise<Config> {
  const stored = (await storage.getItem("config")) || {};
  return { ...defaultConfig, ...stored };
}

export async function saveConfig(config: Config): Promise<void> {
  await storage.setItem("config", config);
}
```

- [ ] **Step 2: Add `discovered` to `BreathingData` in `src/storage.ts` and add migration backfill**

In `src/storage.ts`, update the `BreathingData` interface and `defaultData`, and add backfill logic to `loadData()`:

```typescript
// Add to BreathingData interface:
  discovered: string[];

// Add to defaultData:
  discovered: [],

// Update loadData() to backfill discovered from existing plants:
export async function loadData(): Promise<BreathingData> {
  const storedData = (await storage.getItem("breathingData")) || {};
  const data = { ...defaultData, ...storedData };
  // Backfill discovered from existing plants if missing
  if (!storedData.discovered && data.plants.length > 0) {
    data.discovered = [...new Set(data.plants.map((p: Plant) => p.type))];
    await saveData(data);
  }
  return data;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd /Users/colinmacrae/projects/calm-garden-cli && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/config.ts src/storage.ts
git commit -m "feat: add config system with palettes, difficulty, and price scaling"
```

---

### Task 2: Plant Lore Data

**Files:**
- Create: `src/const/lore.ts`

- [ ] **Step 1: Create `src/const/lore.ts` with all plant latin names and lore**

```typescript
export interface PlantLore {
  latin: string;
  lore: string;
}

export const plantLore: Record<string, PlantLore> = {
  // ── Common ──
  seedling: {
    latin: "Germinula humilis",
    lore: "The humblest beginning. Ancient gardeners believed planting one at dawn would bring clarity for the day ahead.",
  },
  herb: {
    latin: "Herba tranquilla",
    lore: "A calming herb whose scent sharpens the mind. Tea brewed from its leaves is said to make worries feel smaller.",
  },
  leaves: {
    latin: "Folia susurrens",
    lore: "These whispering leaves rustle even without wind. Monks keep them to remind themselves that stillness is never truly silent.",
  },
  arugula: {
    latin: "Eruca amara",
    lore: "Bitter and bold. Peasant farmers chewed it before meditation, claiming the sharp taste anchored them to the present.",
  },
  mushroom: {
    latin: "Fungus mysticus",
    lore: "Appears overnight in well-tended gardens. Its spores carry a faint scent of petrichor and forgotten dreams.",
  },
  rock: {
    latin: "Petra immota",
    lore: "Not technically a plant. Gardeners place it as a reminder that some things need not grow to have purpose.",
  },

  // ── Uncommon ──
  daisy: {
    latin: "Bellis serenium",
    lore: "Blooms only in gardens tended with consistent breath. A symbol of patience in the ancient gardening orders.",
  },
  poppy: {
    latin: "Papaver somnialis",
    lore: "Its petals droop like heavy eyelids. Historically placed beside beds to welcome restful sleep.",
  },
  cactus: {
    latin: "Cactus stoicus",
    lore: "Thrives on neglect. Desert philosophers admired its ability to endure long silences.",
  },
  bamboo: {
    latin: "Bambusa rapida",
    lore: "Grows a full inch during a single breathing session. Or so they claim. Nobody has actually measured.",
  },
  "four-leaf-clover": {
    latin: "Trifolium fortunae",
    lore: "One leaf for hope, one for faith, one for love, one for breath. Finding one is said to double your next coin harvest.",
  },
  "maple-leaf": {
    latin: "Acer contemplans",
    lore: "Falls slowly and deliberately, as if demonstrating the exhale phase to anyone watching.",
  },
  tomato: {
    latin: "Lycopersicum anxius",
    lore: "Technically a fruit. Grows redder the more you worry about whether it's a fruit or a vegetable.",
  },
  tulip: {
    latin: "Tulipa composita",
    lore: "Opens at sunrise, closes at sunset. Dutch merchants once traded entire breathing sessions for a single bulb.",
  },

  // ── Rare ──
  sunflower: {
    latin: "Helianthus devotus",
    lore: "Always faces the gardener. Some find this comforting. Others find it unnerving.",
  },
  "pink-rose": {
    latin: "Rosa spiritus",
    lore: "Petals arranged in a perfect golden spiral. Smells faintly of the last thing that made you happy.",
  },
  hibiscus: {
    latin: "Hibiscus ignis",
    lore: "Burns a deep crimson at the center. Tropical healers prescribed staring at it for exactly four breaths.",
  },
  iris: {
    latin: "Iris oraculum",
    lore: "Named for the messenger goddess. Said to deliver insights to gardeners who tend it during the hold phase.",
  },
  marigold: {
    latin: "Calendula vigilans",
    lore: "Repels unwanted thoughts the way it repels unwanted insects. Effective in both cases.",
  },
  evergreen: {
    latin: "Pinus aeternus",
    lore: "Never loses its needles. A popular gift between monks, symbolizing commitment to daily practice.",
  },
  tree: {
    latin: "Arbor magnus",
    lore: "Takes a hundred sessions to fully appreciate. Provides shade for all the smaller plants in your garden.",
  },
  palm: {
    latin: "Palma placida",
    lore: "Sways gently even indoors. Scientists remain baffled. Gardeners remain unbothered.",
  },

  // ── Exotic ──
  "fern-glyph": {
    latin: "Filix inscripta",
    lore: "Its fronds unfurl in patterns that ancient monks used as meditation guides. Said to improve focus when planted near sitting stones.",
  },
  "star-moss": {
    latin: "Muscus stellaris",
    lore: "Bioluminescent moss harvested from cave ceilings. Glows faintly at night, guiding lost travelers back to their gardens.",
  },
  "rune-sprout": {
    latin: "Runicus germinus",
    lore: "Sprouts in the shape of old Norse runes. Druids once read fortunes in the direction of its growth.",
  },
  "hex-bloom": {
    latin: "Hexagonia flora",
    lore: "A crystalline flower with perfectly hexagonal petals. Mathematicians prize it; bees find it unsettling.",
  },
  "sigil-vine": {
    latin: "Vitis sigilum",
    lore: "A twisting vine that grows in circular patterns. Tibetan gardeners train it into prayer wheels.",
  },
  "eye-cluster": {
    latin: "Oculus multiplicis",
    lore: "A deeply unsettling organism with multiple eye-like seed pods. Watches over the garden. Nobody asked it to.",
  },
  "spiral-fern": {
    latin: "Spiralis perpetua",
    lore: "Grows in a perfect logarithmic spiral. Fibonacci himself kept one on his desk, or so the story goes.",
  },
  "thorn-script": {
    latin: "Spina literata",
    lore: "Thorny stems that form legible text in a forgotten language. Translations are always unsettlingly personal.",
  },

  // ── Epic ──
  lotus: {
    latin: "Nelumbo illuminata",
    lore: "Grows from mud into perfect beauty. The central metaphor of seven different philosophical traditions, all of which claim to have noticed it first.",
  },
  orchid: {
    latin: "Orchis enigmatica",
    lore: "Refuses to bloom on any predictable schedule. Botanists suspect it's doing this on purpose.",
  },
  "cherry-blossom": {
    latin: "Prunus ephemera",
    lore: "Blooms briefly and brilliantly. Japanese poets wrote that watching one fall teaches more about impermanence than any sutra.",
  },
  bonsai: {
    latin: "Arbor minima disciplinae",
    lore: "A full tree compressed into a pot through years of patient trimming. A masterwork of controlled growth.",
  },

  // ── Legendary ──
  "dragon-fruit": {
    latin: "Draconis fructus",
    lore: "Scales like a dragon, sweetness like enlightenment. Only fruits in gardens where the owner has practiced for over an hour total.",
  },
  "crystal-flower": {
    latin: "Crystallum floris",
    lore: "Petals of pure quartz that refract light into mantras. Geologists insist it's impossible. It doesn't care.",
  },
  "golden-bloom": {
    latin: "Aurum perpetuum",
    lore: "Radiates a warm golden light. Ancient texts claim it can only be grown by someone who has truly exhaled their worries.",
  },
  "ancient-tree": {
    latin: "Arbor antiquissima",
    lore: "Older than the garden it's planted in. Older than the soil. Possibly older than time. Excellent shade.",
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/const/lore.ts
git commit -m "feat: add latin names and lore for all plants"
```

---

### Task 3: Exotic Plants & Orchid Shop Entry

**Files:**
- Modify: `src/const/emoji.ts`
- Modify: `src/shop/items.ts`

- [ ] **Step 1: Add exotic plant characters to `src/const/emoji.ts`**

Add these entries to `plantEmojis` (before the closing `} as const`), after the Legendary section:

```typescript
  // Exotic (ASCII/Unicode glyphs)
  "fern-glyph": "❧",
  "star-moss": "⍟",
  "rune-sprout": "ᚡ",
  "hex-bloom": "⌬",
  "sigil-vine": "☸",
  "eye-cluster": "ꙮ",
  "spiral-fern": "ꝏ",
  "thorn-script": "ᛝ",
```

Also add Orchid to the Epic section (it exists in the emoji map as `orchid: "🪻"` but is a duplicate of iris — give it a unique emoji):

Change `orchid: "🪻"` to `orchid: "🌺"` (swap hibiscus and orchid emojis since orchid needs its own identity). Actually, looking at the emoji map, hibiscus already uses 🌺. Keep orchid as 🪻 — it's listed in Epic alongside iris in Rare, they just share an emoji. Leave as-is since the emoji map already has the orchid entry.

- [ ] **Step 2: Add exotic plants and orchid to `src/shop/items.ts`**

Add orchid to the Epic section and exotic plants as a new section. Insert after the Rare plants and before Epic:

```typescript
  // Exotic — 220-380 coins (ASCII/Unicode glyphs)
  { name: "Fern Glyph", type: "fern-glyph", cost: 220, rarity: "exotic" },
  { name: "Star Moss", type: "star-moss", cost: 240, rarity: "exotic" },
  { name: "Hex Bloom", type: "hex-bloom", cost: 230, rarity: "exotic" },
  { name: "Spiral Fern", type: "spiral-fern", cost: 260, rarity: "exotic" },
  { name: "Rune Sprout", type: "rune-sprout", cost: 280, rarity: "exotic" },
  { name: "Sigil Vine", type: "sigil-vine", cost: 300, rarity: "exotic" },
  { name: "Thorn Script", type: "thorn-script", cost: 320, rarity: "exotic" },
  { name: "Eye Cluster", type: "eye-cluster", cost: 380, rarity: "exotic" },
```

Add orchid to the Epic section:

```typescript
  { name: "Orchid", type: "orchid", cost: 450, rarity: "epic" },
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/const/emoji.ts src/shop/items.ts
git commit -m "feat: add exotic ASCII plants and orchid shop entry"
```

---

## Chunk 2: Visualizers

### Task 4: Breathing Visualizers

**Files:**
- Create: `src/visualizers.ts`

- [ ] **Step 1: Create `src/visualizers.ts` with all 5 visualizer functions**

```typescript
import { Palette } from "./config";

export type VisualizerFn = (
  progress: number,
  phase: string,
  palette: Palette,
  width: number
) => string[];

// ─── Progress Bar ───────────────────────────────────────────────────

function progressBar(
  progress: number,
  _phase: string,
  palette: Palette,
  width: number
): string[] {
  const barWidth = Math.min(30, width - 10);
  const filled = Math.round(progress * barWidth);
  const bar =
    palette.bar("█".repeat(filled)) +
    palette.dim("░".repeat(barWidth - filled));
  return [bar];
}

// ─── Circle ─────────────────────────────────────────────────────────

function circle(
  progress: number,
  _phase: string,
  palette: Palette,
  _width: number
): string[] {
  // Radius scales from 1 to 4 based on progress
  const maxRadius = 4;
  const radius = Math.max(1, Math.round(progress * maxRadius));
  const size = radius * 2 + 1;
  const lines: string[] = [];

  for (let y = 0; y < size; y++) {
    let row = "";
    for (let x = 0; x < size * 2; x++) {
      const dx = (x / 2) - radius;
      const dy = y - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (Math.abs(dist - radius) < 0.6) {
        row += palette.accent("·");
      } else if (dist < 0.8) {
        row += palette.bar("●");
      } else if (dist < radius * 0.5 && radius > 2) {
        row += palette.dim("◦");
      } else {
        row += " ";
      }
    }
    lines.push(row);
  }
  return lines;
}

// ─── Wave ───────────────────────────────────────────────────────────

function wave(
  progress: number,
  _phase: string,
  palette: Palette,
  width: number
): string[] {
  const waveWidth = Math.min(40, width - 10);
  const rows = 7;
  const amplitude = Math.max(0.5, progress * 3);
  const midRow = Math.floor(rows / 2);
  const chars = ["∿", "≈", "∼", "~"];
  const grid: string[][] = [];

  for (let r = 0; r < rows; r++) {
    grid.push(new Array(waveWidth).fill(" "));
  }

  for (let x = 0; x < waveWidth; x++) {
    const t = (x / waveWidth) * Math.PI * 2;
    const y = Math.sin(t + progress * Math.PI) * amplitude;
    const row = Math.round(midRow - y);
    if (row >= 0 && row < rows) {
      const charIdx = Math.floor(Math.abs(y) / amplitude * (chars.length - 1));
      const ch = chars[Math.min(charIdx, chars.length - 1)];
      grid[row][x] = palette.accent(ch);
    }
  }

  return grid.map((row) => row.join(""));
}

// ─── Orb ────────────────────────────────────────────────────────────

function orb(
  progress: number,
  _phase: string,
  palette: Palette,
  _width: number
): string[] {
  const maxRadius = 4;
  const radius = Math.max(1, Math.round(progress * maxRadius));
  const size = maxRadius * 2 + 1;
  const center = maxRadius;
  const ringChars = ["✦", "*", "•", "°", "·"];
  const lines: string[] = [];

  for (let y = 0; y < size; y++) {
    let row = "";
    for (let x = 0; x < size * 2; x++) {
      const dx = (x / 2) - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.8) {
        row += palette.bar("✦");
      } else if (dist <= radius) {
        const ringIndex = Math.min(
          Math.floor((dist / radius) * (ringChars.length - 1)),
          ringChars.length - 1
        );
        const ch = ringChars[ringIndex];
        if (dist <= radius * 0.4) {
          row += palette.bar(ch);
        } else if (dist <= radius * 0.7) {
          row += palette.accent(ch);
        } else {
          row += palette.dim(ch);
        }
      } else {
        row += " ";
      }
    }
    lines.push(row);
  }
  return lines;
}

// ─── Particles ──────────────────────────────────────────────────────

function particles(
  progress: number,
  _phase: string,
  palette: Palette,
  width: number
): string[] {
  const particleWidth = Math.min(30, width - 10);
  const rows = 7;
  const chars = ["·", "°", "•", "✧", "✦"];
  const grid: string[][] = [];

  for (let r = 0; r < rows; r++) {
    grid.push(new Array(particleWidth).fill(" "));
  }

  // Seed-based particle positions (deterministic per-position, animated by progress)
  const seeds = [3, 7, 11, 15, 19, 23, 27, 5, 13, 21, 9, 17, 25, 1, 29];
  for (let i = 0; i < seeds.length; i++) {
    const x = seeds[i] % particleWidth;
    // Particles rise with progress (inhale) or fall (lower progress)
    const baseRow = rows - 1 - (i % rows);
    const offset = Math.round(progress * (rows - 1));
    const row = baseRow - offset + Math.floor(i / rows);
    const wrappedRow = ((row % rows) + rows) % rows;

    if (wrappedRow >= 0 && wrappedRow < rows && x < particleWidth) {
      const ch = chars[i % chars.length];
      const colorFn = i % 3 === 0 ? palette.bar : i % 3 === 1 ? palette.accent : palette.dim;
      grid[wrappedRow][x] = colorFn(ch);
    }
  }

  return grid.map((row) => row.join(""));
}

// ─── Registry ───────────────────────────────────────────────────────

export const visualizers: Record<string, VisualizerFn> = {
  "progress-bar": progressBar,
  circle,
  wave,
  orb,
  particles,
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/visualizers.ts
git commit -m "feat: add 5 breathing visualizers (bar, circle, wave, orb, particles)"
```

---

## Chunk 3: Settings Menu & Encyclopedia

### Task 5: Settings Menu

**Files:**
- Create: `src/settings.ts`

- [ ] **Step 1: Create `src/settings.ts`**

```typescript
import { prompt } from "enquirer";
import chalk from "chalk";
import {
  Config,
  palettes,
  PaletteName,
  difficultyTiers,
  DifficultyName,
  priceScaleTiers,
  PriceScaleName,
  VisualizerName,
  saveConfig,
  getPalette,
} from "./config";
import { clearConsole } from "./utils";

export async function showSettings(config: Config): Promise<void> {
  while (true) {
    clearConsole();
    const palette = getPalette(config);
    console.log(palette.primary("\n⚙️  Settings\n"));

    const response = await prompt<{ setting: string }>({
      type: "select",
      name: "setting",
      message: "Choose a setting to change:",
      choices: [
        {
          name: "palette",
          message: `🎨 Color Palette`,
          hint: ` (current: ${palettes[config.colorPalette].name})`,
        },
        {
          name: "difficulty",
          message: `⚡ Difficulty`,
          hint: ` (current: ${config.difficulty})`,
        },
        {
          name: "priceScale",
          message: `💰 Price Scale`,
          hint: ` (current: ${config.priceScale})`,
        },
        {
          name: "visualizer",
          message: `🌀 Visualizer`,
          hint: ` (current: ${config.visualizer})`,
        },
        { name: "back", message: "↩ Back" },
      ],
    });

    if (response.setting === "back") return;

    switch (response.setting) {
      case "palette":
        await changePalette(config);
        break;
      case "difficulty":
        await changeDifficulty(config);
        break;
      case "priceScale":
        await changePriceScale(config);
        break;
      case "visualizer":
        await changeVisualizer(config);
        break;
    }

    await saveConfig(config);
  }
}

async function changePalette(config: Config): Promise<void> {
  const choices = (Object.keys(palettes) as PaletteName[]).map((key) => ({
    name: key,
    message: `${palettes[key].name}`,
    hint: ` — ${palettes[key].description}${key === config.colorPalette ? " (current)" : ""}`,
  }));

  const response = await prompt<{ choice: PaletteName }>({
    type: "select",
    name: "choice",
    message: "Select color palette:",
    choices,
  });

  config.colorPalette = response.choice;
}

async function changeDifficulty(config: Config): Promise<void> {
  const choices = difficultyTiers.map((tier) => ({
    name: tier.name,
    message: `${tier.name}`,
    hint: ` — ${tier.ticksPerCoin} tick${tier.ticksPerCoin > 1 ? "s" : ""}/coin — ${tier.description}${tier.name === config.difficulty ? " (current)" : ""}`,
  }));

  const response = await prompt<{ choice: DifficultyName }>({
    type: "select",
    name: "choice",
    message: "Select difficulty:",
    choices,
  });

  config.difficulty = response.choice;
}

async function changePriceScale(config: Config): Promise<void> {
  const choices = priceScaleTiers.map((tier) => ({
    name: tier.name,
    message: `${tier.name}`,
    hint: ` — ${tier.multiplier}x prices — ${tier.description}${tier.name === config.priceScale ? " (current)" : ""}`,
  }));

  const response = await prompt<{ choice: PriceScaleName }>({
    type: "select",
    name: "choice",
    message: "Select price scale:",
    choices,
  });

  config.priceScale = response.choice;
}

async function changeVisualizer(config: Config): Promise<void> {
  const visualizerDescriptions: Record<VisualizerName, string> = {
    "progress-bar": "Classic progress bar",
    circle: "Expanding/contracting circle",
    wave: "Flowing sine wave",
    orb: "Pulsing radial orb",
    particles: "Floating particles",
  };

  const choices = (Object.keys(visualizerDescriptions) as VisualizerName[]).map((key) => ({
    name: key,
    message: key,
    hint: ` — ${visualizerDescriptions[key]}${key === config.visualizer ? " (current)" : ""}`,
  }));

  const response = await prompt<{ choice: VisualizerName }>({
    type: "select",
    name: "choice",
    message: "Select breathing visualizer:",
    choices,
  });

  config.visualizer = response.choice;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/settings.ts
git commit -m "feat: add settings menu for palette, difficulty, price, visualizer"
```

---

### Task 6: Encyclopedia

**Files:**
- Create: `src/encyclopedia.ts`

- [ ] **Step 1: Create `src/encyclopedia.ts`**

```typescript
import chalk from "chalk";
import { prompt } from "enquirer";
import { loadData, BreathingData } from "./storage";
import { shopItems } from "./shop/items";
import { plantLore } from "./const/lore";
import { emojis, EmojiKey } from "./const/emoji";
import { Config, getPalette } from "./config";
import { clearConsole } from "./utils";

const rarityOrder = ["common", "uncommon", "rare", "exotic", "epic", "legendary"];

export async function showEncyclopedia(config: Config): Promise<void> {
  const data = await loadData();
  const palette = getPalette(config);

  // Only show plantable items (exclude utility items)
  const plants = shopItems.filter((item) => item.rarity);
  const discovered = new Set(data.discovered || []);
  const totalDiscovered = plants.filter((p) => discovered.has(p.type)).length;

  clearConsole();
  console.log(palette.primary(`\n🌿  ENCYCLOPEDIA  🌿     ${totalDiscovered}/${plants.length} discovered\n`));

  const grouped: Record<string, typeof plants> = {};
  for (const plant of plants) {
    const rarity = plant.rarity || "common";
    if (!grouped[rarity]) grouped[rarity] = [];
    grouped[rarity].push(plant);
  }

  const choices: Array<{ name: string; message: string; hint?: string }> = [];

  for (const rarity of rarityOrder) {
    if (!grouped[rarity]) continue;
    choices.push({
      name: `header-${rarity}`,
      message: palette.secondary(`── ${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ──`),
      hint: "",
    });

    for (const plant of grouped[rarity]) {
      const isDiscovered = discovered.has(plant.type);
      const emoji = emojis[plant.type as EmojiKey] || "?";
      const lore = plantLore[plant.type];
      const ownedCount = data.plants.filter((p: { type: string }) => p.type === plant.type).length;

      if (isDiscovered) {
        choices.push({
          name: plant.type,
          message: `${emoji} ${plant.name} — ${lore?.latin || "???"}`,
          hint: ownedCount > 0 ? ` (owned: ${ownedCount})` : " ✓",
        });
      } else {
        choices.push({
          name: plant.type,
          message: palette.dim(`🔒 ??? — ???`),
          hint: "",
        });
      }
    }
  }

  choices.push({ name: "back", message: "↩ Back" });

  const response = await prompt<{ plant: string }>({
    type: "select",
    name: "plant",
    message: "Select a plant to view details:",
    choices: choices.filter((c) => !c.name.startsWith("header-")),
  });

  if (response.plant === "back") return;

  if (discovered.has(response.plant)) {
    await showPlantDetail(response.plant, data, config);
  }
}

async function showPlantDetail(
  plantType: string,
  data: BreathingData,
  config: Config
): Promise<void> {
  const palette = getPalette(config);
  const lore = plantLore[plantType];
  const item = shopItems.find((i) => i.type === plantType);
  const emoji = emojis[plantType as EmojiKey] || "?";
  const ownedCount = data.plants.filter((p: { type: string }) => p.type === plantType).length;

  clearConsole();
  console.log("");
  console.log(palette.primary(`  ${emoji}  ${item?.name || plantType}`));
  console.log(palette.accent(`  ${lore?.latin || "Unknown species"}`));
  console.log("");
  console.log(palette.dim(`  Rarity: ${item?.rarity || "unknown"}`));
  console.log(palette.dim(`  Base cost: ${item?.cost || "?"} coins`));
  console.log(palette.dim(`  Owned: ${ownedCount}`));
  console.log("");
  console.log(`  "${lore?.lore || "No information available."}"`);
  console.log("");

  await prompt<{ action: string }>({
    type: "select",
    name: "action",
    message: "",
    choices: [{ name: "back", message: "↩ Back" }],
  });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/encyclopedia.ts
git commit -m "feat: add garden encyclopedia with discovery tracking"
```

---

## Chunk 4: Integration (Overlay, Shop, Menu, Cleanup)

### Task 7: Update Breathing Overlay

**Files:**
- Modify: `src/overlay.ts`

This is the largest modification. The overlay needs to:
1. Accept and use config for palette colors
2. Use the selected visualizer instead of hardcoded progress bar
3. Implement difficulty-based coin earning (tick counter)

- [ ] **Step 1: Update overlay imports and state**

At the top of `src/overlay.ts`, add config imports and a tick counter:

```typescript
// Add these imports:
import { Config, getPalette, getDifficultyTier, Palette } from "./config";
import { visualizers } from "./visualizers";

// Add to state section:
let config: Config;
let palette: Palette;
let tickCounter = 0;
```

- [ ] **Step 2: Update the `render()` function to use palette and visualizer**

Replace the hardcoded colors and progress bar in `render()`:

```typescript
function render(): void {
  const w = getTermWidth();

  clearScreen();
  moveTo(1, 1);

  const lines: string[] = [];

  lines.push("");
  lines.push(center(palette.primary("🌿  calm garden  🌿"), w));
  lines.push(center(palette.dim(patternName), w));
  lines.push("");

  if (paused) {
    lines.push(center(palette.hold("⏸  PAUSED"), w));
  } else {
    const phaseColor =
      currentPhaseName === "Inhale"
        ? palette.inhale
        : currentPhaseName === "Exhale"
        ? palette.exhale
        : palette.hold;
    lines.push(center(phaseColor(`${currentPhaseName}`), w));
  }

  lines.push("");

  // Visualizer
  const progress =
    currentPhaseDuration > 0 ? currentPhaseSecond / currentPhaseDuration : 0;
  const vizLines = visualizers[config.visualizer](
    progress,
    currentPhaseName,
    palette,
    w
  );
  for (const line of vizLines) {
    lines.push(center(line, w));
  }
  lines.push(
    center(palette.dim(`${currentPhaseSecond}/${currentPhaseDuration}s`), w)
  );

  lines.push("");

  // Garden
  const gardenSize = data.gardenSize;
  const emptyPlot = "🌱";
  for (let y = 0; y < gardenSize; y++) {
    let row = "";
    for (let x = 0; x < gardenSize; x++) {
      const plant = data.plants.find(
        (p: { x: number; y: number; type: string }) => p.x === x && p.y === y
      );
      row += plant
        ? emojis[plant.type as EmojiKey] || emptyPlot
        : emptyPlot;
    }
    lines.push(center(row, w));
  }

  lines.push("");

  lines.push(
    center(
      palette.dim(`☀️ ${data.coins}`) +
        palette.dim("  ⏱ ") +
        palette.dim(formatTime(sessionTime)),
      w
    )
  );

  lines.push("");

  lines.push(
    center(
      palette.dim("[space] pause/resume  [m] menu  [q] back"),
      w
    )
  );

  process.stdout.write(lines.join("\n"));
}
```

- [ ] **Step 3: Update coin earning in `breatheLoop()` to use difficulty tick counter**

Replace `data.coins++` with tick-based earning:

```typescript
// In breatheLoop(), replace:
//   data.coins++;
// With:
        tickCounter++;
        const tier = getDifficultyTier(config);
        if (tickCounter >= tier.ticksPerCoin) {
          data.coins++;
          tickCounter = 0;
        }
```

- [ ] **Step 4: Update `startBreathingOverlay()` to accept and use config**

Change the function signature and initialization:

```typescript
export async function startBreathingOverlay(
  patternType: string,
  userConfig: Config
): Promise<void> {
  // Reset state for each session
  paused = false;
  running = true;
  sessionTime = 0;
  menuOpen = false;
  menuIndex = 0;
  tickCounter = 0;

  config = userConfig;
  palette = getPalette(config);

  data = await loadData();
  // ... rest unchanged
```

- [ ] **Step 5: Update menu rendering to use palette**

In `renderMenu()`, replace `chalk.cyan.bold` and `chalk.dim` with palette equivalents:

```typescript
function renderMenu(): void {
  const w = getTermWidth();
  clearScreen();
  moveTo(1, 1);

  const lines: string[] = [];
  lines.push("");
  lines.push(center(palette.primary("🌿  select pattern  🌿"), w));
  lines.push("");

  for (let i = 0; i < breathingPatterns.length; i++) {
    const p = breathingPatterns[i];
    const selected = i === menuIndex;
    const prefix = selected ? palette.accent("▸ ") : "  ";
    const text = selected
      ? palette.accent(`${p.emoji} ${p.display}`)
      : palette.dim(`${p.emoji} ${p.display}`);
    lines.push(center(prefix + text, w));
    lines.push(center(palette.dim(`  ${p.description}`), w));
    lines.push("");
  }

  lines.push(
    center(palette.dim("[↑↓] select  [enter] start  [m] back"), w)
  );

  process.stdout.write(lines.join("\n"));
}
```

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/overlay.ts
git commit -m "feat: integrate config into breathing overlay (palette, visualizer, difficulty)"
```

---

### Task 8: Update Shop with Price Scaling and Lore

**Files:**
- Modify: `src/shop/service.ts`
- Modify: `src/shop/items.ts`
- Modify: `src/shop/actions.ts`

- [ ] **Step 1: Update `src/shop/items.ts` — add `getEffectivePrice()` and update `getPlantValue()`**

Add import and helper function:

```typescript
import { Config, getPriceMultiplier } from "../config";

export function getEffectivePrice(item: ShopItem, config: Config): number {
  return Math.floor(item.cost * getPriceMultiplier(config));
}

// Update getPlantValue to accept config:
export function getPlantValue(plant: Plant, config: Config): number {
  const baseValue =
    shopItems.find((item) => item.name === plant.name)?.cost || 10;
  const growthMultiplier = 1 + (plant.growth - 1) * 0.1;
  return Math.round(baseValue * growthMultiplier * getPriceMultiplier(config));
}

// Update calculateExpansionPrice to accept config:
export function calculateExpansionPrice(currentSize: number, config: Config): number {
  return Math.floor(100 * Math.pow(1.5, currentSize - 3) * getPriceMultiplier(config));
}
```

- [ ] **Step 2: Update `src/shop/service.ts` — pass config, show lore, track discovery**

Update `showShop` to accept config, show lore inline, and update discovered list:

```typescript
import { Config, getPalette } from "../config";
import { plantLore } from "../const/lore";
import { getEffectivePrice } from "./items";

export async function showShop(config: Config): Promise<void> {
  let data = await loadData();
  initializeShopItems();
  const palette = getPalette(config);

  while (true) {
    clearConsole();
    console.log(palette.primary("🏪 Welcome to the Garden Shop!"));
    console.log(palette.dim(`💰 You have ${data.coins} coins.`));
    console.log(palette.dim(`🌳 Your garden size: ${data.gardenSize}x${data.gardenSize}\n`));

    const choices = createShopMenu(data, config);

    const response = await prompt<{ choice: string }>({
      type: "select",
      name: "choice",
      message: "Choose an item to purchase:",
      choices,
    });

    if (response.choice.includes("Exit")) break;

    const item = shopItems.find((x) => response.choice.includes(x.name));

    if (item) {
      await purchaseItem(data, item, config);
    } else {
      console.log("Invalid selection. Please try again.");
      await sleep(2000);
    }
  }
}
```

Update `createShopMenu` to show effective prices and lore hints:

```typescript
function createShopMenu(
  data: BreathingData,
  config: Config
): Array<{ name: string; value: number; hint: string }> {
  const choices = shopItems.map((item, index) => {
    const price = item.name === "Garden Expansion"
      ? calculateExpansionPrice(data.gardenSize, config)
      : getEffectivePrice(item, config);
    const lore = plantLore[item.type];
    const loreHint = lore ? ` — ${lore.latin}` : "";

    return {
      name:
        item.name === "Garden Expansion"
          ? `${item.emoji} ${item.name} (${data.gardenSize + 1}x${data.gardenSize + 1})`
          : `${item.emoji} ${item.name}${loreHint}`,
      value: index,
      hint:
        item.name === "Sell Plant"
          ? " (sell a plant)"
          : ` (${price} coins)`,
    };
  });
  choices.push({ name: "🚪 Exit Shop", value: -1, hint: "Leave the shop" });
  return choices;
}
```

Update `purchaseItem` to pass config and track discovery:

```typescript
async function purchaseItem(
  data: BreathingData,
  item: ShopItem,
  config: Config
): Promise<void> {
  const handlers: Record<string, () => Promise<void>> = {
    "Sell Plant": async () => await handleSellPlant(data, item, config),
    "Garden Expansion": async () => await handleGardenExpansion(data, config),
    "Shuffle Garden": async () => await handleShuffleGarden(data, item, config),
  };

  const handler =
    handlers[item.name] || (async () => {
      await handleRegularPurchase(data, item, config);
      // Track discovery
      if (item.rarity && !data.discovered.includes(item.type)) {
        data.discovered.push(item.type);
      }
    });

  await handler();
  await saveData(data);
  await sleep(2000);
}
```

- [ ] **Step 3: Update `src/shop/actions.ts` — use config for price calculations**

Update all handler functions to accept config and use effective prices:

```typescript
import { Config } from "../config";
import { getEffectivePrice } from "./items";

// Update handleSellPlant signature:
export async function handleSellPlant(
  data: BreathingData,
  item: ShopItem,
  config: Config
): Promise<void> {
  // ... same logic but use getPlantValue(plant, config)
}

// Update handleGardenExpansion:
export async function handleGardenExpansion(
  data: BreathingData,
  config: Config
): Promise<void> {
  const cost = calculateExpansionPrice(data.gardenSize, config);
  // ... rest same
}

// Update handleShuffleGarden:
export async function handleShuffleGarden(
  data: BreathingData,
  item: ShopItem,
  config: Config
): Promise<void> {
  const cost = getEffectivePrice(item, config);
  if (data.plants && data.plants.length > 1) {
    shuffleGarden(data);
    data.coins -= cost;
    // ... rest same
  }
}

// Update handleRegularPurchase:
export async function handleRegularPurchase(
  data: BreathingData,
  item: ShopItem,
  config: Config
): Promise<void> {
  const effectivePrice = getEffectivePrice(item, config);
  const response: { quantity: number } = await prompt({
    type: "numeral",
    name: "quantity",
    message: `How many ${item.name}s do you want to buy?`,
    initial: 1,
    min: 1,
    max: Math.floor(data.coins / effectivePrice),
  });

  const quantity = response.quantity;
  const totalCost = effectivePrice * quantity;
  // ... rest same with totalCost
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/shop/service.ts src/shop/items.ts src/shop/actions.ts
git commit -m "feat: integrate price scaling, lore display, and discovery tracking into shop"
```

---

### Task 9: Update Main Menu & Clean Up Legacy Code

**Files:**
- Modify: `src/cli.ts`
- Modify: `src/index.ts`
- Modify: `src/breathe.ts`

- [ ] **Step 1: Add Settings and Encyclopedia to `src/cli.ts` menu**

Add two new choices to the `setupConfig()` main menu, before "Reset Data":

```typescript
      { name: "encyclopedia", message: "📖 Encyclopedia" },
      { name: "settings", message: "⚙️  Settings" },
```

- [ ] **Step 2: Update `src/index.ts` to load config, route new actions, pass config to overlay and shop**

```typescript
import { showSettings } from "./settings";
import { showEncyclopedia } from "./encyclopedia";
import { loadConfig, Config } from "./config";

async function main() {
  await initStorage();
  let config = await loadConfig();

  const patterns = await getBreathingPatterns();
  const patternSet = new Set(patterns.map((p) => p.name));
  while (true) {
    const { action } = await setupConfig();

    if (patternSet.has(action)) {
      config = await loadConfig(); // reload in case settings changed
      await startBreathingOverlay(action, config);
      continue;
    }

    switch (action) {
      case "garden":
        await showGarden();
        break;
      case "progress":
        await showProgress();
        break;
      case "shop":
        config = await loadConfig();
        await showShop(config);
        break;
      case "encyclopedia":
        config = await loadConfig();
        await showEncyclopedia(config);
        break;
      case "settings":
        config = await loadConfig();
        await showSettings(config);
        break;
      case "reset":
        await resetData();
        break;
      case "exit":
        console.log("Thank you for using CLI Calm Garden!");
        return;
      default:
        console.log("Invalid option. Please try again.");
    }
  }
}
```

- [ ] **Step 3: Remove legacy functions from `src/breathe.ts`**

Remove `performBreathing()` and `startBreathing()` functions (lines 11-69). Keep `getCustomBreathingPatterns()` and `getBreathingPatterns()` which are still used. Also remove unused imports (`sleep`, `clearConsole`, `prompt`, `chalk`) that were only used by the removed functions.

After cleanup, `breathe.ts` should contain only:

```typescript
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { breathingPatterns } from "./const/patterns";
import { BreathingPattern } from "./types/BreathingPattern";
import path from "path";

export async function getCustomBreathingPatterns(): Promise<BreathingPattern[]> {
  // ... unchanged
}

export async function getBreathingPatterns(): Promise<BreathingPattern[]> {
  // ... unchanged
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Build the project**

Run: `npx tsc`
Expected: Compiles successfully to `dist/`

- [ ] **Step 6: Commit**

```bash
git add src/cli.ts src/index.ts src/breathe.ts
git commit -m "feat: wire up settings, encyclopedia, and clean up legacy breathing code"
```

---

### Task 10: Manual Smoke Test

- [ ] **Step 1: Run the app and test the settings menu**

Run: `npx ts-node src/index.ts`

Verify:
- Main menu shows Settings and Encyclopedia options
- Settings menu lets you change all 4 options
- Settings persist between sessions (exit and re-run)

- [ ] **Step 2: Test breathing overlay with different visualizers and palettes**

- Change visualizer to each option and start a breathing session
- Change palette and verify colors update
- Verify coins earn at the rate set by difficulty

- [ ] **Step 3: Test shop with price scaling**

- Change price scale and verify shop prices update
- Buy an exotic plant
- Verify it appears in the garden

- [ ] **Step 4: Test encyclopedia**

- View encyclopedia after buying some plants
- Verify discovered plants show full details
- Verify undiscovered plants show as locked

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during smoke testing"
```
