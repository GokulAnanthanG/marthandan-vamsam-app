import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { colors } from '../../../theme/colors';
import { familyMediaApi } from '../../../services/api';

interface FamilyHeadDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
  treeId: string;
  headMemberId: string;
  isAdmin: boolean;
}

const FamilyHeadDetailsModal: React.FC<FamilyHeadDetailsModalProps> = ({ visible, onClose, onSaveSuccess, treeId, headMemberId, isAdmin }) => {
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && treeId && headMemberId) {
      fetchDetails();
    }
  }, [visible, treeId, headMemberId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await familyMediaApi.getHeadDetails(treeId, headMemberId);
      if (res.data?.data) {
        setDescription(res.data.data.familyDescription || '');
        setPhotoUrl(res.data.data.familyPhotoUrl || '');
      } else {
        setDescription('');
        setPhotoUrl('');
      }
    } catch (error) {
      // It might return 404 if not created yet, which is fine
      console.log('No details found or error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await familyMediaApi.updateHeadDetails(treeId, headMemberId, {
        familyDescription: description,
        familyPhotoUrl: photoUrl
      });
      Alert.alert('Success', 'Family details updated successfully');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Family Details</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <ScrollView>
              <Text style={styles.label}>Family History / Description</Text>
              {isAdmin ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter family description..."
                  multiline
                  numberOfLines={4}
                />
              ) : (
                <Text style={styles.textValue}>{description || 'No description available.'}</Text>
              )}

              <Text style={styles.label}>Cover Photo URL</Text>
              {isAdmin ? (
                <TextInput
                  style={styles.input}
                  value={photoUrl}
                  onChangeText={setPhotoUrl}
                  placeholder="https://..."
                />
              ) : (
                <Text style={styles.textValue}>{photoUrl || 'No cover photo available.'}</Text>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
                  <Text style={styles.btnText}>Close</Text>
                </TouchableOpacity>
                {isAdmin && (
                  <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
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
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textValue: {
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btn: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: '#999',
  },
  saveBtn: {
    backgroundColor: colors.primary,
  },
  btnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FamilyHeadDetailsModal;
