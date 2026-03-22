// Mock user controller since Firebase is not fully configured yet.
const { db } = require('../config/firebase');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    // Mock DB logic
    const user = { id: userId, name: "Sample User", email: "user@example.com", isDriver: false, rating: 4.8 };
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    // Mock DB logic
    res.status(200).json({ success: true, data: { id: userId, ...updateData }, message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
