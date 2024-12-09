import React, { useState } from 'react';
import { Auction, Player } from '../types';
import { format } from 'date-fns';
import { Timer, Calendar, Ban, Flag, UserMinus, Edit2 } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { useAuthStore } from '../store/authStore';
import { invalidateAuction, endAuction } from '../lib/auctions';
import { useNotificationStore } from '../store/notificationStore';
import { ReleasePromiseModal } from './ReleasePromiseModal';

interface AuctionCardProps {
  auction: Auction & { player: Player } & { 
    isCurrentUserTopBidder: boolean;
    releasePlayer?: Player;
  };
  onPlaceBid: () => void;
}

export function AuctionCard({ auction, onPlaceBid }: AuctionCardProps) {
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const timeLeft = useCountdown(new Date(auction.endsAt));
  const exactEndTime = format(new Date(auction.endsAt), 'MMM d, yyyy h:mm a');
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const padNumber = (num: number): string => num.toString().padStart(2, '0');

  const handleInvalidate = async () => {
    try {
      await invalidateAuction(auction.id);
      addNotification('success', 'Auction invalidated successfully');
    } catch (error) {
      addNotification('error', 'Failed to invalidate auction');
      console.error('Failed to invalidate auction:', error);
    }
  };

  const handleEndAuction = async () => {
    try {
      await endAuction(auction.id);
      addNotification('success', 'Auction ended successfully');
    } catch (error) {
      addNotification('error', 'Failed to end auction');
      console.error('Failed to end auction:', error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {auction.player.name}
              </h3>
              <p className="text-sm text-gray-500">
                {auction.player.position} - {auction.player.team}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Bid</div>
              <div className="text-lg font-semibold text-indigo-600">
                ${auction.currentBid}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-gray-500">
                <Timer className="h-4 w-4 mr-2" />
                <span>Time Remaining:</span>
              </div>
              <div className="text-lg font-mono font-medium text-gray-900">
                {padNumber(timeLeft.hours)}:{padNumber(timeLeft.minutes)}:{padNumber(timeLeft.seconds)}
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Ends at {exactEndTime}</span>
            </div>
          </div>

          {user?.isAdmin ? (
            <div className="mt-4 space-y-2">
              <button
                onClick={handleEndAuction}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Flag className="h-4 w-4 mr-2" />
                End Auction
              </button>
              <button
                onClick={handleInvalidate}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Ban className="h-4 w-4 mr-2" />
                Invalidate Auction
              </button>
            </div>
          ) : auction.isCurrentUserTopBidder ? (
            <div className="mt-4 space-y-2">
              <div className="text-center text-sm font-medium text-green-600">
                You're the top bidder
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <UserMinus className="h-4 w-4 mr-2" />
                  {auction.releasePlayer ? (
                    <span>Will release: {auction.releasePlayer.name}</span>
                  ) : (
                    <span>No player selected for release</span>
                  )}
                </div>
                <button
                  onClick={() => setShowReleaseModal(true)}
                  className="ml-2 p-1 text-indigo-600 hover:text-indigo-700 focus:outline-none"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onPlaceBid}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Place Bid
            </button>
          )}
        </div>
      </div>

      {showReleaseModal && (
        <ReleasePromiseModal
          auction={auction}
          onClose={() => setShowReleaseModal(false)}
        />
      )}
    </>
  );
}