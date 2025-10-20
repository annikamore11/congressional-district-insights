import React, { useState, useRef } from 'react';

export default function StatCarousel({ children }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const containerRef = useRef(null);
    
    const cards = React.Children.toArray(children);
    const totalCards = cards.length;
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(0);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentIndex < totalCards - 1) {
            setCurrentIndex(currentIndex + 1);
        }
        if (isRightSwipe && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <>
            {/* Mobile Carousel */}
            <div className="md:hidden relative pb-6">
                <div 
                    ref={containerRef}
                    className="overflow-hidden"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div 
                        className="flex transition-transform duration-300 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {cards.map((card, index) => (
                            <div 
                                key={index} 
                                className="w-full flex-shrink-0 px-4"
                            >
                                {card}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex justify-center gap-1.5 mt-4">
                    {cards.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                index === currentIndex 
                                    ? 'w-6 bg-purple-600' 
                                    : 'w-1.5 bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop Grid */}
            <div className={`hidden md:grid gap-4 ${cards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
                {cards}
            </div>
        </>
    );
}