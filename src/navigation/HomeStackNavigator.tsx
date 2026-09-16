import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RideDetailsScreen from '../screens/RideDetailsScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import { Ride, TripType } from '../types';

export type HomeStackParamList = {
  Home: undefined;
  SearchResults: { from: string; to: string; tripType?: TripType | 'all' };
  RideDetails: { ride: Ride };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'Search Results' }}
      />
      <Stack.Screen
        name="RideDetails"
        component={RideDetailsScreen}
        options={{ title: 'Ride Details' }}
      />
    </Stack.Navigator>
  );
}