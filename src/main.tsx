import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeSchema } from './lib/db/schema';
import { seedDatabase } from './lib/db/seed';

const rootElement = document.getElementById('root')!;

// Show loading state
rootElement.innerHTML = `
  <div style="height: 100vh; display: flex; justify-content: center; align-items: center;">
    <div style="text-align: center;">
      <div style="border: 4px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; width: 40px; height: 40px; margin: 0 auto; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 1rem; color: #4f46e5; font-weight: 500;">Initializing Fantasy Football Auctions...</p>
    </div>
  </div>
  <style>
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
`;

// Initialize the application
const init = async () => {
  try {
    await initializeSchema();
    await seedDatabase();
    
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize application:', error);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; justify-content: center; align-items: center; padding: 1rem;">
        <div style="max-width: 400px; text-align: center;">
          <div style="color: #dc2626; margin-bottom: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 48px; height: 48px; margin: 0 auto;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 style="color: #1f2937; font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">Failed to Initialize Application</h1>
          <p style="color: #6b7280;">Please try refreshing the page. If the problem persists, contact support.</p>
        </div>
      </div>
    `;
  }
};

init();