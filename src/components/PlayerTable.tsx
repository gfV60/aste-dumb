import React from 'react';
import { Player } from '../types';
import { ArrowUpRight, Gavel } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

interface PlayerWithStatus extends Player {
  assignedTeam?: string;
  activeAuction?: {
    id: string;
    currentBid: number;
    endsAt: Date;
  };
}

interface PlayerTableProps {
  players: PlayerWithStatus[];
  onStartAuction: (player: Player) => void;
}

export function PlayerTable({ players, onStartAuction }: PlayerTableProps) {
  const { user } = useAuthStore();

  const renderStatus = (player: PlayerWithStatus) => {
    if (user?.isAdmin) {
      if (player.assignedTeam) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {player.assignedTeam}
          </span>
        );
      }
    }

    if (player.activeAuction) {
      return (
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Gavel className="h-3 w-3 mr-1" />
            Current Bid: ${player.activeAuction.currentBid}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Ends: {format(player.activeAuction.endsAt, 'MMM d, h:mm a')}
          </span>
        </div>
      );
    }

    if (!user?.isAdmin) {
      return (
        <button
          onClick={() => onStartAuction(player)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowUpRight className="h-4 w-4 mr-1" />
          Start Auction
        </button>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Available
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {user?.isAdmin ? 'Status' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {player.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {player.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {player.team}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${player.marketValue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {renderStatus(player)}
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No players found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}