import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { AppTheme } from "@/src/shared/lib/context/ThemeContext";
import { getPriorityColor } from "@/src/shared/lib/obj/priority";
import { TodoPriority } from "@/src/shared/model/types/todo";
import { CustomButton } from "@/src/shared/ui/atom/_Custom/CustomButton/CustomButton";
import { CustomCheckbox } from "@/src/shared/ui/atom/_Custom/CustomCheckbox/CustomCheckbox";
import React from "react";
import {
    Pressable,
    StyleProp,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { styles } from "./MainCardContent.styles";

interface MainCardContentProps {
    panGesture: any;
    animatedCardStyle: StyleProp<ViewStyle>;
    colors: AppTheme["colors"];
    mode: AppTheme["mode"];
    isEditingTitle: boolean;
    editedTitle: string;
    title: string;
    isCompleted: boolean;
    priority?: TodoPriority;
    hasSubtasks: boolean;
    subtasksCount: number;
    onPressCheck: () => void;
    onLongPress?: () => void;
    onTitlePress: () => void;
    onTitleBlur: () => void;
    onTitleSubmit: () => void;
    onEditedTitleChange: (value: string) => void;
    onOutsidePress: () => void;
    onToggleExpand: () => void;
    onPriorityPress: () => void;
    priorityButtonRef: React.MutableRefObject<View | null>;
    titleInputRef: React.MutableRefObject<TextInput | null>;
    buttonRef: React.MutableRefObject<View | null>;
    isMenuOpen: boolean;
    onMenuPress: () => void;
    menuSlot?: React.ReactNode;
}

export const MainCardContent: React.FC<MainCardContentProps> = ({
    panGesture,
    animatedCardStyle,
    colors,
    mode,
    isEditingTitle,
    editedTitle,
    title,
    isCompleted,
    priority,
    hasSubtasks,
    subtasksCount,
    onPressCheck,
    onLongPress,
    onTitlePress,
    onTitleBlur,
    onTitleSubmit,
    onEditedTitleChange,
    onOutsidePress,
    onToggleExpand,
    onPriorityPress,
    priorityButtonRef,
    titleInputRef,
    buttonRef,
    isMenuOpen,
    onMenuPress,
    menuSlot,
}) => (
    <GestureDetector gesture={panGesture}>
        <Animated.View
            style={[
                styles.mainCard,
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
                onOutsidePress();
                return false;
            }}
        >
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
                            onChangeText={onEditedTitleChange}
                            onBlur={onTitleBlur}
                            onSubmitEditing={onTitleSubmit}
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
                            onPress={onTitlePress}
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
                                onPress={onPriorityPress}
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
                            onPress={onMenuPress}
                            onLongPress={onLongPress}
                            style={isMenuOpen ? styles.menuButtonActive : styles.menuButton}
                        />
                    </View>
                    {menuSlot}
                </View>
            </Pressable>

            {hasSubtasks && (
                <Pressable
                    onPress={onToggleExpand}
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
                        {subtasksCount}
                    </Text>
                </Pressable>
            )}
        </Animated.View>
    </GestureDetector>
);
