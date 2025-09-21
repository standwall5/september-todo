import React from "react";
import { useCalendar } from "./hooks";
import { getMonthName, parseDate } from "./utils";
import type { Todo } from "../todo/types";
import { Sectograph } from "../../components/Sectograph";
import "./CalendarPage.css";

interface CalendarPageProps {
  todos: Todo[];
  onToggleTodo: (id: number) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ todos, onToggleTodo }) => {
  const {
    calendarState,
    calendarDays,
    selectedDateTodos,
    navigateMonth,
    selectDate,
    goToToday,
  } = useCalendar(todos);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatSelectedDate = (dateString: string) => {
    const date = parseDate(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <div className="calendar-header">
          <h1>{getMonthName(calendarState.currentDate)}</h1>
          <div className="calendar-nav">
            <button className="nav-btn" onClick={() => navigateMonth("prev")}>
              ← Prev
            </button>
            <button className="nav-btn today-btn" onClick={goToToday}>
              Today
            </button>
            <button className="nav-btn" onClick={() => navigateMonth("next")}>
              Next →
            </button>
          </div>
        </div>

        <div className="calendar-content">
          <div className="calendar-grid-container">
            <div className="weekdays">
              {weekdays.map((day) => (
                <div key={day} className="weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day) => (
                <div
                  key={day.date}
                  className={`calendar-day ${
                    day.isSelected ? "selected" : ""
                  } ${day.isToday ? "today" : ""} ${
                    !day.isCurrentMonth ? "other-month" : ""
                  }`}
                  onClick={() => selectDate(day.date)}
                >
                  <div className="day-number">{day.day}</div>
                  {day.todoCount > 0 && (
                    <div className="todo-count">
                      {day.todoCount} todo{day.todoCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar">
            <div className="sidebar-header">
              <h3>
                {calendarState.selectedDate ? "Todos for" : "Select a date"}
              </h3>
              {calendarState.selectedDate && (
                <div className="sidebar-date">
                  {formatSelectedDate(calendarState.selectedDate)}
                </div>
              )}
            </div>

            <div className="sidebar-todos">
              {!calendarState.selectedDate ? (
                <div className="sidebar-empty">
                  Click on a date to see todos for that day
                </div>
              ) : selectedDateTodos.length === 0 ? (
                <div className="sidebar-empty">No todos for this date</div>
              ) : (
                selectedDateTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`sidebar-todo-item ${
                      todo.completed ? "completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => onToggleTodo(todo.id)}
                      className="sidebar-todo-checkbox"
                    />
                    <span className="sidebar-todo-text">{todo.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sectograph-column">
            {/* Sectograph for selected date */}
            {calendarState.selectedDate && (
              <Sectograph
                tasks={selectedDateTodos
                  .filter(
                    (todo) =>
                      todo.startTime !== undefined &&
                      todo.duration !== undefined
                  )
                  .map((todo) => ({
                    id: todo.id.toString(),
                    text: todo.text,
                    startTime: todo.startTime!,
                    duration: todo.duration!,
                    completed: todo.completed,
                  }))}
                selectedDate={new Date(calendarState.selectedDate)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
