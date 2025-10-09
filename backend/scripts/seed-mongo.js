const dotenv = require('dotenv');
dotenv.config();
const { connectMongo } = require('../config/database');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const Airport = require('../models/Airport');

async function seed() {
  try {
    await connectMongo();

    // Expanded sample flights (idempotent via upserts)
    const flights = [
      { id: '1', flight_number: 'AA123', airline: 'American Airlines', departure_airport: 'JFK', departure_city: 'New York', departure_time: '10:00:00', departure_date: '2024-01-15', arrival_airport: 'LAX', arrival_city: 'Los Angeles', arrival_time: '13:30:00', arrival_date: '2024-01-15', duration: '5h 30m', base_price: 299.00, available_seats: 45, aircraft: 'Boeing 737', status: 'On Time' },
      { id: '2', flight_number: 'DL456', airline: 'Delta Airlines', departure_airport: 'JFK', departure_city: 'New York', departure_time: '14:15:00', departure_date: '2024-01-15', arrival_airport: 'LAX', arrival_city: 'Los Angeles', arrival_time: '17:45:00', arrival_date: '2024-01-15', duration: '5h 30m', base_price: 325.00, available_seats: 32, aircraft: 'Airbus A320', status: 'On Time' },
      { id: '3', flight_number: 'UA789', airline: 'United Airlines', departure_airport: 'ORD', departure_city: 'Chicago', departure_time: '08:30:00', departure_date: '2024-01-15', arrival_airport: 'SFO', arrival_city: 'San Francisco', arrival_time: '11:45:00', arrival_date: '2024-01-15', duration: '4h 15m', base_price: 275.00, available_seats: 28, aircraft: 'Boeing 787', status: 'On Time' },
      { id: '4', flight_number: 'SW100', airline: 'Southwest Airlines', departure_airport: 'LAX', departure_city: 'Los Angeles', departure_time: '09:20:00', departure_date: '2024-01-15', arrival_airport: 'LAS', arrival_city: 'Las Vegas', arrival_time: '10:30:00', arrival_date: '2024-01-15', duration: '1h 10m', base_price: 89.00, available_seats: 60, aircraft: 'Boeing 737', status: 'On Time' },
      { id: '5', flight_number: 'AA321', airline: 'American Airlines', departure_airport: 'DFW', departure_city: 'Dallas', departure_time: '12:00:00', departure_date: '2024-01-15', arrival_airport: 'MCO', arrival_city: 'Orlando', arrival_time: '15:10:00', arrival_date: '2024-01-15', duration: '3h 10m', base_price: 199.00, available_seats: 50, aircraft: 'Airbus A321', status: 'On Time' },
      { id: '6', flight_number: 'DL200', airline: 'Delta Airlines', departure_airport: 'ATL', departure_city: 'Atlanta', departure_time: '07:45:00', departure_date: '2024-01-15', arrival_airport: 'DEN', arrival_city: 'Denver', arrival_time: '09:55:00', arrival_date: '2024-01-15', duration: '3h 10m', base_price: 189.00, available_seats: 40, aircraft: 'Boeing 757', status: 'On Time' },
      { id: '7', flight_number: 'AS555', airline: 'Alaska Airlines', departure_airport: 'SFO', departure_city: 'San Francisco', departure_time: '16:15:00', departure_date: '2024-01-15', arrival_airport: 'SEA', arrival_city: 'Seattle', arrival_time: '18:05:00', arrival_date: '2024-01-15', duration: '1h 50m', base_price: 149.00, available_seats: 36, aircraft: 'Boeing 737 MAX', status: 'On Time' },
      { id: '8', flight_number: 'FR901', airline: 'Frontier Airlines', departure_airport: 'DEN', departure_city: 'Denver', departure_time: '11:25:00', departure_date: '2024-01-15', arrival_airport: 'PHX', arrival_city: 'Phoenix', arrival_time: '13:00:00', arrival_date: '2024-01-15', duration: '1h 35m', base_price: 79.00, available_seats: 70, aircraft: 'Airbus A320neo', status: 'On Time' }
    ];

    // Upsert flights
    await Flight.bulkWrite(
      flights.map(f => ({
        updateOne: {
          filter: { id: f.id },
          update: { $set: f },
          upsert: true
        }
      }))
    );

    // Collect airports from flights and add a few known details
    const codeToAirport = {
      JFK: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', latitude: 40.6413, longitude: -73.7781 },
      LAX: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', latitude: 33.9416, longitude: -118.4085 },
      ORD: { code: 'ORD', name: 'O\'Hare International', city: 'Chicago', country: 'USA', latitude: 41.9786, longitude: -87.9048 },
      SFO: { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', latitude: 37.6189, longitude: -122.3750 },
      ATL: { code: 'ATL', name: 'Hartsfield–Jackson Atlanta International', city: 'Atlanta', country: 'USA', latitude: 33.6407, longitude: -84.4277 },
      DEN: { code: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA', latitude: 39.8561, longitude: -104.6737 },
      SEA: { code: 'SEA', name: 'Seattle–Tacoma International', city: 'Seattle', country: 'USA', latitude: 47.4502, longitude: -122.3088 },
      LAS: { code: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'USA', latitude: 36.0840, longitude: -115.1537 },
      DFW: { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', latitude: 32.8975, longitude: -97.0404 },
      MCO: { code: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA', latitude: 28.4312, longitude: -81.3081 },
      PHX: { code: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'USA', latitude: 33.4353, longitude: -112.0058 }
    };

    const airportCodes = new Set();
    for (const f of flights) {
      airportCodes.add(f.departure_airport);
      airportCodes.add(f.arrival_airport);
    }

    const airports = Array.from(airportCodes).map(code => {
      const meta = codeToAirport[code] || { code, name: code, city: code, country: 'USA' };
      return {
        id: `AP_${code}`,
        ...meta
      };
    });

    await Airport.bulkWrite(
      airports.map(a => ({
        updateOne: {
          filter: { code: a.code },
          update: { $set: a },
          upsert: true
        }
      }))
    );

    // Regenerate seats per flight (safe reset per flight to avoid duplicates)
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (const flight of flights) {
      await Seat.deleteMany({ flight_id: flight.id });

      const seats = [];
      for (let row = 1; row <= 3; row++) {
        for (let col of ['A', 'B', 'C', 'D']) {
          seats.push({
            id: `${flight.id}-${row}${col}`,
            flight_id: flight.id,
            row_number: row,
            column_letter: col,
            status: Math.random() > 0.7 ? 'occupied' : 'available',
            price: 599.00,
            class: 'first'
          });
        }
      }
      for (let row = 4; row <= 8; row++) {
        for (let col of columns) {
          seats.push({
            id: `${flight.id}-${row}${col}`,
            flight_id: flight.id,
            row_number: row,
            column_letter: col,
            status: Math.random() > 0.6 ? 'occupied' : 'available',
            price: 399.00,
            class: 'business'
          });
        }
      }
      for (let row = 9; row <= 20; row++) {
        for (let col of columns) {
          seats.push({
            id: `${flight.id}-${row}${col}`,
            flight_id: flight.id,
            row_number: row,
            column_letter: col,
            status: Math.random() > 0.5 ? 'occupied' : 'available',
            price: 299.00,
            class: 'economy'
          });
        }
      }

      if (seats.length > 0) {
        await Seat.insertMany(seats, { ordered: false });
      }
    }

    console.log('✅ Mongo seed completed (idempotent upserts, seats regenerated)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Mongo seed failed:', err.message);
    process.exit(1);
  }
}

seed();


