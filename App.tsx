import React, { useState, useEffect } from 'react';
import { generateRecipes, modifyRecipe } from './services/geminiService';
import { addRecipe, deleteRecipe, getRecipes } from './services/firestoreService';
import { onAuthStateChange, signInWithGoogle, signOutUser } from './services/authService';
import type { Recipe, FormData, FirebaseUser } from './types';
import { InputForm } from './components/InputForm';
import { Header } from './components/Header';
import { RecipeList } from './components/RecipeList';
import { SavedRecipes } from './components/SavedRecipes';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { CookingMode } from './components/CookingMode';
import { useToast } from './hooks/useToast';

const App: React.FC = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modifyingRecipeIndex, setModifyingRecipeIndex] = useState<number | null>(null);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [view, setView] = useState<'generator' | 'saved'>('generator');
    const [lastFormData, setLastFormData] = useState<FormData | null>(null);
    const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    const { addToast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChange((user) => {
            setUser(user);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            fetchSavedRecipes();
        } else {
            setSavedRecipes([]);
        }
    }, [user]);
    
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const fetchSavedRecipes = async () => {
        if (user) {
            try {
                const recipes = await getRecipes(user.uid);
                setSavedRecipes(recipes);
            } catch (err) {
                addToast({ message: 'Failed to fetch saved recipes.', type: 'error' });
            }
        }
    };
    
    const handleRetry = () => {
        if (lastFormData) {
            handleSubmit(lastFormData);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);
        setGeneratedRecipes([]);
        setLastFormData(formData);

        try {
            const recipes = await generateRecipes(formData);
            setGeneratedRecipes(recipes);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || "An unknown error occurred.";
            // Create a more user-friendly error message.
            const friendlyMessage = (
              <>
                <strong>Generation Failed:</strong> {errorMessage}
                <br />
                <span className="text-sm">Please check your network connection or try refining your search terms.</span>
              </>
            );
            setError(friendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModifyRecipe = async (recipe: Recipe, modification: string, index: number) => {
        if (modifyingRecipeIndex !== null) {
            addToast({ message: "Please wait for the current modification to finish.", type: 'error' });
            return;
        }
    
        setModifyingRecipeIndex(index);
        try {
            const modifiedRecipe = await modifyRecipe(recipe, modification);
            setGeneratedRecipes(prev => {
                const newRecipes = [...prev];
                newRecipes[index] = modifiedRecipe;
                return newRecipes;
            });
            addToast({ message: "Recipe updated successfully!", type: 'success' });
        } catch (err: any) {
            console.error(err);
            addToast({ message: `Failed to modify recipe: ${err.message}`, type: 'error' });
        } finally {
            setModifyingRecipeIndex(null);
        }
    };

    const handleSaveRecipe = async (recipe: Recipe) => {
        if (!user) {
            addToast({ message: 'You must be signed in to save recipes.', type: 'error' });
            return;
        }
        if (savedRecipes.some(r => r.recipeName === recipe.recipeName)) {
            addToast({ message: 'This recipe is already in your cookbook.', type: 'error' });
            return;
        }

        try {
            const docId = await addRecipe(user.uid, recipe);
            const newSavedRecipe = { ...recipe, id: docId };
            setSavedRecipes(prev => [...prev, newSavedRecipe]);
            addToast({ message: 'Recipe saved to your cookbook!', type: 'success' });
        } catch (err) {
            addToast({ message: 'Failed to save recipe.', type: 'error' });
        }
    };
    
    const handleDeleteRecipe = async (recipeId: string) => {
        if (!user) return;
        try {
            await deleteRecipe(user.uid, recipeId);
            setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
            addToast({ message: 'Recipe removed from your cookbook.', type: 'success' });
        } catch (err) {
             addToast({ message: 'Failed to delete recipe.', type: 'error' });
        }
    };

    const handleClear = () => setGeneratedRecipes([]);

    const handleStartCooking = (recipe: Recipe) => setCookingRecipe(recipe);
    const handleCloseCookingMode = () => setCookingRecipe(null);
    
    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            addToast({ message: 'Failed to sign in with Google.', type: 'error' });
        }
    };

    const handleSignOut = async () => {
        try {
            await signOutUser();
            setView('generator');
        } catch (error) {
            addToast({ message: 'Failed to sign out.', type: 'error' });
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[--background]">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-[--primary] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-[--muted-foreground]">Loading Your Kitchen...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LandingPage 
            onSignInWithGoogle={handleGoogleSignIn} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode}
        />;
    }

    return (
        <div className="min-h-screen bg-[--background] text-[--foreground] font-sans flex flex-col">
            <Header
                user={user}
                onSignOut={handleSignOut}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                view={view}
                setView={setView}
            />
            <main className="container mx-auto p-4 md:p-8 flex-grow">
                 {view === 'generator' ? (
                    <>
                        <InputForm isLoading={isLoading || modifyingRecipeIndex !== null} onSubmit={handleSubmit} onSurprise={handleSubmit} />
                        <RecipeList
                            recipes={generatedRecipes}
                            isLoading={isLoading}
                            error={error}
                            onClear={handleClear}
                            onSave={handleSaveRecipe}
                            savedRecipeIds={savedRecipes.map(r => r.recipeName)}
                            onRetry={handleRetry}
                            onModify={handleModifyRecipe}
                            modifyingRecipeIndex={modifyingRecipeIndex}
                            onStartCooking={handleStartCooking}
                        />
                    </>
                ) : (
                    <SavedRecipes 
                        recipes={savedRecipes}
                        onDelete={handleDeleteRecipe}
                        onStartCooking={handleStartCooking}
                    />
                )}
            </main>
            <Footer />
            {cookingRecipe && (
                <CookingMode recipe={cookingRecipe} onClose={handleCloseCookingMode} />
            )}
        </div>
    );
};

export default App;