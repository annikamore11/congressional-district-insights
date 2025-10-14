import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StatCarousel({ children }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Convert children to array if it isn't already
    const cards = React.Children.toArray(children);
    const totalCards = cards.length;

    const goToPrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => Math.min(totalCards - 1, prev + 1));
    };

    return (
        <>
            {/* Mobile Carousel */}
            <div className="md:hidden">
                <div className="relative">
                    {/* Carousel Container */}
                    <div className="overflow-hidden">
                        <div 
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {cards.map((card, index) => (
                                <div key={index} className="w-full flex-shrink-0 px-2">
                                    {card}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button 
                            onClick={goToPrevious}
                            disabled={currentIndex === 0}
                            className="p-2 rounded-full bg-white border border-gray-300 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            aria-label="Previous card"
                        >
                            <ChevronLeft size={20} className="text-gray-700" />
                        </button>
                        
                        {/* Dot Indicators */}
                        <div className="flex gap-2">
                            {cards.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all ${
                                        index === currentIndex 
                                            ? 'w-6 bg-purple-600' 
                                            : 'w-2 bg-gray-300'
                                    }`}
                                    aria-label={`Go to card ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button 
                            onClick={goToNext}
                            disabled={currentIndex === totalCards - 1}
                            className="p-2 rounded-full bg-white border border-gray-300 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            aria-label="Next card"
                        >
                            <ChevronRight size={20} className="text-gray-700" />
                        </button>
                    </div>

                    {/* Card Counter */}
                    <p className="text-center text-xs text-gray-500 mt-2">
                        {currentIndex + 1} of {totalCards}
                    </p>
                </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-4 gap-4">
                {cards}
            </div>
        </>
    );
}