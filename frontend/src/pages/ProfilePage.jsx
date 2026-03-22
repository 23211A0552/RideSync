import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { User, Mail, Phone, MapPin, Edit2, Camera, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'User Name',
    email: user?.email || 'user@example.com',
    phone: '+91 98765 43210',
    bio: 'Love sharing rides and meeting new people!',
    location: 'Hyderabad, TS',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Submit update to backend mock
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="glass p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full border-4 border-darkBg overflow-hidden bg-gray-800 shadow-xl">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/50">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
              MEMBER
            </span>
          </div>

          {/* User Info Form/Display */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold">Personal Information</h2>
               <button 
                 onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                 className="flex items-center gap-2 text-sm text-primary hover:text-white transition-colors"
               >
                 {isEditing ? <span className="font-semibold bg-primary text-white px-3 py-1 rounded-md">Save</span> : <><Edit2 className="w-4 h-4"/> Edit</>}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                ) : (
                  <div className="flex items-center gap-2 font-medium text-lg"><User className="w-5 h-5 text-gray-500"/> {profile.name}</div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email <span className="text-xs text-green-400 ml-2">(Verified)</span></label>
                {isEditing ? (
                  <input type="email" className="input-field" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                ) : (
                  <div className="flex items-center gap-2 font-medium"><Mail className="w-5 h-5 text-gray-500"/> {profile.email}</div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                {isEditing ? (
                  <input type="tel" className="input-field" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                ) : (
                  <div className="flex items-center gap-2 font-medium"><Phone className="w-5 h-5 text-gray-500"/> {profile.phone}</div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} />
                ) : (
                  <div className="flex items-center gap-2 font-medium"><MapPin className="w-5 h-5 text-gray-500"/> {profile.location}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Bio</label>
              {isEditing ? (
                <textarea className="input-field h-24 resize-none" value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})}></textarea>
              ) : (
                <div className="bg-white/5 p-4 rounded-lg text-sm italic border border-white/5">"{profile.bio}"</div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass p-6">
           <h3 className="font-bold text-lg mb-4">Account Settings</h3>
           <div className="space-y-2">
             <button className="w-full text-left p-3 hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center group">
               <span>Notification Preferences</span>
               <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
             </button>
             <button className="w-full text-left p-3 hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center group">
               <span>Payment Methods</span>
               <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
             </button>
             <button className="w-full text-left p-3 hover:bg-white/5 rounded-lg transition-colors flex justify-between items-center group">
               <span>Privacy & Security</span>
               <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
             </button>
           </div>
         </div>
         
         <div className="glass p-6 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
           <h3 className="font-bold text-lg mb-4 text-red-500">Danger Zone</h3>
           <p className="text-sm text-gray-400 mb-6">Irreversible and destructive actions</p>
           
           <button 
             onClick={logout}
             className="w-full mb-3 py-3 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors rounded-lg font-semibold flex justify-center items-center gap-2"
           >
             <LogOut className="w-5 h-5" /> Sign out
           </button>
           
           <button className="w-full py-3 text-sm text-gray-500 hover:text-red-400 hover:underline transition-colors text-center">
             Delete my account permanently
           </button>
         </div>
      </div>
    </div>
  );
};

export default ProfilePage;
