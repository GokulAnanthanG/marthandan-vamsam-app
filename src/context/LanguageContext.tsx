import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../i18n/en.json';
import ta from '../i18n/ta.json';

type LanguageType = 'en' | 'ta';
type TranslationDictionary = typeof en;

interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: keyof TranslationDictionary) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageType>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem('app_language');
      if (storedLang === 'ta') {
        setLanguageState('ta');
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: LanguageType) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('app_language', lang);
  };

  const t = (key: keyof TranslationDictionary): string => {
    const dictionary = language === 'ta' ? ta : en;
    return dictionary[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
