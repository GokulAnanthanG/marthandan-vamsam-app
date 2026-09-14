import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';

interface CreateTreeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

const CreateTreeModal: React.FC<CreateTreeModalProps> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(name.trim());
      setName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Create New Family Tree</Text>
          
          <Text style={styles.label}>Tree Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Siva Pillai Heritage"
            placeholderTextColor="#999"
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitBtn, !name.trim() && styles.disabledBtn]} 
              onPress={handleSubmit}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
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
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: colors.textPrimary,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    padding: 10,
    paddingHorizontal: 15,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreateTreeModal;
