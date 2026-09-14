import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, PanResponder, TouchableOpacity, Modal, Text, Image, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Svg from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import { colors } from '../../theme/colors';
import FamilyNode from './FamilyNode';
import FamilyConnection from './components/FamilyConnection';
import FamilyHeadBanner from './components/FamilyHeadBanner';
import { familyMediaApi } from '../../services/api';
import { useFamilyTreeContext } from './context/FamilyTreeContext';
import { calculateTreeLayout, NODE_WIDTH, NODE_HEIGHT } from './utils/treeLayoutAlgorithm';

const { width, height } = Dimensions.get('window');

export interface FamilyTreeCanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  focusNode: (nodeId: string) => void;
  exportImage: () => Promise<string | undefined>;
}

interface Props {
  onNodePress: (node: any) => void;
  onLoadMore?: (nodeId: string) => void;
}

const FamilyTreeCanvas = forwardRef<FamilyTreeCanvasRef, Props>(({ onNodePress, onLoadMore }, ref) => {
  const { treeData, activeTreeId } = useFamilyTreeContext();
  const [layout, setLayout] = useState<{ nodes: any[], edges: any[], rootId?: string }>({ nodes: [], edges: [] });
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [headDetailsMap, setHeadDetailsMap] = useState<Record<string, any>>({});
  const [selectedHeadDetails, setSelectedHeadDetails] = useState<any>(null);

  useEffect(() => {
    if (activeTreeId) {
      familyMediaApi.getAllHeadDetails(activeTreeId)
        .then((res) => {
          if (res.data?.data) {
            const map: Record<string, any> = {};
            res.data.data.forEach((detail: any) => {
              map[detail.headMemberId] = detail;
            });
            setHeadDetailsMap(map);
          }
        })
        .catch(err => console.log('Failed to fetch all head details', err));
    } else {
      setHeadDetailsMap({});
    }
  }, [activeTreeId, treeData]); // Refetch if treeData changes (like a node is added/updated)

  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Track values for pan responder
  const currentScale = useRef(1);
  const currentPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
    scale.addListener(({ value }) => { currentScale.current = value; });
    translateX.addListener(({ value }) => { currentPan.current.x = value; });
    translateY.addListener(({ value }) => { currentPan.current.y = value; });
    return () => {
      scale.removeAllListeners();
      translateX.removeAllListeners();
      translateY.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (treeData && treeData.members && treeData.members.length > 0) {
      const newLayout = calculateTreeLayout(treeData.members, treeData.relationships || [], treeData.rootMemberId, collapsedIds);
      setLayout(newLayout as any);
    } else {
      setLayout({ nodes: [], edges: [] });
    }
  }, [treeData, collapsedIds]);

  const toggleCollapse = (nodeId: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
        // Check if we need to load more data
        if (treeData && treeData.relationships && treeData.members) {
          const children = treeData.relationships
            .filter((r: any) => r.parentMemberId === nodeId)
            .map((r: any) => r.childMemberId);
            
          const hasMissingChildren = children.some((childId: string) => 
            !treeData.members.find((m: any) => m._id === childId)
          );

          if (hasMissingChildren && onLoadMore) {
            onLoadMore(nodeId);
          }
        }
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      Animated.spring(scale, { toValue: Math.min(currentScale.current * 1.3, 3), useNativeDriver: true }).start();
    },
    zoomOut: () => {
      Animated.spring(scale, { toValue: Math.max(currentScale.current / 1.3, 0.3), useNativeDriver: true }).start();
    },
    resetZoom: () => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    },
    focusNode: (nodeId: string) => {
      const node = layout.nodes.find((n: any) => n._id === nodeId) as any;
      if (node) {
        Animated.parallel([
          Animated.spring(scale, { toValue: 1.2, useNativeDriver: true }),
          Animated.spring(translateX, { toValue: width/2 - node.x - NODE_WIDTH/2, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: height/2 - node.y - NODE_HEIGHT/2, useNativeDriver: true }),
        ]).start();
      }
    },
    exportImage: async () => {
      if (viewShotRef.current) {
        return await captureRef(viewShotRef.current, { format: "jpg", quality: 0.9 });
      }
      return undefined;
    }
  }));

  const viewShotRef = useRef<any>(null);

  const initialPinchDist = useRef<number | null>(null);
  const initialScaleOnPinch = useRef(1);
  const isPinching = useRef(false);

  const calcDistance = (touches: readonly any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          isPinching.current = true;
          initialPinchDist.current = calcDistance(evt.nativeEvent.touches);
          initialScaleOnPinch.current = currentScale.current;
        } else {
          isPinching.current = false;
          translateX.setOffset(currentPan.current.x);
          translateY.setOffset(currentPan.current.y);
          translateX.setValue(0);
          translateY.setValue(0);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          if (!isPinching.current) {
            isPinching.current = true;
            initialPinchDist.current = calcDistance(evt.nativeEvent.touches);
            initialScaleOnPinch.current = currentScale.current;
            translateX.flattenOffset();
            translateY.flattenOffset();
          }
          if (initialPinchDist.current) {
            const dist = calcDistance(evt.nativeEvent.touches);
            const scaleFactor = dist / initialPinchDist.current;
            let newScale = initialScaleOnPinch.current * scaleFactor;
            // Limit scale between 0.2 and 4
            newScale = Math.min(Math.max(newScale, 0.2), 4);
            scale.setValue(newScale);
          }
        } else {
          if (isPinching.current) {
            isPinching.current = false;
            translateX.setOffset(currentPan.current.x);
            translateY.setOffset(currentPan.current.y);
            translateX.setValue(0);
            translateY.setValue(0);
          }
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        isPinching.current = false;
        translateX.flattenOffset();
        translateY.flattenOffset();
      },
      onPanResponderTerminate: () => {
        isPinching.current = false;
        translateX.flattenOffset();
        translateY.flattenOffset();
      }
    })
  ).current;
  let minX = 0, maxX = width, minY = 0, maxY = height;
  layout.nodes.forEach((node: any) => {
    if (node.x < minX) minX = node.x;
    if (node.x + NODE_WIDTH > maxX) maxX = node.x + NODE_WIDTH;
    if (node.y < minY) minY = node.y;
    if (node.y + NODE_HEIGHT > maxY) maxY = node.y + NODE_HEIGHT;
  });
  
  const svgWidth = Math.max(maxX - minX + 500, width * 2);
  const svgHeight = Math.max(maxY - minY + 500, height * 2);
  const svgOffsetX = -Math.min(minX - 250, 0);
  const svgOffsetY = -Math.min(minY - 250, 0);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        ref={viewShotRef}
        style={[
          styles.canvas,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
            ],
            backgroundColor: 'transparent'
          },
        ]}
      >
        <Svg height={svgHeight} width={svgWidth} style={[styles.svg, { left: -svgOffsetX, top: -svgOffsetY }]}>
          {layout.edges.map((edge: any, index) => (
             <FamilyConnection key={index} edge={{
               ...edge,
               from: { x: edge.from.x + svgOffsetX, y: edge.from.y + svgOffsetY },
               to: { x: edge.to.x + svgOffsetX, y: edge.to.y + svgOffsetY }
             }} />
          ))}
        </Svg>
        {layout.nodes.map((node: any) => {
          const headDetails = headDetailsMap[node._id];
          return (
            <View key={node._id} style={{ position: 'absolute', left: node.x, top: node.y }}>
              <FamilyNode
              node={node}
              onPress={() => onNodePress(node)}
              hasHeritage={!!headDetails}
              onHeritagePress={() => setSelectedHeadDetails(headDetails)}
            />
            {node.hasChildren && (
              <TouchableOpacity
                style={styles.collapseButton}
                onPress={() => toggleCollapse(node._id)}
              >
                <View style={styles.collapseIcon}>
                  <View style={styles.collapseH} />
                  {node.isCollapsed && <View style={styles.collapseV} />}
                </View>
              </TouchableOpacity>
            )}
          </View>
          );
        })}
      </Animated.View>

      <Modal
        visible={!!selectedHeadDetails}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedHeadDetails(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedHeadDetails(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {selectedHeadDetails?.familyPhotoUrl ? (
                  <Image source={{ uri: selectedHeadDetails.familyPhotoUrl }} style={styles.modalImage} resizeMode="cover" />
                ) : (
                  <View style={styles.modalImagePlaceholder}>
                    <Text style={styles.modalImagePlaceholderText}>Family Heritage</Text>
                  </View>
                )}
                
                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>OUR LEGACY</Text>
                  <ScrollView style={styles.modalScroll} bounces={false}>
                    <Text style={styles.modalDescription}>
                      {selectedHeadDetails?.familyDescription || 'No heritage description provided.'}
                    </Text>
                  </ScrollView>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedHeadDetails(null)}>
                    <Text style={styles.modalCloseText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  canvas: {
    flex: 1,
  },
  svg: {
    position: 'absolute',
  },
  collapseButton: {
    position: 'absolute',
    bottom: -15,
    left: NODE_WIDTH / 2 - 15,
    width: 30,
    height: 30,
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  collapseIcon: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapseH: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  collapseV: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalImage: {
    width: '100%',
    height: 180,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImagePlaceholderText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  modalBody: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 250,
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FamilyTreeCanvas;
