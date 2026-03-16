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
