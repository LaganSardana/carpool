import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SendHorizonal } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useRides } from '../mockData/RidesContext';
import type { TabParamList } from '../navigation/BottomTabNavigator';

type ChatRouteProp = BottomTabScreenProps<TabParamList, 'Chat'>['route'];

export default function ChatScreen() {
  const { messages, rides, activeRideId, addMessage, currentUser } = useRides();
  const [draft, setDraft] = useState('');
  const route = useRoute<ChatRouteProp>();

  const activeRide = useMemo(() => {
    if (activeRideId) {
      const found = rides.find((r) => r.id === activeRideId);
      if (found) return found;
    }
    if (route.params?.rideId) {
      const found = rides.find((r) => r.id === route.params?.rideId);
      if (found) return found;
    }
    if (route.params?.from && route.params?.to) {
      return {
        fromLocation: route.params.from,
        toLocation: route.params.to,
        driver: { name: route.params.driverName ?? 'the driver' },
      } as unknown as (typeof rides)[number];
    }
    return null;
  }, [activeRideId, rides, route.params]);

  const driverName = (activeRide as { driver?: { name: string } } | null)?.driver?.name ?? route.params?.driverName ?? 'the driver';
  const driverFirstName = driverName.split(' ')[0] ?? 'the driver';

  const thread = useMemo(
    () => messages.filter((m) => m.rideId === activeRideId),
    [messages, activeRideId]
  );

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !activeRideId) return;
    addMessage({
      id: `msg-${Date.now()}`,
      rideId: activeRideId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      sentAt: new Date().toISOString(),
    });
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {activeRide ? (
          <Text style={styles.subtitle}>
            {driverName} · {activeRide.fromLocation} → {activeRide.toLocation}
          </Text>
        ) : (
          <Text style={styles.subtitle}>No conversation selected</Text>
        )}
      </View>

      <FlatList
        data={thread}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No messages yet — book a ride to start a chat.
          </Text>
        }
        renderItem={({ item }) => {
          const mine = item.senderId === currentUser.id;
          return (
            <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
              <View
                style={[
                  styles.bubble,
                  mine ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                {!mine && (
                  <Text style={styles.senderName}>{item.senderName}</Text>
                )}
                <Text style={[styles.text, mine && styles.textMine]}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={`Message ${driverFirstName}…`}
          placeholderTextColor="#94a3b8"
          value={draft}
          onChangeText={setDraft}
          multiline={true}
          blurOnSubmit={true}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.sendButton,
            (!draft.trim() || pressed) && styles.sendButtonDisabled,
          ]}
        >
          <SendHorizonal size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 40,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleTheirs: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eef2f7',
    borderBottomLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 3,
  },
  text: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  textMine: {
    color: '#fff',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eef2f7',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: '#f8fafc',
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});