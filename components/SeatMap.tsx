'use client';

import { useState, useEffect } from 'react';
import { Seat } from '@/types/flight';

interface SeatMapProps {
  flightId: string;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
}

export default function SeatMap({ flightId, selectedSeats, onSeatSelect }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/seats/flight/${encodeURIComponent(flightId)}`, { cache: 'no-store' });
        const json = await res.json();
        const seatsFromApi = (json?.data ?? []).map((s: any) => ({
          id: s.id,
          row: s.row,
          column: s.column,
          status: s.status,
          price: s.price,
          class: s.class
        }));
        setSeats(seatsFromApi);
      } catch (e) {
        console.error(e);
        setSeats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [flightId]);

  const getSeatClass = (seat: Seat) => {
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    
    if (isSelected) return 'seat-selected';
    if (seat.status === 'occupied') return 'seat-occupied';
    if (seat.class === 'first') return 'seat-premium';
    return 'seat-available';
  };

  const getSeatPrice = (seat: Seat) => {
    return seat.price;
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    onSeatSelect(seat);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading seat map...</p>
      </div>
    );
  }

  const firstClassSeats = seats.filter(s => s.class === 'first');
  const businessClassSeats = seats.filter(s => s.class === 'business');
  const economyClassSeats = seats.filter(s => s.class === 'economy');

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="seat seat-available w-6 h-6"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="seat seat-selected w-6 h-6"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="seat seat-occupied w-6 h-6"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="seat seat-premium w-6 h-6"></div>
          <span>Premium</span>
        </div>
      </div>

      {/* First Class */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">First Class</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
            {firstClassSeats.map(seat => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className={`seat ${getSeatClass(seat)}`}
                title={`Seat ${seat.row}${seat.column} - $${getSeatPrice(seat)}`}
              >
                {seat.row}{seat.column}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Business Class */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Class</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
            {businessClassSeats.map(seat => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className={`seat ${getSeatClass(seat)}`}
                title={`Seat ${seat.row}${seat.column} - $${getSeatPrice(seat)}`}
              >
                {seat.row}{seat.column}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Economy Class */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Economy Class</h3>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
            {economyClassSeats.map(seat => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className={`seat ${getSeatClass(seat)}`}
                title={`Seat ${seat.row}${seat.column} - $${getSeatPrice(seat)}`}
              >
                {seat.row}{seat.column}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aircraft Layout Info */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">Aircraft Layout</p>
        <div className="flex justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <span className="font-medium">A</span>
            <span>Window</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">B</span>
            <span>Window</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">C</span>
            <span>Aisle</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">D</span>
            <span>Aisle</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">E</span>
            <span>Aisle</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">F</span>
            <span>Window</span>
          </div>
        </div>
      </div>
    </div>
  );
}
