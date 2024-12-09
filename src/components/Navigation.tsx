import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Trophy, Users, Gavel, LogOut } from 'lucide-react';

export function Navigation() {
  const { isAuthenticated, user, setUser } = useAuthStore();

  const handleLogout = () => {
    setUser(null);
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-xl">Fantasy Auctions</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/players"
                className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
              >
                <Users className="h-5 w-5" />
                <span>Players</span>
              </Link>
              <Link
                to="/auctions"
                className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
              >
                <Gavel className="h-5 w-5" />
                <span>Auctions</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {user?.name} (${user?.budget})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}