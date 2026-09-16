export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  totalRides: number;
  verified: boolean;
  phoneNumber?: string;
  bio?: string;
  licenseVerified?: boolean;
}

export type TripType = 'local' | 'intercity';

export type VehicleBodyType = 'Sedan' | 'SUV' | 'Hatchback' | 'Other';

export interface Vehicle {
  make: string;
  model: string;
  color: string;
  year?: string;
  licensePlate?: string;
  bodyType?: VehicleBodyType;
}

export type LuggageAllowance = 'small' | 'large' | 'none';

export interface Preferences {
  nonSmoking: boolean;
  petFriendly: boolean;
}

export interface Ride {
  id: string;
  driver: User;
  tripType: TripType;
  fromLocation: string;
  toLocation: string;
  departureTime: string;
  arrivalEstimateMins: number;
  pricePerSeat: number;
  seatsAvailable: number;
  vehicle: Vehicle;
  luggageAllowance?: LuggageAllowance;
  preferences?: Preferences;
  luggageNote?: string;
  notes?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  rideId: string;
  passenger: User;
  seatsBooked: number;
  status: BookingStatus;
  bookedAt: string;
}

export interface Message {
  id: string;
  rideId: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: string;
}
