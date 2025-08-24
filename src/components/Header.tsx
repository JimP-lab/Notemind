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
    <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-lg">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">SolveNote</h1>
              <p className="text-sm text-muted-foreground font-medium">AI-Powered Problem Solving</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="flex items-center gap-4">
                  {isPremium ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-primary rounded-full text-primary-foreground shadow-lg">
                      <Crown className="w-4 h-4" />
                      <span className="font-medium text-sm">Premium</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">{credits}</div>
                      <p className="text-xs text-muted-foreground font-medium">credits left</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isPremium && (
                    <Button
                      onClick={onUpgrade}
                      className="bg-gradient-accent hover:opacity-90 border-0 shadow-lg font-semibold"
                      size="sm"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Go Premium
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" className="hover:bg-surface">
                    <Settings className="w-5 h-5" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={onLogout} className="hover:bg-surface">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={onLogin} className="bg-gradient-primary hover:opacity-90 border-0 shadow-lg font-semibold px-6">
                Get Started Free
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};