import React, { useState, useEffect } from 'react';
import { generateRecipes, modifyRecipe } from './services/geminiService';
import { 
    addRecipe, deleteRecipe, getRecipes,
    getPantryItems, addPantryItem, deletePantryItem,
    getShoppingListItems, addShoppingListItems, updateShoppingListItem, deleteShoppingListItems,
    getMealPlan, updateMealPlan,
    getTasteProfile, updateTasteProfile,
} from './services/firestoreService';
import { onAuthStateChange, signInWithGoogle, signOutUser } from './services/authService';
import type { Recipe, FormData, FirebaseUser, PantryItem, ShoppingListItem, View, MealPlan, PlannedRecipe, TasteProfile } from './types';
import { InputForm } from './components/InputForm';
import { Header } from './components/Header';
import { RecipeList } from './components/RecipeList';
import { SavedRecipes } from './components/SavedRecipes';
import { Pantry } from './components/Pantry';
import { ShoppingList } from './components/ShoppingList';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { CookingMode } from './components/CookingMode';
import { MealPlanner } from './components/MealPlanner';
import { Profile } from './components/Profile';
import { PublicRecipeView } from './components/PublicRecipeView';
import { useToast } from './hooks/useToast';

const App: React.FC = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [shoppingListItems, setShoppingListItems] = useState<ShoppingListItem[]>([]);
    const [mealPlan, setMealPlan] = useState<MealPlan>({});
    const [tasteProfile, setTasteProfile] = useState<TasteProfile>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modifyingRecipeIndex, setModifyingRecipeIndex] = useState<number | null>(null);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [view, setView] = useState<View>('generator');
    const [lastFormData, setLastFormData] = useState<any | null>(null);
    const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
    
    // State for public recipe view
    const [publicRecipe, setPublicRecipe] = useState<Recipe | null>(null);
    const [isPublicViewLoading, setIsPublicViewLoading] = useState<boolean>(true);
    const [publicViewError, setPublicViewError] = useState<string | null>(null);


    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    const { addToast } = useToast();

    // Check for public recipe link on initial load
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeData = urlParams.get('recipeData');

        if (recipeData) {
            try {
                // Decode from URL component, then from Base64
                const decodedJson = atob(decodeURIComponent(recipeData));
                const recipe = JSON.parse(decodedJson);
                setPublicRecipe(recipe);
            } catch (err) {
                console.error("Failed to parse shared recipe data:", err);
                setPublicViewError("The shared recipe link appears to be invalid or corrupted.");
            } finally {
                setIsPublicViewLoading(false);
            }
        } else {
            setIsPublicViewLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChange((user) => {
            setUser(user);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserData();
        } else {
            setSavedRecipes([]);
            setPantryItems([]);
            setShoppingListItems([]);
            setMealPlan({});
            setTasteProfile({});
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

    const fetchUserData = () => {
        if (!user) return;

        getRecipes(user.uid).then(setSavedRecipes).catch(err => {
            console.error("Failed to fetch recipes:", err);
            addToast({ message: 'Could not load your saved recipes.', type: 'error' });
        });
        getPantryItems(user.uid).then(setPantryItems).catch(err => {
            console.error("Failed to fetch pantry items:", err);
            addToast({ message: 'Could not load your pantry.', type: 'error' });
        });
        getShoppingListItems(user.uid).then(setShoppingListItems).catch(err => {
            console.error("Failed to fetch shopping list items:", err);
            addToast({ message: 'Could not load your shopping list.', type: 'error' });
        });
        getMealPlan(user.uid).then(setMealPlan).catch(err => {
            console.error("Failed to fetch meal plan:", err);
            addToast({ message: 'Could not load your meal plan.', type: 'error' });
        });
        getTasteProfile(user.uid).then(setTasteProfile).catch(err => {
            console.error("Failed to fetch taste profile:", err);
            addToast({ message: 'Could not load your taste profile.', type: 'error' });
        });
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
        
        const apiPayload = {
            ...formData,
            diet: formData.diet || tasteProfile.dietaryPreference || '',
            cuisine: formData.cuisine || '',
            favoriteIngredients: tasteProfile.favoriteIngredients || '',
            favoriteCuisines: tasteProfile.favoriteCuisines || '',
            excludedIngredients: tasteProfile.excludedIngredients || '',
        };
        
        setLastFormData(apiPayload);

        try {
            const recipes = await generateRecipes(apiPayload as any);
            setGeneratedRecipes(recipes);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || "An unknown error occurred.";
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
            
            const pantryNames = pantryItems.map(item => item.name.toLowerCase().trim());
            const missingIngredients = recipe.ingredients
              .map(ing => ({ original: ing, clean: ing.split(',')[0].toLowerCase().trim() }))
              .filter(ingObj => !pantryNames.includes(ingObj.clean))
              .map(ingObj => ({
                  name: ingObj.original,
                  recipeName: recipe.recipeName,
                  isChecked: false,
              }));

            if (missingIngredients.length > 0) {
                await addShoppingListItems(user.uid, missingIngredients);
                getShoppingListItems(user.uid).then(setShoppingListItems);
                addToast({ message: 'Recipe saved! Missing ingredients added to your shopping list.', type: 'success' });
            } else {
                addToast({ message: 'Recipe saved! You have all the ingredients.', type: 'success' });
            }

        } catch (err) {
            addToast({ message: 'Failed to save recipe and generate shopping list.', type: 'error' });
        }
    };
    
    const handleDeleteRecipe = async (recipe: Recipe) => {
        if (!user || !recipe.id) return;
        try {
            await deleteRecipe(user.uid, recipe.id);
            setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id));
            addToast({ message: 'Recipe removed from your cookbook.', type: 'success' });
        } catch (err) {
             addToast({ message: 'Failed to delete recipe.', type: 'error' });
        }
    };

    const handleShareRecipe = (recipe: Recipe): string => {
        if (!user) {
            addToast({ message: "You must be signed in to share.", type: "error" });
            return "";
        }
        try {
            const shareableRecipe = {
                ...recipe,
                ownerId: user.uid,
                ownerName: user.displayName || 'A Chef'
            };
            const jsonString = JSON.stringify(shareableRecipe);
            const encodedData = btoa(jsonString); // Base64 encode
            const url = `${window.location.origin}?recipeData=${encodeURIComponent(encodedData)}`;
            return url;
        } catch (err) {
            console.error("Error creating share link:", err);
            addToast({ message: 'Could not create share link.', type: 'error' });
            return "";
        }
    };

    const handleAddPantryItem = async (itemName: string) => {
        if (!user || !itemName.trim()) return;
        if (pantryItems.some(item => item.name.toLowerCase() === itemName.toLowerCase().trim())) {
            addToast({ message: `${itemName} is already in your pantry.`, type: 'error' });
            return;
        }
        try {
            const newItem = await addPantryItem(user.uid, itemName.trim());
            setPantryItems(prev => [...prev, newItem]);
        } catch (err) {
            addToast({ message: 'Failed to add item to pantry.', type: 'error' });
        }
    };

    const handleDeletePantryItem = async (itemId: string) => {
        if (!user) return;
        try {
            await deletePantryItem(user.uid, itemId);
            setPantryItems(prev => prev.filter(item => item.id !== itemId));
        } catch (err) {
            addToast({ message: 'Failed to remove item from pantry.', type: 'error' });
        }
    };

    const handleToggleShoppingListItem = async (itemId: string, isChecked: boolean) => {
        if (!user) return;
        try {
            await updateShoppingListItem(user.uid, itemId, isChecked);
            setShoppingListItems(prev => prev.map(item => item.id === itemId ? { ...item, isChecked } : item));
        } catch (err) {
            addToast({ message: 'Failed to update shopping list.', type: 'error' });
        }
    };
    
    const handleClearShoppingList = async (checkedOnly: boolean) => {
        if (!user) return;
        const itemsToDelete = checkedOnly ? shoppingListItems.filter(item => item.isChecked) : shoppingListItems;
        const itemIdsToDelete = itemsToDelete.map(item => item.id);
        if (itemIdsToDelete.length === 0) return;

        try {
            await deleteShoppingListItems(user.uid, itemIdsToDelete);
            setShoppingListItems(prev => prev.filter(item => !itemIdsToDelete.includes(item.id)));
            addToast({ message: 'Shopping list cleared.', type: 'success' });
        } catch (err) {
            addToast({ message: 'Failed to clear shopping list.', type: 'error' });
        }
    };
    
    const handleUpdateMealPlan = async (newPlan: MealPlan) => {
        if (!user) return;
        try {
            await updateMealPlan(user.uid, newPlan);
            setMealPlan(newPlan);
            addToast({ message: 'Meal plan updated!', type: 'success' });
        } catch (err) {
            addToast({ message: 'Failed to update meal plan.', type: 'error' });
        }
    };

    const handleGenerateWeeklyShoppingList = async () => {
        if (!user) return;
        const plannedRecipes = Object.values(mealPlan).filter((p): p is PlannedRecipe => !!p);
        if (plannedRecipes.length === 0) {
            addToast({ message: "Your meal plan is empty. Add some recipes first!", type: 'error' });
            return;
        }

        const recipesForWeek = savedRecipes.filter(r => r.id && plannedRecipes.some(p => p.id === r.id));
        const allIngredients = recipesForWeek.flatMap(r => r.ingredients);
        const pantryNames = new Set(pantryItems.map(item => item.name.toLowerCase().trim()));

        const missingIngredients = allIngredients
            .map(ing => ({ original: ing, clean: ing.split(',')[0].toLowerCase().trim() }))
            .filter(ingObj => !pantryNames.has(ingObj.clean))
            .map(ingObj => ingObj.original);
        
        const uniqueMissingIngredients = [...new Set(missingIngredients)];
        
        if (uniqueMissingIngredients.length === 0) {
            addToast({ message: "You have all the ingredients for your planned meals!", type: 'success' });
            setView('shoppingList');
            return;
        }

        const newShoppingListItems = uniqueMissingIngredients.map(name => ({
            name: String(name),
            recipeName: "Weekly Meal Plan",
            isChecked: false,
        }));
        
        try {
            await addShoppingListItems(user.uid, newShoppingListItems);
            getShoppingListItems(user.uid).then(setShoppingListItems);
            addToast({ message: `Added ${newShoppingListItems.length} items to your shopping list.`, type: 'success' });
            setView('shoppingList');
        } catch (err) {
            addToast({ message: 'Failed to generate shopping list.', type: 'error' });
        }
    };
    
    const handleUpdateTasteProfile = async (newProfile: TasteProfile) => {
        if (!user) return;
        try {
            await updateTasteProfile(user.uid, newProfile);
            setTasteProfile(newProfile);
            addToast({ message: 'Your taste profile has been saved!', type: 'success' });
        } catch (err) {
            addToast({ message: 'Failed to save your profile.', type: 'error' });
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

    const renderContent = () => {
        switch(view) {
            case 'generator':
                return (
                    <>
                        <InputForm 
                            isLoading={isLoading || modifyingRecipeIndex !== null} 
                            onSubmit={handleSubmit} 
                            onSurprise={handleSubmit} 
                            pantryItems={pantryItems}
                            tasteProfile={tasteProfile}
                        />
                        <RecipeList
                            user={user}
                            recipes={generatedRecipes}
                            isLoading={isLoading}
                            error={error}
                            onClear={handleClear}
                            onSave={handleSaveRecipe}
                            savedRecipeIds={savedRecipes.map(r => r.id || '')}
                            onRetry={handleRetry}
                            onModify={handleModifyRecipe}
                            modifyingRecipeIndex={modifyingRecipeIndex}
                            onStartCooking={handleStartCooking}
                        />
                    </>
                );
            case 'saved':
                return <SavedRecipes user={user} recipes={savedRecipes} onDelete={handleDeleteRecipe} onShare={handleShareRecipe} onStartCooking={handleStartCooking} />;
            case 'pantry':
                return <Pantry items={pantryItems} onAddItem={handleAddPantryItem} onDeleteItem={handleDeletePantryItem} />;
            case 'shoppingList':
                 return <ShoppingList items={shoppingListItems} onToggleItem={handleToggleShoppingListItem} onClearList={handleClearShoppingList} />;
            case 'mealPlanner':
                return <MealPlanner savedRecipes={savedRecipes} mealPlan={mealPlan} onUpdatePlan={handleUpdateMealPlan} onGenerateList={handleGenerateWeeklyShoppingList} />;
            case 'profile':
                return <Profile tasteProfile={tasteProfile} onUpdateProfile={handleUpdateTasteProfile} />;
            default:
                return null;
        }
    };

    if (isPublicViewLoading || authLoading) {
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

    if (publicRecipe || publicViewError) {
        return <PublicRecipeView 
            recipe={publicRecipe} 
            error={publicViewError} 
            onSignIn={handleGoogleSignIn} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode}
        />
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
                 {renderContent()}
            </main>
            <Footer />
            {cookingRecipe && (
                <CookingMode recipe={cookingRecipe} onClose={handleCloseCookingMode} />
            )}
        </div>
    );
};

export default App;