#!/usr/bin/env node
import { setupConfig } from "./cli";
import { showGarden } from "./garden";
import { showProgress } from "./progress";
import { getBreathingPatterns } from "./breathe";
import { startBreathingOverlay } from "./overlay";
import { showShop } from "./shop/service";
import { showSettings } from "./settings";
import { showEncyclopedia } from "./encyclopedia";
import { loadConfig } from "./config";
import { initStorage, resetData } from "./storage";

async function main() {
  await initStorage();
  let config = await loadConfig();

  const patterns = await getBreathingPatterns();
  const patternSet = new Set(patterns.map((p) => p.name));
  while (true) {
    const { action } = await setupConfig();

    if (patternSet.has(action)) {
      config = await loadConfig();
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

main().catch(console.error);
