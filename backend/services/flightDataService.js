const axios = require('axios');
const Flight = require('../models/Flight');
const FlightTracking = require('../models/FlightTracking');
const Airport = require('../models/Airport');
const fs = require('fs');
const path = require('path');

class FlightDataService {
  constructor() {
    // Free aviation APIs (you'll need to sign up for API keys)
    this.apis = {
      aviationStack: {
        baseUrl: 'https://api.aviationstack.com/v1',
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
    
    // Load comprehensive airport data
    this.airports = this.loadAirportData();
    this.airlines = [
      'Air India', 'IndiGo', 'SpiceJet', 'Vistara', 'GoAir',
      'Thai Airways', 'Bangkok Airways', 'Thai Smile',
      'American Airlines', 'Delta Airlines', 'United Airlines', 'Southwest Airlines',
      'British Airways', 'Lufthansa', 'Air France', 'KLM', 'Emirates',
      'Singapore Airlines', 'Cathay Pacific', 'Japan Airlines', 'ANA',
      'Qantas', 'Air Canada', 'LATAM', 'South African Airways'
    ];
  }

  // Load airport data from JSON file
  loadAirportData() {
    try {
      const airportDataPath = path.join(__dirname, '../data/airports.json');
      const data = fs.readFileSync(airportDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading airport data:', error);
      return [];
    }
  }

  // Find airports by city or country name (case-insensitive)
  findAirports(searchTerm) {
    if (!searchTerm) return [];
    
    const term = searchTerm.toLowerCase().trim();
    return this.airports.filter(airport => 
      airport.city.toLowerCase().includes(term) ||
      airport.country.toLowerCase().includes(term) ||
      airport.code.toLowerCase().includes(term) ||
      airport.name.toLowerCase().includes(term)
    );
  }

  // Generate flights dynamically based on search criteria
  generateFlights(from, to, date, passengers = 1) {
    const fromAirports = this.findAirports(from);
    const toAirports = this.findAirports(to);
    
    if (fromAirports.length === 0 || toAirports.length === 0) {
      return [];
    }

    const flights = [];
    const searchDate = new Date(date);
    
    // Generate multiple flights for different combinations
    for (let i = 0; i < Math.min(3, fromAirports.length); i++) {
      for (let j = 0; j < Math.min(3, toAirports.length); j++) {
        const fromAirport = fromAirports[i];
        const toAirport = toAirports[j];
        
        // Skip if same airport
        if (fromAirport.code === toAirport.code) continue;
        
        // Generate 2-4 flights per route
        const numFlights = Math.floor(Math.random() * 3) + 2;
        
        for (let k = 0; k < numFlights; k++) {
          const flight = this.createFlight(fromAirport, toAirport, searchDate, passengers);
          flights.push(flight);
        }
      }
    }
    
    return flights;
  }

  // Create a single flight
  createFlight(fromAirport, toAirport, date, passengers) {
    const flightId = `FL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const airline = this.airlines[Math.floor(Math.random() * this.airlines.length)];
    const flightNumber = this.generateFlightNumber(airline);
    
    // Generate departure time (6 AM to 10 PM)
    const departureHour = Math.floor(Math.random() * 16) + 6;
    const departureMinute = Math.floor(Math.random() * 60);
    const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}:00`;
    
    // Calculate flight duration based on distance
    const duration = this.calculateFlightDuration(fromAirport, toAirport);
    const arrivalTime = this.calculateArrivalTime(departureTime, duration);
    
    // Generate price based on distance and demand
    const basePrice = this.calculateBasePrice(fromAirport, toAirport);
    const price = Math.floor(basePrice * (0.8 + Math.random() * 0.4));
    
    // Generate available seats (ensure at least as many as passengers)
    const availableSeats = Math.max(passengers, Math.floor(Math.random() * 50) + 10);
    
    return {
      id: flightId,
      flightNumber: flightNumber,
      airline: airline,
      departure: {
        airport: fromAirport.code,
        city: fromAirport.city,
        country: fromAirport.country,
        time: departureTime,
        date: date.toISOString().split('T')[0]
      },
      arrival: {
        airport: toAirport.code,
        city: toAirport.city,
        country: toAirport.country,
        time: arrivalTime,
        date: date.toISOString().split('T')[0]
      },
      duration: duration,
      price: price,
      availableSeats: availableSeats,
      aircraft: this.getRandomAircraft(),
      status: 'On Time'
    };
  }

  // Generate flight number based on airline
  generateFlightNumber(airline) {
    const airlineCodes = {
      'Air India': 'AI',
      'IndiGo': '6E',
      'SpiceJet': 'SG',
      'Vistara': 'UK',
      'GoAir': 'G8',
      'Thai Airways': 'TG',
      'Bangkok Airways': 'PG',
      'Thai Smile': 'WE',
      'American Airlines': 'AA',
      'Delta Airlines': 'DL',
      'United Airlines': 'UA',
      'Southwest Airlines': 'WN',
      'British Airways': 'BA',
      'Lufthansa': 'LH',
      'Air France': 'AF',
      'KLM': 'KL',
      'Emirates': 'EK',
      'Singapore Airlines': 'SQ',
      'Cathay Pacific': 'CX',
      'Japan Airlines': 'JL',
      'ANA': 'NH',
      'Qantas': 'QF',
      'Air Canada': 'AC',
      'LATAM': 'LA',
      'South African Airways': 'SA'
    };
    
    const code = airlineCodes[airline] || 'XX';
    const number = Math.floor(Math.random() * 9999) + 100;
    return `${code}${number}`;
  }

  // Calculate flight duration based on distance
  calculateFlightDuration(fromAirport, toAirport) {
    const distance = this.calculateDistance(
      fromAirport.latitude, fromAirport.longitude,
      toAirport.latitude, toAirport.longitude
    );
    
    // Average speed: 500 mph, add 30 minutes for takeoff/landing
    const hours = Math.floor(distance / 500);
    const minutes = Math.floor((distance % 500) / 500 * 60) + 30;
    
    return `${hours}h ${minutes}m`;
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Calculate arrival time
  calculateArrivalTime(departureTime, duration) {
    // Parse duration (e.g., "3h 69m" -> 3 hours, 69 minutes)
    const durationMatch = duration.match(/(\d+)h\s*(\d+)m/);
    if (!durationMatch) {
      // Fallback if duration format is unexpected
      return '12:00:00';
    }
    
    const hours = parseInt(durationMatch[1]) || 0;
    const minutes = parseInt(durationMatch[2]) || 0;
    const totalMinutes = hours * 60 + minutes;
    
    const [depHour, depMin] = departureTime.split(':');
    const depTotalMinutes = parseInt(depHour) * 60 + parseInt(depMin);
    const arrTotalMinutes = depTotalMinutes + totalMinutes;
    
    const arrHour = Math.floor(arrTotalMinutes / 60) % 24;
    const arrMin = arrTotalMinutes % 60;
    
    return `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}:00`;
  }

  // Calculate base price based on distance
  calculateBasePrice(fromAirport, toAirport) {
    const distance = this.calculateDistance(
      fromAirport.latitude, fromAirport.longitude,
      toAirport.latitude, toAirport.longitude
    );
    
    // Base price: $0.50 per mile, minimum $100
    return Math.max(100, Math.floor(distance * 0.5));
  }

  // Get random aircraft
  getRandomAircraft() {
    const aircraft = [
      'Boeing 737', 'Boeing 737 MAX', 'Boeing 777', 'Boeing 787',
      'Airbus A320', 'Airbus A320neo', 'Airbus A321', 'Airbus A350',
      'Boeing 757', 'Boeing 767', 'Airbus A330'
    ];
    return aircraft[Math.floor(Math.random() * aircraft.length)];
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

  // Get real-time flight data from multiple sources without DB fallback
  async getRealTimeFlightsNoFallback() {
    try {
      const [aviationStackData, openSkyData] = await Promise.allSettled([
        this.getAviationStackData(),
        this.getOpenSkyData()
      ]);

      let flights = [];

      if (aviationStackData.status === 'fulfilled' && aviationStackData.value) {
        flights = flights.concat(this.processAviationStackData(aviationStackData.value));
      }

      if (openSkyData.status === 'fulfilled' && openSkyData.value) {
        flights = flights.concat(this.processOpenSkyData(openSkyData.value));
      }

      // Update DB as a side effect but do not change return behavior
      if (flights.length > 0) {
        try { await this.updateFlightDatabase(flights); } catch (_) {}
      }

      return flights; // return [] if nothing could be fetched
    } catch (error) {
      console.error('Error fetching real-time flight data (no fallback):', error);
      return [];
    }
  }

  // Fetch data from AviationStack API
  // Fetch data from AviationStack API. Accepts optional filters object to pass
  // through query params (e.g. { dep_iata, arr_iata, flight_date }).
  // Returns an object compatible with AviationStack response: { data: [...], pagination: {...} }
  async getAviationStackData(filters = {}) {
    if (!this.apis.aviationStack.apiKey) {
      console.log('AviationStack API key not configured');
      return null;
    }

    const maxPages = 3; // basic pagination safeguard
    const perPage = 100;
    let offset = 0;
    let allData = [];
    let paginationInfo = null;

    // Only allow a small set of safe filter keys to be passed through
    const allowedFilters = ['dep_iata', 'arr_iata', 'flight_date', 'flight_iata', 'airline_iata', 'flight_status'];
    const paramsBase = {
      access_key: this.apis.aviationStack.apiKey,
      limit: perPage
    };

    // build safe filters
    const safeFilters = {};
+    Object.keys(filters || {}).forEach(k => {
      if (allowedFilters.includes(k)) safeFilters[k] = filters[k];
    });

    // Retry loop with exponential backoff for transient errors
    for (let page = 0; page < maxPages; page++) {
      let attempt = 0;
+      let success = false;
+      let lastErr = null;
+
      while (attempt < 3 && !success) {
        try {
          const params = Object.assign({}, paramsBase, safeFilters, { offset });
          const response = await axios.get(`${this.apis.aviationStack.baseUrl}${this.apis.aviationStack.endpoint}`, {
            params,
            timeout: 10000
          });
+
          if (response && response.data) {
            const body = response.data;
+            paginationInfo = body.pagination || paginationInfo;
+            if (Array.isArray(body.data)) {
              allData = allData.concat(body.data);
            }
+
            success = true;
+            // if no pagination or we've received fewer than requested, break paging early
            const received = (body.data && body.data.length) || 0;
+            if (!body.pagination || received < perPage) {
+              page = maxPages; // end outer loop
+            } else {
+              // prepare next page if available
+              offset += perPage;
+            }
+          } else {
+            lastErr = new Error('Empty response from AviationStack');
+            attempt++;
+            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
+          }
+        } catch (err) {
+          lastErr = err;
+          attempt++;
+          // only wait before next attempt if we will retry
+          if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
+        }
+      }
+
      if (!success) {
+        console.error('AviationStack API error after retries:', lastErr && lastErr.message ? lastErr.message : lastErr);
+        // break pagination loop and return what we have (or null if nothing)
+        break;
+      }
+    }
+
    if (allData.length === 0) return null;
+
    return { data: allData, pagination: paginationInfo };
+  }
*** End Patch

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
      console.log('Search criteria received:', criteria);
      
      // First try to generate flights dynamically
      if (criteria.from && criteria.to && criteria.date) {
        console.log('Generating flights for:', criteria.from, 'to', criteria.to);
        const generatedFlights = this.generateFlights(
          criteria.from, 
          criteria.to, 
          criteria.date, 
          criteria.passengers || 1
        );
        
        console.log('Generated flights count:', generatedFlights.length);
        
        if (generatedFlights.length > 0) {
          // Store generated flights in database for future searches
          await this.storeGeneratedFlights(generatedFlights);
          return generatedFlights;
        }
      }

      // Fallback to database search
      const filter = {};

      // Resolve city names to airport codes when needed (case-insensitive)
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

  // Store generated flights in database
  async storeGeneratedFlights(flights) {
    try {
      // Skip database storage for now to avoid connection issues
      // The flights are already generated and returned
      console.log(`Skipping database storage for ${flights.length} flights`);
    } catch (error) {
      console.error('Error storing generated flights:', error);
    }
  }
}

module.exports = new FlightDataService();
