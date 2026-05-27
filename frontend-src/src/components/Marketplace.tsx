import { useEffect, useState } from "react";
import { backend } from "../declarations/backend";

interface NFT {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: bigint;
  isSold: boolean;
}

export default function Marketplace() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    try {
      const data = await backend.listAllNFTListings();
      setNfts(data);
    } catch (error) {
      console.error("Failed to load NFTs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function buyNFT(id: string) {
    try {
      await backend.buyNFTListing(id);

      alert("NFT purchased successfully!");

      loadNFTs();
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Failed to purchase NFT");
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-white">
        Loading marketplace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">
        NFT Marketplace
      </h1>

      {nfts.length === 0 ? (
        <p className="text-center text-gray-400">
          No NFTs available
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800"
            >
              <img
                src={nft.imageUrl}
                alt={nft.title}
                className="w-full h-64 object-cover"
              />

              <div className="p-4">
                <h2 className="text-2xl font-semibold mb-2">
                  {nft.title}
                </h2>

                <p className="text-gray-400 mb-4">
                  {nft.description}
                </p>

                <p className="text-lg font-bold mb-4">
                  Price: {nft.price.toString()} ICP
                </p>

                {nft.isSold ? (
                  <button
                    disabled
                    className="w-full bg-gray-700 text-gray-300 py-2 rounded-xl cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : (
                  <button
                    onClick={() => buyNFT(nft.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded-xl font-semibold"
                  >
                    Buy NFT
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
