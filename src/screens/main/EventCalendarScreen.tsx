import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TextInput, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions, Platform, ImageBackground, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { eventsApi } from '../../services/api';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Clock, MapPin, X, ShieldCheck, Plus, Calendar as CalendarIcon, CalendarCheck, ChevronRight, ChevronLeft, Heart, Cake, Home, Sparkles } from 'lucide-react-native';
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

const EVENT_CATEGORIES = [
  { key: 'MARRIAGE', label: 'Marriage', labelTa: 'திருமணம்', icon: Heart, color: '#EC4899', bg: '#FDF2F8' },
  { key: 'BIRTHDAY', label: 'Birthday', labelTa: 'பிறந்தநாள்', icon: Cake, color: '#F43F5E', bg: '#FFF1F2' },
  { key: 'HOUSEWARMING', label: 'Housewarming', labelTa: 'புதுமனை புகுவிழா', icon: Home, color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'ANNIVERSARY', label: 'Anniversary', labelTa: 'ஆண்டு விழா', icon: Sparkles, color: '#D97706', bg: '#FEF3C7' },
  { key: 'OTHER', label: 'Other celebrations', labelTa: 'மற்றவை', icon: CalendarCheck, color: '#059669', bg: '#ECFDF5' }
];

const EventCard = ({ item }: any) => {
  const cat = EVENT_CATEGORIES.find(c => c.key === item.category) || EVENT_CATEGORIES[4];
  const IconComponent = cat.icon;

  const eventDate = new Date(item.date);
  const dayStr = isNaN(eventDate.getDate()) ? '05' : String(eventDate.getDate()).padStart(2, '0');
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthStr = isNaN(eventDate.getMonth()) ? 'APR' : monthNames[eventDate.getMonth()];
  const yearStr = isNaN(eventDate.getFullYear()) ? '2027' : String(eventDate.getFullYear());

  return (
    <View style={styles.eventCard}>
      {/* Arched Date Badge */}
      <View style={styles.archedBadge}>
        <Text style={styles.archedDay}>{dayStr}</Text>
        <Text style={styles.archedMonth}>{monthStr}</Text>
        <Text style={styles.archedYear}>{yearStr}</Text>
      </View>
      
      {/* Event Category Icon (Requirement 2) */}
      <View style={styles.eventImageContainer}>
        <View style={[styles.illustrationCircle, { backgroundColor: cat.bg }]}>
          <IconComponent size={24} color={cat.color} strokeWidth={2.2} />
        </View>
      </View>

      {/* Event Details */}
      <View style={styles.eventInfo}>
        <View style={styles.eventHeaderRow}>
          <Text style={styles.eventName} numberOfLines={1}>{item.eventName}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: cat.bg }]}>
            <Text style={[styles.categoryBadgeText, { color: cat.color }]}>{cat.label}</Text>
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
    </View>
  );
};

