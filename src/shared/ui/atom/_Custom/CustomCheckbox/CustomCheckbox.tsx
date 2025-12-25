import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
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
    return (
        <TouchableOpacity onPress={onCheck}>
            <Ionicons
                name={checked ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={COLORS.black}
            />
        </TouchableOpacity>
    );
};
