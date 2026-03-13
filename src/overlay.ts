import chalk from "chalk";
import { breathingPatterns } from "./const/patterns";
import { BreathingPhase } from "./types/BreathingPattern";
import { emojis, EmojiKey } from "./const/emoji";
import { loadData, saveData, BreathingData } from "./storage";

// ─── State ───────────────────────────────────────────────────────────

let paused = false;
let running = true;
let data: BreathingData;
let sessionTime = 0;
let currentPhaseName = "";
let currentPhaseSecond = 0;
let currentPhaseDuration = 0;
let patternName = "";
let activePhases: BreathingPhase[] = [];
let phaseIndex = 0;
let menuOpen = false;
let menuIndex = 0;

let inputCleanup: (() => void) | null = null;

// ─── Terminal helpers ────────────────────────────────────────────────

function hideCursor(): void {
  process.stdout.write("\x1B[?25l");
}

function showCursor(): void {
  process.stdout.write("\x1B[?25h");
}

function moveTo(row: number, col: number): void {
  process.stdout.write(`\x1B[${row};${col}H`);
}

function clearScreen(): void {
  process.stdout.write("\x1B[2J");
}

function getTermWidth(): number {
  return process.stdout.columns || 60;
}

function center(text: string, width: number): string {
  const stripped = text.replace(/\x1B\[[0-9;]*m/g, "");
  const pad = Math.max(0, Math.floor((width - stripped.length) / 2));
  return " ".repeat(pad) + text;
}

// ─── Render ──────────────────────────────────────────────────────────

function render(): void {
  const w = getTermWidth();

  clearScreen();
  moveTo(1, 1);

  const lines: string[] = [];

  lines.push("");
  lines.push(center(chalk.bold("🌿  calm garden  🌿"), w));
  lines.push(center(chalk.dim(patternName), w));
  lines.push("");

  if (paused) {
    lines.push(center(chalk.yellow.bold("⏸  PAUSED"), w));
  } else {
    const phaseColor =
      currentPhaseName === "Inhale"
        ? chalk.cyan.bold
        : currentPhaseName === "Exhale"
        ? chalk.green.bold
        : chalk.yellow.bold;
    lines.push(center(phaseColor(`${currentPhaseName}`), w));
  }

  lines.push("");

  const barWidth = Math.min(30, w - 10);
  const progress =
    currentPhaseDuration > 0 ? currentPhaseSecond / currentPhaseDuration : 0;
  const filled = Math.round(progress * barWidth);
  const bar =
    chalk.cyan("█".repeat(filled)) +
    chalk.dim("░".repeat(barWidth - filled));
  lines.push(center(bar, w));
  lines.push(
    center(chalk.dim(`${currentPhaseSecond}/${currentPhaseDuration}s`), w)
  );

  lines.push("");

  // Garden
  const gardenSize = data.gardenSize;
  const emptyPlot = "🌱";
  for (let y = 0; y < gardenSize; y++) {
    let row = "";
    for (let x = 0; x < gardenSize; x++) {
      const plant = data.plants.find(
        (p: { x: number; y: number; type: string }) => p.x === x && p.y === y
      );
      row += plant
        ? emojis[plant.type as EmojiKey] || emptyPlot
        : emptyPlot;
    }
    lines.push(center(row, w));
  }

  lines.push("");

  lines.push(
    center(
      chalk.dim(`☀️ ${data.coins}`) +
        chalk.dim("  ⏱ ") +
        chalk.dim(formatTime(sessionTime)),
      w
    )
  );

  lines.push("");

  lines.push(
    center(
      chalk.dim("[space] pause/resume  [m] menu  [q] back"),
      w
    )
  );

  process.stdout.write(lines.join("\n"));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─── Menu ────────────────────────────────────────────────────────────

function showMenu(): void {
  if (menuOpen) {
    menuOpen = false;
    paused = false;
    render();
    return;
  }
  menuOpen = true;
  paused = true;
  menuIndex = 0;
  renderMenu();
}

function renderMenu(): void {
  const w = getTermWidth();
  clearScreen();
  moveTo(1, 1);

  const lines: string[] = [];
  lines.push("");
  lines.push(center(chalk.bold("🌿  select pattern  🌿"), w));
  lines.push("");

  for (let i = 0; i < breathingPatterns.length; i++) {
    const p = breathingPatterns[i];
    const selected = i === menuIndex;
    const prefix = selected ? chalk.cyan.bold("▸ ") : "  ";
    const text = selected
      ? chalk.cyan.bold(`${p.emoji} ${p.display}`)
      : chalk.dim(`${p.emoji} ${p.display}`);
    lines.push(center(prefix + text, w));
    lines.push(center(chalk.dim(`  ${p.description}`), w));
    lines.push("");
  }

  lines.push(
    center(chalk.dim("[↑↓] select  [enter] start  [m] back"), w)
  );

  process.stdout.write(lines.join("\n"));
}

function handleMenuInput(key: string): void {
  if (key === "\x1B[A" || key === "k") {
    menuIndex =
      (menuIndex - 1 + breathingPatterns.length) % breathingPatterns.length;
    renderMenu();
  } else if (key === "\x1B[B" || key === "j") {
    menuIndex = (menuIndex + 1) % breathingPatterns.length;
    renderMenu();
  } else if (key === "\r") {
    const selected = breathingPatterns[menuIndex];
    patternName = selected.display;
    activePhases = selected.pattern;
    currentPhaseName = activePhases[0].name;
    currentPhaseDuration = activePhases[0].duration;
    currentPhaseSecond = 0;
    phaseIndex = 0;
    menuOpen = false;
    paused = false;
    render();
  } else if (key === "m" || key === "q" || key === "\x1B") {
    menuOpen = false;
    paused = false;
    render();
  }
}

// ─── Input ───────────────────────────────────────────────────────────

function setupInput(): void {
  if (!process.stdin.isTTY) return;
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  const handler = (key: string) => {
    if (menuOpen) {
      handleMenuInput(key);
      return;
    }
    if (key === " ") {
      paused = !paused;
      render();
    } else if (key === "m") {
      showMenu();
    } else if (key === "q" || key === "\x03") {
      running = false;
    }
  };

  process.stdin.on("data", handler);

  inputCleanup = () => {
    process.stdin.removeListener("data", handler);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
  };
}

// ─── Breathing loop ──────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function breatheLoop(): Promise<void> {
  while (running) {
    phaseIndex = 0;
    while (phaseIndex < activePhases.length && running) {
      const phase = activePhases[phaseIndex];
      currentPhaseName = phase.name;
      currentPhaseDuration = phase.duration;

      for (let s = 1; s <= phase.duration; s++) {
        if (!running) return;

        while ((paused || menuOpen) && running) {
          await sleep(100);
        }
        if (!running) return;

        currentPhaseSecond = s;
        render();

        await sleep(1000);

        sessionTime++;
        data.totalSecondsPracticed++;
        data.coins++;
        await saveData(data);
      }

      phaseIndex++;
    }
  }
}

// ─── Exported entry point ────────────────────────────────────────────

export async function startBreathingOverlay(
  patternType: string
): Promise<void> {
  // Reset state for each session
  paused = false;
  running = true;
  sessionTime = 0;
  menuOpen = false;
  menuIndex = 0;

  data = await loadData();

  const match = breathingPatterns.find((p) => p.name === patternType);
  if (!match) {
    console.log(`Unknown pattern: ${patternType}`);
    return;
  }

  patternName = match.display;
  activePhases = match.pattern;
  currentPhaseName = activePhases[0].name;
  currentPhaseDuration = activePhases[0].duration;
  currentPhaseSecond = 0;

  hideCursor();
  setupInput();
  render();

  await breatheLoop();

  // Cleanup when loop exits (user pressed q)
  if (inputCleanup) inputCleanup();
  showCursor();
  clearScreen();
  moveTo(1, 1);

  if (sessionTime > 0) {
    console.log(
      chalk.green(
        `Session done. ${sessionTime}s practiced, ${sessionTime} coins earned.\n`
      )
    );
  }
}
