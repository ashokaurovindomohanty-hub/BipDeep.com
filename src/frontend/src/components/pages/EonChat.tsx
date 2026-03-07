import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SAMPLE_CONVERSATIONS } from "@/data/sampleData";
import { cn } from "@/lib/utils";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Conversation = (typeof SAMPLE_CONVERSATIONS)[0];
type Message = (typeof SAMPLE_CONVERSATIONS)[0]["messages"][0];

export function EonChat() {
  const [conversations, setConversations] = useState(SAMPLE_CONVERSATIONS);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState("");

  const handleSelectConversation = (conv: Conversation) => {
    setSelected(conv);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)),
    );
  };

  const handleSend = () => {
    if (!draft.trim() || !selected) return;
    const newMessage: Message = { from: "me", text: draft.trim(), time: "Now" };
    setSelected((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage] } : null,
    );
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, lastMessage: draft.trim(), timestamp: "Now" }
          : c,
      ),
    );
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Conversation list */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col md:relative md:w-80 md:border-r md:border-border/40 transition-transform duration-300 z-10",
          selected ? "-translate-x-full md:translate-x-0" : "translate-x-0",
        )}
      >
        <div className="sticky top-14 bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 py-3">
          <h2 className="font-display font-bold text-base gradient-text">
            EonChat
          </h2>
          <p className="text-xs text-muted-foreground">
            {conversations.length} conversations
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="pb-20">
            {conversations.map((conv, idx) => (
              <motion.button
                key={conv.id}
                data-ocid={`chat.conversation.item.${idx + 1}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => handleSelectConversation(conv)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left border-b border-border/30",
                  selected?.id === conv.id && "bg-muted/40",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 ring-1 ring-border">
                    <AvatarFallback className="bg-eon-violet/20 text-foreground text-sm font-display">
                      {conv.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-eon-violet text-white text-[9px] font-bold flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate">
                      @{conv.user}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {conv.timestamp}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xs truncate",
                      conv.unread > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {conv.lastMessage}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message thread */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col md:relative md:flex-1 transition-transform duration-300 z-20 bg-background",
          selected ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
      >
        {selected ? (
          <>
            {/* Thread header */}
            <div className="sticky top-14 bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 py-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar className="h-9 w-9 ring-1 ring-border">
                <AvatarFallback className="bg-eon-violet/20 text-foreground text-sm font-display">
                  {selected.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">@{selected.user}</p>
                <p className="text-[10px] text-eon-cyan">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-3 pb-4">
                <AnimatePresence>
                  {selected.messages.map((msg, idx) => (
                    <motion.div
                      // biome-ignore lint/suspicious/noArrayIndexKey: message list is append-only
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={cn(
                        "flex",
                        msg.from === "me" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                          msg.from === "me"
                            ? "rounded-br-sm text-white"
                            : "rounded-bl-sm bg-card border border-border/60 text-foreground",
                        )}
                        style={
                          msg.from === "me"
                            ? {
                                background:
                                  "linear-gradient(135deg, oklch(0.52 0.22 288), oklch(0.68 0.16 195 / 0.8))",
                              }
                            : undefined
                        }
                      >
                        {msg.text}
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            msg.from === "me"
                              ? "text-white/60 text-right"
                              : "text-muted-foreground",
                          )}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border/40 bg-background/80 backdrop-blur-sm px-4 py-3 mb-16">
              <div className="flex items-center gap-2">
                <Input
                  data-ocid="chat.message.input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-input border-border/60 focus-visible:ring-eon-violet/50 rounded-full text-sm h-10"
                />
                <Button
                  data-ocid="chat.send.button"
                  size="icon"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-eon-violet to-eon-cyan border-0 hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state — desktop only */
          <div
            data-ocid="chat.empty_state"
            className="hidden md:flex flex-col items-center justify-center h-full text-center px-8"
          >
            <div className="w-16 h-16 rounded-full bg-eon-violet/10 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-eon-violet" />
            </div>
            <p className="font-display font-bold text-base">
              Select a conversation
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Choose from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
