import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with clsx and merges Tailwind utility conflicts cleanly.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Derives uppercase initials from user display name or handle (e.g. "Arnav Sharma" -> "AS").
 */
export function getInitials(name: string): string {
  if (!name) return "U";
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formats relative time (e.g. "just now", "5m ago", "2h ago", "yesterday", "3d ago").
 */
export function formatRelativeTime(date: string | Date | number): string {
  const now = Date.now();
  const then = typeof date === "string" || typeof date === "number" ? new Date(date).getTime() : date.getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  const d = new Date(then);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats full Indian standard time and date (Asia/Kolkata).
 */
export function formatCampusDate(date: string | Date | number, includeTime = true): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit", hour12: true } : {}),
  });
}

/**
 * Compact counter formatter (e.g., 1200 -> "1.2k", 1540000 -> "1.5M").
 */
export function formatCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) {
    const k = (count / 1000).toFixed(1);
    return k.endsWith(".0") ? `${Math.floor(count / 1000)}k` : `${k}k`;
  }
  const m = (count / 1000000).toFixed(1);
  return m.endsWith(".0") ? `${Math.floor(count / 1000000)}M` : `${m}M`;
}

/**
 * Cleanly truncates string without breaking words abruptly where possible.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
