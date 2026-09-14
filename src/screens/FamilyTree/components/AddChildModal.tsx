import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';

interface AddChildModalProps {
  visible: boolean;
  onClose: () => void;
  parentNode: any;
  onSubmit: (childData: any) => void;
}

const AddChildModal: React.FC<AddChildModalProps> = ({ visible, onClose, parentNode, onSubmit }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('MALE');
  
  if (!parentNode) return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (parentNode.maritalStatus === 'SINGLE') {
      Alert.alert(
        'Changing Marital Status',
        'You are adding an heir to this member. Their marital status will be changed from Single to Married.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              onSubmit({ name, gender });
              onClose();
              setName('');
              setGender('MALE');
            }
          }
        ]
      );
    } else {
      onSubmit({ name, gender });
      onClose();
      setName('');
      setGender('MALE');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Child to {parentNode.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.form}>
            <Text style={styles.label}>Child Name *</Text>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName}
              placeholder="Enter name"
            />

            <Text style={styles.label}>Gender *</Text>
            <View style={styles.genderContainer}>
              {['MALE', 'FEMALE'].map(g => (
                <TouchableOpacity 
                  key={g} 
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Add Child</Text>
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
    height: '70%',
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    color: colors.textPrimary,
  },
  genderTextActive: {
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

export default AddChildModal;
