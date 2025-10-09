'use client';

import React, { useState } from 'react';
import { Sparkles, Clock, DollarSign, Star, MapPin, Plane } from 'lucide-react';

interface FlightRecommendation {
  flightId: string;
  score: number;
  reasons: string[];
  alternatives: string[];
}

interface AIRecommendations {
  recommendations: FlightRecommendation[];
  summary: string;
}

interface AIFlightRecommendationsProps {
  userPreferences: {
    priceSensitivity: 'low' | 'medium' | 'high';
    timePreference: 'early' | 'flexible' | 'late';
    seatClass: 'economy' | 'business' | 'first';
    connectionPreference: 'direct' | 'flexible' | 'cheapest';
    airlinePreference?: string[];
  };
  searchCriteria: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  };
  onRecommendationSelect: (flightId: string) => void;
}

export default function AIFlightRecommendations({
  userPreferences,
  searchCriteria,
  onRecommendationSelect
}: AIFlightRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/recommendations/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPreferences,
          searchCriteria
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data);
      } else {
        throw new Error(data.error || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get AI recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreText = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    return 'Fair Match';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="text-blue-600" size={24} />
        <h3 className="text-xl font-semibold text-gray-800">AI Flight Recommendations</h3>
      </div>

      {/* User Preferences Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Your Preferences:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center space-x-1">
            <DollarSign size={14} className="text-gray-500" />
            <span>Price: {userPreferences.priceSensitivity}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} className="text-gray-500" />
            <span>Time: {userPreferences.timePreference}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star size={14} className="text-gray-500" />
            <span>Class: {userPreferences.seatClass}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Plane size={14} className="text-gray-500" />
            <span>Connections: {userPreferences.connectionPreference}</span>
          </div>
        </div>
      </div>

      {/* Search Criteria */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Search Details:</h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <MapPin size={14} className="text-blue-600" />
            <span>{searchCriteria.from} → {searchCriteria.to}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} className="text-blue-600" />
            <span>{new Date(searchCriteria.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-blue-600">👥</span>
            <span>{searchCriteria.passengers} passenger{searchCriteria.passengers > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Get Recommendations Button */}
      <button
        onClick={getRecommendations}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors mb-6"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Getting AI Recommendations...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Sparkles size={18} />
            <span>Get AI-Powered Recommendations</span>
          </div>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <div>
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">{recommendations.summary}</p>
          </div>

          <div className="space-y-4">
            {recommendations.recommendations.map((rec, index) => (
              <div
                key={rec.flightId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onRecommendationSelect(rec.flightId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Flight {rec.flightId}</h4>
                      <p className="text-sm text-gray-500">Click to view details</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(rec.score)}`}>
                    {getScoreText(rec.score)} ({Math.round(rec.score * 100)}%)
                  </div>
                </div>

                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Why this flight matches you:</h5>
                  <ul className="space-y-1">
                    {rec.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {rec.alternatives.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Alternative options:</h5>
                    <div className="flex flex-wrap gap-2">
                      {rec.alternatives.map((alt, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Recommendations */}
      {recommendations && recommendations.recommendations.length === 0 && (
        <div className="text-center py-8">
          <Plane size={48} className="mx-auto text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Flights Found</h4>
          <p className="text-gray-500">Try adjusting your search criteria or preferences.</p>
        </div>
      )}
    </div>
  );
}
