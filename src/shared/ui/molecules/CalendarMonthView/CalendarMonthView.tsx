import { useTheme } from "@/src/shared/lib/context/ThemeContext";
import { getMonthGrid, getMonthTitle, isSameDate } from "@/src/shared/lib/obj/date";
import { CustomText } from "@/src/shared/ui/atom/_Custom/CustomText/CustomText";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export interface I_CalendarMonthView {
    year: number;
    month: number;
    datesWithTasks: Set<string>;
    cellSize: number;
    onDatePress?: (date: Date) => void;
}

export const CalendarMonthView: React.FC<I_CalendarMonthView> = ({
    year,
    month,
    datesWithTasks,
    cellSize,
    onDatePress,
}) => {
    const { colors } = useTheme();
    const grid = getMonthGrid(year, month);
    const today = new Date();

    return (
        <View style={styles.monthWrap}>
            <CustomText variant="subtitle" style={styles.monthTitle}>
                {getMonthTitle(year, month)}
            </CustomText>

            <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((l) => (
                    <View key={l} style={[styles.weekdayCell, { width: cellSize }]}>
                        <CustomText variant="small" style={{ color: colors.mutedText }}>
                            {l}
                        </CustomText>
                    </View>
                ))}
            </View>
            <View style={styles.grid}>
                {grid.map((cell, i) => {
                    const key = cell.date ? `${year}-${month}-${cell.date.getDate()}` : `e-${i}`;
                    const hasTask = cell.date ? datesWithTasks.has(`${year}-${month}-${cell.date.getDate()}`) : false;
                    const isToday = cell.date ? isSameDate(cell.date, today) : false;
                    const cellContent = cell.date ? (
                        <>
                            <CustomText
                                variant="small"
                                style={[
                                    styles.cellDay,
                                    !cell.isCurrentMonth && styles.cellDayMuted,
                                    isToday && styles.cellDayToday,
                                ]}
                            >
                                {cell.date.getDate()}
                            </CustomText>
                            {hasTask && (
                                <View
                                    style={[
                                        styles.dot,
                                        { backgroundColor: colors.primary },
                                    ]}
                                />
                            )}
                        </>
                    ) : null;

                    return (
                        <View key={key} style={[styles.cell, { width: cellSize, height: cellSize }]}>
                            {cell.date && onDatePress ? (
                                <Pressable
                                    onPress={() => onDatePress(cell.date!)}
                                    style={styles.cellPressable}
                                >
                                    {cellContent}
                                </Pressable>
                            ) : (
                                cellContent
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    monthWrap: {
        paddingVertical: 8,
    },
    monthTitle: {
        textAlign: "center",
        textTransform: "capitalize",
        marginBottom: 14,
    },
    weekdayRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    weekdayCell: {
        alignItems: "center",
        justifyContent: "center",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    cell: {
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 2,
    },
    cellPressable: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 2,
    },
    cellDay: {
        fontSize: 14,
    },
    cellDayMuted: {
        opacity: 0.35,
    },
    cellDayToday: {
        fontWeight: "700",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 2,
    },
});
