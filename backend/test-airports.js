const flightDataService = require('./services/flightDataService');

// Test airport matching
console.log('Testing airport matching...');

// Test case-insensitive matching
const testCases = [
  'india',
  'India', 
  'INDIA',
  'delhi',
  'Delhi',
  'DELHI',
  'thailand',
  'Thailand',
  'THAILAND',
  'bangkok',
  'Bangkok',
  'BANGKOK'
];

testCases.forEach(term => {
  const airports = flightDataService.findAirports(term);
  console.log(`Search term: "${term}" -> Found ${airports.length} airports`);
  if (airports.length > 0) {
    console.log('  Airports:', airports.map(a => `${a.city}, ${a.country} (${a.code})`));
  }
});

// Test flight generation
console.log('\nTesting flight generation...');
const flights = flightDataService.generateFlights('India', 'Thailand', '2025-09-30', 1);
console.log(`Generated ${flights.length} flights`);
if (flights.length > 0) {
  console.log('Sample flight:', JSON.stringify(flights[0], null, 2));
}
