import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Auction, Player } from '../types';
import { startAuction, placeBid } from '../lib/auctions';
import { X, DollarSign } from 'lucide-react';
import { useBudgetCalculation } from '../hooks/useBudgetCalculation';
import { PlayerReleaseSelect } from './PlayerReleaseSelect';
import { ROSTER_REQUIREMENTS } from '../constants/roster';

interface AuctionModalProps {
  player: Player;
  existingAuction?: Auction;
  onClose: () => void;
}

export function AuctionModal({ player, existingAuction, onClose }: AuctionModalProps) {
  const [bidAmount, setBidAmount] = useState(
    existingAuction ? existingAuction.currentBid + 1 : player.marketValue
  );
  const [releasePlayerId, setReleasePlayerId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const { totalBudget, activeBidsTotal, availableBudget, isLoading, roster } = useBudgetCalculation();

  const positionCount = roster.filter(p => p.position === player.position).length;
  const isReleaseRequired = positionCount >= ROSTER_REQUIREMENTS[player.position];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (existingAuction) {
        await placeBid(existingAuction.id, bidAmount, user.id, releasePlayerId);
      } else {
        await startAuction(player.id, bidAmount, user.id, releasePlayerId);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const minBid = existingAuction ? existingAuction.currentBid + 1 : player.marketValue;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {existingAuction ? 'Place Bid' : 'Start Auction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Player</div>
            <div className="text-lg font-medium text-gray-900">
              {player.name} ({player.position} - {player.team})
            </div>
          </div>

          {existingAuction && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Current Bid</div>
              <div className="text-lg font-medium text-gray-900">
                ${existingAuction.currentBid}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Budget</span>
              <span className="font-medium">${totalBudget}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active Bids</span>
              <span className="font-medium text-red-600">-${activeBidsTotal}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-gray-700 font-medium">Available Budget</span>
              <span className="font-medium text-green-600">${availableBudget}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Bid
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min={minBid}
                max={availableBudget}
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <PlayerReleaseSelect
            position={player.position}
            roster={roster}
            value={releasePlayerId}
            onChange={setReleasePlayerId}
            required={isReleaseRequired}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || 
                bidAmount < minBid || 
                bidAmount > availableBudget ||
                (isReleaseRequired && !releasePlayerId)
              }
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : existingAuction ? 'Place Bid' : 'Start Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}