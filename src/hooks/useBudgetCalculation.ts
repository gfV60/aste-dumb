import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Player } from '../types';
import { db } from '../lib/db';

export function useBudgetCalculation() {
  const [activeBidsTotal, setActiveBidsTotal] = useState(0);
  const [roster, setRoster] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch active bids
        const bidsStmt = await db.prepare(`
          SELECT SUM(current_bid) as total_bids
          FROM auctions
          WHERE current_bidder_id = ?
          AND status = 'active'
        `);
        
        const bidsResult = await bidsStmt.get(user.id);
        setActiveBidsTotal(bidsResult?.total_bids || 0);

        // Fetch roster
        const rosterStmt = await db.prepare(`
          SELECT p.*
          FROM players p
          JOIN user_roster ur ON p.id = ur.player_id
          WHERE ur.user_id = ?
          ORDER BY p.position, p.name
        `);

        const rosterResult = await rosterStmt.all(user.id);
        setRoster(rosterResult.map(row => ({
          id: row.id,
          name: row.name,
          team: row.team,
          position: row.position,
          marketValue: row.market_value,
          updatedAt: new Date(row.updated_at)
        })));
      } catch (error) {
        console.error('Failed to fetch budget data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const availableBudget = (user?.budget ?? 0) - activeBidsTotal;

  return {
    totalBudget: user?.budget ?? 0,
    activeBidsTotal,
    availableBudget,
    roster,
    isLoading
  };
}