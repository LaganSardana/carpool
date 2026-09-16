import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  ArrowRight,
  Ban,
  Briefcase,
  Car,
  CheckCircle2,
  Cigarette,
  HandCoins,
  Luggage,
  PawPrint,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import { useRides } from '../mockData/RidesContext';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { TabParamList } from '../navigation/BottomTabNavigator';
import { RootStackParamList } from '../navigation/RootStack';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'RideDetails'>,
  CompositeScreenProps<
    BottomTabScreenProps<TabParamList>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export default function RideDetailsScreen({ navigation, route }: Props) {
  const { ride } = route.params;
  const { bookSeat, addBooking, addMessage, setActiveRideId, currentUser } = useRides();

  const [modalVisible, setModalVisible] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const departure = useMemo(
    () => formatDate(new Date(ride.departureTime)),
    [ride.departureTime]
  );
  const arrival = useMemo(
    () =>
      new Date(
        new Date(ride.departureTime).getTime() +
          ride.arrivalEstimateMins * 60_000
      ),
    [ride.departureTime, ride.arrivalEstimateMins]
  );


  const goToChatWithIntro = (text: string) => {
    setActiveRideId(ride.id);
    addMessage({
      id: `msg-${Date.now()}`,
      rideId: ride.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      sentAt: new Date().toISOString(),
    });
    setConfirmation(text);
    setTimeout(() => {
      navigation.navigate('Main', {
        screen: 'Chat',
        params: {
          rideId: ride.id,
          driverName: ride.driver.name,
          from: ride.fromLocation,
          to: ride.toLocation,
        },
      });
    }, 1200);
  };

  const handleInstantBooking = () => {
    if (ride.seatsAvailable <= 0 || confirmation) return;
    bookSeat(ride.id);
    addBooking({
      id: `booking-${Date.now()}`,
      rideId: ride.id,
      passenger: currentUser,
      seatsBooked: 1,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    });
    goToChatWithIntro(
      `Hi! I'd like to join your ride from ${ride.fromLocation} to ${ride.toLocation} — happy to pay $${ride.pricePerSeat}.`
    );
  };

  const handleSendProposal = () => {
    const priceNum = Number(offerPrice);
    if (!priceNum || priceNum <= 0) return;
    const pickupBit = pickupPoint.trim()
      ? ` Could you pick me up near ${pickupPoint.trim()}?`
      : '';
    goToChatWithIntro(
      `Hi, could you do $${priceNum} for your ride from ${ride.fromLocation} to ${ride.toLocation}?${pickupBit}`
    );
    setModalVisible(false);
  };

  const driverInitials = ride.driver.name
    .split(' ')
    .map((p) => p[0])
    .join('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.driverCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{driverInitials}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{ride.driver.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.ratingText}>
              {ride.driver.rating.toFixed(1)} · {ride.driver.totalRides} rides
            </Text>
            {ride.driver.verified && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={11} color="#15803d" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.carRow}>
            <Car size={14} color="#64748b" />
            <Text style={styles.carText}>
              {[ride.vehicle.make, ride.vehicle.model].filter(Boolean).join(' ') || 'Vehicle'}
              {ride.vehicle.color && ride.vehicle.color !== '—' ? ` · ${ride.vehicle.color}` : ''}
              {ride.vehicle.year ? ` · ${ride.vehicle.year}` : ''}
              {ride.vehicle.bodyType ? ` · ${ride.vehicle.bodyType}` : ''}
            </Text>
          </View>
          {ride.vehicle.licensePlate ? (
            <View style={styles.carRow}>
              <Text style={styles.plateText}>{ride.vehicle.licensePlate}</Text>
            </View>
          ) : null}
        </View>
        <TripPill type={ride.tripType} />
      </View>

      <View style={styles.highlightsRow}>
        <HighlightChip
          icon={<Luggage size={13} color="#475569" />}
          label={
            ride.luggageAllowance === 'small'
              ? 'Small bag / Backpack'
              : ride.luggageAllowance === 'large'
                ? '1 Large Suitcase'
                : 'No luggage'
          }
        />
        <HighlightChip
          icon={
            ride.preferences?.nonSmoking
              ? <Ban size={13} color="#475569" />
              : <Cigarette size={13} color="#475569" />
          }
          label="Non-smoking"
        />
        <HighlightChip
          icon={
            ride.preferences?.petFriendly
              ? <PawPrint size={13} color="#475569" />
              : <PawPrint size={13} color="#94a3b8" />
          }
          label="Pet friendly"
        />
        <HighlightChip
          icon={
            <Users
              size={13}
              color={ride.seatsAvailable <= 1 ? '#dc2626' : '#475569'}
            />
          }
          label={
            ride.seatsAvailable <= 0
              ? 'Fully booked'
              : `${ride.seatsAvailable} seat${ride.seatsAvailable === 1 ? '' : 's'} left`
          }
        />
      </View>

      <View style={styles.routeCard}>
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Departure</Text>
            <Text style={styles.timeValue}>{departure}</Text>
          </View>
          <ArrowRight size={16} color="#94a3b8" />
          <View style={[styles.timeBlock, styles.timeBlockEnd]}>
            <Text style={styles.timeLabel}>Est. arrival</Text>
            <Text style={styles.timeValue}>{formatDate(arrival)}</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineLeft}>
            <View style={[styles.dot, styles.dotStart]} />
            <View style={styles.line} />
            <View style={[styles.dot, styles.dotEnd]} />
          </View>
          <View style={styles.timelineStops}>
            <View>
              <Text style={styles.stopLabel}>Pickup</Text>
              <Text style={styles.stopName}>{ride.fromLocation}</Text>
            </View>
            <View>
              <Text style={styles.stopLabel}>Drop-off</Text>
              <Text style={styles.stopName}>{ride.toLocation}</Text>
            </View>
          </View>
        </View>

        {ride.luggageNote && (
          <View style={styles.luggageRow}>
            <Briefcase size={15} color="#64748b" />
            <Text style={styles.luggageText}>{ride.luggageNote}</Text>
          </View>
        )}
        {ride.notes && <Text style={styles.notes}>“{ride.notes}”</Text>}
      </View>

      {confirmation ? (
        <View style={styles.successCard}>
          <CheckCircle2 size={22} color="#15803d" />
          <View style={styles.successTextWrap}>
            <Text style={styles.successTitle}>Request sent!</Text>
            <Text style={styles.successBody}>
              Opening chat with {ride.driver.name.split(' ')[0]}…
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.bookingCard}>
          <View style={styles.priceRow}>
            <View>
            <Text style={styles.price}>${ride.pricePerSeat}</Text>
            <Text style={styles.perSeat}>per seat</Text>
            <View style={styles.fareNote}>
              <HandCoins size={12} color="#64748b" />
              <Text style={styles.fareNoteText}>Petrol &amp; Toll Split</Text>
            </View>
          </View>
            <Text
              style={[
                styles.seatsLeft,
                ride.seatsAvailable <= 1 && styles.seatsLow,
              ]}
            >
              {ride.seatsAvailable <= 0
                ? 'Fully booked'
                : `${ride.seatsAvailable} seat${ride.seatsAvailable === 1 ? '' : 's'} left`}
            </Text>
          </View>

          <CustomButton
            title={
              ride.seatsAvailable > 0
                ? `Request instant booking — $${ride.pricePerSeat}`
                : 'No seats available'
            }
            icon={Zap}
            onPress={handleInstantBooking}
            disabled={ride.seatsAvailable <= 0}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <CustomButton
            title="Negotiate / propose price"
            icon={HandCoins}
            variant="secondary"
            onPress={() => setModalVisible(true)}
          />
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Propose your deal</Text>
            <Text style={styles.modalSubtitle}>
              Driver asked ${ride.pricePerSeat}/seat for {ride.fromLocation} →{' '}
              {ride.toLocation}.
            </Text>

            <Text style={styles.modalLabel}>Your offer ($ per seat)</Text>
            <View style={styles.offerInputRow}>
              <Text style={styles.dollar}>$</Text>
              <TextInput
                style={styles.offerInput}
                placeholder={`${Math.max(1, ride.pricePerSeat - 2)}`}
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                value={offerPrice}
                onChangeText={(raw) =>
                  setOfferPrice(raw.replace(/\D/g, '').slice(0, 3))
                }
              />
            </View>

            <Text style={styles.modalLabel}>
              Preferred pickup point (optional)
            </Text>
            <TextInput
              style={styles.pickupInput}
              placeholder="e.g. near Mascot station"
              placeholderTextColor="#94a3b8"
              value={pickupPoint}
              onChangeText={setPickupPoint}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <View style={styles.modalPrimaryWrap}>
                <CustomButton title="Send proposal" onPress={handleSendProposal} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Text style={styles.footerHint}>
        Booking requests and offers go straight to the driver's chat.
      </Text>
    </ScrollView>
  );
}

function HighlightChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.highlightChip}>
      {icon}
      <Text style={styles.highlightText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function TripPill({ type }: { type: 'local' | 'intercity' }) {  const isLocal = type === 'local';
  return (
    <View
      style={[
        styles.tripPill,
        isLocal ? styles.pillLocal : styles.pillIntercity,
      ]}
    >
      <Text
        style={[
          styles.tripPillText,
          isLocal ? styles.pillTextLocal : styles.pillTextIntercity,
        ]}
      >
        {isLocal ? 'Local' : 'Intercity'}
      </Text>
    </View>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleString([], {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eef2f7',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    color: '#64748b',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803d',
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  carText: {
    fontSize: 12,
    color: '#475569',
    flexShrink: 1,
  },
  plateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  tripPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  pillLocal: {
    backgroundColor: '#dcfce7',
  },
  pillIntercity: {
    backgroundColor: '#dbeafe',
  },
  tripPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pillTextLocal: {
    color: '#15803d',
  },
  pillTextIntercity: {
    color: '#1d4ed8',
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    flexShrink: 1,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timeBlock: {
    flex: 1,
  },
  timeBlockEnd: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#94a3b8',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  timeline: {
    flexDirection: 'row',
    minHeight: 84,
  },
  timelineLeft: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotStart: {
    backgroundColor: '#22c55e',
  },
  dotEnd: {
    backgroundColor: '#ef4444',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#cbd5e1',
    marginVertical: 3,
  },
  timelineStops: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  stopLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#94a3b8',
  },
  stopName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  luggageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  luggageText: {
    fontSize: 13,
    color: '#475569',
    flexShrink: 1,
  },
  notes: {
    fontSize: 14,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 10,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2563eb',
  },
  perSeat: {
    fontSize: 12,
    color: '#64748b',
  },
  fareNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  fareNoteText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  seatsLeft: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a16207',
  },
  seatsLow: {
    color: '#dc2626',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eef2f7',
  },
  orText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successTextWrap: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
  },
  successBody: {
    fontSize: 13,
    color: '#166534',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginTop: 4,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    marginBottom: 6,
  },
  offerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  dollar: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  offerInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  pickupInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  modalPrimaryWrap: {
    flex: 1,
  },
  footerHint: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
});
