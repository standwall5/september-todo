import type { CalendarDay } from "./types";

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString + "T00:00:00");
};

export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export const generateCalendarDays = (
  currentDate: Date,
  selectedDate: string | null,
  todoCountByDate: { [date: string]: number }
): CalendarDay[] => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the first day to display (might be from previous month)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // Get the last day to display (might be from next month)
  const endDate = new Date(lastDay);
  const daysToAdd = 6 - lastDay.getDay();
  endDate.setDate(endDate.getDate() + daysToAdd);

  const days: CalendarDay[] = [];
  const today = formatDate(new Date());

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateString = formatDate(date);
    const isCurrentMonth = date.getMonth() === month;

    days.push({
      date: dateString,
      day: date.getDate(),
      isCurrentMonth,
      isToday: dateString === today,
      isSelected: dateString === selectedDate,
      todoCount: todoCountByDate[dateString] || 0,
    });
  }

  return days;
};
