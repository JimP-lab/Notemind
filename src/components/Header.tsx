import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Settings, LogOut } from "lucide-react";

interface HeaderProps {
  isPremium: boolean;
  credits: number;
  onUpgrade: () => void;
  onLogin: () => void;
  onLogout: () => void;
  user?: { email: string };
}

export const Header = ({ isPremium, credits, onUpgrade, onLogin, onLogout, user }: HeaderProps) => {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">SolveNote</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Problem Solving</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  {isPremium ? (
                    <Badge className="bg-gradient-primary text-primary-foreground border-0 px-3 py-1">
                      <Crown className="w-4 h-4 mr-2" />
                      Premium
                    </Badge>
                  ) : (
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {credits} credits left
                      </Badge>
                      <p className="text-xs text-muted-foreground">Resets daily</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isPremium && (
                    <Button
                      onClick={onUpgrade}
                      className="bg-gradient-accent hover:opacity-90 border-0"
                      size="sm"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={onLogin} className="bg-gradient-primary hover:opacity-90 border-0">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};