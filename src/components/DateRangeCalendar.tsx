import { Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { formatDatePtBR, todayISODate, toISODate } from "../utils/date";

type MarkedDates = Record<
  string,
  { color: string; textColor: string; startingDay?: boolean; endingDay?: boolean }
>;

function buildMarkedDates(start: string | null, end: string | null): MarkedDates {
  if (!start) return {};
  if (!end) {
    return {
      [start]: { color: "#2563EB", textColor: "#fff", startingDay: true, endingDay: true },
    };
  }

  const marked: MarkedDates = {};
  const cursor = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  while (cursor <= endDate) {
    const iso = toISODate(cursor);
    marked[iso] = {
      color: "#2563EB",
      textColor: "#fff",
      startingDay: iso === start,
      endingDay: iso === end,
    };
    cursor.setDate(cursor.getDate() + 1);
  }
  return marked;
}

export default function DateRangeCalendar({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string | null;
  endDate: string | null;
  onChange: (startDate: string, endDate: string | null) => void;
}) {
  function handleDayPress(day: DateData) {
    const iso = day.dateString;

    if (!startDate || (startDate && endDate)) {
      onChange(iso, null);
      return;
    }
    if (iso < startDate) {
      onChange(iso, null);
      return;
    }
    onChange(startDate, iso);
  }

  const helperText = !startDate
    ? "Toque no dia de início da viagem"
    : !endDate
      ? "Agora toque no dia de fim da viagem"
      : `${formatDatePtBR(startDate)} até ${formatDatePtBR(endDate)}`;

  return (
    <View>
      <Text className="text-sm text-gray-500 mb-2">{helperText}</Text>
      <Calendar
        minDate={todayISODate()}
        onDayPress={handleDayPress}
        markingType="period"
        markedDates={buildMarkedDates(startDate, endDate)}
        theme={{
          todayTextColor: "#2563EB",
          arrowColor: "#2563EB",
          selectedDayBackgroundColor: "#2563EB",
          textDayFontSize: 14,
          textMonthFontWeight: "700",
        }}
        style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16 }}
      />
    </View>
  );
}
