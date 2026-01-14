import { TodoItemMenu } from "@/src/features/menus/TodoItemMenu/TodoItemMenu";
import { AddTodoModal } from "@/src/features/modals/AddTodoModal/AddTodoModal";
import { DeleteTodoModal } from "@/src/features/modals/DeleteTodoModal/DeleteTodoModal";
import { EditTodoModal } from "@/src/features/modals/EditTodoModal/EditTodoModal";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import { I_Todo, TodoPriority } from "@/src/shared/model/types/todo";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { CustomCheckbox } from "@/src/shared/ui/atom/_Custom/CustomCheckbox/CustomCheckbox";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    LayoutAnimation,
    Pressable,
    StyleSheet,
    Text,
    UIManager,
    Vibration,
    View,
} from "react-native";

interface I_Todo_Item extends I_Todo {
    onCheck: (id: I_Todo["id"]) => void;
    onDelete: (id: I_Todo["id"]) => void;
    onUpdate: (id: I_Todo["id"], title: I_Todo["title"], priority?: TodoPriority) => void;
    onAddSubtask: (parentId: I_Todo["id"], title: I_Todo["title"], priority?: TodoPriority) => void;
    onCheckSubtask: (parentId: I_Todo["id"], subtaskId: I_Todo["id"]) => void;
    onDeleteSubtask: (parentId: I_Todo["id"], subtaskId: I_Todo["id"]) => void;
    onLongPress?: () => void;
    isDragging?: boolean;
}

const getPriorityColor = (priority?: TodoPriority): string => {
    if (!priority) return COLORS.blue;
    switch (priority) {
        case "Низкий":
            return COLORS.green;
        case "Средний":
            return COLORS.blue;
        case "Высокий":
            return COLORS.pink;
        default:
            return COLORS.blue;
    }
};

