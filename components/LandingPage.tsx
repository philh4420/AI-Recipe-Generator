import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { signInWithEmailPassword, signUpWithEmailPassword } from '../services/authService';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '../types';

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

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.8 0 256S110.3 0 244 0c69.8 0 133.2 27.2 181.3 73.3l-64.3 64.3c-24.5-23-58.6-37.5-97-37.5-73.2 0-132.3 59.4-132.3 132.3s59.1 132.3 132.3 132.3c84 0 116.3-59.4 120.2-88.5H244V261.8h244z"></path>
    </svg>
);

const QuoteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
        <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
    </svg>
);

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[--muted-foreground]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);
const WasteIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="h-8 w-8 text-[--muted-foreground]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
    </svg>
);
const BookmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[--muted-foreground]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);


// --- DEMO RECIPE DATA ---
const demoRecipe: Recipe = {
    recipeName: "Garlic Parmesan Chicken",
    description: "A quick, flavorful, and juicy chicken dish coated in a garlic parmesan crust, perfect for a weeknight dinner.",
    prepTime: "10 mins",
    cookTime: "20 mins",
    ingredients: ["4 chicken breasts", "1/2 cup grated Parmesan", "1 tsp garlic powder", "1 tsp dried oregano", "Salt and pepper to taste", "2 tbsp olive oil"],
    instructions: ["Preheat oven to 400°F (200°C).", "In a bowl, mix Parmesan, garlic powder, oregano, salt, and pepper.", "Coat chicken breasts in olive oil, then press into the Parmesan mixture.", "Place on a baking sheet and bake for 20-25 minutes, or until golden and cooked through."]
};

