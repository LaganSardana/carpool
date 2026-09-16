import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowRight,
  ArrowUpDown,
  MapPin,
  Search,
  X,
} from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import FilterChips from '../components/FilterChips';
import RideCard from '../components/RideCard';
import { useRides } from '../mockData/RidesContext';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { TripType } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { MainScreenProps } from '../navigation/BottomTabNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'> & MainScreenProps;

const POPULAR_DESTINATIONS = [
  'Sydney Airport (SYD)',
  'Wollongong CBD',
  'Sydney Central Station',
  'Parramatta',
];

const TRIP_FILTERS: { label: string; value: TripType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Local', value: 'local' },
  { label: 'Intercity', value: 'intercity' },
];

export default function HomeScreen({ navigation }: Props) {
  const { rides: allRides } = useRides();
  const { recents, save, clear } = useRecentSearches();
  const [from, setFrom] = useState('Wollongong CBD');
  const [to, setTo] = useState('');
  const [tripFilter, setTripFilter] = useState<TripType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshTick((t) => t + 1);
    }, [])
  );

  const rides = useMemo(() => {
    return allRides.filter((ride) => {
      if (tripFilter === 'all') return true;
      return ride.tripType === tripFilter;
    });
    // refreshTick forces re-evaluation on focus; allRides ensures context updates propagate
  }, [allRides, tripFilter, refreshTick]);

  const handleSearch = () => {
    save({ from: from.trim(), to: to.trim(), tripType: tripFilter });
    navigation.navigate('SearchResults', {
      from: from.trim(),
      to: to.trim(),
      tripType: tripFilter,
    });
  };

  const handleUsualTrip = (search: {
    from: string;
    to: string;
    tripType: TripType | 'all';
  }) => {
    setFrom(search.from);
    setTo(search.to);
    setTripFilter(search.tripType);
    navigation.navigate('SearchResults', {
      from: search.from,
      to: search.to,
      tripType: search.tripType,
    });
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#2563eb"
          colors={['#2563eb']}
          progressBackgroundColor="#fff"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>G'day 👋</Text>
        <Text style={styles.title}>Where to today?</Text>
      </View>

      <View style={styles.searchCard}>
        <InputRow
          icon={<MapPin size={18} color="#64748b" />}
          label="From"
          placeholder="Any suburb, station or landmark"
          value={from}
          onChangeText={setFrom}
        />

        <View style={styles.swapRow}>
          <View style={styles.swapDivider} />
          <Pressable
            onPress={handleSwap}
            style={({ pressed }) => [
              styles.swapButton,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
            accessibilityLabel="Swap origin and destination"
          >
            <ArrowUpDown size={16} color="#2563eb" />
          </Pressable>
          <View style={styles.swapDivider} />
        </View>

        <InputRow
          icon={<ArrowRight size={18} color="#64748b" />}
          label="To"
          placeholder="Anywhere in Australia"
          value={to}
          onChangeText={setTo}
        />
        <View style={styles.filterWrap}>
          <FilterChips
            options={TRIP_FILTERS.map((f) => f.label)}
            selected={
              TRIP_FILTERS.find((f) => f.value === tripFilter)?.label ?? 'All'
            }
            onSelect={(label) => {
              const match = TRIP_FILTERS.find((f) => f.label === label);
              if (match) setTripFilter(match.value);
            }}
          />
        </View>
        <CustomButton title="Find rides" onPress={handleSearch} />
      </View>

      {recents.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, styles.sectionLabelInline]}>
              Your usual trips
            </Text>
            <Pressable
              onPress={clear}
              hitSlop={8}
              style={({ pressed }) => [pressed && styles.pressed]}
              accessibilityLabel="Clear search history"
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {recents.map((recent) => (
              <UsualTripChip
                key={`${recent.from}-${recent.to}-${recent.tripType}`}
                search={recent}
                onPress={() => handleUsualTrip(recent)}
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Popular destinations</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {POPULAR_DESTINATIONS.map((loc) => {
              const active = loc === to;
              return (
                <Pressable
                  key={loc}
                  onPress={() => setTo(loc)}
                  style={[
                    styles.quickChip,
                    active && styles.quickChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      active && styles.quickChipTextActive,
                    ]}
                  >
                    {loc}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.feedTitle}>Available rides</Text>
        <Text style={styles.feedCount}>{rides.length} available now</Text>
        {rides.length === 0 && (
          <Text style={styles.emptyText}>No rides in this category yet.</Text>
        )}
        {rides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            onPress={() => navigation.navigate('RideDetails', { ride })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function InputRow({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        inputStyles.row,
        focused && inputStyles.rowFocused,
      ]}
    >
      {icon}
      <View style={inputStyles.field}>
        <Text style={inputStyles.label}>{label}</Text>
        <TextInput
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          style={({ pressed }) => [
            inputStyles.clearButton,
            pressed && styles.pressed,
          ]}
          hitSlop={6}
          accessibilityLabel={`Clear ${label.toLowerCase()} field`}
        >
          <X size={15} color="#64748b" />
        </Pressable>
      )}
    </View>
  );
}

function UsualTripChip({
  search,
  onPress,
}: {
  search: { from: string; to: string; tripType: TripType | 'all' };
  onPress: () => void;
}) {
  const badge =
    search.tripType === 'all'
      ? { label: 'All', style: styles.usualBadgeAll, textStyle: styles.usualBadgeTextAll }
      : search.tripType === 'local'
        ? { label: 'Local', style: styles.usualBadgeLocal, textStyle: styles.usualBadgeTextLocal }
        : { label: 'Intercity', style: styles.usualBadgeIntercity, textStyle: styles.usualBadgeTextIntercity };
  return (
    <Pressable
      style={({ pressed }) => [styles.usualChip, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.usualRoute} numberOfLines={1}>
        {search.from} → {search.to || 'Nearby'}
      </Text>
      <View style={[styles.usualBadge, badge.style]}>
        <Text style={[styles.usualBadgeTextBase, badge.textStyle]}>
          {badge.label}
        </Text>
      </View>
    </Pressable>
  );
}

const inputStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rowFocused: {
    borderColor: '#93c5fd',
    backgroundColor: '#fff',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  field: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#94a3b8',
  },
  input: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
    paddingVertical: 4,
  },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: 10,
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -9,
    zIndex: 1,
  },
  swapDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#eef2f7',
  },
  swapButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  filterWrap: {
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  sectionLabelInline: {
    marginBottom: 0,
  },
  chipsRow: {
    gap: 10,
    paddingVertical: 2,
  },
  quickChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  quickChipTextActive: {
    color: '#fff',
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  feedCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 3,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  usualChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 280,
    alignSelf: 'flex-start',
  },
  usualRoute: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  usualBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 5,
    backgroundColor: '#dcfce7',
  },
  usualBadgeLocal: {
    backgroundColor: '#dcfce7',
  },
  usualBadgeIntercity: {
    backgroundColor: '#dbeafe',
  },
  usualBadgeAll: {
    backgroundColor: '#f1f5f9',
  },
  usualBadgeTextBase: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  usualBadgeTextLocal: {
    color: '#15803d',
  },
  usualBadgeTextIntercity: {
    color: '#1d4ed8',
  },
  usualBadgeTextAll: {
    color: '#64748b',
  },
});