export const TodoItemCard: React.FC<I_Todo_Item> = ({
    id,
    title,
    isCompleted,
    priority = "Средний",
    subtasks,
    onCheck,
    onDelete,
    onUpdate,
    onAddSubtask,
    onCheckSubtask,
    onDeleteSubtask,
    onLongPress,
    isDragging = false,
}) => {
    const { colors, mode } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddSubtaskModalOpen, setIsAddSubtaskModalOpen] = useState(false);
    // По умолчанию подзадачи раскрыты; фактическое состояние подгружаем из AsyncStorage
    const [isExpanded, setIsExpanded] = useState(true);
    const [anchorPosition, setAnchorPosition] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | undefined>(undefined);
    const buttonRef = useRef<View>(null);

    const hasSubtasks = !!subtasks && subtasks.length > 0;

    // Анимации для stackCard и подзадач
    const stackOpacity = useRef(new Animated.Value(hasSubtasks && !isExpanded ? 1 : 0)).current;
    const stackScale = useRef(new Animated.Value(hasSubtasks && !isExpanded ? 1 : 0.8)).current;
    const subtasksOpacity = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

    // Ключ для хранения состояния разворота подзадач
    const EXPANDED_STATE_KEY = "subtasksExpandedState";

    // Загружаем сохранённое состояние разворота для текущей задачи
    useEffect(() => {
        if (!hasSubtasks) return;

        (async () => {
            try {
                const stored = await AsyncStorage.getItem(EXPANDED_STATE_KEY);
                if (!stored) {
                    // Нет сохранённого значения — оставляем дефолт (развёрнуто)
                    return;
                }
                const map = JSON.parse(stored) as Record<string, boolean>;
                const value = map[String(id)];
                if (typeof value === "boolean") {
                    setIsExpanded(value);
                }
            } catch (error) {
                console.error("Ошибка чтения состояния разворота подзадач:", error);
            }
        })();
    }, [id, hasSubtasks]);

    // Сохраняем состояние разворота для текущей задачи
    const persistExpandedState = async (next: boolean) => {
        try {
            const stored = await AsyncStorage.getItem(EXPANDED_STATE_KEY);
            const map = stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
            map[String(id)] = next;
            await AsyncStorage.setItem(EXPANDED_STATE_KEY, JSON.stringify(map));
        } catch (error) {
            console.error("Ошибка сохранения состояния разворота подзадач:", error);
        }
    };

    const onPressCheck = () => {
        onCheck(id);
    };

    const handleToggleExpand = () => {
        if (!subtasks || subtasks.length === 0) return;

        // Настройка LayoutAnimation для плавной анимации высоты
        if (UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        LayoutAnimation.configureNext({
            duration: 250,
            create: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
            },
            update: {
                type: LayoutAnimation.Types.spring,
                springDamping: 0.7,
            },
        });

        setIsExpanded((prev) => {
            const next = !prev;
            // сохраняем новое состояние (развёрнуто/свёрнуто) для этой задачи
            void persistExpandedState(next);
            return next;
        });
    };

    // Анимация раскрытия/закрытия stackCard и подзадач
    useEffect(() => {
        if (hasSubtasks) {
            // Анимация stackCard (показывается когда свернуто)
            Animated.parallel([
                Animated.spring(stackOpacity, {
                    toValue: isExpanded ? 0 : 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.spring(stackScale, {
                    toValue: isExpanded ? 0.8 : 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
            ]).start();

            // Анимация подзадач (показываются когда развернуто)
            Animated.spring(subtasksOpacity, {
                toValue: isExpanded ? 1 : 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();
        }
    }, [isExpanded, hasSubtasks, stackOpacity, stackScale, subtasksOpacity]);

    const onConfirmDelete = () => {
        setIsDeleteModalOpen(false);
        onDelete(id);
        Vibration.vibrate(300);
    };

    const handleMenuButtonPress = () => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
            return;
        }
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            setAnchorPosition({
                x,
                y,
                width,
                height,
            });
            setIsMenuOpen(true);
        });
    };

    const handleAddSubtaskConfirm = (subtaskTitle: string, subtaskPriority: TodoPriority) => {
        onAddSubtask(id, subtaskTitle, subtaskPriority);
        setIsExpanded(true);
        // При добавлении подзадачи сразу раскрываем и сохраняем это состояние
        void persistExpandedState(true);
    };

    const handleCheckSubtask = (subtaskId: I_Todo["id"]) => {
        onCheckSubtask(id, subtaskId);
    };

    const handleDeleteSubtask = (subtaskId: I_Todo["id"]) => {
        onDeleteSubtask(id, subtaskId);
    };

    return (
        <View
            style={[
                styles.container,
                isDragging && styles.draggingContainer,
                isCompleted && styles.completedContainer,
            ]}
        >
            <View
                style={[
                    styles.mainCard,
                    hasSubtasks && styles.mainCardWithStack,
                    {
                        backgroundColor: colors.card,
                        shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                        borderWidth: mode === "dark" ? 0.5 : 0,
                        borderColor: mode === "dark" ? COLORS.light_gray : "transparent",
                    },
                ]}
            >
                <View style={styles.mainRow}>
                    <View style={styles.checkTitleContainer}>
                        <CustomCheckbox checked={isCompleted} onCheck={onPressCheck} />
                        <Pressable
                            style={styles.titleContainer}
                            onPress={handleToggleExpand}
                            onLongPress={onLongPress}
                        >
                            <Text
                                style={{
                                    flexShrink: 1,
                                    color: colors.text,
                                    textDecorationLine: isCompleted ? "line-through" : "none",
                                }}
                            >
                                {title}
                            </Text>
                        </Pressable>
                        {priority && (
                            <View
                                style={[
                                    styles.priorityTag,
                                    { backgroundColor: getPriorityColor(priority) },
                                ]}
                            >
                                <Text style={styles.priorityTagText}>{priority}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.controlContainer}>
                        <View ref={buttonRef} collapsable={false}>
                            <CustomButton
                                icon="ellipsis-horizontal"
                                size="small"
                                iconSize={16}
                                onPress={handleMenuButtonPress}
                                style={isMenuOpen ? styles.menuButtonActive : styles.menuButton}
                            />
                        </View>
                        {isMenuOpen && (
                            <TodoItemMenu
                                isOpen={isMenuOpen}
                                onClose={() => setIsMenuOpen(false)}
                                onEdit={() => setIsEditModalOpen(true)}
                                onDelete={() => setIsDeleteModalOpen(true)}
                                onAddSubtask={() => setIsAddSubtaskModalOpen(true)}
                                anchorPosition={anchorPosition}
                            />
                        )}
                    </View>
                </View>

                {hasSubtasks && (
                    <Pressable
                        onPress={handleToggleExpand}
                        style={[
                            styles.subtasksBadge,
                            styles.subtasksBadgeFloating,
                            {
                                backgroundColor: mode === "dark" ? colors.card : COLORS.light_gray,
                                borderColor: COLORS.light_gray,
                                shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                            },
                        ]}
                        hitSlop={8}
                    >
                        <Text
                            style={[
                                styles.subtasksBadgeText,
                                { color: mode === "dark" ? colors.primary : COLORS.blue },
                            ]}
                        >
                            {subtasks?.length}
                        </Text>
                    </Pressable>
                )}
            </View>

            {hasSubtasks && (
                <Animated.View
                    style={[
                        styles.stackPreviewContainer,
                        {
                            opacity: stackOpacity,
                            transform: [{ scale: stackScale }],
                        },
                    ]}
                    pointerEvents="none"
                >
                    <View
                        style={[
                            styles.stackCard,
                            styles.stackCardSecond,
                            {
                                backgroundColor: colors.card,
                                borderColor: COLORS.light_gray,
                                shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.stackCard,
                            styles.stackCardThird,
                            {
                                backgroundColor: colors.card,
                                borderColor: COLORS.light_gray,
                                shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                            },
                        ]}
                    />
                </Animated.View>
            )}

            {hasSubtasks && (
                <Animated.View
                    style={[
                        styles.subtasksContainer,
                        {
                            opacity: subtasksOpacity,
                        },
                    ]}
                    pointerEvents={isExpanded ? "auto" : "none"}
                >
                    {isExpanded &&
                        subtasks?.map((subtask, index) => (
                            <View
                                key={subtask.id}
                                style={[
                                    styles.subtaskCard,
                                    index > 0 && { marginTop: 6 },
                                    subtask.isCompleted && styles.completedSubtaskCard,
                                    {
                                        backgroundColor: colors.card,
                                        shadowColor:
                                            mode === "dark" ? "#000000" : COLORS.black,
                                        borderWidth: mode === "dark" ? 0.5 : 0,
                                        borderColor:
                                            mode === "dark"
                                                ? COLORS.light_gray
                                                : "transparent",
                                    },
                                ]}
                            >
                                <View style={styles.subtaskRow}>
                                    <CustomCheckbox
                                        checked={subtask.isCompleted}
                                        onCheck={() => handleCheckSubtask(subtask.id)}
                                    />
                                    <Text
                                        style={[
                                            styles.subtaskText,
                                            { color: colors.text },
                                            subtask.isCompleted && styles.subtaskTextCompleted,
                                        ]}
                                    >
                                        {subtask.title}
                                    </Text>
                                    <Pressable
                                        onPress={() => handleDeleteSubtask(subtask.id)}
                                        hitSlop={6}
                                        style={styles.subtaskDeleteButton}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={16}
                                            color={
                                                mode === "dark"
                                                    ? colors.text
                                                    : COLORS.black
                                            }
                                        />
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                </Animated.View>
            )}

            <EditTodoModal
                title={title}
                priority={priority}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={(nextTitle, nextPriority) =>
                    onUpdate(id, nextTitle, nextPriority)
                }
            />
            <DeleteTodoModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={onConfirmDelete}
            />
            <AddTodoModal
                isOpen={isAddSubtaskModalOpen}
                onClose={() => setIsAddSubtaskModalOpen(false)}
                onAdd={handleAddSubtaskConfirm}
                titleText="Добавить подзадачу"
                submitText="Добавить"
                withPriority={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        marginVertical: 6,
    },
    completedContainer: {
        opacity: 0.8,
    },
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
    mainCardWithStack: {
        marginBottom: 8,
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
    controlContainer: {
        flexDirection: "row",
        gap: 5,
        position: "relative",
    },
    draggingContainer: {
        opacity: 0.5,
        transform: [{ scale: 1.05 }],
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
    subtasksContainer: {
        marginTop: -4,
        paddingLeft: 20,
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


