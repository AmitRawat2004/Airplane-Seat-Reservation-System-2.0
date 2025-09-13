export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  availableSeats: number;
  aircraft: string;
  status: string;
}

export interface Seat {
  id: string;
  row: number;
  column: string;
  status: 'available' | 'occupied' | 'selected' | 'premium';
  price: number;
  class: 'economy' | 'business' | 'first';
}

export interface Booking {
  id: string;
  flightId: string;
  passengerName: string;
  passengerEmail: string;
  seatId: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}
