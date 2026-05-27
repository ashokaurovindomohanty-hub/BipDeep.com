import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useInternetIdentity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="auth.dialog"
        className="max-w-sm border-border bg-popover p-0 overflow-hidden"
      >
        {/* Gradient top bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.52 0.22 288), oklch(0.68 0.16 195))",
          }}
        />

        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/generated/eon-logo-transparent.dim_400x200.png"
                alt="Eon"
                className="h-10 w-auto"
              />
            </div>
            <DialogTitle className="text-center text-xl font-display font-bold">
              {mode === "login" ? "Welcome back" : "Join Eon"}
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Sign in to continue creating"
                : "Start echoing your original narrative"}
            </p>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex bg-muted/50 rounded-lg p-0.5 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all duration-200 ${
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    data-ocid="auth.username.input"
                    type="text"
                    placeholder="@your_handle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1.5 bg-input border-border focus-visible:ring-eon-violet/50"
                    autoComplete="username"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                data-ocid="auth.email.input"
                type="email"
                placeholder="creator@eon.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 bg-input border-border focus-visible:ring-eon-violet/50"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                data-ocid="auth.password.input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 bg-input border-border focus-visible:ring-eon-violet/50"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>

            <Button
              type="submit"
              data-ocid={
                mode === "login"
                  ? "auth.login.submit_button"
                  : "auth.signup.submit_button"
              }
              disabled={isLoggingIn}
              className="w-full h-10 font-semibold bg-gradient-to-r from-eon-violet to-eon-cyan text-white border-0 hover:opacity-90 transition-opacity mt-2"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-eon-cyan hover:underline font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
