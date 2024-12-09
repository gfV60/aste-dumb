import initSqlJs from 'sql.js';
import { Database } from 'sql.js';

let dbInstance: Database | null = null;
let initializationPromise: Promise<Database> | null = null;

export async function getConnection(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        dbInstance = new SQL.Database();
        return dbInstance;
      } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
      }
    })();
  }

  return initializationPromise;
}