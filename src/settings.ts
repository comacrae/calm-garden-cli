import { prompt } from "enquirer";
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
          message: "🎨 Color Palette",
          hint: ` (current: ${palettes[config.colorPalette].name})`,
        },
        {
          name: "difficulty",
          message: "⚡ Difficulty",
          hint: ` (current: ${config.difficulty})`,
        },
        {
          name: "priceScale",
          message: "💰 Price Scale",
          hint: ` (current: ${config.priceScale})`,
        },
        {
          name: "visualizer",
          message: "🌀 Visualizer",
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
    message: palettes[key].name,
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
    message: tier.name,
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
    message: tier.name,
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
