import { useState, useEffect } from "react";
import { Header } from "./Header";
import { NoteEditor } from "./NoteEditor";
import { AISuggestions } from "./AISuggestions";
import { toast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header
        user={user}
        isPremium={isPremium}
        credits={credits}
        onUpgrade={handleUpgrade}
        onLogin={handleLogin}
        onLogout={handleLogout}
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
        
        {/* Credit Status for Free Users */}
        {user && !isPremium && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
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
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Welcome to SolveNote</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Get personalized AI solutions to any problem or challenge you're facing. 
                  Start with 5 free solutions daily.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full px-8 py-4 bg-gradient-primary text-primary-foreground rounded-xl shadow-xl hover:opacity-90 transition-all font-semibold text-lg"
                >
                  Get Started Free
                </button>
                <p className="text-sm text-muted-foreground">
                  No credit card required • 5 free solutions daily
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};