import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RootStack from './src/navigation/RootStack';
import { RidesProvider } from './src/mockData/RidesContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <RidesProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootStack />
        </NavigationContainer>
      </RidesProvider>
    </SafeAreaProvider>
  );
}
