import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import OfferRidePage from './pages/OfferRidePage';
import FindRidePage from './pages/FindRidePage';
import RideDetailsPage from './pages/RideDetailsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

function App() {
  const { initAuthListener, loading } = useAuthStore();

  React.useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative w-full overflow-hidden items-center justify-center bg-darkBg text-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 font-medium">Connecting to RideSync...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/offer-ride" element={<OfferRidePage />} />
          <Route path="/find-ride" element={<FindRidePage />} />
          <Route path="/ride/:id" element={<RideDetailsPage />} />
          <Route path="/chat/:rideId" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }} />
    </div>
  );
}

export default App;
