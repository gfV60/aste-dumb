import { Player } from '../types';
import { db } from './db';

interface FantacalcioPlayer {
  id: number;
  name: string;
  tid: number;
  tname: string;
  stnme: string;
  leag: string;
  lid: number;
  fcrle: number;
  marle: number[];
  icsfc: number;
  icsma: number;
  acsfc: number;
  acsma: number;
  trnsf: number;
  trsfd: number;
  fvmfc: number;
  fvmma: number;
  mspv: number;
  img: string;
  age: number;
  naty: string;
  shtnu: string;
  agrd: number;
  fagrd: number;
  aagr: number;
  faagr: number;
  agit: number;
  fagit: number;
  vers: string;
}

export interface UploadStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  details?: string[];
}



function mapPosition(fcrle: number): 'P' | 'D' | 'C' | 'A' {
  switch (fcrle) {
    case 1: return 'P'; 
    case 2: return 'D';
    case 3: return 'C';
    case 4: return 'A';
    default: throw new Error(`Invalid position code: ${fcrle}`);
  }
}

function validatePlayer(player: any): string[] {
  const errors: string[] = [];

  if (!player.id || typeof player.id !== 'number') {
    errors.push('Missing or invalid id (must be a number)');
  }
  if (!player.name || typeof player.name !== 'string') {
    errors.push('Missing or invalid name (must be a string)');
  }
  if (!player.tname || typeof player.tname !== 'string') {
    errors.push('Missing or invalid team name (tname must be a string)');
  }
  if (!player.fcrle || ![1, 2, 3, 4].includes(player.fcrle)) {
    errors.push('Missing or invalid position code (fcrle must be 1, 2, 3, or 4)');
  }
  if (typeof player.acsfc !== 'number') {
    errors.push('Missing or invalid market value (acsfc must be a number)');
  }

  return errors;
}

function transformPlayer(player: FantacalcioPlayer): Player {
  const errors = validatePlayer(player);
  if (errors.length > 0) {
    throw new Error(`Invalid player data for ${player.name || 'Unknown Player'}:\n${errors.join('\n')}`);
  }

  return {
    id: player.id.toString(),
    name: player.name,
    team: player.tname,
    position: mapPosition(player.fcrle),
    marketValue: player.acsfc,
    updatedAt: new Date()
  };
}


export const processPlayers = async (rawData: string, setStatus: () => void ) => {
  setStatus({ status: 'processing' });

  try {
    // Parse JSON
    let rawPlayers;
    try {
      rawPlayers = JSON.parse(rawData);
    } catch (error) {
      throw new Error('Invalid JSON format. Please check your input.');
    }

    // Validate array structure
    if (!Array.isArray(rawPlayers)) {
      throw new Error('Invalid format. Expected an array of players.');
    }

    if (rawPlayers.length === 0) {
      throw new Error('The player list is empty.');
    }

    // Transform and validate players
    const validationErrors: string[] = [];
    const players: Player[] = [];

    for (const [index, rawPlayer] of rawPlayers.entries()) {
      try {
        players.push(transformPlayer(rawPlayer));
      } catch (error) {
        validationErrors.push(`Player ${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (validationErrors.length > 0) {
      throw new Error('Validation errors occurred:\n' + validationErrors.join('\n'));
    }

    // Update database within a transaction
    await db.transaction(async () => {
      // Clear existing players
      await db.exec('DELETE FROM players');

      //Insert new players
      for (const player of players) {
        const stmt = await db.prepare(`
          INSERT INTO players (id, name, team, position, market_value, updated_at)
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
    });

    setStatus({
      status: 'success',
      message: `Successfully updated ${players.length} players`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred '+error;
    const errorDetails = errorMessage.split('\n');
    
    setStatus({
      status: 'error',
      message: errorDetails[0],
      details: errorDetails.slice(1)
    });
  }
};