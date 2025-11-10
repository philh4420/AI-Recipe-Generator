import React, { useState } from 'react';
import { AuthModal } from './AuthModal';
import { signInWithEmailPassword, signUpWithEmailPassword } from '../services/authService';
import type { AuthCredentials } from '../types';

interface LandingPageProps {
    onSignIn: () => Promise<void>;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
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

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,28.717,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 6.253h4.5M9.75 17.747h4.5M5.25 6.253L3 9.5l2.25 3.247M18.75 6.253L21 9.5l-2.25 3.247" />
    </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, isDarkMode, toggleDarkMode }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('signup');

    const openAuthModal = (view: 'login' | 'signup') => {
        setAuthModalView(view);
        setIsAuthModalOpen(true);
    };

    const handleEmailSignUp = async (credentials: AuthCredentials) => {
        try {
            await signUpWithEmailPassword(credentials);
            // The onAuthStateChanged listener in App.tsx will handle the rest.
            setIsAuthModalOpen(false);
        } catch (error: any) {
            // Re-throw so the modal can handle its loading state and display error
            throw error;
        }
    };
    
    const handleEmailSignIn = async (credentials: AuthCredentials) => {
        try {
            await signInWithEmailPassword(credentials);
            setIsAuthModalOpen(false);
        } catch (error: any) {
             throw error;
        }
    };

    return (
        <div className="min-h-screen font-sans">
            <header className="absolute top-0 left-0 right-0 z-10">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <LogoIcon className="h-8 w-8 text-[--primary]" />
                            <h1 className="text-2xl font-bold text-[--foreground]">AI Recipe Chef</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => openAuthModal('login')}
                                className="text-sm font-semibold text-[--foreground] hover:text-[--primary] transition-colors"
                            >
                                Sign In
                            </button>
                             <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-full text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground] transition-colors"
                                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative flex items-center justify-center min-h-screen pt-20 pb-10 px-4">
                     <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
                     <div className="relative z-10 text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-[--foreground] tracking-tight">
                            Never Wonder What's for Dinner Again
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-[--muted-foreground] max-w-2xl mx-auto">
                           Turn the ingredients you have into delicious meals. Get personalized recipes, save your favorites, and say goodbye to food waste.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button
                                onClick={() => openAuthModal('signup')}
                                className="w-full sm:w-auto flex items-center justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-base font-semibold text-[--primary-foreground] bg-[--primary] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--background] transition-all duration-200"
                            >
                                Get Started for Free
                            </button>
                            <button
                                onClick={onSignIn}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 py-3 px-8 border border-[--border] rounded-lg shadow-sm text-base font-semibold text-[--foreground] bg-[--card] hover:bg-[--muted] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--background] transition-all duration-200"
                            >
                                <GoogleIcon className="h-6 w-6" />
                                <span>Sign in with Google</span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            
            {isAuthModalOpen && (
                <AuthModal
                    initialView={authModalView}
                    onClose={() => setIsAuthModalOpen(false)}
                    onSignIn={handleEmailSignIn}
                    onSignUp={handleEmailSignUp}
                />
            )}
        </div>
    );
};
