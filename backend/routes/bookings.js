const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ created_at: -1 }).lean();

    const flightIds = [...new Set(bookings.map(b => b.flight_id))];
    const seatIds = [...new Set(bookings.map(b => b.seat_id))];
    const flights = await Flight.find({ id: { $in: flightIds } }).lean();
    const seats = await Seat.find({ id: { $in: seatIds } }).lean();
    const flightMap = Object.fromEntries(flights.map(f => [f.id, f]));
    const seatMap = Object.fromEntries(seats.map(s => [s.id, s]));

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.booking_reference,
      passengerName: booking.passenger_name,
      passengerEmail: booking.passenger_email,
      passengerPhone: booking.passenger_phone,
      flight: (() => {
        const f = flightMap[booking.flight_id];
        return f ? {
          id: f.id,
          flightNumber: f.flight_number,
          airline: f.airline,
          departureAirport: f.departure_airport,
          arrivalAirport: f.arrival_airport,
          departureDate: f.departure_date,
          departureTime: f.departure_time
        } : null;
      })(),
      seat: (() => {
        const s = seatMap[booking.seat_id];
        return s ? { id: s.id, row: s.row_number, column: s.column_letter } : null;
      })(),
      totalPrice: booking.total_price,
      status: booking.status,
      paymentMethod: booking.payment_method,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at
    }));

    res.json({
      success: true,
      data: formattedBookings,
      count: formattedBookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ id }).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const flight = await Flight.findOne({ id: booking.flight_id }).lean();
    const seat = await Seat.findOne({ id: booking.seat_id }).lean();

    const bookingData = {
      id: booking.id,
      bookingReference: booking.booking_reference,
      passengerName: booking.passenger_name,
      passengerEmail: booking.passenger_email,
      passengerPhone: booking.passenger_phone,
      flight: {
        id: flight?.id,
        flightNumber: flight?.flight_number,
        airline: flight?.airline,
        departure: {
          airport: flight?.departure_airport,
          city: flight?.departure_city,
          time: flight?.departure_time,
          date: flight?.departure_date
        },
        arrival: {
          airport: flight?.arrival_airport,
          city: flight?.arrival_city,
          time: flight?.arrival_time,
          date: flight?.arrival_date
        },
        duration: flight?.duration
      },
      seat: {
        id: seat?.id,
        row: seat?.row_number,
        column: seat?.column_letter,
        class: seat?.class
      },
      totalPrice: booking.total_price,
      status: booking.status,
      paymentMethod: booking.payment_method,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at
    };

    res.json({
      success: true,
      data: bookingData
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    });
  }
});

// Create new booking
router.post('/', [
  body('flightId').isString().trim().notEmpty(),
  body('passengerName').isString().trim().notEmpty(),
  body('passengerEmail').isEmail(),
  body('passengerPhone').optional().isString().trim(),
  body('seatId').isString().trim().notEmpty(),
  body('totalPrice').isFloat({ min: 0 }),
  body('paymentMethod').isString().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      flightId,
      passengerName,
      passengerEmail,
      passengerPhone,
      seatId,
      totalPrice,
      paymentMethod
    } = req.body;

    const flight = await Flight.findOne({ id: flightId }).lean();
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    // Check if seat exists and is available
    const seat = await Seat.findOne({ id: seatId, flight_id: flightId }).lean();
    if (!seat) {
      return res.status(404).json({
        success: false,
        error: 'Seat not found'
      });
    }

    if (seat.status !== 'available' && seat.status !== 'selected') {
      return res.status(400).json({
        success: false,
        error: 'Seat is not available'
      });
    }

    // Generate booking reference
    const bookingReference = `SKY${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create booking and update seat/flight
    const bookingId = uuidv4();
    await Booking.create({
      id: bookingId,
      flight_id: flightId,
      passenger_name: passengerName,
      passenger_email: passengerEmail,
      passenger_phone: passengerPhone,
      seat_id: seatId,
      total_price: totalPrice,
      status: 'confirmed',
      payment_method: paymentMethod,
      booking_reference: bookingReference
    });

    await Seat.updateOne({ id: seatId }, { $set: { status: 'occupied' } });
    await Flight.updateOne({ id: flightId }, { $inc: { available_seats: -1 } });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        id: bookingId,
        bookingReference,
        status: 'confirmed'
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
});

// Update booking status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOne({ id }).lean();
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    await Booking.updateOne({ id }, { $set: { status } });

    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await Seat.updateOne({ id: booking.seat_id }, { $set: { status: 'available' } });
      await Flight.updateOne({ id: booking.flight_id }, { $inc: { available_seats: 1 } });
    } else if (booking.status === 'cancelled' && status !== 'cancelled') {
      await Seat.updateOne({ id: booking.seat_id }, { $set: { status: 'occupied' } });
      await Flight.updateOne({ id: booking.flight_id }, { $inc: { available_seats: -1 } });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { id, status }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status'
    });
  }
});

// Get bookings by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const bookings = await Booking.find({ passenger_email: email }).sort({ created_at: -1 }).lean();
    const flightIds = [...new Set(bookings.map(b => b.flight_id))];
    const seatIds = [...new Set(bookings.map(b => b.seat_id))];
    const flights = await Flight.find({ id: { $in: flightIds } }).lean();
    const seats = await Seat.find({ id: { $in: seatIds } }).lean();
    const flightMap = Object.fromEntries(flights.map(f => [f.id, f]));
    const seatMap = Object.fromEntries(seats.map(s => [s.id, s]));

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.booking_reference,
      passengerName: booking.passenger_name,
      passengerEmail: booking.passenger_email,
      passengerPhone: booking.passenger_phone,
      flight: (() => {
        const f = flightMap[booking.flight_id];
        return f ? {
          id: f.id,
          flightNumber: f.flight_number,
          airline: f.airline,
          departureAirport: f.departure_airport,
          arrivalAirport: f.arrival_airport,
          departureDate: f.departure_date,
          departureTime: f.departure_time
        } : null;
      })(),
      seat: (() => {
        const s = seatMap[booking.seat_id];
        return s ? { id: s.id, row: s.row_number, column: s.column_letter } : null;
      })(),
      totalPrice: booking.total_price,
      status: booking.status,
      paymentMethod: booking.payment_method,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at
    }));

    res.json({
      success: true,
      data: formattedBookings,
      count: formattedBookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings by email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({ id }).lean();
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }

    await Booking.updateOne({ id }, { $set: { status: 'cancelled' } });
    await Seat.updateOne({ id: booking.seat_id }, { $set: { status: 'available' } });
    await Flight.updateOne({ id: booking.flight_id }, { $inc: { available_seats: 1 } });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { id, status: 'cancelled' }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
});

module.exports = router;
