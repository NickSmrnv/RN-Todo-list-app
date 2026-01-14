import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface I_Custom_Checkbox {
    checked: boolean;
    onCheck: () => void;
}

export const CustomCheckbox: React.FC<I_Custom_Checkbox> = ({
    checked,
    onCheck,
}) => {
    const { mode } = useTheme();

    const iconColor = mode === "dark" ? COLORS.white : COLORS.black;

    return (
        <TouchableOpacity onPress={onCheck}>
            <Ionicons
                name={checked ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={iconColor}
            />
        </TouchableOpacity>
    );
};
