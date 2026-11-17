import os

file_path = r'f:\Project\Marthandan-Vamsam\MarthandanVamsam\src\screens\main\EventCalendarScreen.tsx'

content = '''import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions, Platform, ImageBackground, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Clock, MapPin, X, ShieldCheck, Plus, Calendar as CalendarIcon, CalendarCheck, ChevronRight, ChevronLeft } from 'lucide-react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

LocaleConfig.locales['en-ta'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun\\n??????', 'Mon\\n???????', 'Tue\\n????????', 'Wed\\n?????', 'Thu\\n???????', 'Fri\\n??????', 'Sat\\n???'],
  today: 'Today'
};
LocaleConfig.defaultLocale = 'en-ta';

const HeritageDivider = () => (
  <Svg width="180" height="20" viewBox="0 0 180 20">
    <Path d="M20 10 L80 10" stroke="#C9A85A" strokeWidth="1" />
    <Path d="M100 10 L160 10" stroke="#C9A85A" strokeWidth="1" />
    <Circle cx="20" cy="10" r="2" fill="#C9A85A" />
    <Circle cx="160" cy="10" r="2" fill="#C9A85A" />
    <Path d="M90 6 L94 10 L90 14 L86 10 Z" fill="#C9A85A" />
  </Svg>
);

const LeafOrnament = () => (
  <Svg width="48" height="48" viewBox="0 0 24 24">
    <Path d="M11 22V15C11 13 9 12 7 11V9C10 10 11 12 12 13C13 12 14 10 17 9V11C15 12 13 13 13 15V22H11Z" fill="#C9A85A" />
    <Circle cx="12" cy="5" r="3.5" fill="#C9A85A" />
    <Circle cx="7" cy="7" r="3" fill="#C9A85A" />
    <Circle cx="17" cy="7" r="3" fill="#C9A85A" />
    <Circle cx="4.5" cy="10.5" r="2.5" fill="#C9A85A" />
    <Circle cx="19.5" cy="10.5" r="2.5" fill="#C9A85A" />
    <Circle cx="9" cy="3" r="2" fill="#C9A85A" />
    <Circle cx="15" cy="3" r="2" fill="#C9A85A" />
  </Svg>
);

const Header = ({ language, setLanguage, insets }: any) => (
  <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, spacing.xl) }]}>
    <View style={styles.headerContent}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitleEn} numberOfLines={1}>MARTHANDAN VAMSAM</Text>
        <Text style={styles.headerTitleTa} numberOfLines={1}>????????????? ??????</Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>Our Roots. Our Generations. Our Legacy.</Text>
      </View>
      
      <View style={styles.languageContainer}>
        <View style={styles.languageToggle}>
          <TouchableOpacity 
            style={language === 'ta' ? styles.langPillActive : styles.langPillInactive}
            onPress={() => setLanguage('ta')}
            activeOpacity={0.8}
          >
            <Text style={language === 'ta' ? styles.langTextActive : styles.langTextInactive}>?????</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={language === 'en' ? styles.langPillActive : styles.langPillInactive}
            onPress={() => setLanguage('en')}
            activeOpacity={0.8}
          >
            <Text style={language === 'en' ? styles.langTextActive : styles.langTextInactive}>EN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

const CustomCalendarHeader = (date: any) => {
  const d = new Date(date);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return (
    <View style={styles.customCalendarHeader}>
      <View style={{ transform: [{ scale: 0.5 }] }}><LeafOrnament /></View>
      <Text style={styles.customCalendarMonth}>{months[d.getMonth()]} {d.getFullYear()}</Text>
      <View style={{ transform: [{ scale: 0.5 }] }}><LeafOrnament /></View>
    </View>
  );
};

const CalendarCard = ({ selectedDate, setSelectedDate, markedDates }: any) => (
  <View style={styles.calendarContainer}>
    <Calendar
      current={selectedDate}
      onDayPress={(day: any) => setSelectedDate(day.dateString)}
      markedDates={markedDates}
      renderHeader={(date: any) => CustomCalendarHeader(date)}
      renderArrow={(direction: string) => 
        <View style={styles.calendarArrow}>
          {direction === 'left' ? <ChevronLeft size={20} color="#19352D" /> : <ChevronRight size={20} color="#19352D" />}
        </View>
      }
      theme={{
        backgroundColor: '#FFFFFF',
        calendarBackground: '#FFFFFF',
        textSectionTitleColor: '#19352D',
        selectedDayBackgroundColor: '#004831',
        selectedDayTextColor: '#FFFFFF',
        todayTextColor: '#C9A85A',
        dayTextColor: '#718078',
        textDisabledColor: '#D3D3D3',
        dotColor: '#C9A85A',
        selectedDotColor: '#C9A85A',
        textDayFontFamily: 'Montserrat_500Medium',
        textDayHeaderFontFamily: 'Montserrat_600SemiBold',
        'stylesheet.calendar.header': {
          dayHeader: {
            marginTop: 10,
            marginBottom: 10,
            textAlign: 'center',
            fontSize: 11,
            color: '#19352D',
            lineHeight: 16,
          },
        },
        'stylesheet.day.basic': {
          base: {
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
          },
          text: {
            marginTop: Platform.OS === 'android' ? 2 : 4,
            fontSize: 16,
            color: '#718078',
            backgroundColor: 'rgba(255, 255, 255, 0)',
            fontFamily: 'Montserrat_500Medium',
          },
          selected: {
            backgroundColor: '#004831',
            borderRadius: 18,
          }
        }
      } as any}
      style={styles.calendar}
    />
    <View style={styles.calendarFooter}>
      <View style={styles.calendarFooterLeft}>
        <CalendarIcon size={20} color="#C9A85A" style={{marginRight: 10}} />
        <View>
          <Text style={styles.calendarFooterLabel}>??????????????????? ????</Text>
          <Text style={styles.calendarFooterDate}>5 April 2027</Text>
          <Text style={styles.calendarFooterSub}>(???????)</Text>
        </View>
      </View>
      <View style={styles.summaryBadge}>
        <Text style={styles.summaryBadgeText}>• 1 ???????</Text>
      </View>
    </View>
  </View>
);

const EventCard = ({ item }: any) => {
  return (
    <View style={styles.eventCard}>
      {/* Arched Date Badge */}
      <View style={styles.archedBadge}>
        <Text style={styles.archedDay}>5</Text>
        <Text style={styles.archedMonth}>APR</Text>
        <Text style={styles.archedYear}>2027</Text>
      </View>
      
      {/* Event Illustration */}
      <View style={styles.eventImageContainer}>
        <View style={styles.illustrationCircle}>
          <Image 
            source={require('../../assets/images/wedding_icon.jpg')} 
            style={{ width: 44, height: 44, borderRadius: 22 }} 
          />
        </View>
      </View>

      {/* Event Details */}
      <View style={styles.eventInfo}>
        <View style={styles.eventHeaderRow}>
          <Text style={styles.eventName} numberOfLines={1}>{item.eventName}</Text>
          <View style={styles.statusBadge}>
            <ShieldCheck size={12} color="#004831" style={styles.shieldIcon} />
            <Text style={styles.statusTextApproved}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.eventDetailRow}>
          <Clock size={12} color="#C9A85A" />
          <Text style={styles.eventDetailText}>Time: <Text style={styles.eventDetailValue}>{item.time}</Text></Text>
        </View>
        <View style={styles.eventDetailRow}>
          <MapPin size={12} color="#C9A85A" />
          <Text style={styles.eventDetailText}>Location: <Text style={styles.eventDetailValue}>{item.location}</Text></Text>
        </View>
        
        {item.description ? (
          <Text style={styles.eventDesc}>{item.description}</Text>
        ) : null}
      </View>
      
      <ChevronRight size={20} color="#718078" style={{alignSelf: 'center', marginRight: 16}} />
    </View>
  );
};

// --- Main Screen ---
const EventCalendarScreen = () => {
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    // Mock data for UI presentation
    setEvents([{
      _id: '1',
      eventName: 'Wedding',
      date: '2027-04-05',
      time: '10 AM',
      location: 'Chennai',
      description: "Son's wedding",
      status: 'Approved'
    }]);
  }, []);

  const markedDates: any = {};
  markedDates['2027-04-05'] = { marked: true, dotColor: '#C9A85A' };
  markedDates[selectedDate] = { 
    ...markedDates[selectedDate], 
    selected: true, 
    selectedColor: '#004831', 
    selectedTextColor: '#FFFFFF' 
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/login-bg.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header language={language} setLanguage={setLanguage} insets={insets} />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <CalendarCard selectedDate={selectedDate} setSelectedDate={setSelectedDate} markedDates={markedDates} />
          
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderTitle}>Events for 5 April 2027</Text>
            <View style={{ height: 20, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              <HeritageDivider />
            </View>
          </View>

          <View style={styles.listContainer}>
            {events.map(item => <EventCard key={item._id} item={item} />)}
            
            {/* Sub-Navigation Footer Divider */}
            <View style={styles.subNavigationFooter}>
              <View style={styles.subNavLine} />
              <Text style={styles.subNavText}>?????????  •  ???????  •  ??????????</Text>
              <View style={styles.subNavLine} />
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  headerContainer: {
    paddingBottom: spacing.l,
    paddingHorizontal: spacing.l,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.s,
    zIndex: 1,
  },
  logoContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerTextContainer: {
    flex: 1,
    paddingHorizontal: spacing.s,
    justifyContent: 'center',
  },
  headerTitleEn: {
    color: '#19352D',
    fontSize: 16,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerTitleTa: {
    color: '#19352D',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'Montserrat_500Medium',
  },
  headerSubtitle: {
    color: '#718078',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
  },
  languageContainer: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C9A85A',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    height: 34,
    width: 80,
    padding: 2,
  },
  langPillActive: {
    flex: 1,
    backgroundColor: '#004831', 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  langPillInactive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  langTextInactive: {
    color: '#19352D',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  content: { 
    flex: 1,
    paddingTop: spacing.s,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: spacing.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
  },
  customCalendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 10,
  },
  customCalendarMonth: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#19352D',
    fontFamily: 'CormorantGaramond_600SemiBold',
    marginHorizontal: 4,
  },
  calendarArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9F7F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    padding: spacing.l,
    paddingBottom: spacing.s,
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    backgroundColor: '#F9F7F2',
    borderTopWidth: 1,
    borderColor: '#E5DDCF',
  },
  calendarFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarFooterLabel: {
    fontSize: 10,
    color: '#718078',
    fontFamily: 'Montserrat_500Medium',
  },
  calendarFooterDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#19352D',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  calendarFooterSub: {
    fontSize: 11,
    color: '#718078',
    fontFamily: 'Montserrat_500Medium',
  },
  summaryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5DDCF',
  },
  summaryBadgeText: {
    color: '#19352D',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.l,
    marginHorizontal: spacing.xl,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontWeight: 'bold',
    color: '#19352D',
    marginRight: 12,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 160,
  },
  eventCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    marginBottom: spacing.l, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    flexDirection: 'row',
    padding: 12,
  },
  archedBadge: {
    backgroundColor: '#004831',
    width: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#C9A85A',
  },
  archedDay: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  archedMonth: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 1,
    fontFamily: 'Montserrat_600SemiBold',
  },
  archedYear: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'Montserrat_500Medium',
  },
  eventImageContainer: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9F7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DDCF',
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  eventHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  eventName: { 
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#19352D', 
    flex: 1,
  },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    backgroundColor: '#F9F7F2',
  },
  statusTextApproved: { 
    color: '#004831',
    fontSize: 10, 
    fontWeight: '700',
    fontFamily: 'Montserrat_600SemiBold',
  },
  shieldIcon: {
    marginRight: 4,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailText: { 
    fontSize: 11,
    color: '#718078',
    marginLeft: 6,
    fontFamily: 'Montserrat_500Medium',
  },
  eventDetailValue: {
    fontWeight: '600',
    color: '#19352D',
  },
  eventDesc: { 
    fontSize: 12,
    color: '#19352D', 
    fontStyle: 'italic',
    marginTop: 6,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  subNavigationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.l,
    gap: 8,
  },
  subNavLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5DDCF',
  },
  subNavText: {
    color: '#7A847F',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat_500Medium',
  }
});

export default EventCalendarScreen;
'''

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Calendar UI updated.")
