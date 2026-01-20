import React, { createContext, useContext } from "react";

export interface I_KeyboardScrollContext {
    scrollToShowInput: (layout: { y: number; height: number }) => void;
}

export const KeyboardScrollContext = createContext<I_KeyboardScrollContext | null>(null);

export function useKeyboardScroll(): I_KeyboardScrollContext | null {
    return useContext(KeyboardScrollContext);
}
