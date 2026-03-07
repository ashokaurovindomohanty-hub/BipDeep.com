import { cn } from "@/lib/utils";
import { Home, MessageCircle, Radio, ShoppingBag, User } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { motion } from "motion/react";

export type TabType = "feed" | "live" | "chat" | "market" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: {
  id: TabType;
  icon: React.FC<LucideProps>;
  label: string;
  ocid: string;
}[] = [
  { id: "feed", icon: Home, label: "Feed", ocid: "nav.feed.tab" },
  { id: "live", icon: Radio, label: "Live", ocid: "nav.live.tab" },
  { id: "chat", icon: MessageCircle, label: "Chat", ocid: "nav.chat.tab" },
  { id: "market", icon: ShoppingBag, label: "Market", ocid: "nav.market.tab" },
  { id: "profile", icon: User, label: "Profile", ocid: "nav.profile.tab" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Fade gradient behind nav */}
      <div className="absolute inset-0 bottom-nav-gradient pointer-events-none" />
      <div className="relative flex items-center justify-around bg-background/80 backdrop-blur-xl border-t border-border/50 h-16 px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              data-ocid={tab.ocid}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 flex-1 h-full justify-center group focus-visible:outline-none"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-xl mx-1"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.22 288 / 0.15), oklch(0.68 0.16 195 / 0.15))",
                  }}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                />
              )}

              <Icon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />

              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-200",
                  isActive
                    ? "gradient-text"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
