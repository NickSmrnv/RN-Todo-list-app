import React from "react";
import { View } from "react-native";
import { Animated as RNAnimated } from "react-native";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { AppTheme } from "@/src/shared/lib/context/ThemeContext";
import { I_Todo } from "@/src/shared/model/types/todo";
import { SubtaskRow } from "./SubtaskRow";
import { styles } from "./SubtasksList.styles";

interface SubtasksListProps {
    subtasks?: I_Todo["subtasks"];
    isExpanded: boolean;
    subtasksOpacity: RNAnimated.Value;
    colors: AppTheme["colors"];
    mode: AppTheme["mode"];
    onCheckSubtask: (subtaskId: I_Todo["id"]) => void;
    onRequestEditSubtask: (subtask: I_Todo) => void;
    onRequestDeleteSubtask: (subtask: I_Todo) => void;
    onUpdateSubtaskTitle: (subtaskId: I_Todo["id"], title: string) => void;
}

export const SubtasksList: React.FC<SubtasksListProps> = ({
    subtasks,
    isExpanded,
    subtasksOpacity,
    colors,
    mode,
    onCheckSubtask,
    onRequestEditSubtask,
    onRequestDeleteSubtask,
    onUpdateSubtaskTitle,
}) => {
    if (!subtasks || subtasks.length === 0) return null;

    const cardStyle = {
        backgroundColor: colors.card,
        shadowColor: mode === "dark" ? "#000000" : COLORS.black,
        borderWidth: mode === "dark" ? 0.5 : 0,
        borderColor: mode === "dark" ? COLORS.light_gray : "transparent",
    };

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
                    <View key={subtask.id} style={index > 0 ? { marginTop: 6 } : undefined}>
                        <SubtaskRow
                            subtask={subtask}
                            colors={colors}
                            mode={mode}
                            onCheckSubtask={onCheckSubtask}
                            onRequestEditSubtask={onRequestEditSubtask}
                            onRequestDeleteSubtask={onRequestDeleteSubtask}
                            onUpdateSubtaskTitle={onUpdateSubtaskTitle}
                            cardStyle={cardStyle}
                        />
                    </View>
                ))}
        </RNAnimated.View>
    );
};
