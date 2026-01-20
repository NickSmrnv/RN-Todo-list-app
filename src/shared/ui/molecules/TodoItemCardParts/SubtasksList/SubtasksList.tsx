import React from "react";
import { Pressable, Text, View } from "react-native";
import { Animated as RNAnimated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { AppTheme } from "@/src/shared/lib/context/ThemeContext";
import { I_Todo } from "@/src/shared/model/types/todo";
import { CustomCheckbox } from "@/src/shared/ui/atom/_Custom/CustomCheckbox/CustomCheckbox";
import { styles } from "./SubtasksList.styles";

interface SubtasksListProps {
    subtasks?: I_Todo["subtasks"];
    isExpanded: boolean;
    subtasksOpacity: RNAnimated.Value;
    colors: AppTheme["colors"];
    mode: AppTheme["mode"];
    onCheckSubtask: (subtaskId: I_Todo["id"]) => void;
    onDeleteSubtask: (subtaskId: I_Todo["id"]) => void;
}

export const SubtasksList: React.FC<SubtasksListProps> = ({
    subtasks,
    isExpanded,
    subtasksOpacity,
    colors,
    mode,
    onCheckSubtask,
    onDeleteSubtask,
}) => {
    if (!subtasks || subtasks.length === 0) return null;

    return (
        <RNAnimated.View
            style={[
                styles.subtasksContainer,
                {
                    opacity: subtasksOpacity,
                },
            ]}
            pointerEvents={isExpanded ? "auto" : "none"}
        >
            {isExpanded &&
                subtasks.map((subtask, index) => (
                    <View
                        key={subtask.id}
                        style={[
                            styles.subtaskCard,
                            index > 0 && { marginTop: 6 },
                            subtask.isCompleted && styles.completedSubtaskCard,
                            {
                                backgroundColor: colors.card,
                                shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                                borderWidth: mode === "dark" ? 0.5 : 0,
                                borderColor:
                                    mode === "dark" ? COLORS.light_gray : "transparent",
                            },
                        ]}
                    >
                        <View style={styles.subtaskRow}>
                            <CustomCheckbox
                                checked={subtask.isCompleted}
                                onCheck={() => onCheckSubtask(subtask.id)}
                            />
                            <Text
                                style={[
                                    styles.subtaskText,
                                    { color: colors.text },
                                    subtask.isCompleted && styles.subtaskTextCompleted,
                                ]}
                            >
                                {subtask.title}
                            </Text>
                            <Pressable
                                onPress={() => onDeleteSubtask(subtask.id)}
                                hitSlop={6}
                                style={styles.subtaskDeleteButton}
                            >
                                <Ionicons
                                    name="close"
                                    size={16}
                                    color={mode === "dark" ? colors.text : COLORS.black}
                                />
                            </Pressable>
                        </View>
                    </View>
                ))}
        </RNAnimated.View>
    );
};
