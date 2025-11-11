import React, { useState, useRef, useId, useEffect } from 'react';
import type { Recipe, FirebaseUser, Review } from '../types';
import { useToast } from '../hooks/useToast';
import { Reviews } from './Reviews';
import { StarRating } from './StarRating';

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

const ChefHatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.352l-2.827-2.827a4.5 4.5 0 01-1.24-3.183V6.608a4.5 4.5 0 014.5-4.5h.142c1.932 0 3.734.79 5.028 2.138 1.157 1.21.942 3.391.314 4.515l-3.236 4.223M12 21.352L14.827 18.525M9 11.25h6" />
    </svg>
);

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367 2.684z" />
  </svg>
);

const WineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75V3m0 0L8.25 3M12 3l3.75 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21h9" />
  </svg>
);

const BeerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h9v7.5a4.5 4.5 0 01-4.5 4.5h0a4.5 4.5 0 01-4.5-4.5V7.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5V6a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 007.5 6v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5c.621 0 1.125.504 1.125 1.125v1.75a1.125 1.125 0 01-1.125 1.125h-9.75" />
  </svg>
);

const JuiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 4.5l.42-1.05a1.125 1.125 0 012.16 0l.42 1.05m-3 0h3m-3 1.5h.008v.008H9.75v-.008zM12 21a8.25 8.25 0 008.25-8.25H3.75A8.25 8.25 0 0012 21z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12.75h16.5" />
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
    user: FirebaseUser | null;
    recipe: Recipe;
    onSave?: (recipe: Recipe) => Promise<void>;
    onDelete?: (recipe: Recipe) => Promise<void>;
    onShare?: (recipe: Recipe) => string;
    isSaved?: boolean;
    isSavedView?: boolean;
    isPublicView?: boolean;
    isDemo?: boolean;
    onModify?: (recipe: Recipe, modification: string) => void;
    onStartCooking?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ user, recipe, onSave, onDelete, onShare, isSaved, isSavedView, isPublicView, isDemo, onModify, onStartCooking }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState(recipe); // Local state for optimistic updates
    const cardRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const { addToast } = useToast();

    useEffect(() => {
        setCurrentRecipe(recipe);
    }, [recipe]);
    
    const handleSave = async () => {
        if (onSave) {
            setIsSaving(true);
            await onSave(currentRecipe);
            setIsSaving(false);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 1500);
        }
    };
    
    const handleDelete = async () => {
        if (onDelete) {
            await onDelete(currentRecipe);
        }
    };
    
    const handleShare = () => {
        if (onShare) {
            const shareUrl = onShare(currentRecipe);
            if (shareUrl) {
                navigator.clipboard.writeText(shareUrl)
                    .then(() => addToast({ message: 'Share link copied!', type: 'success' }))
                    .catch(() => addToast({ message: 'Failed to copy link.', type: 'error' }));
            }
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
        navigator.clipboard.writeText(currentRecipe.ingredients.join('\n'))
            .then(() => addToast({ message: 'Ingredients copied!', type: 'success' }))
            .catch(() => addToast({ message: 'Failed to copy.', type: 'error' }));
    };

    const handleModify = (modification: string) => {
        if (onModify) onModify(currentRecipe, modification);
    };
    
    const ModificationButton: React.FC<{onClick: () => void; children: React.ReactNode}> = ({ onClick, children }) => (
        <button onClick={onClick} className="px-3 py-1.5 text-xs font-semibold bg-[--muted] text-[--muted-foreground] rounded-full hover:bg-[--accent] hover:text-[--accent-foreground] transition-colors">
            {children}
        </button>
    );
    
    const handleStartCooking = () => {
        if (onStartCooking) onStartCooking(currentRecipe);
    };

    const handleReviewAdded = (newReview: Omit<Review, 'id' | 'createdAt'>) => {
        // Optimistically update the UI
        setCurrentRecipe(prev => {
            const oldTotalRating = (prev.avgRating || 0) * (prev.ratingCount || 0);
            const newRatingCount = (prev.ratingCount || 0) + 1;
            const newAvgRating = (oldTotalRating + newReview.rating) / newRatingCount;
            const newReviews = [{...newReview, id: 'temp', createdAt: new Date().toISOString()}, ...(prev.reviews || [])];
            
            return {
                ...prev,
                ratingCount: newRatingCount,
                avgRating: newAvgRating,
                reviews: newReviews,
            };
        });
    };

    return (
        <article ref={cardRef} className="bg-[--card] border border-[--border] rounded-2xl shadow-lg flex flex-col overflow-hidden transition-all duration-300">
            <div className='p-8 flex-grow'>
                <div className="flex justify-between items-start">
                    <h2 id={titleId} className="text-2xl font-bold text-[--foreground] mb-2 pr-4">{currentRecipe.recipeName}</h2>
                </div>
                {isPublicView && currentRecipe.ownerName && (
                    <p className="text-sm text-[--muted-foreground] mb-4">Shared by {currentRecipe.ownerName}</p>
                )}
                
                <button 
                    onClick={() => setShowReviews(!showReviews)}
                    className="flex items-center gap-2 mb-4 text-sm group"
                    aria-expanded={showReviews}
                    disabled={!isSavedView}
                >
                    <StarRating rating={currentRecipe.avgRating || 0} />
                    <span className={`text-[--muted-foreground] ${isSavedView ? 'group-hover:text-[--primary]' : ''} transition-colors`}>
                        ({currentRecipe.ratingCount || 0} reviews)
                    </span>
                </button>

                <p className="text-[--muted-foreground] mb-6">{currentRecipe.description}</p>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 text-sm text-[--foreground]">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-[--primary]" aria-hidden="true" />
                        <div><span className="font-semibold">Prep:</span> {currentRecipe.prepTime}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-[--primary]" aria-hidden="true" />
                        <div><span className="font-semibold">Cook:</span> {currentRecipe.cookTime}</div>
                    </div>
                </div>

                {currentRecipe.nutritionalInfo && (
                     <>
                        <h3 className="text-base font-semibold text-[--foreground] mb-3">Nutrition Facts <span className="text-xs font-normal text-[--muted-foreground]">(per serving)</span></h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8 bg-[--muted]/30 p-4 rounded-lg border border-[--border]">
                            <div>
                                <p className="font-bold text-lg text-[--primary]">{currentRecipe.nutritionalInfo.calories}</p>
                                <p className="text-xs text-[--muted-foreground]">Calories</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-[--primary]">{currentRecipe.nutritionalInfo.protein}</p>
                                <p className="text-xs text-[--muted-foreground]">Protein</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-[--primary]">{currentRecipe.nutritionalInfo.carbs}</p>
                                <p className="text-xs text-[--muted-foreground]">Carbs</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-[--primary]">{currentRecipe.nutritionalInfo.fat}</p>
                                <p className="text-xs text-[--muted-foreground]">Fat</p>
                            </div>
                        </div>
                    </>
                )}

                {currentRecipe.beveragePairing && (
                    <>
                        <Section title="Beverage Pairings">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <WineIcon className="h-5 w-5 text-[--primary] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-[--foreground]">Wine:</span>
                                        <span className="text-[--muted-foreground] ml-2">{currentRecipe.beveragePairing.wine}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <BeerIcon className="h-5 w-5 text-[--primary] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-[--foreground]">Beer:</span>
                                        <span className="text-[--muted-foreground] ml-2">{currentRecipe.beveragePairing.beer}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <JuiceIcon className="h-5 w-5 text-[--primary] mt-0.5 flex-shrink-0" />
                                    <div>
                                         <span className="font-semibold text-[--foreground]">Non-Alcoholic:</span>
                                         <span className="text-[--muted-foreground] ml-2">{currentRecipe.beveragePairing.nonAlcoholic}</span>
                                    </div>
                                </div>
                            </div>
                        </Section>
                        <hr className="border-[--border] my-6" />
                    </>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4">
                        <Section 
                            title="Ingredients"
                            extra={<button onClick={handleCopyIngredients} className="text-[--muted-foreground] hover:text-[--primary] transition-colors no-print" aria-label="Copy ingredients"><CopyIcon className="h-5 w-5" /></button>}
                        >
                            <ul className="space-y-2 list-disc list-inside text-[--foreground]">
                                {currentRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                            </ul>
                        </Section>
                    </div>
                    <div className="lg:col-span-8">
                        <Section title="Instructions">
                            <ol className="space-y-4 text-[--foreground]">
                                {currentRecipe.instructions.map((step, i) => (
                                    <li key={i} className="flex">
                                        <span className="mr-4 flex-shrink-0 bg-[--primary] text-[--primary-foreground] font-bold h-6 w-6 rounded-full text-xs flex items-center justify-center">{i + 1}</span>
                                        <span className="flex-1">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </Section>
                    </div>
                </div>
            </div>

            {onModify && !isSavedView && !isDemo && (
                 <div className="px-8 pb-6 pt-2 no-print">
                    <h4 className="text-sm font-semibold text-[--muted-foreground] mb-3">Want a change?</h4>
                    <div className="flex flex-wrap gap-2">
                        <ModificationButton onClick={() => handleModify("make it quicker")}>Quicker</ModificationButton>
                        <ModificationButton onClick={() => handleModify("make it healthier")}>Healthier</ModificationButton>
                        <ModificationButton onClick={() => handleModify("make it vegetarian")}>Vegetarian</ModificationButton>
                    </div>
                </div>
            )}
            
            {showReviews && user && currentRecipe.id && isSavedView && (
                <div className="bg-[--muted]/20 p-8 border-y border-[--border] no-print">
                     <Reviews 
                        user={user} 
                        recipeId={currentRecipe.id} 
                        reviews={currentRecipe.reviews || []}
                        onReviewAdded={handleReviewAdded} 
                    />
                </div>
            )}

            {!isPublicView && (
            <div className="p-4 bg-[--muted]/30 border-t border-[--border] no-print">
                <div className="flex flex-wrap gap-2 items-center justify-end">
                     {onStartCooking && (
                        <button onClick={handleStartCooking} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-[--primary-foreground] bg-[--primary] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] transition-colors">
                            <ChefHatIcon className="h-4 w-4" aria-hidden="true" />
                            <span>Start Cooking</span>
                        </button>
                     )}
                     <div className="hidden sm:block border-l border-[--border] h-6 mx-2"></div>
                    {isSavedView && onDelete && onShare ? (
                        <>
                        <button onClick={handleShare} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-[--muted-foreground] bg-transparent hover:bg-[--muted] hover:text-[--foreground] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] transition-colors">
                            <ShareIcon className="h-4 w-4" aria-hidden="true" />
                            <span>Share</span>
                        </button>
                        <button onClick={handleDelete} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-[--destructive] bg-transparent hover:bg-[--destructive]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--destructive] focus:ring-offset-[--card] transition-colors">
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
                            <span>Delete</span>
                        </button>
                        </>
                    ) : onSave && !isDemo && (
                        <button onClick={handleSave} disabled={isSaving || isSaved} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-[--primary] bg-transparent hover:bg-[--primary]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isSaving ? ( <> <svg aria-hidden="true" className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>Saving...</span></>
                            ) : justSaved ? ( <> <CheckIcon className="h-4 w-4 text-[--primary] animate-pop-in" aria-hidden="true" /> <span>Saved!</span> </>
                            ) : isSaved ? ( <> <HeartIcon className="h-4 w-4 text-[--primary]" aria-hidden="true" /> <span>Saved</span> </>
                            ) : ( <> <HeartIcon className="h-4 w-4" aria-hidden="true" /> <span>Save Recipe</span> </> )}
                        </button>
                    )}
                    
                    {!isDemo && (
                        <>
                            <div className="border-l border-[--border] h-6 mx-2"></div>
                            <button onClick={handlePrint} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-[--muted-foreground] bg-transparent hover:bg-[--muted] hover:text-[--foreground] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] transition-colors" aria-label="Print Recipe">
                                <PrintIcon className="h-4 w-4" aria-hidden="true" />
                                <span>Print</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
            )}
        </article>
    );
};