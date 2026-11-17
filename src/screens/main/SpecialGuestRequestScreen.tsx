import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { colors } from '../../theme/colors';
import api from '../../services/api';

const SpecialGuestRequestScreen = ({ route, navigation }: any) => {
  // Assume targetMemberId and treeId are passed via route params, as Special Access is requested against a tree/member.
  const { targetMemberId, treeId } = route.params || {};

  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [allowedFields, setAllowedFields] = useState<string[]>(['addressContact', 'professionalBusiness']);

  const handleRequestAccess = async () => {
    if (!targetMemberId || !treeId) {
      Alert.alert('Error', 'Missing target member or tree information');
      return;
    }
    
    if (!purpose.trim()) {
      Alert.alert('Error', 'Please provide a reason for special access.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/special-access-permissions', {
        targetMemberId,
        treeId,
        purpose,
        allowedFields
      });
      Alert.alert('Success', 'Special Access requested successfully. Awaiting approval.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to request special access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.infoText}>
          Request temporary special guest access to view protected information like Address, Contact, and Professional details.
        </Text>

        <Text style={styles.label}>Purpose / Reason</Text>
        <TextInput
          style={styles.inputArea}
          placeholder="Why do you need special access?"
          value={purpose}
          onChangeText={setPurpose}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Requested Access Types</Text>
        <View style={styles.chipContainer}>
          {['addressContact', 'professionalBusiness'].map(field => (
            <View key={field} style={styles.chipActive}>
              <Text style={styles.chipText}>{field === 'addressContact' ? 'Address & Contact' : 'Professional & Business'}</Text>
            </View>
          ))}
        </View>

        <Button title="Submit Request" onPress={handleRequestAccess} isLoading={loading} style={styles.submitBtn} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  infoText: { fontSize: 14, color: colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  inputArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, minHeight: 100, marginBottom: 20, backgroundColor: '#fff' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  chipActive: { backgroundColor: '#E1B95B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  chipText: { color: '#0F2F20', fontWeight: '500', fontSize: 13 },
  submitBtn: { marginTop: 10 }
});

export default SpecialGuestRequestScreen;
