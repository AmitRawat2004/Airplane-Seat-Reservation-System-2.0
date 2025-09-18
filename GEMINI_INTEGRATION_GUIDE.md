# 🤖 Gemini API Integration Guide

This guide explains how to integrate Google's Gemini AI API into your Airplane Seat Reservation System to simplify complex operations and enhance user experience.

## 🚀 What Gemini API Simplifies

### 1. **Dynamic Pricing Intelligence**
- **Problem**: Manual pricing without market optimization
- **Solution**: AI analyzes demand, seasonality, and market conditions to suggest optimal pricing
- **Benefit**: Maximize revenue while staying competitive

### 2. **Intelligent Customer Support**
- **Problem**: Limited 24/7 customer support
- **Solution**: AI chatbot provides instant, contextual help for booking issues
- **Benefit**: Reduce support costs and improve customer satisfaction

### 3. **Smart Flight Recommendations**
- **Problem**: Users struggle to find optimal flights from many options
- **Solution**: AI analyzes user preferences and suggests best matches
- **Benefit**: Increase conversion rates and user satisfaction

### 4. **Intelligent Seat Selection**
- **Problem**: Users don't know which seats are best for their needs
- **Solution**: AI recommends seats based on user profile and preferences
- **Benefit**: Improve user experience and seat utilization

### 5. **Flight Delay Prediction**
- **Problem**: Reactive delay management
- **Solution**: AI predicts delays based on weather, traffic, and historical data
- **Benefit**: Proactive communication and better customer service

### 6. **Automated Customer Communication**
- **Problem**: Generic, manual customer messages
- **Solution**: AI generates personalized messages for different scenarios
- **Benefit**: Consistent, professional communication at scale

## 🛠️ Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" to generate a new key
4. Copy and securely store your API key

### Step 2: Install Dependencies

```bash
cd backend
npm install @google/generative-ai
```

### Step 3: Environment Configuration

Create a `.env` file in your backend directory:

```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Other existing environment variables...
MONGODB_URI=mongodb://localhost:27017/airplane_seat_reservation
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start the Server

```bash
cd backend
npm run dev
```

## 📡 API Endpoints

### AI-Powered Dynamic Pricing
```http
POST /api/ai/pricing/dynamic
Content-Type: application/json

{
  "flightId": "FL_1234567890_abc123def",
  "marketConditions": {
    "demand": "high",
    "season": "peak",
    "competitorPrices": [299, 350, 320]
  }
}
```

### Flight Recommendations
```http
POST /api/ai/recommendations/flights
Content-Type: application/json

{
  "userPreferences": {
    "priceSensitivity": "medium",
    "timePreference": "flexible",
    "seatClass": "economy",
    "connectionPreference": "direct"
  },
  "searchCriteria": {
    "from": "JFK",
    "to": "LAX",
    "date": "2024-01-15",
    "passengers": 2
  }
}
```

### Seat Recommendations
```http
POST /api/ai/recommendations/seats
Content-Type: application/json

{
  "flightId": "FL_1234567890_abc123def",
  "userProfile": {
    "preferences": ["window", "exit_row"],
    "travelPurpose": "business",
    "priceSensitivity": "low",
    "physicalNeeds": ["extra_legroom"]
  }
}
```

### Customer Support Chat
```http
POST /api/ai/support/chat
Content-Type: application/json

{
  "message": "I need to change my booking",
  "bookingId": "BK_1234567890_xyz789",
  "userId": "user123"
}
```

### Flight Delay Prediction
```http
POST /api/ai/predictions/delays
Content-Type: application/json

{
  "flightId": "FL_1234567890_abc123def",
  "weatherData": {
    "departureAirport": {"condition": "clear", "wind": "light"},
    "arrivalAirport": {"condition": "cloudy", "wind": "moderate"}
  },
  "trafficData": {
    "congestion": "medium",
    "delays": ["15min", "30min"]
  }
}
```

### Generate Customer Messages
```http
POST /api/ai/messages/generate
Content-Type: application/json

