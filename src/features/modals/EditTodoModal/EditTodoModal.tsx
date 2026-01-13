import { I_Todo, TodoPriority } from "@/src/shared/model/types/todo";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { CustomModal } from "@/src/shared/ui/atom/_Custom/CustomModal/CustomModal";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import { CustomTextInput } from "@/src/shared/ui/atom/_Custom/CustomTextInput/CustomTextInput";
import { PrioritySelector } from "@/src/shared/ui/atom/PrioritySelector/PrioritySelector";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

interface I_Edit_Todo_Modal {
    title: I_Todo["title"],
    priority?: TodoPriority,
    onClose: () => void;
    onUpdate: (title: I_Todo["title"], priority?: TodoPriority) => void;
    isOpen: boolean;
}

export const EditTodoModal: React.FC<I_Edit_Todo_Modal> = ({ isOpen, title, priority = "Средний", onClose, onUpdate }) => {
    const [updateTitle, setUpdateTitle] = useState(title);
    const [updatePriority, setUpdatePriority] = useState<TodoPriority>(priority);
    const [inputError, setInputError] = useState(false)

    const onPressSave = () => {
        if (!updateTitle) {
            setInputError(true)
            return
        }
        onUpdate(updateTitle, updatePriority);
        onClose();
    }

    useEffect(() => {
        if (inputError && updateTitle) {
            setInputError(false);
        }
    }, [updateTitle]);

    useEffect(() => {
        setUpdateTitle(title);
        setUpdatePriority(priority);
    }, [isOpen, title, priority])

    return (

        <CustomModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContent}>
                <CustomText variant={"title"}>Изменить задачу</CustomText>

                <View style={styles.inputContainer}>
                    <CustomTextInput 
                        value={updateTitle} 
                        onChangeText={setUpdateTitle}
                        placeholder={"Введите название задачи..."} 
                        isError={inputError}
                    />
                </View>

                <View style={styles.priorityContainer}>
                    <PrioritySelector 
                        selectedPriority={updatePriority} 
                        onPriorityChange={setUpdatePriority} 
                    />
                </View>

                <View style={styles.buttonsContainer}>
                    <CustomButton label={"Отмена"} onPress={onClose} />
                    <CustomButton variant={"secondary"} label={"Сохранить"} onPress={onPressSave} disabled={inputError} />
                </View>
            </View>
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        gap: 10,
    },

    inputContainer: {
        minHeight: 50,
    },

    priorityContainer: {
        gap: 10,
    },

    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 10,
    }
})