import React, { useState, useEffect } from 'react';
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
import Header from '../../components/common/Header';

LocaleConfig.locales['en-ta'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun\nஞாயிறு', 'Mon\nதிங்கள்', 'Tue\nசெவ்வாய்', 'Wed\nபுதன்', 'Thu\nவியாழன்', 'Fri\nவெள்ளி', 'Sat\nசனி'],
  today: 'Today'
};
LocaleConfig.defaultLocale = 'en-ta';

const ElegantOrnament = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z" fill="#C9A85A" />
    <Circle cx="12" cy="12" r="2" fill="#F9F7F2" />
  </Svg>
);

const HeritageDivider = () => (
  <Svg width="240" height="20" viewBox="0 0 240 20">
    <Path d="M20 10 L100 10" stroke="#C9A85A" strokeWidth="1" />
    <Path d="M140 10 L220 10" stroke="#C9A85A" strokeWidth="1" />
    <Circle cx="20" cy="10" r="2" fill="#C9A85A" />
    <Circle cx="220" cy="10" r="2" fill="#C9A85A" />
    <Path d="M120 6 L124 10 L120 14 L116 10 Z" fill="#C9A85A" />
  </Svg>
);



const CustomCalendarHeader = (date: any) => {
  const d = new Date(date);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return (
    <View style={styles.customCalendarHeader}>
      <ElegantOrnament />
      <Text style={styles.customCalendarMonth}>{months[d.getMonth()]} {d.getFullYear()}</Text>
      <ElegantOrnament />
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
            marginTop: 0,
            fontSize: 16,
            color: '#718078',
            backgroundColor: 'rgba(255, 255, 255, 0)',
            fontFamily: 'Montserrat_500Medium',
            includeFontPadding: false,
            lineHeight: 18,
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
          <Text style={styles.calendarFooterLabel}>தேர்ந்தெடுக்கப்பட்ட நாள்</Text>
          <Text style={styles.calendarFooterDate}>5 April 2027</Text>
          <Text style={styles.calendarFooterSub}>(திங்கள்)</Text>
        </View>
      </View>
      <View style={styles.summaryBadge}>
        <Text style={styles.summaryBadgeText}>• 1 நிகழ்வு</Text>
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
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CalendarCard selectedDate={selectedDate} setSelectedDate={setSelectedDate} markedDates={markedDates} />
        
        <View style={styles.sectionHeaderWrapper}>
          <Text style={styles.sectionHeaderTitle}>Events for 5 April 2027</Text>
          <View style={{ marginTop: 8 }}>
            <HeritageDivider />
          </View>
        </View>

        <View style={styles.listContainer}>
          {events.map(item => <EventCard key={item._id} item={item} />)}
          
          {/* Sub-Navigation Footer Divider */}
          <View style={styles.subNavigationFooter}>
            <View style={styles.subNavLine} />
            <Text style={styles.subNavText}>குடும்பம்  •  உறவுகள்  •  நிகழ்வுகள்</Text>
            <View style={styles.subNavLine} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9F7F2' 
  },
  content: { 
    flex: 1,
    paddingTop: spacing.xl,
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
    gap: 8,
    marginBottom: 10,
  },
  customCalendarMonth: {
    fontSize: 22,
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
  sectionHeaderWrapper: {
    alignItems: 'center',
    marginBottom: spacing.l,
    paddingHorizontal: spacing.xl,
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontWeight: 'bold',
    color: '#19352D',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    overflow: 'hidden',
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
