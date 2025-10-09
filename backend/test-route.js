const express = require('express');
const app = express();

// Mock the search route logic
app.get('/test-search', async (req, res) => {
  try {
    const { from, to, date, passengers = 1 } = req.query;
    const includeRealTime = String(req.query.includeRealTime || 'false') === 'true';
    
    console.log('Raw query params:', { from, to, date, passengers, includeRealTime });
    
    const criteria = {
      from: from,
      to: to,
      date: date,
      passengers: passengers
    };
    
    console.log('Search criteria:', criteria);
    
    // Test flight generation directly
    const flightDataService = require('./services/flightDataService');
    const flights = await flightDataService.searchFlights(criteria);
    
    console.log('Found flights:', flights.length);
    
    res.json({
      success: true,
      data: flights,
      count: flights.length,
      searchCriteria: { ...criteria, includeRealTime: false }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => {
  console.log('Test server running on port 3002');
});
