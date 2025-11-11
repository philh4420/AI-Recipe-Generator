import React, { useState } from 'react';
import type { InputFormProps, FormData, PantryItem, TasteProfile } from '../types';

const DIETARY_OPTIONS = ["Any", "Atkins", "Dairy-Free", "DASH", "Diabetic", "Egg-Free", "Gluten-Free", "Halal", "Keto", "Kosher", "Low-Carb", "Low-Fat", "Low-FODMAP", "Low-Salt", "Nut-Free", "Paleo", "Pescatarian", "Raw Food", "Shellfish-Free", "Soy-Free", "Sugar-Free", "Vegan", "Vegetarian", "Whole30"];
const CUISINE_OPTIONS = ["Any", "African", "American", "Argentinian", "Brazilian", "British", "Cajun & Creole", "Caribbean", "Chinese", "Cuban", "Eastern European", "Ethiopian", "Filipino", "French", "German", "Greek", "Indian", "Irish", "Italian", "Japanese", "Jewish", "Korean", "Latin American", "Lebanese", "Malaysian", "Mediterranean", "Mexican", "Middle Eastern", "Moroccan", "Nordic", "Pakistani", "Peruvian", "Polish", "Portuguese", "Russian", "Southern (US)", "Spanish", "Thai", "Turkish", "Vietnamese"];
const COOKING_METHOD_OPTIONS = ["Any", "Air-Fry", "Bake", "Barbecue", "Blanch", "Boil", "Braise", "Broil", "Cure", "Deep-Fry", "Dehydrate", "Ferment", "Flambé", "Fry", "Grill", "Marinate", "Microwave", "Pan-Fry", "Pickle", "Poach", "Pressure-Cook", "Roast", "Sauté", "Sear", "Simmer", "Slow-Cook", "Smoke", "Sous-Vide", "Steam", "Stew", "Stir-Fry"];
const MEAL_TYPE_OPTIONS = ["Any", "Breakfast", "Brunch", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer"];

const InputField: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3" aria-hidden="true">
            {icon}
        </div>
        {children}
    </div>
);

interface ExtendedInputFormProps extends InputFormProps {
    onSurprise: () => void;
    pantryItems: PantryItem[];
    tasteProfile?: TasteProfile;
}

