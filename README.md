# ✈️ Airplane Seat Reservation System 2.0

A comprehensive, real-time airplane seat reservation system built with Next.js, React, Node.js, and MongoDB. Features interactive seat selection, real-time flight data integration, and a modern, responsive UI.

## 🚀 Features

### Frontend (Next.js + React)
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Interactive Seat Map**: Real-time seat selection with visual feedback
- **Flight Search**: Advanced search with filters and sorting
- **Real-time Updates**: Live flight status and seat availability
- **Booking Management**: Complete booking workflow with payment integration
- **Mobile Responsive**: Optimized for all device sizes

### Backend (Node.js + Express)
- **RESTful API**: Comprehensive API endpoints for all operations
- **Real-time Data**: Integration with aviation APIs for live flight data
- **Database Management**: MongoDB with Mongoose ODM
- **Socket.IO**: Real-time communication for live updates
- **Security**: Rate limiting, input validation, and error handling

### Database (MongoDB)
- **Collections**: Flights, Seats, Bookings, Airports, FlightTracking
- **Indexes**: Query-optimized indexes on identifiers and dates
- **Real-time Tracking**: Flight position and status tracking
- **Seat Management**: Dynamic seat availability and pricing
- **Booking System**: Complete reservation tracking

### Real-time Features
- **Live Flight Data**: Integration with AviationStack and OpenSky APIs
- **Seat Availability**: Real-time seat status updates
- **Flight Tracking**: Live position and status monitoring
- **Weather Integration**: Airport weather conditions
- **Statistics Dashboard**: Real-time flight performance metrics

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: Modern React with hooks and context
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **React Hot Toast**: Toast notifications
- **Socket.IO Client**: Real-time communication

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Mongoose**: MongoDB ODM
- **Socket.IO**: Real-time bidirectional communication
- **Express Validator**: Input validation
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection

### Database
- **MongoDB**: Document database
- **Optimized Indexes**: Indexed fields for performance
- **Schema Models**: Enforced via Mongoose schemas
- **Real-time Updates**: Live data synchronization

### External APIs
- **AviationStack**: Real-time flight data
- **OpenSky Network**: Aircraft tracking
- **FlightAware**: Additional flight information

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd airplane-seat-reservation-system-2.0
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Database Setup (MongoDB)

#### Configure Environment Variables
Copy the example environment file:
```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your database credentials:
```env
# Database Configuration (Mongo)
MONGO_URI=mongodb://localhost:27017/airplane_reservation

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# API Keys (Optional - for real-time data)
AVIATION_STACK_API_KEY=your_aviation_stack_api_key
OPENSKY_USERNAME=your_opensky_username
OPENSKY_PASSWORD=your_opensky_password
```

#### Seed Database
```bash
# Run Mongo seed script (from backend directory)
cd backend
npm run db:seed:mongo
cd ..
```

### 4. Start the Application

#### Development Mode
```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend development server
npm run dev
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
Currently, the API uses basic authentication. In production, implement JWT tokens.

### Endpoints

#### Flights
- `GET /flights` - Get all flights
- `GET /flights/search` - Search flights with filters
- `GET /flights/:id` - Get flight by ID
- `GET /flights/real-time/status` - Get real-time flight data
- `GET /flights/:id/tracking` - Get flight tracking data
- `POST /flights` - Create new flight (admin)
- `PATCH /flights/:id/status` - Update flight status

#### Seats
- `GET /seats/flight/:flightId` - Get seats for a flight
- `GET /seats/:id` - Get seat by ID
- `PATCH /seats/:id/status` - Update seat status
- `PATCH /seats/bulk-status` - Bulk update seat status
- `POST /seats/flight/:flightId` - Create seats for a flight
- `GET /seats/flight/:flightId/availability` - Get seat availability
- `POST /seats/reserve` - Reserve seats temporarily

#### Bookings
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get booking by ID
- `POST /bookings` - Create new booking
- `PATCH /bookings/:id/status` - Update booking status
- `GET /bookings/email/:email` - Get bookings by email
- `DELETE /bookings/:id` - Cancel booking

