import React, { useState, useMemo } from 'react';
import type { Recipe } from '../types';

// --- ICONS ---
const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ClipboardListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const TimerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


// --- TIMER DETECTION LOGIC ---
const detectTime = (instruction: string): string | null => {
    // Regex to find patterns like "10 minutes", "1 hour", "30-40 mins"
    const timeRegex = /(\d{1,2}(?:-\d{1,2})?)\s+(minutes|minute|mins|min|hours|hour|hrs|hr)/i;
    const match = instruction.match(timeRegex);
    if (match) {
        // e.g., "10 minutes"
        return `${match[1]} ${match[2]}`;
    }
    return null;
};

// --- MAIN COMPONENT ---
interface CookingModeProps {
    recipe: Recipe;
    onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showIngredients, setShowIngredients] = useState(false);
    const totalSteps = recipe.instructions.length;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose(); // Finish on the last step
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const currentInstruction = recipe.instructions[currentStep];
    const detectedTime = useMemo(() => detectTime(currentInstruction), [currentInstruction]);

    return (
        <div className="fixed inset-0 bg-[--background] z-50 flex flex-col animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="cooking-mode-title">
            {/* Header */}
            <header className="flex-shrink-0 bg-[--card] border-b border-[--border]">
                <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex-1 text-left">
                        <button 
                            onClick={() => setShowIngredients(true)} 
                            className="flex items-center gap-2 text-sm font-semibold text-[--foreground] hover:text-[--primary] transition-colors"
                            aria-label="View Ingredients"
                        >
                            <ClipboardListIcon className="h-6 w-6" />
                            <span className="hidden sm:inline">View Ingredients</span>
                        </button>
                    </div>
                    <div className="flex-1 text-center">
                        <h2 id="cooking-mode-title" className="text-lg font-bold truncate" title={recipe.recipeName}>{recipe.recipeName}</h2>
                    </div>
                    <div className="flex-1 text-right">
                        <button 
                            onClick={onClose}
                             className="flex items-center gap-2 text-sm font-semibold text-[--foreground] hover:text-[--primary] transition-colors ml-auto"
                            aria-label="Exit Cooking Mode"
                        >
                            <span className="hidden sm:inline">Exit</span>
                            <CloseIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center text-center p-4 sm:p-8">
                <p className="text-lg font-semibold text-[--primary] mb-4">Step {currentStep + 1} of {totalSteps}</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-light max-w-4xl mx-auto leading-relaxed">
                    {currentInstruction}
                </p>
                {detectedTime && (
                    <button className="mt-8 flex items-center gap-2 py-2 px-4 border border-[--border] rounded-full text-sm font-semibold text-[--muted-foreground] bg-transparent hover:bg-[--muted] hover:text-[--foreground] transition-colors">
                        <TimerIcon className="h-5 w-5" />
                        Start Timer ({detectedTime})
                    </button>
                )}
            </main>

            {/* Footer Navigation */}
            <footer className="flex-shrink-0 bg-[--card] border-t border-[--border]">
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 py-3 px-6 rounded-lg text-base font-semibold text-[--foreground] bg-transparent hover:bg-[--muted] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous Step"
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                        <span>Prev</span>
                    </button>
                     <button
                        onClick={handleNext}
                        className="flex items-center gap-2 py-3 px-6 rounded-lg text-base font-semibold text-[--primary-foreground] bg-[--primary] hover:brightness-95 transition-colors"
                        aria-label={currentStep === totalSteps - 1 ? 'Finish Cooking' : 'Next Step'}
                    >
                        <span>{currentStep === totalSteps - 1 ? 'Finish' : 'Next'}</span>
                        <ChevronRightIcon className="h-6 w-6" />
                    </button>
                </div>
            </footer>
            
            {/* Ingredients Panel */}
            <div className={`mobile-menu-overlay fixed inset-0 bg-black/50 z-10 ${showIngredients ? 'open' : ''}`} onClick={() => setShowIngredients(false)}></div>
            <aside className={`cooking-mode-ingredients fixed top-0 right-0 h-full w-full max-w-sm bg-[--card] shadow-lg z-20 p-6 flex flex-col border-l border-[--border] ${showIngredients ? 'open' : ''}`}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-xl font-bold">Ingredients</h3>
                    <button onClick={() => setShowIngredients(false)} className="p-1 rounded-full hover:bg-[--muted]" aria-label="Close ingredients panel">
                        <CloseIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    <ul className="space-y-3 list-disc list-inside text-[--foreground]">
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index} className="ml-2">{ingredient}</li>
                        ))}
                    </ul>
                </div>
            </aside>

        </div>
    );
};