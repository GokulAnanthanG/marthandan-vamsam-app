import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text, ImageBackground } from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { familyTreeApi } from '../../services/api';
import FamilyTreeCanvas from './FamilyTreeCanvas';
import TreeToolbar from './components/TreeToolbar';
import TreeModalsManager from './components/TreeModalsManager';
import { FamilyTreeProvider, useFamilyTreeContext } from './context/FamilyTreeContext';

const FamilyTreeScreenContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isAdminOrSub = ['ADMIN', 'SUB_ADMIN', 'DATA_ENTRY'].includes(user?.role || '');

  const {
    loading,
    setLoading,
    activeTreeId,
    setActiveTreeId,
    treeData,
    setTreeData,
    setSelectedNode,
    setActionSheetVisible,
    setMovingSubtreeNode,
    setInsertBetweenParent,
    movingSubtreeNode,
    insertBetweenParent,
    setCreateTreeVisible,
    setAddMemberVisible,
    setRecycleBinVisible
  } = useFamilyTreeContext() as any;

  const canvasRef = useRef<any>(null);
  const [trees, setTrees] = React.useState<any[]>([]);

  const loadTrees = async () => {
    try {
      setLoading(true);
      const treesRes = await familyTreeApi.getTrees();
      const loadedTrees = treesRes.data?.data || [];
      setTrees(loadedTrees);
      
      if (loadedTrees.length > 0) {
        // Keep current active tree if it still exists, else default to first
        const currentActive = loadedTrees.find((t: any) => t._id === activeTreeId);
        const newActiveTreeId = currentActive ? currentActive._id : loadedTrees[0]._id;
        
        setActiveTreeId(newActiveTreeId);
        const branchRes = await familyTreeApi.getTreeBranch(newActiveTreeId);
        setTreeData(branchRes.data?.data);
      } else {
        setTreeData(null);
      }
    } catch (error) {
      console.error('Failed to load family tree:', error);
      Alert.alert('Error', 'Failed to load the family tree.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  const switchTree = async (treeId: string) => {
    try {
      setLoading(true);
      setActiveTreeId(treeId);
      const branchRes = await familyTreeApi.getTreeBranch(treeId);
      setTreeData(branchRes.data?.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch tree.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodePress = (node: any) => {
    if (movingSubtreeNode) {
      Alert.alert(
        'Confirm Move',
        `Move ${movingSubtreeNode.name} under ${node.name}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setMovingSubtreeNode(null) },
          { 
            text: 'Confirm', 
            onPress: async () => {
              try {
                if (!activeTreeId) return;
                setLoading(true);
                await familyTreeApi.moveSubtree(activeTreeId, movingSubtreeNode._id, node._id);
                Alert.alert('Success', 'Subtree moved successfully!');
                setMovingSubtreeNode(null);
                const branchRes = await familyTreeApi.getTreeBranch(activeTreeId);
                setTreeData(branchRes.data?.data);
              } catch (error) {
                Alert.alert('Error', 'Failed to move subtree');
                setMovingSubtreeNode(null);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
      return;
    }

    if (insertBetweenParent) {
      Alert.alert(
        'Confirm Insert',
        `Insert a new node between ${insertBetweenParent.name} (Parent) and ${node.name} (Child)?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setInsertBetweenParent(null) },
          { 
            text: 'Confirm', 
            onPress: async () => {
              try {
                if (!activeTreeId) return;
                setLoading(true);
                const newMemberData = {
                  name: `Inserted Node ${Math.floor(Math.random() * 100)}`,
                  gender: 'MALE'
                };
                await familyTreeApi.insertBetween(activeTreeId, insertBetweenParent._id, node._id, newMemberData);
                Alert.alert('Success', 'Node inserted successfully!');
                setInsertBetweenParent(null);
                
                const branchRes = await familyTreeApi.getTreeBranch(activeTreeId);
                setTreeData(branchRes.data?.data);
              } catch (error) {
                Alert.alert('Error', 'Failed to insert node');
                setInsertBetweenParent(null);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
      return;
    }

    setSelectedNode(node);
    setActionSheetVisible(true);
  };

  if (loading && !treeData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading family tree...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('familyTree') || 'Family Tree'}</Text>
        
        {trees.length > 1 ? (
          <TouchableOpacity 
            style={styles.treeSelector} 
            onPress={() => {
              Alert.alert(
                'Switch Family Tree',
                'Select a tree to view:',
                trees.map(t => ({
                  text: t.name,
                  onPress: () => switchTree(t._id),
                  style: t._id === activeTreeId ? 'cancel' : 'default'
                }))
              );
            }}
          >
            <Text style={styles.treeSelectorText}>{trees.find(t => t._id === activeTreeId)?.name || 'Select a Tree'} ▾</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.treeSelectorText}>{trees.find(t => t._id === activeTreeId)?.name || 'Explore your lineage'}</Text>
        )}

        {movingSubtreeNode && (
          <Text style={{color: 'yellow', marginTop: 5}}>
            Select new parent for {movingSubtreeNode.name}
          </Text>
        )}
      </View>
      
      <ImageBackground 
        source={require('../../assets/images/login-bg.jpg')}
        style={styles.canvasContainer}
        resizeMode="cover"
      >
        <View style={styles.canvasOverlay}>
          <TreeToolbar 
            onZoomIn={() => canvasRef.current?.zoomIn()}
            onZoomOut={() => canvasRef.current?.zoomOut()}
            onReset={() => canvasRef.current?.resetZoom()}
            onSearch={() => {
              Alert.prompt(
                'Search Member',
                'Enter the name of the family member:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Search',
                    onPress: (query) => {
                      if (!query || !treeData) return;
                      const target = treeData.members.find((m: any) => 
                        m.name.toLowerCase().includes(query.toLowerCase())
                      );
                      if (target) {
                        canvasRef.current?.focusNode(target._id);
                      } else {
                        Alert.alert('Not Found', 'No member found with that name.');
                      }
                    }
                  }
                ]
              );
            }}
            onExport={async () => {
               if (canvasRef.current) {
                  const uri = await canvasRef.current.exportImage();
                  if (uri) {
                    // In a real app we'd use Share from react-native-share
                    // await Share.open({ url: uri, title: 'Export' });
                  }
               }
            }}
            onRecycleBin={() => setRecycleBinVisible(true)}
            isAdmin={isAdminOrSub}
            onAddTree={isAdminOrSub ? () => setCreateTreeVisible(true) : undefined}
          />
          {treeData && treeData.members?.length > 0 ? (
            <FamilyTreeCanvas 
              ref={canvasRef} 
              onNodePress={handleNodePress} 
              onLoadMore={async (nodeId) => {
                // Lazy loading implementation
              }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No family tree data available.</Text>
              {isAdminOrSub && activeTreeId && (
                <TouchableOpacity style={styles.createBtn} onPress={() => setAddMemberVisible(true)}>
                  <Text style={styles.createBtnText}>Add First Member (Root)</Text>
                </TouchableOpacity>
              )}
              {isAdminOrSub && !activeTreeId && (
                <TouchableOpacity style={styles.createBtn} onPress={() => setCreateTreeVisible(true)}>
                  <Text style={styles.createBtnText}>Create Family Tree</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ImageBackground>

      <TreeModalsManager onTreeCreated={loadTrees} />
    </View>
  );
};

export default function FamilyTreeScreen() {
  return (
    <FamilyTreeProvider>
      <FamilyTreeScreenContent />
    </FamilyTreeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#011A0E',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C9A85A',
    elevation: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#C9A85A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  treeSelector: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(201, 168, 90, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 90, 0.4)',
  },
  treeSelectorText: {
    fontSize: 14,
    color: '#FDFBF7',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#011A0E',
  },
  canvasOverlay: {
    flex: 1,
    backgroundColor: 'rgba(1, 26, 14, 0.85)', // Deep forest green overlay
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionBanner: {
    backgroundColor: colors.accent,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  actionBannerText: {
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  cancelActionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    textDecorationLine: 'underline',
  }
});
