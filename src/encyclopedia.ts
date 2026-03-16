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
          name: `locked-${plant.type}`,
          message: palette.dim(`🔒 ??? — ???`),
          hint: ` [${rarity}]`,
        });
      }
    }
  }

  choices.push({ name: "back", message: "↩ Back" });

  const response = await prompt<{ plant: string }>({
    type: "select",
    name: "plant",
    message: "Select a plant to view details:",
    choices,
  });

  if (response.plant === "back" || response.plant.startsWith("locked-")) return;

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