#### Airports
- `GET /airports` - Get all airports
- `GET /airports/code/:code` - Get airport by code
- `GET /airports/search` - Search airports
- `GET /airports/country/:country` - Get airports by country
- `POST /airports` - Create new airport
- `PUT /airports/:id` - Update airport
- `DELETE /airports/:id` - Delete airport

#### Real-time Data
- `GET /real-time/flights` - Get real-time flight status
- `GET /real-time/tracking/:flightId` - Get flight tracking
- `GET /real-time/map` - Get live flight map data
- `GET /real-time/delays` - Get flight delays
- `GET /real-time/weather/:airportCode` - Get weather data
- `GET /real-time/stats` - Get flight statistics
- `GET /real-time/seats/:flightId` - Get real-time seat availability
- `POST /real-time/tracking/:flightId` - Update flight tracking

### Example API Calls

#### Search Flights
```bash
curl "http://localhost:3001/api/flights/search?from=JFK&to=LAX&date=2024-01-15&passengers=2"
```

#### Get Seat Map
```bash
curl "http://localhost:3001/api/seats/flight/1"
```

#### Create Booking
```bash
curl -X POST "http://localhost:3001/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "1",
    "passengerName": "John Doe",
    "passengerEmail": "john@example.com",
    "passengerPhone": "+1234567890",
    "seatId": "1-10A",
    "totalPrice": 299.00,
    "paymentMethod": "credit_card"
  }'
```

## 🎨 Frontend Features

### Flight Search
- Search by departure/arrival airports
- Date and passenger selection
- Real-time flight availability
- Price comparison and sorting

### Seat Selection
- Interactive seat map with different classes
- Real-time seat availability
- Seat pricing and features
- Multiple seat selection

### Booking Process
- Passenger information form
- Payment integration
- Booking confirmation
- Email notifications

### Real-time Updates
- Live flight status
- Seat availability updates
- Flight tracking
- Weather information

## 🔧 Configuration

### Environment Variables

#### Required
- `MONGO_URI`: MongoDB connection string
- `PORT`: Backend server port

#### Optional (for real-time features)
- `AVIATION_STACK_API_KEY`: AviationStack API key
- `OPENSKY_USERNAME`: OpenSky username
- `OPENSKY_PASSWORD`: OpenSky password
- `FLIGHTAWARE_API_KEY`: FlightAware API key

### Database Configuration
The system uses MongoDB with the following collections:
- `flights`: Flight information
- `seats`: Seat availability and pricing
- `bookings`: Reservation data
- `airports`: Airport information
- `flighttrackings`: Real-time flight tracking

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Use MongoDB Atlas or another Mongo provider and set env var
# Example: heroku config:set MONGO_URI="your_mongo_connection_string"

# Deploy
git push heroku main
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🧪 Testing

### API Testing
```bash
# Run backend tests
cd backend
npm test

# Test specific endpoints
npm run test:api
```

### Frontend Testing
```bash
# Run frontend tests
npm test

# Run E2E tests
npm run test:e2e
```

## 📊 Performance

### Database Optimization
- Appropriate indexes for fast searches
- Lean queries and projection
- Efficient schema modeling

### Frontend Optimization
- Next.js image optimization
- Code splitting
- Lazy loading
- Service worker caching

### Real-time Performance
- WebSocket connections
- Efficient data updates
- Rate limiting
- Error handling

## 🔒 Security

### API Security
- Input validation
- Rate limiting
- CORS configuration
- Helmet security headers
- NoSQL injection prevention

### Data Protection
- Encrypted connections
- Secure payment processing
- Data validation
- Access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples

## 🎯 Roadmap

### Version 2.1
- [ ] User authentication and profiles
- [ ] Advanced payment methods
- [ ] Mobile app development
- [ ] Admin dashboard
- [ ] Analytics and reporting

### Version 2.2
- [ ] Multi-language support
- [ ] Advanced seat features
- [ ] Integration with more airlines
- [ ] AI-powered pricing
- [ ] Enhanced real-time features

## 🙏 Acknowledgments

- AviationStack for flight data API
- OpenSky Network for aircraft tracking
- Tailwind CSS for styling
- Next.js team for the framework
- MongoDB community for database support

---

**Built with ❤️ for the aviation industry**
