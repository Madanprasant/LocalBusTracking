const express = require('express');
const Bus = require('../models/Bus');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all buses (public)
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find({ isActive: true }).sort({ routeName: 1 });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single bus (public)
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findOne({ id: req.params.id, isActive: true });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create bus (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const busData = req.body;
    
    // Check if bus ID already exists
    const existingBus = await Bus.findOne({ id: busData.id });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus ID already exists' });
    }

    const bus = new Bus(busData);
    await bus.save();
    
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update bus (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const bus = await Bus.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete bus (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const bus = await Bus.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false },
      { new: true }
    );
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    res.json({ message: 'Bus deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
