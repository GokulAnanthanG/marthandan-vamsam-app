import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../../../theme/colors';
import { familyTreeApi } from '../../../services/api';

interface MemberProfileSheetProps {
  visible: boolean;
  onClose: () => void;
  member: any;
  treeId?: string;
}

const MemberProfileSheet: React.FC<MemberProfileSheetProps> = ({ visible, onClose, member, treeId }) => {
  if (!member) return null;

  const handleRequestAccess = async () => {
    try {
      const { specialAccessApi } = require('../../../services/api');
      await specialAccessApi.requestAccess({
        treeId,
        targetMemberId: member._id,
        allowedFields: ['phone', 'email', 'maritalStatus', 'occupationType', 'companyName', 'businessName', 'schoolName', 'collegeName']
      });
      Alert.alert('Success', 'Access request submitted to admin.');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to request access');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Member Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{member.name}</Text>
            </View>
            
            <View style={styles.field}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{member.gender}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Marital Status</Text>
              <Text style={styles.value}>{member.maritalStatus || 'SINGLE'}</Text>
            </View>

            {member.isRestricted ? (
              <View style={styles.restrictedContainer}>
                <Text style={styles.restrictedText}>
                  🔒 Contact details and occupational information are restricted for privacy.
                </Text>
                <TouchableOpacity style={styles.requestAccessBtn} onPress={handleRequestAccess}>
                  <Text style={styles.requestAccessBtnText}>Request Special Access</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {member.phone ? (
                  <View style={styles.field}>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{member.phone}</Text>
                  </View>
                ) : null}
                {member.occupationType ? (
                  <View style={styles.field}>
                    <Text style={styles.label}>Occupation Type</Text>
                    <Text style={styles.value}>{member.occupationType}</Text>
                  </View>
                ) : null}
              </>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeBtn: {
    color: colors.primary,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  field: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  restrictedContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  restrictedText: {
    color: '#856404',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  requestAccessBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  requestAccessBtnText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
export default MemberProfileSheet;
