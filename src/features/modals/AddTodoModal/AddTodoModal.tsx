import { I_Todo } from "@/src/shared/model/types/todo";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { CustomModal } from "@/src/shared/ui/atom/_Custom/CustomModal/CustomModal";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import { CustomTextInput } from "@/src/shared/ui/atom/_Custom/CustomTextInput/CustomTextInput";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

interface I_Add_Todo_Modal {
    onClose: () => void;
    onAdd: (title: I_Todo["title"]) => void;
    isOpen: boolean;
}

export const AddTodoModal: React.FC<I_Add_Todo_Modal> = ({ isOpen, onClose, onAdd }) => {
    const [title, setTitle] = useState("");
    const [inputError, setInputError] = useState(false);

    const onPressAdd = () => {
        if (!title.trim()) {
            setInputError(true);
            return;
        }
        onAdd(title.trim());
        setTitle("");
        setInputError(false);
        onClose();
    };

    const onPressCancel = () => {
        setTitle("");
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
            setInputError(false);
        }
    }, [isOpen]);

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} animationType="slide">
            <View style={styles.modalContent}>
                <CustomText variant={"title"}>Добавить задачу</CustomText>

                <View style={styles.inputContainer}>
                    <CustomTextInput 
                        value={title} 
                        onChangeText={setTitle}
                        placeholder={"Введите название задачи..."} 
                        isError={inputError}
                        autoFocus
                    />
                </View>

                <View style={styles.buttonsContainer}>
                    <CustomButton label={"Отмена"} onPress={onPressCancel} variant="secondary" />
                    <CustomButton label={"Добавить"} onPress={onPressAdd} disabled={inputError || !title.trim()} />
                </View>
            </View>
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        gap: 20,
    },

    inputContainer: {
        minHeight: 50,
    },

    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    }
})

