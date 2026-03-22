import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LocationInput from '../components/LocationInput'; 
import { MapPin, Calendar, Search, Filter, Star, User, ChevronRight } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const FindRidePage = () => {
  const [searchParams, setSearchParams] = useState({ source: '', destination: '', date: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const q = query(collection(db, 'rides'), where('status', '==', 'Active'));
        const querySnapshot = await getDocs(q);
        const fetchedRides = [];
        querySnapshot.forEach((doc) => {
          fetchedRides.push({ id: doc.id, ...doc.data() });
        });
        
        // Let's add the mock data as fallback if DB is empty so it looks good visually
        if (fetchedRides.length === 0) {
           fetchedRides.push(
            { id: '101', driverName: 'Rahul Sharma', rating: 4.8, source: 'Banjara Hills, Hyderabad', destination: 'Warangal', time: '10:00 AM', price: 450, seatsLeft: 3, vehicle: 'Tata Nexon' },
            { id: '102', driverName: 'Priya Patel', rating: 4.9, source: 'Gachibowli', destination: 'Karimnagar', time: '14:30 PM', price: 300, seatsLeft: 1, vehicle: 'Hyundai i20' },
            { id: '103', driverName: 'Arjun Singh', rating: 4.5, source: 'Secunderabad', destination: 'Warangal', time: '16:00 PM', price: 400, seatsLeft: 2, vehicle: 'Maruti Dzire' }
           );
        }
        setRides(fetchedRides);
      } catch (error) {
        console.error("Error fetching rides: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRides();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const filteredRides = rides.filter(ride => {
    const matchSource = searchParams.source ? ride.source?.toLowerCase().includes(searchParams.source.toLowerCase()) : true;
    const matchDest = searchParams.destination ? ride.destination?.toLowerCase().includes(searchParams.destination.toLowerCase()) : true;
    const matchDate = searchParams.date ? ride.date === searchParams.date : true;
    return matchSource && matchDest && matchDate;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="glass p-6 md:p-8 mb-8 backdrop-blur-xl">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Where are you going?</h1>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Leaving from</label>
            <LocationInput 
              name="source"
              value={searchParams.source || ''}
              placeholder="City or Area"
              className="h-12"
              onChange={(e) => setSearchParams({...searchParams, source: e.target.value})}
            />
          </div>

          <div className="w-full md:flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Going to</label>
            <LocationInput 
              name="destination"
              value={searchParams.destination || ''}
              placeholder="City or Area"
              className="h-12"
              onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
            />
          </div>

          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="date" 
                className="input-field pl-10 h-12 pr-4"
                onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary h-12 px-8 w-full md:w-auto flex items-center justify-center gap-2">
            <Search className="h-5 w-5" />
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="glass p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Filters</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Sort By</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="sort" className="text-primary focus:ring-primary rounded-full bg-white/10 border-white/20" defaultChecked />
                    Earliest departure
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="sort" className="text-primary focus:ring-primary rounded-full bg-white/10 border-white/20" />
                    Lowest price
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="sort" className="text-primary focus:ring-primary rounded-full bg-white/10 border-white/20" />
                    Shortest ride
                  </label>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full"></div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Amenities</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="text-primary rounded focus:ring-primary bg-white/10 border-white/20" />
                    Instant Booking
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="text-primary rounded focus:ring-primary bg-white/10 border-white/20" />
                    Max 2 in back seat
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {hasSearched ? `Available rides` : 'Popular rides near you'}
            </h2>
            <span className="text-sm text-gray-400">{filteredRides.length} results found</span>
          </div>

          {isLoading ? (
            <div className="glass p-10 text-center flex flex-col items-center justify-center">
             <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-gray-400">Fetching live rides from database...</p>
           </div>
          ) : filteredRides.length === 0 ? (
             <div className="glass p-10 text-center">
                 <p className="text-gray-400">No rides found matching your search. Try different dates or cities.</p>
             </div>
          ) : filteredRides.map((ride, i) => (
            <motion.div 
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass hover:border-primary/50 transition-all duration-300 group"
            >
              <Link to={`/ride/${ride.id}`} className="block p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {/* Driver Info */}
                  <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-6 w-full sm:w-1/4">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary overflow-hidden">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-darkBg border border-white/10 rounded-full px-1.5 py-0.5 flex items-center gap-1 text-xs font-bold text-yellow-400">
                        <Star className="h-3 w-3 fill-yellow-400" /> {ride.rating || 4.5}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{ride.driverName || ride.driver || 'Driver'}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <span className="truncate">{ride.vehicle || 'Standard Vehicle'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-lg mb-1">{ride.time}</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        <div className="w-px h-6 bg-white/20 my-1"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                        <span className="font-bold text-lg mt-1 text-gray-500">--:--</span>
                      </div>
                      <div className="flex flex-col justify-between h-full py-1">
                        <div className="mb-6">
                          <p className="font-medium text-lg leading-none">{ride.source}</p>
                        </div>
                        <div>
                          <p className="font-medium text-lg leading-none">{ride.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-3xl font-bold text-primary">₹{ride.price}</span>
                      <span className="text-sm text-gray-400">{ride.seatsLeft || ride.seats} seats left</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                      <span className="font-medium">Details</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
        </div>
      </div>
    </div>
  );
};

export default FindRidePage;
