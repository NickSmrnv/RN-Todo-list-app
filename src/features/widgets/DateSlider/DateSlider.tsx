import { COLORS } from "@/src/shared/assets/styles/constants/colors-variables";
import { getTodayDate, getYearDates, isSameDate } from "@/src/shared/lib/obj/date";
import { DateItem } from "@/src/shared/ui/atom/DateItem/DateItem";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, TouchableOpacity, View, ViewToken } from "react-native";

interface I_Date_Slider {
    onDateChange: (date: Date) => void;
    initialDate?: Date;
}

const ITEM_WIDTH = 80;

export const DateSlider: React.FC<I_Date_Slider> = ({ onDateChange, initialDate }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate || getTodayDate());
    const [dates, setDates] = useState<Date[]>(() => getYearDates());
    const flatListRef = useRef<FlatList>(null);
    const [viewableItems, setViewableItems] = useState<ViewToken[]>([]);
    const [containerWidth, setContainerWidth] = useState(0);
    const isInitialized = useRef(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastScrollOffset = useRef<number>(0);
    const todayDate = getTodayDate();
    
    // Вычисляем padding для центрирования элементов
    const centerPadding = containerWidth > 0 ? (containerWidth - ITEM_WIDTH) / 2 : 0;
    
    // Вычисляем разницу в днях между выбранной датой и сегодняшней
    const getDaysDifference = (date1: Date, date2: Date): number => {
        const diffTime = date1.getTime() - date2.getTime();
        return Math.round(diffTime / (1000 * 60 * 60 * 24));
    };
    
    const daysDifference = getDaysDifference(selectedDate, todayDate);
    
    // Определяем, нужно ли показывать кнопки возврата (только если ушел больше чем на 3 дня)
    const showLeftButton = daysDifference > 3;
    const showRightButton = daysDifference < -3;

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    };

    useEffect(() => {
        // Инициализация: прокрутка к выбранной дате после получения размеров контейнера
        // Выполняем только один раз при монтировании
        if (containerWidth > 0 && !isInitialized.current) {
            const initialIndex = dates.findIndex(date => isSameDate(date, selectedDate));
            if (initialIndex !== -1 && flatListRef.current) {
                setTimeout(() => {
                    const targetOffset = initialIndex * ITEM_WIDTH;
                    flatListRef.current?.scrollToOffset({
                        offset: targetOffset,
                        animated: false,
                    });
                    isInitialized.current = true;
                }, 100);
            }
        }
    }, [containerWidth]);

    useEffect(() => {
        // Очистка таймеров при размонтировании
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const handleViewableItemsChanged = useRef(({ viewableItems: items }: { viewableItems: ViewToken[] }) => {
        if (items.length > 0) {
            setViewableItems(items);
        }
    }).current;

    const updateSelectedDate = (offsetX: number) => {
        // Вычисляем индекс центрального элемента
        const centerIndex = Math.round(offsetX / ITEM_WIDTH);
        
        // Ограничиваем индекс в пределах массива
        const safeIndex = Math.max(0, Math.min(centerIndex, dates.length - 1));
        
        if (safeIndex >= 0 && safeIndex < dates.length) {
            const newSelectedDate = dates[safeIndex];
            if (newSelectedDate && !isSameDate(newSelectedDate, selectedDate)) {
                setSelectedDate(newSelectedDate);
                onDateChange(newSelectedDate);
            }
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Отменяем предыдущий таймер при каждом скролле
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
        }
        
        const offsetX = event.nativeEvent.contentOffset.x;
        lastScrollOffset.current = offsetX;
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Отменяем любые ожидающие обновления
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
        }

        const offsetX = event.nativeEvent.contentOffset.x;
        lastScrollOffset.current = offsetX;
        
        // Обновляем дату сразу после завершения инерции
        updateSelectedDate(offsetX);
    };

    const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Отменяем предыдущий таймер
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        const offsetX = event.nativeEvent.contentOffset.x;
        lastScrollOffset.current = offsetX;
        
        // Если пользователь отпустил палец, но инерция еще не закончилась,
        // ждем немного, чтобы увидеть, будет ли вызван onMomentumScrollEnd
        scrollTimeoutRef.current = setTimeout(() => {
            // Если onMomentumScrollEnd не был вызван (нет инерции), обновляем дату
            updateSelectedDate(offsetX);
            scrollTimeoutRef.current = null;
        }, 200);
    };

    const scrollToToday = () => {
        const todayIndex = dates.findIndex(date => isSameDate(date, todayDate));
        if (todayIndex !== -1 && flatListRef.current) {
            const targetOffset = todayIndex * ITEM_WIDTH;
            flatListRef.current.scrollToOffset({
                offset: targetOffset,
                animated: true,
            });
            // Обновляем дату после завершения анимации
            setTimeout(() => {
                setSelectedDate(todayDate);
                onDateChange(todayDate);
            }, 300);
        }
    };

    const handleDatePress = (date: Date, index: number) => {
        if (flatListRef.current) {
            // Отменяем любые активные таймеры
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = null;
            }
            
            // Вычисляем точный offset для центрирования элемента
            // offset = index * ITEM_WIDTH (padding уже учтен в contentContainerStyle)
            const targetOffset = index * ITEM_WIDTH;
            
            // Прокручиваем к нужному offset для точного центрирования
            flatListRef.current.scrollToOffset({
                offset: targetOffset,
                animated: true,
            });
            
            // Обновляем выбранную дату сразу и после завершения анимации
            setSelectedDate(date);
            onDateChange(date);
            
            // Дополнительное обновление после анимации для надежности
            setTimeout(() => {
                updateSelectedDate(targetOffset);
            }, 300);
        }
    };

    const renderItem = ({ item, index }: { item: Date; index: number }) => {
        const isSelected = isSameDate(item, selectedDate);
        return (
            <DateItem
                date={item}
                isSelected={isSelected}
                onPress={() => handleDatePress(item, index)}
            />
        );
    };

    const getItemLayout = (_: any, index: number) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
    });

    return (
        <View style={styles.container} onLayout={handleLayout}>
            {containerWidth > 0 && (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={dates}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `${item.getTime()}-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={ITEM_WIDTH}
                        disableIntervalMomentum={false}
                        decelerationRate="fast"
                        contentContainerStyle={[
                            styles.contentContainer,
                            {
                                paddingLeft: centerPadding,
                                paddingRight: centerPadding,
                            }
                        ]}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        onScroll={handleScroll}
                        onScrollEndDrag={handleScrollEndDrag}
                        onMomentumScrollEnd={handleMomentumScrollEnd}
                        scrollEventThrottle={16}
                        viewabilityConfig={{
                            itemVisiblePercentThreshold: 50,
                        }}
                        getItemLayout={getItemLayout}
                        onScrollToIndexFailed={(info) => {
                            // Fallback для случаев, когда индекс еще не готов
                            setTimeout(() => {
                                flatListRef.current?.scrollToIndex({
                                    index: info.index,
                                    animated: true,
                                    viewPosition: 0.5,
                                });
                            }, 100);
                        }}
                    />
                    {showLeftButton && (
                        <TouchableOpacity
                            style={[styles.returnButton, styles.leftButton]}
                            onPress={scrollToToday}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                    {showRightButton && (
                        <TouchableOpacity
                            style={[styles.returnButton, styles.rightButton]}
                            onPress={scrollToToday}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        position: "relative",
    },
    contentContainer: {
        alignItems: "center",
    },
    returnButton: {
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.blue,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        top: "50%",
        marginTop: -20,
        shadowColor: COLORS.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    leftButton: {
        left: 10,
    },
    rightButton: {
        right: 10,
    },
});

