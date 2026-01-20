import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
    },
    completedContainer: {
        opacity: 0.8,
    },
    mainCardWrapper: {},
    mainCardWrapperWithStack: {
        marginBottom: 8,
    },
    stackPreviewContainer: {
        position: "relative",
        marginTop: -6,
        paddingHorizontal: 10,
        height: 10,
    },
    stackCard: {
        position: "absolute",
        left: 6,
        right: 6,
        height: 14,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.light_gray,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    stackCardSecond: {
        top: -11,
        zIndex: -1,
    },
    stackCardThird: {
        top: -5,
        left: 10,
        right: 10,
        zIndex: -2,
    },
    draggingContainer: {
        opacity: 0.85,
    },
});
