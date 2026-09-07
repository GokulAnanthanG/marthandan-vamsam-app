import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import FamilyNode from './FamilyNode';

const { width, height } = Dimensions.get('window');

// Very basic layout calculation for demo purposes. 
// A real app would use a more robust algorithm like D3-hierarchy or a custom Reingold-Tilford implementation.
const calculateLayout = (members, relationships, rootId) => {
  const nodes = [];
  const edges = [];
  const nodeWidth = 140;
  const nodeHeight = 80;
  const horizontalSpacing = 160;
  const verticalSpacing = 120;

  const nodeMap = new Map(members.map(m => [m._id, m]));
  const childrenMap = new Map();

  relationships.forEach(rel => {
    if (!childrenMap.has(rel.parentMemberId)) {
      childrenMap.set(rel.parentMemberId, []);
    }
    childrenMap.get(rel.parentMemberId).push(rel.childMemberId);
  });

  const calculateNodePositions = (nodeId, depth, index, siblingsCount, xOffset = 0) => {
    const member = nodeMap.get(nodeId);
    if (!member) return;

    // Calculate x based on depth and siblings to center the tree
    const x = xOffset + (index - (siblingsCount - 1) / 2) * horizontalSpacing;
    const y = depth * verticalSpacing;

    nodes.push({ ...member, x, y, width: nodeWidth, height: nodeHeight });

    const children = childrenMap.get(nodeId) || [];
    children.forEach((childId, idx) => {
      calculateNodePositions(childId, depth + 1, idx, children.length, x);
      edges.push({
        from: { x, y: y + nodeHeight },
        to: { x: x + (idx - (children.length - 1) / 2) * horizontalSpacing, y: (depth + 1) * verticalSpacing }
      });
    });
  };

  // Find root if not provided (member with no parents)
  let actualRootId = rootId;
  if (!actualRootId && members.length > 0) {
    const allChildren = new Set(relationships.map(r => r.childMemberId));
    const potentialRoot = members.find(m => !allChildren.has(m._id));
    if (potentialRoot) actualRootId = potentialRoot._id;
  }

  if (actualRootId) {
    calculateNodePositions(actualRootId, 0, 0, 1, width / 2 - nodeWidth / 2);
  }

  return { nodes, edges };
};

const FamilyTreeCanvas = ({ data, onNodePress }) => {
  const [layout, setLayout] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (data && data.members && data.members.length > 0) {
      const newLayout = calculateLayout(data.members, data.relationships, data.rootMemberId);
      setLayout(newLayout);
    }
  }, [data]);

  return (
    <ScrollView horizontal contentContainerStyle={styles.scrollContainer} maximumZoomScale={2} minimumZoomScale={0.5}>
      <ScrollView contentContainerStyle={styles.scrollContainer} maximumZoomScale={2} minimumZoomScale={0.5}>
        <View style={styles.canvas}>
          <Svg height="1500" width="1500" style={styles.svg}>
            {layout.edges.map((edge, index) => (
              <Path
                key={index}
                d={`M ${edge.from.x + 70} ${edge.from.y} C ${edge.from.x + 70} ${edge.from.y + 40}, ${edge.to.x + 70} ${edge.to.y - 40}, ${edge.to.x + 70} ${edge.to.y}`}
                stroke={colors.accent}
                strokeWidth="3"
                fill="none"
              />
            ))}
          </Svg>
          {layout.nodes.map(node => (
            <FamilyNode
              key={node._id}
              node={node}
              onPress={() => onNodePress(node)}
            />
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    minWidth: width,
    minHeight: height,
    backgroundColor: colors.background,
  },
  canvas: {
    position: 'relative',
    width: 1500,
    height: 1500,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  }
});

export default FamilyTreeCanvas;
