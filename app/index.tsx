import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import useTodo from "@/src/shared/lib/hooks/useTodo";
import { Header } from "@/src/shared/ui/atom/Header/Header";
import { TodoList } from "@/src/shared/ui/molecules/TodoList/TodoList";
import { useState } from "react";
import { RefreshControl, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);

    const {
        todos,
        completedTodos,
        onAddTodo,
        onDeleteTodo,
        onCheckTodo,
        onUpdateTodoTitle,
        onRefresh,
      } = useTodo();

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
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
                    totalTodos={todos.length}
                    completedTodos={completedTodos.length}
                    onAddTodo={onAddTodo}
                />

                <View style={style.content}>
                    <TodoList todos={todos} onCheckTodo={onCheckTodo} onDeleteTodo={onDeleteTodo} onUpdateTodo={onUpdateTodoTitle} />
                </View>
            </ScrollView>
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
    content: {
        width: "100%",
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.blue,
    },
});
