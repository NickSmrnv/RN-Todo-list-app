import { TodoItemMenu } from "@/src/features/menus/TodoItemMenu/TodoItemMenu";
import { AddTodoModal } from "@/src/features/modals/AddTodoModal/AddTodoModal";
import { DeleteTodoModal } from "@/src/features/modals/DeleteTodoModal/DeleteTodoModal";
import { EditTodoModal } from "@/src/features/modals/EditTodoModal/EditTodoModal";
import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import {
    persistSubtasksExpandedState,
    readSubtasksExpandedState,
} from "@/src/shared/lib/storage/subtasksExpandedState";
import { I_Todo, TodoPriority } from "@/src/shared/model/types/todo";
import { MainCardContent } from "@/src/shared/ui/molecules/TodoItemCardParts/MainCardContent/MainCardContent";
import { PriorityMenuModal } from "@/src/shared/ui/molecules/TodoItemCardParts/PriorityMenuModal/PriorityMenuModal";
import { SubtasksList } from "@/src/shared/ui/molecules/TodoItemCardParts/SubtasksList/SubtasksList";
import { SwipeActions } from "@/src/shared/ui/molecules/TodoItemCardParts/SwipeActions/SwipeActions";
import { styles } from "@/src/widgets/TodoItemCard/TodoItemCard.styles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    LayoutAnimation,
    Animated as RNAnimated,
    TextInput,
    UIManager,
    Vibration,
    View,
} from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
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

    // Загружаем сохранённое состояние разворота для текущей задачи
    useEffect(() => {
        if (!hasSubtasks) return;

        (async () => {
            const value = await readSubtasksExpandedState(id);
            if (typeof value === "boolean") {
                setIsExpanded(value);
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
            void persistSubtasksExpandedState(id, next);
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
        void persistSubtasksExpandedState(id, true);
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
            {/* Обёртка только для основной карточки — swipe-действия по высоте не выходят за её пределы */}
            <View
                style={[
                    styles.mainCardWrapper,
                    hasSubtasks && styles.mainCardWrapperWithStack,
                ]}
            >
                <SwipeActions
                    editStyle={editIconAnimatedStyle}
                    deleteStyle={deleteIconAnimatedStyle}
                />

                <MainCardContent
                    panGesture={panGesture}
                    animatedCardStyle={animatedCardStyle}
                    colors={colors}
                    mode={mode}
                    isEditingTitle={isEditingTitle}
                    editedTitle={editedTitle}
                    title={title}
                    isCompleted={isCompleted}
                    priority={priority}
                    hasSubtasks={hasSubtasks}
                    isExpanded={isExpanded}
                    subtasksCount={subtasks?.length ?? 0}
                    onPressCheck={onPressCheck}
                    onLongPress={onLongPress}
                    onTitlePress={handleTitlePress}
                    onTitleBlur={handleTitleBlur}
                    onTitleSubmit={handleTitleSubmit}
                    onEditedTitleChange={setEditedTitle}
                    onOutsidePress={handleOutsidePress}
                    onToggleExpand={handleToggleExpand}
                    onPriorityPress={handlePriorityPress}
                    priorityButtonRef={priorityButtonRef}
                    titleInputRef={titleInputRef}
                    buttonRef={buttonRef}
                    isMenuOpen={isMenuOpen}
                    onMenuPress={handleMenuButtonPress}
                    menuSlot={
                        isMenuOpen ? (
                            <TodoItemMenu
                                isOpen={isMenuOpen}
                                onClose={() => setIsMenuOpen(false)}
                                onEdit={() => setIsEditModalOpen(true)}
                                onDelete={() => setIsDeleteModalOpen(true)}
                                onAddSubtask={() => setIsAddSubtaskModalOpen(true)}
                                anchorPosition={anchorPosition}
                            />
                        ) : null
                    }
                />
            </View>

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

            <SubtasksList
                subtasks={subtasks}
                isExpanded={isExpanded}
                subtasksOpacity={subtasksOpacity}
                colors={colors}
                mode={mode}
                onCheckSubtask={handleCheckSubtask}
                onDeleteSubtask={handleDeleteSubtask}
            />

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

            <PriorityMenuModal
                isOpen={isPriorityMenuOpen}
                anchorPosition={priorityAnchorPosition}
                priority={priority}
                colors={colors}
                mode={mode}
                onSelect={handlePrioritySelect}
                onClose={closePriorityMenu}
            />
        </View>
    );
};
