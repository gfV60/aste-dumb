import { useState, useEffect } from 'react';
import { Player, Position } from '../types';
import { db } from '../lib/db';

export function usePlayerReleaseOptions(userId: string, position: Position) {
  const [eligiblePlayers, setEligiblePlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEligiblePlayers = async () => {
      try {
        // Get players from user's roster of the specified position
        // excluding those already promised in other active auctions
        const stmt = await db.prepare(`
          SELECT p.*
          FROM players p
          JOIN user_roster ur ON p.id = ur.player_id
          WHERE ur.user_id = ?
          AND p.position = ?
          AND p.id NOT IN (
            SELECT release_player_id
            FROM auctions
            WHERE current_bidder_id = ?
            AND status = 'active'
            AND release_player_id IS NOT NULL
          )
          ORDER BY p.name
        `);

        const result = await stmt.all(userId, position, userId);
        
        setEligiblePlayers(result.map(row => ({
          id: row.id,
          name: row.name,
          team: row.team,
          position: row.position as Position,
          marketValue: row.market_value,
          updatedAt: new Date(row.updated_at)
        })));
      } catch (error) {
        console.error('Failed to fetch eligible players for release:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEligiblePlayers();
  }, [userId, position]);

  return { eligiblePlayers, isLoading };
}