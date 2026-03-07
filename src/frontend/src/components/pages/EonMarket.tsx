import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAMPLE_NFTS } from "@/data/sampleData";
import { cn } from "@/lib/utils";
import { Plus, ShoppingBag, Tag, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type FilterType = "all" | "forsale" | "sold";

export function EonMarket() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredNFTs = SAMPLE_NFTS.filter((nft) => {
    if (filter === "forsale") return !nft.isSold;
    if (filter === "sold") return nft.isSold;
    return true;
  });

  const handleBuy = (nftTitle: string) => {
    toast.success("Purchase initiated", {
      description: `Buying "${nftTitle}"`,
    });
  };

  const handleListNFT = () => {
    toast.info("List NFT", {
      description: "Upload your NFT to the marketplace",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display font-bold text-base gradient-text">
              EonMarket
            </h2>
            <p className="text-xs text-muted-foreground">NFT Marketplace</p>
          </div>
          <Button
            data-ocid="market.list.button"
            size="sm"
            onClick={handleListNFT}
            className="h-8 px-3 text-xs font-semibold bg-gradient-to-r from-eon-violet to-eon-cyan text-white border-0 hover:opacity-90 gap-1.5"
          >
            <Plus className="h-3 w-3" />
            List NFT
          </Button>
        </div>

        {/* Filter tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList className="h-8 bg-muted/50 p-0.5 w-full">
            <TabsTrigger
              value="all"
              data-ocid="market.filter.tab"
              className="flex-1 text-xs h-7 data-[state=active]:bg-card"
            >
              All ({SAMPLE_NFTS.length})
            </TabsTrigger>
            <TabsTrigger
              value="forsale"
              data-ocid="market.filter.tab"
              className="flex-1 text-xs h-7 data-[state=active]:bg-card"
            >
              For Sale ({SAMPLE_NFTS.filter((n) => !n.isSold).length})
            </TabsTrigger>
            <TabsTrigger
              value="sold"
              data-ocid="market.filter.tab"
              className="flex-1 text-xs h-7 data-[state=active]:bg-card"
            >
              Sold ({SAMPLE_NFTS.filter((n) => n.isSold).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-3 flex gap-4 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-eon-violet" />
          <span className="text-xs text-muted-foreground">
            Floor:{" "}
            <span className="text-foreground font-semibold">1,800 EON</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-eon-cyan" />
          <span className="text-xs text-muted-foreground">
            Vol:{" "}
            <span className="text-foreground font-semibold">52.4K EON</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs text-muted-foreground">
            Listed:{" "}
            <span className="text-foreground font-semibold">
              {SAMPLE_NFTS.filter((n) => !n.isSold).length}
            </span>
          </span>
        </div>
      </div>

      {/* NFT Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-3 p-4 pb-20">
          {filteredNFTs.map((nft, idx) => (
            <motion.article
              key={nft.id}
              data-ocid={`market.nft.item.${idx + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.07 }}
              className={cn(
                "relative rounded-xl overflow-hidden bg-card border transition-all duration-200 group",
                nft.isSold
                  ? "border-border/30 opacity-75"
                  : "border-border/60 hover:border-eon-violet/40",
              )}
            >
              {/* Image */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={nft.imageUrl}
                  alt={nft.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Sold overlay */}
                {nft.isSold && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div
                      className="px-3 py-1 rounded-full text-white text-xs font-bold tracking-widest"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.52 0.22 288 / 0.8), oklch(0.68 0.16 195 / 0.8))",
                        border: "1px solid white/20",
                      }}
                    >
                      SOLD
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-semibold font-display truncate">
                  {nft.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  by @{nft.creator}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Price</p>
                    <p className="text-xs font-bold gradient-text">
                      {Number(nft.price).toLocaleString()} EON
                    </p>
                  </div>

                  {!nft.isSold && (
                    <Button
                      data-ocid={`market.buy.button.${idx + 1}`}
                      size="sm"
                      onClick={() => handleBuy(nft.title)}
                      className="h-7 px-2.5 text-[10px] font-semibold bg-gradient-to-r from-eon-violet to-eon-cyan text-white border-0 hover:opacity-90"
                    >
                      Buy
                    </Button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}

          {filteredNFTs.length === 0 && (
            <div
              data-ocid="market.empty_state"
              className="col-span-2 flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No NFTs in this category
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
