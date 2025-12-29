import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { FLUSH, PAUSE, PERSIST, PersistConfig, persistReducer, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import createTransform from "redux-persist/es/createTransform";
import { baseApi } from "./api/baseApi";
import appReducer from "./slices/appSlice";
import todoReducer from "./slices/todoSlice";

const reducers = combineReducers({
    app: appReducer,
    todo: todoReducer,
    [baseApi.reducerPath]: baseApi.reducer,
})

export type RootState = ReturnType<typeof reducers>

const rtkQueryTransform = createTransform(
    (inboundState: any) => {
        return undefined;
    },
    (outBoundState: any) => {
        return undefined;
    },
    { whitelist: [baseApi.reducerPath]}
)

const persistConfig: PersistConfig<RootState> = {
    key: "root",
    storage: AsyncStorage,
    blacklist: [baseApi.reducerPath],
    transforms: [rtkQueryTransform]
}

const persistedReducer = persistReducer(persistConfig, reducers)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefuaultMiddleware) => 
        getDefuaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            },
        }).concat(baseApi.middleware),
        devTools: process.env.NODE_ENV !== "production",
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;




