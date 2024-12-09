import { useState, useEffect } from 'react';
import { Player } from '../types';
import { db } from '../lib/db';
import { useAuthStore } from '../store/authStore';
import { useAuctionStore } from '../store/auctionStore';

interface PlayerWithStatus extends Player {
  assignedTeam?: string;
  activeAuction?: {
    id: string;
    currentBid: number;
    endsAt: Date;
  };
}

export function usePlayerList() {
  const [players, setPlayers] = useState<PlayerWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const { auctions } = useAuctionStore();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const stmt = await db.prepare(`
          SELECT 
            p.*,
            CASE 
              WHEN ? = TRUE THEN u.team_name
              ELSE NULL 
            END as assigned_team
          FROM players p
          LEFT JOIN user_roster ur ON p.id = ur.player_id
          LEFT JOIN users u ON ur.user_id = u.id
          WHERE p.name NOT LIKE '%*'
          ${user?.isAdmin ? '' : 'AND ur.player_id IS NULL'}
          ORDER BY p.position, p.market_value DESC
        `);

        const result = await stmt.all(user?.isAdmin ? 1 : 0);
        const playersWithAuctions = result.map((row) => {
          const activeAuction = auctions.find(a => a.playerId === row.id);
          return {
            id: row.id,
            name: row.name,
            team: row.team,
            position: row.position as Player['position'],
            marketValue: row.market_value,
            updatedAt: new Date(row.updated_at),
            assignedTeam: row.assigned_team,
            activeAuction: activeAuction ? {
              id: activeAuction.id,
              currentBid: activeAuction.currentBid,
              endsAt: activeAuction.endsAt
            } : undefined
          };
        });

        setPlayers(playersWithAuctions);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [user?.isAdmin, auctions]);

  return { players, isLoading };
}