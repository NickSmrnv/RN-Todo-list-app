import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { AppTheme } from "@/src/shared/lib/context/ThemeContext";
import { getPriorityColor } from "@/src/shared/lib/obj/priority";
import { TodoPriority } from "@/src/shared/model/types/todo";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./PriorityMenuModal.styles";

interface AnchorPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface PriorityMenuModalProps {
    isOpen: boolean;
    anchorPosition?: AnchorPosition;
    priority?: TodoPriority;
    colors: AppTheme["colors"];
    mode: AppTheme["mode"];
    onSelect: (priority: TodoPriority) => void;
    onClose: () => void;
}

export const PriorityMenuModal: React.FC<PriorityMenuModalProps> = ({
    isOpen,
    anchorPosition,
    priority,
    colors,
    mode,
    onSelect,
    onClose,
}) => (
    <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
    >
        <Pressable style={styles.modalBackdrop} onPress={onClose}>
            {anchorPosition && (
                <View
                    style={[
                        styles.priorityMenu,
                        {
                            backgroundColor: colors.card,
                            borderColor: colors.primary,
                            shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                            top: anchorPosition.y + anchorPosition.height + 5,
                            left: anchorPosition.x,
                        },
                    ]}
                >
                    {(["Низкий", "Средний", "Высокий"] as TodoPriority[]).map(
                        (priorityOption) => (
                            <TouchableOpacity
                                key={priorityOption}
                                onPress={() => onSelect(priorityOption)}
                                style={[
                                    styles.priorityMenuItem,
                                    priority === priorityOption && {
                                        backgroundColor: colors.primary + "20",
                                    },
                                ]}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.priorityDot,
                                        {
                                            backgroundColor: getPriorityColor(priorityOption),
                                        },
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.priorityMenuItemText,
                                        { color: colors.text },
                                    ]}
                                >
                                    {priorityOption}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            )}
        </Pressable>
    </Modal>
);
