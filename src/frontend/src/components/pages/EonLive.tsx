import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SAMPLE_LIVE_STREAMS } from "@/data/sampleData";
import { Eye, Radio, Zap } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function EonLive() {
  const handleJoin = (streamTitle: string) => {
    toast.success("Joining stream", { description: streamTitle });
  };

  const handleGoLive = () => {
    toast.info("Go Live", {
      description: "Connect your camera to start streaming",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-base gradient-text">
            EonLive
          </h2>
          <p className="text-xs text-muted-foreground">
            {SAMPLE_LIVE_STREAMS.length} streams active
          </p>
        </div>
        <Button
          data-ocid="live.golive.button"
          size="sm"
          onClick={handleGoLive}
          className="h-8 px-3 text-xs font-semibold bg-gradient-to-r from-rose-500 to-rose-600 text-white border-0 hover:opacity-90 transition-opacity gap-1.5"
        >
          <Radio className="h-3 w-3 live-pulse" />
          Go Live
        </Button>
      </div>

      {/* Featured stream - top card */}
      <ScrollArea className="flex-1">
        <div className="p-4 pb-20 space-y-4">
          {/* Featured */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            data-ocid="live.stream.item.1"
            className="relative rounded-2xl overflow-hidden gradient-border"
          >
            <div className="aspect-video w-full bg-muted">
              <img
                src={SAMPLE_LIVE_STREAMS[0].thumbnailUrl}
                alt={SAMPLE_LIVE_STREAMS[0].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* LIVE badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white live-pulse" />
              LIVE
            </div>

            {/* Category */}
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
              {SAMPLE_LIVE_STREAMS[0].category}
            </div>

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-7 w-7 ring-2 ring-white/30">
                      <AvatarFallback className="bg-eon-violet/40 text-white text-xs font-display">
                        {SAMPLE_LIVE_STREAMS[0].hostAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white text-sm font-semibold">
                      {SAMPLE_LIVE_STREAMS[0].host}
                    </span>
                  </div>
                  <p className="text-white font-display font-bold text-base leading-tight">
                    {SAMPLE_LIVE_STREAMS[0].title}
                  </p>
                  <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
                    <Eye className="h-3 w-3" />
                    {formatViewers(SAMPLE_LIVE_STREAMS[0].viewers)} watching
                  </div>
                </div>
                <Button
                  data-ocid="live.join.button.1"
                  size="sm"
                  onClick={() => handleJoin(SAMPLE_LIVE_STREAMS[0].title)}
                  className="shrink-0 bg-white text-black hover:bg-white/90 font-semibold text-xs h-8 px-4"
                >
                  Join
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Grid of remaining streams */}
          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_LIVE_STREAMS.slice(1).map((stream, idx) => (
              <motion.div
                key={stream.id}
                data-ocid={`live.stream.item.${idx + 2}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.35 }}
                className="relative rounded-xl overflow-hidden bg-card border border-border/60 group cursor-pointer"
                onClick={() => handleJoin(stream.title)}
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full bg-muted relative">
                  <img
                    src={stream.thumbnailUrl}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* LIVE badge */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-white live-pulse" />
                    LIVE
                  </div>

                  {/* Viewers */}
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    <Eye className="h-2.5 w-2.5" />
                    {formatViewers(stream.viewers)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-semibold leading-tight line-clamp-2">
                    {stream.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="bg-eon-violet/30 text-foreground text-[8px] font-display">
                        {stream.hostAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[10px] text-muted-foreground">
                      {stream.host}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Creator promo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.52 0.22 288 / 0.15), oklch(0.68 0.16 195 / 0.15))",
              border: "1px solid oklch(0.52 0.22 288 / 0.3)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-eon-violet/30 to-eon-cyan/30">
                <Zap className="h-5 w-5 text-eon-cyan" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-sm">
                  Start Your Own Stream
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Earn 70% ad revenue share while you stream live
                </p>
              </div>
              <Button
                size="sm"
                className="text-xs h-8 bg-gradient-to-r from-eon-violet to-eon-cyan text-white border-0 hover:opacity-90 shrink-0"
                onClick={handleGoLive}
              >
                Start
              </Button>
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}
