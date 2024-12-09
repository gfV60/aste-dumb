import React from 'react';
import { Users } from 'lucide-react';
import { Player, Position } from '../types';
import { ROSTER_REQUIREMENTS } from '../constants/roster';

interface RosterStatsProps {
  roster: Player[];
}

export function RosterStats({ roster }: RosterStatsProps) {
  const positionCounts = roster.reduce((acc, player) => {
    acc[player.position] = (acc[player.position] || 0) + 1;
    return acc;
  }, {} as Record<Position, number>);

  const getPositionColor = (position: Position) => {
    const count = positionCounts[position] || 0;
    const required = ROSTER_REQUIREMENTS[position];
    if (count === required) return 'text-green-600';
    if (count < required) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">

      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Roster Size</h2>
        <Users className="h-6 w-6 text-gray-400" />
      </div>


      <div className="mt-2 space-y-1">
        {(Object.keys(ROSTER_REQUIREMENTS) as Position[]).map((position) => (
          <div key={position} className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">{position}:</span>
              <span className={`text-sm font-bold ${getPositionColor(position)}`}>
                {positionCounts[position] || 0}/{ROSTER_REQUIREMENTS[position]}
              </span>
            </div>
          </div>
        ))}

        <div className="mt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Total:</span>
            <span className={`text-sm font-bold text-blue-600`}>
              {roster.length}/{Object.values(ROSTER_REQUIREMENTS).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}