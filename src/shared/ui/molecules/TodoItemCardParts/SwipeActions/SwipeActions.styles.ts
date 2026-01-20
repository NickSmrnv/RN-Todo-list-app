import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    swipeActionsContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        borderRadius: 15,
        overflow: "hidden",
        zIndex: 1,
        elevation: 10,
        pointerEvents: "none",
    },
    swipeAction: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
    swipeActionLeft: {
        paddingLeft: 20,
        alignItems: "flex-start",
    },
    swipeActionRight: {
        paddingRight: 20,
        alignItems: "flex-end",
    },
});
