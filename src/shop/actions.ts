import { prompt } from "enquirer";
import { BreathingData, saveData } from "../storage";
import {
  ShopItem,
  calculateExpansionPrice,
  getPlantValue,
  getEffectivePrice,
  shopItems,
  rarityOrder,
  TRADE_COST,
  getNextTier,
  isColorable,
  plantColors,
  PlantColor,
} from "./items";
import { Plant } from "../types/Plant";
import { emojis, EmojiKey } from "../const/emoji";
import { Config } from "../config";

export async function handleSellPlant(
  data: BreathingData,
  item: ShopItem,
  config: Config
): Promise<void> {
  if (!data.plants || data.plants.length === 0) {
    console.log("Your garden is empty. There are no plants to sell.");
    return;
  }

  const plantChoices = data.plants.map((plant, index) => {
    //@ts-expect-error

    const emoji = emojis[plant.type]!;
    return {
      name: `${emoji} ${plant.name} at (${plant.x}, ${
        plant.y
      }) - Value: ${getPlantValue(plant, config)} coins`,
      value: index,
    };
  });

  const response: { plant: string } = await prompt({
    type: "select",
    name: "plant",
    message: "Select a plant to sell:",
    choices: plantChoices,
  });

  const index = plantChoices.find((x) => x.name == response.plant)?.value!;
  //console.log("plant index", index);
  const plant = data.plants[index];
  data.plants = data.plants.filter((p) => !(p.x == plant.x && p.y == plant.y));
  //console.log("plant", plant);
  const sellValue = getPlantValue(plant, config);
  data.coins += sellValue;
  console.log(`You've sold a ${plant.name} for ${sellValue} coins!`);

  saveData(data);
}

export async function handleGardenExpansion(
  data: BreathingData,
  config: Config
): Promise<void> {
  const cost = calculateExpansionPrice(data.gardenSize, config);
  if (data.coins >= cost) {
    data.coins -= cost;
    data.gardenSize++;
    console.log(
      `You've expanded your garden! New size: ${data.gardenSize}x${data.gardenSize}`
    );
  } else {
    console.log(
      "Not enough coins for expansion. Keep practicing to earn more!"
    );
  }
}

export async function handleShuffleGarden(
  data: BreathingData,
  item: ShopItem,
  config: Config
): Promise<void> {
  const cost = getEffectivePrice(item, config);
  if (data.plants && data.plants.length > 1) {
    shuffleGarden(data);
    data.coins -= cost;
    console.log("Your garden has been shuffled!");
  } else {
    console.log("You need at least two plants to shuffle the garden.");
  }
}

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

  // Ask for color if this is a colorable plant (exotic glyphs)
  let chosenColor: PlantColor | undefined;
  if (isColorable(item)) {
    const colorResponse = await prompt<{ color: string }>({
      type: "select",
      name: "color",
      message: `Choose a color for your ${item.name}:`,
      choices: plantColors.map((c) => ({ name: c, message: c })),
    });
    chosenColor = colorResponse.color as PlantColor;
  }

  if (data.coins >= totalCost) {
    if (!data.plants) data.plants = [];
    const availableSpaces =
      data.gardenSize * data.gardenSize - data.plants.length;

    if (availableSpaces >= quantity) {
      for (let i = 0; i < quantity; i++) {
        const newPlant = placePlantRandomly(data, item, chosenColor);
        data.plants.push(newPlant);
        console.log(
          `Placed ${item.name} at position (${newPlant.x}, ${newPlant.y})`
        );
      }
      data.coins -= totalCost;
      console.log(
        `You've purchased ${quantity} ${item.name}(s) for your garden for a total of ${totalCost} coins!`
      );
    } else {
      console.log(
        `Your garden only has space for ${availableSpaces} more plants. Consider expanding your garden.`
      );
    }
  } else {
    console.log("Not enough coins. Keep practicing to earn more!");
  }

  saveData(data);
}
function placePlantRandomly(data: BreathingData, item: ShopItem, color?: PlantColor): Plant {
  let x: number, y: number;
  do {
    x = Math.floor(Math.random() * data.gardenSize);
    y = Math.floor(Math.random() * data.gardenSize);
  } while (data.plants.some((p) => p.x === x && p.y === y));

  const plant: Plant = { name: item.name, type: item.type, x, y, growth: 1 };
  if (color) plant.color = color;
  return plant;
}

