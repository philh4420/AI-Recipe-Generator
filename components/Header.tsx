import React from 'react';

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    view: 'generator' | 'saved';
    setView: (view: 'generator' | 'saved') => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, view, setView }) => {
    
    const navButtonClasses = (buttonView: 'generator' | 'saved') => 
        `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === buttonView
            ? 'bg-[--primary] text-[--primary-foreground]'
            : 'bg-transparent text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground]'
        }`;

    return (
        <header className="text-center mb-12 relative">
            <button
                onClick={toggleDarkMode}
                className="absolute top-0 right-0 p-2 rounded-full bg-[--card] text-[--foreground] hover:bg-[--muted] focus:outline-none focus:ring-2 focus:ring-[--ring] transition-colors"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>

             <h1 className="text-4xl md:text-5xl font-extrabold text-[--foreground] tracking-tight">
                AI Recipe <span className="text-[--primary]">Generator</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-[--muted-foreground]">
                Turn your pantry into a culinary adventure. Let AI be your sous-chef!
            </p>

            <nav className="mt-8 flex justify-center gap-2 bg-[--card] p-2 rounded-lg max-w-xs mx-auto shadow-sm">
                 <button onClick={() => setView('generator')} className={navButtonClasses('generator')}>
                    Generator
                </button>
                <button onClick={() => setView('saved')} className={navButtonClasses('saved')}>
                    My Recipes
                </button>
            </nav>
        </header>
    );
};