// --- Main Screen ---
const EventCalendarScreen = () => {
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Create Event Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventLocation, setNewEventLocation] = useState('Marthandan');
  const [newEventCategory, setNewEventCategory] = useState('MARRIAGE');
  const [newEventDesc, setNewEventDesc] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory;
      }
      const res = await eventsApi.getEvents(params);
      const fetched = res.data?.data || [];
      if (fetched.length > 0) {
        setEvents(fetched);
      } else {
        // Fallback default events
        setEvents([
          {
            _id: 'sample_1',
            eventName: 'Subramanian & Meenakshi Kalyanam',
            date: selectedDate,
            time: '10:30 AM',
            location: 'Marthandan Vamsam Kalyana Mandapam',
            description: 'Heritage marriage ceremony of our lineage',
            category: 'MARRIAGE',
            status: 'Approved'
          },
          {
            _id: 'sample_2',
            eventName: 'Madasamy Ayya Birthday Celebration',
            date: selectedDate,
            time: '05:00 PM',
            location: 'Illam Sannathi Street',
            description: 'Grand family celebration and blessings',
            category: 'BIRTHDAY',
            status: 'Approved'
          }
        ]);
      }
    } catch (err) {
      console.log('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  const handleCreateEvent = async () => {
    if (!newEventName.trim() || !newEventLocation.trim()) {
      Alert.alert('Required', 'Please enter event name and location');
      return;
    }

    try {
      setCreating(true);
      await eventsApi.createEvent({
        eventName: newEventName.trim(),
        date: newEventDate,
        time: newEventTime,
        location: newEventLocation.trim(),
        category: newEventCategory,
        description: newEventDesc.trim()
      });
      Alert.alert('Success', 'Event submitted successfully');
      setCreateModalVisible(false);
      setNewEventName('');
      setNewEventDesc('');
      loadEvents();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const markedDates: any = {};
  markedDates[selectedDate] = { 
    selected: true, 
    selectedColor: '#004831', 
    selectedTextColor: '#FFFFFF' 
  };
  events.forEach(e => {
    const d = e.date?.split('T')[0];
    if (d && d !== selectedDate) {
      markedDates[d] = { marked: true, dotColor: '#C9A85A' };
    }
  });

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CalendarCard selectedDate={selectedDate} setSelectedDate={setSelectedDate} markedDates={markedDates} />
        
        {/* Category Filter Pills (Requirement 2) */}
        <View style={styles.categoryFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedCategory === 'ALL' && styles.filterChipActive]}
              onPress={() => setSelectedCategory('ALL')}
            >
              <Text style={[styles.filterChipText, selectedCategory === 'ALL' && styles.filterChipTextActive]}>
                All ({events.length})
              </Text>
            </TouchableOpacity>

            {EVENT_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Icon size={14} color={isSelected ? '#FFFFFF' : cat.color} style={{ marginRight: 6 }} />
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionHeaderWrapper}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionHeaderTitle}>
              {language === 'ta' ? 'நிகழ்வுகள் பட்டியல்' : `Events for ${selectedDate}`}
            </Text>
            <TouchableOpacity
              style={styles.addEventBtn}
              onPress={() => setCreateModalVisible(true)}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.addEventBtnText}>Create Event</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 8 }}>
            <HeritageDivider />
          </View>
        </View>

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#004831" style={{ marginVertical: 20 }} />
          ) : events.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#718078', fontSize: 14, fontFamily: 'Montserrat_500Medium' }}>
                No events found for this selection
              </Text>
            </View>
          ) : (
            events.map(item => <EventCard key={item._id} item={item} />)
          )}
          
          {/* Sub-Navigation Footer Divider */}
          <View style={styles.subNavigationFooter}>
            <View style={styles.subNavLine} />
            <Text style={styles.subNavText}>குடும்பம்  •  உறவுகள்  •  நிகழ்வுகள்</Text>
            <View style={styles.subNavLine} />
          </View>
        </View>
      </ScrollView>

      {/* Predefined Category Event Creation Modal (Requirement 2) */}
      <Modal visible={createModalVisible} transparent animationType="slide" onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Event</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={{ padding: 4 }}>
                <X size={20} color="#718078" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              {/* Event Category Selection (Requirement 2) */}
              <Text style={styles.inputLabel}>Event Category / வகை *</Text>
              <View style={styles.categoriesGrid}>
                {EVENT_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = newEventCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[styles.categorySelectCard, isSelected && { borderColor: cat.color, backgroundColor: cat.bg }]}
                      onPress={() => setNewEventCategory(cat.key)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.categoryIconWrap, { backgroundColor: cat.bg }]}>
                        <Icon size={18} color={cat.color} />
                      </View>
                      <Text style={[styles.categorySelectLabel, isSelected && { color: cat.color, fontWeight: '700' }]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Event Name / நிகழ்வு பெயர் *</Text>
              <TextInput style={styles.inputField} value={newEventName} onChangeText={setNewEventName} placeholder="e.g. Wedding Reception" />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                  <TextInput style={styles.inputField} value={newEventDate} onChangeText={setNewEventDate} placeholder="2027-04-05" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput style={styles.inputField} value={newEventTime} onChangeText={setNewEventTime} placeholder="10:00 AM" />
                </View>
              </View>

              <Text style={styles.inputLabel}>Location / இடம் *</Text>
              <TextInput style={styles.inputField} value={newEventLocation} onChangeText={setNewEventLocation} placeholder="e.g. Marthandan Temple Hall" />

              <Text style={styles.inputLabel}>Description / விவரம்</Text>
              <TextInput style={[styles.inputField, { height: 60 }]} value={newEventDesc} onChangeText={setNewEventDesc} multiline placeholder="Invitation details..." />
            </ScrollView>

            <TouchableOpacity style={styles.submitEventBtn} onPress={handleCreateEvent} disabled={creating}>
              {creating ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.submitEventBtnText}>Publish Event</Text>}
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
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Montserrat_600SemiBold',
  },
  categoryFilterContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.l,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DDCF',
  },
  filterChipActive: {
    backgroundColor: '#004831',
    borderColor: '#004831',
  },
  filterChipText: {
    fontSize: 12,
    color: '#19352D',
    fontFamily: 'Montserrat_500Medium',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004831',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addEventBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
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
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#19352D',
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#19352D',
    marginBottom: 6,
    marginTop: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  inputField: {
    backgroundColor: '#F9F7F2',
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#19352D',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  categorySelectCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5DDCF',
    borderRadius: 10,
    backgroundColor: '#FDFCF9',
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categorySelectLabel: {
    fontSize: 11,
    color: '#19352D',
    fontFamily: 'Montserrat_500Medium',
    flex: 1,
  },
  submitEventBtn: {
    backgroundColor: '#004831',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  submitEventBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default EventCalendarScreen;
