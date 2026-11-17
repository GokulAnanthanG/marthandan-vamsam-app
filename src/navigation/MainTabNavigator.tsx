import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Plus, Users, User, Sun, Sparkles, Flower2 } from 'lucide-react-native';
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
  const { t } = useLanguage();

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

        if (route.name === 'AddEventTab') {
          return (
            <View key={route.key} style={styles.navItem}>
              <View style={styles.fabOrnamentContainer}>
                {/* Pure vector/SVG sunburst halo using Lucide */}
                <Sun size={110} color="#C5A059" style={{position: 'absolute', opacity: 0.15}} strokeWidth={1} />
                <Flower2 size={90} color="#C5A059" style={{position: 'absolute', opacity: 0.2, transform: [{rotate: '45deg'}]}} strokeWidth={1} />
                <Sparkles size={80} color="#C5A059" style={{position: 'absolute', opacity: 0.3}} strokeWidth={1} />
              </View>
              <TouchableOpacity
                style={styles.fabContainer}
                onPress={onPress}
                activeOpacity={0.9}
              >
                <Plus color="#FFFFFF" size={32} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          );
        }

        let Icon = Home;
        let label = '';
        if (route.name === 'HomeTab') { Icon = Home; label = 'முகப்பு'; }
        if (route.name === 'EventsTab') { Icon = Calendar; label = 'நிகழ்வுகள்'; }
        if (route.name === 'FamilyTreeTab') { Icon = Users; label = 'குடும்பம்'; }
        if (route.name === 'ProfileTab') { Icon = User; label = 'பயணர்'; }

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
              {route.name === 'FamilyTreeTab' && (
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
      <Tab.Screen 
        name="AddEventTab" 
        component={() => null}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            console.log('Central Add Action Triggered');
          },
        })}
      />
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
  fabOrnamentContainer: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
  },
  fabContainer: {
    position: 'absolute',
    top: -26,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C5A059', // Gold background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#063A2F', // Outer deep green stroke matching navbar
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
