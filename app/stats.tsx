import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import useTodo from "@/src/shared/lib/hooks/useTodo";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StatsScreen() {
    const { colors, mode } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { todos, completedTodos } = useTodo();

    const totalTodos = todos.length;
    const totalCompleted = completedTodos.length;
    const completionRate =
        totalTodos > 0 ? Math.round((totalCompleted / totalTodos) * 100) : 0;

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    backgroundColor: colors.background,
                },
            ]}
        >
            <StatusBar
                barStyle={mode === "dark" ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />

            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[
                        styles.backButton
                    ]}
                    hitSlop={8}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={mode === "dark" ? COLORS.white : COLORS.black}
                    />
                </Pressable>
                <CustomText variant={"title"}>cтатистика</CustomText>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.firstRow}>
                    <View
                        style={[
                            styles.card,
                            styles.halfCard,
                            { backgroundColor: mode === "dark" ? colors.card : COLORS.white },
                        ]}
                    >
                        <CustomText variant={"subtitle"}>Всего задач</CustomText>
                        <CustomText variant={"title"}>{totalTodos}</CustomText>
                    </View>

                    <View
                        style={[
                            styles.card,
                            styles.halfCard,
                            { backgroundColor: mode === "dark" ? colors.card : COLORS.white },
                        ]}
                    >
                        <CustomText variant={"subtitle"}>Всего выполнено</CustomText>
                        <CustomText variant={"title"}>{totalCompleted}</CustomText>
                    </View>
                </View>

                <View
                    style={[
                        styles.card,
                        { backgroundColor: mode === "dark" ? colors.card : COLORS.white },
                    ]}
                >
                    <CustomText variant={"subtitle"}>Процент выполнения</CustomText>
                    <CustomText variant={"title"}>{completionRate}%</CustomText>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        gap: 10,
        alignItems: "baseline",
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 4,
    },
    scroll: {
        flex: 1,
        width: "100%",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 16,
    },
    firstRow: {
        flexDirection: "row",
        gap: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        gap: 6,
    },
    halfCard: {
        flex: 1,
    },
});


