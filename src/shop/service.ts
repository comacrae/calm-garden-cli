import { prompt } from "enquirer";
import { BreathingData, saveData, loadData } from "../storage";
import { clearConsole, sleep } from "../utils";
import {
  ShopItem,
  initializeShopItems,
  shopItems,
  calculateExpansionPrice,
  getEffectivePrice,
} from "./items";
import {
  handleSellPlant,
  handleGardenExpansion,
  handleShuffleGarden,
  handleRegularPurchase,
} from "./actions";
import { Config, getPalette } from "../config";
import { plantLore } from "../const/lore";
import { emojis, EmojiKey } from "../const/emoji";

export async function showShop(config: Config): Promise<void> {
  let data = await loadData();
  initializeShopItems();

  while (true) {
    clearConsole();
    console.log("🏪 Welcome to the Garden Shop!");
    console.log(`💰 You have ${data.coins} coins.`);
    console.log(`🌳 Your garden size: ${data.gardenSize}x${data.gardenSize}\n`);

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
      const shouldBuy = await showItemDetail(item, data, config);
      if (shouldBuy) {
        await purchaseItem(data, item, config);
      }
    } else {
      console.log("Invalid selection. Please try again.");
      await sleep(2000);
    }
  }
}

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
      if (item.rarity && !data.discovered.includes(item.type)) {
        data.discovered.push(item.type);
      }
    });

  await handler();
  await saveData(data);
  await sleep(2000);
}

async function showItemDetail(
  item: ShopItem,
  data: BreathingData,
  config: Config
): Promise<boolean> {
  const palette = getPalette(config);
  const lore = plantLore[item.type];
  const emoji = emojis[item.type as EmojiKey] || item.emoji || "?";
  const price = item.name === "Garden Expansion"
    ? calculateExpansionPrice(data.gardenSize, config)
    : getEffectivePrice(item, config);

  clearConsole();
  console.log("");
  console.log(palette.primary(`  ${emoji}  ${item.name}`));
  if (lore) {
    console.log(palette.accent(`  ${lore.latin}`));
  }
  console.log("");
  if (item.rarity) {
    console.log(palette.dim(`  Rarity: ${item.rarity}`));
  }
  console.log(palette.dim(`  Cost: ${price} coins`));
  console.log(palette.dim(`  You have: ${data.coins} coins`));
  console.log("");
  if (lore) {
    console.log(`  "${lore.lore}"`);
    console.log("");
  }

  const response = await prompt<{ action: string }>({
    type: "select",
    name: "action",
    message: "",
    choices: [
      { name: "buy", message: "💰 Buy" },
      { name: "back", message: "↩ Back" },
    ],
  });

  return response.action === "buy";
}

function createShopMenu(
  data: BreathingData,
  config: Config
): Array<{ name: string; value: number; hint: string }> {
  const choices = shopItems.map((item, index) => {
    const price = item.name === "Garden Expansion"
      ? calculateExpansionPrice(data.gardenSize, config)
      : item.name === "Sell Plant"
      ? 0
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
