import { getConnection } from './connection';

export async function initializeSchema() {
  const db = await getConnection();

  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT NOT NULL,
      position TEXT NOT NULL,
      market_value INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      team_name TEXT NOT NULL,
      budget INTEGER NOT NULL DEFAULT 1000,
      is_admin BOOLEAN DEFAULT FALSE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_roster (
      user_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (player_id) REFERENCES players(id),
      PRIMARY KEY (user_id, player_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auctions (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      current_bid INTEGER NOT NULL,
      current_bidder_id TEXT NOT NULL,
      started_at DATETIME NOT NULL,
      ends_at DATETIME NOT NULL,
      status TEXT NOT NULL,
      release_player_id TEXT,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (current_bidder_id) REFERENCES users(id),
      FOREIGN KEY (release_player_id) REFERENCES players(id)
    )
  `);
}