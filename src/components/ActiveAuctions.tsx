import React, { useState, useEffect } from 'react';
import { AuctionCard } from './AuctionCard';
import { AuctionModal } from './AuctionModal';
import { Auction, Player } from '../types';
import { Gavel } from 'lucide-react';
import { useAuctionStore } from '../store/auctionStore';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/db';

export function ActiveAuctions() {
  const { auctions, isLoading, fetchAuctions } = useAuctionStore();
  const [selectedAuction, setSelectedAuction] = useState<(Auction & { player: Player }) | null>(null);
  const { user } = useAuthStore();
  const [releasePlayers, setReleasePlayers] = useState<Record<string, Player>>({});

  // Fetch auctions periodically
  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 10000);
    return () => clearInterval(interval);
  }, [fetchAuctions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Gavel className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Active Auctions</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard 
              key={auction.id} 
              auction={{...auction, isCurrentUserTopBidder: user?.id === auction.currentBidderId}}
              onPlaceBid={() => setSelectedAuction(auction)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No active auctions at the moment
        </div>
      )}

      {selectedAuction && (
        <AuctionModal
          player={selectedAuction.player}
          existingAuction={selectedAuction}
          onClose={() => setSelectedAuction(null)}
        />
      )}
    </div>
  );
}