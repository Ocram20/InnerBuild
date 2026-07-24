/**
 * Helper to normalize structured detox challenge titles or raw bad habit strings
 * into a synthetic, clean name for trigger tracking.
 * 
 * Examples:
 * - "Sfida 7 Giorni Detox dai Social Media" ➔ "Social Media"
 * - "Percorso 30 Giorni No Porn" ➔ "Pornografia / Contenuti Adulti"
 * - "Reset Cibo Spazzatura" ➔ "Junk Food"
 * - "Detox dai Videogiochi" ➔ "Videogiochi"
 * - "Sfida 14 Giorni No Fumo" ➔ "Fumo / Nicotina"
 */
export function normalizeBadHabitName(title: string, category?: string): string {
  if (!title) return "Generale";
  const lower = title.toLowerCase();
  
  if (lower.includes("social") || lower.includes("instagram") || lower.includes("tiktok")) {
    return "Social Media";
  }
  if (lower.includes("porn") || lower.includes("adulti") || lower.includes("nofap") || lower.includes("hardcore")) {
    return "Pornografia / Contenuti Adulti";
  }
  if (lower.includes("cibo") || lower.includes("junk") || lower.includes("zuccheri") || lower.includes("dolci") || lower.includes("spazzatura")) {
    return "Junk Food";
  }
  if (lower.includes("video") || lower.includes("gaming") || lower.includes("giochi") || lower.includes("videogame")) {
    return "Videogiochi";
  }
  if (lower.includes("fumo") || lower.includes("sigarett") || lower.includes("vape") || lower.includes("nicotin")) {
    return "Fumo / Nicotina";
  }
  if (lower.includes("alcol") || lower.includes("bere") || lower.includes("drink") || lower.includes("birra")) {
    return "Alcol";
  }

  // Strip common challenge prefix patterns
  let clean = title
    .replace(/^(Sfida|Percorso|Reset|Challenge)\s+\d+\s+Giorni?\s+(Detox\s+dai?|No)?/i, "")
    .replace(/^(Sfida|Percorso|Reset|Challenge|Detox|No)\s+(dai?|da|di|degli|delle)?\s*/i, "")
    .trim();

  if (clean.length > 0) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return title;
}

export const COMMON_BAD_HABIT_PRESETS = [
  { id: "social_media", name: "Social Media", icon: "📱", color: "#4D87D9" },
  { id: "pornography", name: "Pornografia / Contenuti Adulti", icon: "🔞", color: "#9B5BDB" },
  { id: "junk_food", name: "Junk Food", icon: "🍔", color: "#F59E0B" },
  { id: "smoking", name: "Fumo / Nicotina", icon: "🚬", color: "#EF4444" },
  { id: "gaming", name: "Videogiochi", icon: "🎮", color: "#8B5CF6" },
  { id: "alcohol", name: "Alcol", icon: "🍺", color: "#10B981" },
];
