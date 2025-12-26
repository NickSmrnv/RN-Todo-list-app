import React from "react";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { I_Todo } from "../../../model/types/todo";
import { TodoItem } from "../../atom/TodoItem/TodoItem";

interface I_Todo_List {
    todos: I_Todo[];
    onCheckTodo: (id: I_Todo["id"]) => void;
    onDeleteTodo: (id: I_Todo["id"]) => void;
    onUpdateTodo: (id: I_Todo["id"], title: I_Todo["title"]) => void;
    onReorderTodos: (todos: I_Todo[]) => void;
}

export const TodoList: React.FC<I_Todo_List> = ({ 
    todos, 
    onCheckTodo, 
    onDeleteTodo, 
    onUpdateTodo,
    onReorderTodos
}) => {
    const renderItem = ({ item, drag, isActive }: RenderItemParams<I_Todo>) => {
        return (
            <ScaleDecorator activeScale={1.02}>
                <TodoItem
                    id={item.id}
                    title={item.title}
                    isCompleted={item.isCompleted}
                    onCheck={onCheckTodo}
                    onDelete={onDeleteTodo}
                    onUpdate={onUpdateTodo}
                    onLongPress={drag}
                    isDragging={isActive}
                />
            </ScaleDecorator>
        );
    };

    return (
        <DraggableFlatList
            data={todos}
            onDragEnd={({ data }) => onReorderTodos(data)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            animationConfig={{
                damping: 3,        // уменьшить с 20 (меньше затухания = быстрее)
                mass: 0.1,          // уменьшить с 0.2 (меньше массы = быстрее)
                stiffness: 50,     // увеличить с 100 (больше жесткости = быстрее)
            }}
        />
    );
};
