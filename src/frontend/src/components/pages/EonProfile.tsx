import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SAMPLE_CREATOR_EARNINGS,
  SAMPLE_NFTS,
  SAMPLE_POSTS,
  SAMPLE_PROFILE,
} from "@/data/sampleData";
import {
  DollarSign,
  Edit2,
  Gem,
  Grid3X3,
  Heart,
  type LucideProps,
  Play,
  Tag,
  TrendingUp,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const EARNING_ICONS: Record<string, React.FC<LucideProps>> = {
  "trending-up": TrendingUp,
  tag: Tag,
  heart: Heart,
};

const EARNING_COLORS: Record<string, string> = {
  "eon-cyan": "oklch(0.68 0.16 195)",
  "eon-violet": "oklch(0.52 0.22 288)",
  "chart-3": "oklch(0.72 0.15 150)",
};

export function EonProfile() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    toast.success(
      isFollowing ? "Unfollowed" : `Following @${SAMPLE_PROFILE.username}`,
    );
  };

  const handleEditProfile = () => {
    toast.info("Edit Profile", { description: "Profile editing coming soon" });
  };

  return (
    <ScrollArea className="h-full">
      <div className="pb-20">
        {/* Cover + Avatar */}
        <div className="relative">
          {/* Cover gradient */}
          <div
            className="h-36 w-full"
            style={{ background: SAMPLE_PROFILE.coverGradient }}
          >
            <div className="absolute inset-0 bg-[url('/assets/generated/feed-thumb-1.dim_640x360.jpg')] bg-cover bg-center opacity-20" />
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-10 left-4">
            <Avatar className="h-20 w-20 ring-4 ring-background">
              <AvatarFallback className="bg-gradient-to-br from-eon-violet/40 to-eon-cyan/40 text-foreground text-2xl font-display font-bold">
                {SAMPLE_PROFILE.avatarInitials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Action buttons */}
          <div className="absolute -bottom-4 right-4 flex gap-2">
            <Button
              data-ocid="profile.edit.button"
              size="sm"
              variant="outline"
              onClick={handleEditProfile}
              className="h-8 px-3 text-xs font-semibold border-border/60 gap-1.5"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
            <Button
              data-ocid="profile.follow.button"
              size="sm"
              onClick={handleFollow}
              className={`h-8 px-3 text-xs font-semibold gap-1.5 border-0 ${
                isFollowing
                  ? "bg-muted text-foreground hover:bg-destructive/20 hover:text-destructive"
                  : "bg-gradient-to-r from-eon-violet to-eon-cyan text-white hover:opacity-90"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-3 w-3" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3" />
                  Follow
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Profile info */}
        <div className="px-4 pt-14 pb-4">
          <h2 className="font-display font-bold text-xl">
            @{SAMPLE_PROFILE.username}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {SAMPLE_PROFILE.bio}
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            {[
              { label: "Posts", value: SAMPLE_PROFILE.totalPosts },
              { label: "Followers", value: SAMPLE_PROFILE.followers },
              { label: "Following", value: SAMPLE_PROFILE.following },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-bold text-lg gradient-text">
                  {formatCount(stat.value)}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Earnings Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-4 mb-4 rounded-2xl p-4 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.52 0.22 288 / 0.12), oklch(0.68 0.16 195 / 0.12))",
            border: "1px solid oklch(0.52 0.22 288 / 0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-eon-cyan" />
            <span className="text-sm font-semibold font-display">
              Creator Earnings
            </span>
          </div>

          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-display font-bold gradient-text">
              $
              {SAMPLE_CREATOR_EARNINGS.total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-muted-foreground">total earned</span>
          </div>

          <div className="space-y-2">
            {SAMPLE_CREATOR_EARNINGS.breakdown.map((item) => {
              const Icon = EARNING_ICONS[item.icon];
              const color = EARNING_COLORS[item.color];
              const pct = (item.amount / SAMPLE_CREATOR_EARNINGS.total) * 100;
              return (
                <div key={item.source} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3 w-3" color={color} />
                      <span className="text-xs text-muted-foreground">
                        {item.source}
                      </span>
                    </div>
                    <span className="text-xs font-semibold">
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        delay: 0.4,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Content tabs */}
        <div className="px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full h-9 bg-muted/50 p-0.5 mb-4">
              <TabsTrigger
                value="videos"
                className="flex-1 text-xs gap-1.5 h-8 data-[state=active]:bg-card"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                Videos
              </TabsTrigger>
              <TabsTrigger
                value="nfts"
                className="flex-1 text-xs gap-1.5 h-8 data-[state=active]:bg-card"
              >
                <Gem className="h-3.5 w-3.5" />
                NFTs
              </TabsTrigger>
            </TabsList>

            {/* My Videos */}
            <TabsContent value="videos" className="mt-0">
              <div className="grid grid-cols-3 gap-1">
                {SAMPLE_POSTS.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="aspect-square relative rounded-md overflow-hidden bg-muted group cursor-pointer"
                  >
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 fill-white transition-opacity" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded font-mono">
                      {Math.floor(Number(post.duration) / 60)}:
                      {(Number(post.duration) % 60).toString().padStart(2, "0")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* My NFTs */}
            <TabsContent value="nfts" className="mt-0">
              <div className="grid grid-cols-2 gap-3">
                {SAMPLE_NFTS.slice(0, 4).map((nft, idx) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.06 }}
                    className="rounded-xl overflow-hidden bg-card border border-border/60"
                  >
                    <div className="aspect-square">
                      <img
                        src={nft.imageUrl}
                        alt={nft.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold font-display truncate">
                        {nft.title}
                      </p>
                      <p className="text-[10px] gradient-text font-bold mt-0.5">
                        {Number(nft.price).toLocaleString()} EON
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
}
