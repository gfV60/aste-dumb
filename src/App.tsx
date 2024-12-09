import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PlayerList } from './components/PlayerList';
import { ActiveAuctions } from './components/ActiveAuctions';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { Notifications } from './components/Notifications';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {user?.isAdmin ? <AdminDashboard /> : <Dashboard />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/players"
              element={
                <ProtectedRoute>
                  <PlayerList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auctions"
              element={
                <ProtectedRoute>
                  <ActiveAuctions />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Notifications />
      </div>
    </Router>
  );
}

export default App;