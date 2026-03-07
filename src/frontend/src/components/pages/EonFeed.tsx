import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SAMPLE_POSTS, TRENDING_TAGS } from "@/data/sampleData";
import { cn } from "@/lib/utils";
import {
  Clock,
  Heart,
  MessageCircle,
  Play,
  Share2,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function formatDuration(seconds: bigint): string {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function EonFeed() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [activeTag, setActiveTag] = useState("All");

  const allTags = ["All", ...TRENDING_TAGS];

  const filteredPosts =
    activeTag === "All"
      ? posts
      : posts.filter((p) =>
          p.tags.some((t) =>
            t.toLowerCase().includes(activeTag.replace("#", "").toLowerCase()),
          ),
        );

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );
  };

  const handleShare = (title: string) => {
    toast.success(`Shared "${title}"`, {
      description: "Link copied to clipboard",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tags filter bar */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={cn(
                "flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                activeTag === tag
                  ? "gradient-text bg-gradient-to-r from-eon-violet/20 to-eon-cyan/20 border border-eon-violet/40"
                  : "text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-transparent",
              )}
              data-ocid={"feed.filter.tab"}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Differentiator badge */}
        <div className="flex items-center gap-1.5 mt-2">
          <Badge
            variant="outline"
            className="text-[10px] border-eon-cyan/40 text-eon-cyan bg-eon-cyan/10 gap-1"
          >
            <Clock className="h-2.5 w-2.5" />
            Up to 10-min videos
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] border-eon-violet/40 text-eon-violet bg-eon-violet/10 gap-1"
          >
            <Shield className="h-2.5 w-2.5" />
            AI Moderated
          </Badge>
        </div>
      </div>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div className="pb-20">
          {filteredPosts.map((post, idx) => (
            <motion.article
              key={post.id}
              data-ocid={`feed.post.item.${idx + 1}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.4 }}
              className="border-b border-border/40"
            >
              {/* Thumbnail */}
              <div className="relative">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDuration(post.duration)}
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 py-3">
                {/* Author row */}
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8 ring-1 ring-border">
                    <AvatarFallback className="bg-eon-violet/20 text-foreground text-xs font-display">
                      {post.authorAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      @{post.author}
                    </p>
                  </div>
                  {/* AI Moderated badge */}
                  <Badge
                    variant="outline"
                    className="text-[10px] shrink-0 border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1"
                  >
                    <Shield className="h-2.5 w-2.5" />
                    Safe
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="font-semibold font-display text-sm leading-snug mb-1.5">
                  {post.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[11px] text-eon-cyan">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    data-ocid={`feed.like.button.${idx + 1}`}
                    onClick={() => handleLike(post.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm transition-colors",
                      post.isLiked
                        ? "text-rose-400"
                        : "text-muted-foreground hover:text-rose-400",
                    )}
                    aria-label={post.isLiked ? "Unlike" : "Like"}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition-all",
                        post.isLiked ? "fill-rose-400 scale-110" : "",
                      )}
                    />
                    <span>{formatCount(post.likes)}</span>
                  </button>

                  <button
                    type="button"
                    data-ocid={`feed.comment.button.${idx + 1}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Comments"
                    onClick={() =>
                      toast.info(`${post.comments} comments`, {
                        description: post.title,
                      })
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatCount(post.comments)}</span>
                  </button>

                  <button
                    type="button"
                    data-ocid={`feed.share.button.${idx + 1}`}
                    onClick={() => handleShare(post.title)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
                    aria-label="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}

          {filteredPosts.length === 0 && (
            <div
              data-ocid="feed.empty_state"
              className="flex flex-col items-center justify-center py-20 text-center px-8"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No videos found for this tag
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
