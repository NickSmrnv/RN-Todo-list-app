import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

interface I_Custom_TextInput extends TextInputProps {
    isError?: boolean;
}

export const CustomTextInput = React.forwardRef<TextInput, I_Custom_TextInput>(({
    isError = false,
    ...props
}, ref) => {
    return (
        <TextInput
            ref={ref}
            style={[styles.input, props.style, isError && styles.error]}
            placeholderTextColor={isError ? COLORS.pink : undefined}
            {...props}
        />
    );
});

const styles = StyleSheet.create({
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.black,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
        color: COLORS.black,
    },
    error: {
        borderColor: COLORS.pink,
        color: COLORS.pink,
    },
});