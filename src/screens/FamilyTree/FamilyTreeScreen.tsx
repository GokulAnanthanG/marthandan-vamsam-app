import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import FamilyTreeCanvas from './FamilyTreeCanvas';
import { familyTreeApi } from '../../services/api';

const FamilyTreeScreen = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    const loadTrees = async () => {
      try {
        setLoading(true);
        // First get all trees, then fetch the branch for the first tree
        const treesRes = await familyTreeApi.getTrees();
        const trees = treesRes.data?.data || [];
        
        if (trees.length > 0) {
          const firstTree = trees[0];
          const branchRes = await familyTreeApi.getTreeBranch(firstTree._id);
          setTreeData(branchRes.data?.data);
        } else {
          setTreeData(null); // No trees yet
        }
      } catch (error) {
        console.error('Failed to load family tree:', error);
        Alert.alert('Error', 'Failed to load the family tree. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadTrees();
  }, []);

  const handleNodePress = (node: any) => {
    const isAdminOrSub = ['ADMIN', 'SUB_ADMIN', 'DATA_ENTRY'].includes(user?.role || '');
    
    if (isAdminOrSub) {
      Alert.alert(
        'Member Options',
        `Manage ${node.name}`,
        [
          { text: 'View Profile', onPress: () => console.log('View Profile') },
          { text: 'Add Child', onPress: () => console.log('Add Child') },
          { text: 'Edit', onPress: () => console.log('Edit Member') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert(
        'View Profile',
        `You selected ${node.name}. Request modifications if needed.`,
        [
          { text: 'Request Modification', onPress: () => console.log('Request Mod') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.text}>{t('loading') || 'Loading Family Tree...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('familyTree') || 'Our Family Heritage'}</Text>
        <Text style={styles.subtitle}>Explore your lineage</Text>
      </View>
      <View style={styles.canvasContainer}>
        {treeData && (
          <FamilyTreeCanvas data={treeData} onNodePress={handleNodePress} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 10,
    color: colors.primary,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.surface,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Slight contrast for the canvas area
  },
});

export default FamilyTreeScreen;