export async function handleTrade(
  data: BreathingData,
  config: Config
): Promise<void> {
  if (!data.plants || data.plants.length < TRADE_COST) {
    console.log(`You need at least ${TRADE_COST} plants to trade.`);
    return;
  }

  // Find which rarity tiers the player has enough plants to trade
  const plantsByRarity: Record<string, Plant[]> = {};
  for (const plant of data.plants) {
    const item = shopItems.find((i) => i.type === plant.type);
    if (item?.rarity) {
      if (!plantsByRarity[item.rarity]) plantsByRarity[item.rarity] = [];
      plantsByRarity[item.rarity].push(plant);
    }
  }

  // Only show tiers with enough plants AND a next tier to upgrade to
  const tradeable = rarityOrder.filter((tier) => {
    return (plantsByRarity[tier]?.length ?? 0) >= TRADE_COST && getNextTier(tier);
  });

  if (tradeable.length === 0) {
    console.log(`You need ${TRADE_COST} plants of the same rarity tier to trade up.`);
    console.log("Keep collecting to unlock trades!");
    return;
  }

  const tierResponse = await prompt<{ tier: string }>({
    type: "select",
    name: "tier",
    message: `Trade ${TRADE_COST} plants for 1 rarer plant. Pick a tier:`,
    choices: tradeable.map((tier) => ({
      name: tier,
      message: `${tier} (${plantsByRarity[tier].length} owned) → 1 ${getNextTier(tier)}`,
    })),
  });

  const tier = tierResponse.tier;
  const nextTier = getNextTier(tier)!;
  const candidates = plantsByRarity[tier];

  // Let the user pick which plants to trade
  const plantChoices = candidates.map((plant, i) => {
    const emoji = emojis[plant.type as EmojiKey] || "?";
    return {
      name: `${emoji} ${plant.name} at (${plant.x}, ${plant.y})`,
      value: i,
    };
  });

  const selected: { plants: string[] } = await prompt({
    type: "multiselect",
    name: "plants",
    message: `Select ${TRADE_COST} ${tier} plants to trade:`,
    choices: plantChoices,
    //@ts-expect-error
    min: TRADE_COST,
    max: TRADE_COST,
  });

  if (selected.plants.length !== TRADE_COST) {
    console.log(`You must select exactly ${TRADE_COST} plants.`);
    return;
  }

  // Remove selected plants from garden
  const plantsToRemove = selected.plants.map((name) => {
    const idx = plantChoices.findIndex((c) => c.name === name);
    return candidates[idx];
  });

  for (const plant of plantsToRemove) {
    const idx = data.plants.findIndex((p) => p.x === plant.x && p.y === plant.y);
    if (idx >= 0) data.plants.splice(idx, 1);
  }

  // Pick a random item from the next tier
  const nextTierItems = shopItems.filter((i) => i.rarity === nextTier);
  const reward = nextTierItems[Math.floor(Math.random() * nextTierItems.length)];

  // Check garden space
  const availableSpaces = data.gardenSize * data.gardenSize - data.plants.length;
  if (availableSpaces < 1) {
    console.log("No garden space for the new plant! The trade was cancelled.");
    return;
  }

  // Ask for color if the reward is colorable
  let chosenColor: PlantColor | undefined;
  if (isColorable(reward)) {
    const colorResponse = await prompt<{ color: string }>({
      type: "select",
      name: "color",
      message: `Choose a color for your new ${reward.name}:`,
      choices: plantColors.map((c) => ({ name: c, message: c })),
    });
    chosenColor = colorResponse.color as PlantColor;
  }

  const newPlant = placePlantRandomly(data, reward, chosenColor);
  data.plants.push(newPlant);

  if (reward.rarity && !data.discovered.includes(reward.type)) {
    data.discovered.push(reward.type);
  }

  const emoji = emojis[reward.type as EmojiKey] || "?";
  console.log(`\n✨ Traded ${TRADE_COST} ${tier} plants for: ${emoji} ${reward.name}!`);

  await saveData(data);
}

function shuffleGarden(data: BreathingData): void {
  if (!data.plants || data.plants.length <= 1) return;

  const availablePositions: { x: number; y: number }[] = [];
  for (let x = 0; x < data.gardenSize; x++) {
    for (let y = 0; y < data.gardenSize; y++) {
      availablePositions.push({ x, y });
    }
  }

  // Fisher-Yates shuffle algorithm
  for (let i = availablePositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availablePositions[i], availablePositions[j]] = [
      availablePositions[j],
      availablePositions[i],
    ];
  }

  for (let i = 0; i < data.plants.length; i++) {
    const newPosition = availablePositions[i];
    data.plants[i].x = newPosition.x;
    data.plants[i].y = newPosition.y;
  }
}