// --- HOOK FOR SCROLL ANIMATIONS ---
const useScrollAnimation = () => {
    useEffect(() => {
        const elements = document.querySelectorAll('.will-animate');
        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);
};


// --- LANDING PAGE PROPS & COMPONENT ---
interface LandingPageProps {
  onSignIn: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, isDarkMode, toggleDarkMode }) => {
  const [modalView, setModalView] = useState<'login' | 'signup' | null>(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => setIsHeaderScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const faqItems = [
      { q: "Is RecipeGenius free to use?", a: "Yes, RecipeGenius is completely free to sign up for and use. You can generate and save recipes without any cost." },
      { q: "Where do the recipes come from?", a: "Our recipes are generated by a powerful, state-of-the-art AI model. It creates unique recipes based on your specific inputs, ensuring a new and creative experience every time." },
      { q: "Can I use it on my phone?", a: "Absolutely! While there isn't a dedicated mobile app yet, our website is fully responsive and designed to work beautifully on all devices, including phones and tablets." },
      { q: "How accurate are the cooking times and ingredient amounts?", a: "The AI provides estimated cooking times and standard ingredient measurements. As with any recipe, we recommend using your best judgment, as factors like oven temperature and ingredient variations can affect the outcome." },
  ];

  return (
    <>
      <div className="min-h-screen font-sans flex flex-col bg-[--background]">
        <header className={`sticky top-0 z-40 w-full backdrop-blur flex-none transition-all duration-300 ${isHeaderScrolled ? 'shadow-lg border-b border-[--border]' : ''}`}>
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-[--foreground]">RecipeGenius</h1>
            <div className="flex items-center gap-4">
                <span className='text-sm text-[--muted-foreground]'>
                    Have an account? <button onClick={() => setModalView('login')} className="font-bold text-[--primary] hover:underline">Sign In</button>
                </span>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-[--card] text-[--foreground] hover:bg-[--muted] focus:outline-none focus:ring-2 focus:ring-[--ring] transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 bg-gradient-to-br from-[--background] via-[--muted] to-[--background] animate-background-pan">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-[--foreground] tracking-tight animate-fade-in">
                            Your Personal AI <span className="text-[--primary]">Sous-Chef</span>
                        </h2>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-[--muted-foreground] animate-fade-in [animation-delay:200ms]">
                            Stop wondering what to make. Turn the ingredients you have into delicious, AI-generated recipes and save your favorites for later.
                        </p>
                        <div className="mt-10 animate-fade-in [animation-delay:400ms] flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={() => setModalView('signup')} className="w-full sm:w-auto bg-[--primary] text-[--primary-foreground] font-semibold py-3 px-8 rounded-lg shadow-lg hover:brightness-95 transition-transform transform hover:scale-105">
                                Sign Up with Email
                            </button>
                            <button onClick={onSignIn} className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-white text-gray-700 font-semibold py-3 px-8 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-transform transform hover:scale-105">
                                <GoogleIcon /> Continue with Google
                            </button>
                        </div>
                        <div className="mt-8 animate-fade-in [animation-delay:500ms]">
                            <button onClick={() => setShowDemo(!showDemo)} className="text-[--muted-foreground] hover:text-[--primary] text-sm font-semibold transition-colors">
                                {showDemo ? 'Hide Example' : 'See an Example'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Recipe Section */}
            {showDemo && (
                <section className="py-12 bg-[--muted]/30">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="animate-fade-in">
                           <RecipeCard recipe={demoRecipe} isDemo={true} />
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="py-20">
                 <div className="container mx-auto px-4 text-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-[--card] p-8 rounded-2xl shadow-md border border-[--border] will-animate">
                            <LightbulbIcon />
                            <h3 className="text-lg font-semibold my-3 text-left">Creative Inspiration</h3>
                            <p className="text-sm text-[--muted-foreground] text-left">Get unique recipe ideas based on any combination of ingredients, dietary needs, and cuisine styles.</p>
                        </div>
                         <div className="bg-[--card] p-8 rounded-2xl shadow-md border border-[--border] will-animate [animation-delay:200ms]">
                            <WasteIcon />
                            <h3 className="text-lg font-semibold my-3 text-left">Reduce Food Waste</h3>
                            <p className="text-sm text-[--muted-foreground] text-left">Use up what's in your fridge. Simply list your ingredients and discover meals you can make right now.</p>
                        </div>
                         <div className="bg-[--card] p-8 rounded-2xl shadow-md border border-[--border] will-animate [animation-delay:400ms]">
                            <BookmarkIcon />
                            <h3 className="text-lg font-semibold my-3 text-left">Personal Cookbook</h3>
                            <p className="text-sm text-[--muted-foreground] text-left">Save the recipes you love to your personal collection. Your next culinary masterpiece is always just a click away.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Customization Showcase Section */}
            <section className="py-20 bg-[--muted]/30">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-3xl font-bold text-[--foreground] mb-4">Tailored to Your Taste</h3>
                    <p className="text-[--muted-foreground] mb-12 max-w-2xl mx-auto">From dietary needs to world cuisines, generate recipes that fit your lifestyle.</p>
                    <div className="max-w-4xl mx-auto space-y-8 will-animate">
                        <div className="bg-[--card] p-6 rounded-lg shadow-sm border border-[--border]">
                            <h4 className="font-semibold mb-3">Dietary Needs</h4>
                            <div className="flex flex-wrap justify-center gap-2">
                                {["Vegan", "Gluten-Free", "Keto", "Paleo", "Pescatarian", "Low-Carb"].map(tag => (
                                    <span key={tag} className="px-3 py-1 text-sm bg-[--primary]/10 text-[--primary] rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[--card] p-6 rounded-lg shadow-sm border border-[--border]">
                            <h4 className="font-semibold mb-3">Cuisine Types</h4>
                            <div className="flex flex-wrap justify-center gap-2">
                                {["Italian", "Mexican", "Japanese", "Indian", "Thai", "Mediterranean"].map(tag => (
                                    <span key={tag} className="px-3 py-1 text-sm bg-[--primary]/10 text-[--primary] rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[--card] p-6 rounded-lg shadow-sm border border-[--border]">
                            <h4 className="font-semibold mb-3">Cooking Methods</h4>
                            <div className="flex flex-wrap justify-center gap-2">
                                {["Quick & Easy", "Grill", "Slow-Cook", "Bake", "Air-Fry", "One-Pot"].map(tag => (
                                    <span key={tag} className="px-3 py-1 text-sm bg-[--primary]/10 text-[--primary] rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Testimonials Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                     <h3 className="text-3xl font-bold text-[--foreground] mb-12">Don't just take our word for it</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-[--card] p-8 rounded-xl shadow-md border border-[--border] text-left will-animate">
                            <QuoteIcon className="w-8 h-8 text-[--muted-foreground]/50 mb-4" />
                            <p className="text-[--muted-foreground]">"This has completely changed my weeknight dinners! I use up leftovers and discover amazing new meals. It's a lifesaver."</p>
                            <p className="font-semibold mt-4">- Sarah J.</p>
                        </div>
                        <div className="bg-[--card] p-8 rounded-xl shadow-md border border-[--border] text-left will-animate [animation-delay:200ms]">
                            <QuoteIcon className="w-8 h-8 text-[--muted-foreground]/50 mb-4" />
                            <p className="text-[--muted-foreground]">"As someone with dietary restrictions, finding interesting recipes was always a challenge. RecipeGenius makes it so easy and fun!"</p>
                            <p className="font-semibold mt-4">- Mike R.</p>
                        </div>
                     </div>
                </div>
            </section>
            
            {/* FAQ Section */}
            <section className="py-20 bg-[--muted]/30">
                 <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h3 className="text-3xl font-bold text-[--foreground] mb-4">Frequently Asked Questions</h3>
                         <p className="text-[--muted-foreground] mb-12">Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.</p>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-4 will-animate">
                        {faqItems.map((item, index) => (
                             <div key={index} className="border-b border-[--border]">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex justify-between items-center text-left py-4 text-lg font-semibold text-[--foreground] hover:text-[--primary] transition-colors"
                                    aria-expanded={openFaq === index}
                                >
                                    <span>{item.q}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`faq-answer ${openFaq === index ? 'open' : ''}`}>
                                     <div>
                                        <p className="pt-2 pb-4 text-[--muted-foreground]">{item.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-2xl mx-auto will-animate">
                        <h3 className="text-3xl font-bold text-[--foreground]">Ready to Start Cooking?</h3>
                        <p className="mt-4 text-lg text-[--muted-foreground]">Sign up now and unlock a world of culinary possibilities. Your next favorite recipe is waiting.</p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={() => setModalView('signup')} className="w-full sm:w-auto bg-[--primary] text-[--primary-foreground] font-semibold py-3 px-8 rounded-lg shadow-lg hover:brightness-95 transition-transform transform hover:scale-105">
                                Create Your Free Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer className="container mx-auto px-4 py-6 text-center text-sm text-[--muted-foreground]">
          <p>&copy; {new Date().getFullYear()} RecipeGenius. All rights reserved.</p>
        </footer>
      </div>
      {modalView && (
        <AuthModal
          initialView={modalView}
          onClose={() => setModalView(null)}
          onSignIn={signInWithEmailPassword}
          onSignUp={signUpWithEmailPassword}
        />
      )}
    </>
  );
};