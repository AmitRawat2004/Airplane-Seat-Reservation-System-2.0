'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plane, Check } from 'lucide-react';
import Link from 'next/link';
import SeatMap from '@/components/SeatMap';
import BookingForm from '@/components/BookingForm';
import { Flight, Seat } from '@/types/flight';
import Header from '@/components/Header';

export default function SeatSelectionPage() {
  const params = useParams();
  const flightId = params.id as string;
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/flights/${encodeURIComponent(flightId)}`, { cache: 'no-store' });
        const json = await res.json();
        const f = json?.data;
        if (!f) {
          setFlight(null);
        } else {
          setFlight({
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
          });
        }
      } catch (e) {
        console.error(e);
        setFlight(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [flightId]);

  const handleSeatSelection = (seat: Seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading flight details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Flight not found.</p>
            <Link href="/" className="btn-primary mt-4 inline-block">
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Search</span>
        </Link>

        {/* Flight Info Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Plane className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Select Your Seats
                </h1>
                <p className="text-gray-600">
                  {flight.airline} - Flight {flight.flightNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {flight.departure.airport} → {flight.arrival.airport} • {flight.departure.date}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Selected Seats</p>
              <p className="text-2xl font-bold text-primary-600">
                {selectedSeats.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Seat Map
              </h2>
              <SeatMap 
                flightId={flightId}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelection}
              />
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Booking Summary
              </h2>
              
              {selectedSeats.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Selected Seats:</span>
                      <span className="font-medium">
                        {selectedSeats.map(seat => `${seat.row}${seat.column}`).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-medium">${flight.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Seat Upgrades:</span>
                      <span className="font-medium">
                        ${selectedSeats.reduce((sum, seat) => sum + (seat.price - flight.price), 0)}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary-600">
                          ${totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <BookingForm 
                    flight={flight}
                    selectedSeats={selectedSeats}
                    totalPrice={totalPrice}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Select seats from the map to proceed with booking
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
