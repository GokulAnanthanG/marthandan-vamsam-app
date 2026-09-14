import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Search, Download, Trash2, Plus, Minus, Target } from 'lucide-react-native';

interface TreeToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onRecycleBin?: () => void;
  isAdmin?: boolean;
  onAddTree?: () => void;
}

const TreeToolbar: React.FC<TreeToolbarProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  onReset,
  onSearch,
  onExport,
  onRecycleBin,
  isAdmin,
  onAddTree
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      
      {/* Left side actions - Admin & Extras */}
      <View style={styles.leftGroup} pointerEvents="box-none">
        <View style={styles.floatingBlock}>
          {onSearch && (
            <TouchableOpacity style={styles.button} onPress={onSearch}>
              <Search color="#C9A85A" size={20} />
            </TouchableOpacity>
          )}
          {onSearch && onExport && <View style={styles.divider} />}
          {onExport && (
            <TouchableOpacity style={styles.button} onPress={onExport}>
              <Download color="#C9A85A" size={20} />
            </TouchableOpacity>
          )}
        </View>

        {isAdmin && (
          <View style={styles.adminFloatingBlock}>
            {onRecycleBin && (
              <TouchableOpacity style={styles.adminButton} onPress={onRecycleBin}>
                <Trash2 color="#011A0E" size={16} style={{ marginBottom: 2 }} />
                <Text style={styles.adminText}>Bin</Text>
              </TouchableOpacity>
            )}
            {onRecycleBin && onAddTree && <View style={styles.adminDivider} />}
            {onAddTree && (
              <TouchableOpacity style={styles.adminButton} onPress={onAddTree}>
                <Plus color="#011A0E" size={16} style={{ marginBottom: 2 }} />
                <Text style={styles.adminText}>Tree</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Right side actions - Map Controls */}
      <View style={styles.rightGroup} pointerEvents="box-none">
        <View style={styles.floatingBlock}>
          <TouchableOpacity style={styles.button} onPress={onReset}>
            <Target color="#C9A85A" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.floatingBlock}>
          <TouchableOpacity style={styles.button} onPress={onZoomIn}>
            <Plus color="#C9A85A" size={22} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.button} onPress={onZoomOut}>
            <Minus color="#C9A85A" size={22} />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  leftGroup: {
    flexDirection: 'column',
    gap: 15,
  },
  rightGroup: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 15,
  },
  floatingBlock: {
    backgroundColor: '#011A0E',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#C9A85A',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C9A85A',
  },
  adminFloatingBlock: {
    backgroundColor: '#C9A85A', // Solid Gold
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#C9A85A',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F0C766', // Brighter gold rim
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(201, 168, 90, 0.3)',
    width: 30,
  },
  adminDivider: {
    height: 1,
    backgroundColor: 'rgba(1, 26, 14, 0.2)', // Faint dark green
    width: 30,
  },
  adminButton: {
    paddingHorizontal: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  adminText: {
    color: '#011A0E', // Dark Green
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

export default TreeToolbar;
