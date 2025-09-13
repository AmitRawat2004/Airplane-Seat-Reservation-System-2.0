const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Seat = require('../models/Seat');
const Flight = require('../models/Flight');

// Get seats for a specific flight
router.get('/flight/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params;

    const seats = await Seat.find({ flight_id: flightId })
      .sort({ row_number: 1, column_letter: 1 })
      .lean();

    const formattedSeats = seats.map(seat => ({
      id: seat.id,
      row: seat.row_number,
      column: seat.column_letter,
      status: seat.status,
      price: seat.price,
      class: seat.class,
      createdAt: seat.created_at,
      updatedAt: seat.updated_at
    }));

    res.json({
      success: true,
      data: formattedSeats,
      count: formattedSeats.length
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seats'
    });
  }
});

// Get seat by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await Seat.findOne({ id }).lean();
    if (!seat) {
      return res.status(404).json({
        success: false,
        error: 'Seat not found'
      });
    }

    const seatData = {
      id: seat.id,
      row: seat.row_number,
      column: seat.column_letter,
      status: seat.status,
      price: seat.price,
      class: seat.class,
      flightId: seat.flight_id,
      createdAt: seat.created_at,
      updatedAt: seat.updated_at
    };

    res.json({
      success: true,
      data: seatData
    });
  } catch (error) {
    console.error('Error fetching seat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seat'
    });
  }
});

// Update seat status (for selection/deselection)
router.patch('/:id/status', [
  body('status').isIn(['available', 'occupied', 'selected', 'premium'])
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

    const seat = await Seat.findOne({ id }).lean();
    if (!seat) {
      return res.status(404).json({
        success: false,
        error: 'Seat not found'
      });
    }

    if (seat.status === 'occupied' && status !== 'occupied') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify occupied seat'
      });
    }

    await Seat.updateOne({ id }, { $set: { status } });

    if (status === 'occupied') {
      await Flight.updateOne({ id: seat.flight_id }, { $inc: { available_seats: -1 } });
    } else if (seat.status === 'occupied' && status !== 'occupied') {
      await Flight.updateOne({ id: seat.flight_id }, { $inc: { available_seats: 1 } });
    }

    res.json({
      success: true,
      message: 'Seat status updated successfully',
      data: { id, status }
    });
  } catch (error) {
    console.error('Error updating seat status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update seat status'
    });
  }
});

// Bulk update seat status (for booking confirmation)
router.patch('/bulk-status', [
  body('seatIds').isArray({ min: 1 }),
  body('status').isIn(['available', 'occupied', 'selected', 'premium'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { seatIds, status } = req.body;

    await Seat.updateMany({ id: { $in: seatIds } }, { $set: { status } });

    const seats = await Seat.find({ id: { $in: seatIds } }, { flight_id: 1, status: 1 }).lean();
    const flightUpdates = {};
    seats.forEach(seat => {
      if (!flightUpdates[seat.flight_id]) {
        flightUpdates[seat.flight_id] = { occupied: 0, available: 0 };
      }
      if (status === 'occupied') {
        flightUpdates[seat.flight_id].occupied++;
      } else if (seat.status === 'occupied' && status !== 'occupied') {
        flightUpdates[seat.flight_id].available++;
      }
    });

    for (const [flightId, counts] of Object.entries(flightUpdates)) {
      const netChange = counts.available - counts.occupied;
      if (netChange !== 0) {
        await Flight.updateOne({ id: flightId }, { $inc: { available_seats: netChange } });
      }
    }

    res.json({
      success: true,
      message: 'Seats updated successfully',
      data: { updatedCount: seatIds.length, status }
    });
  } catch (error) {
    console.error('Error bulk updating seats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update seats'
    });
  }
});

// Create seats for a flight
router.post('/flight/:flightId', [
  body('seats').isArray({ min: 1 }),
  body('seats.*.row').isInt({ min: 1 }),
  body('seats.*.column').isString().trim().notEmpty(),
  body('seats.*.price').isFloat({ min: 0 }),
  body('seats.*.class').isIn(['economy', 'business', 'first'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { flightId } = req.params;
    const { seats } = req.body;

    const flight = await Flight.findOne({ id: flightId }).lean();
    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    const docs = seats.map(seat => ({
      id: `${flightId}-${seat.row}${seat.column}`,
      flight_id: flightId,
      row_number: seat.row,
      column_letter: seat.column,
      status: 'available',
      price: seat.price,
      class: seat.class
    }));
    await Seat.insertMany(docs, { ordered: false });

    res.status(201).json({
      success: true,
      message: 'Seats created successfully',
      data: { createdCount: seats.length }
    });
  } catch (error) {
    console.error('Error creating seats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create seats'
    });
  }
});

// Get seat availability summary for a flight
router.get('/flight/:flightId/availability', async (req, res) => {
  try {
    const { flightId } = req.params;

    const seats = await Seat.find({ flight_id: flightId }, { class: 1, status: 1 }).lean();

    const availability = {
      economy: { available: 0, occupied: 0, selected: 0 },
      business: { available: 0, occupied: 0, selected: 0 },
      first: { available: 0, occupied: 0, selected: 0 }
    };

    seats.forEach(seat => {
      if (availability[seat.class]) {
        availability[seat.class][seat.status] = (availability[seat.class][seat.status] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seat availability'
    });
  }
});

// Reserve seats temporarily (for seat selection)
router.post('/reserve', [
  body('seatIds').isArray({ min: 1 }),
  body('duration').isInt({ min: 300, max: 900 }) // 5-15 minutes
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { seatIds, duration = 600 } = req.body; // Default 10 minutes

    const seats = await Seat.find({ id: { $in: seatIds } }, { id: 1, status: 1 }).lean();
    const unavailableSeats = seats.filter(seat => seat.status !== 'available');
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Some seats are not available',
        data: { unavailableSeats: unavailableSeats.map(s => s.id) }
      });
    }

    await Seat.updateMany({ id: { $in: seatIds } }, { $set: { status: 'selected' } });

    setTimeout(async () => {
      try {
        await Seat.updateMany(
          { id: { $in: seatIds }, status: 'selected' },
          { $set: { status: 'available' } }
        );
        console.log(`Seats ${seatIds.join(', ')} automatically released`);
      } catch (error) {
        console.error('Error auto-releasing seats:', error);
      }
    }, duration * 1000);

    res.json({
      success: true,
      message: 'Seats reserved successfully',
      data: { 
        seatIds, 
        reservedUntil: new Date(Date.now() + duration * 1000).toISOString() 
      }
    });
  } catch (error) {
    console.error('Error reserving seats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reserve seats'
    });
  }
});

module.exports = router;
