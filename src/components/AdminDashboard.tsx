import React from 'react';
import { Settings, Users, Database, Activity } from 'lucide-react';
import { PlayerUpload } from './PlayerUpload';
import { RosterUpload } from './RosterUpload';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
          <button className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Manage Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Auction Control</h2>
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Monitor and manage active auctions</p>
          <button className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            View Auctions
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            <Database className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Status</span>
              <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-medium text-gray-900">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Auctions</span>
              <span className="font-medium text-gray-900">1</span>
            </div>
          </div>
        </div>
      </div>

      <PlayerUpload />
      <RosterUpload />
    </div>
  );
}