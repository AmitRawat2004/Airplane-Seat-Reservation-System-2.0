'use client';

import { useState, useEffect } from 'react';
import { Search, Plane, MapPin, Calendar, Users, Clock } from 'lucide-react';
import FlightSearch from '@/components/FlightSearch';
import FlightList from '@/components/FlightList';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/i18n';
import { Flight } from '@/types/flight';

export default function Home() {
  const { t } = useTranslation();
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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
      const qs = new URLSearchParams({
        from: params.from,
        to: params.to,
        date: params.date,
        passengers: String(params.passengers),
        includeRealTime: 'true'
      });
      const res = await fetch(`${apiBase}/flights/search?${qs.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];

      const flightsFromApi: Flight[] = data.map((f: any) => ({
        id: f.id,
        flightNumber: f.flightNumber,
        airline: f.airline,
        departure: f.departure,
        arrival: f.arrival,
        duration: f.duration,
        price: f.price,
        availableSeats: f.availableSeats,
        aircraft: f.aircraft,
        status: f.status
      }));

      setFlights(flightsFromApi);
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
            {t('findPerfectFlight') || 'Find Your Perfect Flight'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('heroSubtitle') || 'Book airplane seats with real-time flight data and interactive seat selection. Get the best deals on flights worldwide.'}
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
            <p className="mt-4 text-gray-600">{t('searchingForFlights') || 'Searching for flights...'}</p>
          </div>
        ) : flights.length > 0 ? (
          <FlightList flights={flights} />
        ) : searchParams.from && searchParams.to ? (
          <div className="text-center py-12">
            <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('noFlightsFound') || 'No flights found for your search criteria.'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <Search className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('searchFlights')}</h3>
              <p className="text-gray-600">{t('searchIntro') || 'Enter your departure and destination to find available flights.'}</p>
            </div>
            <div className="card text-center">
              <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('chooseSeats')}</h3>
              <p className="text-gray-600">{t('chooseSeatsSubtitle') || 'Select your preferred seats with our interactive seat map.'}</p>
            </div>
            <div className="card text-center">
              <Calendar className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('bookConfirm')}</h3>
              <p className="text-gray-600">{t('bookConfirmSubtitle') || 'Complete your booking and receive instant confirmation.'}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
