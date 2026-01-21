import { AddTodoModal } from "@/src/features/modals/AddTodoModal/AddTodoModal";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { KeyboardScrollContext } from "@/src/shared/lib/context/KeyboardScrollContext";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import useTodo from "@/src/shared/lib/hooks/useTodo";
// import { refreshIncompleteTodosReminder } from "@/src/shared/lib/notifications/reminders";
import { getTodayDate } from "@/src/shared/lib/obj/date";
import { I_Todo, TodoPriority } from "@/src/shared/model/types/todo";
import { Header } from "@/src/shared/ui/atom/Header/Header";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { DateSlider } from "@/src/widgets/DateSlider/DateSlider";
import { TodoListWidget } from "@/src/widgets/TodoListWidget/TodoListWidget";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_KEYBOARD_HEIGHT = 300;
const INPUT_PADDING_ABOVE_KEYBOARD = 24;

export default function Index() {
    const insets = useSafeAreaInsets();
    const { colors, mode } = useTheme();
    const params = useLocalSearchParams<{ date?: string; taskId?: string }>();
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(getTodayDate());

    const listRef = useRef<FlatList<I_Todo> | null>(null);
    const scrollYRef = useRef(0);
    const keyboardHeightRef = useRef(DEFAULT_KEYBOARD_HEIGHT);
    const lastScrolledTaskIdRef = useRef<string | null>(null);

    useEffect(() => {
        const sub = Keyboard.addListener("keyboardDidShow", (e) => {
            keyboardHeightRef.current = e.endCoordinates.height;
        });
        return () => sub.remove();
    }, []);

    useEffect(() => {
        const dateStr = typeof params?.date === "string" ? params.date : undefined;
        if (dateStr) setSelectedDate(new Date(dateStr));
    }, [params?.date]);

    const scrollToShowInput = useCallback((layout: { y: number; height: number }) => {
        const windowHeight = Dimensions.get("window").height;
        const keyboardHeight = keyboardHeightRef.current;
        const visibleBottom = windowHeight - keyboardHeight - INPUT_PADDING_ABOVE_KEYBOARD;
        if (layout.y + layout.height <= visibleBottom) return;
        const scrollDelta = layout.y + layout.height - visibleBottom;
        const newY = Math.max(0, scrollYRef.current + scrollDelta);
        setTimeout(() => {
            listRef.current?.scrollToOffset({ offset: newY, animated: true });
        }, 50);
    }, []);

    const {
        todos,
        completedTodos,
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
        getTodosByDate,
    } = useTodo();

    const filteredTodos = getTodosByDate(selectedDate);
    const filteredCompletedTodos = filteredTodos.filter((todo) => todo.isCompleted);

    useEffect(() => {
        if (!params?.taskId) return;
        const idx = filteredTodos.findIndex((t) => String(t.id) === params.taskId);
        if (idx < 0 || lastScrolledTaskIdRef.current === params.taskId) return;
        lastScrolledTaskIdRef.current = params.taskId;
        const id = setTimeout(() => {
            listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
        }, 150);
        return () => clearTimeout(id);
    }, [params?.taskId, filteredTodos]);

    // useEffect(() => {
    //     refreshIncompleteTodosReminder(todos);
    // }, [todos]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    const handleAddTodo = (
        title: string,
        priority: TodoPriority = "Средний"
    ) => {
        onAddTodo(title, selectedDate, priority);
    };


    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <View
            style={[
                style.container,
                { paddingTop: insets.top, backgroundColor: colors.background },
            ]}
            onTouchStart={() => {
                Keyboard.dismiss();
            }}
        >
            <StatusBar
                barStyle={mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />
            <KeyboardScrollContext.Provider value={{ scrollToShowInput }}>
                <KeyboardAvoidingView
                    style={style.keyboardAvoid}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                >
                    <View style={style.mainContent}>
                        <Header
                            totalTodos={filteredTodos.length}
                            completedTodos={filteredCompletedTodos.length}
                            selectedDate={selectedDate}
                        />
                        <View style={style.dateSliderContainer}>
                            <DateSlider
                                onDateChange={handleDateChange}
                                syncDateParam={typeof params?.date === "string" ? params.date : undefined}
                            />
                        </View>
                        <View style={[style.content, { backgroundColor: mode === "dark" ? colors.card : COLORS.blue }]}>
                            <TodoListWidget
                                ref={listRef}
                                todos={filteredTodos}
                                onCheckTodo={onCheckTodo}
                                onDeleteTodo={onDeleteTodo}
                                onAddSubtask={onAddSubtask}
                                onCheckSubtask={onCheckSubtask}
                                onDeleteSubtask={onDeleteSubtask}
                                onUpdateSubtask={onUpdateSubtask}
                                onUpdateTodo={onUpdateTodoTitle}
                                onReorderTodos={onReorderTodos}
                                onAddTodo={handleAddTodo}
                                onScroll={(e) => {
                                    scrollYRef.current = e.nativeEvent.contentOffset.y;
                                }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={handleRefresh}
                                    />
                                }
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </KeyboardScrollContext.Provider>
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
    keyboardAvoid: {
        flex: 1,
        width: "100%",
    },
    mainContent: {
        flex: 1,
        minHeight: 0,
        width: "100%",
    },
    dateSliderContainer: {
        width: "100%",
        paddingBottom: 10,
    },
    content: {
        width: "100%",
        flex: 1,
        minHeight: 0,
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
