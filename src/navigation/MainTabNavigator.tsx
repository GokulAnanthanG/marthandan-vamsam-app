import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, TreeDeciduous, Users, Inbox, User } from 'lucide-react-native';
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
        tabBarActiveTintColor: '#E1B95B',
        tabBarInactiveTintColor: '#889C94',
        tabBarStyle: {
          backgroundColor: '#0F2F20',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Montserrat_500Medium',
          marginTop: 4,
        }
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
        name="MembersTab" 
        component={() => <PlaceholderScreen name={t('members') || 'Members'} />} 
        options={{
          tabBarLabel: t('members') || 'Members',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="RequestsTab" 
        component={() => <PlaceholderScreen name={t('requests') || 'Requests'} />} 
        options={{
          tabBarLabel: t('requests') || 'Requests',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Inbox color={color} size={size} />
              <View style={{
                position: 'absolute', right: -6, top: -4, backgroundColor: '#E04F5F', 
                borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center'
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>2</Text>
              </View>
            </View>
          )
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
