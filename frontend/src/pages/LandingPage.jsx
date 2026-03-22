import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Shield, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
      {/* Hero Section */}
      <div className="w-full text-center mt-10 mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
        >
          Travel Smarter <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            Together
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          RideSync connects you with trusted drivers and passengers heading your way. 
          Save money, reduce emissions, and make new connections.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/find-ride" className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-lg">
            <Search className="w-5 h-5" />
            Find a Ride
          </Link>
          <Link to="/offer-ride" className="glass hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-lg">
            Offer a Ride
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-10">
        <FeatureCard 
          icon={<Shield className="w-8 h-8 text-primary" />}
          title="Verified Profiles"
          description="Every member is verified for a safe and secure journey."
          delay={0.6}
        />
        <FeatureCard 
          icon={<MapPin className="w-8 h-8 text-purple-400" />}
          title="AI Route Matching"
          description="Find the perfect match along your exact travel route automatically."
          delay={0.7}
        />
        <FeatureCard 
          icon={<Clock className="w-8 h-8 text-green-400" />}
          title="Real-Time Updates"
          description="Live tracking and instant chat to keep you synced with your ride."
          delay={0.8}
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass p-6 hover:-translate-y-2 transition-transform duration-300"
  >
    <div className="p-3 bg-white/5 w-max rounded-xl mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

export default LandingPage;
