import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { I_Todo } from "@/src/shared/model/types/todo";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, TextInput, View } from "react-native";
import { CustomButton } from "../../atom/_Custom/CustomButton/CustomButton";
import { CustomTextInput } from "../../atom/_Custom/CustomTextInput/CustomTextInput";

export interface I_Todo_Creator {
    onAddTodo: (title: I_Todo["title"]) => void;
}

export const TodoCreator: React.FC<I_Todo_Creator> = ({ onAddTodo }) => {
    const [text, setText] = useState("");
    const [inputError, setInputError] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const onPressAddTodo = () => {
        if (!text) {
            setInputError(true);
            return;
        }
        const taskText = text;
        inputRef.current?.blur();
        Keyboard.dismiss();
        setText("");
        setInputError(false);
        setTimeout(() => {
            onAddTodo(taskText);
            setText("");
        }, 100);
    };

    useEffect(() => {
        if (text && inputError) {
            setInputError(false);
        }
    }, [text, inputError]);

    return (
        <View style={styles.container}>
            <CustomTextInput
                ref={inputRef}
                placeholder="Добавить задачу..."
                value={text}
                onChangeText={setText}
                isError={inputError}
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
            />
            <CustomButton
                icon="add"
                iconSize={20}
                iconColor={COLORS.white}
                onPress={onPressAddTodo}
                disabled={!text || inputError === true}
                style={styles.button}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },
    button: {
        height: "100%",
    },
});
