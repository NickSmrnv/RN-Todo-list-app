import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useKeyboardScroll } from "@/src/shared/lib/context/KeyboardScrollContext";
import { AppTheme } from "@/src/shared/lib/context/ThemeContext";
import { I_Todo } from "@/src/shared/model/types/todo";
import { CustomCheckbox } from "@/src/shared/ui/atom/_Custom/CustomCheckbox/CustomCheckbox";
import { SwipeActions } from "@/src/shared/ui/molecules/TodoItemCardParts/SwipeActions/SwipeActions";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { styles } from "./SubtasksList.styles";

const SWIPE_THRESHOLD = 80;

interface SubtaskRowProps {
    subtask: I_Todo;
    colors: AppTheme["colors"];
    mode: AppTheme["mode"];
    onCheckSubtask: (subtaskId: I_Todo["id"]) => void;
    onRequestEditSubtask: (subtask: I_Todo) => void;
    onRequestDeleteSubtask: (subtask: I_Todo) => void;
    onUpdateSubtaskTitle: (subtaskId: I_Todo["id"], title: string) => void;
    cardStyle?: StyleProp<ViewStyle>;
}

export const SubtaskRow: React.FC<SubtaskRowProps> = ({
    subtask,
    colors,
    mode,
    onCheckSubtask,
    onRequestEditSubtask,
    onRequestDeleteSubtask,
    onUpdateSubtaskTitle,
    cardStyle,
}) => {
    const translateX = useSharedValue(0);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(subtask.title);
    const titleInputRef = useRef<TextInput>(null);
    const scrollToShowInput = useKeyboardScroll()?.scrollToShowInput;

    const handleTitleInputFocus = useCallback(() => {
        setTimeout(() => {
            titleInputRef.current?.measureInWindow((_x, y, _w, h) => {
                scrollToShowInput?.({ y, height: h });
            });
        }, 400);
    }, [scrollToShowInput]);

    const handleTitlePress = useCallback(() => {
        setIsEditingTitle(true);
        setEditedTitle(subtask.title);
        setTimeout(() => titleInputRef.current?.focus(), 100);
    }, [subtask.title]);

    const handleTitleBlur = useCallback(() => {
        setIsEditingTitle(false);
        if (editedTitle.trim() && editedTitle !== subtask.title) {
            onUpdateSubtaskTitle(subtask.id, editedTitle.trim());
        }
        setEditedTitle(subtask.title);
    }, [editedTitle, subtask.id, subtask.title, onUpdateSubtaskTitle]);

    const handleTitleSubmit = useCallback(() => {
        if (editedTitle.trim()) {
            onUpdateSubtaskTitle(subtask.id, editedTitle.trim());
        }
        setIsEditingTitle(false);
    }, [editedTitle, subtask.id, onUpdateSubtaskTitle]);

    const openEditModal = useCallback(() => {
        onRequestEditSubtask(subtask);
    }, [onRequestEditSubtask, subtask]);

    const openDeleteModal = useCallback(() => {
        onRequestDeleteSubtask(subtask);
    }, [onRequestDeleteSubtask, subtask]);

    const panGesture = useMemo(
        () =>
            Gesture.Pan()
                .activeOffsetX([-10, 10])
                .failOffsetY([-10, 10])
                .minPointers(1)
                .maxPointers(1)
                .shouldCancelWhenOutside(false)
                .enabled(!isEditingTitle)
                .onChange((event) => {
                    "worklet";
                    if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
                        const clampedX = Math.max(-75, Math.min(75, event.translationX));
                        translateX.value = clampedX;
                    }
                })
                .onEnd((event) => {
                    "worklet";
                    const { translationX, velocityX } = event;

                    if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
                        runOnJS(openDeleteModal)();
                        translateX.value = withSpring(0, {
                            damping: 100,
                            stiffness: 400,
                        });
                    } else if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
                        runOnJS(openEditModal)();
                        translateX.value = withSpring(0, {
                            damping: 100,
                            stiffness: 400,
                        });
                    } else {
                        translateX.value = withSpring(0, {
                            damping: 100,
                            stiffness: 400,
                        });
                    }
                }),
        [openEditModal, openDeleteModal, translateX, isEditingTitle]
    );

    const animatedCardStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const deleteIconAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [-75, -SWIPE_THRESHOLD, 0],
            [1, 1, 0],
            "clamp"
        );
        return { opacity };
    });

    const editIconAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD, 75],
            [0, 1, 1],
            "clamp"
        );
        return { opacity };
    });

    return (
        <View style={[styles.subtaskSwipeWrapper]}>
            <SwipeActions
                editStyle={editIconAnimatedStyle}
                deleteStyle={deleteIconAnimatedStyle}
            />
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.subtaskCard,
                        subtask.isCompleted && styles.completedSubtaskCard,
                        cardStyle,
                        {
                            backgroundColor: isEditingTitle
                                ? mode === "dark"
                                    ? "#0B1220"
                                    : COLORS.light_gray
                                : colors.card,
                        },
                        animatedCardStyle,
                    ]}
                >
                    <View style={styles.subtaskRow}>
                        <CustomCheckbox
                            checked={subtask.isCompleted}
                            onCheck={() => onCheckSubtask(subtask.id)}
                        />
                        {isEditingTitle ? (
                            <TextInput
                                ref={titleInputRef}
                                value={editedTitle}
                                onChangeText={setEditedTitle}
                                onBlur={handleTitleBlur}
                                onFocus={handleTitleInputFocus}
                                onSubmitEditing={handleTitleSubmit}
                                style={[
                                    styles.subtaskTitleInput,
                                    styles.subtaskText,
                                    { color: colors.text },
                                ]}
                                placeholder="Введите название подзадачи"
                                placeholderTextColor={colors.text + "80"}
                                returnKeyType="done"
                                blurOnSubmit
                                selectTextOnFocus
                            />
                        ) : (
                            <Pressable
                                style={styles.subtaskTitleContainer}
                                onPress={handleTitlePress}
                            >
                                <Text
                                    style={[
                                        styles.subtaskTextLabel,
                                        { color: colors.text },
                                        subtask.isCompleted && styles.subtaskTextCompleted,
                                    ]}
                                >
                                    {subtask.title}
                                </Text>
                            </Pressable>
                        )}
                        <Pressable
                            onPress={() => onRequestDeleteSubtask(subtask)}
                            hitSlop={6}
                            style={styles.subtaskDeleteButton}
                        >
                            <Ionicons
                                name="close"
                                size={16}
                                color={mode === "dark" ? colors.text : COLORS.black}
                            />
                        </Pressable>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};
