const axios = require('axios');
const Flight = require('../models/Flight');
const FlightTracking = require('../models/FlightTracking');
const Airport = require('../models/Airport');

class FlightDataService {
  constructor() {
    // Free aviation APIs (you'll need to sign up for API keys)
    this.apis = {
      aviationStack: {
        baseUrl: 'http://api.aviationstack.com/v1',
        apiKey: process.env.AVIATION_STACK_API_KEY,
        endpoint: '/flights'
      },
      openSky: {
        baseUrl: 'https://opensky-network.org/api',
        username: process.env.OPENSKY_USERNAME,
        password: process.env.OPENSKY_PASSWORD,
        endpoint: '/states/all'
      }
    };
  }

  // Get real-time flight data from multiple sources
  async getRealTimeFlights() {
    try {
      const [aviationStackData, openSkyData] = await Promise.allSettled([
        this.getAviationStackData(),
        this.getOpenSkyData()
      ]);

      let flights = [];

      // Process AviationStack data
      if (aviationStackData.status === 'fulfilled' && aviationStackData.value) {
        flights = flights.concat(this.processAviationStackData(aviationStackData.value));
      }

      // Process OpenSky data
      if (openSkyData.status === 'fulfilled' && openSkyData.value) {
        flights = flights.concat(this.processOpenSkyData(openSkyData.value));
      }

      // Update database with real-time data
      await this.updateFlightDatabase(flights);

      return flights;
    } catch (error) {
      console.error('Error fetching real-time flight data:', error);
      // Fallback to database data
      return await this.getFlightsFromDatabase();
    }
  }

