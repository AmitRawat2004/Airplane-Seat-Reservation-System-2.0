const mongoose = require('mongoose');

const AirportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.models.Airport || mongoose.model('Airport', AirportSchema);


