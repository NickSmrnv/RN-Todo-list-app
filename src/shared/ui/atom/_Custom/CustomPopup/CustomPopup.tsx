import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import React, { ReactNode } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

export interface I_Popup_Item {
    id: string;
    content: ReactNode;
    onPress: () => void;
}

interface I_Custom_Popup {
    isOpen: boolean;
    items: I_Popup_Item[];
    style?: ViewStyle;
}

export const CustomPopup: React.FC<I_Custom_Popup> = ({
    isOpen,
    items,
    style,
}) => {
    if (!isOpen) return null;

    return (
        <View style={[styles.popupContainer, style]}>
            {items.map((item) => (
                <Pressable
                    key={item.id}
                    style={styles.popupItem}
                    onPress={() => {
                        item.onPress();
                    }}
                >
                    {item.content}
                </Pressable>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    popupContainer: {
        position: "absolute",
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 8,
        minWidth: 180,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,
        gap: 4,
        zIndex: 1000,
    },
    popupItem: {
        borderRadius: 8,
        overflow: "hidden",
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
});

