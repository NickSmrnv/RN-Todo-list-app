export const getFullFormattedDate = (date: Date) => {
    return (
        new Intl.DateTimeFormat('ru-RU', {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date)
    )
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