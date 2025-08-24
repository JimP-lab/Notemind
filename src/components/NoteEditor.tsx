import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Zap, CreditCard, Crown } from "lucide-react";

interface NoteEditorProps {
  credits: number;
  onGetSuggestion: (content: string) => void;
  onUpgrade: () => void;
  isPremium: boolean;
}

export const NoteEditor = ({ credits, onGetSuggestion, onUpgrade, isPremium }: NoteEditorProps) => {
  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetSuggestion = async () => {
    if (!noteContent.trim()) return;
    
    setIsLoading(true);
    try {
      await onGetSuggestion(noteContent);
    } finally {
      setIsLoading(false);
    }
  };

  const canUseSuggestion = isPremium || credits > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">What's on your mind?</h2>
            <p className="text-muted-foreground">Describe any problem or challenge you're facing</p>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-primary rounded-full text-primary-foreground text-sm font-medium">
              <Crown className="w-4 h-4" />
              Premium
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="relative">
            <Textarea
              placeholder="Example: I'm struggling to manage my time effectively while working from home. I get distracted easily and can't seem to focus on important tasks..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[240px] resize-none text-base leading-relaxed p-6 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
              {noteContent.length} characters
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={handleGetSuggestion}
              disabled={!canUseSuggestion || !noteContent.trim() || isLoading}
              className="w-full bg-gradient-primary hover:opacity-90 border-0 shadow-lg py-4 text-lg font-semibold rounded-xl"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  AI is thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3" />
                  Get AI Solution
                </>
              )}
            </Button>
            
            {!canUseSuggestion && (
              <div className="text-center py-8 px-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  You've used all your free solutions today
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Upgrade to Premium to get unlimited AI solutions and solve any problem, anytime.
                </p>
                <Button
                  onClick={onUpgrade}
                  className="bg-gradient-accent hover:opacity-90 border-0 shadow-lg font-semibold px-8 py-3 rounded-xl"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Premium - $10/month
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};