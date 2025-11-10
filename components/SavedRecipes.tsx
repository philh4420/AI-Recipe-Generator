import React from 'react';
import type { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';

interface SavedRecipesProps {
    recipes: Recipe[];
    onDelete: (id: string) => Promise<void>;
}

const BookmarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>
);

export const SavedRecipes: React.FC<SavedRecipesProps> = ({ recipes, onDelete }) => {
    if (recipes.length === 0) {
        return (
            <div className="mt-12 text-center bg-[--card] p-12 rounded-2xl shadow-lg">
                <BookmarkIcon className="mx-auto h-16 w-16 text-[--primary]/60" />
                <h3 className="mt-4 text-xl font-semibold text-[--card-foreground]">No Saved Recipes Yet</h3>
                <p className="mt-2 text-[--muted-foreground]">
                    Head over to the generator to find and save your next favorite dish!
                </p>
            </div>
        );
    }

    return (
        <div className="mt-12 animate-fade-in">
             <h2 className="text-2xl font-bold text-[--foreground] mb-6">
                Your <span className="text-[--primary]">{recipes.length}</span> Saved Recipes
            </h2>
            <div className="grid grid-cols-1 gap-8">
                {recipes.map((recipe) => (
                    <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onDelete={onDelete}
                        isSavedView={true}
                    />
                ))}
            </div>
        </div>
    );
};
