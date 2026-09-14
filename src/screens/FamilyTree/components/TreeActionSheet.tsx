import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';

interface Action {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface TreeActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  actions: Action[];
}

const TreeActionSheet: React.FC<TreeActionSheetProps> = ({
  visible,
  onClose,
  title,
  actions,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.divider} />
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                index < actions.length - 1 && styles.actionDivider
              ]}
              onPress={() => {
                onClose();
                action.onPress();
              }}
            >
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText
              ]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  actionButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  actionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  actionText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  destructiveText: {
    color: colors.error || 'red',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  }
});

export default TreeActionSheet;
