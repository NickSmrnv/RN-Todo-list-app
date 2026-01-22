import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import useTodo from "@/src/shared/lib/hooks/useTodo";
import { getShortDateLabel, isOverdue } from "@/src/shared/lib/obj/date";
import { I_Todo } from "@/src/shared/model/types/todo";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import { CalendarMonthView } from "@/src/shared/ui/molecules/CalendarMonthView/CalendarMonthView";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    Dimensions,
    FlatList,
    Pressable,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CALENDAR_PADDING = 16;
const CELL_SIZE = (SCREEN_WIDTH - CALENDAR_PADDING * 2) / 7;
const CALENDAR_ITEM_HEIGHT = 16 + 22 + 20 + 5 * CELL_SIZE;

const getDatesWithTasksForMonth = (todos: I_Todo[], year: number, month: number): Set<string> => {
    const set = new Set<string>();
    todos.forEach((t) => {
        if (t.isCompleted || !t.date) return;
        const d = typeof t.date === "string" ? new Date(t.date) : t.date;
        if (d.getFullYear() === year && d.getMonth() === month) {
            set.add(`${year}-${month}-${d.getDate()}`);
        }
    });
    return set;
};

const getMonthItems = (): { year: number; month: number; id: string }[] => {
    const items: { year: number; month: number; id: string }[] = [];
    const start = new Date();
    start.setMonth(start.getMonth() - 24);
    for (let i = 0; i < 48; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        items.push({ year: d.getFullYear(), month: d.getMonth(), id: `${d.getFullYear()}-${d.getMonth()}` });
    }
    return items;
};

const MONTH_ITEMS = getMonthItems();
const INITIAL_INDEX = 24;

export const CalendarScreen = () => {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { todos } = useTodo();

    const activeTodos = useMemo(() => todos.filter((t) => !t.isCompleted), [todos]);

    const sortedActiveTodos = useMemo(() => {
        return [...activeTodos].sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            const ta = typeof a.date === "string" ? new Date(a.date) : a.date;
            const tb = typeof b.date === "string" ? new Date(b.date) : b.date;
            return ta.getTime() - tb.getTime();
        });
    }, [activeTodos]);

    const renderMonth = ({ item }: { item: (typeof MONTH_ITEMS)[0] }) => {
        const datesWithTasks = getDatesWithTasksForMonth(activeTodos, item.year, item.month);
        return (
            <View style={{
                width: SCREEN_WIDTH,
                height: CALENDAR_ITEM_HEIGHT,
                paddingHorizontal: CALENDAR_PADDING,
            }}>
                <CalendarMonthView
                    year={item.year}
                    month={item.month}
                    datesWithTasks={datesWithTasks}
                    cellSize={CELL_SIZE}
                    onDatePress={handleDatePress}
                />
            </View>
        );
    };

    const handleDatePress = (date: Date) => {
        router.replace(`/?date=${encodeURIComponent(date.toISOString())}`);
    };

    const handleTaskPress = (item: I_Todo) => {
        const raw = item.date;
        const dateObj = raw ? (typeof raw === "string" ? new Date(raw) : raw) : null;
        const dateParam = dateObj ? dateObj.toISOString() : new Date().toISOString();
        const q = `date=${encodeURIComponent(dateParam)}&taskId=${encodeURIComponent(String(item.id))}`;
        router.replace(`/?${q}`);
    };

    const renderTask = ({ item }: { item: I_Todo }) => {
        const raw = item.date;
        const dateObj = raw ? (typeof raw === "string" ? new Date(raw) : raw) : null;
        const dateStr = dateObj ? getShortDateLabel(dateObj) : "—";
        const overdue = dateObj ? isOverdue(dateObj) : false;
        const dateColor = !dateObj ? colors.mutedText : overdue ? "#E53935" : COLORS.dark_green;

        return (
            <Pressable
                onPress={() => handleTaskPress(item)}
                style={[
                    styles.taskRow,
                    {
                        backgroundColor: mode === "dark" ? colors.card : COLORS.white,
                        borderColor: mode === "dark" ? colors.border : COLORS.light_gray,
                    },
                ]}
            >
                <CustomText variant="primary" style={styles.taskTitle} numberOfLines={1}>
                    {item.title}
                </CustomText>

                <CustomText variant="small" style={[styles.taskDate, { color: dateColor }]}>
                    {dateStr}
                </CustomText>
            </Pressable>
        );
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    backgroundColor: colors.background,
                },
            ]}
        >
            <StatusBar
                barStyle={mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={mode === "dark" ? COLORS.white : COLORS.black}
                    />
                </Pressable>
                <CustomText variant="title">календарь</CustomText>
            </View>

            <View style={styles.calendarSection}>
                <FlatList
                    data={MONTH_ITEMS}
                    renderItem={renderMonth}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
                    initialScrollIndex={INITIAL_INDEX}
                />
            </View>

            <View style={[styles.listSection, { borderTopColor: colors.border }]}>
                <CustomText variant="subtitle" style={styles.listTitle}>
                    Активные задачи
                </CustomText>

                <FlatList
                    data={sortedActiveTodos}
                    renderItem={renderTask}
                    keyExtractor={(t) => String(t.id)}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <CustomText variant="small" style={{ color: colors.mutedText, textAlign: "center", marginTop: 16 }}>
                            Нет активных задач
                        </CustomText>
                    }
                />
            </View>
        </View>
    );
};

export default CalendarScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 12,
        paddingHorizontal: 25,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    calendarSection: {
        flex: 1,
    },
    listSection: {
        flex: 1,
        minHeight: 0,
        paddingHorizontal: 16,
        paddingTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "transparent",
        overflow: "visible",
    },
    listTitle: {
        marginBottom: 14,
    },
    listContent: {
        paddingBottom: 16,
    },
    taskRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    taskTitle: {
        flex: 1,
        marginRight: 12,
    },
    taskDate: {
        flexShrink: 0,
    },
});
