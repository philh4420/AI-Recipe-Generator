import React, { useState, useRef, useEffect } from 'react';
import type { FirebaseUser } from '../types';

interface HeaderProps {
    user: FirebaseUser | null;
    onSignOut: () => Promise<void>;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    view: 'generator' | 'saved';
    setView: (view: 'generator' | 'saved') => void;
}

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.253h4.5M9.75 17.747h4.5M5.25 6.253L3 9.5l2.25 3.247M18.75 6.253L21 9.5l-2.25 3.247" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, isDarkMode, toggleDarkMode, view, setView }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const NavButton: React.FC<{
        currentView: 'generator' | 'saved',
        targetView: 'generator' | 'saved',
        onClick: (view: 'generator' | 'saved') => void,
        children: React.ReactNode
    }> = ({ currentView, targetView, onClick, children }) => {
        const isActive = currentView === targetView;
        const activeClasses = "bg-[--primary] text-[--primary-foreground]";
        const inactiveClasses = "text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground]";
        return (
            <button
                onClick={() => onClick(targetView)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isActive ? activeClasses : inactiveClasses}`}
            >
                {children}
            </button>
        );
    };

    return (
        <header className="bg-[--card] border-b border-[--border] sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        <LogoIcon className="h-7 w-7 text-[--primary]" />
                        <h1 className="text-xl font-bold text-[--foreground]">AI Recipe Chef</h1>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2 bg-[--input] p-1 rounded-lg border border-[--border]">
                        <NavButton currentView={view} targetView="generator" onClick={setView}>Generator</NavButton>
                        <NavButton currentView={view} targetView="saved" onClick={setView}>Saved Recipes</NavButton>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground] transition-colors"
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                        </button>
                        {user && (
                             <div ref={menuRef} className="relative">
                                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User profile" className="h-8 w-8 rounded-full" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-[--muted] flex items-center justify-center">
                                             <UserIcon className="h-5 w-5 text-[--muted-foreground]" />
                                        </div>
                                    )}
                                </button>
                                {menuOpen && (
                                     <div className="absolute right-0 mt-2 w-48 bg-[--card] border border-[--border] rounded-lg shadow-lg py-1 animate-fade-in-sm">
                                        <div className="px-4 py-2 border-b border-[--border]">
                                            <p className="text-sm font-medium text-[--foreground] truncate">{user.displayName || 'User'}</p>
                                            <p className="text-xs text-[--muted-foreground] truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={onSignOut}
                                            className="w-full text-left px-4 py-2 text-sm text-[--destructive] hover:bg-[--destructive]/10"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                 <div className="md:hidden flex items-center justify-center gap-2 bg-[--input] p-1 rounded-lg border border-[--border] mb-4">
                    <NavButton currentView={view} targetView="generator" onClick={setView}>Generator</NavButton>
                    <NavButton currentView={view} targetView="saved" onClick={setView}>Saved Recipes</NavButton>
                </div>
            </div>
        </header>
    );
};
