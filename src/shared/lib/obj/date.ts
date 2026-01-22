export const getFullFormattedDate = (date: Date) => {
    return (
        new Intl.DateTimeFormat('ru-RU', {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date)
    )
}

/** Полный формат даты: "11 января 2026 год" */
export const getFullDateLabel = (date: Date): string => {
    const formatted = getFullFormattedDate(date);
    // Заменяем "г." на "год" для полного формата
    return formatted.replace(/г\.?$/, "");
}

export const getDateRange = (centerDate: Date, daysBefore: number = 7, daysAfter: number = 7): Date[] => {
    const dates: Date[] = [];
    const startDate = new Date(centerDate);
    startDate.setDate(startDate.getDate() - daysBefore);

    for (let i = 0; i <= daysBefore + daysAfter; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
    }

    return dates;
}

export const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

export const getTodayDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

export const getDateLabel = (date: Date): string => {
    const today = getTodayDate();
    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    switch (diffDays) {
        case 0:
            return "сегодня";
        case -1:
            return "вчера";
        case -2:
            return "позавчера";
        case 1:
            return "завтра";
        case 2:
            return "послезавтра";
        default:
            // Формат "день месяц"
            return new Intl.DateTimeFormat('ru-RU', {
                day: "numeric",
                month: "short"
            }).format(date).replace('.', '');
    }
}

/** Понедельник = 0. Возвращает ячейки сетки 6×7 для календаря (пн–вс). */
export const getMonthGrid = (year: number, month: number): { date: Date | null; isCurrentMonth: boolean }[] => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const lastDay = last.getDate();
    // Пн=0, Вс=6
    const startOffset = (first.getDay() + 6) % 7;
    const cells: { date: Date | null; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < startOffset; i++) {
        cells.push({ date: null, isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay; d++) {
        cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    const total = cells.length;
    const pad = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 0; i < pad; i++) {
        cells.push({ date: null, isCurrentMonth: false });
    }
    return cells;
};

export const isOverdue = (date: Date): boolean => {
    const dNorm = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const tNorm = getTodayDate().getTime();
    return dNorm < tNorm;
};

/** Для списка: "15 янв" или "15 янв. 2026" если другой год. */
export const getShortDateLabel = (date: Date): string => {
    const y = date.getFullYear();
    const needYear = y !== new Date().getFullYear();
    return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
        ...(needYear && { year: "numeric" }),
    })
        .format(date)
        .replace(".", "");
};

export const getMonthTitle = (year: number, month: number): string => {
    return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
};

export const getYearDates = (year?: number): Date[] => {
    const targetYear = year || new Date().getFullYear();
    const dates: Date[] = [];

    // Начинаем с 1 января
    const startDate = new Date(targetYear, 0, 1);
    startDate.setHours(0, 0, 0, 0);

    // Заканчиваем 31 декабря
    const endDate = new Date(targetYear, 11, 31);
    endDate.setHours(0, 0, 0, 0);

    // Генерируем все даты от 1 января до 31 декабря
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}