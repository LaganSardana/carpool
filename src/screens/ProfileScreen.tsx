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
import { CarFront, Car, MessageCircle, Search, ShieldCheck, Star, Pencil, Phone, FileText, LogOut, Award, Upload } from 'lucide-react-native';
import CustomButton from '../components/CustomButton';
import { useRides } from '../mockData/RidesContext';
import { MainScreenProps } from '../navigation/BottomTabNavigator';

type Props = MainScreenProps;

type TabKey = 'offered' | 'bookings';

export default function ProfileScreen({ navigation }: Props) {
  const { rides, messages, bookings, setActiveRideId, currentUser, updateProfile, verifyLicense, signOut } = useRides();
  const [tab, setTab] = useState<TabKey>('offered');
  const [detailEntry, setDetailEntry] = useState<{
    rideId: string;
    status: 'Confirmed' | 'Negotiating';
    ride: (typeof rides)[number];
  } | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [uploadVisible, setUploadVisible] = useState(false);

  const offeredRides = useMemo(
    () => rides.filter((r) => r.driver.id === currentUser.id),
    [rides, currentUser.id]
  );

  const bookingEntries = useMemo(() => {
    const map = new Map<
      string,
      { rideId: string; status: 'Confirmed' | 'Negotiating' }
    >();

    for (const b of bookings) {
      if (b.passenger.id !== currentUser.id) continue;
      if (b.status === 'cancelled' || b.status === 'pending') continue;
      map.set(b.rideId, { rideId: b.rideId, status: 'Confirmed' });
    }

    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.senderId !== currentUser.id) continue;
      if (!map.has(m.rideId)) {
        map.set(m.rideId, { rideId: m.rideId, status: 'Negotiating' });
      }
    }

    return [...map.values()]
      .map((entry) => ({
        ...entry,
        ride: rides.find((r) => r.id === entry.rideId),
      }))
      .filter(
        (
          e
        ): e is {
          rideId: string;
          status: 'Confirmed' | 'Negotiating';
          ride: (typeof rides)[number];
        } => Boolean(e.ride)
      );
  }, [bookings, messages, rides, currentUser.id]);

  const offeredLabel = `${offeredRides.length} ride${
    offeredRides.length === 1 ? '' : 's'
  } offered`;
  const takenLabel = `${bookingEntries.length} ride${
    bookingEntries.length === 1 ? '' : 's'
  } taken`;

  const openEdit = () => {
    setEditName(currentUser.name);
    setEditPhone(currentUser.phoneNumber ?? '');
    setEditBio(currentUser.bio ?? '');
    setEditVisible(true);
  };

  const handleSaveProfile = () => {
    const patch: { name?: string; phoneNumber?: string; bio?: string } = {};
    if (editName.trim()) patch.name = editName.trim();
    patch.phoneNumber = editPhone.trim();
    patch.bio = editBio.trim();
    updateProfile(patch);
    setEditVisible(false);
  };

  const avatarLetter = (currentUser.name.trim()[0] ?? 'Y').toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Pressable onPress={openEdit} hitSlop={8} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
            <Pencil size={16} color="#64748b" />
          </Pressable>
        </View>
        {currentUser.phoneNumber ? <Text style={styles.bioText}>{currentUser.phoneNumber}</Text> : null}
        {currentUser.bio ? <Text style={styles.bioText}>{currentUser.bio}</Text> : null}
        <View style={styles.badgeRow}>
          <View style={styles.ratingBadge}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.ratingBadgeText}>
              {currentUser.rating.toFixed(1)}
            </Text>
          </View>
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={12} color="#15803d" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryText}>
            {offeredLabel} · {takenLabel}
          </Text>
        </View>
      </View>

      <View style={styles.trustCard}>
        <Text style={styles.trustTitle}>Verification & Trust</Text>
        <View style={styles.trustRow}>
          <View style={styles.trustLeft}>
            <FileText size={16} color="#334155" />
            <Text style={styles.trustLabel}>ID / Driver&apos;s Licence</Text>
          </View>
          {currentUser.licenseVerified ? (
            <View style={[styles.statusPill, styles.statusConfirmed]}>
              <Text style={[styles.statusText, styles.statusTextConfirmed]}>Verified</Text>
            </View>
          ) : (
            <Pressable onPress={() => setUploadVisible(true)} style={({ pressed }) => [styles.uploadPill, pressed && styles.pressed]}>
              <Upload size={12} color="#2563eb" />
              <Text style={styles.uploadText}>Upload Licence</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustRow}>
          <View style={styles.trustLeft}>
            <Phone size={16} color="#334155" />
            <Text style={styles.trustLabel}>Phone Number</Text>
          </View>
          <View style={[styles.statusPill, currentUser.phoneNumber ? styles.statusConfirmed : styles.statusNegotiating]}>
            <Text style={[styles.statusText, currentUser.phoneNumber ? styles.statusTextConfirmed : styles.statusTextNegotiating]}>
              {currentUser.phoneNumber ? 'Verified' : 'Add phone'}
            </Text>
          </View>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustRow}>
          <View style={styles.trustLeft}>
            <Award size={16} color="#334155" />
            <Text style={styles.trustLabel}>Community Rating</Text>
          </View>
          <Text style={styles.trustValue}>
            {currentUser.rating.toFixed(1)} · {currentUser.totalRides} rides
          </Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TabButton
          label={`My Offered Rides (${offeredRides.length})`}
          active={tab === 'offered'}
          onPress={() => setTab('offered')}
        />
        <TabButton
          label={`My Bookings (${bookingEntries.length})`}
          active={tab === 'bookings'}
          onPress={() => setTab('bookings')}
        />
      </View>

      {tab === 'offered' ? (
        offeredRides.length === 0 ? (
          <EmptyState
            icon={<CarFront size={28} color="#94a3b8" />}
            title="No rides offered yet"
            body="Driving somewhere? Post your route and let passengers cover your fuel."
            buttonTitle="Offer a Ride"
            onButton={() => navigation.navigate('Main', { screen: 'Offer' })}
          />
        ) : (
          offeredRides.map((ride) => (
            <View key={ride.id} style={styles.listCard}>
              <Text style={styles.route} numberOfLines={1}>
                {ride.fromLocation} → {ride.toLocation}
              </Text>
              <Text style={styles.meta}>
                {formatDateTime(ride.departureTime)}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>${ride.pricePerSeat}/seat</Text>
                <Text
                  style={[
                    styles.seats,
                    ride.seatsAvailable <= 1 && styles.seatsLow,
                  ]}
                >
                  {ride.seatsAvailable} seat
                  {ride.seatsAvailable === 1 ? '' : 's'} left
                </Text>
              </View>
            </View>
          ))
        )
      ) : bookingEntries.length === 0 ? (
        <EmptyState
          icon={<Search size={28} color="#94a3b8" />}
          title="No bookings yet"
          body="Find a ride that suits your schedule and request a seat in seconds."
          buttonTitle="Find a Ride"
          onButton={() => navigation.navigate('Main', { screen: 'Home' })}
        />
      ) : (
        bookingEntries.map(({ rideId, status, ride }) => {
          const vehicleLabel = [
            [ride.vehicle.make, ride.vehicle.model].filter(Boolean).join(' '),
            ride.vehicle.color && ride.vehicle.color !== '—' ? ride.vehicle.color : null,
            ride.vehicle.bodyType ?? null,
          ]
            .filter(Boolean)
            .join(' · ');

          const openDetails = () => setDetailEntry({ rideId, status, ride });

          const openChat = () => {
            setActiveRideId(ride.id);
            navigation.navigate('Main', {
              screen: 'Chat',
              params: {
                rideId: ride.id,
                driverName: ride.driver.name,
                from: ride.fromLocation,
                to: ride.toLocation,
              },
            });
          };

          return (
            <Pressable
              key={rideId}
              onPress={openDetails}
              style={({ pressed }) => [
                styles.listCard,
                styles.bookingCardPressable,
                pressed && styles.bookingCardPressed,
              ]}
            >
              <View style={styles.bookingTopRow}>
                <Text style={styles.route} numberOfLines={1}>
                  {ride.fromLocation} → {ride.toLocation}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    status === 'Confirmed'
                      ? styles.statusConfirmed
                      : styles.statusNegotiating,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === 'Confirmed'
                        ? styles.statusTextConfirmed
                        : styles.statusTextNegotiating,
                    ]}
                  >
                    {status}
                  </Text>
                </View>
              </View>
              <Text style={styles.meta}>
                with {ride.driver.name} · {formatDateTime(ride.departureTime)}
              </Text>
              {vehicleLabel ? <Text style={styles.vehicleMeta}>{vehicleLabel}</Text> : null}
              <View style={styles.cardFooter}>
                <Text style={styles.price}>${ride.pricePerSeat}/seat</Text>
                <View style={styles.bookingActions}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      openDetails();
                    }}
                    hitSlop={8}
                    style={({ pressed }) => [styles.viewLinkWrap, pressed && styles.pressed]}
                  >
                    <Text style={styles.viewLink}>Details</Text>
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      openChat();
                    }}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.chatButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <MessageCircle size={14} color="#fff" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        })
      )}

      <Pressable onPress={signOut} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
        <LogOut size={16} color="#dc2626" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <Modal
        visible={!!detailEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailEntry(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDetailEntry(null)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation?.()}>
            {detailEntry && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {detailEntry.ride.fromLocation} → {detailEntry.ride.toLocation}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      detailEntry.status === 'Confirmed'
                        ? styles.statusConfirmed
                        : styles.statusNegotiating,
                      styles.modalStatusPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        detailEntry.status === 'Confirmed'
                          ? styles.statusTextConfirmed
                          : styles.statusTextNegotiating,
                      ]}
                    >
                      {detailEntry.status === 'Confirmed' ? 'Booking Confirmed' : 'Negotiating'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalMeta}>{formatDateTime(detailEntry.ride.departureTime)}</Text>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Driver</Text>
                  <View style={styles.modalDriverRow}>
                    <Text style={styles.modalDriverName}>{detailEntry.ride.driver.name}</Text>
                    <View style={styles.modalRatingBadge}>
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.modalRatingText}>
                        {detailEntry.ride.driver.rating.toFixed(1)} · {detailEntry.ride.driver.totalRides} rides
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Vehicle</Text>
                  <View style={styles.modalVehicleRow}>
                    <Car size={14} color="#64748b" />
                    <Text style={styles.modalVehicleText}>
                      {[detailEntry.ride.vehicle.make, detailEntry.ride.vehicle.model].filter(Boolean).join(' ') || 'Vehicle'}
                      {detailEntry.ride.vehicle.color && detailEntry.ride.vehicle.color !== '—' ? ` · ${detailEntry.ride.vehicle.color}` : ''}
                      {detailEntry.ride.vehicle.year ? ` · ${detailEntry.ride.vehicle.year}` : ''}
                      {detailEntry.ride.vehicle.bodyType ? ` · ${detailEntry.ride.vehicle.bodyType}` : ''}
                    </Text>
                  </View>
                  {detailEntry.ride.vehicle.licensePlate ? (
                    <Text style={styles.modalPlateText}>{detailEntry.ride.vehicle.licensePlate}</Text>
                  ) : null}
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => setDetailEntry(null)}
                    style={({ pressed }) => [styles.modalCloseButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.modalCloseText}>Close</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const r = detailEntry.ride;
                      setActiveRideId(r.id);
                      setDetailEntry(null);
                      navigation.navigate('Main', {
                        screen: 'Chat',
                        params: {
                          rideId: r.id,
                          driverName: r.driver.name,
                          from: r.fromLocation,
                          to: r.toLocation,
                        },
                      });
                    }}
                    style={({ pressed }) => [styles.modalChatButton, pressed && styles.pressed]}
                  >
                    <MessageCircle size={16} color="#fff" />
                    <Text style={styles.modalChatButtonText}>Message Driver</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation?.()}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalMeta}>Update your display information. Saved locally.</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="04xx xxx xxx"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Tell riders a bit about you"
                placeholderTextColor="#94a3b8"
                multiline
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setEditVisible(false)} style={({ pressed }) => [styles.modalCloseButton, pressed && styles.pressed]}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSaveProfile} style={({ pressed }) => [styles.modalChatButton, pressed && styles.pressed]}>
                <Text style={styles.modalChatButtonText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={uploadVisible} transparent animationType="fade" onRequestClose={() => setUploadVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setUploadVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation?.()}>
            <Text style={styles.modalTitle}>Upload Licence</Text>
            <Text style={styles.modalMeta}>Submit your ID or driver&apos;s licence for verification. This is a demo — no file is actually uploaded.</Text>
            <View style={styles.uploadBox}>
              <FileText size={28} color="#64748b" />
              <Text style={styles.uploadHint}>Tap to select document</Text>
              <Text style={styles.uploadSubHint}>JPG, PNG or PDF — max 5 MB</Text>
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setUploadVisible(false)} style={({ pressed }) => [styles.modalCloseButton, pressed && styles.pressed]}>
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  verifyLicense();
                  setUploadVisible(false);
                }}
                style={({ pressed }) => [styles.modalChatButton, pressed && styles.pressed]}
              >
                <Text style={styles.modalChatButtonText}>Submit for Verification</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function EmptyState({
  icon,
  title,
  body,
  buttonTitle,
  onButton,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  buttonTitle: string;
  onButton: () => void;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      <CustomButton title={buttonTitle} onPress={onButton} />
    </View>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  summaryChip: {
    marginTop: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  trustCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  trustLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  trustValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  trustDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  uploadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 8,
  },
  tabTextActive: {
    color: '#0f172a',
    paddingHorizontal: 8,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  bookingCardPressable: {
    cursor: 'pointer' as unknown as undefined,
  } as unknown as Record<string, unknown>,
  bookingCardPressed: {
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.7,
  },
  bookingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  route: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flexShrink: 1,
  },
  meta: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
  },
  vehicleMeta: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563eb',
  },
  seats: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d',
  },
  seatsLow: {
    color: '#dc2626',
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusConfirmed: {
    backgroundColor: '#dcfce7',
  },
  statusNegotiating: {
    backgroundColor: '#fef9c3',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextConfirmed: {
    color: '#15803d',
  },
  statusTextNegotiating: {
    color: '#a16207',
  },
  viewLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  viewLinkWrap: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  bookingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyBody: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalStatusPill: {
    alignSelf: 'flex-start',
  },
  modalMeta: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
  },
  modalSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalDriverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalDriverName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modalRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b45309',
  },
  modalVehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalVehicleText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  modalPlateText: {
    marginTop: 6,
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCloseButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalChatButton: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalChatButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  inputGroup: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  uploadBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  uploadHint: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  uploadSubHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#94a3b8',
  },
});