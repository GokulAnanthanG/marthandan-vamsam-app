import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top || 48, 48) }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitleEn} numberOfLines={1}>MARTHANDAN VAMSAM</Text>
          <Text style={styles.headerTitleTa} numberOfLines={1}>மார்த்தாண்டன் வம்சம்</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>Our Roots. Our Generations. Our Legacy.</Text>
        </View>
        
        <View style={styles.languageContainer}>
          <View style={styles.languageToggle}>
            <TouchableOpacity 
              style={language === 'ta' ? styles.langPillActive : styles.langPillInactive}
              onPress={() => setLanguage('ta')}
              activeOpacity={0.8}
            >
              <Text style={language === 'ta' ? styles.langTextActive : styles.langTextInactive}>தமிழ்</Text>
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
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#004831',
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    zIndex: 1,
  },
  headerTextContainer: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  headerTitleEn: {
    color: '#E1B95B',
    fontSize: 16,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerTitleTa: {
    color: '#E1B95B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'Montserrat_500Medium',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
    fontStyle: 'italic',
  },
  languageContainer: {
    width: 90,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 90, 0.5)',
    borderRadius: 20,
    backgroundColor: '#052D24',
    height: 38,
    width: 90,
    padding: 3,
  },
  langPillActive: {
    flex: 1,
    backgroundColor: '#C9A85A', 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  langPillInactive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  langTextActive: {
    color: '#004831',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat_600SemiBold',
  },
  langTextInactive: {
    color: '#A0B09A',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Montserrat_500Medium',
  },
});
