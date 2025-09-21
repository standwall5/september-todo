export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO date string
  startTime?: number; // Hour in 24-hour format (0-23)
  duration?: number; // Duration in hours
}

export interface TodoStats {
  total: number;
  completed: number;
  remaining: number;
}

export interface TodosByDate {
  [date: string]: Todo[]; // date in YYYY-MM-DD format
}
