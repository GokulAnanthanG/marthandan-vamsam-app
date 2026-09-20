import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme/colors';

export type ActionMode = 'CHILD' | 'SPOUSE' | 'ROOT' | 'EDIT' | 'INSERT_BETWEEN' | null;

interface MemberActionModalProps {
  visible: boolean;
  mode: ActionMode;
  initialData?: any;
  targetMember?: any; // The member being acted upon (parent, spouse, or self if edit)
  onClose: () => void;
  onSave: (data: any, originalData: any) => Promise<void>;
}

export default function MemberActionModal({ visible, mode, initialData, targetMember, onClose, onSave }: MemberActionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'MALE',
    dateOfBirth: '',
    maritalStatus: 'SINGLE',
    occupationType: 'OTHER',
    jobTitle: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === 'EDIT' && initialData) {
        setFormData({
          name: initialData.name || '',
          gender: initialData.gender || 'MALE',
          dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
          maritalStatus: initialData.maritalStatus || 'SINGLE',
          occupationType: initialData.occupationType || 'OTHER',
          jobTitle: initialData.jobTitle || '',
          address: initialData.residentialAddress || ''
        });
      } else {
        setFormData({
          name: '',
          gender: 'MALE',
          dateOfBirth: '',
          maritalStatus: 'SINGLE',
          occupationType: 'OTHER',
          jobTitle: '',
          address: ''
        });
      }
    }
  }, [visible, mode, initialData]);

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (mode === 'CHILD' && targetMember?.maritalStatus === 'SINGLE') {
      Alert.alert(
        'Changing Marital Status',
        'You are adding an heir to this member.\nTheir marital status will be changed from Single to Married.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => performSave() 
          }
        ]
      );
    } else {
      performSave();
    }
  };

  const performSave = async () => {
    try {
      setLoading(true);
      await onSave(formData, initialData);
      onClose();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message || 'Failed to save member details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {mode === 'CHILD' ? 'Add Child' : 
             mode === 'SPOUSE' ? 'Add Spouse' : 
             mode === 'ROOT' ? 'Add Root Member' : 
             mode === 'INSERT_BETWEEN' ? 'Insert Node Between' : 'Edit Member'}
          </Text>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={t => setFormData({...formData, name: t})}
            />

            <Text style={styles.label}>Gender *</Text>
            <View style={styles.row}>
              {['MALE', 'FEMALE'].map(g => (
                <TouchableOpacity 
                  key={g} 
                  style={[styles.radioBtn, formData.gender === g && styles.radioBtnActive]}
                  onPress={() => setFormData({...formData, gender: g})}
                >
                  <Text style={[styles.radioText, formData.gender === g && styles.radioTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Marital Status</Text>
            <View style={styles.row}>
              {['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED'].map(status => (
                <TouchableOpacity 
                  key={status} 
                  style={[styles.radioBtn, formData.maritalStatus === status && styles.radioBtnActive]}
                  onPress={() => setFormData({...formData, maritalStatus: status})}
                >
                  <Text style={[styles.radioText, formData.maritalStatus === status && styles.radioTextActive]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1990-01-01"
              value={formData.dateOfBirth}
              onChangeText={t => setFormData({...formData, dateOfBirth: t})}
            />

            <Text style={styles.label}>Job Title / Occupation</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Software Engineer"
              value={formData.jobTitle}
              onChangeText={t => setFormData({...formData, jobTitle: t})}
            />
            
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Residential Address"
              multiline
              value={formData.address}
              onChangeText={t => setFormData({...formData, address: t})}
            />

          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnOutline} onPress={onClose} disabled={loading}>
              <Text style={styles.btnOutlineText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    maxHeight: '85%'
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: colors.primary
  },
  formScroll: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 16,
    backgroundColor: '#fafafa',
    color: colors.textPrimary
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  radioBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  radioBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  radioText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600'
  },
  radioTextActive: {
    color: '#fff'
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  btn: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center'
  },
  btnText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  btnOutline: { 
    borderWidth: 1, 
    borderColor: colors.primary, 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  btnOutlineText: { 
    color: colors.primary,
    fontWeight: 'bold'
  }
});
