import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle, XCircle } from 'lucide-react';
import { db } from '../lib/db';
import { initialRosters } from '../data/rosters';


interface UploadStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  details?: string[];
}

interface RosterData {
  id: number;
  n: string;
  cal: string;
  cs: string;
  c: boolean;
  cr: number;
  nu: string;
}

function validateRoster(roster: any): string[] {
  const errors: string[] = [];

  if (!roster.id || typeof roster.id !== 'number') {
    errors.push('Missing or invalid id (must be a number)');
  }
  if (!roster.n || typeof roster.n !== 'string') {
    errors.push('Missing or invalid team name (n must be a string)');
  }
  if (!roster.cal || typeof roster.cal !== 'string') {
    errors.push('Missing or invalid roster list (cal must be a string)');
  }
  if (!roster.cr || typeof roster.cr !== 'number') {
    errors.push('Missing or invalid remaining credits (cr must be a number)');
  }

  return errors;
}

export function RosterUpload() {
  const [status, setStatus] = useState<UploadStatus>({ status: 'idle' });
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file');
  const [jsonText, setJsonText] = useState(initialRosters);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processRosters = async (rawData: string) => {
    setStatus({ status: 'processing' });

    try {
      // Parse JSON
      let rosters: RosterData[];
      try {
        const parsed = JSON.parse(rawData);
        rosters = Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        throw new Error('Invalid JSON format. Please check your input.');
      }

      if (rosters.length === 0) {
        throw new Error('No rosters found in the input data.');
      }

      // Validate all rosters first
      const validationErrors: { roster: string; errors: string[] }[] = [];
      for (const roster of rosters) {
        const errors = validateRoster(roster);
        if (errors.length > 0) {
          validationErrors.push({
            roster: roster.n || `Team ${roster.id}`,
            errors
          });
        }
      }

      if (validationErrors.length > 0) {
        throw new Error('Validation errors occurred:\n' + 
          validationErrors.map(ve => 
            `${ve.roster}:\n${ve.errors.map(e => `  - ${e}`).join('\n')}`
          ).join('\n\n')
        );
      }

      // Update database within a transaction
      await db.transaction(async () => {
        // First, verify that all players exist in the database
        const allPlayerIds = new Set(
          rosters.flatMap(roster => 
            roster.cal.split(';').map(id => id.trim())
          )
        );

        const nonExistentPlayers: string[] = [];
        for (const playerId of allPlayerIds) {
          const stmt = await db.prepare('SELECT id FROM players WHERE id = ?');
          const exists = await stmt.get(playerId);
          if (!exists) {
            nonExistentPlayers.push(playerId);
          }
        }

        if (nonExistentPlayers.length > 0) {
          throw new Error(`Some players do not exist in the database: ${nonExistentPlayers.join(', ')}`);
        }

        // Process each roster
        for (const roster of rosters) {
          // Update user's team name only
          const userStmt = await db.prepare(`
            UPDATE users 
            SET name = ?, team_name = ?, budget = ?
            WHERE id = ?
          `);
          await userStmt.run(
            roster.nu,
            roster.n,
            roster.cr,
            roster.id.toString()
          );

          // Clear existing roster for this user
          await db.exec(`DELETE FROM user_roster WHERE user_id = '${roster.id}'`);

          // Insert new roster
          const playerIds = roster.cal.split(';').map(id => id.trim());
          for (const playerId of playerIds) {
            const rosterStmt = await db.prepare(`
              INSERT INTO user_roster (user_id, player_id)
              VALUES (?, ?)
            `);
            await rosterStmt.run(roster.id.toString(), playerId);
          }
        }
      });

      setStatus({
        status: 'success',
        message: `Successfully updated ${rosters.length} team roster${rosters.length > 1 ? 's' : ''}`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const errorDetails = errorMessage.split('\n');
      
      setStatus({
        status: 'error',
        message: errorDetails[0],
        details: errorDetails.slice(1)
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      await processRosters(content);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonText.trim()) return;
    await processRosters(jsonText);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upload Team Rosters</h2>
          <Upload className="h-5 w-5 text-gray-400" />
        </div>

        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setUploadMethod('file')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              uploadMethod === 'file'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setUploadMethod('paste')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              uploadMethod === 'paste'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Paste JSON
          </button>
        </div>
        
        <p className="text-sm text-gray-600">
          {uploadMethod === 'file' 
            ? 'Upload a JSON file containing one or more team rosters.'
            : 'Paste the JSON data containing one or more team rosters.'}
        </p>

        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
{`[
  {
    "id": 4957234,
    "n": "Mahalo Valhalla",
    "cal": "6632;6495;6228;6224;6202;6191;5882;5875;5833",
    "cs": "4;2;101;23;11;4;18;6;11",
    "c": true
  },
  {
    "id": 4957235,
    "n": "Thunder Hawks",
    "cal": "6633;6496;6229;6225;6203;6192;5883;5876;5834",
    "cs": "5;3;102;24;12;5;19;7;12",
    "c": true
  }
]`}
        </pre>

        <div className="mt-4">
          {uploadMethod === 'file' ? (
            <label className="block">
              <span className="sr-only">Choose file</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                  file:cursor-pointer cursor-pointer"
              />
            </label>
          ) : (
            <form onSubmit={handleJsonSubmit}>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste your JSON here..."
                className="w-full h-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!jsonText.trim() || status.status === 'processing'}
                className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {status.status === 'processing' ? 'Processing...' : 'Update Rosters'}
              </button>
            </form>
          )}
        </div>

        {status.status !== 'idle' && (
          <div className={`mt-4 p-4 rounded-md ${
            status.status === 'processing' ? 'bg-blue-50' :
            status.status === 'success' ? 'bg-green-50' :
            'bg-red-50'
          }`}>
            <div className="flex">
              {status.status === 'processing' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
              ) : status.status === 'success' ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  status.status === 'processing' ? 'text-blue-700' :
                  status.status === 'success' ? 'text-green-700' :
                  'text-red-700'
                }`}>
                  {status.message}
                </p>
                {status.details && status.details.length > 0 && (
                  <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                    {status.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}