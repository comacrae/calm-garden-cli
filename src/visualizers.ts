import { Palette } from "./config";

export type VisualizerFn = (
  progress: number,
  phase: string,
  palette: Palette,
  width: number
) => string[];

// ─── Progress Bar ───────────────────────────────────────────────────

function progressBar(
  progress: number,
  _phase: string,
  palette: Palette,
  width: number
): string[] {
  const barWidth = Math.min(30, width - 10);
  const filled = Math.round(progress * barWidth);
  const bar =
    palette.bar("█".repeat(filled)) +
    palette.dim("░".repeat(barWidth - filled));
  return [bar];
}

// ─── Wave ───────────────────────────────────────────────────────────

function wave(
  progress: number,
  _phase: string,
  palette: Palette,
  width: number
): string[] {
  const waveWidth = Math.min(40, width - 10);
  const rows = 7;
  const amplitude = Math.max(0.5, progress * 3);
  const midRow = Math.floor(rows / 2);
  const chars = ["∿", "≈", "∼", "~"];
  const grid: string[][] = [];

  for (let r = 0; r < rows; r++) {
    grid.push(new Array(waveWidth).fill(" "));
  }

  for (let x = 0; x < waveWidth; x++) {
    const t = (x / waveWidth) * Math.PI * 2;
    const y = Math.sin(t + progress * Math.PI) * amplitude;
    const row = Math.round(midRow - y);
    if (row >= 0 && row < rows) {
      const charIdx = Math.floor(Math.abs(y) / amplitude * (chars.length - 1));
      const ch = chars[Math.min(charIdx, chars.length - 1)];
      grid[row][x] = palette.accent(ch);
    }
  }

  return grid.map((row) => row.join(""));
}

// ─── Orb ────────────────────────────────────────────────────────────

function orb(
  progress: number,
  _phase: string,
  palette: Palette,
  _width: number
): string[] {
  const maxRadius = 4;
  const radius = Math.max(1, Math.round(progress * maxRadius));
  const size = maxRadius * 2 + 1;
  const center = maxRadius;
  const ringChars = ["✦", "*", "•", "°", "·"];
  const lines: string[] = [];

  for (let y = 0; y < size; y++) {
    let row = "";
    for (let x = 0; x < size * 2; x++) {
      const dx = (x / 2) - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.8) {
        row += palette.bar("✦");
      } else if (dist <= radius) {
        const ringIndex = Math.min(
          Math.floor((dist / radius) * (ringChars.length - 1)),
          ringChars.length - 1
        );
        const ch = ringChars[ringIndex];
        if (dist <= radius * 0.4) {
          row += palette.bar(ch);
        } else if (dist <= radius * 0.7) {
          row += palette.accent(ch);
        } else {
          row += palette.dim(ch);
        }
      } else {
        row += " ";
      }
    }
    lines.push(row);
  }
  return lines;
}

// ─── Registry ───────────────────────────────────────────────────────

export const visualizers: Record<string, VisualizerFn> = {
  "progress-bar": progressBar,
  wave,
  orb,
};
