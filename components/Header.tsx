import React, { useState, useEffect, useRef } from 'react';
import type { FirebaseUser } from '../types';

// --- ICONS ---
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

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[--primary]">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
        </svg>
        <span className="text-xl font-bold text-[--foreground]">RecipeGenius</span>
    </div>
);


// --- PROPS INTERFACE ---
interface HeaderProps {
    user: FirebaseUser;
    onSignOut: () => Promise<void>;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    view: 'generator' | 'saved';
    setView: (view: 'generator' | 'saved') => void;
}

// --- MAIN HEADER COMPONENT ---
export const Header: React.FC<HeaderProps> = ({ user, onSignOut, isDarkMode, toggleDarkMode, view, setView }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = (name?: string | null, email?: string | null) => {
        if (name) return name.charAt(0).toUpperCase();
        if (email) return email.charAt(0).toUpperCase();
        return 'U';
    };

    const UserAvatar = () => (
        user.photoURL ? (
            <img src={user.photoURL} alt="User profile" className="h-9 w-9 rounded-full" />
        ) : (
            <div className="h-9 w-9 rounded-full bg-[--primary] flex items-center justify-center text-sm font-bold text-[--primary-foreground]">
                {getInitials(user.displayName, user.email)}
            </div>
        )
    );

    const NavButton: React.FC<{ targetView: 'generator' | 'saved', children: React.ReactNode }> = ({ targetView, children }) => (
        <button
            onClick={() => { setView(targetView); setIsMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${view === targetView ? 'bg-[--primary]/10 text-[--primary]' : 'text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]'}`}
            aria-current={view === targetView}
        >
            {children}
        </button>
    );

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur border-b border-[--border] bg-[--background]/80">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Logo */}
                    <Logo />

                    {/* Center: Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                        <NavButton targetView="generator">Generator</NavButton>
                        <NavButton targetView="saved">My Recipes</NavButton>
                    </nav>

                    {/* Right: Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full text-[--foreground] hover:bg-[--muted] focus:outline-none focus:ring-2 focus:ring-[--ring] focus:ring-offset-2 focus:ring-offset-[--background] transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        </button>
                        
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-[--ring] focus:ring-offset-2 focus:ring-offset-[--background]">
                                <UserAvatar />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-[--card] border border-[--border] rounded-xl shadow-lg animate-fade-in origin-top-right z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[--border]">
                                        <p className="text-sm font-semibold text-[--foreground] truncate">{user.displayName || 'User'}</p>
                                        <p className="text-xs text-[--muted-foreground] truncate">{user.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button 
                                            onClick={onSignOut} 
                                            className="w-full text-left text-sm px-3 py-2 rounded-md text-[--muted-foreground] hover:bg-[--muted] hover:text-[--destructive] transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile: Hamburger Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-md text-[--foreground]" aria-label="Open menu">
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay & Panel */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/30" onClick={() => setIsMobileMenuOpen(false)}></div>
                    {/* Panel */}
                    <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-[--background] shadow-lg p-4">
                        <div className="flex justify-between items-center mb-6">
                            <Logo />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md text-[--foreground]" aria-label="Close menu">
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-2">
                            <NavButton targetView="generator">Generator</NavButton>
                            <NavButton targetView="saved">My Recipes</NavButton>
                        </nav>
                        <div className="border-t border-[--border] my-4"></div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[--foreground]">Theme</span>
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-full text-[--foreground] bg-[--muted] hover:bg-[--muted]/80"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                             <button 
                                onClick={onSignOut} 
                                className="w-full text-center text-sm px-4 py-3 rounded-md text-[--destructive] bg-[--destructive]/10 hover:bg-[--destructive]/20 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
