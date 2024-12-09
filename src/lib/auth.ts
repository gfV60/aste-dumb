import { db } from './db/index';
import { User } from '../types';
import { hashPassword } from './crypto';

export async function loginUser(email: string, password: string): Promise<User | null> {
  const passwordHash = await hashPassword(password);
  
  const stmt = await db.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?');
  const user = await stmt.get(email, passwordHash);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    teamName: user.team_name,
    budget: user.budget,
    isAdmin: user.is_admin === 1, // SQLite stores booleans as 0/1
    roster: [] // We'll fetch the roster separately when needed
  };
}