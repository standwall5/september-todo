import React, { createContext, useContext, useState } from "react";
import type { Todo } from "../features/todo/types";

interface TodoContextType {
  todos: Todo[];
  inputText: string;
  setInputText: (text: string) => void;
  addTodo: (
    dueDate?: string,
    startTime?: number,
    duration?: number
  ) => Promise<{ success: boolean; error?: string }>;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  importTodos: (importedTodos: Todo[]) => Promise<void>;
  todoStats: {
    total: number;
    completed: number;
    remaining: number;
  };
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodoContext must be used within TodoProvider");
  }
  return context;
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");

  const addTodo = async (
    dueDate?: string,
    startTime?: number,
    duration?: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (inputText.trim() === "") {
      return { success: false, error: "Please enter a task description" };
    }

    // Check for time conflicts if startTime and duration are provided
    if (startTime !== undefined && duration !== undefined) {
      const taskDate = dueDate || new Date().toISOString().split("T")[0];
      const newEndTime = startTime + duration;

      // Check against existing todos for the same date
      const conflictingTodo = todos.find((todo) => {
        if (!todo.startTime || !todo.duration) return false;

        const todoDate = todo.dueDate || todo.createdAt;
        if (todoDate !== taskDate) return false;

        const existingEndTime = todo.startTime + todo.duration;

        // Check for time overlap
        return (
          (startTime >= todo.startTime && startTime < existingEndTime) ||
          (newEndTime > todo.startTime && newEndTime <= existingEndTime) ||
          (startTime <= todo.startTime && newEndTime >= existingEndTime)
        );
      });

      if (conflictingTodo) {
        const conflictEndTime =
          conflictingTodo.startTime! + conflictingTodo.duration!;
        return {
          success: false,
          error: `Time conflict with "${conflictingTodo.text}" (${conflictingTodo.startTime}:00 - ${conflictEndTime}:00)`,
        };
      }
    }

    const newTodo: Todo = {
      id: Date.now(),
      text: inputText.trim(),
      completed: false,
      dueDate,
      createdAt: new Date().toISOString().split("T")[0],
      startTime,
      duration,
    };

    setTodos([...todos, newTodo]);
    setInputText("");
    return { success: true };
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const importTodos = async (importedTodos: Todo[]): Promise<void> => {
    // Validate and sanitize imported todos
    const validTodos = importedTodos.filter(
      (todo) =>
        todo &&
        typeof todo.id === "number" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean"
    );

    // Update IDs to avoid conflicts with existing todos
    const maxId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) : 0;
    const sanitizedTodos = validTodos.map((todo, index) => ({
      ...todo,
      id: maxId + index + 1,
    }));

    // Merge with existing todos
    setTodos((prevTodos) => [...prevTodos, ...sanitizedTodos]);
  };

  const todoStats = {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    remaining: todos.filter((todo) => !todo.completed).length,
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        inputText,
        setInputText,
        addTodo,
        toggleTodo,
        deleteTodo,
        importTodos,
        todoStats,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
