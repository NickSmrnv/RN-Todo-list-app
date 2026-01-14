import { AddTodoModal } from "@/src/features/modals/AddTodoModal/AddTodoModal";
import { DateSlider } from "@/src/features/widgets/DateSlider/DateSlider";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
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
    const { colors, mode } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(getTodayDate());

    const {
        todos,
        completedTodos,
        onAddTodo,
        onDeleteTodo,
        onCheckTodo,
        onAddSubtask,
        onCheckSubtask,
        onDeleteSubtask,
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
        <View style={[style.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />
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
                <View style={[style.content, { backgroundColor: mode === "dark" ? colors.card : COLORS.blue }]}>
                    <TodoList 
                        todos={filteredTodos} 
                        onCheckTodo={onCheckTodo} 
                        onDeleteTodo={onDeleteTodo} 
                        onAddSubtask={onAddSubtask}
                        onCheckSubtask={onCheckSubtask}
                        onDeleteSubtask={onDeleteSubtask}
                        onUpdateTodo={onUpdateTodoTitle}
                        onReorderTodos={onReorderTodos}
                    />
                </View>
            </ScrollView>
            <View style={[style.fabContainer, { bottom: insets.bottom + 20 }]}>
                <CustomButton
                    icon="add"
                    iconSize={30}
                    iconColor={mode === "dark" ? COLORS.white : COLORS.black}
                    onPress={() => setIsAddModalOpen(true)}
                    style={{
                        ...style.fabButton,
                        backgroundColor: mode === "dark" ? colors.primary : COLORS.white,
                        shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                    }}
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
        elevation: 8,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});
