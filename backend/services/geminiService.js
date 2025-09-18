const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async getDynamicPricing(flightData, seatData, marketConditions) {
    const prompt = `\n    As an airline pricing expert, analyze the following flight and market data to suggest optimal seat pricing:\n\n    Flight Data: ${JSON.stringify(flightData)}\n    Seat Data: ${JSON.stringify(seatData)}\n    Market Conditions: ${JSON.stringify(marketConditions)}\n\n    Consider factors like:\n    - Time until departure\n    - Current demand\n    - Seasonality\n    - Competitor pricing\n    - Seat location and class\n    - Historical booking patterns\n\n    Return a JSON response with:\n    {\n      "recommendedPrices": {\n        "economy": {"min": 0, "max": 0, "optimal": 0},\n        "business": {"min": 0, "max": 0, "optimal": 0},\n        "first": {"min": 0, "max": 0, "optimal": 0}\n      },\n      "reasoning": "Brief explanation of pricing strategy",\n      "confidence": 0.85\n    }\n    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error getting dynamic pricing:', error);
      return null;
    }
  }

  async getCustomerSupportResponse(userMessage, bookingContext) {
    const prompt = `\n    You are a helpful airline customer service representative. A customer has sent this message:\n\n    Customer Message: "${userMessage}"\n    Booking Context: ${JSON.stringify(bookingContext)}\n\n    Provide a helpful, professional response that addresses their concern.\n    Keep your response concise, friendly, and actionable. If you need more information, ask specific questions.\n    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting customer support response:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team directly.";
    }
  }

  async getFlightRecommendations(userPreferences, availableFlights) {
    const prompt = `\n    As a travel recommendation expert, analyze the user's preferences and suggest the best flights:\n\n    User Preferences: ${JSON.stringify(userPreferences)}\n    Available Flights: ${JSON.stringify(availableFlights)}\n\n    Return a JSON response with recommendations and a short summary.\n    `;
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error getting flight recommendations:', error);
      return null;
    }
  }

  async getSeatRecommendations(flightId, userProfile, availableSeats) {
    const prompt = `\n    As a seat selection expert, help the user choose the best seats for flight ${flightId}.\n\n    User Profile: ${JSON.stringify(userProfile)}\n    Available Seats: ${JSON.stringify(availableSeats)}\n\n    Return a JSON with recommendedSeats, alternatives and summary.\n    `;
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error getting seat recommendations:', error);
      return null;
    }
  }

  async predictFlightDelays(flightData, weatherData, trafficData) {
    const prompt = `\n    Analyze the following to estimate delay risk.\n    Flight: ${JSON.stringify(flightData)}\n    Weather: ${JSON.stringify(weatherData)}\n    Traffic: ${JSON.stringify(trafficData)}\n\n    Return JSON with delayProbability, estimatedDelay, riskFactors, recommendations, confidence.\n    `;
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Error predicting flight delays:', error);
      return null;
    }
  }

  async generateCustomerMessage(messageType, bookingData, customerData) {
    const prompt = `\n    Generate a personalized ${messageType} message.\n    Booking: ${JSON.stringify(bookingData)}\n    Customer: ${JSON.stringify(customerData)}\n    Return only the message text.\n    `;
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


