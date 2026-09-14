import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { colors } from '../../../theme/colors';

interface AddSubtreeRequestModalProps {
  visible: boolean;
  onClose: () => void;
  targetMember: any;
  onSubmit: (payload: any) => void;
}

const AddSubtreeRequestModal: React.FC<AddSubtreeRequestModalProps> = ({ visible, onClose, targetMember, onSubmit }) => {
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    if (!details.trim()) {
      Alert.alert('Error', 'Please provide details about the subtree you wish to add');
      return;
    }
    
    onSubmit({
      details
    });
    onClose();
  };

  if (!targetMember) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Request Add Subtree</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.form}>
            <Text style={styles.infoText}>
              You are requesting to add a new branch/subtree under {targetMember.name}. Please describe the new members to be added.
            </Text>

            <Text style={styles.label}>Subtree Details</Text>
            <TextInput 
              style={[styles.input, { height: 120 }]} 
              value={details} 
              onChangeText={setDetails} 
              multiline 
              placeholder="e.g. Add 2 sons named John and Doe."
            />

          </ScrollView>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit Request</Text>
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
  form: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
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
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top'
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

export default AddSubtreeRequestModal;
