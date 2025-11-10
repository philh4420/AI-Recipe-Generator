
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
            let errorMessage = 'An unexpected error occurred.';
            if (err.message) {
                try {
                    // The error from the backend is often a stringified JSON object from the Gemini API.
                    const errorData = JSON.parse(err.message);
                    const apiError = errorData.error;

                    if (apiError && apiError.message) {
                        if (apiError.code === 503 || apiError.status === 'UNAVAILABLE') {
                            errorMessage = "The AI model is currently overloaded with requests. This is a temporary issue. Please wait a moment and try again.";
                        } else {
                            // Display other specific API errors
                            errorMessage = `API Error: ${apiError.message}`;
                        }
                    } else {
                        // It's a JSON but not in the expected format.
                        errorMessage = err.message;
                    }
                } catch (e) {
                    // It's not a JSON string, so just use the raw message.
                    errorMessage = err.message;
                }
            }
            setError(errorMessage);
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