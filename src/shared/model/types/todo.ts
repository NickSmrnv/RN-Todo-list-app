export type TodoPriority = "Низкий" | "Средний" | "Высокий";

export interface I_Todo {
    id: number;
    title: string;
    isCompleted: boolean;
    date?: Date | string; // Дата создания задачи
    priority?: TodoPriority; // Приоритет задачи
}