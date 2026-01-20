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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    LayoutAnimation,
    Modal,
    Pressable,
    Animated as RNAnimated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    Vibration,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    cancelAnimation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

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
    
    // Состояния для inline редактирования
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
    const [priorityAnchorPosition, setPriorityAnchorPosition] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | undefined>(undefined);
    const titleInputRef = useRef<TextInput>(null);
    const priorityButtonRef = useRef<View>(null);

    // Анимация для свайпа
    const translateX = useSharedValue(0);
    const SWIPE_THRESHOLD = 80; // Порог для открытия модального окна

    const hasSubtasks = !!subtasks && subtasks.length > 0;

    // Анимации для stackCard и подзадач
    const stackOpacity = useRef(new RNAnimated.Value(hasSubtasks && !isExpanded ? 1 : 0)).current;
    const stackScale = useRef(new RNAnimated.Value(hasSubtasks && !isExpanded ? 1 : 0.8)).current;
    const subtasksOpacity = useRef(new RNAnimated.Value(isExpanded ? 1 : 0)).current;

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

    // Сбрасываем translateX при начале и при окончании перетаскивания
    useEffect(() => {
        cancelAnimation(translateX);
        translateX.value = withSpring(0, {
            damping: 100,
            stiffness: 400,
        });
    }, [isDragging, translateX]);

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
        if (isEditingTitle) return; // Не сворачиваем/разворачиваем при редактировании

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

    // Inline редактирование названия
    const handleTitlePress = () => {
        setIsEditingTitle(true);
        setEditedTitle(title);
        // Фокусируем input после небольшой задержки
        setTimeout(() => {
            titleInputRef.current?.focus();
        }, 100);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (editedTitle.trim() && editedTitle !== title) {
            onUpdate(id, editedTitle.trim(), priority);
        } else {
            setEditedTitle(title);
        }
    };

    const handleTitleSubmit = () => {
        if (editedTitle.trim()) {
            onUpdate(id, editedTitle.trim(), priority);
        }
        setIsEditingTitle(false);
    };

    // Редактирование приоритета
    const handlePriorityPress = () => {
        // Закрываем основное меню, если открыто
        setIsMenuOpen(false);

        priorityButtonRef.current?.measureInWindow((x, y, width, height) => {
            setPriorityAnchorPosition({ x, y, width, height });
            setIsPriorityMenuOpen(true);
        });
    };

    const handlePrioritySelect = (newPriority: TodoPriority) => {
        onUpdate(id, title, newPriority);
        setIsPriorityMenuOpen(false);
        setPriorityAnchorPosition(undefined);
    };

    const handleOutsidePress = () => {
        if (isEditingTitle) {
            titleInputRef.current?.blur();
        }
    };

    const closePriorityMenu = () => {
        setIsPriorityMenuOpen(false);
        setPriorityAnchorPosition(undefined);
    };

    // Анимация раскрытия/закрытия stackCard и подзадач
    useEffect(() => {
        if (hasSubtasks) {
            // Анимация stackCard (показывается когда свернуто)
            RNAnimated.parallel([
                RNAnimated.spring(stackOpacity, {
                    toValue: isExpanded ? 0 : 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                RNAnimated.spring(stackScale, {
                    toValue: isExpanded ? 0.8 : 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
            ]).start();

            // Анимация подзадач (показываются когда развернуто)
            RNAnimated.spring(subtasksOpacity, {
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
        // Закрываем меню приоритета, если открыто
        setIsPriorityMenuOpen(false);
        
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

    // Флаг для отслеживания монтирования компонента
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Обработчики для открытия модальных окон из жеста
    const openDeleteModal = useCallback(() => {
        if (isMountedRef.current) {
            setIsDeleteModalOpen(true);
        }
    }, []);

    const openEditModal = useCallback(() => {
        if (isMountedRef.current) {
            setIsEditModalOpen(true);
        }
    }, []);

    // Жест панорамирования для свайпа
    const panGesture = useMemo(
        () =>
            Gesture.Pan()
                .activeOffsetX([-15, 15]) // Увеличен порог для активации, чтобы не мешать кликам
                .failOffsetY([-10, 10]) // Не активируется при вертикальном движении
                .enabled(!isDragging && !isEditingTitle && !isPriorityMenuOpen) // Отключаем при перетаскивании, редактировании или открытом меню
                .minPointers(1)
                .maxPointers(1)
                .shouldCancelWhenOutside(false)
                .onChange((event) => {
                    "worklet";
                    // Ограничиваем свайп только по горизонтали
                    if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
                        const clampedX = Math.max(-75, Math.min(75, event.translationX));
                        translateX.value = clampedX;
                    }
                })
                .onEnd((event) => {
                    "worklet";
                    const { translationX, velocityX } = event;

                    // Если свайп влево (отрицательное значение) и превышен порог
                    if (translationX < -SWIPE_THRESHOLD || velocityX < -500) {
                        // Открываем модальное окно удаления
                        runOnJS(openDeleteModal)();
                        // Возвращаем карточку в исходное положение быстро
                        translateX.value = withSpring(0, {
                            damping: 100,
                            stiffness: 400,
                        });
                    }
                    // Если свайп вправо (положительное значение) и превышен порог
                    else if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
                        // Открываем модальное окно редактирования
                        runOnJS(openEditModal)();
                        // Возвращаем карточку в исходное положение быстро
                        translateX.value = withSpring(0, {
                            damping: 100,
                            stiffness: 400,
                        });
                    }
                    // Если порог не достигнут, возвращаем карточку в исходное положение
                    else {
                        translateX.value = withSpring(0, {
                            damping: 100,
                            stiffness: 400,
                        });
                    }
                }),
        [isDragging, isEditingTitle, isPriorityMenuOpen, openDeleteModal, openEditModal]
    );

    // Анимированные стили для карточки
    const animatedCardStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    // Анимированные стили для иконок действий
    const deleteIconAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [-75, -SWIPE_THRESHOLD, 0],
            [1, 1, 0],
            "clamp"
        );
        return {
            opacity,
        };
    });

    const editIconAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD, 75],
            [0, 1, 1],
            "clamp"
        );
        return {
            opacity,
        };
    });

    return (
        <View
            style={[
                styles.container,
                isDragging && styles.draggingContainer,
                isCompleted && styles.completedContainer,
            ]}
        >
            {/* Фоновые действия при свайпе */}
            <View style={styles.swipeActionsContainer}>
                {/* Действие редактирования (слева) */}
                <Animated.View
                    style={[
                        styles.swipeAction,
                        styles.swipeActionLeft,
                        editIconAnimatedStyle,
                        {
                            backgroundColor: COLORS.green,
                        },
                    ]}
                >
                    <Ionicons name="create-outline" size={24} color={COLORS.white} />
                </Animated.View>

                {/* Действие удаления (справа) */}
                <Animated.View
                    style={[
                        styles.swipeAction,
                        styles.swipeActionRight,
                        deleteIconAnimatedStyle,
                        {
                            backgroundColor: COLORS.pink,
                        },
                    ]}
                >
                    <Ionicons name="trash-outline" size={24} color={COLORS.white} />
                </Animated.View>

                
            </View>

            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.mainCard,
                        hasSubtasks && styles.mainCardWithStack,
                        animatedCardStyle,
                        {
                            backgroundColor: isEditingTitle
                                ? mode === "dark"
                                    ? "#0B1220"
                                    : COLORS.light_gray
                                : colors.card,
                            shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                            borderWidth: mode === "dark" ? 0.5 : 0,
                            borderColor: mode === "dark" ? COLORS.light_gray : "transparent",
                        },
                    ]}
                    onStartShouldSetResponderCapture={() => {
                        handleOutsidePress();
                        return false;
                    }}
                >
                {/* Фоновая зона для long-press drag по отступам и пустотам */}
                <Pressable
                    style={({ pressed }) => [styles.dragAreaBackdrop, pressed && { opacity: 1 }]}
                    onLongPress={onLongPress}
                    android_ripple={null}
                />
                <Pressable
                    style={({ pressed }) => [styles.mainRow, pressed && { opacity: 1 }]}
                    onLongPress={onLongPress}
                    android_ripple={null}
                >
                    <View style={styles.checkTitleContainer}>
                        <CustomCheckbox
                            checked={isCompleted}
                            onCheck={onPressCheck}
                            onLongPress={onLongPress}
                        />
                        {isEditingTitle ? (
                            <TextInput
                                ref={titleInputRef}
                                value={editedTitle}
                                onChangeText={setEditedTitle}
                                onBlur={handleTitleBlur}
                                onSubmitEditing={handleTitleSubmit}
                                style={[
                                    styles.titleInput,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Введите название задачи"
                                placeholderTextColor={colors.text + "80"}
                                returnKeyType="done"
                                blurOnSubmit={true}
                                selectTextOnFocus={true}
                            />
                        ) : (
                            <Pressable
                                style={styles.titleContainer}
                                onPress={handleTitlePress}
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
                        )}
                        {priority && (
                            <View ref={priorityButtonRef} collapsable={false}>
                                <TouchableOpacity
                                    onPress={handlePriorityPress}
                                    onLongPress={onLongPress}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <View
                                        style={[
                                            styles.priorityTag,
                                            { backgroundColor: getPriorityColor(priority) },
                                        ]}
                                    >
                                        <Text style={styles.priorityTagText}>{priority}</Text>
                                    </View>
                                </TouchableOpacity>
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
                                onLongPress={onLongPress}
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
                </Pressable>

                {hasSubtasks && (
                    <Pressable
                        onPress={handleToggleExpand}
                        onLongPress={onLongPress}
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
                </Animated.View>
            </GestureDetector>

            {hasSubtasks && (
                <RNAnimated.View
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
                </RNAnimated.View>
            )}

            {hasSubtasks && (
                <RNAnimated.View
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
                </RNAnimated.View>
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

            {/* Меню выбора приоритета */}
            <Modal
                visible={isPriorityMenuOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={closePriorityMenu}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={closePriorityMenu}
                >
                    {priorityAnchorPosition && (
                        <View
                            style={[
                                styles.priorityMenu,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.primary,
                                    shadowColor: mode === "dark" ? "#000000" : COLORS.black,
                                    top: priorityAnchorPosition.y + priorityAnchorPosition.height + 5,
                                    left: priorityAnchorPosition.x,
                                },
                            ]}
                        >
                            {(["Низкий", "Средний", "Высокий"] as TodoPriority[]).map(
                                (priorityOption) => (
                                    <TouchableOpacity
                                        key={priorityOption}
                                        onPress={() => handlePrioritySelect(priorityOption)}
                                        style={[
                                            styles.priorityMenuItem,
                                            priority === priorityOption && {
                                                backgroundColor: colors.primary + "20",
                                            },
                                        ]}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.priorityDot,
                                                {
                                                    backgroundColor:
                                                        getPriorityColor(priorityOption),
                                                },
                                            ]}
                                        />
                                        <Text
                                            style={[
                                                styles.priorityMenuItemText,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {priorityOption}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    )}
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
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
    draggingContainer: {
        opacity: 0.85,
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
    swipeActionsContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        borderRadius: 15,
        overflow: "hidden",
        zIndex: 1,         
        elevation: 10,       
        pointerEvents: "none", 
    },
    swipeAction: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
    swipeActionLeft: {
        paddingLeft: 20,
        alignItems: "flex-start",
    },
    swipeActionRight: {
        paddingRight: 20,
        alignItems: "flex-end",
    },
    swipeActionText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "600",
    },
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


