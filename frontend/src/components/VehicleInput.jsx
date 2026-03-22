import React from 'react';
import { Car } from 'lucide-react';

const VEHICLES = [
  { model: 'Select a vehicle...', capacity: '' },
  { model: 'Maruti Suzuki Swift', capacity: 4 },
  { model: 'Hyundai i20', capacity: 4 },
  { model: 'Tata Nexon', capacity: 4 },
  { model: 'Kia Seltos', capacity: 4 },
  { model: 'Honda City', capacity: 4 },
  { model: 'Toyota Innova Crysta', capacity: 6 },
  { model: 'Mahindra XUV700', capacity: 6 },
  { model: 'Royal Enfield Classic (Bike)', capacity: 1 },
  { model: 'KTM Duke (Bike)', capacity: 1 }
];

const VehicleInput = ({ value, onSelect, className = "" }) => {
  const handleChange = (e) => {
    const selectedModel = e.target.value;
    const vehicle = VEHICLES.find(v => v.model === selectedModel);
    if (vehicle && selectedModel !== 'Select a vehicle...') {
      onSelect(selectedModel, vehicle.capacity);
    } else {
      onSelect('', '');
    }
  };

  return (
    <div className="relative w-full">
      <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <select 
        value={value || 'Select a vehicle...'}
        onChange={handleChange}
        className={`input-field pl-10 appearance-none bg-[#1e2536] text-white w-full border border-white/10 rounded-lg cursor-pointer focus:ring-primary focus:border-primary ${className}`}
        required
      >
        {VEHICLES.map((v, index) => (
          <option key={index} value={v.model} disabled={index === 0}>
            {v.model} {index > 0 ? `(Max ${v.capacity} Seats)` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VehicleInput;
