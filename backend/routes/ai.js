const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const geminiService = require('../services/geminiService');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

router.post('/pricing/dynamic', [
  body('flightId').isString().notEmpty(),
  body('marketConditions').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { flightId, marketConditions = {} } = req.body;
    const flight = await Flight.findOne({ id: flightId });
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });

    const seats = await Seat.find({ flight_id: flightId });
    const seatData = seats.reduce((acc, seat) => {
      if (!acc[seat.class]) acc[seat.class] = [];
      acc[seat.class].push({
        id: seat.id,
        row: seat.row_number,
        column: seat.column_letter,
        currentPrice: seat.price,
        status: seat.status
      });
      return acc;
    }, {});

    const pricingRecommendations = await geminiService.getDynamicPricing(
      flight,
      seatData,
      {
        ...marketConditions,
        timeUntilDeparture: new Date(flight.departureDate) - new Date(),
        currentBookings: await Booking.countDocuments({ flightId, status: 'confirmed' })
      }
    );

    if (!pricingRecommendations) return res.status(500).json({ success: false, error: 'Failed to generate pricing recommendations' });

    res.json({ success: true, data: pricingRecommendations });
  } catch (error) {
    console.error('Error getting dynamic pricing:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/recommendations/flights', [
  body('userPreferences').isObject(),
  body('searchCriteria').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { userPreferences, searchCriteria } = req.body;
    const flights = await Flight.find({
      departureAirport: searchCriteria.from,
      arrivalAirport: searchCriteria.to,
      departureDate: { $gte: new Date(searchCriteria.date) }
    }).limit(20);

    if (flights.length === 0) {
      return res.json({ success: true, data: { recommendations: [], summary: 'No flights found matching your criteria' } });
    }

    const recommendations = await geminiService.getFlightRecommendations(userPreferences, flights);
    res.json({
      success: true,
      data: recommendations || {
        recommendations: flights.map(f => ({ flightId: f.id, score: 0.5, reasons: ['Available flight'], alternatives: [] })),
        summary: 'Here are the available flights'
      }
    });
  } catch (error) {
    console.error('Error getting flight recommendations:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/recommendations/seats', [
  body('flightId').isString().notEmpty(),
  body('userProfile').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { flightId, userProfile } = req.body;
    const seats = await Seat.find({ flight_id: flightId, status: 'available' });

    if (seats.length === 0) {
      return res.json({ success: true, data: { recommendedSeats: [], alternatives: [], summary: 'No available seats found for this flight' } });
    }

    const seatRecommendations = await geminiService.getSeatRecommendations(flightId, userProfile, seats);
    res.json({
      success: true,
      data: seatRecommendations || {
        recommendedSeats: seats.slice(0, 3).map(seat => ({ seatId: seat.id, score: 0.7, reasons: ['Available seat'], price: seat.price })),
        alternatives: [],
        summary: 'Here are some available seats'
      }
    });
  } catch (error) {
    console.error('Error getting seat recommendations:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/support/chat', [
  body('message').isString().notEmpty(),
  body('bookingId').optional().isString(),
  body('userId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { message, bookingId } = req.body;
    let bookingContext = null;
    if (bookingId) {
      const booking = await Booking.findOne({ id: bookingId });
      if (booking) {
        const flight = await Flight.findOne({ id: booking.flightId });
        bookingContext = { booking, flight, hasActiveBooking: true };
      }
    }

    const aiResponse = await geminiService.getCustomerSupportResponse(message, bookingContext || { hasActiveBooking: false });
    res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date().toISOString(),
        bookingContext: bookingContext ? {
          bookingId: bookingContext.booking.id,
          flightNumber: bookingContext.flight.flightNumber,
          status: bookingContext.booking.status
        } : null
      }
    });
  } catch (error) {
    console.error('Error processing support chat:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/predictions/delays', [
  body('flightId').isString().notEmpty(),
  body('weatherData').optional().isObject(),
  body('trafficData').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { flightId, weatherData = {}, trafficData = {} } = req.body;
    const flight = await Flight.findOne({ id: flightId });
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });

    const delayPrediction = await geminiService.predictFlightDelays(flight, weatherData, trafficData);
    res.json({
      success: true,
      data: delayPrediction || {
        delayProbability: 0.1,
        estimatedDelay: 'On time',
        riskFactors: [],
        recommendations: ['Check flight status before departure'],
        confidence: 0.5
      }
    });
  } catch (error) {
    console.error('Error predicting flight delays:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/messages/generate', [
  body('messageType').isIn(['booking_confirmation', 'flight_delay_notification', 'gate_change_notification', 'boarding_reminder', 'cancellation_notification']),
  body('bookingId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { messageType, bookingId } = req.body;
    const booking = await Booking.findOne({ id: bookingId });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const flight = await Flight.findOne({ id: booking.flightId });
    const customerData = { name: booking.passengerName, email: booking.passengerEmail, phone: booking.passengerPhone };
    const message = await geminiService.generateCustomerMessage(messageType, { booking, flight }, customerData);
    res.json({ success: true, data: { message, messageType, bookingId, timestamp: new Date().toISOString() } });
  } catch (error) {
    console.error('Error generating customer message:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;


