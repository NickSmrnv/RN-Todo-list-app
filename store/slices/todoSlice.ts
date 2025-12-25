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
        },
        {
            id: 2,
            title: "Купить хлеб",
            isCompleted: false,
        },
        {
            id: 3,
            title: "Купить яйца",
            isCompleted: false,
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
            state.todos.unshift(todo);
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
            state.todos = state.todos.map((todo) => todo.id === id ? { ...todo, isCompleted: !todo.isCompleted }: todo);
            state.todos.sort((a, b) => {
                if (a.isCompleted === b.isCompleted) return 0;
                return a.isCompleted ? 1 : -1;
            });
        },

        updateTodo: (
            state: I_Todo_State,
            action: PayloadAction<{ id: number; title: string }>
        ) => {
            const { id, title } = action.payload;
            state.todos = state.todos.map((todo) => todo.id === id ? { ...todo, title }: todo);
        },

        refreshTodos: (
            state: I_Todo_State,
            action: PayloadAction<I_Todo[]>
        ) => {
            state.todos = action.payload;
        },
    }
})

export const { addTodo, removeTodo, toggleTodo, updateTodo, refreshTodos } = todoSlice.actions;

export const selectTodos = (state: { todo: I_Todo_State }): I_Todo_State["todos"] => state.todo.todos

export default todoSlice.reducer;



