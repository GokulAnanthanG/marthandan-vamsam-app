import * as d3 from 'd3-hierarchy';

export const NODE_WIDTH = 160;
export const NODE_HEIGHT = 100;
export const HORIZONTAL_SPACING = 180;
export const VERTICAL_SPACING = 140;

interface Member {
  _id: string;
  [key: string]: any;
}

interface Relationship {
  parentMemberId: string;
  childMemberId: string;
}

interface LayoutResult {
  nodes: any[];
  edges: any[];
  rootId?: string;
}

export const calculateTreeLayout = (
  members: Member[],
  relationships: Relationship[],
  rootId: string | null,
  collapsedIds: Set<string>
): LayoutResult => {
  if (!members || members.length === 0) return { nodes: [], edges: [] };

  const nodeMap = new Map(members.map(m => [m._id, m]));
  
  const childrenMap = new Map<string, string[]>();
  const secondaryEdges: { from: string, to: string }[] = [];
  const hasParent = new Set<string>();

  relationships.forEach(rel => {
    if (!childrenMap.has(rel.parentMemberId)) {
      childrenMap.set(rel.parentMemberId, []);
    }
    childrenMap.get(rel.parentMemberId)!.push(rel.childMemberId);
    hasParent.add(rel.childMemberId);
  });

  // Find all roots
  let rootNodes = members.filter(m => !hasParent.has(m._id));

  // Ensure the requested rootId is processed first if provided
  if (rootId && nodeMap.has(rootId)) {
    const specificRoot = nodeMap.get(rootId)!;
    rootNodes = rootNodes.filter(m => m._id !== rootId);
    rootNodes.unshift(specificRoot);
  } else if (rootNodes.length === 0 && members.length > 0) {
    // Fallback if graph is fully cyclic with no root
    rootNodes = [members[0]];
  }

  const finalNodes: any[] = [];
  const finalEdges: any[] = [];
  const globalPositionMap = new Map<string, { x: number, y: number }>();
  const globalVisited = new Set<string>();

  // Build hierarchy object for d3
  const buildHierarchy = (id: string, pathVisited: Set<string>): any => {
    const member = nodeMap.get(id);
    if (!member) return null;

    const isCollapsed = collapsedIds.has(id);
    const childrenIds = childrenMap.get(id) || [];
    
    const node: any = {
      id,
      member,
      isCollapsed,
      hasChildren: childrenIds.length > 0
    };

    globalVisited.add(id);
    const newVisited = new Set(pathVisited).add(id);

    if (!isCollapsed && childrenIds.length > 0) {
      const validChildren: any[] = [];
      childrenIds.forEach(childId => {
        if (!pathVisited.has(childId) && !globalVisited.has(childId)) {
           const childNode = buildHierarchy(childId, newVisited);
           if (childNode) validChildren.push(childNode);
        } else {
           secondaryEdges.push({ from: id, to: childId });
        }
      });
      if (validChildren.length > 0) {
        node.children = validChildren;
      }
    }

    return node;
  };

  let currentOffsetX = 0;
  const GAP_BETWEEN_TREES = 200;

  rootNodes.forEach((rootMember) => {
    if (globalVisited.has(rootMember._id)) return;

    const hierarchyData = buildHierarchy(rootMember._id, new Set());
    if (!hierarchyData) return;

    const root = d3.hierarchy(hierarchyData);
    
    const treeLayout = d3.tree()
      .nodeSize([NODE_WIDTH + 40, VERTICAL_SPACING]); 

    treeLayout(root);

    let treeMinX = Infinity;
    let treeMaxX = -Infinity;

    root.each((d: any) => {
      const leftX = d.x - NODE_WIDTH / 2;
      const rightX = d.x + NODE_WIDTH / 2;
      if (leftX < treeMinX) treeMinX = leftX;
      if (rightX > treeMaxX) treeMaxX = rightX;
    });

    if (treeMinX === Infinity) return;

    // Shift tree so its leftmost bound starts at currentOffsetX
    const shiftX = currentOffsetX - treeMinX;

    root.each((d: any) => {
      const x = d.x + shiftX; 
      const y = d.y;
      
      globalPositionMap.set(d.data.id, { x, y });

      finalNodes.push({
        ...d.data.member,
        x: x - NODE_WIDTH / 2, // d3 returns center x, we need top-left for absolute positioning
        y: y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        hasChildren: d.data.hasChildren,
        isCollapsed: d.data.isCollapsed
      });
    });

    // Draw primary edges from d3 layout
    root.links().forEach((link: any) => {
      finalEdges.push({
        from: { x: link.source.x + shiftX, y: link.source.y + NODE_HEIGHT },
        to: { x: link.target.x + shiftX, y: link.target.y }
      });
    });

    currentOffsetX += (treeMaxX - treeMinX) + GAP_BETWEEN_TREES;
  });

  // Draw secondary edges
  secondaryEdges.forEach(edge => {
    const sourcePos = globalPositionMap.get(edge.from);
    const targetPos = globalPositionMap.get(edge.to);
    if (sourcePos && targetPos) {
      finalEdges.push({
        from: { x: sourcePos.x, y: sourcePos.y + NODE_HEIGHT },
        to: { x: targetPos.x, y: targetPos.y },
        isSecondary: true
      });
    }
  });

  return { nodes: finalNodes, edges: finalEdges, rootId: rootNodes.length > 0 ? rootNodes[0]._id : undefined };
};
