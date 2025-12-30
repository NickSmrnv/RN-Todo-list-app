import { getDateRange, getTodayDate, isSameDate } from "@/src/shared/lib/obj/date";
import { DateItem } from "@/src/shared/ui/atom/DateItem/DateItem";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View, ViewToken } from "react-native";

interface I_Date_Slider {
    onDateChange: (date: Date) => void;
    initialDate?: Date;
}

const ITEM_WIDTH = 80;

export const DateSlider: React.FC<I_Date_Slider> = ({ onDateChange, initialDate }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate || getTodayDate());
    const [dates, setDates] = useState<Date[]>(() => getDateRange(selectedDate, 7, 7));
    const flatListRef = useRef<FlatList>(null);
    const [viewableItems, setViewableItems] = useState<ViewToken[]>([]);
    const [containerWidth, setContainerWidth] = useState(0);
    const isInitialized = useRef(false);
    
    // Вычисляем padding для центрирования элементов
    const centerPadding = containerWidth > 0 ? (containerWidth - ITEM_WIDTH) / 2 : 0;

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

    const centerItem = (offsetX: number) => {
        // Вычисляем ближайший индекс и центрируем элемент
        const centerIndex = Math.round(offsetX / ITEM_WIDTH);
        const targetOffset = centerIndex * ITEM_WIDTH;
        
        // Если элемент не идеально по центру, центрируем его
        if (Math.abs(offsetX - targetOffset) > 1 && flatListRef.current && centerIndex >= 0 && centerIndex < dates.length) {
            flatListRef.current.scrollToOffset({
                offset: targetOffset,
                animated: true,
            });
        }
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        centerItem(offsetX);
        updateSelectedDate(offsetX);
    };

    const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Не делаем ничего здесь - snapToInterval и handleMomentumScrollEnd обработают центрирование
        // Это предотвращает конфликты при свайпе
    };

    const handleDatePress = (date: Date, index: number) => {
        if (flatListRef.current) {
            // Вычисляем точный offset для центрирования элемента
            // offset = index * ITEM_WIDTH (padding уже учтен в contentContainerStyle)
            const targetOffset = index * ITEM_WIDTH;
            
            // Прокручиваем к нужному offset для точного центрирования
            flatListRef.current.scrollToOffset({
                offset: targetOffset,
                animated: true,
            });
            
            // Обновляем выбранную дату
            setSelectedDate(date);
            onDateChange(date);
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
                    onScrollEndDrag={handleScrollEndDrag}
                    onMomentumScrollEnd={handleMomentumScrollEnd}
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
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    contentContainer: {
        alignItems: "center",
    },
});

