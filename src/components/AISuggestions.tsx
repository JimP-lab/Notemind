import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        return <Brain className="w-5 h-5" />;
      case 'insight':
        return <Lightbulb className="w-5 h-5" />;
      case 'action':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'solution':
        return 'Solution';
      case 'insight':
        return 'Insight';
      case 'action':
        return 'Action Step';
      default:
        return 'Solution';
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
      <div className="p-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Solutions</h2>
            <p className="text-muted-foreground">Personalized insights for your challenge</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI is analyzing your problem...</h3>
                <p className="text-muted-foreground">This usually takes just a few seconds</p>
              </div>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-6 max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mx-auto flex items-center justify-center">
                <Brain className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Ready to solve your problems</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Describe any challenge you're facing, and our AI will provide personalized solutions, insights, and actionable steps to help you move forward.
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">
                  💡 Tip: Be specific about your situation for better solutions
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 h-full overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`${getTypeColor(suggestion.type)} text-white rounded-xl p-3 shadow-lg shrink-0`}>
                    {getIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                        {getTypeLabel(suggestion.type)}
                      </span>
                      <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed text-base">
                      {suggestion.content}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <p className="text-xs text-muted-foreground">
                        Generated at {new Date(suggestion.timestamp).toLocaleTimeString()}
                      </p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Copy solution
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};