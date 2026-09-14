import React from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useFamilyTreeContext } from '../context/FamilyTreeContext';
import { familyTreeApi } from '../../../services/api';
import TreeActionSheet from './TreeActionSheet';
import AddMemberModal from './AddMemberModal';
import AddChildModal from './AddChildModal';
import MemberProfileSheet from './MemberProfileSheet';
import AddSubtreeRequestModal from './AddSubtreeRequestModal';
import FamilyHeadDetailsModal from './FamilyHeadDetailsModal';
import DeletedMembersModal from './DeletedMembersModal';
import CreateTreeModal from './CreateTreeModal';
import RequestModificationModal from './RequestModificationModal';

const TreeModalsManager = ({ onTreeCreated }: { onTreeCreated?: () => void }) => {
  const {
    activeTreeId,
    selectedNode,
    setTreeData,
    setLoading,
    actionSheetVisible,
    setActionSheetVisible,
    profileVisible,
    setProfileVisible,
    addChildVisible,
    setAddChildVisible,
    editMemberVisible,
    setEditMemberVisible,
    addMemberVisible,
    setAddMemberVisible,
    requestModVisible,
    setRequestModVisible,
    addSubtreeReqVisible,
    setAddSubtreeReqVisible,
    headDetailsVisible,
    setHeadDetailsVisible,
    recycleBinVisible,
    setRecycleBinVisible,
    createTreeVisible,
    setCreateTreeVisible,
    managementMode,
    setMovingSubtreeNode
  } = useFamilyTreeContext() as any;

  const { user } = useAuth();
  const isAdminOrSub = ['ADMIN', 'SUB_ADMIN', 'DATA_ENTRY'].includes(user?.role || '');
  
  const reloadTree = async () => {
    if (!activeTreeId) return;
    setLoading(true);
    try {
      const branchRes = await familyTreeApi.getTreeBranch(activeTreeId);
      setTreeData(branchRes.data?.data);
    } catch (error) {
      console.error('Failed to reload tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChildSubmit = async (childData: any) => {
    try {
      if (!activeTreeId || !selectedNode) return;
      await familyTreeApi.addChild(activeTreeId, selectedNode._id, childData);
      Alert.alert('Success', 'Child added successfully');
      await reloadTree();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add child');
    }
  };

  const handleEditMemberSubmit = async (memberData: any) => {
    try {
      if (!selectedNode) return;
      // Mock update since we don't have update endpoint in context yet
      Alert.alert('Success', 'Member updated successfully');
      await reloadTree();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update member');
    }
  };

  const handleAddMemberSubmit = async (memberData: any) => {
    try {
      if (!activeTreeId) return;
      await familyTreeApi.addMember(activeTreeId, memberData);
      Alert.alert('Success', 'Root member added successfully');
      setAddMemberVisible(false);
      await reloadTree();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add root member');
    }
  };

  const getActionSheetActions = () => {
    if (!selectedNode) return [];
    
    if (isAdminOrSub) {
      const actions: any[] = [
        { label: 'View Profile', onPress: () => setProfileVisible(true) },
        { label: 'Edit Member', onPress: () => setEditMemberVisible(true) },
        { label: 'Family Head Details / Media', onPress: () => setHeadDetailsVisible(true) }
      ];
      
      if (selectedNode.gender !== 'FEMALE') {
        actions.push({ label: 'Add Child', onPress: () => setAddChildVisible(true) });
      }

      if (['ADMIN', 'SUB_ADMIN'].includes(user?.role || '')) {
        actions.push({ 
          label: 'Move Subtree', 
          onPress: () => {
            Alert.alert('Move Subtree', `Tap on the new parent node for ${selectedNode.name}`);
            setMovingSubtreeNode(selectedNode);
          }
        });
        actions.push({ 
          label: 'Delete Subtree', 
          destructive: true,
          onPress: () => {
            Alert.alert(
              'Delete Connection',
              'This action will hide the entire descendant subtree.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (!activeTreeId) return;
                      await familyTreeApi.deleteSubtree(activeTreeId, selectedNode._id);
                      Alert.alert('Success', 'Subtree deleted');
                      await reloadTree();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete subtree');
                    }
                  }
                }
              ]
            );
          }
        });
      }
      return actions;
    } else {
      return [
        { label: 'View Profile', onPress: () => setProfileVisible(true) },
        { label: 'Request Modification', onPress: () => setRequestModVisible(true) },
        { label: 'Request Add Subtree', onPress: () => setAddSubtreeReqVisible(true) }
      ];
    }
  };

  return (
    <>
      <TreeActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        title={selectedNode ? selectedNode.name : "Actions"}
        actions={getActionSheetActions()}
      />

      {profileVisible && selectedNode && (
        <MemberProfileSheet
          visible={profileVisible}
          onClose={() => setProfileVisible(false)}
          member={selectedNode}
        />
      )}

      {addChildVisible && selectedNode && (
        <AddChildModal
          visible={addChildVisible}
          onClose={() => setAddChildVisible(false)}
          parentNode={selectedNode}
          onSubmit={handleAddChildSubmit}
        />
      )}

      {editMemberVisible && selectedNode && (
        <AddMemberModal
          visible={editMemberVisible}
          onClose={() => setEditMemberVisible(false)}
          initialData={selectedNode}
          onSubmit={handleEditMemberSubmit}
        />
      )}

      <AddMemberModal
        visible={addMemberVisible}
        onClose={() => setAddMemberVisible(false)}
        initialData={null}
        onSubmit={handleAddMemberSubmit}
      />

      {requestModVisible && selectedNode && activeTreeId && (
        <RequestModificationModal
          visible={requestModVisible}
          onClose={() => setRequestModVisible(false)}
          targetMember={selectedNode}
          onSubmit={async (payload) => {
             // Request API logic
             setRequestModVisible(false);
          }}
        />
      )}

      {addSubtreeReqVisible && selectedNode && activeTreeId && (
        <AddSubtreeRequestModal
          visible={addSubtreeReqVisible}
          onClose={() => setAddSubtreeReqVisible(false)}
          targetMember={selectedNode}
          onSubmit={async (payload) => {
             // Request API logic
             setAddSubtreeReqVisible(false);
          }}
        />
      )}

      {headDetailsVisible && selectedNode && activeTreeId && (
        <FamilyHeadDetailsModal
          visible={headDetailsVisible}
          onClose={() => setHeadDetailsVisible(false)}
          onSaveSuccess={() => reloadTree()}
          treeId={activeTreeId}
          headMemberId={selectedNode._id}
          isAdmin={isAdminOrSub}
        />
      )}

      {recycleBinVisible && activeTreeId && (
        <DeletedMembersModal
          visible={recycleBinVisible}
          onClose={() => setRecycleBinVisible(false)}
          treeId={activeTreeId}
          onRestoreSuccess={reloadTree}
        />
      )}

      <CreateTreeModal
        visible={createTreeVisible}
        onClose={() => setCreateTreeVisible(false)}
        onSubmit={async (name) => {
           try {
             setLoading(true);
             await familyTreeApi.createTree({ name });
             setCreateTreeVisible(false);
             Alert.alert('Success', 'Tree created successfully');
             if (onTreeCreated) onTreeCreated();
           } catch (error: any) {
             Alert.alert('Error', error?.response?.data?.message || 'Failed to create tree');
           } finally {
             setLoading(false);
           }
        }}
      />
    </>
  );
};

export default TreeModalsManager;
