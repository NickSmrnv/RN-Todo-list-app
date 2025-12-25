import { getFullFormattedDate } from "@/src/shared/lib/obj/date";
import React from "react";
import { StyleSheet, View } from "react-native";
import { I_Todo_Creator, TodoCreator } from "../../molecules/TodoCreator/TodoCreator";
import { CustomText } from "../_Custom/CustomText/CustomText";

interface I_Header extends I_Todo_Creator{
    totalTodos: number;
    completedTodos: number;
}

export const Header: React.FC<I_Header> = ({ totalTodos, completedTodos, onAddTodo }) => {
    const formattedDate = getFullFormattedDate(new Date());
    
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <CustomText variant={"title"}>Todo App</CustomText>
                <CustomText variant={"subtitle"}>
                    {formattedDate}
                </CustomText>
            </View>

            <CustomText variant={"subtitle"}>
                Выполненно: {completedTodos} / {totalTodos}
            </CustomText>

            <TodoCreator onAddTodo={onAddTodo}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    content: {
        alignItems: "center",
        gap: 5,
    },
});