{
  "messageType": "booking_confirmation",
  "bookingId": "BK_1234567890_xyz789"
}
```

## 🎨 Frontend Integration

### 1. AI Chatbot Component
```tsx
import AIChatbot from '@/components/AIChatbot';

// Add to your main layout or booking pages
<AIChatbot 
  bookingId={currentBooking?.id}
  userId={user?.id}
/>
```

### 2. AI Flight Recommendations
```tsx
import AIFlightRecommendations from '@/components/AIFlightRecommendations';

<AIFlightRecommendations
  userPreferences={{
    priceSensitivity: 'medium',
    timePreference: 'flexible',
    seatClass: 'economy',
    connectionPreference: 'direct'
  }}
  searchCriteria={{
    from: 'JFK',
    to: 'LAX',
    date: '2024-01-15',
    passengers: 2
  }}
  onRecommendationSelect={(flightId) => {
    // Handle flight selection
  }}
/>
```

## 💡 Usage Examples

### Example 1: Dynamic Pricing
```javascript
// Get AI-powered pricing recommendations
const response = await fetch('/api/ai/pricing/dynamic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    flightId: 'FL_123',
    marketConditions: { demand: 'high', season: 'peak' }
  })
});

const pricing = await response.json();
// Use pricing.recommendedPrices to update seat prices
```

### Example 2: Customer Support
```javascript
// Send message to AI chatbot
const response = await fetch('/api/ai/support/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How do I cancel my booking?',
    bookingId: 'BK_123'
  })
});

const chatResponse = await response.json();
// Display chatResponse.data.response to user
```

## 🔧 Customization

### Custom Prompts
You can modify the prompts in `backend/services/geminiService.js` to:
- Adjust the AI's personality and tone
- Add domain-specific knowledge
- Include your airline's specific policies
- Customize response formats

### Rate Limiting
The AI endpoints are included in the general rate limiting. For production, consider:
- Separate rate limits for AI endpoints
- Caching frequent AI responses
- Implementing usage quotas

## 🚨 Security Considerations

1. **API Key Protection**: Never expose your Gemini API key in client-side code
2. **Input Validation**: All AI endpoints include input validation
3. **Rate Limiting**: AI endpoints are rate-limited to prevent abuse
4. **Error Handling**: Graceful fallbacks when AI services are unavailable

## 📊 Monitoring and Analytics

Track AI feature usage:
- Number of AI recommendations generated
- Customer satisfaction with AI responses
- Cost per AI interaction
- Response accuracy and relevance

## 🎯 Next Steps

1. **Test the Integration**: Use the provided Postman collection to test all endpoints
2. **Customize Prompts**: Adjust AI responses to match your brand voice
3. **Add More Features**: Extend AI capabilities based on user feedback
4. **Monitor Performance**: Track AI usage and optimize costs
5. **Scale Gradually**: Start with one feature and expand based on success

## 🆘 Troubleshooting

### Common Issues:

1. **API Key Not Working**
   - Verify the key is correctly set in environment variables
   - Check if the key has proper permissions
   - Ensure no extra spaces or characters

2. **AI Responses Not Relevant**
   - Adjust prompts in `geminiService.js`
   - Provide more context in API calls
   - Test with different model parameters

3. **Slow Response Times**
   - Consider caching frequent responses
   - Use streaming for long responses
   - Implement timeout handling

4. **High API Costs**
   - Monitor usage in Google AI Studio
   - Implement response caching
   - Set usage limits and alerts

## 📞 Support

For issues with:
- **Gemini API**: Check [Google AI Documentation](https://ai.google.dev/)
- **Integration**: Review this guide and check server logs
- **Customization**: Modify prompts and test thoroughly

---

**Happy coding! 🚀 Your airplane seat reservation system is now powered by AI!**
