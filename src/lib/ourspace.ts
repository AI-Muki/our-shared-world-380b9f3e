export type ActivityStatus = "want" | "planned" | "done";

export const STATUSES: { value: ActivityStatus; label: string; emoji: string }[] = [
  { value: "want", label: "Want to do", emoji: "💭" },
  { value: "planned", label: "Planned", emoji: "📅" },
  { value: "done", label: "Done", emoji: "✅" },
];

export const CATEGORIES = [
  { value: "adventure", label: "Adventure", emoji: "🎯" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "sport", label: "Sport", emoji: "🏃" },
  { value: "food", label: "Food", emoji: "🍽" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "home", label: "At Home", emoji: "🏠" },
  { value: "date", label: "Date", emoji: "❤️" },
  { value: "random", label: "Random", emoji: "🎲" },
];

export const BUDGETS = [
  { value: "cheap", label: "Cheap", emoji: "💸" },
  { value: "normal", label: "Normal", emoji: "💰" },
  { value: "special", label: "Special", emoji: "💎" },
];

export const DURATIONS = [
  { value: "quick", label: "Under 1 hour", emoji: "⚡" },
  { value: "hours", label: "A few hours", emoji: "🕐" },
  { value: "day", label: "Whole day", emoji: "☀️" },
  { value: "weekend", label: "Weekend", emoji: "🌙" },
];

export const VIBES = [
  { value: "home", label: "Stay home", emoji: "🏠" },
  { value: "out", label: "Go outside", emoji: "🌆" },
  { value: "food", label: "Food", emoji: "🍽" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "active", label: "Active", emoji: "🏃" },
  { value: "romantic", label: "Romantic", emoji: "❤️" },
  { value: "anything", label: "Anything", emoji: "🎲" },
];

export const STARTER_GAMES = [
  { name: "Tennis", emoji: "🎾" },
  { name: "Bowling", emoji: "🎳" },
  { name: "Pool", emoji: "🎱" },
  { name: "Table tennis", emoji: "🏓" },
  { name: "FIFA", emoji: "🎮" },
  { name: "UNO", emoji: "🃏" },
  { name: "Karting", emoji: "🏎" },
  { name: "Darts", emoji: "🎯" },
];

export function labelFor(
  list: { value: string; label: string; emoji: string }[],
  value: string | null | undefined,
) {
  return list.find((item) => item.value === value) ?? { value: "", label: "", emoji: "•" };
}

export function daysTogether(anniversary: string | null | undefined) {
  if (!anniversary) return null;
  const start = new Date(anniversary + "T00:00:00");
  if (Number.isNaN(start.getTime())) return null;
  const diff = Date.now() - start.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

export function makeInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
