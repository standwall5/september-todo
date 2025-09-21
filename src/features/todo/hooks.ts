import { useState } from "react";
import type { Todo } from "./types";

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");

  const addTodo = (dueDate?: string) => {
    if (inputText.trim() !== "") {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputText.trim(),
        completed: false,
        dueDate,
        createdAt: new Date().toISOString().split("T")[0], // Today's date
      };
      setTodos([...todos, newTodo]);
      setInputText("");
    }
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

  const todoStats = {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    remaining: todos.filter((todo) => !todo.completed).length,
  };

  return {
    todos,
    inputText,
    setInputText,
    addTodo,
    toggleTodo,
    deleteTodo,
    todoStats,
  };
};