export const InputForm: React.FC<ExtendedInputFormProps> = ({ isLoading, onSubmit, onSurprise, pantryItems, tasteProfile }) => {
    const [formData, setFormData] = useState<FormData>({
        ingredients: 'chicken, tomatoes, garlic',
        diet: '',
        cuisine: 'Italian',
        cookingMethod: '',
        mealType: '',
    });
    const [profileBannerVisible, setProfileBannerVisible] = useState(true);

    const isProfileActive = tasteProfile && Object.values(tasteProfile).some(val => val);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    const handleSurprise = () => {
      const emptyForm: FormData = { ingredients: '', diet: '', cuisine: '', cookingMethod: '', mealType: '' };
      setFormData(emptyForm);
      onSubmit(emptyForm);
    }
    
    const handleUsePantry = () => {
        const pantryIngredients = pantryItems.map(item => item.name).join(', ');
        setFormData(prev => ({ ...prev, ingredients: pantryIngredients }));
    };

    const inputBaseClasses = "block w-full border border-[--border] bg-[--input] rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[--ring] focus:border-[--primary] sm:text-sm text-[--foreground] transition-colors";
    const selectClasses = `${inputBaseClasses} pl-10`;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-[--card] p-8 rounded-2xl shadow-lg border border-[--border]">
            {isProfileActive && profileBannerVisible && (
                <div className="bg-[--accent]/50 border border-[--primary]/50 text-[--accent-foreground] px-4 py-3 rounded-lg relative text-sm" role="alert">
                    <strong className="font-bold">Heads up!</strong>
                    <span className="block sm:inline ml-1">Your taste profile is being applied to this search.</span>
                    <button
                        type="button"
                        onClick={() => setProfileBannerVisible(false)}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        aria-label="Dismiss taste profile notification"
                    >
                        <svg className="fill-current h-6 w-6 text-[--accent-foreground]/70" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </button>
                </div>
            )}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[--card-foreground]">Create Your Perfect Dish</h2>
                <p className="text-[--muted-foreground] mt-2">Tell us what you have and what you like, and we'll whip up some recipes!</p>
            </div>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="ingredients" className="block text-sm font-medium text-[--foreground]">Ingredients</label>
                        {pantryItems.length > 0 && (
                            <button
                                type="button"
                                onClick={handleUsePantry}
                                className="text-xs font-semibold text-[--primary] hover:underline"
                            >
                                Use Pantry Ingredients
                            </button>
                        )}
                    </div>
                    <InputField icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[--muted-foreground]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a1 1 0 110 2H4a1 1 0 110-2zm12 0h-3a1 1 0 100 2h3a1 1 0 100-2zM4 8h6a1 1 0 110 2H4a1 1 0 110-2zm12 0h-6a1 1 0 100 2h6a1 1 0 100-2zM4 12h3a1 1 0 110 2H4a1 1 0 110-2zm12 0h-3a1 1 0 100 2h3a1 1 0 100-2zM10 15a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zM4 15a1 1 0 011-1h3a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" /></svg>}>
                        <input
                            type="text"
                            id="ingredients"
                            value={formData.ingredients}
                            onChange={handleChange}
                            placeholder="e.g., chicken, rice, broccoli"
                            className={`${inputBaseClasses} pl-10`}
                        />
                    </InputField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label htmlFor="mealType" className="block text-sm font-medium text-[--foreground] mb-2">Meal Type</label>
                        <InputField icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[--muted-foreground]" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 10a5 5 0 015-5v10a5 5 0 01-5-5z" /></svg>}>
                            <select id="mealType" value={formData.mealType} onChange={handleChange} className={selectClasses}>
                                {MEAL_TYPE_OPTIONS.map(option => <option key={option} value={option === "Any" ? "" : option}>{option}</option>)}
                            </select>
                        </InputField>
                    </div>
                    <div>
                        <label htmlFor="diet" className="block text-sm font-medium text-[--foreground] mb-2">Dietary Preference</label>
                        <InputField icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[--muted-foreground]" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.343 6.343a.5.5 0 01.707 0L10 9.293l2.95-2.95a.5.5 0 01.707.707L10.707 10l2.95 2.95a.5.5 0 01-.707.707L10 10.707l-2.95 2.95a.5.5 0 01-.707-.707L9.293 10 6.343 7.05a.5.5 0 010-.707z" /></svg>}>
                            <select id="diet" value={formData.diet} onChange={handleChange} className={selectClasses}>
                                {DIETARY_OPTIONS.map(option => <option key={option} value={option === "Any" ? "" : option}>{option}</option>)}
                            </select>
                        </InputField>
                    </div>
                    <div>
                        <label htmlFor="cuisine" className="block text-sm font-medium text-[--foreground] mb-2">Cuisine Type</label>
                        <InputField icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[--muted-foreground]" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}>
                            <select id="cuisine" value={formData.cuisine} onChange={handleChange} className={selectClasses}>
                                {CUISINE_OPTIONS.map(option => <option key={option} value={option === "Any" ? "" : option}>{option}</option>)}
                            </select>
                        </InputField>
                    </div>
                    <div>
                        <label htmlFor="cookingMethod" className="block text-sm font-medium text-[--foreground] mb-2">Cooking Method</label>
                        <InputField icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[--muted-foreground]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>}>
                            <select id="cookingMethod" value={formData.cookingMethod} onChange={handleChange} className={selectClasses}>
                                {COOKING_METHOD_OPTIONS.map(option => <option key={option} value={option === "Any" ? "" : option}>{option}</option>)}
                            </select>
                        </InputField>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row-reverse gap-4 pt-4 border-t border-[--border]">
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-[--primary-foreground] bg-[--primary] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] disabled:bg-[--muted] disabled:text-[--muted-foreground] disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : 'Generate Recipes'}
                </button>
                 <button
                    type="button"
                    onClick={handleSurprise}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex-1 sm:flex-none flex justify-center py-3 px-6 border border-[--border] rounded-lg shadow-sm text-sm font-semibold text-[--foreground] bg-transparent hover:bg-[--muted] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Surprise Me!
                </button>
            </div>
        </form>
    );
};