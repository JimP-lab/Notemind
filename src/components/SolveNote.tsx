import { useState, useEffect } from "react";
import { Header } from "./Header";
import { NoteEditor } from "./NoteEditor";
import { AISuggestions } from "./AISuggestions";
import { toast } from "@/hooks/use-toast";

// Mock user data - will be replaced with actual authentication
const mockUser = { email: "demo@example.com" };

interface Suggestion {
  id: string;
  content: string;
  timestamp: Date;
  type: 'solution' | 'insight' | 'action';
}

export const SolveNote = () => {
  const [user, setUser] = useState(mockUser);
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(5);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  // Mock AI suggestion generation
  const generateAISuggestion = async (content: string): Promise<Suggestion> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses = [
      {
        type: 'solution' as const,
        content: "Break this problem down into smaller, manageable steps. Start by identifying the core issue, then brainstorm 3-5 potential solutions. Evaluate each based on feasibility and impact."
      },
      {
        type: 'insight' as const,
        content: "Consider approaching this from a different angle. Sometimes stepping back and looking at the bigger picture reveals new opportunities or approaches you might have missed."
      },
      {
        type: 'action' as const,
        content: "Create a timeline with specific milestones. Set a deadline for the first step and begin immediately. Having a concrete plan increases your chances of success by 70%."
      }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      content: response.content,
      timestamp: new Date(),
      type: response.type
    };
  };

  const handleGetSuggestion = async (content: string) => {
    if (!isPremium && credits <= 0) {
      toast({
        title: "No credits remaining",
        description: "Upgrade to Premium for unlimited AI suggestions.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingSuggestion(true);
    
    try {
      const suggestion = await generateAISuggestion(content);
      setSuggestions(prev => [suggestion, ...prev]);
      
      if (!isPremium) {
        setCredits(prev => prev - 1);
      }
      
      toast({
        title: "AI suggestion generated!",
        description: "Check the suggestions panel for your personalized solution.",
      });
    } catch (error) {
      toast({
        title: "Error generating suggestion",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleUpgrade = () => {
    // This will be replaced with actual Stripe integration
    toast({
      title: "Upgrade to Premium",
      description: "Stripe integration will be added when you connect Supabase backend.",
    });
  };

  const handleLogin = () => {
    toast({
      title: "Authentication needed",
      description: "Connect Supabase backend to enable authentication.",
    });
  };

  const handleLogout = () => {
    setUser(undefined);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  // Reset credits daily (mock implementation)
  useEffect(() => {
    const resetCredits = () => {
      if (!isPremium) {
        setCredits(5);
        toast({
          title: "Credits renewed!",
          description: "Your daily credits have been refreshed.",
        });
      }
    };

    // Check every hour for midnight reset (in production, this would be server-side)
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetCredits();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isPremium]);

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header
        user={user}
        isPremium={isPremium}
        credits={credits}
        onUpgrade={handleUpgrade}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <NoteEditor
            credits={credits}
            onGetSuggestion={handleGetSuggestion}
            onUpgrade={handleUpgrade}
            isPremium={isPremium}
          />
          
          <AISuggestions
            suggestions={suggestions}
            isLoading={isLoadingSuggestion}
          />
        </div>
        
        {!user && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <h2 className="text-2xl font-bold text-gradient">Welcome to SolveNote</h2>
              <p className="text-muted-foreground">
                Sign in to start using AI-powered problem solving and note-taking.
              </p>
              <button
                onClick={handleLogin}
                className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg shadow-lg hover:opacity-90 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};