import React from "react";
import { View } from "react-native";
import { I_Todo } from "../../../model/types/todo";
import { TodoItem } from "../../atom/TodoItem/TodoItem";

interface I_Todo_List {
    todos: I_Todo[];
    onCheckTodo: (id: I_Todo["id"]) => void;
    onDeleteTodo: (id: I_Todo["id"]) => void;
    onUpdateTodo: (id: I_Todo["id"], title: I_Todo["title"]) => void;
}

export const TodoList: React.FC<I_Todo_List> = ({ todos, onCheckTodo, onDeleteTodo, onUpdateTodo }) => {
    return (
        <View>
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    id={todo.id}
                    title={todo.title}
                    isCompleted={todo.isCompleted}
                    onCheck={onCheckTodo}
                    onDelete={onDeleteTodo}
                    onUpdate={onUpdateTodo}
                />
            ))}
        </View>
    );
};
