import { ThemeProvider } from "@/src/shared/lib/context/ThemeContext";
import { configureNotifications, scheduleDailyMotivationReminder } from "@/src/shared/lib/notifications/reminders";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import store from "../store";

const persister = persistStore(store)

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function RootLayout() {
    useEffect(() => {
        configureNotifications();
        scheduleDailyMotivationReminder();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persister}>
                    <ThemeProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                    </ThemeProvider>
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    );
}
