const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * AI-Powered Dynamic Pricing
   * Analyzes demand, time, season, and other factors to suggest optimal pricing
   */
  async getDynamicPricing(flightData, seatData, marketConditions) {
    const prompt = `
    As an airline pricing expert, analyze the following flight and market data to suggest optimal seat pricing:

    Flight Data: ${JSON.stringify(flightData)}
    Seat Data: ${JSON.stringify(seatData)}
    Market Conditions: ${JSON.stringify(marketConditions)}

    Consider factors like:
    - Time until departure
    - Current demand
    - Seasonality
    - Competitor pricing
    - Seat location and class
    - Historical booking patterns

    Return a JSON response with:
    {
      "recommendedPrices": {
        "economy": {"min": number, "max": number, "optimal": number},
        "business": {"min": number, "max": number, "optimal": number},
        "first": {"min": number, "max": number, "optimal": number}
      },
      "reasoning": "Brief explanation of pricing strategy",
      "confidence": 0.85
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error getting dynamic pricing:', error);
      return null;
    }
  }

  /**
   * Intelligent Customer Support Chatbot
   * Provides instant, contextual help for booking issues
   */
  async getCustomerSupportResponse(userMessage, bookingContext) {
    const prompt = `
    You are a helpful airline customer service representative. A customer has sent this message:

    Customer Message: "${userMessage}"
    
    Booking Context: ${JSON.stringify(bookingContext)}

    Provide a helpful, professional response that addresses their concern. If they need to:
    - Change a booking: Explain the process and any fees
    - Cancel a booking: Provide cancellation policy and refund information
    - Get flight information: Provide relevant details
    - Report an issue: Acknowledge and provide next steps

    Keep your response concise, friendly, and actionable. If you need more information, ask specific questions.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting customer support response:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team directly.";
    }
  }

  /**
   * AI-Powered Flight Recommendations
   * Suggests optimal flights based on user preferences and behavior
   */
  async getFlightRecommendations(userPreferences, availableFlights) {
    const prompt = `
    As a travel recommendation expert, analyze the user's preferences and suggest the best flights:

    User Preferences: ${JSON.stringify(userPreferences)}
    Available Flights: ${JSON.stringify(availableFlights)}

    Consider factors like:
    - Price sensitivity
    - Time preferences
    - Seat class preferences
    - Connection preferences
    - Airline preferences
    - Departure/arrival times

    Return a JSON response with:
    {
      "recommendations": [
        {
          "flightId": "string",
          "score": 0.95,
          "reasons": ["reason1", "reason2"],
          "alternatives": ["alternative1", "alternative2"]
        }
      ],
      "summary": "Brief explanation of recommendations"
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error getting flight recommendations:', error);
      return null;
    }
  }

  /**
   * Intelligent Seat Selection Assistant
   * Helps users choose the best seats based on their needs
   */
  async getSeatRecommendations(flightId, userProfile, availableSeats) {
    const prompt = `
    As a seat selection expert, help the user choose the best seats:

    Flight ID: ${flightId}
    User Profile: ${JSON.stringify(userProfile)}
    Available Seats: ${JSON.stringify(availableSeats)}

    Consider factors like:
    - User preferences (window, aisle, exit row)
    - Travel purpose (business, leisure, family)
    - Physical needs (legroom, accessibility)
    - Price sensitivity
    - Seat location benefits

    Return a JSON response with:
    {
      "recommendedSeats": [
        {
          "seatId": "string",
          "score": 0.9,
          "reasons": ["reason1", "reason2"],
          "price": 299
        }
      ],
      "alternatives": [
        {
          "seatId": "string",
          "score": 0.8,
          "reasons": ["reason1"],
          "price": 250
        }
      ],
      "summary": "Brief explanation of recommendations"
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error getting seat recommendations:', error);
      return null;
    }
  }

  /**
   * Flight Delay Prediction and Communication
   * Analyzes weather, traffic, and historical data to predict delays
   */
  async predictFlightDelays(flightData, weatherData, trafficData) {
    const prompt = `
    As an aviation operations expert, analyze the following data to predict potential flight delays:

    Flight Data: ${JSON.stringify(flightData)}
    Weather Data: ${JSON.stringify(weatherData)}
    Traffic Data: ${JSON.stringify(trafficData)}

    Consider factors like:
    - Weather conditions at departure/arrival airports
    - Air traffic congestion
    - Historical delay patterns
    - Time of day and season
    - Aircraft type and airline

    Return a JSON response with:
    {
      "delayProbability": 0.3,
      "estimatedDelay": "15-30 minutes",
      "riskFactors": ["weather", "traffic"],
      "recommendations": ["arrive early", "check status updates"],
      "confidence": 0.8
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error predicting flight delays:', error);
      return null;
    }
  }

  /**
   * Automated Customer Communication
   * Generates personalized messages for booking confirmations, updates, etc.
   */
  async generateCustomerMessage(messageType, bookingData, customerData) {
    const prompt = `
    Generate a personalized customer message for the following scenario:

    Message Type: ${messageType}
    Booking Data: ${JSON.stringify(bookingData)}
    Customer Data: ${JSON.stringify(customerData)}

    Message types include:
    - booking_confirmation
    - flight_delay_notification
    - gate_change_notification
    - boarding_reminder
    - cancellation_notification

    Make the message:
    - Professional but friendly
    - Informative and clear
    - Personalized when possible
    - Include relevant details
    - Provide next steps or contact information

    Return only the message text, no JSON formatting.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating customer message:', error);
      return "We have an important update regarding your booking. Please contact our customer service for details.";
    }
  }
}

module.exports = new GeminiService();
