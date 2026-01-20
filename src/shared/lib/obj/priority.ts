import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { TodoPriority } from "@/src/shared/model/types/todo";

export const getPriorityColor = (priority?: TodoPriority): string => {
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
