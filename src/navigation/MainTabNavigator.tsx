import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Users, User } from 'lucide-react-native';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/main/HomeScreen';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';

import FamilyTreeScreen from '../screens/FamilyTree/FamilyTreeScreen';
import EventCalendarScreen from '../screens/main/EventCalendarScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.text}>{name} Screen</Text>
    <Text style={styles.subtext}>Coming Soon</Text>
  </View>
);

const HeritageBottomNavigation = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);
  const { language } = useLanguage();

  return (
    <View style={[styles.navContainer, { paddingBottom: bottomPadding }]}>
      {/* Decorative top border line */}
      <View style={styles.navTopBorder} />
      
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let Icon = Home;
        let label = '';
        if (route.name === 'HomeTab') {
          Icon = Home;
          label = language === 'ta' ? 'முகப்பு' : 'Home';
        } else if (route.name === 'EventsTab') {
          Icon = Calendar;
          label = language === 'ta' ? 'நிகழ்வுகள்' : 'Events';
        } else if (route.name === 'FamilyTreeTab') {
          Icon = Users;
          label = language === 'ta' ? 'குடும்பம்' : 'Family';
        } else if (route.name === 'ProfileTab') {
          Icon = User;
          label = language === 'ta' ? 'பயனர்' : 'Profile';
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.navItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon 
                color={isFocused ? '#C5A059' : 'rgba(251, 248, 240, 0.6)'} 
                size={22} 
                strokeWidth={isFocused ? 1.5 : 1.5} 
              />
              {route.name === 'EventsTab' && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.navLabel, 
              { color: isFocused ? '#C5A059' : 'rgba(251, 248, 240, 0.6)' }
            ]}>
              {label}
            </Text>
            {isFocused && <View style={styles.activeIndicatorLine} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <HeritageBottomNavigation {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="EventsTab" component={EventCalendarScreen} />
      <Tab.Screen name="FamilyTreeTab" component={FamilyTreeScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.warmIvory },
  text: { ...typography.h1, color: colors.forestGreen },
  subtext: { ...typography.body, color: colors.secondaryText },
  navContainer: {
    flexDirection: 'row',
    backgroundColor: '#063A2F', // Deep emerald green
    borderTopLeftRadius: 24, // Curved top corners
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    paddingTop: 8,
    height: 72,
    overflow: 'visible',
  },
  navTopBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#C5A059',
    opacity: 0.3,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 56,
  },
  iconContainer: {
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navLabel: {
    ...typography.navLabel,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '400',
  },
  activeIndicatorLine: {
    width: 24, 
    height: 2, 
    borderRadius: 1, 
    backgroundColor: '#C5A059', // Antique gold
    position: 'absolute',
    bottom: -6,
  },
  badgeContainer: {
    position: 'absolute', 
    right: -10, 
    top: -4, 
    backgroundColor: '#E74C3C', 
    borderRadius: 10, 
    minWidth: 16, 
    height: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5, 
    borderColor: '#063A2F', 
    paddingHorizontal: 3
  },
  badgeText: { 
    color: '#FFF', 
    fontSize: 8, 
    fontWeight: 'bold' 
  }
});

export default MainTabNavigator;
