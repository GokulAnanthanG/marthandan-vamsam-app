import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { User, UserRound, Crown } from 'lucide-react-native';
import Svg, { Defs, Pattern, Path, Circle, Rect } from 'react-native-svg';

const HeritagePattern = () => {
  const strokeColor = "#C9A85A"; // Gold
  return (
    <View style={styles.patternWrapper}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="heritagePattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <Path d="M16 0 L32 16 L16 32 L0 16 Z" fill="none" stroke={strokeColor} strokeWidth="0.8" opacity="0.1" />
            <Circle cx="16" cy="16" r="8" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.1" />
            <Circle cx="16" cy="16" r="2" fill={strokeColor} opacity="0.15" />
            <Path d="M0 0 L6 6 M32 0 L26 6 M0 32 L6 26 M32 32 L26 26" stroke={strokeColor} strokeWidth="0.5" opacity="0.1" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#heritagePattern)" />
      </Svg>
    </View>
  );
};

const FamilyNode = ({ node, onPress, onLongPress, style, hasHeritage, onHeritagePress }: any) => {
  const isMale = node.gender === 'MALE';

  return (
    <TouchableOpacity
      style={[
        styles.nodeContainer,
        style
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <HeritagePattern />
      
      <View style={styles.imageContainer}>
        {node.photoUrl ? (
          <Image source={{ uri: node.photoUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderIcon}>
            {isMale ? (
              <User color="#C9A85A" size={26} />
            ) : (
              <UserRound color="#C9A85A" size={26} />
            )}
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {node.name}
        </Text>
      </View>
      {hasHeritage && (
        <TouchableOpacity style={styles.heritageBadge} onPress={onHeritagePress} activeOpacity={0.8}>
          <Crown color="#011A0E" size={14} fill="#011A0E" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nodeContainer: {
    width: 160,
    height: 100,
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#C9A85A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#C9A85A',
    backgroundColor: '#011A0E',
    // Removed overflow hidden here so badge can float outside
  },
  patternWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6, // slightly less than the container to clip properly inside the border
    overflow: 'hidden',
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#011A0E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#C9A85A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#C9A85A',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heritageBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#C9A85A',
    borderRadius: 16,
    padding: 5,
    shadowColor: '#C9A85A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#F0C766',
    zIndex: 10,
  },
});

export default FamilyNode;
