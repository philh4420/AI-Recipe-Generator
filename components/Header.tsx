import React, { useState, useRef, useEffect } from 'react';
import type { FirebaseUser, View } from '../types';

interface HeaderProps {
    user: FirebaseUser | null;
    onSignOut: () => Promise<void>;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    view: View;
    setView: (view: View) => void;
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
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M16.36,14.22c-0.28-0.45-0.58-1.1-0.6-1.55c1.42-0.2,2.44-1.34,2.44-2.67c0-1.49-1.21-2.7-2.7-2.7c-0.23,0-0.46,0.03-0.68,0.08C14.38,5.43,12.79,4.2,10.8,4.2c-2.3,0-4.21,1.65-4.57,3.83c-0.2-0.04-0.41-0.06-0.63-0.06c-1.49,0-2.7,1.21-2.7,2.7c0,1.33,1.02,2.47,2.44,2.67c-0.02,0.45-0.32,1.1-0.6,1.55C5.07,14.77,4,16.27,4,18c0,2.21,1.79,4,4,4h8c2.21,0,4-1.79,4-4C20,16.27,18.93,14.77,16.36,14.22z M12,19.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S12.83,19.5,12,19.5z" fill="currentColor"/>
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ user, onSignOut, isDarkMode, toggleDarkMode, view, setView }) => {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
             if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('[data-mobile-menu-button]')) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const NavButton: React.FC<{
        targetView: View,
        children: React.ReactNode,
        isMobile?: boolean
    }> = ({ targetView, children, isMobile }) => {
        const isActive = view === targetView;
        
        const desktopClasses = `px-3 py-2 rounded-md text-sm font-semibold transition-colors ${isActive ? 'bg-[--primary] text-[--primary-foreground]' : 'text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground]'}`;
        const mobileClasses = `block w-full text-left px-4 py-2 text-base ${isActive ? 'bg-[--primary]/10 text-[--primary] font-bold' : 'text-[--foreground] hover:bg-[--muted]'}`;

        return (
            <button onClick={() => { setView(targetView); setMobileMenuOpen(false); }} className={isMobile ? mobileClasses : desktopClasses}>
                {children}
            </button>
        );
    };

    return (
        <header className="bg-[--card] border-b border-[--border] sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Left side */}
                    <div className="flex items-center gap-2">
                        <LogoIcon className="h-7 w-7 text-[--primary]" />
                        <h1 className="text-xl font-bold text-[--foreground]">AI Recipe Chef</h1>
                    </div>
                    
                    {/* Center Navigation (Desktop) */}
                    <nav className="hidden md:flex items-center gap-1 bg-[--input] p-1 rounded-lg border border-[--border]">
                        <NavButton targetView="generator">Generator</NavButton>
                        <NavButton targetView="saved">Saved Recipes</NavButton>
                        <NavButton targetView="pantry">Pantry</NavButton>
                        <NavButton targetView="shoppingList">Shopping List</NavButton>
                        <NavButton targetView="mealPlanner">Meal Planner</NavButton>
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground] transition-colors"
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        </button>
                        
                        {/* Profile Menu */}
                        {user && (
                             <div ref={profileMenuRef} className="relative hidden md:block">
                                <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center gap-2">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User profile" className="h-8 w-8 rounded-full" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-[--muted] flex items-center justify-center">
                                             <UserIcon className="h-5 w-5 text-[--muted-foreground]" />
                                        </div>
                                    )}
                                </button>
                                {profileMenuOpen && (
                                     <div className="absolute right-0 mt-2 w-56 bg-[--card] border border-[--border] rounded-lg shadow-lg py-1 animate-fade-in">
                                        <div className="px-4 py-2 border-b border-[--border]">
                                            <p className="text-sm font-medium text-[--foreground] truncate">{user.displayName || 'User'}</p>
                                            <p className="text-xs text-[--muted-foreground] truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => { setView('profile'); setProfileMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-sm text-[--foreground] hover:bg-[--muted]"
                                        >
                                            My Profile
                                        </button>
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

                         {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                data-mobile-menu-button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-md text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground]"
                                aria-label="Open main menu"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile Menu Panel */}
            <div className={`mobile-menu-overlay fixed inset-0 bg-black/50 z-40 md:hidden ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
            <div ref={mobileMenuRef} className={`mobile-menu fixed top-0 right-0 h-full w-64 bg-[--card] shadow-lg z-50 p-4 md:hidden ${mobileMenuOpen ? 'open' : ''}`}>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Menu</h2>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                 </div>
                 <nav className="flex flex-col gap-2">
                    <NavButton targetView="generator" isMobile>Generator</NavButton>
                    <NavButton targetView="saved" isMobile>Saved Recipes</NavButton>
                    <NavButton targetView="pantry" isMobile>Pantry</NavButton>
                    <NavButton targetView="shoppingList" isMobile>Shopping List</NavButton>
                    <NavButton targetView="mealPlanner" isMobile>Meal Planner</NavButton>
                    <div className="border-b border-[--border] my-2"></div>
                    <NavButton targetView="profile" isMobile>My Profile</NavButton>
                     <button onClick={onSignOut} className="w-full text-left px-4 py-2 text-base text-[--destructive] hover:bg-[--destructive]/10 rounded-md">
                        Sign Out
                    </button>
                 </nav>
            </div>
        </header>
    );
};