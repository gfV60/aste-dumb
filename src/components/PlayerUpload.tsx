import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle, XCircle } from 'lucide-react';
import { Player } from '../types';
import { processPlayers, UploadStatus } from '../lib/playerUpload';
import { initialPlayers } from '../data/players';

export function PlayerUpload() {
  const [status, setStatus] = useState<UploadStatus>({ status: 'idle' });
  const [uploadMethod, setUploadMethod] = useState<'file' | 'paste'>('file');
  const [jsonText, setJsonText] = useState(initialPlayers);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      await processPlayers(content, setStatus);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonText.trim()) return;
    await processPlayers(jsonText, setStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upload Player Database</h2>
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
            ? 'Upload a JSON file containing the player database from Fantacalcio.'
            : 'Paste the JSON data containing the player database from Fantacalcio.'}
        </p>

        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
{`[
  {
    "id": 2841,
    "name": "Vlahovic",
    "tid": 10,
    "tname": "Juventus",
    "fcrle": 4,        // Position code: 1=P, 2=D, 3=C, 4=A
    "acsfc": 31        // Current market value
    // ... other fields
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
                className="w-full h-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!jsonText.trim() || status.status === 'processing'}
                className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {status.status === 'processing' ? 'Processing...' : 'Update Players'}
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