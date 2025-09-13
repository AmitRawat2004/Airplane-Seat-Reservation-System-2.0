'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { SearchParams } from '@/types/flight';

interface FlightSearchProps {
  onSearch: (params: SearchParams) => void;
}

export default function FlightSearch({ onSearch }: FlightSearchProps) {
  const [formData, setFormData] = useState<SearchParams>({
    from: '',
    to: '',
    date: '',
    passengers: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from && formData.to && formData.date) {
      onSearch(formData);
    }
  };

  const handleInputChange = (field: keyof SearchParams, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Search Flights</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From */}
        <div className="relative">
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="from"
              value={formData.from}
              onChange={(e) => handleInputChange('from', e.target.value)}
              placeholder="Airport code (e.g., JFK)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* To */}
        <div className="relative">
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="to"
              value={formData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              placeholder="Airport code (e.g., LAX)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Date */}
        <div className="relative">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Passengers */}
        <div className="relative">
          <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-2">
            Passengers
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              id="passengers"
              value={formData.passengers}
              onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full md:w-auto btn-primary flex items-center justify-center space-x-2 px-8 py-3"
      >
        <Search className="h-5 w-5" />
        <span>Search Flights</span>
      </button>
    </form>
  );
}
