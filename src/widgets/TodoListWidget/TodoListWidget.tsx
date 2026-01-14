import React from "react";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";
import { I_Todo, TodoPriority } from "@/src/shared/model/types/todo";
import { TodoItemCard } from "@/src/widgets/TodoItemCard/TodoItemCard";

interface I_Todo_List {
    todos: I_Todo[];
    onCheckTodo: (id: I_Todo["id"]) => void;
    onDeleteTodo: (id: I_Todo["id"]) => void;
    onUpdateTodo: (id: I_Todo["id"], title: I_Todo["title"], priority?: TodoPriority) => void;
    onReorderTodos: (todos: I_Todo[]) => void;
    onAddSubtask: (parentId: I_Todo["id"], title: I_Todo["title"], priority?: TodoPriority) => void;
    onCheckSubtask: (parentId: I_Todo["id"], subtaskId: I_Todo["id"]) => void;
    onDeleteSubtask: (parentId: I_Todo["id"], subtaskId: I_Todo["id"]) => void;
}

export const TodoListWidget: React.FC<I_Todo_List> = ({
    todos,
    onCheckTodo,
    onDeleteTodo,
    onUpdateTodo,
    onReorderTodos,
    onAddSubtask,
    onCheckSubtask,
    onDeleteSubtask,
}) => {
    const renderItem = ({ item, drag, isActive }: RenderItemParams<I_Todo>) => {
        return (
            <ScaleDecorator activeScale={1.02}>
                <TodoItemCard
                    id={item.id}
                    title={item.title}
                    isCompleted={item.isCompleted}
                    priority={item.priority}
                    subtasks={item.subtasks}
                    onCheck={onCheckTodo}
                    onDelete={onDeleteTodo}
                    onUpdate={onUpdateTodo}
                    onAddSubtask={onAddSubtask}
                    onCheckSubtask={onCheckSubtask}
                    onDeleteSubtask={onDeleteSubtask}
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
                damping: 3,
                mass: 0.1,
                stiffness: 50,
            }}
        />
    );
};


