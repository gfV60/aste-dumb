import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { TeamRoster } from './TeamRoster';
import { BudgetStatus } from './BudgetStatus';
import { RecentActivity } from './RecentActivity';
import { RosterStats } from './RosterStats';
import { Trophy, DollarSign } from 'lucide-react';
import { Player } from '../types';
import { db } from '../lib/db';

export function Dashboard() {
  const { user } = useAuthStore();
  const [roster, setRoster] = useState<Player[]>([]);

  useEffect(() => {
    const fetchRoster = async () => {
      if (!user) return;

      try {
        const stmt = await db.prepare(`
          SELECT p.*
          FROM players p
          JOIN user_roster ur ON p.id = ur.player_id
          WHERE ur.user_id = ?
          ORDER BY p.position, p.name
        `);

        const result = await stmt.all(user.id);
        setRoster(
          result.map((row) => ({
            id: row.id,
            name: row.name,
            team: row.team,
            position: row.position as Player['position'],
            marketValue: row.market_value,
            updatedAt: new Date(row.updated_at),
          }))
        );
      } catch (error) {
        console.error('Failed to fetch roster:', error);
      }
    };

    fetchRoster();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team Name</h3>
              <p className="text-xl font-bold text-indigo-600">{user.teamName}</p>
            </div>
          </div>
        </div>

        <RosterStats roster={roster} />
        <BudgetStatus budget={user.budget} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamRoster roster={roster} />
        </div>
        <div className="space-y-6">
          <RecentActivity userId={user.id} />
        </div>
      </div>
    </div>
  );
}