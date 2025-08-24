import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Zap, CreditCard } from "lucide-react";

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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Your Note</CardTitle>
          <div className="flex items-center gap-3">
            {isPremium ? (
              <Badge className="bg-gradient-primary text-primary-foreground border-0">
                <Zap className="w-3 h-3 mr-1" />
                Unlimited
              </Badge>
            ) : (
              <Badge variant="outline" className="text-sm">
                {credits} credits left
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        <Textarea
          placeholder="Describe your problem or question here... The AI will suggest solutions to help you solve it."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="flex-1 min-h-[200px] resize-none text-base"
        />
        
        <div className="flex gap-3">
          <Button
            onClick={handleGetSuggestion}
            disabled={!canUseSuggestion || !noteContent.trim() || isLoading}
            className="flex-1 bg-gradient-primary hover:opacity-90 border-0 shadow-lg"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? "Getting AI Suggestion..." : "Get AI Suggestion"}
          </Button>
          
          {!isPremium && credits === 0 && (
            <Button
              onClick={onUpgrade}
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          )}
        </div>
        
        {!canUseSuggestion && (
          <div className="text-center py-4 px-6 bg-surface rounded-lg border">
            <p className="text-muted-foreground mb-3">
              You've used all your free suggestions for today
            </p>
            <Button
              onClick={onUpgrade}
              className="bg-gradient-accent hover:opacity-90 border-0"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Upgrade to Premium for $10/month
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};