import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    priorityMenu: {
        position: "absolute",
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
        zIndex: 10000,
        minWidth: 140,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    priorityMenuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    priorityMenuItemText: {
        fontSize: 15,
        fontWeight: "500",
    },
    priorityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "transparent",
    },
});
