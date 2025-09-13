const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Airport = require('../models/Airport');

// Get all airports
router.get('/', async (req, res) => {
  try {
    const airports = await Airport.find({}).sort({ city: 1, name: 1 }).lean();

    const formattedAirports = airports.map(airport => ({
      id: airport.id,
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      coordinates: {
        latitude: airport.latitude,
        longitude: airport.longitude
      },
      createdAt: airport.created_at
    }));

    res.json({
      success: true,
      data: formattedAirports,
      count: formattedAirports.length
    });
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch airports'
    });
  }
});

// Get airport by code
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const airport = await Airport.findOne({ code: code.toUpperCase() }).lean();
    if (!airport) {
      return res.status(404).json({
        success: false,
        error: 'Airport not found'
      });
    }
    const airportData = {
      id: airport.id,
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      coordinates: {
        latitude: airport.latitude,
        longitude: airport.longitude
      },
      createdAt: airport.created_at
    };

    res.json({
      success: true,
      data: airportData
    });
  } catch (error) {
    console.error('Error fetching airport:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch airport'
    });
  }
});

// Search airports
router.get('/search', async (req, res) => {
  try {
    const { q, country, city } = req.query;

    const filter = {};
    if (q) {
      filter.$or = [
        { code: new RegExp(q, 'i') },
        { name: new RegExp(q, 'i') },
        { city: new RegExp(q, 'i') }
      ];
    }
    if (country) filter.country = new RegExp(country, 'i');
    if (city) filter.city = new RegExp(city, 'i');

    const airports = await Airport.find(filter).sort({ city: 1, name: 1 }).lean();

    const formattedAirports = airports.map(airport => ({
      id: airport.id,
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      coordinates: {
        latitude: airport.latitude,
        longitude: airport.longitude
      }
    }));

    res.json({
      success: true,
      data: formattedAirports,
      count: formattedAirports.length
    });
  } catch (error) {
    console.error('Error searching airports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search airports'
    });
  }
});

// Get airports by country
router.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;

    const airports = await Airport.find({ country: new RegExp(country, 'i') }).sort({ city: 1, name: 1 }).lean();

    const formattedAirports = airports.map(airport => ({
      id: airport.id,
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      coordinates: {
        latitude: airport.latitude,
        longitude: airport.longitude
      }
    }));

    res.json({
      success: true,
      data: formattedAirports,
      count: formattedAirports.length
    });
  } catch (error) {
    console.error('Error fetching airports by country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch airports'
    });
  }
});

// Create new airport
router.post('/', [
  body('code').isString().trim().isLength({ min: 3, max: 10 }),
  body('name').isString().trim().notEmpty(),
  body('city').isString().trim().notEmpty(),
  body('country').isString().trim().notEmpty(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 })
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
      code,
      name,
      city,
      country,
      latitude,
      longitude
    } = req.body;

    const existing = await Airport.findOne({ code: code.toUpperCase() }).lean();
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Airport code already exists'
      });
    }

    // Create airport
    const airportId = `AP_${code.toUpperCase()}_${Date.now()}`;
    await Airport.create({
      id: airportId,
      code: code.toUpperCase(),
      name,
      city,
      country,
      latitude,
      longitude
    });

    res.status(201).json({
      success: true,
      message: 'Airport created successfully',
      data: { id: airportId, code: code.toUpperCase() }
    });
  } catch (error) {
    console.error('Error creating airport:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create airport'
    });
  }
});

// Update airport
router.put('/:id', [
  body('name').optional().isString().trim().notEmpty(),
  body('city').optional().isString().trim().notEmpty(),
  body('country').optional().isString().trim().notEmpty(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 })
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
    const updateData = req.body;

    const airport = await Airport.findOne({ id }).lean();
    if (!airport) {
      return res.status(404).json({
        success: false,
        error: 'Airport not found'
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    await Airport.updateOne({ id }, { $set: updateData });

    res.json({
      success: true,
      message: 'Airport updated successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error updating airport:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update airport'
    });
  }
});

// Delete airport
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const airport = await Airport.findOne({ id }).lean();
    if (!airport) {
      return res.status(404).json({
        success: false,
        error: 'Airport not found'
      });
    }
    // Optional: enforce referential checks at app level if needed
    // Not implemented here to keep parity with original behavior

    // Delete airport
    const result = await Airport.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'Failed to delete airport'
      });
    }

    res.json({
      success: true,
      message: 'Airport deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting airport:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete airport'
    });
  }
});

module.exports = router;
