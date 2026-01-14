import { ThemeProvider } from "@/src/shared/lib/context/ThemeContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import store from "../store";

const persister = persistStore(store)

export default function RootLayout() {
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
