import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useKeyboardScroll } from "@/src/shared/lib/context/KeyboardScrollContext";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface AddTodoInlineCardProps {
    onConfirm: (title: string) => void;
    onCancel: () => void;
}

export const AddTodoInlineCard: React.FC<AddTodoInlineCardProps> = ({
    onConfirm,
    onCancel,
}) => {
    const { colors, mode } = useTheme();
    const scrollToShowInput = useKeyboardScroll()?.scrollToShowInput;
    const [title, setTitle] = useState("");
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(t);
    }, []);

    const handleBlur = () => {
        const t = title.trim();
        if (t) onConfirm(t);
        onCancel();
    };

    const handleFocus = () => {
        setTimeout(() => {
            inputRef.current?.measureInWindow((_x, y, _w, h) => {
                scrollToShowInput?.({ y, height: h });
            });
        }, 400);
    };

    const handleSubmit = () => {
        const t = title.trim();
        if (t) onConfirm(t);
        onCancel();
    };

    const bg =
        mode === "dark"
            ? "#0B1220"
            : COLORS.light_gray;

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: bg,
                    shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                    borderWidth: mode === "dark" ? 0.5 : 0,
                    borderColor: mode === "dark" ? COLORS.light_gray : "transparent",
                },
            ]}
        >
            <View style={styles.row}>
                <View style={styles.checkTitleContainer}>
                    <View style={styles.checkboxPlaceholder} />
                    <TextInput
                        ref={inputRef}
                        value={title}
                        onChangeText={setTitle}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        onSubmitEditing={handleSubmit}
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Введите название задачи"
                        placeholderTextColor={colors.text + "80"}
                        returnKeyType="done"
                        blurOnSubmit
                        autoComplete="off"
                        textContentType="none"
                        autoCorrect={false}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        paddingVertical: 10,
        paddingLeft: 17,
        paddingRight: 10,
        borderRadius: 15,
        overflow: "visible",
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    row: {
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
    checkboxPlaceholder: {
        width: 20,
        height: 20,
        borderColor: COLORS.black,
        borderWidth: 1,
        borderRadius: 300,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 4,
        minHeight: 32,
    },
});
