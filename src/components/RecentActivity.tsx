import React, { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'bid' | 'win' | 'lose';
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: Date;
}

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const result = await db.exec({
        sql: `
          SELECT 
            a.id,
            a.player_id,
            p.name as player_name,
            a.current_bid as amount,
            a.started_at as timestamp,
            CASE 
              WHEN a.status = 'active' AND a.current_bidder_id = ? THEN 'bid'
              WHEN a.status = 'completed' AND a.current_bidder_id = ? THEN 'win'
              ELSE 'lose'
            END as type
          FROM auctions a
          JOIN players p ON a.player_id = p.id
          WHERE a.current_bidder_id = ?
          ORDER BY a.started_at DESC
          LIMIT 5
        `,
        args: [userId, userId, userId],
      });

      setActivities(
        result === undefined ? [] : result.rows.map((row) => ({
          id: row.id as string,
          type: row.type as 'bid' | 'win' | 'lose',
          playerId: row.player_id as string,
          playerName: row.player_name as string,
          amount: row.amount as number,
          timestamp: new Date(row.timestamp as string),
        }))
      );
    };

    fetchActivities();
  }, [userId]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Activity className="h-6 w-6 text-gray-400" />
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {activity.playerName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${
                activity.type === 'win'
                  ? 'bg-green-100 text-green-800'
                  : activity.type === 'bid'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              ${activity.amount}
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-center text-gray-500 text-sm">No recent activity</p>
        )}
      </div>
    </div>
  );
}