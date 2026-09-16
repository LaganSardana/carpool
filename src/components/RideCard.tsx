import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Car, Clock, MapPin, Star, User } from 'lucide-react-native';
import { Ride, TripType } from '../types';

interface RideCardProps {
  ride: Ride;
  onPress?: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function TripBadge({ type }: { type: TripType }) {
  const isLocal = type === 'local';
  return (
    <View style={[styles.badge, isLocal ? styles.badgeLocal : styles.badgeIntercity]}>
      <MapPin size={10} color={isLocal ? '#15803d' : '#1d4ed8'} />
      <Text style={[styles.badgeText, isLocal ? styles.badgeTextLocal : styles.badgeTextIntercity]}>
        {isLocal ? 'Local' : 'Intercity'}
      </Text>
    </View>
  );
}

export default function RideCard({ ride, onPress }: RideCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.driverRow}>
          <View style={styles.avatar}>
            <User size={18} color="#2563eb" />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.driverName}>{ride.driver.name}</Text>
              <TripBadge type={ride.tripType} />
            </View>
            <View style={styles.ratingRow}>
              <Star size={12} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>
                {ride.driver.rating.toFixed(1)} · {ride.driver.totalRides} rides
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.price}>${ride.pricePerSeat}</Text>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.routeLine}>
          <View style={[styles.dot, styles.dotStart]} />
          <View style={styles.line} />
          <View style={[styles.dot, styles.dotEnd]} />
        </View>
        <View style={styles.routeText}>
          <Text style={styles.location} numberOfLines={1}>
            {ride.fromLocation}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {ride.toLocation}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.metaItem}>
          <Clock size={14} color="#64748b" />
          <Text style={styles.metaText}>{formatTime(ride.departureTime)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Car size={14} color="#64748b" />
          <Text style={styles.metaText}>
            {ride.vehicle.make} {ride.vehicle.model}
          </Text>
        </View>
        <View style={[styles.seatBadge, ride.seatsAvailable <= 1 && styles.seatBadgeLow]}>
          <Text
            style={[
              styles.seatText,
              ride.seatsAvailable <= 1 && styles.seatTextLow,
            ]}
          >
            {ride.seatsAvailable} seat{ride.seatsAvailable === 1 ? '' : 's'} left
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeLocal: {
    backgroundColor: '#dcfce7',
  },
  badgeIntercity: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextLocal: {
    color: '#15803d',
  },
  badgeTextIntercity: {
    color: '#1d4ed8',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  routeRow: {
    flexDirection: 'row',
    marginVertical: 14,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotStart: {
    backgroundColor: '#22c55e',
  },
  dotEnd: {
    backgroundColor: '#ef4444',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: '#cbd5e1',
    marginVertical: 2,
  },
  routeText: {
    justifyContent: 'space-between',
    flex: 1,
    paddingVertical: 0,
  },
  location: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  seatBadge: {
    marginLeft: 'auto',
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  seatBadgeLow: {
    backgroundColor: '#fef9c3',
  },
  seatText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  seatTextLow: {
    color: '#a16207',
  },
});
