import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { User, UserRound } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const FamilyNode = ({ node, onPress }) => {
  const isMale = node.gender === 'MALE';

  return (
    <TouchableOpacity
      style={[
        styles.nodeContainer,
        { left: node.x, top: node.y },
        isMale ? styles.maleNode : styles.femaleNode
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {node.photoUrl ? (
          <Image source={{ uri: node.photoUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderIcon}>
            {isMale ? (
              <User color={colors.surface} size={32} />
            ) : (
              <UserRound color={colors.surface} size={32} />
            )}
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {node.name}
        </Text>
        {node.maritalStatus !== 'SINGLE' && (
          <Text style={styles.status} numberOfLines={1}>
            {node.maritalStatus.toLowerCase()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    width: 140,
    height: 80,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
  },
  maleNode: {
    borderColor: '#4DA8DA', // A soft blue for male
    backgroundColor: '#F0F8FF',
  },
  femaleNode: {
    borderColor: '#F38181', // A soft pink/red for female
    backgroundColor: '#FFF0F5',
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  status: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});

export default FamilyNode;
