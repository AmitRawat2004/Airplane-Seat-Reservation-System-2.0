const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const flightDataService = require('../services/flightDataService');
const Flight = require('../models/Flight');
const FlightTracking = require('../models/FlightTracking');

// Get all flights
router.get('/', async (req, res) => {
  try {
    const flights = await flightDataService.getFlightsFromDatabase();
    res.json({
      success: true,
      data: flights,
      count: flights.length
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flights'
    });
  }
});

// Search flights
router.get('/search', [
  require('express-validator').query('from').optional().isString().trim(),
  require('express-validator').query('to').optional().isString().trim(),
  require('express-validator').query('date').optional().isISO8601(),
  require('express-validator').query('passengers').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { from, to, date, passengers = 1 } = req.query;
    
    const criteria = {
      from: from?.toUpperCase(),
      to: to?.toUpperCase(),
      date: date
    };

    const flights = await flightDataService.searchFlights(criteria);
    
    // Filter flights based on available seats
    const availableFlights = flights.filter(flight => 
      flight.availableSeats >= parseInt(passengers)
    );

    res.json({
      success: true,
      data: availableFlights,
      count: availableFlights.length,
      searchCriteria: criteria
    });
  } catch (error) {
    console.error('Error searching flights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search flights'
    });
  }
});

// Get flight by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const flight = await Flight.findOne({ id }).lean();

    if (!flight) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    const flightData = {
      id: flight.id,
      flightNumber: flight.flight_number,
      airline: flight.airline,
      departure: {
        airport: flight.departure_airport,
        city: flight.departure_city,
        time: flight.departure_time,
        date: flight.departure_date
      },
      arrival: {
        airport: flight.arrival_airport,
        city: flight.arrival_city,
        time: flight.arrival_time,
        date: flight.arrival_date
      },
      duration: flight.duration,
      price: flight.base_price,
      availableSeats: flight.available_seats,
      aircraft: flight.aircraft,
      status: flight.status,
      createdAt: flight.created_at,
      updatedAt: flight.updated_at
    };

    res.json({
      success: true,
      data: flightData
    });
  } catch (error) {
    console.error('Error fetching flight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flight'
    });
  }
});

// Get real-time flight data
router.get('/real-time/status', async (req, res) => {
  try {
    const realTimeFlights = await flightDataService.getRealTimeFlights();
    
    res.json({
      success: true,
      data: realTimeFlights,
      count: realTimeFlights.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time flight data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time flight data'
    });
  }
});

// Get flight tracking data
router.get('/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;

    const trackingData = await FlightTracking.find({ flight_id: id })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: trackingData,
      count: trackingData.length
    });
  } catch (error) {
    console.error('Error fetching flight tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flight tracking data'
    });
  }
});

// Create new flight (admin only)
router.post('/', [
  body('flightNumber').isString().trim().notEmpty(),
  body('airline').isString().trim().notEmpty(),
  body('departureAirport').isString().trim().notEmpty(),
  body('departureCity').isString().trim().notEmpty(),
  body('departureTime').isString().trim().notEmpty(),
  body('departureDate').isDate(),
  body('arrivalAirport').isString().trim().notEmpty(),
  body('arrivalCity').isString().trim().notEmpty(),
  body('arrivalTime').isString().trim().notEmpty(),
  body('arrivalDate').isDate(),
  body('duration').isString().trim().notEmpty(),
  body('basePrice').isFloat({ min: 0 }),
  body('availableSeats').isInt({ min: 0 }),
  body('aircraft').isString().trim().notEmpty()
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
      flightNumber,
      airline,
      departureAirport,
      departureCity,
      departureTime,
      departureDate,
      arrivalAirport,
      arrivalCity,
      arrivalTime,
      arrivalDate,
      duration,
      basePrice,
      availableSeats,
      aircraft
    } = req.body;

    const flightId = `FL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await Flight.create({
      id: flightId,
      flight_number: flightNumber,
      airline,
      departure_airport: departureAirport,
      departure_city: departureCity,
      departure_time: departureTime,
      departure_date: departureDate,
      arrival_airport: arrivalAirport,
      arrival_city: arrivalCity,
      arrival_time: arrivalTime,
      arrival_date: arrivalDate,
      duration,
      base_price: basePrice,
      available_seats: availableSeats,
      aircraft,
      status: 'On Time'
    });

    res.status(201).json({
      success: true,
      message: 'Flight created successfully',
      data: { id: flightId }
    });
  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create flight'
    });
  }
});

// Update flight status
router.patch('/:id/status', [
  body('status').isIn(['On Time', 'Delayed', 'Cancelled', 'Boarding', 'Departed', 'Arrived'])
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

    const result = await Flight.updateOne({ id }, { $set: { status } });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Flight not found'
      });
    }

    res.json({
      success: true,
      message: 'Flight status updated successfully'
    });
  } catch (error) {
    console.error('Error updating flight status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update flight status'
    });
  }
});

module.exports = router;
