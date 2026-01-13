export type TodoPriority = "Низкий" | "Средний" | "Высокий";

export interface I_Todo {
    id: number;
    title: string;
    isCompleted: boolean;
    date?: Date | string; // Дата создания задачи
    priority?: TodoPriority; // Приоритет задачи
    /**
     * Вложенные подзадачи.
     * Хранятся рекурсивно как такие же I_Todo, но фактически используются только в связке с родительской задачей.
     */
    subtasks?: I_Todo[];
}