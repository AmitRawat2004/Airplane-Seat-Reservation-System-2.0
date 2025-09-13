const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function setupDatabase() {
  console.log('🚀 Setting up Airplane Seat Reservation Database...\n');

  // Database configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  };

  let connection;

  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'airplane_reservation';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created/verified`);

    // Use the database
    await connection.execute(`USE ${dbName}`);

    // Create tables
    console.log('\n📋 Creating database tables...');

    // Flights table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS flights (
        id VARCHAR(36) PRIMARY KEY,
        flight_number VARCHAR(20) NOT NULL,
        airline VARCHAR(100) NOT NULL,
        departure_airport VARCHAR(10) NOT NULL,
        departure_city VARCHAR(100) NOT NULL,
        departure_time TIME NOT NULL,
        departure_date DATE NOT NULL,
        arrival_airport VARCHAR(10) NOT NULL,
        arrival_city VARCHAR(100) NOT NULL,
        arrival_time TIME NOT NULL,
        arrival_date DATE NOT NULL,
        duration VARCHAR(10) NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        available_seats INT NOT NULL,
        aircraft VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'On Time',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_flight_number (flight_number),
        INDEX idx_departure_date (departure_date),
        INDEX idx_departure_airport (departure_airport),
        INDEX idx_arrival_airport (arrival_airport)
      )
    `);
    console.log('✅ Flights table created');

    // Seats table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seats (
        id VARCHAR(36) PRIMARY KEY,
        flight_id VARCHAR(36) NOT NULL,
        row_number INT NOT NULL,
        column_letter VARCHAR(2) NOT NULL,
        status ENUM('available', 'occupied', 'selected', 'premium') DEFAULT 'available',
        price DECIMAL(10,2) NOT NULL,
        class ENUM('economy', 'business', 'first') DEFAULT 'economy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
        UNIQUE KEY unique_seat (flight_id, row_number, column_letter),
        INDEX idx_flight_id (flight_id),
        INDEX idx_status (status),
        INDEX idx_class (class)
      )
    `);
    console.log('✅ Seats table created');

    // Bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        flight_id VARCHAR(36) NOT NULL,
        passenger_name VARCHAR(200) NOT NULL,
        passenger_email VARCHAR(200) NOT NULL,
        passenger_phone VARCHAR(20),
        seat_id VARCHAR(36) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50),
        booking_reference VARCHAR(20) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
        FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
        INDEX idx_passenger_email (passenger_email),
        INDEX idx_booking_reference (booking_reference),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ Bookings table created');

    // Airports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS airports (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_city (city),
        INDEX idx_country (country)
      )
    `);
    console.log('✅ Airports table created');

    // Flight tracking table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS flight_tracking (
        id VARCHAR(36) PRIMARY KEY,
        flight_id VARCHAR(36) NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        altitude INT,
        speed INT,
        heading INT,
        status VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
        INDEX idx_flight_id (flight_id),
        INDEX idx_timestamp (timestamp)
      )
    `);
    console.log('✅ Flight tracking table created');

    // Insert sample airports
    console.log('\n🌍 Inserting sample airports...');
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', latitude: 40.6413, longitude: -73.7781 },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', latitude: 33.9416, longitude: -118.4085 },
      { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States', latitude: 41.9786, longitude: -87.9048 },
      { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', latitude: 33.6407, longitude: -84.4277 },
      { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', latitude: 32.8968, longitude: -97.0380 },
      { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', latitude: 39.8561, longitude: -104.6737 },
      { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', latitude: 37.6189, longitude: -122.3750 },
      { code: 'LAS', name: 'McCarran International Airport', city: 'Las Vegas', country: 'United States', latitude: 36.0840, longitude: -115.1537 },
      { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States', latitude: 28.4312, longitude: -81.3081 },
      { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', country: 'United States', latitude: 35.2144, longitude: -80.9473 }
    ];

    for (const airport of airports) {
      await connection.execute(`
        INSERT IGNORE INTO airports (id, code, name, city, country, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        `AP_${airport.code}_${Date.now()}`,
        airport.code,
        airport.name,
        airport.city,
        airport.country,
        airport.latitude,
        airport.longitude
      ]);
    }
    console.log('✅ Sample airports inserted');

    // Insert sample flights
    console.log('\n✈️ Inserting sample flights...');
    const sampleFlights = [
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
      },
      {
        id: '3',
        flight_number: 'UA789',
        airline: 'United Airlines',
        departure_airport: 'ORD',
        departure_city: 'Chicago',
        departure_time: '08:30:00',
        departure_date: '2024-01-15',
        arrival_airport: 'SFO',
        arrival_city: 'San Francisco',
        arrival_time: '11:45:00',
        arrival_date: '2024-01-15',
        duration: '4h 15m',
        base_price: 275.00,
        available_seats: 28,
        aircraft: 'Boeing 787',
        status: 'On Time'
      }
    ];

    for (const flight of sampleFlights) {
      await connection.execute(`
        INSERT IGNORE INTO flights SET ?
      `, flight);
    }
    console.log('✅ Sample flights inserted');

    // Insert sample seats for each flight
    console.log('\n💺 Creating seat layouts...');
    for (const flight of sampleFlights) {
      const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
      
      // First Class (Rows 1-3)
      for (let row = 1; row <= 3; row++) {
        for (let col of ['A', 'B', 'C', 'D']) {
          await connection.execute(`
            INSERT IGNORE INTO seats (id, flight_id, row_number, column_letter, status, price, class)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            `${flight.id}-${row}${col}`,
            flight.id,
            row,
            col,
            Math.random() > 0.7 ? 'occupied' : 'available',
            599.00,
            'first'
          ]);
        }
      }
      
      // Business Class (Rows 4-8)
      for (let row = 4; row <= 8; row++) {
        for (let col of columns) {
          await connection.execute(`
            INSERT IGNORE INTO seats (id, flight_id, row_number, column_letter, status, price, class)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            `${flight.id}-${row}${col}`,
            flight.id,
            row,
            col,
            Math.random() > 0.6 ? 'occupied' : 'available',
            399.00,
            'business'
          ]);
        }
      }
      
      // Economy Class (Rows 9-20)
      for (let row = 9; row <= 20; row++) {
        for (let col of columns) {
          await connection.execute(`
            INSERT IGNORE INTO seats (id, flight_id, row_number, column_letter, status, price, class)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            `${flight.id}-${row}${col}`,
            flight.id,
            row,
            col,
            Math.random() > 0.5 ? 'occupied' : 'available',
            299.00,
            'economy'
          ]);
        }
      }
    }
    console.log('✅ Seat layouts created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`   - Database: ${dbName}`);
    console.log(`   - Tables: 5 (flights, seats, bookings, airports, flight_tracking)`);
    console.log(`   - Sample flights: ${sampleFlights.length}`);
    console.log(`   - Sample airports: ${airports.length}`);
    console.log(`   - Total seats: ~${sampleFlights.length * 300}`);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
