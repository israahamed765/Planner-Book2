export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: boolean;
  date: string;
  time?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  count: number;
  target: number;
  unit: string;
  colorClass?: string;
}

export interface QuickNote {
  text: string;
  labels: string[];
}

export interface Diary {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
}
