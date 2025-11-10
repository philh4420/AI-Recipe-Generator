import React from 'react';
import type { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { SkeletonLoader } from './SkeletonLoader';

interface RecipeListProps {
    recipes: Recipe[];
    isLoading: boolean;
    error: string | null;
    onClear: () => void;
    onSave: (recipe: Recipe) => Promise<void>;
    savedRecipeIds: string[];
}

const ChefIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.69 2 6 4.69 6 8s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM12 16c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
        <path d="M5 22h14v-2H5v2zm0-4h14v-1.1c0-2.03-3.14-3.9-7-3.9s-7 1.87-7 3.9V18zm0-10c0-1.84 1.66-3.47 4-4.59V8.5c-1.38.44-2.47 1.53-2.9 2.8L5 11.66V8c0-1.65 1.35-3 3-3h8c1.65 0 3 1.35 3 3v3.66l-1.1-.36c-.43-1.27-1.52-2.36-2.9-2.8V3.41c2.34 1.12 4 3.75 4 6.59v8h3v-2h-1v-1.63c.63-.39 1-1.06 1-1.87 0-1.3-.84-2.4-2-2.82V10c0-2.76-2.24-5-5-5H8C5.24 5 3 7.24 3 10v1.18c-1.16.42-2 1.52-2 2.82 0 .81.37 1.48 1 1.87V18H1v2h3v2z" opacity=".3"/>
    </svg>
);


export const RecipeList: React.FC<RecipeListProps> = ({ recipes, isLoading, error, onClear, onSave, savedRecipeIds }) => {
    
    if (isLoading) {
        return <div className="mt-12"><SkeletonLoader /></div>;
    }

    if (error) {
        return (
             <div className="mt-12 bg-[--destructive]/10 border-l-4 border-[--destructive] text-[--destructive] p-6 rounded-md shadow-md" role="alert">
                <h3 className="font-bold text-lg">Oops, something went wrong!</h3>
                <p className="mt-2">{error}</p>
            </div>
        );
    }
    
    if (recipes.length > 0) {
        return (
            <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-[--foreground]">
                        Found <span className="text-[--primary]">{recipes.length}</span> recipes for you
                    </h2>
                    <button 
                        onClick={onClear}
                        className="text-sm font-medium text-[--muted-foreground] hover:text-[--primary] transition-colors"
                    >
                        Clear Results
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-8">
                    {recipes.map((recipe, index) => (
                        <RecipeCard 
                            key={`${recipe.recipeName}-${index}`} 
                            recipe={recipe}
                            onSave={onSave}
                            isSaved={savedRecipeIds.includes(recipe.recipeName)}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12 text-center bg-[--card] p-12 rounded-2xl shadow-lg">
            <ChefIcon className="mx-auto h-16 w-16 text-[--primary]/60" />
            <h3 className="mt-4 text-xl font-semibold text-[--card-foreground]">Ready to Cook?</h3>
            <p className="mt-2 text-[--muted-foreground]">Your next favorite meal is just a click away. Fill out the form above to get started.</p>
        </div>
    );
};
