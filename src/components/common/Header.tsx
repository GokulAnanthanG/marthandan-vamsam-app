import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LanguageToggle from './LanguageToggle';
import { colors } from '../../theme/colors';

interface HeaderProps {
  title?: string;
  showLanguageToggle?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showLanguageToggle = true }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.titleContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      {showLanguageToggle && <LanguageToggle />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  }
});

export default Header;
