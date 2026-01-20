import { AddTodoModal } from "@/src/features/modals/AddTodoModal/AddTodoModal";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { KeyboardScrollContext } from "@/src/shared/lib/context/KeyboardScrollContext";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import useTodo from "@/src/shared/lib/hooks/useTodo";
// import { refreshIncompleteTodosReminder } from "@/src/shared/lib/notifications/reminders";
import { getTodayDate } from "@/src/shared/lib/obj/date";
import { TodoPriority } from "@/src/shared/model/types/todo";
import { Header } from "@/src/shared/ui/atom/Header/Header";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { DateSlider } from "@/src/widgets/DateSlider/DateSlider";
import { TodoListWidget } from "@/src/widgets/TodoListWidget/TodoListWidget";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_KEYBOARD_HEIGHT = 300;
const INPUT_PADDING_ABOVE_KEYBOARD = 24;

export default function Index() {
    const insets = useSafeAreaInsets();
    const { colors, mode } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(getTodayDate());

    const scrollViewRef = useRef<ScrollView>(null);
    const scrollYRef = useRef(0);
    const keyboardHeightRef = useRef(DEFAULT_KEYBOARD_HEIGHT);

    useEffect(() => {
        const sub = Keyboard.addListener("keyboardDidShow", (e) => {
            keyboardHeightRef.current = e.endCoordinates.height;
        });
        return () => sub.remove();
    }, []);

    const scrollToShowInput = useCallback((layout: { y: number; height: number }) => {
        const windowHeight = Dimensions.get("window").height;
        const keyboardHeight = keyboardHeightRef.current;
        const visibleBottom = windowHeight - keyboardHeight - INPUT_PADDING_ABOVE_KEYBOARD;
        if (layout.y + layout.height <= visibleBottom) return;
        const scrollDelta = layout.y + layout.height - visibleBottom;
        const newY = Math.max(0, scrollYRef.current + scrollDelta);
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: newY, animated: true });
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
                    <ScrollView
                        ref={scrollViewRef}
                        style={style.scrollView}
                        contentContainerStyle={style.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        onScroll={(e) => {
                            scrollYRef.current = e.nativeEvent.contentOffset.y;
                        }}
                        scrollEventThrottle={16}
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
                            <TodoListWidget
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
                            />
                        </View>
                    </ScrollView>
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
