const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  flight_id: { type: String, required: true, index: true },
  passenger_name: { type: String, required: true },
  passenger_email: { type: String, required: true, index: true },
  passenger_phone: { type: String },
  seat_id: { type: String, required: true },
  total_price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  payment_method: { type: String },
  booking_reference: { type: String, unique: true, index: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);


