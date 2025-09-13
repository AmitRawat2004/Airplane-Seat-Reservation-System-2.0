const express = require('express');
const router = express.Router();
const flightDataService = require('../services/flightDataService');
const Flight = require('../models/Flight');
const FlightTracking = require('../models/FlightTracking');
const Seat = require('../models/Seat');

// Get real-time flight status
router.get('/flights', async (req, res) => {
  try {
    const { from, to } = req.query;
    const realTimeFlights = await flightDataService.getRealTimeFlights();

    const matches = (value, target) =>
      typeof value === 'string' && typeof target === 'string' &&
      value.toLowerCase().includes(target.toLowerCase());

    const filtered = realTimeFlights.filter(f => {
      const fromOk = !from ||
        matches(f.departure?.airport || '', from) ||
        matches(f.departure?.city || '', from) ||
        matches(f.departure?.country || '', from);
      const toOk = !to ||
        matches(f.arrival?.airport || '', to) ||
        matches(f.arrival?.city || '', to) ||
        matches(f.arrival?.country || '', to);
      return fromOk && toOk;
    });
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time flights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time flight data'
    });
  }
});

// Get flight tracking data
router.get('/tracking/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params;
    const { limit = 10 } = req.query;
    const trackingData = await FlightTracking.find({ flight_id: flightId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    const formattedTracking = trackingData.map(track => ({
      id: track.id,
      flightId: track.flight_id,
      position: {
        latitude: track.latitude,
        longitude: track.longitude
      },
      altitude: track.altitude,
      speed: track.speed,
      heading: track.heading,
      status: track.status,
      timestamp: track.timestamp
    }));

    res.json({
      success: true,
      data: formattedTracking,
      count: formattedTracking.length
    });
  } catch (error) {
    console.error('Error fetching flight tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flight tracking data'
    });
  }
});

// Get live flight map data
router.get('/map', async (req, res) => {
  try {
    const flights = await Flight.find({
      status: { $in: ['On Time', 'Delayed', 'Boarding', 'Departed'] }
    }).lean();

    const flightIds = flights.map(f => f.id);
    const lastTracks = await FlightTracking.aggregate([
      { $match: { flight_id: { $in: flightIds } } },
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: '$flight_id',
          latitude: { $first: '$latitude' },
          longitude: { $first: '$longitude' },
          altitude: { $first: '$altitude' },
          speed: { $first: '$speed' },
          heading: { $first: '$heading' },
          timestamp: { $first: '$timestamp' }
      } }
    ]);
    const trackMap = Object.fromEntries(lastTracks.map(t => [t._id, t]));

    const mapData = flights.map(flight => {
      const t = trackMap[flight.id];
      return {
        id: flight.id,
        flightNumber: flight.flight_number,
        airline: flight.airline,
        departure: flight.departure_airport,
        arrival: flight.arrival_airport,
        status: flight.status,
        position: t && t.latitude != null && t.longitude != null ? {
          latitude: t.latitude,
          longitude: t.longitude
        } : null,
        altitude: t?.altitude,
        speed: t?.speed,
        heading: t?.heading,
        lastUpdate: t?.timestamp
      };
    });

    res.json({
      success: true,
      data: mapData,
      count: mapData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching flight map data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flight map data'
    });
  }
});

// Get flight delays and cancellations
router.get('/delays', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const delays = await Flight.find({
      status: { $in: ['Delayed', 'Cancelled'] },
      departure_date: today
    }).sort({ departure_time: 1 }).lean();

    const delayData = delays.map(delay => ({
      id: delay.id,
      flightNumber: delay.flight_number,
      airline: delay.airline,
      departure: delay.departure_airport,
      arrival: delay.arrival_airport,
      scheduledTime: delay.departure_time,
      status: delay.status,
      reportedAt: delay.created_at
    }));

    res.json({
      success: true,
      data: delayData,
      count: delayData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching flight delays:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flight delays'
    });
  }
});

// Get weather conditions for airports
router.get('/weather/:airportCode', async (req, res) => {
  try {
    const { airportCode } = req.params;
    
    // This would integrate with a weather API
    // For now, return mock data
    const mockWeather = {
      airport: airportCode,
      temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
      condition: ['Clear', 'Cloudy', 'Rain', 'Snow'][Math.floor(Math.random() * 4)],
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 mph
      visibility: Math.floor(Math.random() * 10) + 5, // 5-15 miles
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockWeather
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data'
    });
  }
});

// Get flight statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const flights = await Flight.find({ departure_date: today }).lean();

    const stats = {
      total_flights: flights.length,
      on_time: flights.filter(f => f.status === 'On Time').length,
      delayed: flights.filter(f => f.status === 'Delayed').length,
      cancelled: flights.filter(f => f.status === 'Cancelled').length,
      departed: flights.filter(f => f.status === 'Departed').length,
      arrived: flights.filter(f => f.status === 'Arrived').length
    };
    const onTimeRate = stats.total_flights > 0 
      ? ((stats.on_time / stats.total_flights) * 100).toFixed(1)
      : 0;

    const statistics = {
      date: today,
      totalFlights: stats.total_flights,
      onTime: stats.on_time,
      delayed: stats.delayed,
      cancelled: stats.cancelled,
      departed: stats.departed,
      arrived: stats.arrived,
      onTimeRate: `${onTimeRate}%`,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching flight statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flight statistics'
    });
  }
});

// Get real-time seat availability
router.get('/seats/:flightId', async (req, res) => {
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
      data: availability,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seat availability'
    });
  }
});

// Update flight tracking data (for real-time updates)
router.post('/tracking/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params;
    const { latitude, longitude, altitude, speed, heading, status } = req.body;
    const trackingId = `TR_${flightId}_${Date.now()}`;
    await FlightTracking.create({
      id: trackingId,
      flight_id: flightId,
      latitude,
      longitude,
      altitude,
      speed,
      heading,
      status
    });

    if (status) {
      await Flight.updateOne({ id: flightId }, { $set: { status } });
    }

    res.json({
      success: true,
      message: 'Flight tracking updated successfully',
      data: { id: trackingId, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error updating flight tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update flight tracking'
    });
  }
});

module.exports = router;
