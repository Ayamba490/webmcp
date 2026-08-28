import { ThemeConfig, ThemeMode } from "../types";

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: "dark_obsidian",
    name: "Obsidian Stealth",
    description: "Deep obsidian black with crisp indigo glow and high-contrast typography.",
    previewBg: "#050505",
    previewAccent: "#6366F1",
    badge: "DEFAULT DARK",
  },
  {
    id: "clean_light",
    name: "Pure Titanium Light",
    description: "Ultra-clean, high-visibility daylight mode with deep onyx text and crisp borders.",
    previewBg: "#F8FAFC",
    previewAccent: "#4F46E5",
    badge: "MAX VISIBILITY",
  },
  {
    id: "cyber_neon",
    name: "Cyber Neon HUD",
    description: "Midnight emerald matrix aesthetic with vibrant high-visibility neon accents.",
    previewBg: "#020D0A",
    previewAccent: "#10B981",
    badge: "HIGH CONTRAST",
  },
  {
    id: "warm_editorial",
    name: "Warm Editorial",
    description: "Refined warm studio amber with walnut warmth and brass accents.",
    previewBg: "#0F0D0B",
    previewAccent: "#F59E0B",
    badge: "STUDIO WARM",
  },
];
