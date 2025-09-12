import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { NoteEditor } from './NoteEditor';
import { AISuggestions } from './AISuggestions';
import { Button } from './ui/button';
import { Sparkles, BookOpen, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';

interface Suggestion {
  id: string;
  content: string;
  timestamp: Date;
  type: 'solution' | 'insight' | 'action';
}

export const SolveNote = () => {
  const { user, isPremium, signOut, session, loading } = useAuth();
  const { credits, isUnlimited, useCredit, refreshCredits } = useCredits();
  const navigate = useNavigate();
  
  // AI suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle getting AI suggestions
  const handleGetSuggestion = async (noteContent: string) => {
    if (!user) {
      handleLogin();
      return;
    }

    if (credits <= 0 && !isUnlimited) {
      handleUpgrade();
      return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      // Use a credit first (only if not unlimited)
      let creditUsed = true;
      if (!isUnlimited) {
        creditUsed = await useCredit();
        if (!creditUsed) {
          handleUpgrade();
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke('chatgpt-solution', {
        body: { problem: noteContent },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        console.error('Error getting AI suggestions:', error);
        toast({
          title: "Error",
          description: "Failed to get AI suggestions. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);

        toast({
          title: "AI Solutions Generated!",
          description: "Your personalized solutions are ready.",
        });
      }
    } catch (error: any) {
      console.error('Error calling ChatGPT function:', error);
      toast({
        title: "Error",
        description: "Failed to generate solutions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle premium upgrade
  const handleUpgrade = async () => {
    if (!user || !session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade to premium.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Error",
        description: "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle login
  const handleLogin = () => {
    navigate('/auth');
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  // Handle URL parameters for success/cancel from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('canceled') === 'true') {
      toast({
        title: "Payment canceled",
        description: "Your payment was canceled. You can try again anytime.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Refresh credits when returning from successful payment
  useEffect(() => {
    if (user && isPremium) {
      refreshCredits();
      toast({
        title: "Welcome to Premium!",
        description: "You now have unlimited AI solutions. Enjoy!",
      });
    }
  }, [isPremium]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-xl bg-gradient-primary text-primary-foreground shadow-lg inline-block">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-surface">
      <Header 
        isPremium={isPremium}
        credits={isUnlimited ? 999999 : credits}
        onUpgrade={handleUpgrade}
        onLogin={handleLogin}
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        {user && (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
              Hello there! 👋
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              What challenge can I help you solve today? Describe any problem you're facing, and I'll provide personalized solutions.
            </p>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          <NoteEditor
            credits={isUnlimited ? 999999 : credits}
            onGetSuggestion={handleGetSuggestion}
            onUpgrade={handleUpgrade}
            isPremium={isPremium}
          />
          
          <AISuggestions
            suggestions={suggestions}
            isLoading={isLoading}
          />
        </div>
        
        {/* Credit Status for Free Users */}
        {user && !isUnlimited && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-border">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-muted-foreground">
                {credits > 0 
                  ? `${credits} free solutions remaining today • Resets at midnight`
                  : "Free solutions used up • Upgrade for unlimited access"
                }
              </span>
            </div>
          </div>
        )}
        
        {!user && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50">
            <div className="text-center space-y-8 max-w-lg mx-auto p-8">
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Welcome to SolveNote</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Get personalized AI solutions to any problem or challenge you're facing. 
                  Start with 3 free solutions daily.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleLogin}
                  className="w-full px-8 py-4 bg-gradient-primary hover:opacity-90 border-0 shadow-xl font-semibold text-lg"
                  size="lg"
                >
                  Get Started Free
                </Button>
                <p className="text-sm text-muted-foreground">
                  No credit card required • 3 free solutions daily
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};