import React from 'react';
import { Position } from '../types';
import { Search } from 'lucide-react';

interface PlayerFiltersProps {
  selectedPositions: Position[];
  onPositionChange: (positions: Position[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ALL_POSITIONS: Position[] = ['P', 'D', 'C', 'A'];

export function PlayerFilters({
  selectedPositions,
  onPositionChange,
  searchQuery,
  onSearchChange,
}: PlayerFiltersProps) {
  const togglePosition = (position: Position) => {
    if (selectedPositions.includes(position)) {
      onPositionChange(selectedPositions.filter((p) => p !== position));
    } else {
      onPositionChange([...selectedPositions, position]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search players or teams..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {ALL_POSITIONS.map((position) => (
          <button
            key={position}
            onClick={() => togglePosition(position)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${
                selectedPositions.includes(position)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {position}
          </button>
        ))}
      </div>
    </div>
  );
}