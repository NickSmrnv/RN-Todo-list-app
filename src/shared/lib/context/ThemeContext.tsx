import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark";
type ThemePreference = "system" | ThemeMode;

interface ThemeColors {
    background: string;
    card: string;
    text: string;
    mutedText: string;
    border: string;
    inputBackground: string;
    primary: string;
    accent: string;
    overlay: string;
}

export interface AppTheme {
    mode: ThemeMode;
    colors: ThemeColors;
}

interface ThemeContextValue extends AppTheme {
    /** Текущий выбор пользователя: системная, светлая или тёмная тема */
    preference: ThemePreference;
    /** Изменить предпочтение темы */
    setPreference: (preference: ThemePreference) => void;
}

const lightColors: ThemeColors = {
    background: "#F3F4F6",
    card: COLORS.white,
    text: COLORS.black,
    mutedText: "#6B7280",
    border: "#D1D5DB",
    inputBackground: COLORS.white,
    primary: COLORS.blue,
    accent: COLORS.pink,
    overlay: "rgba(0, 0, 0, 0.7)",
};

const darkColors: ThemeColors = {
    background: "#020617",
    card: "#111827",
    text: COLORS.white,
    mutedText: "#9CA3AF",
    border: "#374151",
    inputBackground: "#020617",
    primary: COLORS.light_blue,
    accent: COLORS.pink,
    overlay: "rgba(0, 0, 0, 0.7)",
};

const defaultTheme: ThemeContextValue = {
    mode: "light",
    colors: lightColors,
    preference: "system",
    setPreference: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultTheme);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [preference, setPreference] = useState<ThemePreference>("system");

    const value = useMemo<ThemeContextValue>(() => {
        const resolvedMode: ThemeMode =
            preference === "system"
                ? systemScheme === "dark"
                    ? "dark"
                    : "light"
                : preference;

        return {
            mode: resolvedMode,
            colors: resolvedMode === "dark" ? darkColors : lightColors,
            preference,
            setPreference,
        };
    }, [systemScheme, preference]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
