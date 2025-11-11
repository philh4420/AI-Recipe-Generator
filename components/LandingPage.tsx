import React, { useState, useEffect, useRef } from 'react';
import { AuthModal } from './AuthModal';
import { RecipeCard } from './RecipeCard';
import { Footer } from './Footer';
import { CookingMode } from './CookingMode';
import { signInWithEmailPassword, signUpWithEmailPassword } from '../services/authService';
import type { AuthCredentials, Recipe } from '../types';

interface LandingPageProps {
    onSignInWithGoogle: () => Promise<void>;
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

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M16.36,14.22c-0.28-0.45-0.58-1.1-0.6-1.55c1.42-0.2,2.44-1.34,2.44-2.67c0-1.49-1.21-2.7-2.7-2.7c-0.23,0-0.46,0.03-0.68,0.08C14.38,5.43,12.79,4.2,10.8,4.2c-2.3,0-4.21,1.65-4.57,3.83c-0.2-0.04-0.41-0.06-0.63-0.06c-1.49,0-2.7,1.21-2.7,2.7c0,1.33,1.02,2.47,2.44,2.67c-0.02,0.45-0.32,1.1-0.6,1.55C5.07,14.77,4,16.27,4,18c0,2.21,1.79,4,4,4h8c2.21,0,4-1.79,4-4C20,16.27,18.93,14.77,16.36,14.22z M12,19.5c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S12.83,19.5,12,19.5z" fill="currentColor"/>
    </svg>
);

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

const demoRecipe: Recipe = {
    recipeName: "Lemon Herb Roasted Chicken",
    description: "A succulent whole roasted chicken, seasoned with fresh lemon, garlic, and a blend of aromatic herbs. Perfectly golden-brown and juicy, it's a timeless classic that's simple to make yet impressive enough for any occasion.",
    prepTime: "20 mins",
    cookTime: "1 hr 15 mins",
    ingredients: [
        "1 whole chicken (about 4 lbs)",
        "1 large lemon, halved",
        "1 head of garlic, halved crosswise",
        "4 sprigs fresh rosemary",
        "4 sprigs fresh thyme",
        "2 tbsp olive oil",
        "1 tsp salt",
        "1/2 tsp black pepper"
    ],
    instructions: [
        "Preheat your oven to 425°F (220°C). Pat the chicken dry with paper towels.",
        "Season the chicken cavity generously with salt and pepper. Stuff with lemon halves, garlic, rosemary, and thyme.",
        "Rub the outside of the chicken with olive oil and season generously with salt and pepper.",
        "Place the chicken in a roasting pan and roast for 1 hour to 1 hour and 15 minutes, or until the juices run clear when a thigh is pierced.",
        "Let the chicken rest for 10-15 minutes before carving. Serve and enjoy!"
    ]
};

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <section className={`py-16 md:py-24 ${className}`}>
        <div className="container mx-auto px-4">
            {children}
        </div>
    </section>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[--foreground]">{children}</h2>
);

