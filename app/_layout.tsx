import { ThemeProvider } from "@/src/shared/lib/context/ThemeContext";
// import { configureNotifications, scheduleDailyMotivationReminder } from "@/src/shared/lib/notifications/reminders";
import { createStackNavigator, StackCardStyleInterpolator } from "@react-navigation/stack";
// import * as Notifications from "expo-notifications";
import { withLayoutContext } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import store from "../store";

const { Navigator } = createStackNavigator();
const CustomStack = withLayoutContext(Navigator);

const persister = persistStore(store)

// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: true,
//         shouldSetBadge: false,
//         shouldShowBanner: true,
//         shouldShowList: true,
//     }),
// });

export default function RootLayout() {
    // useEffect(() => {
    //     configureNotifications();
    //     scheduleDailyMotivationReminder();
    // }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persister}>
                    <ThemeProvider>
                        <CustomStack
                            screenOptions={{
                                headerShown: false,
                            }}
                        >
                            <CustomStack.Screen 
                                name="index" 
                            />
                            <CustomStack.Screen 
                                name="stats"
                                options={{
                                    cardStyleInterpolator: (({ current, layouts }) => {
                                        return {
                                            cardStyle: {
                                                transform: [
                                                    {
                                                        translateY: current.progress.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [-layouts.screen.height, 0],
                                                        }),
                                                    },
                                                ],
                                            },
                                        };
                                    }) as StackCardStyleInterpolator,
                                }}
                            />
                            <CustomStack.Screen name="calendar" />
                        </CustomStack>
                    </ThemeProvider>
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    );
}
