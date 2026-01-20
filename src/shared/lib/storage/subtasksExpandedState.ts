import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPANDED_STATE_KEY = "subtasksExpandedState";

export const readSubtasksExpandedState = async (
    todoId: string | number
): Promise<boolean | undefined> => {
    try {
        const stored = await AsyncStorage.getItem(EXPANDED_STATE_KEY);
        if (!stored) return undefined;
        const map = JSON.parse(stored) as Record<string, boolean>;
        const value = map[String(todoId)];
        return typeof value === "boolean" ? value : undefined;
    } catch (error) {
        console.error("Ошибка чтения состояния разворота подзадач:", error);
        return undefined;
    }
};

export const persistSubtasksExpandedState = async (
    todoId: string | number,
    next: boolean
): Promise<void> => {
    try {
        const stored = await AsyncStorage.getItem(EXPANDED_STATE_KEY);
        const map = stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
        map[String(todoId)] = next;
        await AsyncStorage.setItem(EXPANDED_STATE_KEY, JSON.stringify(map));
    } catch (error) {
        console.error("Ошибка сохранения состояния разворота подзадач:", error);
    }
};
