import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, CheckCircle2 } from "lucide-react";

interface AISuggestionsProps {
  suggestions: Array<{
    id: string;
    content: string;
    timestamp: Date;
    type: 'solution' | 'insight' | 'action';
  }>;
  isLoading: boolean;
}

export const AISuggestions = ({ suggestions, isLoading }: AISuggestionsProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'solution':
        return <Brain className="w-4 h-4" />;
      case 'insight':
        return <Lightbulb className="w-4 h-4" />;
      case 'action':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'solution':
        return 'bg-gradient-primary';
      case 'insight':
        return 'bg-gradient-accent';
      case 'action':
        return 'bg-success';
      default:
        return 'bg-gradient-primary';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
            <Brain className="w-5 h-5" />
          </div>
          AI Suggestions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">AI is analyzing your note...</p>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4 max-w-sm">
              <div className="p-4 rounded-full bg-surface mx-auto w-fit">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Ready to help you solve problems</p>
                <p className="text-sm text-muted-foreground">
                  Write your problem or question in the note editor, then click "Get AI Suggestion" to receive intelligent solutions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 h-full overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <Badge className={`${getTypeColor(suggestion.type)} text-white border-0 shrink-0`}>
                    {getIcon(suggestion.type)}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground leading-relaxed">
                      {suggestion.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};