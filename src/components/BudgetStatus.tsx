import React, { useState, useEffect } from 'react';
import { CircleDollarSign } from 'lucide-react';
import { db } from '../lib/db';
import { useAuthStore } from '../store/authStore';

interface BudgetStatusProps {
  budget: number;
}

export function BudgetStatus({ budget }: BudgetStatusProps) {
  const [budgetInUse, setBudgetInUse] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchActiveBids = async () => {
      if (!user) return;

      try {
        const stmt = await db.prepare(`
          SELECT SUM(current_bid) as total_bids
          FROM auctions
          WHERE current_bidder_id = ?
          AND status = 'active'
        `);
        
        const result = await stmt.get(user.id);
        setBudgetInUse(result?.total_bids || 0);
      } catch (error) {
        console.error('Failed to fetch active bids:', error);
      }
    };

    fetchActiveBids();
    // Refresh every 10 seconds to keep the budget in use updated
    const interval = setInterval(fetchActiveBids, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const remainingBudget = budget - budgetInUse;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Budget Status</h2>
        <CircleDollarSign className="h-6 w-6 text-gray-400" />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Current Budget</span>
          <span className={`text-xl font-bold text-yellow-600`}>
            ${budget}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Active Auctions</span>
          <span className={`text-xl font-bold text-red-600`}>
            -${budgetInUse}
          </span>
        </div>
      </div> 
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Available Budget</span>
          <span className={`text-xl font-bold text-green-600`}>
            ${remainingBudget}
          </span>
        </div>
      </div>
    </div>
  );
}