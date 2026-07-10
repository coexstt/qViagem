import { ItineraryItem, Period, Trip } from "../db/database";
import { formatDatePtBR, formatDayLabel, tripDurationDays } from "./date";

const PERIOD_ORDER: Period[] = ["manha", "tarde", "noite"];
const PERIOD_EMOJI: Record<Period, string> = {
  manha: "🌅",
  tarde: "☀️",
  noite: "🌙",
};
const PERIOD_LABEL: Record<Period, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export function formatItineraryForSharing(
  trip: Trip,
  items: ItineraryItem[]
): string {
  const totalDays = tripDurationDays(trip.startDate, trip.endDate);

  let text = `✈️ Roteiro de viagem: ${trip.destination}\n`;
  text += `📅 ${formatDatePtBR(trip.startDate)} até ${formatDatePtBR(trip.endDate)}\n\n`;

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const dayItems = items.filter((item) => item.dayIndex === dayIndex);
    if (dayItems.length === 0) continue;

    text += `📌 ${formatDayLabel(trip.startDate, dayIndex)}\n`;

    for (const period of PERIOD_ORDER) {
      const periodItems = dayItems.filter((item) => item.period === period);
      if (periodItems.length === 0) continue;

      text += `${PERIOD_EMOJI[period]} ${PERIOD_LABEL[period]}:\n`;
      periodItems.forEach((item) => {
        text += `   • ${item.title}\n`;
      });
    }
    text += `\n`;
  }

  text += `Roteiro criado com o app qViagem 🧳`;
  return text;
}
