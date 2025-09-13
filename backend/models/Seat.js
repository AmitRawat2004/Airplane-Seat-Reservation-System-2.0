const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  flight_id: { type: String, required: true, index: true },
  row_number: { type: Number, required: true },
  column_letter: { type: String, required: true },
  status: { type: String, enum: ['available', 'occupied', 'selected', 'premium'], default: 'available' },
  price: { type: Number, required: true },
  class: { type: String, enum: ['economy', 'business', 'first'], default: 'economy' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

SeatSchema.index({ flight_id: 1, row_number: 1, column_letter: 1 }, { unique: true });

module.exports = mongoose.models.Seat || mongoose.model('Seat', SeatSchema);


