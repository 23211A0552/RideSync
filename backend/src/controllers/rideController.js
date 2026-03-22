// Mock ride controller

// Dummy data for mock rides
let rides = [
  { id: '1', driverId: 'user1', source: 'Downtown', destination: 'Airport', seats: 3, price: 15, date: '2026-03-25T10:00:00Z', passengers: [] },
  { id: '2', driverId: 'user2', source: 'Tech Park', destination: 'City Center', seats: 2, price: 5, date: '2026-03-25T18:00:00Z', passengers: [] }
];

exports.createRide = async (req, res) => {
  try {
    const rideData = req.body;
    const newRide = { id: Date.now().toString(), ...rideData, passengers: [] };
    rides.push(newRide);
    res.status(201).json({ success: true, data: newRide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRides = async (req, res) => {
  try {
    // Optional filters: source, destination, date
    // For now we just return mock rides
    res.status(200).json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const ride = rides.find(r => r.id === req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });
    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bookRide = async (req, res) => {
  try {
    const rideId = req.params.id;
    const userId = req.user?.uid || 'guest'; // from verifyToken dummy

    const rideIndex = rides.findIndex(r => r.id === rideId);
    if (rideIndex === -1) return res.status(404).json({ success: false, message: "Ride not found" });

    if (rides[rideIndex].seats > 0) {
      rides[rideIndex].seats -= 1;
      rides[rideIndex].passengers.push(userId);
      res.status(200).json({ success: true, message: "Seat booked successfully!", data: rides[rideIndex] });
    } else {
      res.status(400).json({ success: false, message: "No seats available" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