const AnimatedDiv: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const ref = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    ref.current?.classList.add('animate-slide-up-fade-in');
                    observer.unobserve(ref.current!);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`will-animate ${className}`}>
            {children}
        </div>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onSignInWithGoogle, isDarkMode, toggleDarkMode }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('signup');
    const [showDemo, setShowDemo] = useState(false);
    const [showCookingMode, setShowCookingMode] = useState(false);
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);

    const openAuthModal = (view: 'login' | 'signup') => {
        setAuthModalView(view);
        setIsAuthModalOpen(true);
    };

    const handleEmailSignUp = async (credentials: AuthCredentials) => {
        await signUpWithEmailPassword(credentials).catch(error => { throw error; });
    };
    
    const handleEmailSignIn = async (credentials: AuthCredentials) => {
        await signInWithEmailPassword(credentials).catch(error => { throw error; });
    };

    useEffect(() => {
        const handleScroll = () => setIsHeaderSticky(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <div className="border-b border-[--border]">
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-4 text-lg font-medium text-[--foreground]">
                    <span>{question}</span>
                    <svg className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                    <div className="pt-2 pb-4 text-[--muted-foreground]">{children}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen font-sans bg-[--background]">
            <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isHeaderSticky ? 'bg-[--background]/80 backdrop-blur-sm shadow-sm border-b border-[--border]' : ''}`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                           <LogoIcon className="h-7 w-7 text-[--primary]" />
                           <span className="text-2xl font-bold text-[--foreground]">AI Recipe Chef</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                             <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-full text-[--muted-foreground] hover:bg-[--muted] hover:text-[--foreground] transition-colors"
                                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                            </button>
                            <span className="hidden sm:inline text-sm text-[--muted-foreground]">Have an account?</span>
                            <button onClick={() => openAuthModal('login')} className="flex items-center gap-2 text-sm font-semibold text-[--foreground] hover:text-[--primary] transition-colors">
                                Sign In
                                <UserIcon className="h-6 w-6 p-1 rounded-full border-2 border-[--border]" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative flex items-center justify-center min-h-screen pt-20 pb-10 px-4 overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/10 via-[--background] to-[--accent]/10 animate-background-pan"></div>
                     <div className="relative z-10 text-center max-w-4xl mx-auto">
                        <AnimatedDiv>
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
                                    onClick={() => setShowDemo(true)}
                                    className="w-full sm:w-auto flex justify-center py-3 px-8 border border-[--border] rounded-lg shadow-sm text-base font-semibold text-[--foreground] bg-[--card] hover:bg-[--muted] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--background] transition-all duration-200"
                                >
                                    See an Example
                                </button>
                            </div>
                        </AnimatedDiv>
                        {showDemo && (
                            <div className="mt-12 max-w-4xl mx-auto animate-fade-in">
                                <div className="flex justify-end mb-2">
                                    <button 
                                        onClick={() => setShowDemo(false)}
                                        className="flex items-center gap-1 text-sm text-[--muted-foreground] hover:text-[--foreground] transition-colors"
                                        aria-label="Close example recipe"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        Close Example
                                    </button>
                                </div>
                                <RecipeCard 
                                    recipe={demoRecipe} 
                                    isDemo={true}
                                    onStartCooking={() => setShowCookingMode(true)}
                                />
                            </div>
                        )}
                    </div>
                </section>
                
                 <Section>
                    <AnimatedDiv>
                        <SectionTitle>How It Works</SectionTitle>
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
                            <div className="flex flex-col items-center">
                                <div className="bg-[--primary]/10 text-[--primary] p-4 rounded-full mb-4">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3v3m6-3v3" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">1. Enter Ingredients</h3>
                                <p className="text-[--muted-foreground]">List what's in your fridge or pantry. Be as specific or general as you like.</p>
                            </div>
                             <div className="flex flex-col items-center">
                                <div className="bg-[--primary]/10 text-[--primary] p-4 rounded-full mb-4">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">2. Customize Choices</h3>
                                <p className="text-[--muted-foreground]">Filter by diet, cuisine, and cooking style to match your preferences perfectly.</p>
                            </div>
                             <div className="flex flex-col items-center">
                                <div className="bg-[--primary]/10 text-[--primary] p-4 rounded-full mb-4">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">3. Get Recipes</h3>
                                <p className="text-[--muted-foreground]">Instantly receive creative, delicious recipes complete with instructions.</p>
                            </div>
                        </div>
                    </AnimatedDiv>
                </Section>
                
                <Section className="bg-[--muted]/30">
                     <AnimatedDiv>
                        <SectionTitle>Core Features</SectionTitle>
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="bg-[--card] p-6 rounded-xl shadow-sm border border-[--border]">
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-3"><svg className="h-6 w-6 text-[--primary]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>Creative Inspiration</h3>
                                <p className="text-sm text-[--muted-foreground]">Get unique recipe ideas based on any combination of ingredients, dietary needs, and cuisine styles.</p>
                            </div>
                            <div className="bg-[--card] p-6 rounded-xl shadow-sm border border-[--border]">
                               <h3 className="text-lg font-semibold mb-2 flex items-center gap-3"><svg className="h-6 w-6 text-[--primary]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>Reduce Food Waste</h3>
                               <p className="text-sm text-[--muted-foreground]">Use up what's in your fridge. Simply list your ingredients and discover meals you can make right now.</p>
                            </div>
                            <div className="bg-[--card] p-6 rounded-xl shadow-sm border border-[--border]">
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-3"><svg className="h-6 w-6 text-[--primary]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>Personal Cookbook</h3>
                                <p className="text-sm text-[--muted-foreground]">Save the recipes you love to your personal collection. Your next culinary masterpiece is always just a click away.</p>
                            </div>
                        </div>
                     </AnimatedDiv>
                </Section>
                
                 <Section>
                    <AnimatedDiv>
                        <SectionTitle>Endless Culinary Possibilities</SectionTitle>
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="mb-8 text-[--muted-foreground]">Tailor every search to your exact needs with our powerful filters.</p>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-3">Dietary Needs</h4>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Vegetarian', 'Pescatarian'].map(tag => <span key={tag} className="bg-[--muted] text-[--muted-foreground] text-sm px-3 py-1 rounded-full">{tag}</span>)}
                                    </div>
                                </div>
                                 <div>
                                    <h4 className="font-semibold mb-3">Cuisine Types</h4>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['Italian', 'Mexican', 'Japanese', 'Indian', 'Thai', 'French', 'Chinese'].map(tag => <span key={tag} className="bg-[--muted] text-[--muted-foreground] text-sm px-3 py-1 rounded-full">{tag}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedDiv>
                </Section>

                <Section className="bg-[--muted]/30">
                    <AnimatedDiv>
                        <SectionTitle>What Our Users Say</SectionTitle>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <blockquote className="bg-[--card] p-6 rounded-xl shadow-sm border border-[--border] text-center">
                                <p className="text-[--muted-foreground] italic">"This app is a lifesaver! I used to throw away so much food. Now I just type in what I have and get amazing dinner ideas."</p>
                                <footer className="mt-4 font-semibold">- Sarah J.</footer>
                            </blockquote>
                            <blockquote className="bg-[--card] p-6 rounded-xl shadow-sm border border-[--border] text-center">
                                <p className="text-[--muted-foreground] italic">"As someone with dietary restrictions, this is a game-changer. I can filter for gluten-free and vegan recipes instantly."</p>
                                <footer className="mt-4 font-semibold">- Michael B.</footer>
                            </blockquote>
                             <blockquote className="bg-[--card] p-6 rounded-xl shadow-sm border border-[--border] text-center">
                                <p className="text-[--muted-foreground] italic">"I'm exploring so many new cuisines! The 'Surprise Me' feature is my favorite for breaking out of my cooking rut."</p>
                                <footer className="mt-4 font-semibold">- Emily C.</footer>
                            </blockquote>
                        </div>
                    </AnimatedDiv>
                </Section>
                
                 <Section>
                    <AnimatedDiv>
                        <SectionTitle>Frequently Asked Questions</SectionTitle>
                        <div className="max-w-2xl mx-auto">
                           <FaqItem question="Is AI Recipe Chef free to use?">Yes! Our core features—generating recipes and saving them to your personal cookbook—are completely free. We may introduce premium features in the future.</FaqItem>
                           <FaqItem question="Where do the recipes come from?">Our recipes are generated by a powerful AI trained on a vast database of culinary knowledge. It creates unique recipes on the fly based on your inputs.</FaqItem>
                           <FaqItem question="What if I don't like a recipe?">No problem! Every generated recipe comes with modification options like 'Make it Quicker' or 'Make it Healthier'. You can refine the suggestions until they're perfect for you.</FaqItem>
                           <FaqItem question="Can I use it for very specific ingredients?">Absolutely. The more specific you are (e.g., "chicken thighs, canned tomatoes, capers"), the more tailored your recipe results will be.</FaqItem>
                           <FaqItem question="How many recipes can I save?">You can save as many recipes as you like to your personal cookbook. They'll be waiting for you whenever you sign in.</FaqItem>
                           <FaqItem question="Can I print my recipes?">Yes, every recipe card has a print button. This formats the recipe in a clean, easy-to-read layout, perfect for taking to the kitchen.</FaqItem>
                        </div>
                    </AnimatedDiv>
                </Section>

                <Section className="bg-[--muted]/30">
                    <AnimatedDiv className="flex flex-col items-center text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl font-semibold mb-4 text-[--foreground]">Ready to Start Cooking?</h2>
                        <p className="text-[--muted-foreground] mb-8">Your next culinary adventure is just a click away. Sign up for free and unlock a world of delicious possibilities.</p>
                        <button
                            onClick={() => openAuthModal('signup')}
                            className="w-full sm:w-auto flex items-center justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-base font-semibold text-[--primary-foreground] bg-[--primary] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring] focus:ring-offset-[--background] transition-all duration-200"
                        >
                            Create Your Free Account
                        </button>
                    </AnimatedDiv>
                </Section>
            </main>
            
            <Footer />

            {isAuthModalOpen && (
                <AuthModal
                    initialView={authModalView}
                    onClose={() => setIsAuthModalOpen(false)}
                    onSignIn={handleEmailSignIn}
                    onSignUp={handleEmailSignUp}
                />
            )}
            {showCookingMode && (
                <CookingMode recipe={demoRecipe} onClose={() => setShowCookingMode(false)} />
            )}
        </div>
    );
};