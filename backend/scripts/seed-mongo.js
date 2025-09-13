const dotenv = require('dotenv');
dotenv.config();
const { connectMongo } = require('../config/database');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const Airport = require('../models/Airport');

async function seed() {
  try {
    await connectMongo();

    const existingFlights = await Flight.countDocuments();
    if (existingFlights > 0) {
      console.log('Sample data already exists, skipping.');
      process.exit(0);
    }

    const flights = [
      {
        id: '1',
        flight_number: 'AA123',
        airline: 'American Airlines',
        departure_airport: 'JFK',
        departure_city: 'New York',
        departure_time: '10:00:00',
        departure_date: '2024-01-15',
        arrival_airport: 'LAX',
        arrival_city: 'Los Angeles',
        arrival_time: '13:30:00',
        arrival_date: '2024-01-15',
        duration: '5h 30m',
        base_price: 299.00,
        available_seats: 45,
        aircraft: 'Boeing 737',
        status: 'On Time'
      },
      {
        id: '2',
        flight_number: 'DL456',
        airline: 'Delta Airlines',
        departure_airport: 'JFK',
        departure_city: 'New York',
        departure_time: '14:15:00',
        departure_date: '2024-01-15',
        arrival_airport: 'LAX',
        arrival_city: 'Los Angeles',
        arrival_time: '17:45:00',
        arrival_date: '2024-01-15',
        duration: '5h 30m',
        base_price: 325.00,
        available_seats: 32,
        aircraft: 'Airbus A320',
        status: 'On Time'
      }
    ];

    await Flight.insertMany(flights);

    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];
    for (const flight of flights) {
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
    }
    await Seat.insertMany(seats);

    const airports = [
      { id: 'AP_JFK_1', code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', latitude: 40.6413, longitude: -73.7781 },
      { id: 'AP_LAX_1', code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', latitude: 33.9416, longitude: -118.4085 }
    ];
    await Airport.insertMany(airports);

    console.log('✅ Mongo seed completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Mongo seed failed:', err.message);
    process.exit(1);
  }
}

seed();


