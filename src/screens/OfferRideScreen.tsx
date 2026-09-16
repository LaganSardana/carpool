import React, { useMemo, useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Calendar, Clock, History, Luggage, MapPin, Minus, Ban, PawPrint, Plus, Car, RotateCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';
import FilterChips from '../components/FilterChips';
import { useRides } from '../mockData/RidesContext';
import { TripType, Vehicle, VehicleBodyType, LuggageAllowance, Preferences } from '../types';
import { MainScreenProps } from '../navigation/BottomTabNavigator';

type Props = MainScreenProps;

const TRIP_TYPE_OPTIONS: { label: string; value: TripType }[] = [
  { label: 'Local', value: 'local' },
  { label: 'Intercity', value: 'intercity' },
];

const LUGGAGE_OPTIONS: { label: string; value: LuggageAllowance; icon: React.ReactNode }[] = [
  { label: 'Small bag / Backpack', value: 'small', icon: <Luggage size={16} color="#64748b" /> },
  { label: '1 Large Suitcase', value: 'large', icon: <Luggage size={16} color="#64748b" /> },
  { label: 'No luggage', value: 'none', icon: <Luggage size={16} color="#64748b" /> },
];

const PREFERENCE_OPTIONS: { key: keyof Preferences; label: string; icon: React.ReactNode; default: boolean }[] = [
  { key: 'nonSmoking', label: 'Non-smoking', icon: <Ban size={16} color="#64748b" />, default: true },
  { key: 'petFriendly', label: 'Pet friendly', icon: <PawPrint size={16} color="#64748b" />, default: false },
];

const BODY_TYPE_OPTIONS: { label: string; value: VehicleBodyType }[] = [
  { label: 'Sedan', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Hatchback', value: 'Hatchback' },
  { label: 'Other', value: 'Other' },
];

const VEHICLE_STORAGE_KEY = '@carpool/vehicle';

type StoredVehicle = {
  makeModel: string;
  colorYear: string;
  plate: string;
  bodyType: VehicleBodyType;
};

function parseMakeModel(input: string): { make: string; model: string } {
  const trimmed = input.trim();
  if (!trimmed) return { make: '', model: '' };
  const parts = trimmed.split(/\s+/);
  return { make: parts[0] ?? '', model: parts.slice(1).join(' ') };
}

function parseColorYear(input: string): { color: string; year: string } {
  const trimmed = input.trim();
  const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : '';
  const color = trimmed.replace(/\b(19|20)\d{2}\b,?/, '').replace(/,/g, '').trim();
  return { color, year };
}

export default function OfferRideScreen({ navigation }: Props) {
  const { addRide, rides, currentUser } = useRides();

  const lastPosted = useMemo(
    () => rides.find((r) => r.driver.id === currentUser.id),
    [rides]
  );

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tripType, setTripType] = useState<TripType>('local');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [luggageAllowance, setLuggageAllowance] = useState<LuggageAllowance>('small');
  const [preferences, setPreferences] = useState<Preferences>({
    nonSmoking: true,
    petFriendly: false,
  });
  const [vehicleMakeModel, setVehicleMakeModel] = useState('');
  const [vehicleColorYear, setVehicleColorYear] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleBodyType, setVehicleBodyType] = useState<VehicleBodyType>('Sedan');

  const errors = useMemo(() => validate(from, to, tripType, date, time, price), [
    from,
    to,
    tripType,
    date,
    time,
    price,
  ]);

  const isValid = Object.keys(errors).length === 0;

  React.useEffect(() => {
    AsyncStorage.getItem(VEHICLE_STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const v: StoredVehicle = JSON.parse(raw);
        if (v.makeModel) setVehicleMakeModel(v.makeModel);
        if (v.colorYear) setVehicleColorYear(v.colorYear);
        if (v.plate) setVehiclePlate(v.plate);
        if (v.bodyType) setVehicleBodyType(v.bodyType);
      } catch {}
    });
  }, []);

  const handleRepeatLastRoute = () => {
    if (!lastPosted) return;
    setFrom(lastPosted.fromLocation);
    setTo(lastPosted.toLocation);
    setTripType(lastPosted.tripType);
    setPrice(String(lastPosted.pricePerSeat));
    if (lastPosted.luggageAllowance) setLuggageAllowance(lastPosted.luggageAllowance);
    if (lastPosted.preferences) setPreferences(lastPosted.preferences);
    if (lastPosted.vehicle) {
      const v = lastPosted.vehicle;
      const mm = [v.make, v.model].filter(Boolean).join(' ');
      const cy = [v.color, v.year].filter(Boolean).join(', ');
      if (mm) setVehicleMakeModel(mm);
      if (cy) setVehicleColorYear(cy);
      if (v.licensePlate) setVehiclePlate(v.licensePlate);
      if (v.bodyType) setVehicleBodyType(v.bodyType);
    }
    setDate('');
    setTime('');
    setShowErrors(false);
  };

  const handleClearForm = () => {
    setFrom('');
    setTo('');
    setDate('');
    setTime('');
    setPrice('');
    setSeats(3);
    setShowErrors(false);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    const { make, model } = parseMakeModel(vehicleMakeModel);
    const { color, year } = parseColorYear(vehicleColorYear);
    const vehicle: Vehicle = {
      make: make || 'My car',
      model,
      color: color || '—',
      year: year || undefined,
      licensePlate: vehiclePlate.trim() || undefined,
      bodyType: vehicleBodyType,
    };
    const stored: StoredVehicle = {
      makeModel: vehicleMakeModel.trim(),
      colorYear: vehicleColorYear.trim(),
      plate: vehiclePlate.trim(),
      bodyType: vehicleBodyType,
    };
    AsyncStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(stored)).catch(() => {});
    addRide({
      id: `user-${Date.now()}`,
      driver: currentUser,
      tripType,
      fromLocation: from.trim(),
      toLocation: to.trim(),
      departureTime: buildDepartureIso(date, time),
      arrivalEstimateMins: tripType === 'local' ? 20 : 90,
      pricePerSeat: parseInt(price, 10),
      seatsAvailable: seats,
      vehicle,
      luggageAllowance,
      preferences,
      notes: 'Posted via carpool-app MVP.',
    });
    setSubmitted(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Offer a ride</Text>
      <Text style={styles.subtitle}>
        Share your empty seats and split fuel costs across Australia.
      </Text>

      {lastPosted && (
        <Pressable
          style={({ pressed }) => [
            repeatStyles.card,
            pressed && styles.pressed,
          ]}
          onPress={handleRepeatLastRoute}
        >
          <View style={repeatStyles.iconWrap}>
            <History size={20} color="#2563eb" />
          </View>
          <View style={repeatStyles.textWrap}>
            <Text style={repeatStyles.title}>Repeat last route</Text>
            <Text style={repeatStyles.subtitle} numberOfLines={1}>
              {lastPosted.fromLocation} → {lastPosted.toLocation} · $
              {lastPosted.pricePerSeat}/seat
            </Text>
            <Text style={repeatStyles.hint}>
              Just pick a new date &amp; time — everything else is pre-filled.
            </Text>
          </View>
        </Pressable>
      )}

      <View style={styles.formCard}>
        <View style={styles.formCardHeader}>
          <Text style={styles.formCardHeaderTitle}>Trip details</Text>
          <Pressable
            onPress={handleClearForm}
            hitSlop={8}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
          >
            <RotateCcw size={14} color="#64748b" />
            <Text style={styles.clearButtonText}>Clear form</Text>
          </Pressable>
        </View>
        <Field
          label="Trip type"
          error={showErrors ? errors.tripType : undefined}
        >
          <FilterChips
            options={TRIP_TYPE_OPTIONS.map((o) => o.label)}
            selected={
              TRIP_TYPE_OPTIONS.find((o) => o.value === tripType)?.label ?? ''
            }
            onSelect={(label) => {
              const match = TRIP_TYPE_OPTIONS.find((o) => o.label === label);
              if (match) setTripType(match.value);
            }}
          />
        </Field>

        <Field label="From" error={showErrors ? errors.from : undefined}>
          <InputRow
            placeholder="Any suburb, station or landmark"
            value={from}
            onChangeText={setFrom}
            icon={<MapPin size={18} color="#64748b" />}
          />
        </Field>

        <Field
          label="To"
          error={showErrors ? errors.to : undefined}
        >
          <InputRow
            placeholder="Anywhere in Australia"
            value={to}
            onChangeText={setTo}
            icon={<MapPin size={18} color="#64748b" />}
          />
        </Field>

        <Field label="Date" error={showErrors ? errors.date : undefined}>
          <MaskedInput
            icon={<Calendar size={18} color="#64748b" />}
            placeholder="DD/MM/YYYY"
            keyboardType="number-pad"
            value={date}
            mask={(raw) => maskDate(raw)}
            onValue={setDate}
          />
        </Field>

        <Field label="Departure time" error={showErrors ? errors.time : undefined}>
          <MaskedInput
            icon={<Clock size={18} color="#64748b" />}
            placeholder="HH:MM (24h)"
            keyboardType="number-pad"
            value={time}
            mask={(raw) => maskTime(raw)}
            onValue={setTime}
          />
        </Field>

        <Field label="Seats offered (1–6)">
          <Stepper value={seats} onChange={setSeats} min={1} max={6} />
        </Field>

        <Field label="Price per seat" error={showErrors ? errors.price : undefined}>
          <PriceInput value={price} onChange={setPrice} />
        </Field>

        <Field label="Vehicle — Make & Model">
          <InputRow
            placeholder="e.g. Toyota Camry"
            value={vehicleMakeModel}
            onChangeText={setVehicleMakeModel}
            icon={<Car size={18} color="#64748b" />}
          />
        </Field>

        <Field label="Color & Year">
          <InputRow
            placeholder="e.g. Silver, 2021"
            value={vehicleColorYear}
            onChangeText={setVehicleColorYear}
            icon={<Car size={18} color="#64748b" />}
          />
        </Field>

        <Field label="License Plate / Rego (optional)">
          <InputRow
            placeholder="e.g. ABC 12D"
            value={vehiclePlate}
            onChangeText={setVehiclePlate}
            icon={<Car size={18} color="#64748b" />}
          />
        </Field>

        <Field label="Body type">
          <FilterChips
            options={BODY_TYPE_OPTIONS.map((o) => o.label)}
            selected={BODY_TYPE_OPTIONS.find((o) => o.value === vehicleBodyType)?.label ?? 'Sedan'}
            onSelect={(label) => {
              const m = BODY_TYPE_OPTIONS.find((o) => o.label === label);
              if (m) setVehicleBodyType(m.value);
            }}
          />
        </Field>

        <Field label="Luggage allowance">
          <FilterChips
            options={LUGGAGE_OPTIONS.map((o) => o.label)}
            selected={
              LUGGAGE_OPTIONS.find((o) => o.value === luggageAllowance)?.label ?? ''
            }
            onSelect={(label) => {
              const match = LUGGAGE_OPTIONS.find((o) => o.label === label);
              if (match) setLuggageAllowance(match.value);
            }}
          />
        </Field>

        <Field label="Ride preferences">
          <View style={preferenceStyles.container}>
            {PREFERENCE_OPTIONS.map((pref) => (
              <Pressable
                key={pref.key}
                style={({ pressed }) => [
                  preferenceStyles.chip,
                  preferences[pref.key] && preferenceStyles.chipActive,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    [pref.key]: !prev[pref.key],
                  }))
                }
              >
                <View style={preferenceStyles.chipContent}>
                  {pref.icon}
                  <Text style={[
                    preferenceStyles.chipText,
                    preferences[pref.key] && preferenceStyles.chipTextActive,
                  ]}>
                    {pref.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Field>

        <CustomButton
          title={submitted ? 'Ride listed! 🎉' : 'Post my ride'}
          onPress={handleSubmit}
          disabled={submitted}
        />
        {submitted && (
          <View style={styles.againWrap}>
            <CustomButton
              title="Offer another ride"
              onPress={handleClearForm}
              variant="secondary"
            />
          </View>
        )}
        {!isValid && showErrors && !submitted && (
          <Text style={styles.hintText}>
            Fix the highlighted fields above, then post your ride.
          </Text>
        )}
        {submitted && (
          <Text style={styles.confirmText}>
            Your ride is now visible on Home and Search.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

function InputRow({
  placeholder,
  value,
  onChangeText,
  icon,
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: React.ReactNode;
}) {
  return (
    <View style={inputStyles.row}>
      {icon}
      <TextInput
        style={inputStyles.input}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function MaskedInput({
  placeholder,
  value,
  keyboardType,
  icon,
  mask,
  onValue,
}: {
  placeholder: string;
  value: string;
  keyboardType: KeyboardTypeOptions;
  icon: React.ReactNode;
  mask: (raw: string) => string;
  onValue: (v: string) => void;
}) {
  return (
    <View style={inputStyles.row}>
      {icon}
      <TextInput
        style={inputStyles.input}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        value={value}
        maxLength={10}
        onChangeText={(raw) => onValue(mask(raw))}
      />
    </View>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <View style={stepperStyles.row}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        hitSlop={8}
        style={({ pressed }) => [
          stepperStyles.button,
          value <= min && stepperStyles.buttonDisabled,
          pressed && stepperStyles.pressed,
        ]}
      >
        <Minus size={18} color={value <= min ? '#cbd5e1' : '#2563eb'} />
      </Pressable>
      <Text style={stepperStyles.value}>{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        hitSlop={8}
        style={({ pressed }) => [
          stepperStyles.button,
          value >= max && stepperStyles.buttonDisabled,
          pressed && stepperStyles.pressed,
        ]}
      >
        <Plus size={18} color={value >= max ? '#cbd5e1' : '#2563eb'} />
      </Pressable>
    </View>
  );
}

function PriceInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={inputStyles.row}>
      <Text style={priceStyles.dollar}>$</Text>
      <TextInput
        style={inputStyles.input}
        placeholder="0"
        placeholderTextColor="#94a3b8"
        keyboardType="number-pad"
        value={value}
        onChangeText={(raw) => onChange(raw.replace(/\D/g, '').slice(0, 3))}
      />
    </View>
  );
}

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
  return parts.filter(Boolean).join('/');
}

function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  const parts = [digits.slice(0, 2), digits.slice(2, 4)];
  return parts.filter(Boolean).join(':');
}

type ValidationErrors = Record<string, string | undefined>;

function validate(
  from: string,
  to: string,
  _tripType: TripType,
  date: string,
  time: string,
  price: string
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!from.trim()) errors.from = 'Enter a pickup suburb, station or landmark.';
  if (!to.trim()) errors.to = 'Enter a destination.';
  else if (to.trim().toLowerCase() === from.trim().toLowerCase())
    errors.to = "Destination must be different from pickup.";

  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  if (!dateMatch) {
    errors.date = 'Enter a valid date as DD/MM/YYYY.';
  } else {
    const [, dd, mm, yyyy] = dateMatch.map(Number) as unknown as number[];
    const parsed = new Date(yyyy, mm - 1, dd);
    if (
      parsed.getDate() !== dd ||
      parsed.getMonth() !== mm - 1 ||
      parsed.getFullYear() !== yyyy ||
      parsed.getTime() < startOfToday()
    ) {
      errors.date = 'Enter a real date that is today or in the future.';
    }
  }

  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!timeMatch) {
    errors.time = 'Enter a valid time as HH:MM (24h).';
  } else {
    const hh = Number(timeMatch[1]);
    const mm2 = Number(timeMatch[2]);
    if (hh > 23 || mm2 > 59)
      errors.time = 'Hours 00–23, minutes 00–59.';
  }

  const priceNum = Number(price);
  if (!price.trim() || Number.isNaN(priceNum) || priceNum <= 0 || priceNum > 999)
    errors.price = 'Enter a fare between $1 and $999.';

  return errors;
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function buildDepartureIso(date: string, time: string): string {
  const [dd, mm, yyyy] = date.split('/').map(Number);
  const [hh, mins] = time.split(':').map(Number);
  return new Date(yyyy, mm - 1, dd, hh, mins).toISOString();
}

const defaultVehicle: Vehicle = {
  make: 'My car',
  model: '',
  color: '—',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  formCardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
  confirmText: {
    textAlign: 'center',
    color: '#15803d',
    fontWeight: '600',
    marginTop: 12,
    fontSize: 13,
  },
  againWrap: {
    marginTop: 12,
  },
});

const repeatStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 2,
  },
  hint: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 3,
  },
});

const fieldStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    userSelect: 'none',
  },
  error: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 5,
  },
});

const inputStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#0f172a',
  },
});

const stepperStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    userSelect: 'none',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  },
  buttonDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  pressed: {
    opacity: 0.7,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    minWidth: 24,
    textAlign: 'center',
    userSelect: 'none',
  },
});

const priceStyles = StyleSheet.create({
  dollar: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
});

const preferenceStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextActive: {
    color: '#fff',
  },
});
