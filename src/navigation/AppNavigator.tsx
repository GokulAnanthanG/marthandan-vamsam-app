import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import SpecialGuestRequestScreen from '../screens/main/SpecialGuestRequestScreen';
import HouseDirectoryScreen from '../screens/main/HouseDirectoryScreen';
import BusinessWorkDirectoryScreen from '../screens/main/BusinessWorkDirectoryScreen';
import AccessRequestManagementScreen from '../screens/main/AccessRequestManagementScreen';
import MatrimonialDirectoryScreen from '../screens/main/MatrimonialDirectoryScreen';
import NotificationScreen from '../screens/main/NotificationScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#011A0E', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#C9A85A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="SpecialGuestRequest" component={SpecialGuestRequestScreen} />
            <Stack.Screen name="HouseDirectory" component={HouseDirectoryScreen} />
            <Stack.Screen name="BusinessWorkDirectory" component={BusinessWorkDirectoryScreen} />
            <Stack.Screen name="AccessRequestManagement" component={AccessRequestManagementScreen} />
            <Stack.Screen name="MatrimonialDirectory" component={MatrimonialDirectoryScreen} />
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
