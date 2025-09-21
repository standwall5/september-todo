import { useState, useMemo } from "react";
import type { CalendarState } from "./types";
import type { Todo } from "../todo/types";
import { generateCalendarDays, formatDate } from "./utils";

export const useCalendar = (todos: Todo[]) => {
  const [calendarState, setCalendarState] = useState<CalendarState>({
    currentDate: new Date(),
    selectedDate: null,
    viewMode: "month",
  });

  // Group todos by date
  const todosByDate = useMemo(() => {
    const grouped: { [date: string]: Todo[] } = {};
    todos.forEach((todo) => {
      const date = todo.dueDate || todo.createdAt;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(todo);
    });
    return grouped;
  }, [todos]);

  // Get todo count by date for calendar display
  const todoCountByDate = useMemo(() => {
    const counts: { [date: string]: number } = {};
    Object.keys(todosByDate).forEach((date) => {
      counts[date] = todosByDate[date].length;
    });
    return counts;
  }, [todosByDate]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    return generateCalendarDays(
      calendarState.currentDate,
      calendarState.selectedDate,
      todoCountByDate
    );
  }, [calendarState.currentDate, calendarState.selectedDate, todoCountByDate]);

  const selectedDateTodos = calendarState.selectedDate
    ? todosByDate[calendarState.selectedDate] || []
    : [];

  const navigateMonth = (direction: "prev" | "next") => {
    setCalendarState((prev) => {
      const newDate = new Date(prev.currentDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return { ...prev, currentDate: newDate };
    });
  };

  const selectDate = (date: string) => {
    setCalendarState((prev) => ({
      ...prev,
      selectedDate: prev.selectedDate === date ? null : date,
    }));
  };

  const goToToday = () => {
    const today = formatDate(new Date());
    setCalendarState((prev) => ({
      ...prev,
      currentDate: new Date(),
      selectedDate: today,
    }));
  };

  return {
    calendarState,
    calendarDays,
    selectedDateTodos,
    todosByDate,
    navigateMonth,
    selectDate,
    goToToday,
  };
};
