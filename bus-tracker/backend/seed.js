const mongoose = require('mongoose');
const Bus = require('./models/Bus');
require('dotenv').config();

const busData = [
  {
    id: "ERD-101",
    routeName: "Perundurai ↔ Erode Central",
    origin: "Perundurai",
    destination: "Erode Central Bus Stand",
    stops: [
      { name: "Perundurai", coordinates: { lat: 11.2700, lng: 77.5900 } },
      { name: "Kangeyam Road", coordinates: { lat: 11.2800, lng: 77.6000 } },
      { name: "Nanjanapuram", coordinates: { lat: 11.2900, lng: 77.6100 } },
      { name: "GH Roundana", coordinates: { lat: 11.3000, lng: 77.6200 } },
      { name: "Erode Central", coordinates: { lat: 11.3100, lng: 77.6300 } }
    ],
    departureTime: "06:45",
    arrivalTime: "07:25",
    frequencyMins: 15,
    fare: 18,
    operator: "TNSTC"
  },
  {
    id: "ERD-205",
    routeName: "Bhavani ↔ Erode Central",
    origin: "Bhavani",
    destination: "Erode Central Bus Stand",
    stops: [
      { name: "Bhavani", coordinates: { lat: 11.4500, lng: 77.6800 } },
      { name: "Komarapalayam Bridge", coordinates: { lat: 11.4200, lng: 77.6700 } },
      { name: "Solar", coordinates: { lat: 11.3800, lng: 77.6600 } },
      { name: "CAK Town", coordinates: { lat: 11.3500, lng: 77.6500 } },
      { name: "Erode Central", coordinates: { lat: 11.3100, lng: 77.6300 } }
    ],
    departureTime: "07:10",
    arrivalTime: "07:50",
    frequencyMins: 12,
    fare: 22,
    operator: "TNSTC"
  },
  {
    id: "ERD-318",
    routeName: "Sathyamangalam ↔ Erode Central",
    origin: "Sathyamangalam",
    destination: "Erode Central Bus Stand",
    stops: [
      { name: "Sathyamangalam", coordinates: { lat: 11.5200, lng: 77.2500 } },
      { name: "Athani", coordinates: { lat: 11.4800, lng: 77.3500 } },
      { name: "Arachalur", coordinates: { lat: 11.4200, lng: 77.4500 } },
      { name: "Solar", coordinates: { lat: 11.3800, lng: 77.6600 } },
      { name: "Erode Central", coordinates: { lat: 11.3100, lng: 77.6300 } }
    ],
    departureTime: "07:30",
    arrivalTime: "08:35",
    frequencyMins: 20,
    fare: 35,
    operator: "TNSTC"
  },
  {
    id: "ERD-412",
    routeName: "Gobichettipalayam ↔ Erode Central",
    origin: "Gobichettipalayam",
    destination: "Erode Central Bus Stand",
    stops: [
      { name: "Gobi", coordinates: { lat: 11.4500, lng: 77.4500 } },
      { name: "Appakudal", coordinates: { lat: 11.4200, lng: 77.5000 } },
      { name: "Bhavani", coordinates: { lat: 11.4500, lng: 77.6800 } },
      { name: "Solar", coordinates: { lat: 11.3800, lng: 77.6600 } },
      { name: "Erode Central", coordinates: { lat: 11.3100, lng: 77.6300 } }
    ],
    departureTime: "08:00",
    arrivalTime: "09:05",
    frequencyMins: 15,
    fare: 40,
    operator: "TNSTC"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erode-bus-tracker');
    console.log('Connected to MongoDB');
    
    // Clear existing buses
    await Bus.deleteMany({});
    console.log('Cleared existing buses');
    
    // Insert new buses
    await Bus.insertMany(busData);
    console.log('Seeded database with bus data');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
