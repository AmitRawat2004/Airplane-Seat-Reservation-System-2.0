'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MapPin, Clock, User } from 'lucide-react';

export default function BookingsPage() {
  const { user } = useAuth();

  // Mock booking data - replace with actual data fetching
  const bookings = [
    {
      id: '1',
      flightNumber: 'AA123',
      airline: 'American Airlines',
      departure: {
        airport: 'JFK',
        city: 'New York',
        time: '10:00 AM',
        date: '2024-01-15',
      },
      arrival: {
        airport: 'LAX',
        city: 'Los Angeles',
        time: '1:30 PM',
        date: '2024-01-15',
      },
      seat: '12A',
      status: 'Confirmed',
      bookingDate: '2024-01-10',
    },
    {
      id: '2',
      flightNumber: 'DL456',
      airline: 'Delta Airlines',
      departure: {
        airport: 'LAX',
        city: 'Los Angeles',
        time: '3:00 PM',
        date: '2024-01-20',
      },
      arrival: {
        airport: 'JFK',
        city: 'New York',
        time: '11:30 PM',
        date: '2024-01-20',
      },
      seat: '8C',
      status: 'Confirmed',
      bookingDate: '2024-01-12',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600">
                Manage your flight reservations and bookings
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't made any bookings yet. Start by searching for flights.
                </p>
                <a
                  href="/"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Search Flights
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.flightNumber} - {booking.airline}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Departure */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.departure.airport}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.departure.city}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.departure.time}
                          </p>
                        </div>
                      </div>

                      {/* Flight Duration */}
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <Clock className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">
                            {booking.departure.date}
                          </p>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.arrival.airport}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.arrival.city}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.arrival.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Seat Information */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Seat:</span>
                          <span className="font-medium text-gray-900">
                            {booking.seat}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            View Details
                          </button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
