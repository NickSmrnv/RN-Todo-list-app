import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { CustomText } from "../_Custom/CustomText/CustomText";

interface I_Date_Item {
    date: Date;
    isSelected: boolean;
    onPress: () => void;
}

const SELECTED_SCALE = 1;
const NORMAL_SCALE = 0.8;

export const DateItem: React.FC<I_Date_Item> = ({ date, isSelected, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(isSelected ? SELECTED_SCALE : NORMAL_SCALE)).current;
    
    const day = date.getDate();
    const dayOfWeek = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date);
    const month = new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(date);

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isSelected ? SELECTED_SCALE : NORMAL_SCALE,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    }, [isSelected, scaleAnim]);

    const isToday = () => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <Animated.View
            style={[
                {
                    transform: [{ scale: scaleAnim }],
                }
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.container,
                    isSelected && styles.selectedContainer,
                    isToday() && !isSelected && styles.todayContainer
                ]}
                activeOpacity={0.7}
            >
            <View style={styles.content}>
                <CustomText
                    variant="primary"
                    style={[
                        styles.dayOfWeek,
                        isSelected && styles.selectedText
                    ]}
                >
                    {dayOfWeek}
                </CustomText>
                <CustomText
                    variant="title"
                    style={[
                        styles.day,
                        isSelected && styles.selectedText
                    ]}
                >
                    {day}
                </CustomText>
                <CustomText
                    variant="small"
                    style={[
                        styles.month,
                        isSelected && styles.selectedText
                    ]}
                >
                    {month}
                </CustomText>
            </View>
        </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 80,
        height: 100,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.blue,
    },
    selectedContainer: {
        backgroundColor: COLORS.blue,
        borderColor: COLORS.blue,
    },
    todayContainer: {
        borderColor: COLORS.green,
        borderWidth: 2,
    },
    content: {
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    dayOfWeek: {
        fontSize: 12,
        textTransform: "capitalize",
    },
    day: {
        fontSize: 24,
        fontWeight: "600",
    },
    month: {
        fontSize: 12,
        textTransform: "capitalize",
    },
    selectedText: {
        color: COLORS.white,
    },
});

