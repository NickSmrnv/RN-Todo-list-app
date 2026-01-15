import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import { getDateLabel } from "@/src/shared/lib/obj/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CustomText } from "../_Custom/CustomText/CustomText";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";

interface I_Header {
    totalTodos: number;
    completedTodos: number;
    selectedDate: Date;
}

export const Header: React.FC<I_Header> = ({ totalTodos, completedTodos, selectedDate }) => {
    const dateLabel = getDateLabel(selectedDate);
    const { colors, mode, preference, setPreference } = useTheme();
    const router = useRouter();

    const handleToggleTheme = () => {
        if (preference === "system") {
            // из "системной" переключаемся в противоположную от текущей
            setPreference(mode === "dark" ? "light" : "dark");
        } else if (preference === "light") {
            setPreference("dark");
        } else {
            setPreference("system");
        }
    };

    const themeIconName =
        preference === "system"
            ? "contrast-outline"
            : preference === "dark"
            ? "moon"
            : "sunny";
    
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <CustomText variant={"title"}>{dateLabel}</CustomText>

                <View style={styles.rightSection}>
                    <Pressable
                        style={styles.counterContainer}
                        onPress={() => router.push("/stats")}
                        hitSlop={8}
                    >
                        <Ionicons 
                            name="checkmark-circle-outline" 
                            size={20} 
                            color={colors.text} 
                            style={styles.icon}
                        />
                        <CustomText variant={"primary"}>
                            {completedTodos} / {totalTodos}
                        </CustomText>
                    </Pressable>
                    <Pressable
                        onPress={handleToggleTheme}
                        hitSlop={8}
                        style={styles.themeToggleButton}
                    >
                        <Ionicons
                            name={themeIconName}
                            size={20}
                            color={colors.text}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 20,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    content: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 5,
    },
    rightSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    counterContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderWidth: 1,
        borderColor: COLORS.black,
        paddingRight: 10,
        paddingLeft: 8,
        paddingVertical: 5,
        borderRadius: 999,
    },
    icon: {
        marginRight: 0,
    },
    themeToggleButton: {
        padding: 4,
        borderRadius: 999,
    },
});
