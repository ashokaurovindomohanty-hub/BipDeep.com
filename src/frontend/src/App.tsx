import { BottomNav, type TabType } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { EonChat } from "@/components/pages/EonChat";
import { EonFeed } from "@/components/pages/EonFeed";
import { EonLive } from "@/components/pages/EonLive";
import { EonMarket } from "@/components/pages/EonMarket";
import { EonProfile } from "@/components/pages/EonProfile";
import { AuthModal } from "@/components/shared/AuthModal";
import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const TAB_TITLES: Record<TabType, string> = {
  feed: "EonFeed",
  live: "EonLive",
  chat: "EonChat",
  market: "EonMarket",
  profile: "Profile",
};

function TabContent({ tab }: { tab: TabType }) {
  switch (tab) {
    case "feed":
      return <EonFeed />;
    case "live":
      return <EonLive />;
    case "chat":
      return <EonChat />;
    case "market":
      return <EonMarket />;
    case "profile":
      return <EonProfile />;
    default:
      return <EonFeed />;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header onSignIn={() => setAuthOpen(true)} />

      {/* Main content area */}
      <main
        className="flex-1 pt-14 overflow-hidden"
        style={{ height: "calc(100dvh - 0px)" }}
      >
        {/* Tab label */}
        <div
          className="sr-only"
          aria-live="polite"
          aria-label={`Current section: ${TAB_TITLES[activeTab]}`}
        />

        {/* Page transitions */}
        <div className="h-[calc(100dvh-3.5rem-4rem)] overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto overflow-x-hidden"
              style={{ overscrollBehavior: "contain" }}
            >
              <TabContent tab={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Auth modal */}
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.15 0.015 275)",
            border: "1px solid oklch(0.25 0.02 278)",
            color: "oklch(0.96 0.01 270)",
          },
        }}
      />

      {/* Footer */}
      <div className="hidden" aria-hidden="true">
        <footer>
          <p>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
