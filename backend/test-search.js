const flightDataService = require('./services/flightDataService');

// Test search flights directly
console.log('Testing search flights directly...');

const criteria = {
  from: 'India',
  to: 'Thailand', 
  date: '2025-09-30',
  passengers: 1
};

console.log('Search criteria:', criteria);

flightDataService.searchFlights(criteria)
  .then(flights => {
    console.log(`Found ${flights.length} flights`);
    if (flights.length > 0) {
      console.log('Sample flight:', JSON.stringify(flights[0], null, 2));
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
