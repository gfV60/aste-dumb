export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position;
  marketValue: number;
  updatedAt: Date;
}

export type Position = 'P' | 'D' | 'C' | 'A';

export interface User {
  id: string;
  email: string;
  name: string;
  teamName: string;
  budget: number;
  roster: Player[];
  isAdmin?: boolean;
}

export interface Auction {
  id: string;
  playerId: string;
  currentBid: number;
  currentBidderId: string;
  startedAt: Date;
  endsAt: Date;
  status: 'active' | 'completed' | 'cancelled';
  releasePlayerId?: string;
}