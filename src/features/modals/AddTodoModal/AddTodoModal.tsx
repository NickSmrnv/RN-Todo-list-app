import { I_Todo, TodoPriority } from "@/src/shared/model/types/todo";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { CustomModal } from "@/src/shared/ui/atom/_Custom/CustomModal/CustomModal";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import { CustomTextInput } from "@/src/shared/ui/atom/_Custom/CustomTextInput/CustomTextInput";
import { PrioritySelector } from "@/src/shared/ui/atom/PrioritySelector/PrioritySelector";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

interface I_Add_Todo_Modal {
    onClose: () => void;
    onAdd: (title: I_Todo["title"], priority: TodoPriority) => void;
    isOpen: boolean;
    titleText?: string;
    submitText?: string;
    withPriority?: boolean;
}

export const AddTodoModal: React.FC<I_Add_Todo_Modal> = ({ 
    isOpen, 
    onClose, 
    onAdd,
    titleText = "Добавить задачу",
    submitText = "Добавить",
    withPriority = true,
}) => {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<TodoPriority>("Средний");
    const [inputError, setInputError] = useState(false);

    const onPressAdd = () => {
        if (!title.trim()) {
            setInputError(true);
            return;
        }
        onAdd(title.trim(), priority);
        setTitle("");
        setPriority("Средний");
        setInputError(false);
        onClose();
    };

    const onPressCancel = () => {
        setTitle("");
        setPriority("Средний");
        setInputError(false);
        onClose();
    };

    useEffect(() => {
        if (inputError && title) {
            setInputError(false);
        }
    }, [title]);

    useEffect(() => {
        if (!isOpen) {
            setTitle("");
            setPriority("Средний");
            setInputError(false);
        }
    }, [isOpen]);

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} animationType="slide">
            <View style={styles.modalContent}>
                <CustomText variant={"title"}>{titleText}</CustomText>

                <View style={styles.inputContainer}>
                    <CustomTextInput 
                        value={title} 
                        onChangeText={setTitle}
                        placeholder={"Введите название задачи..."} 
                        isError={inputError}
                        autoFocus
                    />
                </View>

                {withPriority && (
                    <View style={styles.priorityContainer}>
                        <PrioritySelector 
                            selectedPriority={priority} 
                            onPriorityChange={setPriority} 
                        />
                    </View>
                )}

                <View style={styles.buttonsContainer}>
                    <CustomButton label={"Отмена"} onPress={onPressCancel} variant="secondary" />
                    <CustomButton label={submitText} onPress={onPressAdd} disabled={inputError || !title.trim()} />
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
        marginTop: 20,
        gap: 10,
    }
})

