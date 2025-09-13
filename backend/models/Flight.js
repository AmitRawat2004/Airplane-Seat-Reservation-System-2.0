const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  flight_number: { type: String, required: true, index: true },
  airline: { type: String, required: true },
  departure_airport: { type: String, required: true, index: true },
  departure_city: { type: String, required: true },
  departure_time: { type: String, required: true },
  departure_date: { type: String, required: true, index: true },
  arrival_airport: { type: String, required: true, index: true },
  arrival_city: { type: String, required: true },
  arrival_time: { type: String, required: true },
  arrival_date: { type: String, required: true },
  duration: { type: String, required: true },
  base_price: { type: Number, required: true },
  available_seats: { type: Number, required: true },
  aircraft: { type: String, required: true },
  status: { type: String, default: 'On Time' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.models.Flight || mongoose.model('Flight', FlightSchema);


