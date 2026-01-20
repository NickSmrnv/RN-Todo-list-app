import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CARD_PLACEHOLDER_WIDTH = 24 + 10; // checkbox size + gap

interface AddTodoButtonProps {
    onPress: () => void;
}

export const AddTodoButton: React.FC<AddTodoButtonProps> = ({ onPress }) => {
    const { colors, mode } = useTheme();

    const cardBg =
        mode === "dark" ? "rgba(26, 35, 50, 0.9)" : "rgba(245, 247, 250, 1)";
    const textColor = mode === "dark" ? colors.mutedText : "#6B7280";
    const iconColor = mode === "dark" ? colors.primary : COLORS.blue;

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: cardBg,
                    shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                    borderWidth: mode === "dark" ? 0.5 : 1,
                    borderColor:
                        mode === "dark"
                            ? "rgba(148, 163, 184, 0.25)"
                            : "rgba(0, 0, 0, 0.06)",
                },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.row}>
                <View style={styles.checkTitleContainer}>
                    <View style={[styles.plusWrap, { borderColor: iconColor }]}>
                        <Ionicons name="add" size={16} color={iconColor} />
                    </View>
                    <Text style={[styles.label, { color: textColor }]}>
                        Добавить задачу
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        paddingVertical: 15,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 15,
        overflow: "visible",
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    checkTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    plusWrap: {
        width: 20,
        height: 20,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: 14,
    },
});
