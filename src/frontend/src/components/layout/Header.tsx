import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SAMPLE_PROFILE } from "@/data/sampleData";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  onSignIn: () => void;
}

export function Header({ onSignIn }: HeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const isLoggedIn = !!identity;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />
      <div className="relative flex items-center justify-between px-4 h-full max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/eon-logo-transparent.dim_400x200.png"
            alt="Eon"
            className="h-8 w-auto"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-eon-violet" />
          </button>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={clear}
              className="focus-visible:outline-none"
            >
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-eon-violet/50 hover:ring-eon-violet transition-all">
                <AvatarFallback className="bg-eon-violet/20 text-foreground text-xs font-display">
                  {SAMPLE_PROFILE.avatarInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <Button
              size="sm"
              data-ocid="auth.signin.button"
              onClick={onSignIn}
              className="h-8 px-3 text-xs font-semibold bg-gradient-to-r from-eon-violet to-eon-cyan text-white border-0 hover:opacity-90 transition-opacity"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
