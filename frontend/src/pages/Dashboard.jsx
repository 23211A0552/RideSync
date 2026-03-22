import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Clock, Shield, Search, Star, MessageSquare, Plus, ChevronRight, Map, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Dashboard = () => {
  const { user } = useAuthStore();
  
  const [offeredRides, setOfferedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    // 1. Fetch rides offered by user (Driver)
    const qDriver = query(collection(db, 'rides'), where('driverId', '==', user.uid));
    const unsubDriver = onSnapshot(qDriver, (snapshot) => {
      const rides = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        rides.push({ id: doc.id, role: 'Driver', ...data });
      });
      setOfferedRides(rides);
      setIsLoading(false);
    });

    // 2. Fetch rides booked by user (Passenger)
    const qPassenger = query(collection(db, 'rides'), where('passengerIds', 'array-contains', user.uid));
    const unsubPassenger = onSnapshot(qPassenger, (snapshot) => {
      const rides = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        rides.push({ id: doc.id, role: 'Passenger', ...data });
      });
      setBookedRides(rides);
    });

    return () => {
      unsubDriver();
      unsubPassenger();
    };
  }, [user]);

  const renderRideCard = (ride) => (
    <div key={ride.id} className="glass p-6 flex flex-col justify-between hover:bg-white/5 transition-colors group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${ride.role === 'Driver' ? 'bg-primary/20 text-primary' : 'bg-purple-500/20 text-purple-400'}`}>
            {ride.role}
          </span>
          <span className="text-sm text-gray-400 flex items-center gap-1"><Clock className="w-4 h-4"/> {ride.time}</span>
        </div>
        <span className={`text-sm font-medium ${ride.status === 'Confirmed' || ride.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>
          {ride.status}
        </span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <div className="w-0.5 h-8 bg-white/20 my-1"></div>
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
        </div>
        <div className="flex flex-col justify-between h-[60px] w-full max-w-[200px]">
          <span className="font-medium truncate block w-full">{ride.source}</span>
          <span className="font-medium text-gray-300 truncate block w-full">{ride.destination}</span>
        </div>
      </div>

      {ride.role === 'Driver' && (
        <div className="mb-4 text-xs text-gray-400 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> 
          {ride.passengerIds?.length || 0} passengers booked ({(ride.seatsLeft) || 0} seats left)
        </div>
      )}
      
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-gray-400">View Details</span>
        <Link to={`/ride/${ride.id}`} className="absolute inset-0 z-10">
          <span className="sr-only">View Ride Details</span>
        </Link>
        <div className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-0">
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}! 👋</h1>
        <p className="text-gray-400">Here's your riding overview and quick actions.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Link to="/offer-ride">
          <motion.div whileHover={{ scale: 1.02 }} className="glass p-6 group cursor-pointer h-full">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <Plus className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Offer a Ride</h3>
            <p className="text-gray-400 text-sm">Driving somewhere? Share your empty seats and split the cost.</p>
          </motion.div>
        </Link>
        
        <Link to="/find-ride">
          <motion.div whileHover={{ scale: 1.02 }} className="glass p-6 group cursor-pointer h-full">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <Search className="text-purple-400 h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find a Ride</h3>
            <p className="text-gray-400 text-sm">Need a lift? Find drivers heading your way right now.</p>
          </motion.div>
        </Link>

        {/* Stats */}
        <div className="glass p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Your Impact</h3>
            <p className="text-gray-400 text-sm mb-6">By sharing rides, you've saved:</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span className="text-gray-300">CO2 Emissions</span>
                <span className="text-green-400 font-bold">12.5 kg</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span className="text-gray-300">Money Saved</span>
                <span className="text-primary font-bold">₹3,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-12 pb-12">
        {isLoading ? (
           <div className="glass p-10 text-center flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-gray-400">Loading your rides...</p>
           </div>
        ) : (
          <>
            {/* Passenger Tab */}
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-2">Rides I've Booked</h2>
              {bookedRides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookedRides.map(renderRideCard)}
                </div>
              ) : (
                <div className="glass p-8 text-center flex flex-col items-center justify-center">
                  <p className="text-gray-400 mb-4">You haven't booked any rides yet.</p>
                  <Link to="/find-ride" className="btn-primary">Find a Ride</Link>
                </div>
              )}
            </div>

            {/* Driver Tab */}
            <div>
              <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-2">Rides I'm Offering</h2>
              {offeredRides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offeredRides.map(renderRideCard)}
                </div>
              ) : (
                <div className="glass p-8 text-center flex flex-col items-center justify-center">
                  <Map className="w-12 h-12 text-gray-500 mb-4" />
                  <p className="text-gray-400 mb-4">You haven't posted any rides yet.</p>
                  <Link to="/offer-ride" className="btn-primary">Offer a Ride</Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
