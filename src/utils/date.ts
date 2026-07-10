export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISODate(): string {
  return toISODate(new Date());
}

export function formatDatePtBR(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

// Usado pelo "Mudar Planos (Choveu!)": se hoje está dentro do período da
// viagem, usa o dia correspondente; caso contrário (testando fora das
// datas reais, ou viagem já encerrada), cai no primeiro/último dia.
export function currentTripDayIndex(startDate: string, endDate: string): number {
  const today = todayISODate();
  if (today <= startDate) return 0;
  if (today >= endDate) return tripDurationDays(startDate, endDate) - 1;

  const start = new Date(`${startDate}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);
  return Math.round((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function currentPeriodNow(): "manha" | "tarde" | "noite" {
  const hour = new Date().getHours();
  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}
