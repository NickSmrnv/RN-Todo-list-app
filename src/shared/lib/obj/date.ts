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

/**
 * Вычисляет день недели для заданной даты (алгоритм Зеллера)
 * Возвращает: 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Сб, 6=Вс
 * Не зависит от локальных настроек и часовых поясов
 */
const getWeekday = (year: number, month: number, day: number): number => {
    // Алгоритм Зеллера: работает с григорианским календарем
    // month: 1=январь, 12=декабрь (в JavaScript month: 0=январь, 11=декабрь)
    const m = month + 1;
    const y = m < 3 ? year - 1 : year;
    const mAdj = m < 3 ? m + 12 : m;
    const yAdj = y % 100;
    const c = Math.floor(y / 100);
    
    // Формула Зеллера: день недели (0=суббота, 1=воскресенье, ..., 6=пятница)
    const w = (day + Math.floor((13 * (mAdj + 1)) / 5) + yAdj + Math.floor(yAdj / 4) + Math.floor(c / 4) - 2 * c) % 7;
    
    // Преобразуем в формат: 0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Сб, 6=Вс
    return (w + 5) % 7;
};

/** Понедельник = 0. Возвращает ячейки сетки 6×7 для календаря (пн–вс). */
export const getMonthGrid = (year: number, month: number): { date: Date | null; isCurrentMonth: boolean }[] => {
    // Вычисляем количество дней в месяце
    const last = new Date(year, month + 1, 0);
    const lastDay = last.getDate();
    
    // Вычисляем день недели для первого дня месяца (0=Пн, 6=Вс)
    const startOffset = getWeekday(year, month, 1);
    
    const cells: { date: Date | null; isCurrentMonth: boolean }[] = [];

    // Добавляем пустые ячейки до первого дня месяца
    for (let i = 0; i < startOffset; i++) {
        cells.push({ date: null, isCurrentMonth: false });
    }
    
    // Добавляем дни месяца
    for (let d = 1; d <= lastDay; d++) {
        // Создаем дату в локальном времени, устанавливаем время на полдень для избежания проблем с часовыми поясами
        const date = new Date(year, month, d, 12, 0, 0, 0);
        cells.push({ date, isCurrentMonth: true });
    }
    
    // Добавляем пустые ячейки до конца недели
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