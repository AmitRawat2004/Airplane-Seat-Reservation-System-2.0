'use client';

import { useState, useEffect } from 'react';
import { Seat } from '@/types/flight';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTranslation } from '@/lib/i18n';

interface SeatMapProps {
  flightId: string;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
}

export default function SeatMap({ flightId, selectedSeats, onSeatSelect }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = usePreferences();
  const { t } = useTranslation();

  const fetchSeats = async () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
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
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSeats();
      setLoading(false);
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

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status === 'occupied') return;
    
    // Check if seat is already selected locally
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    
    if (isSelected) {
      // Deselect seat - release reservation
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
        await fetch(`${apiBase}/seats/${seat.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'available' })
        });
      } catch (error) {
        console.error('Error releasing seat:', error);
      }
    } else {
      // Select seat - reserve it
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiBase}/seats/reserve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            seatIds: [seat.id], 
            duration: 600 // 10 minutes
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to reserve seat:', errorData);
          alert(`Failed to reserve seat: ${errorData.error || 'Unknown error'}`);
          return;
        }
      } catch (error) {
        console.error('Error reserving seat:', error);
        alert('Failed to reserve seat. Please try again.');
        return;
      }
    }
    
    onSeatSelect(seat);
    
    // Refresh seat data to show updated status
    await fetchSeats();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{t('loadingSeatMap')}</p>
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
          <span>{t('available')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="seat seat-selected w-6 h-6"></div>
          <span>{t('selected')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="seat seat-occupied w-6 h-6"></div>
          <span>{t('occupied')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="seat seat-premium w-6 h-6"></div>
          <span>{t('premium')}</span>
        </div>
      </div>

      {/* First Class */}
      <div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('firstClass')}</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
            {firstClassSeats.map(seat => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className={`seat ${getSeatClass(seat)}`}
                title={`Seat ${seat.row}${seat.column} - ${formatPrice(getSeatPrice(seat))}`}
              >
                {seat.row}{seat.column}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Business Class */}
      <div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('businessClass')}</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
            {businessClassSeats.map(seat => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className={`seat ${getSeatClass(seat)}`}
                title={`Seat ${seat.row}${seat.column} - ${formatPrice(getSeatPrice(seat))}`}
              >
                {seat.row}{seat.column}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Economy Class */}
      <div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('economyClass')}</h3>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
            {economyClassSeats.map(seat => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className={`seat ${getSeatClass(seat)}`}
                title={`Seat ${seat.row}${seat.column} - ${formatPrice(getSeatPrice(seat))}`}
              >
                {seat.row}{seat.column}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aircraft Layout Info */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
  <p className="font-medium mb-2">{t('aircraftLayout') || 'Aircraft Layout'}</p>
        <div className="flex justify-center space-x-8">
            <div className="flex items-center space-x-2">
            <span className="font-medium">A</span>
            <span>{t('window') || 'Window'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">B</span>
            <span>Window</span>
          </div>
            <div className="flex items-center space-x-2">
            <span className="font-medium">C</span>
            <span>{t('aisle') || 'Aisle'}</span>
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
