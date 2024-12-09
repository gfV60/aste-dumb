import React from 'react';
import { Position } from '../types';
import { usePlayerReleaseOptions } from '../hooks/usePlayerReleaseOptions';
import { useAuthStore } from '../store/authStore';

interface PlayerReleaseSelectProps {
  position: Position;
  value: string | undefined;
  onChange: (playerId: string | undefined) => void;
  required?: boolean;
}

export function PlayerReleaseSelect({ 
  position, 
  value, 
  onChange,
  required 
}: PlayerReleaseSelectProps) {
  const { user } = useAuthStore();
  const { eligiblePlayers, isLoading } = usePlayerReleaseOptions(user?.id || '', position);

  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded mt-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mt-1"></div>
        </div>
      </div>
    );
  }

  if (eligiblePlayers.length === 0) {
    if (required) {
      return (
        <div className="mt-4">
          <p className="text-sm text-red-600">
            No eligible players available for release. All players in this position are either already promised for release in other auctions or not in your roster.
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">
        {required ? 'Select player to release (required)' : 'Select player to release (optional)'}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        required={required}
      >
        <option value="">Select a player...</option>
        {eligiblePlayers.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name} ({player.team})
          </option>
        ))}
      </select>
      <p className="mt-1 text-sm text-gray-500">
        {required 
          ? 'Your roster is full for this position. You must select a player to release.'
          : 'Optionally select a player to release if you win this auction.'}
      </p>
    </div>
  );
}