import { create } from 'zustand';
import { Auction, Player } from '../types';
import { db } from '../lib/db';

interface AuctionState {
  auctions: (Auction & { player: Player })[];
  isLoading: boolean;
  fetchAuctions: () => Promise<void>;
  addOrUpdateAuction: (auction: Auction & { player: Player }) => void;
  removeAuction: (auctionId: string) => void;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  auctions: [],
  isLoading: true,
  fetchAuctions: async () => {
    try {
      const stmt = await db.prepare(`
        SELECT 
          a.*,
          p.name as player_name,
          p.team as player_team,
          p.position as player_position,
          p.market_value as player_market_value,
          p.updated_at as player_updated_at,
          rp.name as release_player_name,
          rp.team as release_player_team,
          rp.position as release_player_position,
          rp.market_value as release_player_market_value,
          rp.updated_at as release_player_updated_at
        FROM auctions a
        JOIN players p ON a.player_id = p.id
        LEFT JOIN players rp ON a.release_player_id = rp.id
        WHERE a.status = 'active'
        ORDER BY a.ends_at ASC
      `);

      const result = await stmt.all();
      const auctions = result.map((row) => ({
        id: row.id,
        playerId: row.player_id,
        currentBid: row.current_bid,
        currentBidderId: row.current_bidder_id,
        startedAt: new Date(row.started_at),
        endsAt: new Date(row.ends_at),
        status: row.status as Auction['status'],
        releasePlayerId: row.release_player_id,
        player: {
          id: row.player_id,
          name: row.player_name,
          team: row.player_team,
          position: row.player_position as Player['position'],
          marketValue: row.player_market_value,
          updatedAt: new Date(row.player_updated_at),
        },
        releasePlayer: row.release_player_id ? {
          id: row.release_player_id,
          name: row.release_player_name,
          team: row.release_player_team,
          position: row.release_player_position as Player['position'],
          marketValue: row.release_player_market_value,
          updatedAt: new Date(row.release_player_updated_at),
        } : undefined
      }));

      set({ auctions, isLoading: false });
      console.log()
    } catch (error) {
      console.error('Failed to fetch auctions:', error.message);
      set({ isLoading: false });
    }
  },
  addOrUpdateAuction: (auction) => {
    set((state) => ({
      auctions: [
        ...state.auctions.filter((a) => a.id !== auction.id),
        auction,
      ].sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime()),
    }));
  },
  removeAuction: (auctionId) => {
    set((state) => ({
      auctions: state.auctions.filter((a) => a.id !== auctionId),
    }));
  },
}));