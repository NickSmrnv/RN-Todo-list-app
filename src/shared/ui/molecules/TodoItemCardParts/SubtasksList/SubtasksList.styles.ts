import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    subtaskSwipeWrapper: {
        borderRadius: 12,
    },
    subtasksContainer: {
        marginTop: -4,
        paddingLeft: 15,
        paddingRight: 9,
        gap: 2,
    },
    subtaskCard: {
        borderRadius: 12,
        backgroundColor: COLORS.white,
        paddingVertical: 6,
        paddingHorizontal: 10,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 3,
    },
    completedSubtaskCard: {
        opacity: 0.8,
    },
    subtaskRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    subtaskText: {
        flex: 1,
        flexShrink: 1,
    },
    subtaskTitleContainer: {
        flex: 1,
        flexShrink: 1,
        alignSelf: "stretch",
        justifyContent: "center",
    },
    subtaskTextLabel: {
        flexShrink: 1,
    },
    subtaskTitleInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 2,
        minHeight: 2,
        textAlignVertical: "center",
    },
    subtaskTextCompleted: {
        textDecorationLine: "line-through",
    },
    subtaskDeleteButton: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
    },
});
