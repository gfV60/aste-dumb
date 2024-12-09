import { db } from './index';
import { hashPassword } from '../crypto';

export async function seedDatabase() {
  try {
    // Create admin user
    const adminPasswordHash = await hashPassword('a');
    const adminStmt = await db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, name, team_name, budget, is_admin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    await adminStmt.run(
      'admin',
      'admin@example.com',
      adminPasswordHash,
      'Admin',
      'System Admin',
      0,
      true
    );

    // Create test users
    const users = [
      {
        id: '4957234',
        email: 'a@example.com',
        password: 'a',
        name: 'forst76',
        teamName: 'Mahalo Valhalla',
        budget: 1000
      },
      {
        id: '4957548',
        email: 'b@example.com',
        password: 'a',
        name: 'trampster',
        teamName: 'Glitch',
        budget: 1000
      },
      {
        id: '4958987',
        email: 'c@example.com',
        password: 'a',
        name: 'Shex',
        teamName: 'Modena City FC',
        budget: 1000
      },
      {
        id: '4959934',
        email: 'd@example.com',
        password: 'a',
        name: 'Muss',
        teamName: 'Team Muss1234',
        budget: 1000
      },
      {
        id: '4963699',
        email: 'e@example.com',
        password: 'a',
        name: 'Tinto',
        teamName: 'Sporting Loco',
        budget: 1000
      },
      {
        id: '4971607',
        email: 'f@example.com',
        password: 'a',
        name: 'davide',
        teamName: 'Sucate Football Club',
        budget: 1000
      },
      {
        id: '5839068',
        email: 'g@example.com',
        password: 'a',
        name: 'sosti',
        teamName: 'Kim Jong United',
        budget: 1000
      },
      {
        id: '5891783',
        email: 'h@example.com',
        password: 'a',
        name: 'ketchup mayo?',
        teamName: 'Currywurst FC',
        budget: 1000
      }
    ];

    for (const user of users) {
      const passwordHash = await hashPassword(user.password);
      const stmt = await db.prepare(`
        INSERT OR REPLACE INTO users (id, email, password_hash, name, team_name, budget, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      await stmt.run(
        user.id,
        user.email,
        passwordHash,
        user.name,
        user.teamName,
        user.budget,
        false
      );
    }

    // Rest of the seeding code...
    const players = [
      { id: '1', name: 'Patrick Mahomes', team: 'KC', position: 'QB', marketValue: 450 },
      { id: '2', name: 'Christian McCaffrey', team: 'SF', position: 'RB', marketValue: 400 },
      { id: '3', name: 'Justin Jefferson', team: 'MIN', position: 'WR', marketValue: 380 },
      { id: '4', name: 'Travis Kelce', team: 'KC', position: 'TE', marketValue: 350 },
      { id: '5', name: 'JaMarr Chase', team: 'CIN', position: 'WR', marketValue: 340 },
      { id: '6', name: 'Josh Allen', team: 'BUF', position: 'QB', marketValue: 430 },
      { id: '7', name: 'Saquon Barkley', team: 'NYG', position: 'RB', marketValue: 320 },
      { id: '8', name: 'Mark Andrews', team: 'BAL', position: 'TE', marketValue: 280 },
      { id: '9', name: 'San Francisco 49ers', team: 'SF', position: 'DEF', marketValue: 150 },
      { id: '10', name: 'Justin Tucker', team: 'BAL', position: 'K', marketValue: 100 }
    ];

    for (const player of players) {
      const stmt = await db.prepare(`
        INSERT OR REPLACE INTO players (id, name, team, position, market_value, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);
      await stmt.run(
        player.id,
        player.name,
        player.team,
        player.position,
        player.marketValue
      );
    }

    // Create a sample active auction
    const sampleAuction = {
      id: '1',
      playerId: '1', // Patrick Mahomes
      currentBid: 460,
      currentBidderId: '2', // Sarah
      startedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      status: 'active'
    };

    const stmt = await db.prepare(`
      INSERT OR REPLACE INTO auctions (id, player_id, current_bid, current_bidder_id, started_at, ends_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    await stmt.run(
      sampleAuction.id,
      sampleAuction.playerId,
      sampleAuction.currentBid,
      sampleAuction.currentBidderId,
      sampleAuction.startedAt.toISOString(),
      sampleAuction.endsAt.toISOString(),
      sampleAuction.status
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}