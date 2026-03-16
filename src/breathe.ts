import { existsSync } from "fs";
import { readFile } from "fs/promises";
import chalk from "chalk";
import { breathingPatterns } from "./const/patterns";
import { BreathingPattern } from "./types/BreathingPattern";
import path from "path";

export async function getCustomBreathingPatterns(): Promise<BreathingPattern[]> {
  const filename = "breathe.json";
  const possiblePaths = [
    path.join(process.cwd(), filename),
    path.join(__dirname, '..', filename)
  ];

  for (const filePath of possiblePaths) {
    if (existsSync(filePath)) {
      console.log(`Custom breathing file found at: ${filePath}`);
      try {
        console.log("Loading custom breathing patterns...");
        const data = await readFile(filePath, "utf8");
        const customPatterns = JSON.parse(data);
        console.log("Custom breathing patterns loaded successfully.");
        return customPatterns as BreathingPattern[];
      } catch (error) {
        console.error(`Error reading ${filePath}: ${(error as Error).message}`);
      }
    }
  }

  console.log(chalk.yellow("No custom breathing file found."));
  return [];
}

export async function getBreathingPatterns(): Promise<BreathingPattern[]> {
  const hardcoded = [...breathingPatterns];
  const custom = await getCustomBreathingPatterns();
  return [...hardcoded, ...custom];
}
