import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../components/common/Header';
import { colors } from '../../theme/colors';
import {
  Bell,
  Network,
  Cake,
  Calendar,
  MapPin,
  Briefcase,
  Store,
  Heart,
  FolderDown,
  Ellipsis,
  X,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react-native';

const logoImg = require('../../assets/images/logo.png');

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return language === 'ta' ? 'காலை வணக்கம் 👋' : 'Good Morning 👋';
    } else if (hour < 17) {
      return language === 'ta' ? 'மதிய வணக்கம் 👋' : 'Good Afternoon 👋';
    } else {
      return language === 'ta' ? 'மாலை வணக்கம் 👋' : 'Good Evening 👋';
    }
  };

  const displayName = user?.fullName || user?.name || (language === 'ta' ? 'உறுப்பினர்' : 'R V Anand');
  const userInitial = displayName.trim().charAt(0).toUpperCase();

  const quickAccessItems = [
    {
      id: 'familyTree',
      title: t('familyTree') || (language === 'ta' ? 'குடும்ப மரம்' : 'Family Tree'),
      icon: Network,
      iconBg: '#E8F8F0',
      iconColor: '#10B981',
      onPress: () => navigation?.navigate('FamilyTreeTab'),
    },
    {
      id: 'birthdays',
      title: t('birthdays') || (language === 'ta' ? 'பிறந்தநாட்கள்' : 'Birthdays'),
      icon: Cake,
      iconBg: '#FDF2F4',
      iconColor: '#F43F5E',
      onPress: () => setActiveModal('birthdays'),
    },
    {
      id: 'events',
      title: t('events') || (language === 'ta' ? 'நிகழ்வுகள்' : 'Events'),
      icon: Calendar,
      iconBg: '#F5F3FF',
      iconColor: '#8B5CF6',
      onPress: () => navigation?.navigate('EventsTab'),
    },
    {
      id: 'houseLocations',
      title: t('houseLocations') || (language === 'ta' ? 'இல்லங்கள்' : 'House Locations'),
      icon: MapPin,
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
      onPress: () => navigation?.navigate('HouseDirectory'),
    },
    {
      id: 'jobsBusiness',
      title: t('jobsBusiness') || (language === 'ta' ? 'தொழில் & வேலை' : 'Jobs & Business'),
      icon: Briefcase,
      iconBg: '#FFF7ED',
      iconColor: '#F97316',
      onPress: () => navigation?.navigate('BusinessWorkDirectory', { initialTab: 'work' }),
    },
    {
      id: 'shopLocations',
      title: t('shopLocations') || (language === 'ta' ? 'வணிகக் கடைகள்' : 'Shop Locations'),
      icon: Store,
      iconBg: '#F0FDFA',
      iconColor: '#0D9488',
      onPress: () => navigation?.navigate('BusinessWorkDirectory', { initialTab: 'business' }),
    },
    {
      id: 'marriageAgeList',
      title: t('marriageAgeList') || (language === 'ta' ? 'திருமண வரன்' : 'Marriage Age List'),
      icon: Heart,
      iconBg: '#FDF2F8',
      iconColor: '#EC4899',
      onPress: () => navigation?.navigate('MatrimonialDirectory'),
    },
    {
      id: 'downloads',
      title: t('downloads') || (language === 'ta' ? 'பதிவிறக்கங்கள்' : 'Downloads'),
      icon: FolderDown,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      onPress: () => setActiveModal('downloads'),
    },
    {
      id: 'more',
      title: t('more') || (language === 'ta' ? 'மேலும்' : 'More'),
      icon: Ellipsis,
      iconBg: '#F1F5F9',
      iconColor: '#64748B',
      onPress: () => setActiveModal('more'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Kept header exactly as required */}
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Greeting & User Profile Row */}
        <View style={styles.greetingBar}>
          <TouchableOpacity
            style={styles.userProfileWrap}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('ProfileTab')}
          >
            <View style={styles.avatarContainer}>
              {user?.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{userInitial}</Text>
              )}
            </View>
            <View style={styles.greetingTextContainer}>
              <Text style={styles.greetingSubtitle}>{getGreeting()}</Text>
              <Text style={styles.greetingTitle} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation?.navigate('NotificationScreen')}
            activeOpacity={0.7}
          >
            <Bell size={21} color="#19352D" />
            <View style={styles.bellBadgeDot} />
          </TouchableOpacity>
        </View>

        {/* 2. Together We Grow Heritage Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerTag}>
              <Sparkles size={11} color="#C5A059" style={{ marginRight: 4 }} />
              <Text style={styles.bannerTagText}>MARTHANDAN VAMSAM</Text>
            </View>
            <Text style={styles.bannerTitle}>
              {language === 'ta' ? (
                <>ஒன்றாக வளர்வோம்,{"\n"}இணைந்தே இருப்போம்</>
              ) : (
                <>Together We Grow,{"\n"}Together We Stay{"\n"}Connected</>
              )}
            </Text>
          </View>
          <View style={styles.bannerRight}>
            <Image source={logoImg} style={styles.bannerImage} />
          </View>
        </View>

        {/* 3. Section Title: Quick Access */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('quickAccess') || (language === 'ta' ? 'விரைவு அணுகல்' : 'Quick Access')}
          </Text>
        </View>

        {/* 4. 3x3 Quick Access Grid */}
        <View style={styles.quickGrid}>
          {quickAccessItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.quickCard}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                  <IconComponent size={24} color={item.iconColor} strokeWidth={2.1} />
                </View>
                <Text style={styles.quickCardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Info / Quick Action Modal */}
      <Modal
        visible={!!activeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveModal(null)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === 'birthdays' && (language === 'ta' ? 'பிறந்தநாட்கள்' : 'Birthdays')}
                {activeModal === 'houseLocations' && (language === 'ta' ? 'இல்லங்கள் & முகவரிகள்' : 'House Locations')}
                {activeModal === 'jobsBusiness' && (language === 'ta' ? 'தொழில் & வேலைவாய்ப்புகள்' : 'Jobs & Business')}
                {activeModal === 'shopLocations' && (language === 'ta' ? 'வணிகக் கடைகள்' : 'Shop Locations')}
                {activeModal === 'marriageAgeList' && (language === 'ta' ? 'திருமண வரன் பட்டியல்' : 'Marriage Age List')}
                {activeModal === 'downloads' && (language === 'ta' ? 'பதிவிறக்கங்கள்' : 'Downloads')}
                {activeModal === 'more' && (language === 'ta' ? 'கூடுதல் வசதிகள்' : 'More Options')}
                {activeModal === 'notifications' && (language === 'ta' ? 'அறிவிப்புகள்' : 'Notifications')}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {activeModal === 'more' ? (
                <View style={styles.moreOptionsList}>
                  <TouchableOpacity
                    style={styles.moreOptionItem}
                    onPress={() => {
                      setActiveModal(null);
                      navigation?.navigate('ProfileTab');
                    }}
                  >
                    <View style={styles.moreOptionLeft}>
                      <UserIcon size={18} color="#063A2F" />
                      <Text style={styles.moreOptionText}>
                        {language === 'ta' ? 'சுயவிவரம்' : 'My Profile'}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#C0B8A8" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.moreOptionItem}
                    onPress={() => {
                      setActiveModal(null);
                      navigation?.navigate('FamilyTreeTab');
                    }}
                  >
                    <View style={styles.moreOptionLeft}>
                      <Network size={18} color="#063A2F" />
                      <Text style={styles.moreOptionText}>
                        {language === 'ta' ? 'குடும்ப மரம்' : 'Family Tree'}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#C0B8A8" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.moreOptionItem}
                    onPress={() => {
                      setActiveModal(null);
                      navigation?.navigate('EventsTab');
                    }}
                  >
                    <View style={styles.moreOptionLeft}>
                      <Calendar size={18} color="#063A2F" />
                      <Text style={styles.moreOptionText}>
                        {language === 'ta' ? 'நிகழ்வுகள் நாள்காட்டி' : 'Events Calendar'}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#C0B8A8" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.moreOptionItem}
                    onPress={() => {
                      setActiveModal(null);
                      navigation?.navigate('AccessRequestManagement');
                    }}
                  >
                    <View style={styles.moreOptionLeft}>
                      <ShieldCheck size={18} color="#063A2F" />
                      <Text style={styles.moreOptionText}>
                        {language === 'ta' ? 'அணுகல் அனுமதி கோரிக்கைகள்' : 'Access Request Management'}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#C0B8A8" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.moreOptionItem, { borderBottomWidth: 0, marginTop: 8 }]}
                    onPress={() => {
                      setActiveModal(null);
                      logout();
                    }}
                  >
                    <View style={styles.moreOptionLeft}>
                      <LogOut size={18} color="#C94A5A" />
                      <Text style={[styles.moreOptionText, { color: '#C94A5A' }]}>
                        {language === 'ta' ? 'வெளியேறு' : 'Logout'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : activeModal === 'notifications' ? (
                <View style={styles.modalPlaceholderWrap}>
                  <Bell size={36} color="#C5A059" style={{ marginBottom: 12 }} />
                  <Text style={styles.modalPlaceholderTitle}>
                    {language === 'ta' ? 'புதிய அறிவிப்புகள் இல்லை' : 'No New Notifications'}
                  </Text>
                  <Text style={styles.modalPlaceholderDesc}>
                    {language === 'ta'
                      ? 'உங்கள் வம்ச நிகழ்வுகள் மற்றும் வாழ்த்துகள் இங்கே தோன்றும்.'
                      : 'Upcoming events, birthday reminders and announcements will appear here.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.modalPlaceholderWrap}>
                  <Sparkles size={36} color="#C5A059" style={{ marginBottom: 12 }} />
                  <Text style={styles.modalPlaceholderTitle}>
                    {language === 'ta' ? 'விரைவில் இணைக்கப்படும்' : 'Coming Soon'}
                  </Text>
                  <Text style={styles.modalPlaceholderDesc}>
                    {language === 'ta'
                      ? 'இந்த பகுதி விரைவில் புதுப்பிக்கப்படும்.'
                      : 'This directory feature is being updated with the latest community records.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F2',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110, // Generous space so bottom nav never overlaps
  },

  // 1. Greeting Bar
  greetingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 4,
  },
  userProfileWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5DDCF',
    borderWidth: 1.5,
    borderColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#19352D',
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#718078',
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#19352D',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEAE0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  bellBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E1B95B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // 2. Banner Card
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: '#EBF4EE',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D3E6DC',
    padding: 18,
    marginTop: 14,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerLeft: {
    flex: 1.25,
    paddingRight: 6,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 56, 39, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerTagText: {
    fontSize: 9,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#0F3827',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#0D382A',
    lineHeight: 22,
  },
  bannerRight: {
    flex: 0.95,
    height: 108,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  // 3. Section Header
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#19352D',
  },

  // 4. Quick Access Grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickCard: {
    width: '30.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE0',
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 105,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickCardTitle: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#19352D',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE4',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#19352D',
  },
  modalBody: {
    paddingVertical: 8,
  },
  modalPlaceholderWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalPlaceholderTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#19352D',
    marginBottom: 6,
  },
  modalPlaceholderDesc: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#718078',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  moreOptionsList: {
    paddingVertical: 4,
  },
  moreOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EB',
  },
  moreOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moreOptionText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#19352D',
  },
});

export default HomeScreen;
