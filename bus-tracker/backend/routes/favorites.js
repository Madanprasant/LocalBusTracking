const express = require('express');
const User = require('../models/User');
const Bus = require('../models/Bus');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's favorite buses
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    const favoriteBuses = await Bus.find({ 
      id: { $in: user.favorites },
      isActive: true 
    });
    
    res.json(favoriteBuses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add bus to favorites
router.post('/:busId', auth, async (req, res) => {
  try {
    const { busId } = req.params;
    
    // Check if bus exists
    const bus = await Bus.findOne({ id: busId, isActive: true });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    // Check if already in favorites
    const user = await User.findById(req.user._id);
    if (user.favorites.includes(busId)) {
      return res.status(400).json({ message: 'Bus already in favorites' });
    }
    
    // Add to favorites
    user.favorites.push(busId);
    await user.save();
    
    res.json({ message: 'Bus added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove bus from favorites
router.delete('/:busId', auth, async (req, res) => {
  try {
    const { busId } = req.params;
    
    const user = await User.findById(req.user._id);
    const index = user.favorites.indexOf(busId);
    
    if (index === -1) {
      return res.status(400).json({ message: 'Bus not in favorites' });
    }
    
    user.favorites.splice(index, 1);
    await user.save();
    
    res.json({ message: 'Bus removed from favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
