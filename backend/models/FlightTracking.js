const mongoose = require('mongoose');

const FlightTrackingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  flight_id: { type: String, required: true, index: true },
  latitude: { type: Number },
  longitude: { type: Number },
  altitude: { type: Number },
  speed: { type: Number },
  heading: { type: Number },
  status: { type: String }
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

module.exports = mongoose.models.FlightTracking || mongoose.model('FlightTracking', FlightTrackingSchema);


