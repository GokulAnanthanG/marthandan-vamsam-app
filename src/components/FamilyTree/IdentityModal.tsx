import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';

interface IdentityModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (identityData: any) => void;
}

export default function IdentityModal({ visible, onClose, onSubmit }: IdentityModalProps) {
  const [identityData, setIdentityData] = useState({
    requesterName: '',
    requesterFatherName: '',
    requesterPhone: '',
    requestReason: ''
  });

  const handleSubmit = () => {
    if (!identityData.requesterName || !identityData.requesterPhone || !identityData.requestReason) {
      Alert.alert('Validation Error', 'Name, Phone, and Reason are required fields.');
      return;
    }
    onSubmit(identityData);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Identity Verification</Text>
          <Text style={styles.modalSubtitle}>Please provide your details before submitting a request.</Text>

          <Text style={styles.label}>Your Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={identityData.requesterName}
            onChangeText={t => setIdentityData({...identityData, requesterName: t})}
          />

          <Text style={styles.label}>Your Father's Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter father's name"
            value={identityData.requesterFatherName}
            onChangeText={t => setIdentityData({...identityData, requesterFatherName: t})}
          />

          <Text style={styles.label}>Your Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            value={identityData.requesterPhone}
            onChangeText={t => setIdentityData({...identityData, requesterPhone: t})}
          />

          <Text style={styles.label}>Reason for Request *</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Why do you want to add/edit this member?"
            multiline
            value={identityData.requestReason}
            onChangeText={t => setIdentityData({...identityData, requestReason: t})}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnOutline} onPress={onClose}>
              <Text style={styles.btnOutlineText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
              <Text style={styles.btnText}>Continue</Text>
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
    justifyContent: 'center',
    padding: 20
  },
  modalContent: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 8,
    color: colors.primary
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20
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
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 10,
    marginTop: 10
  },
  btn: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8,
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
