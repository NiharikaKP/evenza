import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CLUB_COLORS = [
  // Red / Rose / Pink
  'from-red-400 to-red-600',
  'from-red-500 to-rose-600',
  'from-rose-400 to-rose-600',
  'from-rose-500 to-pink-600',
  'from-pink-400 to-pink-600',
  'from-pink-500 to-rose-600',
  // Fuchsia / Purple / Violet
  'from-fuchsia-400 to-fuchsia-600',
  'from-fuchsia-500 to-purple-600',
  'from-purple-400 to-purple-600',
  'from-purple-500 to-violet-600',
  'from-violet-400 to-violet-600',
  'from-violet-500 to-purple-600',
  // Indigo / Blue / Sky / Cyan
  'from-indigo-400 to-indigo-600',
  'from-indigo-500 to-blue-600',
  'from-blue-400 to-blue-600',
  'from-blue-500 to-indigo-600',
  'from-blue-500 to-cyan-600',
  'from-sky-400 to-sky-600',
  'from-sky-500 to-blue-600',
  'from-cyan-400 to-cyan-600',
  'from-cyan-500 to-sky-600',
  // Teal / Emerald / Green
  'from-teal-400 to-teal-600',
  'from-teal-500 to-emerald-600',
  'from-emerald-400 to-emerald-600',
  'from-emerald-500 to-teal-600',
  'from-green-400 to-green-600',
  'from-green-500 to-emerald-600',
  // Lime / Yellow / Amber / Orange
  'from-lime-400 to-lime-600',
  'from-lime-500 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-yellow-500 to-amber-600',
  'from-amber-400 to-amber-600',
  'from-amber-500 to-orange-600',
  'from-orange-400 to-orange-600',
  'from-orange-500 to-amber-600',
  // Cross-family combos
  'from-pink-500 to-violet-600',
  'from-fuchsia-500 to-pink-600',
  'from-cyan-500 to-teal-600',
  'from-lime-500 to-emerald-600',
  'from-orange-500 to-red-600',
  'from-amber-500 to-yellow-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-fuchsia-600',
  'from-teal-500 to-cyan-600',
  'from-green-500 to-teal-600',
  'from-rose-500 to-fuchsia-600',
  'from-indigo-500 to-violet-600',
];

export function getClubColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return CLUB_COLORS[hash % CLUB_COLORS.length];
}

export function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes('placehold.co') || url.includes('placeholder');
}

export function getEventStatus(event: { startTime: Date; endTime: Date; isCancelled: boolean }) {
  if (event.isCancelled) return 'cancelled';
  const now = new Date();
  if (now < event.startTime) return 'upcoming';
  if (now >= event.startTime && now <= event.endTime) return 'live';
  return 'past';
}
