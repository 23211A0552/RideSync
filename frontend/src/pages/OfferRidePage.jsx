import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, IndianRupee, Navigation, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import LocationInput from '../components/LocationInput';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const OfferRidePage = () => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: '',
    time: '',
    vehicle: '',
    vehicleCapacity: '',
    seats: 3,
    price: ''
  });

  const [routeInfo, setRouteInfo] = useState({
    distance: null,
    duration: null,
    isLoading: false,
    error: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch OpenStreetMap Nominatim for Geocoding + OSRM for Routing
  useEffect(() => {
    const fetchRouteInfo = async () => {
      if (!formData.source || !formData.destination) {
        setRouteInfo({ distance: null, duration: null, isLoading: false, error: null });
        return;
      }
      
      setRouteInfo(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const getCoordinates = async (queryName) => {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(queryName)}, Telangana, India`);
          const data = await res.json();
          if (data && data.length > 0) return { lat: data[0].lat, lon: data[0].lon };
          return null;
        };

        const srcCoords = await getCoordinates(formData.source);
        const destCoords = await getCoordinates(formData.destination);

        if (srcCoords && destCoords) {
          // Send to OSRM mapping utility (Longitude,Latitude format)
          const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${srcCoords.lon},${srcCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`);
          const osrmData = await osrmRes.json();
          
          if (osrmData.routes && osrmData.routes.length > 0) {
            const destKm = (osrmData.routes[0].distance / 1000).toFixed(1);
            const totalMins = Math.round(osrmData.routes[0].duration / 60);
            
            const hours = Math.floor(totalMins / 60);
            const mins = totalMins % 60;
            const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            
            setRouteInfo({ distance: `${destKm} km`, duration: timeString, isLoading: false, error: null });
          } else {
            setRouteInfo({ distance: null, duration: null, isLoading: false, error: "AI Route unable to connect roads" });
          }
        } else {
          setRouteInfo({ distance: null, duration: null, isLoading: false, error: "Cannot pinpoint exact city location" });
        }
      } catch (err) {
        setRouteInfo({ distance: null, duration: null, isLoading: false, error: "Network error fetching route" });
      }
    };

    // Debounce the fetch action by 800ms to avoid rate-limiting on open source APIs when user types
    const timerId = setTimeout(() => fetchRouteInfo(), 800);
    return () => clearTimeout(timerId);
  }, [formData.source, formData.destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to offer a ride.');
      return;
    }

    if (!formData.source || !formData.destination || !formData.date || !formData.time) {
      toast.error('Please fill in all location and time fields.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Publishing your ride to the database...');
    
    try {
      await addDoc(collection(db, 'rides'), {
        ...formData,
        vehicle: formData.vehicle || 'Standard Vehicle', // Save the vehicle name
        driverId: user.uid,
        driverName: user.name,
        price: Number(formData.price),
        seatsLeft: Number(formData.seats),
        createdAt: serverTimestamp(),
        status: 'Active'
      });
      
      toast.success('Your Ride was published successfully!', { id: loadingToast });
      setFormData({ source: '', destination: '', date: '', time: '', vehicle: '', vehicleCapacity: '', seats: 3, price: '' });
      navigate('/dashboard'); // Take them to dashboard to see it
    } catch (error) {
      console.error("Error adding ride: ", error);
      toast.error('Failed to publish ride. Are you logged in?', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Form Section */}
      <div className="w-full lg:w-1/3 glass p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Navigation className="text-primary h-6 w-6" />
          Offer a Ride
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Leaving from</label>
            <LocationInput 
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="City or Area"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Going to</label>
            <LocationInput 
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="City or Area"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field pl-10 custom-date-input"
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
              <div className="relative">
                <input 
                  type="time" 
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="input-field px-4"
                  required 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Model</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="e.g. Ford EcoSport"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Capacity</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="number" 
                  name="vehicleCapacity"
                  value={formData.vehicleCapacity}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Total seats"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Available Seats</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="number" 
                  min="1" max={formData.vehicleCapacity || 8}
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cost per Seat (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="number" 
                  min="1"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-field pl-10"
                  required 
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-4 disabled:opacity-50">
            {isSubmitting ? 'Publishing...' : 'Publish Ride'}
          </button>
        </form>
      </div>

      {/* Map Section */}
      <div className="w-full lg:w-2/3 h-[500px] lg:h-auto min-h-[500px] glass relative overflow-hidden flex flex-col">
        <div className="p-4 bg-white/5 border-b border-white/10 z-10 w-full backdrop-blur-md">
          <h3 className="font-semibold text-lg">Route Preview</h3>
          <p className="text-sm text-gray-400">Powered by OpenStreetMap AI Routing</p>
        </div>
        <div className="flex-1 w-full bg-[#1e293b] flex items-center justify-center relative">
           {/* Mock Map Background using pure CSS to avoid any public API flags */}
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>
           
           <div className="z-10 text-center w-full px-4">
             <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4 opacity-50" />
             {formData.source && formData.destination ? (
               <div className="bg-darkBg/90 p-4 rounded-xl border border-white/10 mt-4 max-w-sm mx-auto text-center backdrop-blur-md shadow-2xl">
                 <p className="font-bold text-primary mb-2">Estimated Route</p>
                 <div className="flex flex-col items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-primary"></div>
                   <div className="w-0.5 h-10 bg-white/20 border-l border-dashed border-gray-400"></div>
                   <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                 </div>
                 <div className="flex justify-between w-full mt-2 font-medium text-sm gap-2">
                   <span className="truncate flex-1 text-left">{formData.source}</span>
                   <span className="truncate flex-1 text-right">{formData.destination}</span>
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/10 flex flex-col justify-center text-xs text-gray-400 min-h-[40px]">
                    {routeInfo.isLoading ? (
                      <div className="text-center w-full animate-pulse text-primary">Calculating routing data...</div>
                    ) : routeInfo.error ? (
                      <div className="text-center w-full text-yellow-500">{routeInfo.error}</div>
                    ) : routeInfo.distance ? (
                      <div className="flex justify-between w-full text-gray-300 font-medium">
                        <span>Est. Distance: {routeInfo.distance}</span>
                        <span>Est. Driving Time: {routeInfo.duration}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between w-full">
                        <span>Est. Distance: ~45 km</span>
                        <span>Est. Time: ~1h 15m</span>
                      </div>
                    )}
                 </div>
               </div>
             ) : (
               <p className="text-gray-400 mt-2 max-w-sm px-6 mx-auto">
                 Enter your source and destination to preview the optimal route generated by our routing engine.
               </p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default OfferRidePage;
