import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';

export interface ActionSheetOption {
  label: string;
  icon?: string;
  danger?: boolean;
  onPress: () => void;
}

interface MemberActionSheetProps {
  visible: boolean;
  member: any; // The selected member
  options: ActionSheetOption[];
  onClose: () => void;
}

export default function MemberActionSheet({ visible, member, options, onClose }: MemberActionSheetProps) {
  if (!member) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>{member.name}</Text>
            {member.jobTitle ? <Text style={styles.subtitle}>{member.jobTitle}</Text> : null}
          </View>
          
          <ScrollView style={styles.optionsList}>
            {options.map((opt, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.optionRow, idx === options.length - 1 && styles.lastOptionRow]} 
                onPress={() => {
                  onClose();
                  opt.onPress();
                }}
              >
                <Text style={[styles.optionText, opt.danger && styles.dangerText]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30, // for safe area
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionRow: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  lastOptionRow: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  dangerText: {
    color: colors.error,
  },
  cancelButton: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  }
});
