import { useAppDispatch, useAppSelector } from "@/store";
import { addTodo, refreshTodos, removeTodo, reorderTodos, selectTodos, toggleTodo, updateTodo } from "@/store/slices/todoSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I_Todo } from "../../model/types/todo";

const useTodo = () => {
    const todos = useAppSelector(selectTodos);
    const dispatch = useAppDispatch()

    const onAddTodo = (title: I_Todo["title"]) => {
        dispatch(addTodo({ id: Number(new Date()), title, isCompleted: false }));
    };

    const onDeleteTodo = (id: I_Todo["id"]) => {
        dispatch(removeTodo(id));
    };

    const onCheckTodo = (id: I_Todo["id"]) => {
        dispatch(toggleTodo(id));
    };

    const onUpdateTodoTitle = (id: I_Todo["id"], title: I_Todo["title"]) => {
        dispatch(updateTodo({id, title}))
    };

    const onReorderTodos = (newOrder: I_Todo[]) => {
        dispatch(reorderTodos(newOrder));
    };

    const onRefresh = async () => {
        try {
            const persistedState = await AsyncStorage.getItem("persist:root");
            if (persistedState) {
                const parsedState = JSON.parse(persistedState);
                if (parsedState.todo) {
                    const todoState = JSON.parse(parsedState.todo);
                    if (todoState.todos && Array.isArray(todoState.todos)) {
                        dispatch(refreshTodos(todoState.todos));
                    }
                }
            }
        } catch (error) {
            console.error("Ошибка при обновлении данных:", error);
        }
    };

  const completedTodos = todos.filter((todo) => todo.isCompleted);

  return {
    onAddTodo,
    onDeleteTodo,
    onCheckTodo,
    onUpdateTodoTitle,
    onReorderTodos,
    onRefresh,
    todos,
    completedTodos,
  };
};

export default useTodo;