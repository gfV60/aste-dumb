import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Auction, Player } from '../types';
import { PlayerReleaseSelect } from './PlayerReleaseSelect';
import { updateReleasePromise } from '../lib/auctions';
import { useNotificationStore } from '../store/notificationStore';

interface ReleasePromiseModalProps {
  auction: Auction & { player: Player };
  onClose: () => void;
}

export function ReleasePromiseModal({ auction, onClose }: ReleasePromiseModalProps) {
  const [releasePlayerId, setReleasePlayerId] = useState<string | undefined>(auction.releasePlayerId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateReleasePromise(auction.id, releasePlayerId);
      addNotification('success', 'Release promise updated successfully');
      onClose();
    } catch (error) {
      addNotification('error', error instanceof Error ? error.message : 'Failed to update release promise');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Release Promise
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
              {auction.player.name} ({auction.player.position} - {auction.player.team})
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Current Bid</div>
            <div className="text-lg font-medium text-gray-900">
              ${auction.currentBid}
            </div>
          </div>

          <PlayerReleaseSelect
            position={auction.player.position}
            value={releasePlayerId}
            onChange={setReleasePlayerId}
          />

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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Release Promise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}