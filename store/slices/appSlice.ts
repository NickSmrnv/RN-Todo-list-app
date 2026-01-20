import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum Lang {
    EU = "eu",
    RU = "ru",
}

export interface I_App_Slice {
    lang: Lang;
}

export interface I_Update_App_Settings_Payload {
    lang: Lang,
}

const initialState = {
    lang: Lang.RU,
}

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateAppSettings: (
            state: I_App_Slice,
            action: PayloadAction<I_Update_App_Settings_Payload>
        ) => {
            const { lang } = action.payload;
            state.lang = lang;
        }
    }
})

export const { 
    updateAppSettings, 
} = appSlice.actions;

export const selectAppSettings = (state: { app: I_App_Slice }): I_App_Slice => state.app

export default appSlice.reducer;





