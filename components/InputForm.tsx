import React, { useState } from 'react';
import type { InputFormProps, FormData } from '../types';

const DIETARY_OPTIONS = ["Any", "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo"];
const CUISINE_OPTIONS = ["Any", "Italian", "Mexican", "Chinese", "Indian", "Japanese", "Mediterranean", "Thai"];
const COOKING_METHOD_OPTIONS = ["Any", "Bake", "Fry", "Roast", "Grill", "Steam", "Slow-Cook"];

const InputField: React.FC<{ label: string; id: string; children: React.ReactNode }> = ({ label, id, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-[--card-foreground] mb-1">{label}</label>
        {children}
    </div>
);

const SelectField: React.FC<{ id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }> = ({ id, value, onChange, options }) => (
    <select
        id={id}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-[--border] bg-[--input] text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--ring] focus:border-[--primary] sm:text-sm rounded-md shadow-sm"
    >
        {options.map(option => <option key={option} value={option === "Any" ? "" : option}>{option}</option>)}
    </select>
);

export const InputForm: React.FC<InputFormProps & { onSurprise: () => void }> = ({ isLoading, onSubmit, onSurprise }) => {
    const [formData, setFormData] = useState<FormData>({
        ingredients: 'chicken, tomatoes, garlic',
        diet: '',
        cuisine: 'Italian',
        cookingMethod: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };
    
    const handleSurprise = () => {
      const emptyForm: FormData = { ingredients: '', diet: '', cuisine: '', cookingMethod: '' };
      setFormData(emptyForm);
      onSurprise();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-[--card] p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-[--card-foreground]">Create Your Perfect Dish</h2>
            <p className="text-[--muted-foreground]">Tell us what you have and what you like, and we'll whip up some recipes for you!</p>
            
            <InputField label="Ingredients" id="ingredients">
                <input
                    type="text"
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    placeholder="e.g., chicken, rice, broccoli"
                    className="mt-1 block w-full border border-[--border] bg-[--input] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[--ring] focus:border-[--primary] sm:text-sm text-[--foreground]"
                />
            </InputField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="Dietary Preference" id="diet">
                    <SelectField id="diet" value={formData.diet} onChange={handleChange} options={DIETARY_OPTIONS} />
                </InputField>
                <InputField label="Cuisine Type" id="cuisine">
                    <SelectField id="cuisine" value={formData.cuisine} onChange={handleChange} options={CUISINE_OPTIONS} />
                </InputField>
                <InputField label="Cooking Method" id="cookingMethod">
                    <SelectField id="cookingMethod" value={formData.cookingMethod} onChange={handleChange} options={COOKING_METHOD_OPTIONS} />
                </InputField>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[--primary-foreground] bg-[--primary] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] disabled:bg-[--muted] disabled:text-[--muted-foreground] disabled:cursor-not-allowed transition-all duration-200"
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
                    className="w-full sm:w-auto flex justify-center py-3 px-6 border border-[--primary] rounded-md shadow-sm text-sm font-medium text-[--primary] bg-transparent hover:bg-[--primary]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Surprise Me!
                </button>
            </div>
        </form>
    );
};