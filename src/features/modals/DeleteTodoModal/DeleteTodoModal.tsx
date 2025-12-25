import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { CustomModal } from "@/src/shared/ui/atom/_Custom/CustomModal/CustomModal";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import React from "react";
import { StyleSheet, View } from "react-native";

interface I_Delete_Todo_Modal {
    onClose: () => void;
    onDelete: () => void;
    isOpen: boolean;
}

export const DeleteTodoModal: React.FC<I_Delete_Todo_Modal> = ({ isOpen, onClose, onDelete }) => {
    return (

        <CustomModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContent}>
                <CustomText variant={"title"}>Удалить задачу?</CustomText>
                <CustomText variant={"subtitle"}>Вы действительно хотите удалить задачу?</CustomText>

                <View style={styles.buttonsContainer}>
                    <CustomButton label={"Отмена"} onPress={onClose} />
                    <CustomButton variant={"delete"} label={"Удалить"} onPress={onDelete} />
                </View>
            </View>
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        gap: 15,
    },

    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 10,
    }
})