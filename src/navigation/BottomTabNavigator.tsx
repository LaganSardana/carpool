import React from 'react';
import { Platform } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { RootStackParamList } from './RootStack';
import { HomeStackParamList } from './HomeStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';
import OfferRideScreen from '../screens/OfferRideScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Home, MessageCircle, PlusCircle, User } from 'lucide-react-native';

export type ChatParams = {
  driverName?: string;
  from?: string;
  to?: string;
  rideId?: string;
};

export type TabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Offer: undefined;
  Chat: ChatParams | undefined;
  Profile: undefined;
};

export type MainScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, keyof TabParamList>,
  NativeStackScreenProps<RootStackParamList>
>;

const Tab = createBottomTabNavigator<TabParamList>();

const ICON_SIZE = 24;

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
          backgroundColor: '#fff',
          borderTopColor: '#eef2f7',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color }) => <Home size={ICON_SIZE} color={color} />,
        }}
      />
      <Tab.Screen
        name="Offer"
        component={OfferRideScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <PlusCircle size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MessageCircle size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <User size={ICON_SIZE} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}