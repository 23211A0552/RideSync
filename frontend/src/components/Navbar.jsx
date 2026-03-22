import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Car, User } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                RideSync
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/find-ride" className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Find Ride</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/offer-ride" className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Offer Ride</Link>
                  <Link to="/dashboard" className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                  <div className="relative group flex items-center gap-2 cursor-pointer ml-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 overflow-hidden">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{user?.name || 'User'}</span>
                    
                    {/* Dropdown Wrapper for Hover Bridge */}
                    <div className="absolute top-full right-0 pt-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-50">
                      <div className="py-2 glass rounded-lg shadow-xl border border-white/10">
                        <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors">Profile</Link>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors">Logout</button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/auth" className="btn-primary ml-4">Log In</Link>
              )}
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-white/10 absolute w-full top-16 left-0 shadow-2xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/find-ride" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5" onClick={() => setIsOpen(false)}>Find Ride</Link>
            {isAuthenticated ? (
              <>
                <Link to="/offer-ride" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5" onClick={() => setIsOpen(false)}>Offer Ride</Link>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-white/5" onClick={() => setIsOpen(false)}>Profile</Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-white/5">Logout</button>
              </>
            ) : (
              <Link to="/auth" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-white/5" onClick={() => setIsOpen(false)}>Log In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
