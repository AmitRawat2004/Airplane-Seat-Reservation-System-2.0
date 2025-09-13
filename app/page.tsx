'use client';

import { useState, useEffect } from 'react';
import { Search, Plane, MapPin, Calendar, Users, Clock } from 'lucide-react';
import FlightSearch from '@/components/FlightSearch';
import FlightList from '@/components/FlightList';
import Header from '@/components/Header';
import { Flight } from '@/types/flight';

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1,
  });

  const handleSearch = async (params: typeof searchParams) => {
    setLoading(true);
    setSearchParams(params);
    
    try {
      // This will be replaced with actual API call
      const mockFlights: Flight[] = [
        {
          id: '1',
          flightNumber: 'AA123',
          airline: 'American Airlines',
          departure: {
            airport: 'JFK',
            city: 'New York',
            time: '10:00 AM',
            date: params.date,
          },
          arrival: {
            airport: 'LAX',
            city: 'Los Angeles',
            time: '1:30 PM',
            date: params.date,
          },
          duration: '5h 30m',
          price: 299,
          availableSeats: 45,
          aircraft: 'Boeing 737',
          status: 'On Time',
        },
        {
          id: '2',
          flightNumber: 'DL456',
          airline: 'Delta Airlines',
          departure: {
            airport: 'JFK',
            city: 'New York',
            time: '2:15 PM',
            date: params.date,
          },
          arrival: {
            airport: 'LAX',
            city: 'Los Angeles',
            time: '5:45 PM',
            date: params.date,
          },
          duration: '5h 30m',
          price: 325,
          availableSeats: 32,
          aircraft: 'Airbus A320',
          status: 'On Time',
        },
      ];
      
      setFlights(mockFlights);
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Flight
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book airplane seats with real-time flight data and interactive seat selection. 
            Get the best deals on flights worldwide.
          </p>
        </div>

        {/* Search Section */}
        <div className="card mb-8">
          <FlightSearch onSearch={handleSearch} />
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for flights...</p>
          </div>
        ) : flights.length > 0 ? (
          <FlightList flights={flights} />
        ) : searchParams.from && searchParams.to ? (
          <div className="text-center py-12">
            <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No flights found for your search criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <Search className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Search Flights</h3>
              <p className="text-gray-600">Enter your departure and destination to find available flights.</p>
            </div>
            <div className="card text-center">
              <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Choose Seats</h3>
              <p className="text-gray-600">Select your preferred seats with our interactive seat map.</p>
            </div>
            <div className="card text-center">
              <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Book & Confirm</h3>
              <p className="text-gray-600">Complete your booking and receive instant confirmation.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
