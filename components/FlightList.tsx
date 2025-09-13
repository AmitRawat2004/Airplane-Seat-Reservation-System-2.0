'use client';

import { useState } from 'react';
import { Plane, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import { Flight } from '@/types/flight';
import Link from 'next/link';

interface FlightListProps {
  flights: Flight[];
}

export default function FlightList({ flights }: FlightListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Available Flights ({flights.length})
      </h2>
      
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}

function FlightCard({ flight }: { flight: Flight }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
        {/* Flight Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Plane className="h-6 w-6 text-primary-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {flight.airline}
                </h3>
                <p className="text-sm text-gray-600">Flight {flight.flightNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">
                ${flight.price}
              </p>
              <p className="text-sm text-gray-600">per passenger</p>
            </div>
          </div>

          {/* Route Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{flight.departure.airport}</p>
                <p className="text-sm text-gray-600">{flight.departure.city}</p>
                <p className="text-sm text-gray-500">{flight.departure.time}</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-600">{flight.duration}</p>
                <div className="w-16 h-px bg-gray-300 mx-auto mt-2"></div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{flight.arrival.airport}</p>
                <p className="text-sm text-gray-600">{flight.arrival.city}</p>
                <p className="text-sm text-gray-500">{flight.arrival.time}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{flight.availableSeats} seats available</span>
              </span>
              <span>{flight.aircraft}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              flight.status === 'On Time' ? 'bg-green-100 text-green-800' :
              flight.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {flight.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
          <Link
            href={`/flights/${flight.id}/seats`}
            className="btn-primary text-center"
          >
            Select Seats
          </Link>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Flight Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Aircraft:</span>
                  <span className="font-medium">{flight.aircraft}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flight Number:</span>
                  <span className="font-medium">{flight.flightNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Seats:</span>
                  <span className="font-medium">{flight.availableSeats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{flight.status}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare:</span>
                  <span className="font-medium">${flight.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees:</span>
                  <span className="font-medium">~$25</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">${flight.price + 25}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
