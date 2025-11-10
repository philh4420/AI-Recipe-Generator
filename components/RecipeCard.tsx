import React, { useState, useRef } from 'react';
import type { Recipe } from '../types';

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);


const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-semibold text-[--card-foreground] mb-3 border-b-2 border-[--primary]/30 pb-2">{title}</h3>
        {children}
    </div>
);

interface RecipeCardProps {
    recipe: Recipe;
    onSave?: (recipe: Recipe) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    isSaved?: boolean;
    isSavedView?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSave, onDelete, isSaved, isSavedView }) => {
    const [isSaving, setIsSaving] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    
    const handleSave = async () => {
        if (onSave) {
            setIsSaving(true);
            await onSave(recipe);
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (onDelete && recipe.id) {
            await onDelete(recipe.id);
        }
    };

    const handlePrint = () => {
        const node = cardRef.current;
        if (!node) return;

        const onAfterPrint = () => {
            node.classList.remove('printing-container');
            window.removeEventListener('afterprint', onAfterPrint);
        };

        window.addEventListener('afterprint', onAfterPrint);
        node.classList.add('printing-container');
        window.print();
    };

    return (
        <div ref={cardRef} className="bg-[--card] rounded-2xl shadow-lg animate-fade-in flex flex-col">
            <div className='p-8 flex-grow'>
                <h2 className="text-3xl font-bold text-[--card-foreground] mb-2">{recipe.recipeName}</h2>
                <p className="text-[--muted-foreground] mb-6">{recipe.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-8 text-sm text-[--accent-foreground]">
                    <div className="flex items-center gap-2 bg-[--accent] p-3 rounded-lg">
                        <ClockIcon className="h-5 w-5 text-[--primary]" />
                        <div>
                            <span className="font-semibold">Prep Time:</span> {recipe.prepTime}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[--accent] p-3 rounded-lg">
                        <ClockIcon className="h-5 w-5 text-[--primary]" />
                        <div>
                            <span className="font-semibold">Cook Time:</span> {recipe.cookTime}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Section title="Ingredients">
                            <ul className="space-y-2 list-disc list-inside text-[--card-foreground]">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index}>{ingredient}</li>
                                ))}
                            </ul>
                        </Section>
                    </div>
                    <div className="lg:col-span-2">
                        <Section title="Instructions">
                            <ol className="space-y-4 text-[--card-foreground]">
                                {recipe.instructions.map((step, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-3 flex-shrink-0 bg-[--primary] text-[--primary-foreground] font-bold h-6 w-6 rounded-full text-sm flex items-center justify-center">{index + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </Section>
                    </div>
                </div>
            </div>
             <div className="p-6 bg-[--muted]/50 rounded-b-2xl border-t border-[--border] no-print">
                 <div className="flex gap-4 items-center">
                    <div className="flex-grow">
                        {isSavedView && onDelete ? (
                             <button
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[--destructive] bg-transparent hover:bg-[--destructive]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--destructive] focus:ring-offset-[--card] transition-colors"
                            >
                                <TrashIcon className="h-5 w-5" />
                                Delete Recipe
                            </button>
                        ) : onSave && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving || isSaved}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-[--primary] rounded-md shadow-sm text-sm font-medium text-[--primary] bg-transparent hover:bg-[--primary]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? (
                                   <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                   </>
                                ) : isSaved ? (
                                    <>
                                       <HeartIcon className="h-5 w-5 text-[--primary]" />
                                        Saved!
                                    </>
                                ) : (
                                     <>
                                        <HeartIcon className="h-5 w-5" />
                                        Save Recipe
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex-shrink-0 flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[--muted-foreground] bg-transparent hover:bg-[--muted] hover:text-[--foreground] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] transition-colors"
                        aria-label="Print Recipe"
                    >
                        <PrintIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                </div>
            </div>
        </div>
    );
};