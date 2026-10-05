import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';

export type ActionMode = 'CHILD' | 'SPOUSE' | 'ROOT' | 'EDIT' | 'INSERT_BETWEEN' | null;

interface MemberActionModalProps {
  visible: boolean;
  mode: ActionMode;
  initialData?: any;
  targetMember?: any;
  onClose: () => void;
  onSave: (data: any, originalData: any) => Promise<void>;
}

export default function MemberActionModal({ visible, mode, initialData, targetMember, onClose, onSave }: MemberActionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: new Date(),
    photoUrl: '', // Profile Photo
    whatsapp: '',
    residentialAddress: '',
    businessAddress: '',
    occupationType: 'OTHER',
    businessName: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === 'EDIT' && initialData) {
        setFormData({
          name: initialData.name || '',
          phone: initialData.phone || '',
          gender: initialData.gender || 'MALE',
          dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : new Date(),
          photoUrl: initialData.photoUrl || '',
          whatsapp: initialData.whatsapp || '',
          residentialAddress: initialData.residentialAddress || '',
          businessAddress: initialData.businessAddress || '',
          occupationType: initialData.occupationType || 'OTHER',
          businessName: initialData.businessName || '',
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          gender: 'MALE',
          dateOfBirth: new Date(),
          photoUrl: '',
          whatsapp: '',
          residentialAddress: '',
          businessAddress: '',
          occupationType: 'OTHER',
          businessName: '',
        });
      }
    }
  }, [visible, mode, initialData]);

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert('Validation Error', 'Full Name is required');
      return;
    }
    if (!formData.phone) {
      Alert.alert('Validation Error', 'Mobile Number is required');
      return;
    }

    if (mode === 'CHILD' && targetMember?.maritalStatus === 'SINGLE') {
      Alert.alert(
        'Changing Marital Status',
        'You are adding an heir to this member.\nTheir marital status will be changed from Single to Married.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => performSave() }
        ]
      );
    } else {
      performSave();
    }
  };

  const performSave = async () => {
    try {
      setLoading(true);
      // Format the date before sending
      const payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth.toISOString()
      };
      await onSave(payload, initialData);
      onClose();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message || 'Failed to save member details');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({...formData, dateOfBirth: currentDate});
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
            {/* Mandatory Fields */}
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={t => setFormData({...formData, name: t})}
            />

            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={t => setFormData({...formData, phone: t})}
            />

            <Text style={styles.label}>Date of Birth *</Text>
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{color: formData.dateOfBirth ? colors.textPrimary : '#aaa'}}>
                 {formData.dateOfBirth ? formData.dateOfBirth.toDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={formData.dateOfBirth}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}

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

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Optional Fields</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Optional Fields */}
            <Text style={styles.label}>Profile Photo URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Image URL (optional)"
              value={formData.photoUrl}
              onChangeText={t => setFormData({...formData, photoUrl: t})}
            />

            <Text style={styles.label}>WhatsApp Number</Text>
            <TextInput
              style={styles.input}
              placeholder="WhatsApp Number"
              keyboardType="phone-pad"
              value={formData.whatsapp}
              onChangeText={t => setFormData({...formData, whatsapp: t})}
            />

            <Text style={styles.label}>Residential Address</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Residential Address"
              multiline
              value={formData.residentialAddress}
              onChangeText={t => setFormData({...formData, residentialAddress: t})}
            />
            
            <Text style={styles.label}>Occupation / Job Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Software Engineer"
              value={formData.occupationType}
              onChangeText={t => setFormData({...formData, occupationType: t})}
            />

            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={formData.businessName}
              onChangeText={t => setFormData({...formData, businessName: t})}
            />

            <Text style={styles.label}>Business Address</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Business Address"
              multiline
              value={formData.businessAddress}
              onChangeText={t => setFormData({...formData, businessAddress: t})}
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
    maxHeight: '90%'
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
    color: colors.textPrimary,
    justifyContent: 'center'
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0'
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
    fontSize: 14,
    fontWeight: '600'
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
