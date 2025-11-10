import React, { useState, useEffect, useRef } from 'react';
import { AuthModal } from './AuthModal';
import { RecipeCard } from './RecipeCard';
import { signInWithEmailPassword, signUpWithEmailPassword } from '../services/authService';
import type { AuthCredentials, Recipe } from '../types';

interface LandingPageProps {
    onSignInWithGoogle: () => Promise<void>;
}

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
    imageUrl: "data:image/jpeg;base64,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",
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

export const LandingPage: React.FC<LandingPageProps> = ({ onSignInWithGoogle }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('signup');
    const [showDemo, setShowDemo] = useState(false);
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
                    <div className="pb-4 text-[--muted-foreground]">{children}</div>
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
                           <span className="text-2xl font-bold text-[--foreground]">RecipeGenius</span>
                        </div>
                        <div className="flex items-center gap-4">
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
                            <div className="mt-12 max-w-4xl mx-auto">
                                <RecipeCard recipe={demoRecipe} isDemo={true} />
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
                           <FaqItem question="Is RecipeGenius free to use?">Yes! Our core features—generating recipes and saving them to your personal cookbook—are completely free. We may introduce premium features in the future.</FaqItem>
                           <FaqItem question="Where do the recipes come from?">Our recipes are generated by a powerful AI trained on a vast database of culinary knowledge. It creates unique recipes on the fly based on your inputs.</FaqItem>
                           <FaqItem question="Can I use it for very specific ingredients?">Absolutely. The more specific you are (e.g., "chicken thighs, canned tomatoes, capers"), the more tailored your recipe results will be.</FaqItem>
                           <FaqItem question="How many recipes can I save?">You can save as many recipes as you like to your personal cookbook. They'll be waiting for you whenever you sign in.</FaqItem>
                        </div>
                    </AnimatedDiv>
                </Section>

                <Section>
                    <AnimatedDiv className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold mb-4">Ready to Start Cooking?</h2>
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
