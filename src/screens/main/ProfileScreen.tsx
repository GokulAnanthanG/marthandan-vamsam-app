import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { User as UserIcon, LogOut, ShieldCheck, Phone, ChevronRight, Award, Briefcase, Store, KeyRound, Edit3, X, Check } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { userApi } from '../../services/api';

const BUSINESS_TYPES = ['Retail', 'Wholesale', 'Manufacturing', 'Services', 'Food & Hospitality', 'Real Estate', 'Healthcare', 'Tech & IT', 'Agriculture', 'Other'];
const WORK_FIELDS = ['Information Technology', 'Engineering', 'Government & Public Sector', 'Banking & Finance', 'Healthcare & Medical', 'Education & Teaching', 'Law & Legal', 'Skilled Trade', 'Agriculture', 'Other'];

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Edit classification state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileType, setProfileType] = useState<string>(user?.profileType || 'GENERAL');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessType, setBusinessType] = useState(user?.businessType || 'Retail');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [fieldOfWork, setFieldOfWork] = useState(user?.fieldOfWork || 'Information Technology');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [workAddress, setWorkAddress] = useState(user?.workAddress || '');

  const handleSaveClassification = async () => {
    try {
      setSaving(true);
      await userApi.updateProfile({
        profileType,
        businessName,
        businessType,
        businessAddress,
        occupation,
        fieldOfWork,
        companyName,
        workAddress
      });
      Alert.alert('Success', 'Profile classification updated successfully');
      setEditModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

        {/* Business & Work Classification Section (Requirement 1) */}
        <View style={styles.sectionCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionHeader}>
              {language === 'ta' ? 'தொழில் & பணி விவரங்கள்' : 'Business & Work Classification'}
            </Text>
            <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editBtn}>
              <Edit3 size={15} color="#063A2F" style={{ marginRight: 4 }} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Type */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Award size={18} color="#063A2F" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Profile Category</Text>
              <Text style={styles.infoValue}>{user?.profileType || profileType || 'General'}</Text>
            </View>
          </View>

          {/* Business Type */}
          <View style={[styles.infoRow, styles.rowBorderTop]}>
            <View style={styles.infoIconBox}>
              <Store size={18} color="#063A2F" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Business Name & Type</Text>
              <Text style={styles.infoValue}>
                {user?.businessName ? `${user.businessName} • ${user.businessType || 'General'}` : 'Not Specified'}
              </Text>
            </View>
          </View>

          {/* Field of Work */}
          <View style={[styles.infoRow, styles.rowBorderTop]}>
            <View style={styles.infoIconBox}>
              <Briefcase size={18} color="#063A2F" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Field of Work & Role</Text>
              <Text style={styles.infoValue}>
                {user?.occupation ? `${user.occupation} • ${user.fieldOfWork || 'General'}` : (user?.fieldOfWork || 'Not Specified')}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>
            {language === 'ta' ? 'கணக்கு மேலாண்மை' : 'Account Actions'}
          </Text>

          {/* Centralized Access Requests Manager (Requirement 5) */}
          <TouchableOpacity
            style={[styles.logoutButton, { marginBottom: 12, borderColor: '#D3E6DC', backgroundColor: '#F0FDF4' }]}
            onPress={() => navigation?.navigate('AccessRequestManagement')}
            activeOpacity={0.7}
          >
            <View style={[styles.logoutIconBox, { backgroundColor: 'rgba(15, 56, 39, 0.1)' }]}>
              <KeyRound size={20} color="#063A2F" />
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={[styles.logoutTitle, { color: '#063A2F' }]}>Access Requests Management</Text>
              <Text style={styles.logoutSubtitle}>Review House, Work, Varan, and Business requests</Text>
            </View>
            <ChevronRight size={18} color="#063A2F" />
          </TouchableOpacity>

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

      {/* Edit Classification Modal (Requirement 1) */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Classification</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Profile Category</Text>
              <View style={styles.profileTypeRow}>
                {(['GENERAL', 'BUSINESS', 'WORK', 'BOTH'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.profileTypeBtn, profileType === type && styles.profileTypeBtnActive]}
                    onPress={() => setProfileType(type)}
                  >
                    <Text style={[styles.profileTypeText, profileType === type && styles.profileTypeTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(profileType === 'BUSINESS' || profileType === 'BOTH') && (
                <View style={styles.formBox}>
                  <Text style={styles.formBoxTitle}>🏢 Business Details</Text>
                  <Text style={styles.inputLabel}>Business Name</Text>
                  <TextInput style={styles.textInput} value={businessName} onChangeText={setBusinessName} placeholder="e.g. Marthandan Silks" />

                  <Text style={styles.inputLabel}>Business Type</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {BUSINESS_TYPES.map(bt => (
                      <TouchableOpacity
                        key={bt}
                        style={[styles.chip, businessType === bt && styles.chipActive]}
                        onPress={() => setBusinessType(bt)}
                      >
                        <Text style={[styles.chipText, businessType === bt && styles.chipTextActive]}>{bt}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.inputLabel}>Business Address</Text>
                  <TextInput style={styles.textInput} value={businessAddress} onChangeText={setBusinessAddress} placeholder="Address in Marthandan" />
                </View>
              )}

              {(profileType === 'WORK' || profileType === 'BOTH') && (
                <View style={styles.formBox}>
                  <Text style={styles.formBoxTitle}>💼 Work Profile</Text>
                  <Text style={styles.inputLabel}>Occupation / Role</Text>
                  <TextInput style={styles.textInput} value={occupation} onChangeText={setOccupation} placeholder="e.g. Senior Software Architect" />

                  <Text style={styles.inputLabel}>Field of Work</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {WORK_FIELDS.map(wf => (
                      <TouchableOpacity
                        key={wf}
                        style={[styles.chip, fieldOfWork === wf && styles.chipActive]}
                        onPress={() => setFieldOfWork(wf)}
                      >
                        <Text style={[styles.chipText, fieldOfWork === wf && styles.chipTextActive]}>{wf}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.inputLabel}>Company Name</Text>
                  <TextInput style={styles.textInput} value={companyName} onChangeText={setCompanyName} placeholder="e.g. Infosys, State Govt, etc." />

                  <Text style={styles.inputLabel}>Work Location / Address</Text>
                  <TextInput style={styles.textInput} value={workAddress} onChangeText={setWorkAddress} placeholder="City, State" />
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveClassification} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Classification</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D3E6DC',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#063A2F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#19352D',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#19352D',
    marginBottom: 6,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#F9F7F2',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#19352D',
    marginBottom: 10,
  },
  profileTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  profileTypeBtn: {
    flex: 1,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F9F7F2',
  },
  profileTypeBtnActive: {
    backgroundColor: '#004831',
    borderColor: '#004831',
  },
  profileTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#19352D',
  },
  profileTypeTextActive: {
    color: '#FFFFFF',
  },
  formBox: {
    backgroundColor: '#FDFCF9',
    borderWidth: 1,
    borderColor: '#EFEAE0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  formBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#004831',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F9F7F2',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#004831',
    borderColor: '#004831',
  },
  chipText: {
    fontSize: 12,
    color: '#19352D',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#004831',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProfileScreen;
