import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { CustomPopup, I_Popup_Item } from "@/src/shared/ui/atom/_Custom/CustomPopup/CustomPopup";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface I_Todo_Item_Menu {
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAddSubtask: () => void;
    anchorPosition?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export const TodoItemMenu: React.FC<I_Todo_Item_Menu> = ({
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onAddSubtask,
    anchorPosition,
}) => {
    const handleEdit = () => {
        onClose();
        onEdit();
    };

    const handleDelete = () => {
        onClose();
        onDelete();
    };

    const handleAddSubtask = () => {
        onClose();
        onAddSubtask();
    };

    const popupItems: I_Popup_Item[] = [
        {
            id: "add-subtask",
            content: (
                <View style={styles.menuItemContent}>
                    <Ionicons name="add-circle-outline" size={18} color={COLORS.blue} />
                    <Text style={styles.menuItemText}>Добавить подзадачу</Text>
                </View>
            ),
            onPress: handleAddSubtask,
        },
        {
            id: "edit",
            content: (
                <View style={styles.menuItemContent}>
                    <Ionicons name="pencil" size={18} color={COLORS.black} />
                    <Text style={styles.menuItemText}>Редактировать</Text>
                </View>
            ),
            onPress: handleEdit,
        },
        {
            id: "delete",
            content: (
                <View style={styles.menuItemContent}>
                    <Ionicons name="trash" size={18} color={COLORS.pink} />
                    <Text style={[styles.menuItemText, styles.menuItemTextDelete]}>Удалить</Text>
                </View>
            ),
            onPress: handleDelete,
        },
    ];

    if (!isOpen || !anchorPosition) return null;

    const popupStyle = {
        top: anchorPosition.y + anchorPosition.height + 4,
        left: anchorPosition.x + anchorPosition.width - 180,
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable 
                style={styles.modalContainer} 
                onPress={onClose}
            >
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <CustomPopup
                        isOpen={isOpen}
                        items={popupItems}
                        style={popupStyle}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "transparent",
    },
    menuItemContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    menuItemText: {
        fontSize: 14,
        color: COLORS.black,
    },
    menuItemTextDelete: {
        color: COLORS.pink,
    },
});

