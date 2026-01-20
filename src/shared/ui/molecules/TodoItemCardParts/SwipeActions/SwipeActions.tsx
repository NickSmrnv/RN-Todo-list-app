import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { styles } from "./SwipeActions.styles";

interface SwipeActionsProps {
    editStyle: StyleProp<ViewStyle>;
    deleteStyle: StyleProp<ViewStyle>;
}

export const SwipeActions: React.FC<SwipeActionsProps> = ({ editStyle, deleteStyle }) => (
    <View style={styles.swipeActionsContainer}>
        <Animated.View
            style={[
                styles.swipeAction,
                styles.swipeActionLeft,
                editStyle,
                { backgroundColor: COLORS.green },
            ]}
        >
            <Ionicons name="create-outline" size={24} color={COLORS.white} />
        </Animated.View>
        <Animated.View
            style={[
                styles.swipeAction,
                styles.swipeActionRight,
                deleteStyle,
                { backgroundColor: COLORS.pink },
            ]}
        >
            <Ionicons name="trash-outline" size={24} color={COLORS.white} />
        </Animated.View>
    </View>
);
