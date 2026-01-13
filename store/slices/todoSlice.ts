import { I_Todo } from "@/src/shared/model/types/todo";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface I_Todo_State {
    todos: I_Todo[],
}

const initialState: I_Todo_State = {
    todos:   [
        {
            id: 1,
            title: "Купить молоко",
            isCompleted: false,
            subtasks: [],
        },
        {
            id: 2,
            title: "Купить хлеб",
            isCompleted: false,
            subtasks: [],
        },
        {
            id: 3,
            title: "Купить яйца",
            isCompleted: false,
            subtasks: [],
        },
    ]
}

export const todoSlice = createSlice({
    name: "todo",
    initialState,
    reducers: {
        addTodo: (
            state: I_Todo_State,
            action: PayloadAction<I_Todo>
        ) => {
            const todo = action.payload;
            state.todos.unshift({
                ...todo,
                subtasks: todo.subtasks ?? [],
            });
        },

        removeTodo: (
            state: I_Todo_State,
            action: PayloadAction<number>
        ) => {
            const id = action.payload;
            state.todos = state.todos.filter((todo) => todo.id !== id);
        },

        toggleTodo: (
            state: I_Todo_State,
            action: PayloadAction<number>
        ) => {
            const id = action.payload;
            state.todos = state.todos.map((todo) => {
                if (todo.id !== id) return todo;

                const nextCompleted = !todo.isCompleted;

                // Если отмечаем основную задачу выполненной — отмечаем и все её подзадачи
                const updatedSubtasks =
                    nextCompleted && todo.subtasks
                        ? todo.subtasks.map((subtask) => ({
                            ...subtask,
                            isCompleted: true,
                        }))
                        : todo.subtasks;

                return {
                    ...todo,
                    isCompleted: nextCompleted,
                    subtasks: updatedSubtasks,
                };
            });
            state.todos.sort((a, b) => {
                if (a.isCompleted === b.isCompleted) return 0;
                return a.isCompleted ? 1 : -1;
            });
        },

        addSubtask: (
            state: I_Todo_State,
            action: PayloadAction<{ parentId: number; subtask: I_Todo }>
        ) => {
            const { parentId, subtask } = action.payload;
            const parentTodo = state.todos.find((todo) => todo.id === parentId);
            if (!parentTodo) return;

            if (!parentTodo.subtasks) {
                parentTodo.subtasks = [];
            }

            parentTodo.subtasks.unshift({
                ...subtask,
                subtasks: subtask.subtasks ?? [],
            });
        },

        toggleSubtask: (
            state: I_Todo_State,
            action: PayloadAction<{ parentId: number; subtaskId: number }>
        ) => {
            const { parentId, subtaskId } = action.payload;
            const parentTodo = state.todos.find((todo) => todo.id === parentId);
            if (!parentTodo || !parentTodo.subtasks) return;

            parentTodo.subtasks = parentTodo.subtasks.map((subtask) =>
                subtask.id === subtaskId
                    ? { ...subtask, isCompleted: !subtask.isCompleted }
                    : subtask
            );
        },

        removeSubtask: (
            state: I_Todo_State,
            action: PayloadAction<{ parentId: number; subtaskId: number }>
        ) => {
            const { parentId, subtaskId } = action.payload;
            const parentTodo = state.todos.find((todo) => todo.id === parentId);
            if (!parentTodo || !parentTodo.subtasks) return;

            parentTodo.subtasks = parentTodo.subtasks.filter(
                (subtask) => subtask.id !== subtaskId
            );
        },

        updateTodo: (
            state: I_Todo_State,
            action: PayloadAction<{ id: number; title?: string; priority?: I_Todo["priority"] }>
        ) => {
            const { id, title, priority } = action.payload;
            state.todos = state.todos.map((todo) => 
                todo.id === id 
                    ? { ...todo, ...(title !== undefined && { title }), ...(priority !== undefined && { priority }) }
                    : todo
            );
        },

        refreshTodos: (
            state: I_Todo_State,
            action: PayloadAction<I_Todo[]>
        ) => {
            state.todos = action.payload;
        },

        reorderTodos: (
            state: I_Todo_State,
            action: PayloadAction<I_Todo[]>
        ) => {
            state.todos = action.payload;
        },
    }
})

export const { 
    addTodo, 
    removeTodo, 
    toggleTodo, 
    updateTodo, 
    refreshTodos, 
    reorderTodos,
    addSubtask,
    toggleSubtask,
    removeSubtask,
} = todoSlice.actions;

export const selectTodos = (state: { todo: I_Todo_State }): I_Todo_State["todos"] => state.todo.todos

export default todoSlice.reducer;



