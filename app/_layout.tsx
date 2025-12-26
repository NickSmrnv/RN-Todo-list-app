import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import store from "../store";

const persister = persistStore(store)

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persister}>
                    <Stack screenOptions={{ headerShown: false }} />
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    );
}
