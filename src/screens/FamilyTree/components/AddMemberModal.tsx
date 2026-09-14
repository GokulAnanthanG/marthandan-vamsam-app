import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { colors } from '../../../theme/colors';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any; // If provided, acts as an Edit Modal
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ visible, onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || '');
  const [gender, setGender] = useState(initialData?.gender || 'MALE');
  const [occupationType, setOccupationType] = useState(initialData?.occupationType || 'JOB');
  
  // Dynamic fields
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [businessName, setBusinessName] = useState(initialData?.businessName || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    const payload: any = { name, gender, occupationType };
    if (occupationType === 'JOB') payload.companyName = companyName;
    if (occupationType === 'BUSINESS') payload.businessName = businessName;

    onSubmit(payload);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? 'Edit Member' : 'Add New Member'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.form}>
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Gender *</Text>
            <View style={styles.row}>
              {['MALE', 'FEMALE'].map(g => (
                <TouchableOpacity 
                  key={g} 
                  style={[styles.btn, gender === g && styles.btnActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={gender === g ? styles.textActive : styles.text}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Occupation Type</Text>
            <View style={styles.row}>
              {['JOB', 'BUSINESS', 'FARMER', 'OTHER'].map(occ => (
                <TouchableOpacity 
                  key={occ} 
                  style={[styles.btn, occupationType === occ && styles.btnActive]}
                  onPress={() => setOccupationType(occ)}
                >
                  <Text style={occupationType === occ ? styles.textActive : styles.text}>{occ}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {occupationType === 'JOB' && (
              <>
                <Text style={styles.label}>Company Name</Text>
                <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} />
              </>
            )}

            {occupationType === 'BUSINESS' && (
              <>
                <Text style={styles.label}>Business Name</Text>
                <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} />
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>{isEditing ? 'Save Changes' : 'Add Member'}</Text>
          </TouchableOpacity>
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
    height: '80%',
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
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  btn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.textPrimary,
  },
  textActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AddMemberModal;
