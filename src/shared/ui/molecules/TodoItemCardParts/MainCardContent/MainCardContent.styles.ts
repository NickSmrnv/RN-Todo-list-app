import { StyleSheet } from "react-native";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";

export const styles = StyleSheet.create({
    mainCard: {
        paddingVertical: 10,
        paddingLeft: 15,
        paddingRight: 10,
        borderRadius: 15,
        backgroundColor: COLORS.white,
        overflow: "visible",
        elevation: 3,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        zIndex: 5,
        position: "relative",
    },
    dragAreaBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    mainRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    checkTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    titleContainer: {
        flex: 1,
    },
    titleInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 4,
        minHeight: 32,
    },
    controlContainer: {
        flexDirection: "row",
        gap: 5,
        position: "relative",
    },
    priorityTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    priorityTagText: {
        color: COLORS.white,
        fontSize: 12,
    },
    subtasksBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 50,
        borderWidth: 0.5,
        backgroundColor: COLORS.light_gray,
    },
    subtasksBadgeFloating: {
        position: "absolute",
        top: -5,
        right: -5,
    },
    subtasksBadgeText: {
        fontSize: 12,
        color: COLORS.blue,
    },
    menuButton: {
        backgroundColor: "transparent",
    },
    menuButtonActive: {
        backgroundColor: COLORS.light_gray,
    },
});
