import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text, TextInput, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { familyTreeApi } from '../../services/api';
import { colors } from '../../theme/colors';
import { WEBVIEW_HTML } from './webviewHtml';
import { useAuth } from '../../context/AuthContext';
import MemberActionModal, { ActionMode } from '../../components/FamilyTree/MemberActionModal';
import MemberActionSheet, { ActionSheetOption } from '../../components/FamilyTree/MemberActionSheet';

export default function FamilyTreeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trees, setTrees] = useState<any[]>([]);
  const [activeTreeId, setActiveTreeId] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<any>(null);
  
  // Breadcrumbs/History for View Family
  const [history, setHistory] = useState<{rootId?: string, name: string}[]>([]);
  const webviewRef = useRef<WebView>(null);

  // Modals state
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const loadTrees = async () => {
    try {
      setLoading(true);
      const res = await familyTreeApi.getTrees();
      const loadedTrees = res.data?.data || [];
      setTrees(loadedTrees);

      if (loadedTrees.length > 0) {
        const treeId = loadedTrees[0]._id;
        setActiveTreeId(treeId);
        loadBranch(treeId);
        setHistory([{ name: 'Complete Tree' }]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load trees');
    } finally {
      setLoading(false);
    }
  };

  const loadBranch = async (treeId: string, rootMemberId?: string, memberName?: string) => {
    try {
      setLoading(true);
      const res = await familyTreeApi.getTreeBranch(treeId, rootMemberId);
      setTreeData(res.data?.data);
      
      if (memberName) {
        setHistory(prev => [...prev, { rootId: rootMemberId, name: `${memberName}'s Family` }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const popHistory = (index: number) => {
    if (!activeTreeId) return;
    const item = history[index];
    const newHistory = history.slice(0, index + 1);
    setHistory(newHistory);
    loadBranch(activeTreeId, item.rootId);
  };

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    if (treeData && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({
        type: 'SET_TREE_DATA',
        payload: treeData,
      }));
    }
  }, [treeData]);

  const handleSearch = async () => {
    if (!activeTreeId || !searchQuery) return;
    try {
      const res = await familyTreeApi.searchMembers(activeTreeId, searchQuery);
      const results = res.data?.data;
      if (results && results.length > 0) {
        const firstMatchId = results[0]._id;
        webviewRef.current?.postMessage(JSON.stringify({
          type: 'HIGHLIGHT_NODE',
          memberId: firstMatchId,
        }));
      } else {
        Alert.alert('Search', 'No members found');
      }
    } catch(e) {
      console.error('Search error', e);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'WEBVIEW_READY' && treeData) {
        webviewRef.current?.postMessage(JSON.stringify({
          type: 'SET_TREE_DATA',
          payload: treeData,
        }));
      } else if (data.type === 'LOAD_MORE') {
        if (activeTreeId) {
           const res = await familyTreeApi.getTreeBranch(activeTreeId, data.memberId);
           if (res.data?.data) {
             const newBranch = res.data.data;
             setTreeData((prev: any) => {
                if (!prev) return newBranch;
                const existingIds = new Set(prev.members.map((m:any) => m._id));
                const members = prev.members.map((m:any) => {
                  const newM = newBranch.members.find((nm:any) => nm._id === m._id);
                  if (newM && m.isFadedSkeleton) {
                    return { ...newM, isFadedSkeleton: false };
                  }
                  return m;
                });
                
                const newlyAddedMembers = newBranch.members.filter((m:any) => !existingIds.has(m._id));
                const existingRelIds = new Set(prev.relationships.map((r:any) => `${r.parentMemberId}-${r.childMemberId}-${r.relationshipType}`));
                const newlyAddedRels = newBranch.relationships.filter((r:any) => !existingRelIds.has(`${r.parentMemberId}-${r.childMemberId}-${r.relationshipType}`));

                return {
                  ...prev,
                  members: [...members, ...newlyAddedMembers],
                  relationships: [...prev.relationships, ...newlyAddedRels]
                };
             });
           }
        }
      } else if (data.type === 'NODE_CLICK') {
        const clickedMember = treeData?.members.find((m:any) => m._id === data.memberId);
        if (clickedMember) {
          setSelectedMember(clickedMember);
          setSheetVisible(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMember = async (formData: any) => {
    if (!activeTreeId) return;
    
    if (actionMode === 'ROOT') {
      await familyTreeApi.addMember(activeTreeId, formData);
    } else if (actionMode === 'CHILD' && selectedMember) {
      await familyTreeApi.addChild(activeTreeId, selectedMember._id, formData);
    } else if (actionMode === 'SPOUSE' && selectedMember) {
      await familyTreeApi.addSpouse(activeTreeId, selectedMember._id, formData);
    }
    
    // Reload branch to reflect changes
    const currentRoot = history[history.length - 1]?.rootId;
    loadBranch(activeTreeId, currentRoot);
  };

  const handleDeleteSubtree = () => {
    if (!activeTreeId || !selectedMember) return;
    Alert.alert(
      'Delete Connection',
      `This action will hide the entire descendant subtree.\n\nType DELETE to confirm`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await familyTreeApi.deleteSubtree(activeTreeId, selectedMember._id);
              const currentRoot = history[history.length - 1]?.rootId;
              loadBranch(activeTreeId, currentRoot);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete subtree');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getActionOptions = (): ActionSheetOption[] => {
    const role = user?.role || 'NORMAL_USER';
    const isAuthorized = ['ADMIN', 'SUB_ADMIN', 'DATA_ENTRY'].includes(role);
    const isAdmin = role === 'ADMIN';
    const isMale = selectedMember?.gender === 'MALE';

    const options: ActionSheetOption[] = [
      { label: 'View Profile', onPress: () => Alert.alert('Profile', 'Profile view coming soon') },
      { label: 'View Family', onPress: () => {
          if (activeTreeId && selectedMember) {
            loadBranch(activeTreeId, selectedMember._id, selectedMember.name);
          }
      }}
    ];

    if (isAuthorized) {
      options.push({ label: 'Edit Member', onPress: () => { setActionMode('EDIT'); setModalVisible(true); } });
      
      if (isMale || isAdmin) {
         options.push({ label: 'Add Child', onPress: () => { setActionMode('CHILD'); setModalVisible(true); } });
      }
      
      if (isAdmin) {
         options.push({ label: 'Add Spouse', onPress: () => { setActionMode('SPOUSE'); setModalVisible(true); } });
         options.push({ label: 'Move Subtree', onPress: () => Alert.alert('Move Subtree', 'Admin graph editor functionality needed') });
         options.push({ label: 'Delete Subtree', danger: true, onPress: handleDeleteSubtree });
      }
    }

    return options;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Family Tree</Text>
          <TouchableOpacity 
            style={styles.treeSelector} 
            onPress={() => {
              Alert.alert(
                'Switch Family Tree',
                'Select a tree:',
                trees.map(t => ({
                  text: t.name,
                  onPress: () => { 
                    setActiveTreeId(t._id); 
                    setHistory([{ name: 'Complete Tree' }]);
                    loadBranch(t._id); 
                  }
                }))
              );
            }}
          >
            <Text style={styles.treeSelectorText}>
              {trees.find(t => t._id === activeTreeId)?.name || 'Select a Tree'} ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search member..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Breadcrumbs */}
        <ScrollView horizontal style={styles.breadcrumbs} showsHorizontalScrollIndicator={false}>
          {history.map((h, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity onPress={() => popHistory(index)}>
                <Text style={[styles.crumbText, index === history.length - 1 && styles.crumbTextActive]}>
                  {h.name}
                </Text>
              </TouchableOpacity>
              {index < history.length - 1 && <Text style={styles.crumbSeparator}> &gt; </Text>}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>

      <View style={styles.webviewContainer}>
        {loading && !treeData && (
           <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        )}
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: WEBVIEW_HTML }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        {(!treeData || treeData.members?.length === 0) && !loading && (
           <View style={styles.emptyOverlay}>
             <Text style={styles.emptyText}>No members found</Text>
             {['ADMIN', 'SUB_ADMIN', 'DATA_ENTRY'].includes(user?.role || '') && (
               <TouchableOpacity style={styles.btn} onPress={() => { setActionMode('ROOT'); setModalVisible(true); }}>
                 <Text style={styles.btnText}>Add Root Member</Text>
               </TouchableOpacity>
             )}
           </View>
        )}
      </View>

      <MemberActionSheet 
        visible={sheetVisible}
        member={selectedMember}
        options={getActionOptions()}
        onClose={() => setSheetVisible(false)}
      />

      <MemberActionModal
        visible={modalVisible}
        mode={actionMode}
        targetMember={selectedMember}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveMember}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: 16, paddingTop: 40, backgroundColor: '#011A0E',
    borderBottomWidth: 1, borderBottomColor: '#C9A85A'
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, color: '#C9A85A', textTransform: 'uppercase' },
  treeSelector: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(201, 168, 90, 0.15)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(201, 168, 90, 0.4)'
  },
  treeSelectorText: { fontSize: 14, color: '#FDFBF7' },
  searchContainer: { flexDirection: 'row', marginTop: 15, gap: 10 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 40 },
  searchBtn: { backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 15, justifyContent: 'center' },
  searchBtnText: { color: '#000', fontWeight: 'bold' },
  breadcrumbs: { marginTop: 15, flexDirection: 'row' },
  crumbText: { color: '#888', fontSize: 14 },
  crumbTextActive: { color: '#C9A85A', fontWeight: 'bold' },
  crumbSeparator: { color: '#888', marginHorizontal: 5 },
  webviewContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { position: 'absolute', top: '50%', left: '50%', zIndex: 10, marginLeft: -18, marginTop: -18 },
  emptyOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)'
  },
  emptyText: { fontSize: 18, color: '#333', marginBottom: 20 },
  btn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});
