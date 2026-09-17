import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text, Modal, TextInput, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { familyTreeApi } from '../../services/api';
import { colors } from '../../theme/colors';
import { WEBVIEW_HTML } from './webviewHtml';

export default function FamilyTreeScreen() {
  const [loading, setLoading] = useState(false);
  const [trees, setTrees] = useState<any[]>([]);
  const [activeTreeId, setActiveTreeId] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<any>(null);
  const webviewRef = useRef<WebView>(null);

  // Modals state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addMode, setAddMode] = useState<'CHILD' | 'SPOUSE' | 'ROOT' | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', gender: 'MALE', dateOfBirth: '' });

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
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load trees');
    } finally {
      setLoading(false);
    }
  };

  const loadBranch = async (treeId: string, rootMemberId?: string) => {
    try {
      setLoading(true);
      const res = await familyTreeApi.getTreeBranch(treeId, rootMemberId);
      setTreeData(res.data?.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    if (treeData && webviewRef.current) {
      // Send data to WebView
      webviewRef.current.postMessage(JSON.stringify({
        type: 'SET_TREE_DATA',
        payload: treeData,
      }));
    }
  }, [treeData]);

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'WEBVIEW_READY' && treeData) {
        webviewRef.current?.postMessage(JSON.stringify({
          type: 'SET_TREE_DATA',
          payload: treeData,
        }));
      } else if (data.type === 'LOAD_MORE') {
        // Handle loading ghost node (lazy loading)
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
        setSelectedMemberId(data.memberId);
        Alert.alert('Action', 'What would you like to do?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Child', onPress: () => { setAddMode('CHILD'); setAddModalVisible(true); } },
          { text: 'Add Spouse', onPress: () => { setAddMode('SPOUSE'); setAddModalVisible(true); } }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMember = async () => {
    if (!activeTreeId || !formData.name) return;
    try {
      setLoading(true);
      if (addMode === 'ROOT') {
        await familyTreeApi.addMember(activeTreeId, formData);
      } else if (addMode === 'CHILD' && selectedMemberId) {
        await familyTreeApi.addChild(activeTreeId, selectedMemberId, formData);
      } else if (addMode === 'SPOUSE' && selectedMemberId) {
        await familyTreeApi.addSpouse(activeTreeId, selectedMemberId, formData);
      }
      setAddModalVisible(false);
      setFormData({ name: '', gender: 'MALE', dateOfBirth: '' });
      loadBranch(activeTreeId);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Tree</Text>
        <TouchableOpacity 
          style={styles.treeSelector} 
          onPress={() => {
            Alert.alert(
              'Switch Family Tree',
              'Select a tree:',
              trees.map(t => ({
                text: t.name,
                onPress: () => { setActiveTreeId(t._id); loadBranch(t._id); }
              }))
            );
          }}
        >
          <Text style={styles.treeSelectorText}>
            {trees.find(t => t._id === activeTreeId)?.name || 'Select a Tree'} ▾
          </Text>
        </TouchableOpacity>
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
             <TouchableOpacity style={styles.btn} onPress={() => { setAddMode('ROOT'); setAddModalVisible(true); }}>
               <Text style={styles.btnText}>Add Root Member</Text>
             </TouchableOpacity>
           </View>
        )}
      </View>

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {addMode === 'CHILD' ? 'Add Child' : addMode === 'SPOUSE' ? 'Add Spouse' : 'Add Root'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={t => setFormData({...formData, name: t})}
            />
            <TextInput
              style={styles.input}
              placeholder="Gender (MALE/FEMALE)"
              value={formData.gender}
              onChangeText={t => setFormData({...formData, gender: t})}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnOutline} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.btnOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleAddMember}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: 20, paddingTop: 40, backgroundColor: '#011A0E',
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#C9A85A'
  },
  headerTitle: { fontSize: 24, color: '#C9A85A', textTransform: 'uppercase' },
  treeSelector: {
    marginTop: 8, paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: 'rgba(201, 168, 90, 0.15)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(201, 168, 90, 0.4)'
  },
  treeSelectorText: { fontSize: 14, color: '#FDFBF7' },
  webviewContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { position: 'absolute', top: '50%', left: '50%', zIndex: 10, marginLeft: -18, marginTop: -18 },
  emptyOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)'
  },
  emptyText: { fontSize: 18, color: '#333', marginBottom: 20 },
  btn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnOutline: { borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnOutlineText: { color: colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }
});
