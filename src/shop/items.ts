import { emojis, EmojiKey } from "../const/emoji";
import { Plant } from "../types/Plant";

export interface ShopItem {
  name: string;
  type: string;
  cost: number;
  emoji?: string;
  rarity?: string;
}

export const shopItems: ShopItem[] = [
  // Common — 20-30 coins (a few seconds of practice)
  { name: "Seedling", type: "seedling", cost: 10, rarity: "common" },
  { name: "Herb", type: "herb", cost: 20, rarity: "common" },
  { name: "Leaves", type: "leaves", cost: 20, rarity: "common" },
  { name: "Arugula", type: "arugula", cost: 25, rarity: "common" },
  { name: "Mushroom", type: "mushroom", cost: 25, rarity: "common" },
  { name: "Rock", type: "rock", cost: 15, rarity: "common" },

  // Uncommon — 50-80 coins (about a minute)
  { name: "Daisy", type: "daisy", cost: 50, rarity: "uncommon" },
  { name: "Poppy", type: "poppy", cost: 50, rarity: "uncommon" },
  { name: "Cactus", type: "cactus", cost: 60, rarity: "uncommon" },
  { name: "Bamboo", type: "bamboo", cost: 60, rarity: "uncommon" },
  { name: "Four Leaf Clover", type: "four-leaf-clover", cost: 70, rarity: "uncommon" },
  { name: "Maple Leaf", type: "maple-leaf", cost: 55, rarity: "uncommon" },
  { name: "Tomato", type: "tomato", cost: 65, rarity: "uncommon" },
  { name: "Tulip", type: "tulip", cost: 75, rarity: "uncommon" },

  // Rare — 120-200 coins (a few minutes)
  { name: "Sunflower", type: "sunflower", cost: 120, rarity: "rare" },
  { name: "Pink Rose", type: "pink-rose", cost: 150, rarity: "rare" },
  { name: "Hibiscus", type: "hibiscus", cost: 140, rarity: "rare" },
  { name: "Iris", type: "iris", cost: 130, rarity: "rare" },
  { name: "Marigold", type: "marigold", cost: 160, rarity: "rare" },
  { name: "Evergreen", type: "evergreen", cost: 180, rarity: "rare" },
  { name: "Tree", type: "tree", cost: 200, rarity: "rare" },
  { name: "Palm", type: "palm", cost: 175, rarity: "rare" },

  // Exotic — 220-380 coins (ASCII/Unicode glyphs)
  { name: "Fern Glyph", type: "fern-glyph", cost: 220, rarity: "exotic" },
  { name: "Star Moss", type: "star-moss", cost: 240, rarity: "exotic" },
  { name: "Hex Bloom", type: "hex-bloom", cost: 230, rarity: "exotic" },
  { name: "Spiral Fern", type: "spiral-fern", cost: 260, rarity: "exotic" },
  { name: "Rune Sprout", type: "rune-sprout", cost: 280, rarity: "exotic" },
  { name: "Sigil Vine", type: "sigil-vine", cost: 300, rarity: "exotic" },
  { name: "Thorn Script", type: "thorn-script", cost: 320, rarity: "exotic" },
  { name: "Eye Cluster", type: "eye-cluster", cost: 380, rarity: "exotic" },

  // Epic — 400-600 coins (5-10 minutes)
  { name: "Lotus", type: "lotus", cost: 400, rarity: "epic" },
  { name: "Cherry Blossom", type: "cherry-blossom", cost: 500, rarity: "epic" },
  { name: "Bonsai", type: "bonsai", cost: 600, rarity: "epic" },
  { name: "Orchid", type: "orchid", cost: 450, rarity: "epic" },

  // Legendary — 1000+ coins (15+ minutes)
  { name: "Dragon Fruit", type: "dragon-fruit", cost: 1000, rarity: "legendary" },
  { name: "Crystal Flower", type: "crystal-flower", cost: 1500, rarity: "legendary" },
  { name: "Golden Bloom", type: "golden-bloom", cost: 2000, rarity: "legendary" },
  { name: "Ancient Tree", type: "ancient-tree", cost: 3000, rarity: "legendary" },

  // Utility
  { name: "Garden Expansion", type: "expansion", cost: 0 },
  { name: "Shuffle Garden", type: "shuffle", cost: 50 },
  { name: "Sell Plant", type: "sell", cost: -20 },
];

export function initializeShopItems(): void {
  for (const item of shopItems) {
    item.emoji = emojis[item.type as any as EmojiKey] || "?";
  }
}

export function calculateExpansionPrice(currentSize: number): number {
  return Math.floor(100 * Math.pow(1.5, currentSize - 3));
}

export function getPlantValue(plant: Plant): number {
  const baseValue =
    shopItems.find((item) => item.name === plant.name)?.cost || 10;
  const growthMultiplier = 1 + (plant.growth - 1) * 0.1;
  return Math.round(baseValue * growthMultiplier);
}
