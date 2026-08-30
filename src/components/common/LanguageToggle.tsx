import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <TouchableOpacity style={styles.langPill} onPress={toggleLang} activeOpacity={0.7}>
      <Text style={language === 'ta' ? styles.langTextActive : styles.langTextInactive}>தமிழ்</Text>
      <View style={styles.langPillDivider} />
      <Text style={language === 'en' ? styles.langTextActive : styles.langTextInactive}>EN</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E5DDCF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  langTextActive: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11,
    color: '#19352D',
  },
  langTextInactive: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 11,
    color: '#718078',
  },
  langPillDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#E5DDCF',
    marginHorizontal: 8,
  },
});

export default LanguageToggle;
