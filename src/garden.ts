import { prompt } from "enquirer";
import chalk from "chalk";
import { EmojiKey, emojis } from "./const/emoji";
import { loadData } from "./storage";
import { clearConsole } from "./utils";

export const EMPTY_PLOT = chalk.green("··");

export function renderGardenGrid(
  plants: { x: number; y: number; type: string }[],
  gardenSize: number,
  showCoords = false
): string[] {
  const lines: string[] = [];

  if (showCoords) {
    let header = "   ";
    for (let x = 0; x < gardenSize; x++) {
      header += ` ${x} `;
    }
    lines.push(chalk.dim(header));
  }

  for (let y = 0; y < gardenSize; y++) {
    let row = showCoords ? chalk.dim(` ${y} `) : "";
    for (let x = 0; x < gardenSize; x++) {
      const plant = plants.find((p) => p.x === x && p.y === y);
      if (plant) {
        row += (emojis[plant.type as EmojiKey] || EMPTY_PLOT) + " ";
      } else {
        row += EMPTY_PLOT + " ";
      }
    }
    lines.push(row);
  }

  return lines;
}

export async function showGarden(): Promise<void> {
  clearConsole();
  let data = await loadData();

  console.log("Your Garden:\n");

  const lines = renderGardenGrid(data.plants, data.gardenSize, true);
  for (const line of lines) {
    console.log(line);
  }

  console.log("");
  await prompt<{ action: string }>({
    type: "select",
    name: "action",
    message: "",
    choices: [{ name: "back", message: "↩ Back" }],
  });
}
