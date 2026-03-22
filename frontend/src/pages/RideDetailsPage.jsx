import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, MessageSquare, Shield, Clock, Heart, Users, User, Navigation, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, onSnapshot, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const RideDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [ride, setRide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [watchId, setWatchId] = useState(null);
  const [review, setReview] = useState({ stars: 5, comment: '', submitted: false });

  // 1. Live Fetch using onSnapshot
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'rides', id), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let driverRealRating = 5.0;
        let driverRealReviews = 0;
        
        // Dynamically calculate rating from the 'reviews' collection to respect User Profile security rules
        if (data.driverId) {
          const reviewsQ = query(collection(db, 'reviews'), where('driverId', '==', data.driverId));
          const reviewsSnap = await getDocs(reviewsQ);
          if (!reviewsSnap.empty) {
             let totalStars = 0;
             reviewsSnap.forEach(d => totalStars += d.data().stars);
             driverRealReviews = reviewsSnap.size;
             driverRealRating = totalStars / driverRealReviews;
          }
        }
        
        setRide({
          id: docSnap.id,
          ...data,
          status: data.status || 'Active', // Active, Started, Completed
          driver: data.driverName || 'Verified Driver',
          rating: Number(driverRealRating.toFixed(1)),
          reviews: driverRealReviews,
          depTime: data.time || '10:00 AM',
          arrTime: '--:--',
          seatsLeft: data.seatsLeft !== undefined ? data.seatsLeft : 3,
          vehicle: { 
            model: data.vehicle || 'Standard Vehicle', 
            color: 'Unknown', 
            plate: 'Private' 
          },
          rules: ['No smoking', 'Music choice: Shared'],
          features: ['Air conditioning', 'Charging ports'],
          passengers: data.passengers || [],
          passengerIds: data.passengerIds || []
        });
        setIsLoading(false);
      } else {
        setRide(null);
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, [id]);

  // Cleanup GPS watcher on unmount
  useEffect(() => {
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  // 2. Booking Mechanics
  const handleBook = async () => {
    if (!isAuthenticated) return navigate('/auth');
    if (ride.driverId === user?.uid) return toast.error("You cannot book your own ride!");
    if (ride.passengerIds?.includes(user?.uid)) return toast.error("You have already booked a seat.");
    if (ride.seatsLeft <= 0) return toast.error("Sorry, fully booked.");

    setIsBooking(true);
    const loadingId = toast.loading('Securing your seat...');
    try {
      await updateDoc(doc(db, 'rides', id), {
        seatsLeft: ride.seatsLeft - 1,
        passengerIds: arrayUnion(user.uid),
        passengers: arrayUnion({
          uid: user.uid,
          name: user.name || 'Passenger',
          photoURL: user.photoURL || null
        })
      });
      toast.success('Booked successfully!', { id: loadingId });
    } catch (err) {
      toast.error('Failed to book the seat.', { id: loadingId });
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    const loadingId = toast.loading('Cancelling seat...');
    try {
      const updatedPassengers = (ride.passengers || []).filter(p => p.uid !== user.uid);
      await updateDoc(doc(db, 'rides', id), {
        seatsLeft: ride.seatsLeft + 1,
        passengerIds: arrayRemove(user.uid),
        passengers: updatedPassengers
      });
      toast.success('Cancelled successfully!', { id: loadingId });
    } catch (err) {
      toast.error('Failed to cancel.', { id: loadingId });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelRide = async () => {
    if (!window.confirm("Delete this entire ride? All bookings will be lost.")) return;
    setIsCancelling(true);
    const loadingId = toast.loading('Deleting ride...');
    try {
      await deleteDoc(doc(db, 'rides', id));
      toast.success('Ride completely cancelled!', { id: loadingId });
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete.', { id: loadingId });
      setIsCancelling(false);
    }
  };

  // 3. Driver GPS Mechanics
  const handleStartRide = async () => {
    if (!window.confirm("Start the ride and share live GPS location?")) return;
    if ("geolocation" in navigator) {
      const gId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await updateDoc(doc(db, 'rides', ride.id), {
            liveLocation: { lat: latitude, lon: longitude },
            status: 'Started'
          });
        },
        (error) => {
          toast.error("GPS access denied. Ride started without live tracking.");
          updateDoc(doc(db, 'rides', ride.id), { status: 'Started' });
        },
        { enableHighAccuracy: true }
      );
      setWatchId(gId);
      toast.success("Ride Started! Passengers are tracking you.");
    }
  };

  const handleCompleteRide = async () => {
    if (window.confirm("Mark ride as completed?")) {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      await updateDoc(doc(db, 'rides', ride.id), { status: 'Completed', liveLocation: null });
      toast.success("Ride Completed!");
    }
  };

  // 4. Passenger Review Mechanic
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const loadingId = toast.loading('Submitting review...');
    try {
      // Create Review
      await addDoc(collection(db, 'reviews'), {
        rideId: ride.id,
        driverId: ride.driverId,
        passengerId: user.uid,
        passengerName: user.name || 'Verified Rider',
        stars: review.stars,
        comment: review.comment,
        createdAt: new Date()
      });
      
      setReview(prev => ({ ...prev, submitted: true }));
      toast.success('Review verified & submitted!', { id: loadingId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review', { id: loadingId });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="max-w-4xl mx-auto pb-12 text-center pt-20">
        <h2 className="text-2xl font-bold mb-4 text-gray-300">Ride Not Found</h2>
        <p className="text-gray-500 mb-6">This ride may have been deleted or doesn't exist.</p>
        <Link to="/find-ride" className="btn-primary inline-flex">Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Overview Block */}
      <h1 className="text-3xl font-bold mb-6 flex justify-between items-center">
        {ride.date}
        {ride.status === 'Started' && <span className="bg-primary/20 text-primary text-sm px-4 py-1.5 rounded-full flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div> Live Tracker Active</span>}
        {ride.status === 'Completed' && <span className="bg-green-500/20 text-green-400 text-sm px-4 py-1.5 rounded-full flex items-center gap-2">✓ Completed</span>}
      </h1>
      
      {/* Live Map Box for Passengers */}
      {ride.status === 'Started' && ride.liveLocation && ride.driverId !== user?.uid && (
        <div className="w-full h-64 bg-[#1e293b] rounded-2xl overflow-hidden mb-8 relative border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col">
           <div className="absolute top-4 left-4 z-10 bg-darkBg/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-bold flex items-center gap-2 text-white">
             <MapPin className="w-4 h-4 text-primary" /> Driver is en route
           </div>
           {/* Completely Free OpenStreetMap Live GPS Embed */}
           <iframe 
             title="Live GPS"
             width="100%" 
             height="100%" 
             frameBorder="0" 
             scrolling="no" 
             src={`https://www.openstreetmap.org/export/embed.html?bbox=${ride.liveLocation.lon-0.015},${ride.liveLocation.lat-0.015},${ride.liveLocation.lon+0.015},${ride.liveLocation.lat+0.015}&layer=mapnik&marker=${ride.liveLocation.lat},${ride.liveLocation.lon}`}
             className="flex-1 opacity-90 mix-blend-screen"
           ></iframe>
        </div>
      )}

      {/* Ride Details Summary UI */}
      <div className="glass p-6 sm:p-8 rounded-2xl mb-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-8 justify-between">
          <div className="flex-1">
            <div className="flex gap-4">
              <div className="flex flex-col items-center mt-1">
                <span className="text-lg font-bold">{ride.depTime}</span>
                <span className="text-sm text-gray-500 mb-1">1h 30m</span>
                <div className="w-3 h-3 rounded-full bg-primary border-4 border-darkBg shadow-[0_0_0_2px_rgba(59,130,246,0.5)]"></div>
                <div className="w-1 h-16 bg-gradient-to-b from-primary to-purple-500 rounded-full my-2"></div>
                <div className="w-3 h-3 rounded-full bg-purple-500 border-4 border-darkBg shadow-[0_0_0_2px_rgba(168,85,247,0.5)]"></div>
                <span className="text-lg font-bold mt-1 text-gray-400">{ride.arrTime}</span>
              </div>
              
              <div className="flex flex-col justify-between py-8">
                <div>
                  <h3 className="text-2xl font-bold">{ride.source}</h3>
                  <p className="text-gray-400 text-sm mt-1">10 min walk from your saved home location</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{ride.destination}</h3>
                  <p className="text-gray-400 text-sm mt-1">Drop off at Central Station</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 text-center md:text-right">
             <div className="bg-primary/20 text-primary font-semibold px-4 py-1 rounded-full mb-4 text-sm inline-block">
               {ride.seatsLeft} {ride.seatsLeft === 1 ? 'seat' : 'seats'} left
             </div>
             <div className="text-5xl font-extrabold text-white mb-6">
                ₹{ride.price} <span className="text-xl text-gray-400 font-normal">/seat</span>
             </div>
             
             {/* Dynamic Rendering Based on Role and Status */}
             {ride.driverId === user?.uid ? (
               <div className="w-full space-y-3">
                 {ride.status === 'Active' && (
                   <button onClick={handleStartRide} className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2">
                     <Navigation className="w-5 h-5" /> Start Ride
                   </button>
                 )}
                 {ride.status === 'Started' && (
                   <button onClick={handleCompleteRide} className="bg-green-600 hover:bg-green-500 text-white w-full py-4 text-lg font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                     <CheckCircle className="w-5 h-5" /> Finish Journey
                   </button>
                 )}
                 {ride.status === 'Completed' && (
                   <div className="bg-white/5 border border-white/10 text-gray-400 text-center py-4 rounded-xl font-bold w-full">
                     Journey Completed
                   </div>
                 )}
               </div>
             ) : ride.passengerIds?.includes(user?.uid) ? (
               <div className="flex flex-col gap-3 w-full">
                 <div className="bg-green-500/20 border border-green-500/30 text-green-400 text-center py-4 rounded-xl font-bold w-full">
                   ✓ booked seat!
                 </div>
                 {ride.status === 'Active' && (
                   <button onClick={handleCancelBooking} disabled={isCancelling} className="w-full py-2 border border-red-500/50 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50">
                     {isCancelling ? 'Processing...' : 'Cancel Booking'}
                   </button>
                 )}
               </div>
             ) : (
               <button onClick={handleBook} disabled={isBooking || ride.seatsLeft === 0 || ride.status !== 'Active'} className="btn-primary w-full py-4 text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] disabled:opacity-50 disabled:shadow-none">
                 {isBooking ? 'Processing...' : ride.status !== 'Active' ? 'Ride Closed' : ride.seatsLeft === 0 ? 'Fully Booked' : 'Book Seat'}
               </button>
             )}
             
             {ride.driverId !== user?.uid && ride.status === 'Active' && (
               <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-green-400" /> Secure Payment
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Review Modal UI logic for Passengers after Completion */}
      {ride.status === 'Completed' && ride.passengerIds?.includes(user?.uid) && !review.submitted && (
         <div className="glass p-8 rounded-2xl mb-8 border border-white/10 bg-primary/5">
           <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Star className="text-yellow-400 fill-yellow-400" /> Rate your Driver</h2>
           <p className="text-gray-400 text-sm mb-6">Your real honest review shapes the community standards.</p>
           <form onSubmit={handleReviewSubmit}>
             <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    onClick={() => setReview({...review, stars: star})}
                    className={`w-10 h-10 cursor-pointer transition-colors ${star <= review.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`} 
                  />
                ))}
             </div>
             <textarea 
               value={review.comment}
               onChange={(e) => setReview({...review, comment: e.target.value})}
               placeholder="Write a quick comment... (friendly, safe, communicative?)"
               className="input-field w-full h-24 p-4 text-sm mb-4 resize-none"
             ></textarea>
             <button type="submit" className="btn-primary lg:w-1/3 w-full">Submit Review</button>
           </form>
         </div>
      )}

      {/* Layout Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Driver Info */}
          <div className="glass p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Driver Details</h2>
            <div className="flex items-start justify-between">
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-primary to-purple-600">
                  {ride.driver?.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{ride.driver}</h3>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                    <Star className="w-4 h-4 fill-yellow-400" /> {ride.rating} 
                    <span className="text-gray-400 font-normal">({ride.reviews} ratings)</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-400" /> ID Verified
                  </div>
                </div>
              </div>
              <Link to={`/chat/${ride.id}`} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors group">
                <MessageSquare className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="font-semibold mb-2">About Driver</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                "Hi! I regularly commute. I love chatting about tech, start-ups, and movies. Safety is my priority!"
              </p>
            </div>
          </div>

          {/* User Specific - Passenger List for Drivers */}
          {ride.driverId === user?.uid && (
            <div className="glass p-6 text-left">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="text-primary"/> Passenger Manifest</h3>
              {ride.passengers && ride.passengers.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ride.passengers.map((p, idx) => (
                    <li key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-white">{p.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Waiting for passengers to book...</p>
              )}
              {ride.status === 'Active' && (
                 <button onClick={handleCancelRide} disabled={isCancelling} className="w-full mt-6 py-3 border border-red-500/50 text-red-500 rounded-lg font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50">
                    {isCancelling ? 'Processing...' : 'Cancel Entire Ride Listing'}
                 </button>
              )}
            </div>
          )}

        </div>

        <div className="space-y-8">
          {/* Rules & Preferences */}
          <div className="glass p-6">
            <h2 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Ride Preferences</h2>
            <ul className="space-y-4">
              {ride.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="p-1.5 bg-white/5 rounded-full"><Heart className="w-3.5 h-3.5 text-pink-400" /></div>
                  <span className="mt-0.5">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass p-6">
             <button className="w-full py-3 mb-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
               <Shield className="w-4 h-4 text-red-400" /> Report an issue
             </button>
             <p className="text-xs text-center text-gray-500">RideSync ensures strict privacy & safety protocols.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetailsPage;
