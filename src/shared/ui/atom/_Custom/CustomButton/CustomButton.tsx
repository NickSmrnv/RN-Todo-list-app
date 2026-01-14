import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

interface I_Custom_Button {
    label?: string;
    icon?: React.ComponentProps<typeof Ionicons>["name"];
    iconSize?: number;
    iconColor?: string;
    size?: "default" | "small" | "large";
    variant?: "primary" | "secondary" | "delete";
    disabled?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
}

export const CustomButton: React.FC<I_Custom_Button> = ({
    label,
    icon,
    iconSize = 14,
    iconColor,
    size,
    variant = "primary",
    disabled = false,
    onPress,
    style,
}) => {
    const { colors, mode } = useTheme();

    const variantStyle: ViewStyle =
        variant === "secondary"
            ? { backgroundColor: COLORS.green }
            : variant === "delete"
            ? { backgroundColor: colors.accent }
            : { backgroundColor: colors.primary };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                variantStyle,
                disabled && styles.disabled,
                // Sizes
                size === "small" ? styles.small : null,
                size === "large" ? styles.large : null,
                style,
            ]}
            disabled={disabled}
            onPress={onPress}
        >
            {label && <Text style={styles.text}>{label}</Text>}
            {icon && (
                <Ionicons
                    name={icon}
                    size={iconSize}
                    color={iconColor ?? (mode === "dark" ? COLORS.white : COLORS.black)}
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },

    text: {
        color: COLORS.white,
    },
    disabled: {
        opacity: 0.5,
    },
    // variants
    secondary: {
        backgroundColor: COLORS.green,
    },
    delete: {
        backgroundColor: COLORS.pink,
    },
    
    // sizes
    small: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    large: {
        fontSize: 30,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
    },
});
