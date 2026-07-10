export function tripDurationDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(diffDays + 1, 1);
}

export function dateForDayIndex(startDate: string, dayIndex: number): Date {
  const start = new Date(`${startDate}T00:00:00`);
  start.setDate(start.getDate() + dayIndex);
  return start;
}

export function formatDayLabel(startDate: string, dayIndex: number): string {
  const date = dateForDayIndex(startDate, dayIndex);
  const formatted = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
  return `Dia ${dayIndex + 1} · ${formatted}`;
}
