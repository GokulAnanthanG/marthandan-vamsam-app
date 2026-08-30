import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Header title="Marthandan Vamsam" showLanguageToggle={true} />
      
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome, {user?.fullName}</Text>
        <Text style={styles.role}>Role: {user?.role}</Text>
        
        <View style={styles.logoutContainer}>
          <Button title={t('logout')} onPress={logout} variant="outline" />
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
  },
  logoutContainer: {
    marginTop: 40,
    width: '100%',
    maxWidth: 200,
  }
});

export default HomeScreen;
