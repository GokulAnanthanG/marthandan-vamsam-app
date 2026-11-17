import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';
import api from '../../services/api';

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/events?status=Approved');
        setEvents(res.data.data.filter((e: any) => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0))));
      } catch (err) {
        console.error('Failed to load events', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome, {user?.fullName}</Text>
        <Text style={styles.role}>Role: {user?.role}</Text>
        
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {loading ? <ActivityIndicator size="small" color={colors.primary} /> : (
            <FlatList 
              data={events}
              keyExtractor={(item: any) => item._id}
              renderItem={({ item }) => (
                <View style={styles.eventCard}>
                  <Text style={styles.eventName}>{item.eventName}</Text>
                  <Text style={styles.eventDetail}>{new Date(item.date).toDateString()} at {item.time}</Text>
                  <Text style={styles.eventDetail}>{item.location}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No upcoming events</Text>}
            />
          )}
        </View>

        <View style={styles.logoutContainer}>
          <Button title={t('logout') || 'Logout'} onPress={logout} variant="outline" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  role: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20
  },
  eventsContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12
  },
  eventCard: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  eventDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20
  },
  logoutContainer: {
    width: '100%',
    maxWidth: 200,
  }
});

export default HomeScreen;
