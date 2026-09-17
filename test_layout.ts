import { calculateTreeLayout } from './src/screens/FamilyTree/utils/treeLayoutAlgorithm';

const members = [
  { _id: '1', name: 'Root' },
  { _id: '2', name: 'Child 1' },
  { _id: '3', name: 'Child 2' }
];

const relationships = [
  { parentMemberId: '1', childMemberId: '2' },
  { parentMemberId: '1', childMemberId: '3' }
];

try {
  const result = calculateTreeLayout(members as any, relationships as any, null, new Set());
  console.log('Success! Nodes:', result.nodes.length, 'Edges:', result.edges.length);
  const gridItems = result.spatialGrid.query({ minX: -1000, maxX: 1000, minY: -1000, maxY: 1000 });
  console.log('Grid query returned', gridItems.size, 'items');
} catch (e) {
  console.error('Crash:', e);
}
