import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import React, { useState } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

interface I_Custom_TextInput extends TextInputProps {
    isError?: boolean;
}

export const CustomTextInput = React.forwardRef<TextInput, I_Custom_TextInput>(({
    isError = false,
    onFocus,
    onBlur,
    ...props
}, ref) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const getBorderColor = () => {
        if (isError) return COLORS.pink;
        if (isFocused) return COLORS.black;
        return colors.border;
    };

    return (
        <TextInput
            ref={ref}
            style={[
                styles.input,
                {
                    color: isError ? COLORS.pink : colors.text,
                    borderColor: getBorderColor(),
                    backgroundColor: colors.inputBackground,
                },
                props.style,
                isError && styles.error,
            ]}
            placeholderTextColor={isError ? COLORS.pink : colors.mutedText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
        />
    );
});

const styles = StyleSheet.create({
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    error: {
        borderColor: COLORS.pink,
        color: COLORS.pink,
    },
});