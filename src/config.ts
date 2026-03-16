import storage from "node-persist";
import chalk from "chalk";

// ─── Types ──────────────────────────────────────────────────────────

export type PaletteName = "garden" | "ocean" | "sunset" | "monochrome" | "aurora";
export type DifficultyName = "chill" | "normal" | "focused" | "monk" | "ascetic";
export type PriceScaleName = "cheap" | "normal" | "expensive" | "premium" | "luxury";
export type VisualizerName = "progress-bar" | "wave" | "orb";

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

const validVisualizers: Set<string> = new Set(["progress-bar", "wave", "orb"]);

export async function loadConfig(): Promise<Config> {
  const stored = (await storage.getItem("config")) || {};
  const config = { ...defaultConfig, ...stored };
  if (!validVisualizers.has(config.visualizer)) {
    config.visualizer = defaultConfig.visualizer;
  }
  return config;
}

export async function saveConfig(config: Config): Promise<void> {
  await storage.setItem("config", config);
}
