import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import { getFullDateLabel, getTodayDate } from "@/src/shared/lib/obj/date";
import { I_Todo, TodoPriority } from "@/src/shared/model/types/todo";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { CustomModal } from "@/src/shared/ui/atom/_Custom/CustomModal/CustomModal";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import { CustomTextInput } from "@/src/shared/ui/atom/_Custom/CustomTextInput/CustomTextInput";
import { PrioritySelector } from "@/src/shared/ui/atom/PrioritySelector/PrioritySelector";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

interface I_Add_Todo_Modal {
    onClose: () => void;
    onAdd: (title: I_Todo["title"], date?: Date, priority?: TodoPriority) => void;
    isOpen: boolean;
    titleText?: string;
    submitText?: string;
    withPriority?: boolean;
    /** Показывать выбор даты. По умолчанию true для задач, false для подзадач. */
    withDate?: boolean;
}

export const AddTodoModal: React.FC<I_Add_Todo_Modal> = ({
    isOpen,
    onClose,
    onAdd,
    titleText = "Добавить задачу",
    submitText = "Добавить",
    withPriority = true,
    withDate = true,
}) => {
    const { colors } = useTheme();
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<TodoPriority>("Средний");
    const [date, setDate] = useState<Date>(getTodayDate());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [inputError, setInputError] = useState(false);

    const onPressAdd = () => {
        if (!title.trim()) {
            setInputError(true);
            return;
        }
        onAdd(title.trim(), withDate ? date : undefined, priority);
        setTitle("");
        setPriority("Средний");
        setDate(getTodayDate());
        setInputError(false);
        setShowDatePicker(false);
        onClose();
    };

    const onPressCancel = () => {
        setTitle("");
        setPriority("Средний");
        setDate(getTodayDate());
        setInputError(false);
        setShowDatePicker(false);
        onClose();
    };

    const onDateChange = (_event: unknown, selectedDate?: Date) => {
        if (Platform.OS === "android") setShowDatePicker(false);
        if (selectedDate) {
            const d = new Date(selectedDate);
            d.setHours(0, 0, 0, 0);
            setDate(d);
        }
    };

    useEffect(() => {
        if (inputError && title) {
            setInputError(false);
        }
    }, [title]);

    useEffect(() => {
        if (isOpen) {
            setDate(getTodayDate());
        } else {
            setTitle("");
            setPriority("Средний");
            setDate(getTodayDate());
            setInputError(false);
            setShowDatePicker(false);
        }
    }, [isOpen]);

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} animationType="fade">
            <View style={styles.modalContent}>
                <CustomText variant={"title"}>{titleText}</CustomText>

                <View style={styles.inputContainer}>
                    <CustomTextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder={"Введите название задачи..."}
                        isError={inputError}
                        autoFocus
                        autoComplete="off"
                        textContentType="none"
                        autoCorrect={false}
                    />
                </View>

                {withDate && (
                    <View style={styles.dateContainer}>
                        <CustomText variant="subtitle">Дата</CustomText>

                        <Pressable
                            style={[
                                styles.dateButton,
                                {
                                    borderColor: showDatePicker ? COLORS.black : colors.border,
                                    backgroundColor: colors.inputBackground,
                                }
                            ]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color={colors.text} />
                            <CustomText variant="primary">{getFullDateLabel(date)}</CustomText>
                        </Pressable>

                        {showDatePicker && (
                            <View style={styles.datePickerWrapper}>
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={"spinner"}
                                    onChange={onDateChange}
                                    locale="ru-RU"
                                    textColor={Platform.OS === "ios" ? colors.text : undefined}
                                    accentColor={Platform.OS === "ios" ? colors.primary : undefined}
                                />
                                {Platform.OS === "ios" && (
                                    <CustomButton
                                        label="Готово"
                                        onPress={() => setShowDatePicker(false)}
                                        variant="secondary"
                                    />
                                )}
                            </View>
                        )}
                    </View>
                )}

                {withPriority && (
                    <View style={styles.priorityContainer}>
                        <PrioritySelector
                            selectedPriority={priority}
                            onPriorityChange={setPriority}
                        />
                    </View>
                )}

                <View style={styles.buttonsContainer}>
                    <CustomButton label={"Отмена"} onPress={onPressCancel} style={{ backgroundColor: COLORS.pink }} />
                    <CustomButton label={submitText} onPress={onPressAdd} disabled={inputError || !title.trim()} />
                </View>
            </View>
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        gap: 10,
    },

    inputContainer: {
        minHeight: 50,
    },

    dateContainer: {
        gap: 6,
    },

    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
    },

    datePickerWrapper: {
        gap: 10,
    },

    priorityContainer: {
        gap: 10,
    },

    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 20,
        gap: 10,
    }
})

