import React, { useState, useMemo } from 'react';
import type { Recipe, FirebaseUser } from '../types';
import { RecipeCard } from './RecipeCard';

interface SavedRecipesProps {
    recipes: Recipe[];
    onDelete: (recipe: Recipe) => Promise<void>;
    onStartCooking: (recipe: Recipe) => void;
    user: FirebaseUser | null;
    onShare: (recipe: Recipe) => string;
}

const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
);

const FilterControls: React.FC<{
    recipes: Recipe[];
    sortOrder: string;
    setSortOrder: (order: string) => void;
    cuisineFilter: string;
    setCuisineFilter: (cuisine: string) => void;
}> = ({ recipes, sortOrder, setSortOrder, cuisineFilter, setCuisineFilter }) => {
    
    // A simplified list for the filter since extracting from description isn't perfect
    const CUISINE_OPTIONS = ["All Cuisines", "Italian", "Mexican", "Chinese", "Indian", "French", "Japanese", "American", "Thai", "Spanish", "Greek"];


    const selectClasses = "block w-full border border-[--border] bg-[--input] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[--ring] focus:border-[--primary] sm:text-sm text-[--foreground] transition-colors";

    return (
        <div className="bg-[--card] p-4 rounded-xl border border-[--border] mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="cuisineFilter" className="block text-xs font-medium text-[--muted-foreground] mb-1">Filter by Cuisine</label>
                    <select id="cuisineFilter" value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)} className={selectClasses}>
                        {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="sortOrder" className="block text-xs font-medium text-[--muted-foreground] mb-1">Sort by</label>
                    <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={selectClasses}>
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                        <option value="prep_asc">Prep Time (Shortest)</option>
                        <option value="cook_asc">Cook Time (Shortest)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};


export const SavedRecipes: React.FC<SavedRecipesProps> = ({ recipes, onDelete, onStartCooking, user, onShare }) => {
    const [sortOrder, setSortOrder] = useState('name_asc');
    const [cuisineFilter, setCuisineFilter] = useState('All Cuisines');

    const filteredAndSortedRecipes = useMemo(() => {
        const parseTime = (timeStr: string): number => {
            const time = parseInt(timeStr.split(' ')[0], 10);
            if (isNaN(time)) return Infinity; // Handle cases where parsing fails
            if (timeStr.includes('hr')) return time * 60;
            return time; // assume minutes
        };

        return [...recipes]
            .filter(recipe => {
                if (cuisineFilter === 'All Cuisines') return true;
                // This is a simple check; a more robust solution might involve tags on the recipe object.
                return recipe.description.toLowerCase().includes(cuisineFilter.toLowerCase());
            })
            .sort((a, b) => {
                switch (sortOrder) {
                    case 'name_desc':
                        return b.recipeName.localeCompare(a.recipeName);
                    case 'prep_asc':
                        return parseTime(a.prepTime) - parseTime(b.prepTime);
                    case 'cook_asc':
                        return parseTime(a.cookTime) - parseTime(b.cookTime);
                    case 'name_asc':
                    default:
                        return a.recipeName.localeCompare(b.recipeName);
                }
            });
    }, [recipes, sortOrder, cuisineFilter]);

    if (recipes.length === 0) {
        return (
            <div className="mt-12 text-center bg-[--card] border border-[--border] p-12 rounded-2xl shadow-lg">
                <BookmarkIcon aria-hidden="true" className="mx-auto h-16 w-16 text-[--primary]/60" />
                <h3 className="mt-4 text-xl font-semibold text-[--card-foreground]">No Saved Recipes Yet</h3>
                <p className="mt-2 text-[--muted-foreground]">
                    Head over to the generator to find and save your next favorite dish!
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 animate-fade-in">
             <h2 className="text-2xl font-bold text-[--foreground] mb-6">
                Your <span className="text-[--primary]">{recipes.length}</span> Saved Recipes
            </h2>
             <FilterControls 
                recipes={recipes}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                cuisineFilter={cuisineFilter}
                setCuisineFilter={setCuisineFilter}
            />

            {filteredAndSortedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                    {filteredAndSortedRecipes.map((recipe, index) => (
                        <div key={recipe.id} className="animate-stagger-fade-in" style={{ animationDelay: `${index * 100}ms`}}>
                            <RecipeCard 
                                user={user}
                                recipe={recipe} 
                                onDelete={onDelete}
                                onShare={onShare}
                                isSavedView={true}
                                onStartCooking={onStartCooking}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-[--muted-foreground] py-12">No recipes match your current filters.</p>
            )}
        </div>
    );
};