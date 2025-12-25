import { I_Todo } from "@/src/shared/model/types/todo";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { CustomModal } from "@/src/shared/ui/atom/_Custom/CustomModal/CustomModal";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import { CustomTextInput } from "@/src/shared/ui/atom/_Custom/CustomTextInput/CustomTextInput";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

interface I_Edit_Todo_Modal {
    title: I_Todo["title"],
    onClose: () => void;
    onUpdate: (title: I_Todo["title"]) => void;
    isOpen: boolean;
}

export const EditTodoModal: React.FC<I_Edit_Todo_Modal> = ({ isOpen, title, onClose, onUpdate }) => {
    const [updateTitle, setUpdateTitle] = useState(title);
    const [inputError, setInputError] = useState(false)

    const onPressSave = () => {
        if (!updateTitle) {
            setInputError(true)
            return
        }
        onUpdate(updateTitle);
        onClose();
    }

    useEffect(() => {
        if (inputError && updateTitle) {
            setInputError(false);
        }
    }, [updateTitle]);

    useEffect(() => {
        setUpdateTitle(title);
    }, [isOpen])

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