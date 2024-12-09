import { getConnection } from './connection';

class DatabaseWrapper {
  private static instance: DatabaseWrapper;

  private constructor() {}

  static getInstance(): DatabaseWrapper {
    if (!DatabaseWrapper.instance) {
      DatabaseWrapper.instance = new DatabaseWrapper();
    }
    return DatabaseWrapper.instance;
  }

  async prepare(sql: string) {
    const db = await getConnection();
    const stmt = db.prepare(sql);
    
    return {
      get: async (...params: any[]) => {
        stmt.bind(params);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
      },
      all: async (...params: any[]) => {
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      run: async (...params: any[]) => {
        stmt.bind(params);
        stmt.step();
        stmt.free();
      }
    };
  }

  async exec(sql: string) {
    const db = await getConnection();
    db.exec(sql);
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    await this.exec('BEGIN TRANSACTION');
    try {
      const result = await callback();
      await this.exec('COMMIT');
      return result;
    } catch (error) {
      await this.exec('ROLLBACK');
      throw error;
    }
  }
}

export const db = DatabaseWrapper.getInstance();