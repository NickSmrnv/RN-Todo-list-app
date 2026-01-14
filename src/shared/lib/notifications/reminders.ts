import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { I_Todo } from "../../model/types/todo";
import { getTodayDate, isSameDate } from "../obj/date";

type ReminderType = "todo-reminder" | "motivation-daily";

const DEFAULT_REMINDER_HOUR = 18;
const DEFAULT_REMINDER_MINUTE = 0;

const DAILY_MOTIVATION_HOUR = 10;
const DAILY_MOTIVATION_MINUTE = 0;

const ensurePermissions = async (): Promise<boolean> => {
    const existingPermissions = await Notifications.getPermissionsAsync();
    if (existingPermissions.status === "granted") return true;

    const requestedPermissions = await Notifications.requestPermissionsAsync();
    return requestedPermissions.status === "granted";
};

export const configureNotifications = async () => {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("reminders", {
            name: "Напоминания",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            sound: "default",
        });
    }
};

const cancelNotificationsByType = async (reminderType: ReminderType) => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled
        .filter((item) => item.content?.data?.reminderType === reminderType)
        .map((item) => item.identifier);

    await Promise.all(toCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
};

const buildReminderBody = (todos: I_Todo[]): string => {
    const firstTodos = todos.slice(0, 3).map((todo) => `• ${todo.title}`);
    const remaining = todos.length - firstTodos.length;
    const summary = `${todos.length} незавершённ${todos.length === 1 ? "ая" : "ых"} задач${todos.length === 1 ? "а" : "и"} на сегодня`;

    return remaining > 0
        ? `${summary}\n${firstTodos.join("\n")}\n+${remaining} ещё`
        : `${summary}\n${firstTodos.join("\n")}`;
};

export const refreshIncompleteTodosReminder = async (
    todos: I_Todo[],
    reminderHour: number = DEFAULT_REMINDER_HOUR,
    reminderMinute: number = DEFAULT_REMINDER_MINUTE
) => {
    if (Platform.OS === "web") {
        return { scheduled: false, reason: "unsupported-platform" } as const;
    }

    const hasPermission = await ensurePermissions();
    if (!hasPermission) {
        return { scheduled: false, reason: "permissions-denied" } as const;
    }

    await configureNotifications();

    // Убираем старые напоминания этого типа перед постановкой нового
    await cancelNotificationsByType("todo-reminder");

    const today = getTodayDate();
    const incompleteForToday = todos.filter((todo) => {
        if (todo.isCompleted || !todo.date) return false;
        const todoDate = typeof todo.date === "string" ? new Date(todo.date) : todo.date;
        return isSameDate(todoDate, today);
    });

    if (incompleteForToday.length === 0) {
        return { scheduled: false, reason: "no-incomplete-todos" } as const;
    }

    const triggerDate = new Date();
    triggerDate.setHours(reminderHour, reminderMinute, 0, 0);
    if (triggerDate <= new Date()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Незавершённые задачи",
            body: buildReminderBody(incompleteForToday),
            sound: true,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
            data: {
                reminderType: "todo-reminder" as ReminderType,
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
            channelId: "reminders",
        },
    });

    return { scheduled: true, notificationId, triggerDate, count: incompleteForToday.length } as const;
};

const motivationPhrases: string[] = [
    "Отличный день, чтобы закрыть первую задачу!",
    "Маленький шаг сейчас — большой результат вечером.",
    "Ты уже молодец: продолжай в том же духе.",
    "Начни с простой задачи и разгони продуктивность.",
    "Фокус на важном: выбери одну задачу и сделай её первой.",
    "Каждая галочка приближает к цели. Вперёд!",
    "Ты справишься. Сделай первый шаг прямо сейчас.",
    "5 минут на старт — и поток пойдёт сам.",
];

const getRandomMotivation = () => {
    const idx = Math.floor(Math.random() * motivationPhrases.length);
    return motivationPhrases[idx];
};

export const scheduleDailyMotivationReminder = async (
    hour: number = DAILY_MOTIVATION_HOUR,
    minute: number = DAILY_MOTIVATION_MINUTE
) => {
    if (Platform.OS === "web") {
        return { scheduled: false, reason: "unsupported-platform" } as const;
    }

    const hasPermission = await ensurePermissions();
    if (!hasPermission) {
        return { scheduled: false, reason: "permissions-denied" } as const;
    }

    await configureNotifications();
    await cancelNotificationsByType("motivation-daily");

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Доброе утро!",
            body: getRandomMotivation(),
            sound: true,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
            data: {
                reminderType: "motivation-daily" as ReminderType,
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: "reminders",
        },
    });

    return { scheduled: true, notificationId, hour, minute } as const;
};

