import React, { useState, useEffect } from 'react';
import { generateRecipes } from './services/geminiService';
import { addRecipe, deleteRecipe, getRecipes } from './services/firestoreService';
import type { Recipe, FormData } from './types';
import { InputForm } from './components/InputForm';
import { Header } from './components/Header';
import { RecipeList } from './components/RecipeList';
import { SavedRecipes } from './components/SavedRecipes';

const App: React.FC = () => {
    const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [view, setView] = useState<'generator' | 'saved'>('generator');

    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPref = window.localStorage.getItem('theme');
            return storedPref === 'dark';
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);
    
    useEffect(() => {
        const fetchSavedRecipes = async () => {
            const recipesFromDb = await getRecipes();
            setSavedRecipes(recipesFromDb);
        };
        fetchSavedRecipes();
    }, []);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);
        setGeneratedRecipes([]);
        try {
            const result = await generateRecipes(formData);
            setGeneratedRecipes(result);
        } catch (err: any) {
            if (err.message === 'API_KEY environment variable not set') {
                setError(
                    <>
                        The Gemini API key is not configured. Since you're deploying on Vercel, you need to add it to your project's Environment Variables. 
                        Please follow <a href="https://vercel.com/docs/projects/environment-variables" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-[--destructive]">Vercel's official guide</a> to set up your <code>API_KEY</code> correctly.
                    </>
                );
            } else if (err.message === 'API key not valid') {
                setError("Your API key is not valid. Please check it in your Vercel Environment Variables and try again.");
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSurprise = () => {
        handleSubmit({ ingredients: '', diet: '', cuisine: '', cookingMethod: '' });
    };

    const handleClear = () => {
        setGeneratedRecipes([]);
        setError(null);
    };

    const handleSaveRecipe = async (recipe: Recipe) => {
        try {
            const newId = await addRecipe(recipe);
            setSavedRecipes(prev => [...prev, { ...recipe, id: newId }]);
        } catch (error) {
            console.error("Error saving recipe:", error);
            // Optionally set an error state to show in the UI
        }
    };

    const handleDeleteRecipe = async (id: string) => {
        try {
            await deleteRecipe(id);
            setSavedRecipes(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Error deleting recipe: ", error);
        }
    };
    
    return (
        <div className="min-h-screen font-sans">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <Header 
                    isDarkMode={isDarkMode} 
                    toggleDarkMode={toggleDarkMode}
                    view={view}
                    setView={setView}
                />

                <div className="max-w-4xl mx-auto">
                    {view === 'generator' ? (
                        <>
                            <InputForm isLoading={isLoading} onSubmit={handleSubmit} onSurprise={handleSurprise} />
                            <RecipeList 
                                recipes={generatedRecipes} 
                                isLoading={isLoading} 
                                error={error} 
                                onClear={handleClear}
                                onSave={handleSaveRecipe}
                                savedRecipeIds={savedRecipes.map(r => r.recipeName)} // Use name for simple matching
                            />
                        </>
                    ) : (
                       <SavedRecipes recipes={savedRecipes} onDelete={handleDeleteRecipe} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;