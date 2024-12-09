import React, { useState } from 'react';
import { usePlayerList } from '../hooks/usePlayerList';
import { PlayerFilters } from './PlayerFilters';
import { PlayerTable } from './PlayerTable';
import { AuctionModal } from './AuctionModal';
import { Player, Position } from '../types';
import { Users, RefreshCw } from 'lucide-react';
import { fetchFantacalcioPlayers } from '../lib/api';

export function PlayerList() {
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiResponse, setApiResponse] = useState<string>('');
  const { players, isLoading } = usePlayerList();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setApiResponse('');
    try {
      const data = await fetchFantacalcioPlayers();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesPosition = selectedPositions.length === 0 || selectedPositions.includes(player.position);
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPosition && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Available Players</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Testing API...' : 'Test API'}
        </button>
      </div>

      {apiResponse && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">API Response:</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
            {apiResponse}
          </pre>
        </div>
      )}

      <PlayerFilters
        selectedPositions={selectedPositions}
        onPositionChange={setSelectedPositions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <PlayerTable
          players={filteredPlayers}
          onStartAuction={setSelectedPlayer}
        />
      )}

      {selectedPlayer && (
        <AuctionModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}