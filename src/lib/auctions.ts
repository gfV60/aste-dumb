import { db } from './db/index';
import { addHours } from 'date-fns';
import { useAuctionStore } from '../store/auctionStore';
import { ROSTER_REQUIREMENTS } from '../constants/roster';
import { Position } from '../types';

export async function startAuction(
  playerId: string, 
  bidAmount: number, 
  userId: string,
  releasePlayerId?: string
) {
  const now = new Date();
  const endsAt = addHours(now, 24);

  // Check if player is already in an active auction
  const activeAuctionStmt = await db.prepare('SELECT id FROM auctions WHERE player_id = ? AND status = ?');
  const activeAuction = await activeAuctionStmt.get(playerId, 'active');

  if (activeAuction) {
    throw new Error('This player is already in an active auction');
  }

  // Check if player is already on a team's roster
  const rosterStmt = await db.prepare(`
    SELECT u.team_name 
    FROM user_roster ur
    JOIN users u ON ur.user_id = u.id
    WHERE ur.player_id = ?
  `);
  const existingRoster = await rosterStmt.get(playerId);

  if (existingRoster) {
    throw new Error(`This player is already on team "${existingRoster.team_name}"`);
  }

  // Get player position
  const playerStmt = await db.prepare('SELECT position FROM players WHERE id = ?');
  const player = await playerStmt.get(playerId);
  const position = player.position as Position;

  // Check roster size for this position
  const rosterCountStmt = await db.prepare(`
    SELECT COUNT(*) as count
    FROM user_roster ur
    JOIN players p ON ur.player_id = p.id
    WHERE ur.user_id = ? AND p.position = ?
  `);
  const rosterCount = await rosterCountStmt.get(userId, position);

  if (rosterCount.count >= ROSTER_REQUIREMENTS[position] && !releasePlayerId) {
    throw new Error(`You must select a ${position} player to release as your roster is full for this position`);
  }

  // If release player is specified, verify it exists in user's roster and has correct position
  if (releasePlayerId) {
    const releasePlayerStmt = await db.prepare(`
      SELECT p.position 
      FROM user_roster ur
      JOIN players p ON ur.player_id = p.id
      WHERE ur.user_id = ? AND ur.player_id = ?
    `);
    const releasePlayer = await releasePlayerStmt.get(userId, releasePlayerId);
    
    if (!releasePlayer) {
      throw new Error('Selected player to release is not in your roster');
    }
    if (releasePlayer.position !== position) {
      throw new Error('Selected player to release must be of the same position');
    }
  }

  // Check user's budget
  const userStmt = await db.prepare('SELECT budget FROM users WHERE id = ?');
  const user = await userStmt.get(userId);

  const budget = user?.budget;
  if (!budget || budget < bidAmount) {
    throw new Error('Bid amount exceeds your available budget');
  }

  // Start the auction
  const auctionId = crypto.randomUUID();
  const insertStmt = await db.prepare(`
    INSERT INTO auctions (
      id,
      player_id,
      current_bid,
      current_bidder_id,
      started_at,
      ends_at,
      status,
      release_player_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  await insertStmt.run(
    auctionId,
    playerId,
    bidAmount,
    userId,
    now.toISOString(),
    endsAt.toISOString(),
    'active',
    releasePlayerId || null
  );

  // Fetch the complete auction data including player details
  const stmt = await db.prepare(`
    SELECT 
      a.*,
      p.name as player_name,
      p.team as player_team,
      p.position as player_position,
      p.market_value as player_market_value,
      p.updated_at as player_updated_at
    FROM auctions a
    JOIN players p ON a.player_id = p.id
    WHERE a.id = ?
  `);

  const result = await stmt.get(auctionId);
  const newAuction = {
    id: result.id,
    playerId: result.player_id,
    currentBid: result.current_bid,
    currentBidderId: result.current_bidder_id,
    startedAt: new Date(result.started_at),
    endsAt: new Date(result.ends_at),
    status: result.status,
    releasePlayerId: result.release_player_id,
    player: {
      id: result.player_id,
      name: result.player_name,
      team: result.player_team,
      position: result.player_position,
      marketValue: result.player_market_value,
      updatedAt: new Date(result.player_updated_at),
    },
  };

  useAuctionStore.getState().addOrUpdateAuction(newAuction);
}

export async function placeBid(
  auctionId: string, 
  bidAmount: number, 
  userId: string,
  releasePlayerId?: string
) {
  // Check user's budget
  const userStmt = await db.prepare('SELECT budget FROM users WHERE id = ?');
  const user = await userStmt.get(userId);

  const budget = user?.budget;
  if (!budget || budget < bidAmount) {
    throw new Error('Bid amount exceeds your available budget');
  }

  // Check if auction is still active and bid is higher
  const auctionStmt = await db.prepare(`
    SELECT a.*, p.position
    FROM auctions a
    JOIN players p ON a.player_id = p.id
    WHERE a.id = ?
  `);
  const auction = await auctionStmt.get(auctionId);

  if (!auction) {
    throw new Error('Auction not found');
  }

  if (auction.status !== 'active') {
    throw new Error('This auction has ended');
  }

  if (bidAmount <= auction.current_bid) {
    throw new Error('Bid must be higher than current bid');
  }

  if (auction.current_bidder_id === userId) {
    throw new Error('You already have the highest bid');
  }

  // Check roster size for this position
  const rosterCountStmt = await db.prepare(`
    SELECT COUNT(*) as count
    FROM user_roster ur
    JOIN players p ON ur.player_id = p.id
    WHERE ur.user_id = ? AND p.position = ?
  `);
  const rosterCount = await rosterCountStmt.get(userId, auction.position);

  if (rosterCount.count >= ROSTER_REQUIREMENTS[auction.position] && !releasePlayerId) {
    throw new Error(`You must select a ${auction.position} player to release as your roster is full for this position`);
  }

  // If release player is specified, verify it exists in user's roster and has correct position
  if (releasePlayerId) {
    const releasePlayerStmt = await db.prepare(`
      SELECT p.position 
      FROM user_roster ur
      JOIN players p ON ur.player_id = p.id
      WHERE ur.user_id = ? AND ur.player_id = ?
    `);
    const releasePlayer = await releasePlayerStmt.get(userId, releasePlayerId);
    
    if (!releasePlayer) {
      throw new Error('Selected player to release is not in your roster');
    }
    if (releasePlayer.position !== auction.position) {
      throw new Error('Selected player to release must be of the same position');
    }
  }

  // Update the auction
  const updateStmt = await db.prepare(`
    UPDATE auctions 
    SET current_bid = ?, current_bidder_id = ?, release_player_id = ?
    WHERE id = ? AND status = 'active'
  `);

  await updateStmt.run(bidAmount, userId, releasePlayerId || null, auctionId);

  // Fetch the updated auction data
  const stmt = await db.prepare(`
    SELECT 
      a.*,
      p.name as player_name,
      p.team as player_team,
      p.position as player_position,
      p.market_value as player_market_value,
      p.updated_at as player_updated_at
    FROM auctions a
    JOIN players p ON a.player_id = p.id
    WHERE a.id = ?
  `);

  const result = await stmt.get(auctionId);
  const updatedAuction = {
    id: result.id,
    playerId: result.player_id,
    currentBid: result.current_bid,
    currentBidderId: result.current_bidder_id,
    startedAt: new Date(result.started_at),
    endsAt: new Date(result.ends_at),
    status: result.status,
    releasePlayerId: result.release_player_id,
    player: {
      id: result.player_id,
      name: result.player_name,
      team: result.player_team,
      position: result.player_position,
      marketValue: result.player_market_value,
      updatedAt: new Date(result.player_updated_at),
    },
  };

  useAuctionStore.getState().addOrUpdateAuction(updatedAuction);
}

export async function updateReleasePromise(
  auctionId: string,
  releasePlayerId?: string
) {
  // Get auction details
  const auctionStmt = await db.prepare(`
    SELECT a.*, p.position
    FROM auctions a
    JOIN players p ON a.player_id = p.id
    WHERE a.id = ?
  `);
  const auction = await auctionStmt.get(auctionId);

  if (!auction) {
    throw new Error('Auction not found');
  }

  if (auction.status !== 'active') {
    throw new Error('This auction has ended');
  }

  // If release player is specified, verify it exists in user's roster and has correct position
  if (releasePlayerId) {
    const releasePlayerStmt = await db.prepare(`
      SELECT p.position 
      FROM user_roster ur
      JOIN players p ON ur.player_id = p.id
      WHERE ur.user_id = ? AND ur.player_id = ?
    `);
    const releasePlayer = await releasePlayerStmt.get(auction.current_bidder_id, releasePlayerId);
    
    if (!releasePlayer) {
      throw new Error('Selected player to release is not in your roster');
    }
    if (releasePlayer.position !== auction.position) {
      throw new Error('Selected player to release must be of the same position');
    }
  }

  // Update the auction
  const updateStmt = await db.prepare(`
    UPDATE auctions 
    SET release_player_id = ?
    WHERE id = ? AND status = 'active'
  `);

  await updateStmt.run(releasePlayerId || null, auctionId);

  // Fetch the updated auction data
  const stmt = await db.prepare(`
    SELECT 
      a.*,
      p.name as player_name,
      p.team as player_team,
      p.position as player_position,
      p.market_value as player_market_value,
      p.updated_at as player_updated_at
    FROM auctions a
    JOIN players p ON a.player_id = p.id
    WHERE a.id = ?
  `);

  const result = await stmt.get(auctionId);
  const updatedAuction = {
    id: result.id,
    playerId: result.player_id,
    currentBid: result.current_bid,
    currentBidderId: result.current_bidder_id,
    startedAt: new Date(result.started_at),
    endsAt: new Date(result.ends_at),
    status: result.status,
    releasePlayerId: result.release_player_id,
    player: {
      id: result.player_id,
      name: result.player_name,
      team: result.player_team,
      position: result.player_position,
      marketValue: result.player_market_value,
      updatedAt: new Date(result.player_updated_at),
    },
  };

  useAuctionStore.getState().addOrUpdateAuction(updatedAuction);
}

export async function invalidateAuction(auctionId: string) {
  const updateStmt = await db.prepare(`
    UPDATE auctions 
    SET status = 'cancelled', ends_at = datetime('now')
    WHERE id = ? AND status = 'active'
  `);

  await updateStmt.run(auctionId);

  useAuctionStore.getState().removeAuction(auctionId);
}

export async function endAuction(auctionId: string) {
  await db.transaction(async () => {
    // Get auction details
    const auctionStmt = await db.prepare(`
      SELECT * FROM auctions WHERE id = ? AND status = 'active'
    `);
    const auction = await auctionStmt.get(auctionId);

    if (!auction) {
      throw new Error('Auction not found or already ended');
    }

    // Update user's budget
    const updateBudgetStmt = await db.prepare(`
      UPDATE users 
      SET budget = budget - ? 
      WHERE id = ?
    `);
    await updateBudgetStmt.run(auction.current_bid, auction.current_bidder_id);

    // If there's a player to release, remove them from the roster
    if (auction.release_player_id) {
      const releaseStmt = await db.prepare(`
        DELETE FROM user_roster
        WHERE user_id = ? AND player_id = ?
      `);
      await releaseStmt.run(auction.current_bidder_id, auction.release_player_id);
    }

    // Add player to winner's roster
    const addToRosterStmt = await db.prepare(`
      INSERT INTO user_roster (user_id, player_id)
      VALUES (?, ?)
    `);
    await addToRosterStmt.run(auction.current_bidder_id, auction.player_id);

    // Mark auction as completed
    const completeAuctionStmt = await db.prepare(`
      UPDATE auctions 
      SET status = 'completed', ends_at = datetime('now')
      WHERE id = ? AND status = 'active'
    `);
    await completeAuctionStmt.run(auctionId);
  });

  useAuctionStore.getState().removeAuction(auctionId);
}