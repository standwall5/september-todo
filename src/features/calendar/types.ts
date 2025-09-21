export interface CalendarDay {
  date: string; // YYYY-MM-DD format
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  todoCount: number;
}

export interface CalendarState {
  currentDate: Date;
  selectedDate: string | null;
  viewMode: "month" | "week";
}
