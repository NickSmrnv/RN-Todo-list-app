import { AddTodoModal } from "@/src/features/modals/AddTodoModal/AddTodoModal";
import { DateSlider } from "@/src/features/widgets/DateSlider/DateSlider";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import useTodo from "@/src/shared/lib/hooks/useTodo";
import { getTodayDate } from "@/src/shared/lib/obj/date";
import { TodoPriority } from "@/src/shared/model/types/todo";
import { Header } from "@/src/shared/ui/atom/Header/Header";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { TodoList } from "@/src/shared/ui/molecules/TodoList/TodoList";
import { useState } from "react";
import { RefreshControl, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(getTodayDate());

    const {
        todos,
        completedTodos,
        onAddTodo,
        onDeleteTodo,
        onCheckTodo,
        onUpdateTodoTitle,
        onReorderTodos,
        onRefresh,
        getTodosByDate,
      } = useTodo();

    const filteredTodos = getTodosByDate(selectedDate);
    const filteredCompletedTodos = filteredTodos.filter((todo) => todo.isCompleted);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    const handleAddTodo = (title: string, priority: TodoPriority) => {
        onAddTodo(title, selectedDate, priority);
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <View style={{ paddingTop: insets.top, ...style.container }}>
            <StatusBar barStyle={"dark-content"} />
            <ScrollView
                style={style.scrollView}
                contentContainerStyle={style.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                <Header
                    totalTodos={filteredTodos.length}
                    completedTodos={filteredCompletedTodos.length}
                    selectedDate={selectedDate}
                />
                <View style={style.dateSliderContainer}>
                    <DateSlider onDateChange={handleDateChange} />
                </View>
                <View style={style.content}>
                    <TodoList 
                        todos={filteredTodos} 
                        onCheckTodo={onCheckTodo} 
                        onDeleteTodo={onDeleteTodo} 
                        onUpdateTodo={onUpdateTodoTitle}
                        onReorderTodos={onReorderTodos}
                    />
                </View>
            </ScrollView>
            <View style={[style.fabContainer, { bottom: insets.bottom + 20 }]}>
                <CustomButton
                    icon="add"
                    iconSize={30}
                    iconColor={COLORS.black}
                    onPress={() => setIsAddModalOpen(true)}
                    style={style.fabButton}
                />
            </View>
            <AddTodoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddTodo}
            />
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
        width: "100%",
    },
    scrollContent: {
        flexGrow: 1,
    },
    dateSliderContainer: {
        width: "100%",
        paddingBottom: 10,
    },
    content: {
        width: "100%",
        flex: 1,
        paddingVertical: 10,
        backgroundColor: COLORS.blue,
    },
    fabContainer: {
        position: "absolute",
        right: 20,
    },
    fabButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        paddingHorizontal: 0,
        paddingVertical: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.white,
        elevation: 8,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});
