export function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    Announcement: 'bg-violet-100 text-violet-700',
    Achievement: 'bg-amber-100 text-amber-700',
    Events: 'bg-emerald-100 text-emerald-700',
    Research: 'bg-sky-100 text-sky-700',
    Career: 'bg-rose-100 text-rose-700',
    Community: 'bg-pink-100 text-pink-700',
  };
  return map[cat] ?? 'bg-zinc-100 text-zinc-600';
}
