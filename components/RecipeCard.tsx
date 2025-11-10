import React, { useState, useRef, useId } from 'react';
import type { Recipe } from '../types';
import { useToast } from '../hooks/useToast';

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const PlateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12a10.5 10.5 0 0110.5-10.5c.321 0 .639.023.95.067 2.923.41 5.485 2.298 6.64 4.968.12.28.232.568.336.861 2.05 5.922-1.39 12.322-7.313 14.372-5.922 2.05-12.322-1.39-14.372-7.313A10.463 10.463 0 012.25 12z" />
    </svg>
);


const Section: React.FC<{ title: string; children: React.ReactNode; extra?: React.ReactNode }> = ({ title, children, extra }) => (
    <div>
        <div className="flex justify-between items-center mb-3">
             <h3 className="text-lg font-semibold text-[--foreground]">{title}</h3>
             {extra}
        </div>
        {children}
    </div>
);

interface RecipeCardProps {
    recipe: Recipe;
    onSave?: (recipe: Recipe) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    isSaved?: boolean;
    isSavedView?: boolean;
    isDemo?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSave, onDelete, isSaved, isSavedView, isDemo }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const { addToast } = useToast();
    
    const handleSave = async () => {
        if (onSave) {
            setIsSaving(true);
            await onSave(recipe);
            setIsSaving(false);
            setJustSaved(true);
            setTimeout(() => {
                setJustSaved(false);
            }, 1500);
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

    const handleCopyIngredients = () => {
        const ingredientsText = recipe.ingredients.join('\n');
        navigator.clipboard.writeText(ingredientsText)
            .then(() => {
                addToast({ message: 'Ingredients copied to clipboard!', type: 'success' });
            })
            .catch(err => {
                console.error('Failed to copy ingredients: ', err);
                addToast({ message: 'Failed to copy ingredients.', type: 'error' });
            });
    };

    return (
        <article ref={cardRef} className="bg-[--card] border border-[--border] rounded-2xl shadow-lg flex flex-col overflow-hidden" aria-labelledby={titleId}>
            {recipe.imageUrl ? (
                <img src={recipe.imageUrl} alt={`A generated image of ${recipe.recipeName}`} className="w-full h-56 object-cover" />
            ) : (
                <div className="w-full h-56 bg-[--muted] flex items-center justify-center">
                    <PlateIcon className="h-24 w-24 text-[--muted-foreground]/30" />
                </div>
            )}
            <div className='p-8 flex-grow'>
                <h2 id={titleId} className="text-2xl font-bold text-[--foreground] mb-2">{recipe.recipeName}</h2>
                <p className="text-[--muted-foreground] mb-6">{recipe.description}</p>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8 text-sm text-[--foreground]">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-[--primary]" aria-hidden="true" />
                        <div>
                            <span className="font-semibold">Prep:</span> {recipe.prepTime}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-[--primary]" aria-hidden="true" />
                        <div>
                            <span className="font-semibold">Cook:</span> {recipe.cookTime}
                        </div>
                    </div>
                </div>
                
                <hr className="border-[--border] my-6" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4">
                        <Section 
                            title="Ingredients"
                            extra={
                                <button onClick={handleCopyIngredients} className="text-[--muted-foreground] hover:text-[--primary] transition-colors no-print" aria-label="Copy ingredients">
                                    <CopyIcon className="h-5 w-5" />
                                </button>
                            }
                        >
                            <ul className="space-y-2 list-disc list-inside text-[--foreground]">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index}>{ingredient}</li>
                                ))}
                            </ul>
                        </Section>
                    </div>
                    <div className="lg:col-span-8">
                        <Section title="Instructions">
                            <ol className="space-y-4 text-[--foreground]">
                                {recipe.instructions.map((step, index) => (
                                    <li key={index} className="flex">
                                        <span className="mr-4 flex-shrink-0 bg-[--primary] text-[--primary-foreground] font-bold h-6 w-6 rounded-full text-xs flex items-center justify-center">{index + 1}</span>
                                        <span className="flex-1">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </Section>
                    </div>
                </div>
            </div>
            {!isDemo && (
                <div className="p-4 bg-[--muted]/30 border-t border-[--border] no-print">
                    <div className="flex gap-2 items-center justify-end">
                        {isSavedView && onDelete ? (
                            <button
                                onClick={handleDelete}
                                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-[--destructive] bg-transparent hover:bg-[--destructive]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--destructive] focus:ring-offset-[--card] transition-colors"
                            >
                                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                                <span>Delete</span>
                            </button>
                        ) : onSave && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving || isSaved}
                                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-[--primary] bg-transparent hover:bg-[--primary]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? (
                                <>
                                        <svg aria-hidden="true" className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                </>
                                ) : justSaved ? (
                                    <>
                                        <CheckIcon className="h-4 w-4 text-[--primary] animate-pop-in" aria-hidden="true" />
                                        <span>Saved!</span>
                                    </>
                                ) : isSaved ? (
                                    <>
                                    <HeartIcon className="h-4 w-4 text-[--primary]" aria-hidden="true" />
                                        <span>Saved</span>
                                    </>
                                ) : (
                                    <>
                                        <HeartIcon className="h-4 w-4" aria-hidden="true" />
                                        <span>Save Recipe</span>
                                    </>
                                )}
                            </button>
                        )}
                        
                        <div className="border-l border-[--border] h-6 mx-2"></div>

                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-[--muted-foreground] bg-transparent hover:bg-[--muted] hover:text-[--foreground] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] transition-colors"
                            aria-label="Print Recipe"
                        >
                            <PrintIcon className="h-4 w-4" aria-hidden="true" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>
            )}
        </article>
    );
};
