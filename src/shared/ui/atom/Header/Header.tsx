import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { getDateLabel } from "@/src/shared/lib/obj/date";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CustomText } from "../_Custom/CustomText/CustomText";

interface I_Header {
    totalTodos: number;
    completedTodos: number;
    selectedDate: Date;
}

export const Header: React.FC<I_Header> = ({ totalTodos, completedTodos, selectedDate }) => {
    const dateLabel = getDateLabel(selectedDate);
    
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <CustomText variant={"title"}>{dateLabel}</CustomText>

                <View style={styles.counterContainer}>
                    <Ionicons 
                        name="checkmark-circle-outline" 
                        size={20} 
                        color={COLORS.black} 
                        style={styles.icon}
                    />
                    <CustomText variant={"primary"}>
                        {completedTodos} / {totalTodos}
                    </CustomText>
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
        alignItems: "center",
        gap: 5,
    },
    counterContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    icon: {
        marginRight: 0,
    },
});
