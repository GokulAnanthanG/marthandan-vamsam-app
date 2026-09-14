import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { familyMediaApi } from '../../../services/api';
import { colors } from '../../../theme/colors';

interface FamilyHeadBannerProps {
  details: { familyDescription?: string; familyPhotoUrl?: string };
  onPress?: () => void;
}

const FamilyHeadBanner: React.FC<FamilyHeadBannerProps> = ({ details, onPress }) => {
  if (!details || (!details.familyDescription && !details.familyPhotoUrl)) {
    return null; // Nothing to show
  }

  return (
    <TouchableOpacity style={styles.bannerContainer} onPress={onPress} activeOpacity={0.8}>
      {details.familyPhotoUrl ? (
        <Image source={{ uri: details.familyPhotoUrl }} style={styles.bannerImage} resizeMode="cover" />
      ) : null}
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>Family Heritage</Text>
        {details.familyDescription ? (
          <Text style={styles.bannerDescription} numberOfLines={2}>
            {details.familyDescription}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    width: 260,
    top: -160, // Position it nicely above the root node (assuming node is 80px high, and we want space)
    left: -60, // Center it horizontally relative to the 140px node ((260-140)/2 = 60)
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.accent,
    overflow: 'hidden',
    zIndex: 100, // Ensure it floats above connections
  },
  bannerImage: {
    width: '100%',
    height: 90,
  },
  bannerContent: {
    padding: 10,
    backgroundColor: colors.primary,
  },
  bannerTitle: {
    color: colors.accent,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  bannerDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default FamilyHeadBanner;
