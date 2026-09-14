import React from 'react';
import { Path } from 'react-native-svg';
import { colors } from '../../../theme/colors';

interface Edge {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isSecondary?: boolean;
}

interface Props {
  edge: Edge;
}

const FamilyConnection: React.FC<Props> = ({ edge }) => {
  // Use a cubic bezier curve for smooth connecting lines
  const dy = edge.to.y - edge.from.y;
  const controlOffset = Math.max(dy / 3, 40);
  const pathData = `M ${edge.from.x} ${edge.from.y} C ${edge.from.x} ${edge.from.y + controlOffset}, ${edge.to.x} ${edge.to.y - controlOffset}, ${edge.to.x} ${edge.to.y}`;

  return (
    <Path
      d={pathData}
      stroke="#C9A85A"
      strokeWidth={edge.isSecondary ? "1.5" : "3"}
      fill="none"
      opacity={edge.isSecondary ? 0.4 : 0.8}
      strokeDasharray={edge.isSecondary ? "6,6" : undefined}
    />
  );
};

export default FamilyConnection;
