import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RideCard from '../components/RideCard';
import { useRides } from '../mockData/RidesContext';
import { TripType } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'SearchResults'>;

const FILTER_PILLS: { label: string; value: 'all' | 'cheapest' | 'earliest' | 'seats' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Cheapest', value: 'cheapest' },
  { label: 'Earliest', value: 'earliest' },
  { label: 'Available Seats', value: 'seats' },
];

export default function SearchResultsScreen({ navigation, route }: Props) {
  const { rides: allRides } = useRides();
  const { from, to, tripType: initialTripType } = route.params;
  const [tripFilter, setTripFilter] = useState<TripType | 'all'>(
    initialTripType ?? 'all'
  );
  const [sortBy, setSortBy] = useState<'all' | 'cheapest' | 'earliest' | 'seats'>('all');

  const results = useMemo(() => {
    const fromQuery = from.trim().toLowerCase();
    const toQuery = to.trim().toLowerCase();
    return allRides.filter((ride) => {
      if (tripFilter !== 'all' && ride.tripType !== tripFilter) return false;
      if (!fromQuery && !toQuery) return true;

      const rideFrom = ride.fromLocation.toLowerCase();
      const rideTo = ride.toLocation.toLowerCase();

      // Strict directional: fromQuery only vs ride.from, toQuery only vs ride.to
      if (fromQuery && !rideFrom.includes(fromQuery)) return false;
      if (toQuery && !rideTo.includes(toQuery)) return false;
      return true;
    });
  }, [tripFilter, from, to, allRides]);

  // Sorted results based on pill selection
  const sortedResults = useMemo(() => {
    const base = results;
    if (sortBy === 'cheapest') {
      return [...base].sort((a, b) => a.pricePerSeat - b.pricePerSeat);
    }
    if (sortBy === 'earliest') {
      return [...base].sort(
        (a, b) =>
          new Date(a.departureTime).getTime() -
          new Date(b.departureTime).getTime()
      );
    }
    if (sortBy === 'seats') {
      return [...base].sort((a, b) => b.seatsAvailable - a.seatsAvailable);
    }
    return base;
  }, [sortBy, results]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: to ? `${from} → ${to}` : `Near ${from}`,
    });
  }, [navigation, from, to]);

  return (
    <View style={styles.container}>
      {/* Filter pills row */}
      <View style={styles.pillsBar}>
        {FILTER_PILLS.map((pill) => {
          const isActive = sortBy === pill.value;
          return (
            <Pressable
              key={pill.label}
              onPress={() => setSortBy(pill.value)}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text style={[styles.pillText, isActive && styles.pillActiveText]}>
                {pill.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={sortedResults}
        keyExtractor={(ride) => ride.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {sortedResults.length} ride{sortedResults.length === 1 ? '' : 's'} found
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No rides found for this route yet</Text>
            <Text style={styles.emptySubtitle}>
              Try broadening your search or post an alert to find a ride.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            onPress={() => navigation.navigate('RideDetails', { ride: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  pillsBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  pillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  pillActiveText: {
    color: '#fff',
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 24,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
  },
});