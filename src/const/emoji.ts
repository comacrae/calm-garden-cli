export const plantEmojis = {
  // Common (cheap)
  seedling: "🌱",
  herb: "🌿",
  leaves: "🍃",
  arugula: "🥬",
  mushroom: "🍄",
  rock: "🪨",

  // Uncommon
  daisy: "🌼",
  poppy: "🥀",
  cactus: "🌵",
  bamboo: "🎋",
  "four-leaf-clover": "🍀",
  "maple-leaf": "🍁",
  tomato: "🍅",
  tulip: "🌷",

  // Rare
  sunflower: "🌻",
  "pink-rose": "🌹",
  hibiscus: "🌺",
  iris: "🪻",
  marigold: "🏵️",
  evergreen: "🌲",
  tree: "🌳",
  palm: "🌴",

  // Epic
  lotus: "🪷",
  orchid: "🪻",
  "cherry-blossom": "🌸",
  bonsai: "🎍",

  // Legendary
  "dragon-fruit": "🐉",
  "crystal-flower": "💎",
  "golden-bloom": "🌟",
  "ancient-tree": "🏯",
} as const;

export const emojis = {
  expansion: "🔍",
  shuffle: "🔀",
  sell: "💰",
  ...plantEmojis,
} as const;

export type EmojiKey = keyof typeof emojis;
