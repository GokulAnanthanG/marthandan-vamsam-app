import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, TreeDeciduous, Briefcase, Store, User } from 'lucide-react-native';
import HomeScreen from '../screens/main/HomeScreen';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { View, Text, StyleSheet } from 'react-native';

import FamilyTreeScreen from '../screens/FamilyTree/FamilyTreeScreen';

const Tab = createBottomTabNavigator();

// Placeholder screens for other tabs
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>{name} Screen</Text>
    <Text style={styles.subtext}>Coming Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  text: { fontSize: 24, fontWeight: 'bold', color: colors.primary },
  subtext: { fontSize: 16, color: colors.textSecondary }
});

const MainTabNavigator = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="FamilyTreeTab" 
        component={FamilyTreeScreen} 
        options={{
          tabBarLabel: t('familyTree'),
          tabBarIcon: ({ color, size }) => <TreeDeciduous color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="BusinessesTab" 
        component={() => <PlaceholderScreen name={t('businesses')} />} 
        options={{
          tabBarLabel: t('businesses'),
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ShopsTab" 
        component={() => <PlaceholderScreen name={t('shops')} />} 
        options={{
          tabBarLabel: t('shops'),
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={() => <PlaceholderScreen name={t('profile')} />} 
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
