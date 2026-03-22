import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const TELANGANA_LOCATIONS = [
  'Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 
  'Khammam', 'Mahbubnagar', 'Ramagundam', 'Hitec City', 'Madhapur', 
  'Gachibowli', 'Kukatpally', 'Banjara Hills', 'Jubilee Hills', 'Uppal', 
  'L.B. Nagar', 'Dilsukhnagar', 'Patancheru', 'Kondapur', 'Shamshabad'
];

const LocationInput = ({ placeholder, value, onChange, name, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(e); // Propagate up
    
    if (inputValue.length > 0) {
      const filtered = TELANGANA_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredLocations(filtered);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (location) => {
    // Create a synthetic event object to pass to onChange
    onChange({ target: { name, value: location } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder} 
          className={`input-field pl-10 ${className}`}
          required 
          autoComplete="off"
          onFocus={() => { if (value && filteredLocations.length > 0) setIsOpen(true); }}
        />
      </div>
      
      {/* Dropdown menu */}
      {isOpen && filteredLocations.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {filteredLocations.map((loc, index) => (
            <li 
              key={index}
              onClick={() => handleSelect(loc)}
              className="px-4 py-3 hover:bg-white/10 cursor-pointer text-gray-200 text-sm transition-colors border-b border-white/5 last:border-none flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-primary" />
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;
