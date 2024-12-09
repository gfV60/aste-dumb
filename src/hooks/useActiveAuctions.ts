import { useState, useEffect } from 'react';
import { Auction, Player } from '../types';
import { db } from '../lib/db';

export function useActiveAuctions() {
  const [auctions, setAuctions] = useState<(Auction & { player: Player })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const stmt = await db.prepare(`
          SELECT 
            a.*,
            p.name as player_name,
            p.team as player_team,
            p.position as player_position,
            p.market_value as player_market_value,
            p.updated_at as player_updated_at
          FROM auctions a
          JOIN players p ON a.player_id = p.id
          WHERE a.status = 'active'
          ORDER BY a.ends_at ASC
        `);

        const result = await stmt.all();
        setAuctions(
          result.map((row) => ({
            id: row.id,
            playerId: row.player_id,
            currentBid: row.current_bid,
            currentBidderId: row.current_bidder_id,
            startedAt: new Date(row.started_at),
            endsAt: new Date(row.ends_at),
            status: row.status as Auction['status'],
            player: {
              id: row.player_id,
              name: row.player_name,
              team: row.player_team,
              position: row.player_position as Player['position'],
              marketValue: row.player_market_value,
              updatedAt: new Date(row.player_updated_at),
            },
          }))
        );
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
    const interval = setInterval(fetchAuctions, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return { auctions, isLoading };
}