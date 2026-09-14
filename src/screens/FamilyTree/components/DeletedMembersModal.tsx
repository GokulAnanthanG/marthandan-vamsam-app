import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../../../theme/colors';
import { familyTreeApi } from '../../../services/api';

interface DeletedMembersModalProps {
  visible: boolean;
  onClose: () => void;
  treeId: string;
  onRestoreSuccess: () => void;
}

const DeletedMembersModal: React.FC<DeletedMembersModalProps> = ({ visible, onClose, treeId, onRestoreSuccess }) => {
  const [deletedMembers, setDeletedMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && treeId) {
      fetchDeletedMembers();
    }
  }, [visible, treeId]);

  const fetchDeletedMembers = async () => {
    setLoading(true);
    try {
      const response = await familyTreeApi.getDeletedMembers(treeId);
      setDeletedMembers(response.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch deleted members.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (memberId: string) => {
    try {
      await familyTreeApi.restoreSubtree(treeId, memberId);
      Alert.alert('Success', 'Subtree restored successfully.');
      onRestoreSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to restore subtree.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberDetails}>Deleted: {new Date(item.deletedAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity 
        style={styles.restoreBtn}
        onPress={() => handleRestore(item._id)}
      >
        <Text style={styles.restoreBtnText}>Restore</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Recycle Bin</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>X</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : deletedMembers.length === 0 ? (
            <Text style={styles.emptyText}>No deleted members found.</Text>
          ) : (
            <FlatList
              data={deletedMembers}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 15 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.primary,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  memberDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  restoreBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  restoreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DeletedMembersModal;
