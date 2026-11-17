import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { User as UserIcon, LogOut, ShieldCheck, Phone, ChevronRight, Award } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'MV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout') || 'Logout',
      language === 'ta'
        ? 'நீங்கள் நிச்சயமாக உங்கள் கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா?'
        : 'Are you sure you want to log out of your account?',
      [
        {
          text: language === 'ta' ? 'ரத்துசெய்' : 'Cancel',
          style: 'cancel',
        },
        {
          text: t('logout') || 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (error) {
              Alert.alert(
                t('error') || 'Error',
                language === 'ta' ? 'வெளியேறுவதில் தோல்வி' : 'Failed to logout'
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Award size={14} color="#063A2F" />
            </View>
          </View>

          <Text style={styles.userName}>{user?.fullName || (language === 'ta' ? 'குடும்ப உறுப்பினர்' : 'Family Member')}</Text>

          <View style={styles.roleBadgeContainer}>
            <ShieldCheck size={14} color="#C5A059" />
            <Text style={styles.roleText}>{user?.role || 'Member'}</Text>
          </View>
        </View>

        {/* Account Details Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>
            {language === 'ta' ? 'கணக்கு விவரங்கள்' : 'Account Details'}
          </Text>

          {/* Full Name Item */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <UserIcon size={18} color="#063A2F" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('fullName') || 'Full Name'}</Text>
              <Text style={styles.infoValue}>{user?.fullName || '-'}</Text>
            </View>
          </View>

          {/* Mobile Number Item (if available) */}
          {user?.mobileNumber && (
            <View style={[styles.infoRow, styles.rowBorderTop]}>
              <View style={styles.infoIconBox}>
                <Phone size={18} color="#063A2F" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('mobileNumber') || 'Mobile Number'}</Text>
                <Text style={styles.infoValue}>{user.mobileNumber}</Text>
              </View>
            </View>
          )}

          {/* Role Item */}
          <View style={[styles.infoRow, styles.rowBorderTop]}>
            <View style={styles.infoIconBox}>
              <ShieldCheck size={18} color="#063A2F" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{language === 'ta' ? 'பொறுப்பு / நிலை' : 'Role / Status'}</Text>
              <Text style={styles.infoValue}>{user?.role || 'Member'}</Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>
            {language === 'ta' ? 'கணக்கு மேலாண்மை' : 'Account Actions'}
          </Text>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIconBox}>
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#C94A5A" />
              ) : (
                <LogOut size={20} color="#C94A5A" />
              )}
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={styles.logoutTitle}>{t('logout') || 'Logout'}</Text>
              <Text style={styles.logoutSubtitle}>
                {language === 'ta'
                  ? 'உங்கள் கணக்கிலிருந்து வெளியேறவும்'
                  : 'Sign out of your account on this device'}
              </Text>
            </View>
            <ChevronRight size={18} color="#C94A5A" />
          </TouchableOpacity>
        </View>

        {/* Heritage Footer Note */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerAppName}>MARTHANDAN VAMSAM</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
          <Text style={styles.footerTagline}>
            {language === 'ta'
              ? 'நமது வேர்கள் • நமது தலைமுறைகள் • நமது பெருமை'
              : 'Our Roots • Our Generations • Our Legacy'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110, // Ensure content is above bottom tab bar
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E7E0D2',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#063A2F',
    borderWidth: 3,
    borderColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FBF8F0',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#C5A059',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    ...typography.h1,
    fontSize: 22,
    color: '#063A2F',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#063A2F',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5A059',
  },
  roleText: {
    color: '#C5A059',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E7E0D2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    ...typography.cardTitle,
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7A74',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowBorderTop: {
    borderTopWidth: 1,
    borderTopColor: '#F0EBE0',
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 58, 47, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7A74',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B2E28',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 74, 90, 0.06)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 74, 90, 0.25)',
  },
  logoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(201, 74, 90, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C94A5A',
    marginBottom: 2,
  },
  logoutSubtitle: {
    fontSize: 12,
    color: '#8A5860',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  footerAppName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C5A059',
    letterSpacing: 1.5,
  },
  footerVersion: {
    fontSize: 11,
    color: '#8A9993',
    marginVertical: 2,
  },
  footerTagline: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#6B7A74',
    marginTop: 2,
  },
});

export default ProfileScreen;
