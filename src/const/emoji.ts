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

  // Exotic (ASCII/Unicode glyphs)
  "fern-glyph": "❧",
  "star-moss": "⍟",
  "rune-sprout": "ᚡ",
  "hex-bloom": "⌬",
  "sigil-vine": "☸",
  "eye-cluster": "ꙮ",
  "spiral-fern": "ꝏ",
  "thorn-script": "ᛝ",
} as const;

export const emojis = {
  expansion: "🔍",
  shuffle: "🔀",
  sell: "💰",
  trade: "🔄",
  ...plantEmojis,
} as const;

export type EmojiKey = keyof typeof emojis;
