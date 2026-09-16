import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import BottomTabNavigator, {
  TabParamList,
} from './BottomTabNavigator';

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList> | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}