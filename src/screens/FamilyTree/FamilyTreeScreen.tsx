import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { familyTreeApi } from '../../services/api';
import { WEBVIEW_HTML_V2 } from './webviewHtml';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MemberActionModal, { ActionMode } from '../../components/FamilyTree/MemberActionModal';
import MemberActionSheet, { ActionSheetOption } from '../../components/FamilyTree/MemberActionSheet';
import IdentityModal from '../../components/FamilyTree/IdentityModal';
import { Search, SlidersHorizontal, MapPin, ChevronDown } from 'lucide-react-native';
import Header from '../../components/common/Header';

export default function FamilyTreeScreen() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [trees, setTrees] = useState<any[]>([]);
  const [activeTreeId, setActiveTreeId] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<any>(null);
  
  const [history, setHistory] = useState<{rootId?: string, name: string}[]>([]);
  const webviewRef = useRef<WebView>(null);

  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [identityModalVisible, setIdentityModalVisible] = useState(false);
  const [guestIdentityData, setGuestIdentityData] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const generateActionOptions = (member: any): ActionSheetOption[] => {
    if (!member) return [];
    const isGuest = user?.role === 'GUEST';
    const isFemale = member.gender === 'FEMALE';
    
    if (isGuest) {
      const options: ActionSheetOption[] = [];
      if (!isFemale) {
        options.push({
          label: 'Request Add Child',
          onPress: () => {
             setActionMode('CHILD');
             setIdentityModalVisible(true);
          }
        });
      }
      options.push({
        label: 'Request Edit',
        onPress: () => {
           setActionMode('EDIT');
           setIdentityModalVisible(true);
        }
      });
      return options;
    }

    // Normal Authorized roles
    const options: ActionSheetOption[] = [];
    if (!isFemale) {
      options.push({
        label: 'Add Child',
        onPress: () => {
          setActionMode('CHILD');
          setModalVisible(true);
        }
      });
    }
    options.push({
      label: 'Edit',
      onPress: () => {
        setActionMode('EDIT');
        setModalVisible(true);
      }
    });

    return options;
  };
  
  // Toggles
  const [viewMode, setViewMode] = useState<'Tree' | 'Node'>('Tree');

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

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    if (treeData && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({ type: 'SET_TREE_DATA', payload: treeData }));
    }
  }, [treeData]);

  const handleSearch = async () => {
    if (!activeTreeId || !searchQuery) return;
    try {
      const res = await familyTreeApi.searchMembers(activeTreeId, searchQuery);
      const results = res.data?.data;
      if (results && results.length > 0) {
        webviewRef.current?.postMessage(JSON.stringify({ type: 'HIGHLIGHT_NODE', memberId: results[0]._id }));
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
        webviewRef.current?.postMessage(JSON.stringify({ type: 'SET_TREE_DATA', payload: treeData }));
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

  return (
    <View style={styles.container}>
      <Header />

      {/* Main Body Background */}
      <View style={styles.mainBody}>
        {/* Search & Actions Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#888" style={{marginLeft: 12}} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Search size={16} color="#19352D" style={{marginRight: 6}} />
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.treeSelectBtn}>
            <MapPin size={14} color="#19352D" style={{marginRight: 4}} />
            <Text style={styles.treeSelectText}>Marthandan</Text>
            <ChevronDown size={14} color="#19352D" style={{marginLeft: 2}} />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <View style={styles.webviewContainer}>
          {loading && <ActivityIndicator size="large" color="#0F2F20" style={styles.loader} />}
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html: WEBVIEW_HTML_V2 }}
            style={styles.webview}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
          
        </View>
        {/* Sub-Navigation Footer Divider */}
        <View style={styles.subNavigationFooter}>
          <View style={styles.subNavLine} />
          <Text style={styles.subNavText}>குடும்பம்  •  உறவுகள்  •  நிகழ்வுகள்</Text>
          <View style={styles.subNavLine} />
        </View>
      </View>

      <MemberActionSheet 
        visible={sheetVisible}
        member={selectedMember}
        options={generateActionOptions(selectedMember)} 
        onClose={() => setSheetVisible(false)}
      />

      <IdentityModal
        visible={identityModalVisible}
        onClose={() => setIdentityModalVisible(false)}
        onSubmit={(data) => {
          setGuestIdentityData(data);
          setIdentityModalVisible(false);
          setModalVisible(true);
        }}
      />

      <MemberActionModal
        visible={modalVisible}
        mode={actionMode}
        initialData={actionMode === 'EDIT' ? selectedMember : undefined}
        targetMember={selectedMember}
        onClose={() => setModalVisible(false)}
        onSave={async (data) => {
           if (user?.role === 'GUEST') {
             // Submit to Request API
             await familyTreeApi.submitTreeRequest({
               requestType: actionMode === 'CHILD' ? 'ADD_CHILD' : 'EDIT_NODE',
               targetNodeId: selectedMember._id,
               requesterName: guestIdentityData.requesterName,
               requesterFatherName: guestIdentityData.requesterFatherName,
               requesterPhone: guestIdentityData.requesterPhone,
               requestReason: guestIdentityData.requestReason,
               requestedPayload: data
             });
             Alert.alert('Success', 'Your request has been submitted for review.');
           } else {
             // Direct Add/Edit API (Admin)
             if (actionMode === 'CHILD') {
               await familyTreeApi.addChild(activeTreeId!, selectedMember._id, data);
             } else if (actionMode === 'EDIT') {
               await familyTreeApi.updateMember(selectedMember._id, data);
             }
             // Reload branch
             loadBranch(activeTreeId!);
           }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F2' },
  treeSelectBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    paddingHorizontal: 12, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E5DDCF'
  },
  treeSelectText: { color: '#19352D', fontSize: 13, fontFamily: 'Montserrat_600SemiBold' },
  subNavigationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 24,
    gap: 8,
  },
  subNavLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5DDCF',
  },
  subNavText: {
    color: '#7A847F',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat_500Medium',
  },
  
  mainBody: {
    flex: 1, backgroundColor: '#F9F7F2', overflow: 'hidden'
  },
  searchSection: {
    flexDirection: 'row', padding: 16, gap: 10, alignItems: 'center',
    backgroundColor: '#F9F7F2', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  searchInputContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5DDCF',
  },
  searchInput: { flex: 1, paddingHorizontal: 10, height: 44, fontFamily: 'Montserrat_500Medium', color: '#19352D' },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1B95B', borderRadius: 8, paddingHorizontal: 12, height: 44
  },
  searchBtnText: { color: '#19352D', fontFamily: 'Montserrat_600SemiBold', fontSize: 13 },
  filterBtn: {
    width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5DDCF',
    justifyContent: 'center', alignItems: 'center'
  },
  
  webviewContainer: { flex: 1, position: 'relative', backgroundColor: '#F9F7F2' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loader: { position: 'absolute', top: '50%', left: '50%', zIndex: 10, marginLeft: -18, marginTop: -18 }
});
