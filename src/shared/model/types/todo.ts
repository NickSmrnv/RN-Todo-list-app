export interface I_Todo {
    id: number;
    title: string;
    isCompleted: boolean;
    date?: Date | string; // Дата создания задачи
}