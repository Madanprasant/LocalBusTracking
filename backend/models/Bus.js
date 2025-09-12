const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  routeName: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  stops: [{
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    passed: {
      type: Boolean,
      default: false
    },
    etas: [{
      timestamp: Date,
      eta: String
    }]
  }],
  currentLocation: {
    coordinates: {
      lat: Number,
      lng: Number
    },
    lastUpdated: Date,
    bearing: Number,
    speed: Number // in km/h
  },
  path: [{
    lat: Number,
    lng: Number
  }],
  departureTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  arrivalTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  frequencyMins: {
    type: Number,
    required: true,
    min: 1
  },
  fare: {
    type: Number,
    required: true,
    min: 0
  },
  operator: {
    type: String,
    required: true
  },
  averageSpeed: {
    type: Number,
    default: 40, // Default average speed in km/h
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);
