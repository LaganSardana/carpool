import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, Message, Ride, User } from '../types';
import { mockRides, myBookings, sampleMessages, currentUser as initialUser } from './rides';

const PROFILE_KEY = '@carpool/profile';

interface RidesContextValue {
  rides: Ride[];
  messages: Message[];
  bookings: Booking[];
  activeRideId: string | null;
  currentUser: User;
  addRide: (ride: Ride) => void;
  addMessage: (message: Message) => void;
  setActiveRideId: (rideId: string) => void;
  bookSeat: (rideId: string) => void;
  addBooking: (booking: Booking) => void;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'phoneNumber' | 'bio'>>) => void;
  verifyLicense: () => void;
  signOut: () => void;
}

const RidesContext = createContext<RidesContextValue | undefined>(undefined);

export function RidesProvider({ children }: { children: React.ReactNode }) {
  const [rides, setRides] = useState<Ride[]>(mockRides);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [bookings, setBookings] = useState<Booking[]>(myBookings);
  const [activeRideId, setActiveRideId] = useState<string | null>(
    sampleMessages.length > 0 ? sampleMessages[0].rideId : null
  );
  const [currentUser, setCurrentUser] = useState<User>(initialUser);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<User>;
        setCurrentUser((prev) => ({ ...prev, ...saved }));
      })
      .catch(() => {});
  }, []);

  const persist = (next: User) => {
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const value = useMemo(
    () => ({
      rides,
      messages,
      bookings,
      activeRideId,
      currentUser,
      addRide: (ride: Ride) => setRides((prev) => [ride, ...prev]),
      addMessage: (message: Message) =>
        setMessages((prev) => [...prev, message]),
      setActiveRideId: (rideId: string) => setActiveRideId(rideId),
      bookSeat: (rideId: string) =>
        setRides((prev) =>
          prev.map((r) =>
            r.id === rideId && r.seatsAvailable > 0
              ? { ...r, seatsAvailable: r.seatsAvailable - 1 }
              : r
          )
        ),
      addBooking: (booking: Booking) =>
        setBookings((prev) => [booking, ...prev]),
      updateProfile: (patch: Partial<Pick<User, 'name' | 'phoneNumber' | 'bio'>>) => {
        setCurrentUser((prev) => {
          const next = { ...prev, ...patch };
          persist(next);
          return next;
        });
      },
      verifyLicense: () => {
        setCurrentUser((prev) => {
          const next = { ...prev, licenseVerified: true, verified: true };
          persist(next);
          return next;
        });
      },
      signOut: () => {
        AsyncStorage.removeItem(PROFILE_KEY).catch(() => {});
        setCurrentUser(initialUser);
        setBookings(myBookings);
        setMessages(sampleMessages);
        setActiveRideId(sampleMessages.length > 0 ? sampleMessages[0].rideId : null);
      },
    }),
    [rides, messages, bookings, activeRideId, currentUser]
  );

  return (
    <RidesContext.Provider value={value}>{children}</RidesContext.Provider>
  );
}

export function useRides(): RidesContextValue {
  const ctx = useContext(RidesContext);
  if (!ctx) {
    throw new Error('useRides must be used inside RidesProvider');
  }
  return ctx;
}
