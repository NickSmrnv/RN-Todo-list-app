import { useAppDispatch, useAppSelector } from "@/store";
import { addSubtask, addTodo, refreshTodos, removeSubtask, removeTodo, reorderTodos, selectTodos, toggleSubtask, toggleTodo, updateSubtask, updateTodo } from "@/store/slices/todoSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I_Todo, TodoPriority } from "../../model/types/todo";
import { getTodayDate, isSameDate } from "../obj/date";

const useTodo = () => {
    const todos = useAppSelector(selectTodos);
    const dispatch = useAppDispatch()

    const onAddTodo = (title: I_Todo["title"], date?: Date, priority?: TodoPriority) => {
        const todoDate = date || getTodayDate();
        dispatch(addTodo({ 
            id: Number(new Date()), 
            title, 
            isCompleted: false,
            date: todoDate.toISOString(),
            priority: priority || "Средний"
        }));
    };

    const onDeleteTodo = (id: I_Todo["id"]) => {
        dispatch(removeTodo(id));
    };

    const onCheckTodo = (id: I_Todo["id"]) => {
        dispatch(toggleTodo(id));
    };

    const onAddSubtask = (parentId: I_Todo["id"], title: I_Todo["title"], priority?: TodoPriority) => {
        dispatch(
            addSubtask({
                parentId,
                subtask: {
                    id: Number(new Date()),
                    title,
                    isCompleted: false,
                    priority: priority || "Средний",
                },
            })
        );
    };

    const onCheckSubtask = (parentId: I_Todo["id"], subtaskId: I_Todo["id"]) => {
        dispatch(toggleSubtask({ parentId, subtaskId }));
    };

    const onDeleteSubtask = (parentId: I_Todo["id"], subtaskId: I_Todo["id"]) => {
        dispatch(removeSubtask({ parentId, subtaskId }));
    };

    const onUpdateSubtask = (
        parentId: I_Todo["id"],
        subtaskId: I_Todo["id"],
        title: I_Todo["title"],
        priority?: TodoPriority
    ) => {
        dispatch(updateSubtask({ parentId, subtaskId, title, priority }));
    };

    const onUpdateTodoTitle = (id: I_Todo["id"], title: I_Todo["title"], priority?: TodoPriority) => {
        dispatch(updateTodo({id, title, priority}))
    };

    const onUpdateTodoPriority = (id: I_Todo["id"], priority: TodoPriority) => {
        dispatch(updateTodo({id, priority}))
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

  const getTodosByDate = (date: Date) => {
    return todos.filter((todo) => {
      if (!todo.date) return false;
      const todoDate = typeof todo.date === 'string' ? new Date(todo.date) : todo.date;
      return isSameDate(todoDate, date);
    });
  };

  return {
    onAddTodo,
    onDeleteTodo,
    onCheckTodo,
    onAddSubtask,
    onCheckSubtask,
    onDeleteSubtask,
    onUpdateSubtask,
    onUpdateTodoTitle,
    onReorderTodos,
    onRefresh,
    todos,
    completedTodos,
    getTodosByDate,
  };
};

export default useTodo;