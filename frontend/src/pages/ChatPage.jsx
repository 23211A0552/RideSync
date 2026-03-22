import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Phone, ArrowLeft, MoreVertical, ShieldAlert } from 'lucide-react';

const ChatPage = () => {
  const { rideId } = useParams();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Alex Johnson', text: 'Hey! Looking forward to the ride tomorrow.', time: '10:00 AM', isMe: false },
    { id: 2, sender: 'Me', text: 'Hi Alex! Me too. Are we still meeting at the main entrance?', time: '10:05 AM', isMe: true },
    { id: 3, sender: 'Alex Johnson', text: 'Yes, I will be in a gray Tesla. Look for plate ABC-1234.', time: '10:10 AM', isMe: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'Me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Mock reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'Alex Johnson',
        text: 'Got it. See you then!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }]);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)]">
      <div className="glass h-full flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link to={`/ride/${rideId}`} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Driver" className="w-10 h-10 rounded-full bg-gray-700" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e293b] rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none">Alex Johnson</h2>
              <span className="text-xs text-gray-400">Driver • Ride #{rideId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-primary" title="Audio Call (Coming soon)">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400" title="SOS Emergency">
              <ShieldAlert className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-darkBg/50">
          <div className="text-center">
            <span className="text-xs font-semibold px-3 py-1 bg-white/5 rounded-full text-gray-400">Today</span>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col max-w-[75%] ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
               <span className="text-xs text-gray-500 mb-1 ml-1">{msg.isMe ? '' : msg.sender}</span>
               <div className={`px-4 py-2.5 rounded-2xl ${msg.isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm border border-white/5'}`}>
                 <p className="text-sm">{msg.text}</p>
               </div>
               <span className="text-[10px] text-gray-500 mt-1 mr-1">{msg.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-darkBg border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder-gray-500"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-primary hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors flex items-center justify-center shadow-lg shadow-primary/20 shrink-0"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
