import { DeleteTodoModal } from "@/src/features/modals/DeleteTodoModal/DeleteTodoModal";
import { EditTodoModal } from "@/src/features/modals/EditTodoModal/EditTodoModal";
import { I_Todo } from "@/src/shared/model/types/todo";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import { COLORS } from "../../../assets/styles/constants/colors-variables";
import { CustomButton } from "../_Custom/CustomButton/CustomButton";
import { CustomCheckbox } from "../_Custom/CustomCheckbox/CustomCheckbox";

interface I_Todo_Item extends I_Todo {
    onCheck: (id: I_Todo["id"]) => void;
    onDelete: (id: I_Todo["id"]) => void;
    onUpdate: (id: I_Todo["id"], title: I_Todo["title"]) => void;
    onLongPress?: () => void;
    isDragging?: boolean;
}

export const TodoItem: React.FC<I_Todo_Item> = ({ 
    id, 
    title, 
    isCompleted, 
    onCheck, 
    onDelete, 
    onUpdate,
    onLongPress,
    isDragging = false
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const onPressCheck = () => {
        onCheck(id);
    };

    const onConfirmDelete = () => {
        setIsDeleteModalOpen(false);
        onDelete(id);
        Vibration.vibrate(100)
    }

    return (
        <View style={[styles.container, isDragging && styles.draggingContainer]}>
            <Pressable 
                style={styles.checkTitleContainer} 
                onPress={onPressCheck}
                onLongPress={onLongPress}
            >
                <CustomCheckbox checked={isCompleted} onCheck={onPressCheck}/>
                <Text
                    style={{
                        flex: 1,
                        flexShrink: 1,
                        textDecorationLine: isCompleted
                            ? "line-through"
                            : "none",
                    }}
                >
                    {title}
                </Text>
            </Pressable>

            <View style={styles.controlContainer}>
                <CustomButton icon="pencil" size="small" iconSize={16} onPress={() => setIsEditModalOpen(true)}/>
                <EditTodoModal title={title} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={(title) => onUpdate(id, title)} />

                <CustomButton variant={"delete"} icon="trash" size="small" iconSize={16} onPress={() => setIsDeleteModalOpen(true)}/>
                <DeleteTodoModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onDelete={onConfirmDelete}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginVertical: 8,
        borderRadius: 15,
        backgroundColor: COLORS.white,
    },
    checkTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },

    controlContainer: {
        flexDirection: "row",
        gap: 5,
    },
    draggingContainer: {
        opacity: 0.5,
        transform: [{ scale: 1.05 }],
    },
});
