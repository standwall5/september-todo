import React, { useState } from "react";
import { useTodoContext } from "../../contexts/TodoContext";
import { Sectograph } from "../../components/Sectograph";
import { useAudio } from "../../hooks/useAudio";
import "./TodoPage.css";

const TodoPage: React.FC = () => {
  const {
    todos,
    inputText,
    setInputText,
    addTodo,
    toggleTodo,
    deleteTodo,
    todoStats,
  } = useTodoContext();

  const { playTodoAdd, playTodoComplete, playTodoDelete, playButtonHover } =
    useAudio();

  const [startTime, setStartTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleTimeChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      // Clear error when user changes time inputs
      if (errorMessage) {
        setErrorMessage("");
      }
    };

  const handleAddTodo = async () => {
    setErrorMessage(""); // Clear any previous error

    const startTimeNum = startTime ? parseInt(startTime) : undefined;
    const durationNum = duration ? parseFloat(duration) : undefined;

    const result = await addTodo(undefined, startTimeNum, durationNum);

    if (result.success) {
      playTodoAdd();
      setStartTime("");
      setDuration("");
    } else {
      setErrorMessage(result.error || "Failed to add todo");
      // Play error sound (we can reuse the delete sound for errors)
      playTodoDelete();
    }
  };

  const handleToggleTodo = (id: number) => {
    toggleTodo(id);
    playTodoComplete();
  };

  const handleDeleteTodo = (id: number) => {
    deleteTodo(id);
    playTodoDelete();
  };

  return (
    <div className="todo-page">
      <div className="todo-container">
        <h1>September Todo List</h1>

        <div className="todo-input-section">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          <div className="time-inputs">
            <input
              type="number"
              value={startTime}
              onChange={handleTimeChange(setStartTime)}
              placeholder="Start (0-23)"
              min="0"
              max="23"
              className="time-input"
            />
            <input
              type="number"
              value={duration}
              onChange={handleTimeChange(setDuration)}
              placeholder="Hours"
              min="0.5"
              max="24"
              step="0.5"
              className="time-input"
            />
          </div>
          <button
            onClick={handleAddTodo}
            onMouseEnter={playButtonHover}
            className="add-btn"
          >
            Add Todo
          </button>
        </div>

        {errorMessage && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {errorMessage}
          </div>
        )}

        <div className="todo-content">
          <div className="todo-list-section">
            <div className="todo-list">
              {todos.length === 0 ? (
                <p className="empty-state">No todos yet. Add one above!</p>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`todo-item ${todo.completed ? "completed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="todo-checkbox"
                    />
                    <span className="todo-text">
                      {todo.text}
                      {todo.startTime !== undefined && (
                        <span className="todo-time">
                          {" "}
                          ({todo.startTime}:00 -{" "}
                          {todo.startTime + (todo.duration || 1)}:00)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      onMouseEnter={playButtonHover}
                      className="delete-btn"
                    >
                      ❌
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="todo-stats">
              <p>
                Total: {todoStats.total} | Completed: {todoStats.completed} |
                Remaining: {todoStats.remaining}
              </p>
            </div>
          </div>

          <div className="todo-sectograph-section">
            <Sectograph
              tasks={todos
                .filter(
                  (todo) =>
                    todo.startTime !== undefined && todo.duration !== undefined
                )
                .map((todo) => ({
                  id: todo.id.toString(),
                  text: todo.text,
                  startTime: todo.startTime!,
                  duration: todo.duration!,
                  completed: todo.completed,
                }))}
              selectedDate={new Date()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
