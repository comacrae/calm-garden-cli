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
  const waveWidth = Math.min(44, width - 10);
  const rows = 7;
  const amplitude = Math.max(0.8, progress * 3);
  const midRow = Math.floor(rows / 2);
  const chars = ["█", "▓", "▒", "░"];
  const grid: string[][] = [];

  // Continuous time offset creates the rightward-originating rolling effect
  const time = Date.now() / 600;

  for (let r = 0; r < rows; r++) {
    grid.push(new Array(waveWidth).fill(" "));
  }

  // Two layered waves for depth
  for (let layer = 0; layer < 2; layer++) {
    const freq = layer === 0 ? 1.5 : 2.2;
    const layerAmp = layer === 0 ? amplitude : amplitude * 0.5;
    const layerChars = layer === 0 ? chars : chars.slice(2);
    const colorFn = layer === 0 ? palette.accent : palette.dim;

    for (let x = 0; x < waveWidth; x++) {
      // Wave travels left: positive time offset + x produces rightward origin
      const t = ((x / waveWidth) * Math.PI * 2 * freq) - time + (layer * 0.8);
      const y = Math.sin(t) * layerAmp;
      const row = Math.round(midRow - y);
      if (row >= 0 && row < rows) {
        const charIdx = Math.floor(
          (Math.abs(y) / Math.max(0.01, layerAmp)) * (layerChars.length - 1)
        );
        const ch = layerChars[Math.min(charIdx, layerChars.length - 1)];
        // Front layer overwrites back layer
        if (layer === 0 || grid[row][x] === " ") {
          grid[row][x] = colorFn(ch);
        }
      }
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

// ─── Lotus ──────────────────────────────────────────────────────────

function lotus(
  progress: number,
  _phase: string,
  palette: Palette,
  _width: number
): string[] {
  const time = Date.now() / 1000;
  const size = 9;
  const center = Math.floor(size / 2);
  const breathScale = 0.5 + progress * 0.5; // 0.5 → 1.0
  const petals = 8;
  const grid: string[][] = [];

  for (let r = 0; r < size; r++) {
    grid.push(new Array(size * 2).fill(" "));
  }

  // Draw petals radiating from center
  for (let p = 0; p < petals; p++) {
    const baseAngle = (p / petals) * Math.PI * 2;
    // Slow rotation
    const angle = baseAngle + time * 0.4;
    // Petals breathe in and out
    const petalLength = 1.5 + breathScale * 2.5;

    for (let d = 0.3; d <= petalLength; d += 0.3) {
      const px = center + Math.cos(angle) * d * 2; // *2 for aspect ratio
      const py = center + Math.sin(angle) * d;
      const col = Math.round(px);
      const row = Math.round(py);

      if (row >= 0 && row < size && col >= 0 && col < size * 2) {
        const t = d / petalLength;
        if (t < 0.33) {
          grid[row][col] = palette.bar("◆");
        } else if (t < 0.66) {
          grid[row][col] = palette.accent("◇");
        } else {
          grid[row][col] = palette.dim("·");
        }
      }
    }
  }

  // Center jewel
  grid[center][center * 2] = palette.bar("✦");
  if (center * 2 + 1 < size * 2) {
    grid[center][center * 2 + 1] = palette.bar("✦");
  }

  // Outer ring that pulses with breath
  const ringRadius = 1 + breathScale * 3;
  const ringPoints = 24;
  for (let i = 0; i < ringPoints; i++) {
    const angle = (i / ringPoints) * Math.PI * 2 + time * 0.2;
    const rx = center + Math.cos(angle) * ringRadius * 2;
    const ry = center + Math.sin(angle) * ringRadius;
    const col = Math.round(rx);
    const row = Math.round(ry);
    if (row >= 0 && row < size && col >= 0 && col < size * 2) {
      if (grid[row][col] === " ") {
        grid[row][col] = palette.dim(i % 3 === 0 ? "◦" : "·");
      }
    }
  }

  return grid.map((row) => row.join(""));
}

// ─── Registry ───────────────────────────────────────────────────────

export const visualizers: Record<string, VisualizerFn> = {
  "progress-bar": progressBar,
  wave,
  orb,
  lotus,
};
