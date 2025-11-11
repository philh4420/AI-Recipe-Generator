import React, { useState, useEffect } from 'react';
import type { TasteProfile } from '../types';

interface ProfileProps {
    tasteProfile: TasteProfile;
    onUpdateProfile: (newProfile: TasteProfile) => Promise<void>;
}

const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const DIETARY_OPTIONS = ["None", "Atkins", "Dairy-Free", "DASH", "Diabetic", "Egg-Free", "Gluten-Free", "Halal", "Keto", "Kosher", "Low-Carb", "Low-Fat", "Low-FODMAP", "Low-Salt", "Nut-Free", "Paleo", "Pescatarian", "Raw Food", "Shellfish-Free", "Soy-Free", "Sugar-Free", "Vegan", "Vegetarian", "Whole30"];

const FormField: React.FC<{
    label: string;
    id: keyof TasteProfile;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    helpText: string;
    type?: 'text' | 'textarea' | 'select';
}> = ({ label, id, placeholder, value, onChange, helpText, type = 'text' }) => {
    
    const baseClasses = "block w-full border border-[--border] bg-[--input] rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[--ring] focus:border-[--primary] sm:text-sm text-[--foreground] transition-colors";

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-[--foreground] mb-2">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${baseClasses} min-h-[80px]`}
                />
            ) : type === 'select' ? (
                <select id={id} name={id} value={value} onChange={onChange} className={baseClasses}>
                    {DIETARY_OPTIONS.map(opt => <option key={opt} value={opt === "None" ? "" : opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type="text"
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={baseClasses}
                />
            )}
            <p className="mt-2 text-xs text-[--muted-foreground]">{helpText}</p>
        </div>
    );
};

export const Profile: React.FC<ProfileProps> = ({ tasteProfile, onUpdateProfile }) => {
    const [formData, setFormData] = useState<TasteProfile>(tasteProfile);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(tasteProfile);
    }, [tasteProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onUpdateProfile(formData);
        setIsSaving(false);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
                <UserCircleIcon className="mx-auto h-12 w-12 text-[--primary]/80" />
                <h2 className="text-3xl font-bold text-[--foreground] mt-4">My Taste Profile</h2>
                <p className="text-[--muted-foreground] mt-2">Personalize your recipe suggestions for a perfect match, every time.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[--card] p-8 rounded-2xl shadow-lg border border-[--border] space-y-6">
                <FormField
                    label="Favorite Ingredients"
                    id="favoriteIngredients"
                    placeholder="e.g., garlic, cilantro, ginger, soy sauce"
                    value={formData.favoriteIngredients || ''}
                    onChange={handleChange}
                    helpText="List ingredients you love. The AI will try to include them."
                />
                <FormField
                    label="Favorite Cuisines"
                    id="favoriteCuisines"
                    placeholder="e.g., Thai, Italian, Mexican"
                    value={formData.favoriteCuisines || ''}
                    onChange={handleChange}
                    helpText="List cuisines you enjoy for inspired suggestions."
                />
                <FormField
                    label="Default Dietary Preference"
                    id="dietaryPreference"
                    placeholder="Select a diet"
                    value={formData.dietaryPreference || ''}
                    onChange={handleChange}
                    helpText="This will be your default diet for all searches. You can still override it on the generator page."
                    type="select"
                />
                 <FormField
                    label="Excluded Ingredients / Allergies"
                    id="excludedIngredients"
                    placeholder="e.g., mushrooms, peanuts, shellfish"
                    value={formData.excludedIngredients || ''}
                    onChange={handleChange}
                    helpText="Crucial! List any ingredients to be strictly excluded from all recipes."
                    type="textarea"
                />

                <div className="pt-4 border-t border-[--border] flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full sm:w-auto flex items-center justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-[--primary-foreground] bg-[--primary] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--card] disabled:bg-[--muted] disabled:text-[--muted-foreground] disabled:cursor-not-allowed transition-all duration-200"
                    >
                         {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Saving...
                            </>
                        ) : 'Save My Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};