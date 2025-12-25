import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { StyleSheet, Text, TextProps } from "react-native";

interface I_Custom_Text extends TextProps {
    variant?: "primary" | "title" | "subtitle" | "heading" | "small";
}

export const CustomText: React.FC<I_Custom_Text> = ({ variant = "primary", style, ...props }) => {
    return (
        <Text style={[styles.text, styles[variant as keyof typeof styles], style]} {...props} />
    );
};

const styles = StyleSheet.create({
    text: {
        color: COLORS.black,
    },
    primary: {
        fontSize: 16,
        fontWeight: "400",
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "400",
    },
});