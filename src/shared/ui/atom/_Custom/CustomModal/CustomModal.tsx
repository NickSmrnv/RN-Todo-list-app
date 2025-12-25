import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import React, { ReactNode } from "react";
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";

interface I_Custom_Modal {
    onClose: () => void;
    isOpen: boolean;
    children: ReactNode;
}

export const CustomModal: React.FC<I_Custom_Modal> = ({ isOpen, children, onClose }) => {
    return (
        <Modal visible={isOpen} onRequestClose={onClose} animationType="fade" transparent={true}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalBgContainer}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.content}>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>  
    );
};

const styles = StyleSheet.create({
    modalBgContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },

    content: {
        padding: 20,
        borderRadius: 15,
        width: "90%",
        backgroundColor: COLORS.white
    }
})