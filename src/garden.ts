import { prompt } from "enquirer";
import { EmojiKey, emojis } from "./const/emoji";
import { loadData } from "./storage";
import { clearConsole } from "./utils";

const emptyPlotEmoji = "🌱"; // Grass emoji for empty plots
export async function showGarden(): Promise<void> {
  clearConsole();
  let data = await loadData();

  console.log("Your Garden:\n");

  for (let y = 0; y < data.gardenSize; y++) {
    let row = "";
    for (let x = 0; x < data.gardenSize; x++) {
      const plant = data.plants.find((p) => p.x === x && p.y === y);
      if (plant) {
        row += emojis[plant.type as EmojiKey] || "🌱";
      } else {
        row += emptyPlotEmoji;
      }
    }
    console.log(row);
  }

  console.log("");
  await prompt<{ action: string }>({
    type: "select",
    name: "action",
    message: "",
    choices: [{ name: "back", message: "↩ Back" }],
  });
}