  // Fetch data from AviationStack API
  async getAviationStackData() {
    if (!this.apis.aviationStack.apiKey) {
      console.log('AviationStack API key not configured');
      return null;
    }

    try {
      const response = await axios.get(`${this.apis.aviationStack.baseUrl}${this.apis.aviationStack.endpoint}`, {
        params: {
          access_key: this.apis.aviationStack.apiKey,
          limit: 100,
          offset: 0
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('AviationStack API error:', error.message);
      return null;
    }
  }

  // Fetch data from OpenSky Network API
  async getOpenSkyData() {
    if (!this.apis.openSky.username || !this.apis.openSky.password) {
      console.log('OpenSky credentials not configured');
      return null;
    }

    try {
      const response = await axios.get(`${this.apis.openSky.baseUrl}${this.apis.openSky.endpoint}`, {
        auth: {
          username: this.apis.openSky.username,
          password: this.apis.openSky.password
        },
        params: {
          time: Math.floor(Date.now() / 1000),
          icao24: 'a835af' // Example aircraft
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('OpenSky API error:', error.message);
      return null;
    }
  }

  // Process AviationStack data
  processAviationStackData(data) {
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map(flight => ({
      id: flight.flight?.iata || `AS_${Date.now()}_${Math.random()}`,
      flightNumber: flight.flight?.iata || flight.flight?.icao || 'N/A',
      airline: flight.airline?.name || 'Unknown',
      departure: {
        airport: flight.departure?.iata || flight.departure?.icao || 'N/A',
        city: flight.departure?.airport || 'Unknown',
        country: flight.departure?.country || 'Unknown',
        time: flight.departure?.scheduled || 'N/A',
        date: flight.departure?.scheduled?.split('T')[0] || new Date().toISOString().split('T')[0]
      },
      arrival: {
        airport: flight.arrival?.iata || flight.arrival?.icao || 'N/A',
        city: flight.arrival?.airport || 'Unknown',
        country: flight.arrival?.country || 'Unknown',
        time: flight.arrival?.scheduled || 'N/A',
        date: flight.arrival?.scheduled?.split('T')[0] || new Date().toISOString().split('T')[0]
      },
      duration: this.calculateDuration(flight.departure?.scheduled, flight.arrival?.scheduled),
      price: this.generatePrice(),
      availableSeats: Math.floor(Math.random() * 50) + 10,
      aircraft: flight.aircraft?.icao24 || 'Unknown',
      status: flight.flight_status || 'scheduled',
      source: 'aviationstack'
    }));
  }

  // Process OpenSky data
  processOpenSkyData(data) {
    if (!data.states || !Array.isArray(data.states)) {
      return [];
    }

    return data.states.slice(0, 50).map(state => ({
      id: `OS_${state[0]}_${Date.now()}`,
      flightNumber: state[1] || 'N/A',
      airline: 'Unknown',
      departure: {
        airport: 'N/A',
        city: 'Unknown',
        time: 'N/A',
        date: new Date().toISOString().split('T')[0]
      },
      arrival: {
        airport: 'N/A',
        city: 'Unknown',
        time: 'N/A',
        date: new Date().toISOString().split('T')[0]
      },
      duration: 'N/A',
      price: this.generatePrice(),
      availableSeats: Math.floor(Math.random() * 50) + 10,
      aircraft: state[0] || 'Unknown',
      status: 'active',
      source: 'opensky',
      tracking: {
        latitude: state[6],
        longitude: state[5],
        altitude: state[7],
        speed: state[9],
        heading: state[10]
      }
    }));
  }

  // Calculate flight duration
  calculateDuration(departureTime, arrivalTime) {
    if (!departureTime || !arrivalTime) {
      return 'N/A';
    }

    try {
      const departure = new Date(departureTime);
      const arrival = new Date(arrivalTime);
      const diffMs = arrival - departure;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${diffHours}h ${diffMinutes}m`;
    } catch (error) {
      return 'N/A';
    }
  }

  // Generate random price
  generatePrice() {
    return Math.floor(Math.random() * 500) + 200;
  }

  // Update database with real-time flight data
  async updateFlightDatabase(flights) {
    try {
      for (const flight of flights) {
        const existing = await Flight.findOne({
          flight_number: flight.flightNumber,
          departure_date: flight.departure.date
        }).lean();

        if (!existing) {
          await Flight.create({
            id: flight.id,
            flight_number: flight.flightNumber,
            airline: flight.airline,
            departure_airport: flight.departure.airport,
            departure_city: flight.departure.city,
            departure_time: flight.departure.time,
            departure_date: flight.departure.date,
            arrival_airport: flight.arrival.airport,
            arrival_city: flight.arrival.city,
            arrival_time: flight.arrival.time,
            arrival_date: flight.arrival.date,
            duration: flight.duration,
            base_price: flight.price,
            available_seats: flight.availableSeats,
            aircraft: flight.aircraft,
            status: flight.status
          });
        } else {
          await Flight.updateOne({ id: existing.id }, {
            $set: {
              status: flight.status,
              available_seats: flight.availableSeats
            }
          });
        }

        if (flight.tracking) {
          await FlightTracking.create({
            id: `${flight.id}_track_${Date.now()}`,
            flight_id: flight.id,
            latitude: flight.tracking.latitude,
            longitude: flight.tracking.longitude,
            altitude: flight.tracking.altitude,
            speed: flight.tracking.speed,
            heading: flight.tracking.heading,
            status: flight.status
          });
        }
      }
    } catch (error) {
      console.error('Error updating flight database:', error);
    }
  }

  // Get flights from database
  async getFlightsFromDatabase() {
    try {
      const flights = await Flight.find({}).sort({ departure_time: 1 }).limit(50).lean();
      return flights.map(flight => ({
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
        status: flight.status
      }));
    } catch (error) {
      console.error('Error fetching flights from database:', error);
      return [];
    }
  }

  // Search flights by criteria
  async searchFlights(criteria) {
    try {
      const filter = {};

      // Resolve city names to airport codes when needed
      if (criteria.from) {
        const from = String(criteria.from).trim();
        if (from.length === 3 && /^[A-Za-z]{3}$/.test(from)) {
          filter.departure_airport = from.toUpperCase();
        } else {
          const airports = await Airport.find({ $or: [
            { city: new RegExp(from, 'i') },
            { country: new RegExp(from, 'i') }
          ] }).lean();
          const codes = airports.map(a => a.code);
          if (codes.length > 0) {
            filter.departure_airport = { $in: codes };
          } else {
            // Also try matching by city stored on flights as a fallback
            filter.departure_city = new RegExp(from, 'i');
          }
        }
      }

      if (criteria.to) {
        const to = String(criteria.to).trim();
        if (to.length === 3 && /^[A-Za-z]{3}$/.test(to)) {
          filter.arrival_airport = to.toUpperCase();
        } else {
          const airports = await Airport.find({ $or: [
            { city: new RegExp(to, 'i') },
            { country: new RegExp(to, 'i') }
          ] }).lean();
          const codes = airports.map(a => a.code);
          if (codes.length > 0) {
            filter.arrival_airport = { $in: codes };
          } else {
            filter.arrival_city = new RegExp(to, 'i');
          }
        }
      }

      if (criteria.date) filter.departure_date = criteria.date;

      const flights = await Flight.find(filter).sort({ departure_time: 1 }).lean();

      return flights.map(flight => ({
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
        status: flight.status
      }));
    } catch (error) {
      console.error('Error searching flights:', error);
      return [];
    }
  }
}

module.exports = new FlightDataService();
