import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import React, { ReactNode } from "react";
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";

interface I_Custom_Modal {
    onClose: () => void;
    isOpen: boolean;
    children: ReactNode;
    animationType?: "fade" | "slide" | "none";
}

export const CustomModal: React.FC<I_Custom_Modal> = ({ isOpen, children, onClose, animationType = "fade" }) => {
    const isSlide = animationType === "slide";

    return (
        <Modal visible={isOpen} onRequestClose={onClose} animationType={animationType} transparent={true}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.modalBgContainer, isSlide && styles.modalBgContainerSlide]}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.content, isSlide && styles.contentSlide]}>
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
    modalBgContainerSlide: {
        justifyContent: "flex-end",
    },

    content: {
        padding: 20,
        borderRadius: 15,
        width: "90%",
        backgroundColor: COLORS.white
    },
    contentSlide: {
        width: "100%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: 40,
    }
})