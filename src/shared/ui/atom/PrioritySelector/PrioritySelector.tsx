import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { TodoPriority } from "@/src/shared/model/types/todo";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface I_Priority_Selector {
    selectedPriority: TodoPriority;
    onPriorityChange: (priority: TodoPriority) => void;
}

const priorities: TodoPriority[] = ["Низкий", "Средний", "Высокий"];

const getPriorityColor = (priority: TodoPriority): string => {
    switch (priority) {
        case "Низкий":
            return COLORS.green;
        case "Средний":
            return COLORS.blue;
        case "Высокий":
            return COLORS.pink;
        default:
            return COLORS.blue;
    }
};

export const PrioritySelector: React.FC<I_Priority_Selector> = ({
    selectedPriority,
    onPriorityChange,
}) => {
    return (
        <View style={styles.container}>
            {priorities.map((priority) => {
                const isSelected = priority === selectedPriority;
                const backgroundColor = getPriorityColor(priority);
                
                return (
                    <TouchableOpacity
                        key={priority}
                        style={[
                            styles.priorityButton,
                            { backgroundColor },
                            isSelected && styles.selectedButton,
                        ]}
                        onPress={() => onPriorityChange(priority)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.priorityText,
                                isSelected && styles.selectedText,
                            ]}
                        >
                            {priority}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 8,
    },
    priorityButton: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 7,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "transparent",
        minHeight: 10,
    },
    selectedButton: {
        borderColor: COLORS.black,
        borderWidth: 1,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        transform: [{ scale: 1.05 }],
    },
    priorityText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "600",
    },
    selectedText: {
        fontWeight: "700",
        fontSize: 13,
    },
});

