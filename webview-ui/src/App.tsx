import { useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PersonNode from './PersonNode';
import { getLayoutedElements } from './layoutUtils';
import './App.css';

const nodeTypes = {
  person: PersonNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const processTreeData = (treeData: any) => {
    if (!treeData || !treeData.members) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    const members = treeData.members;
    const relationships = treeData.relationships || [];

    // Group spouses
    const processedMemberIds = new Set();
    const spousesMap = new Map();

    relationships.forEach((rel: any) => {
      if (rel.relationshipType === 'SPOUSE') {
        const p1 = rel.parentMemberId;
        const p2 = rel.childMemberId;
        spousesMap.set(p1, p2);
        spousesMap.set(p2, p1);
      }
    });

    members.forEach((member: any) => {
      if (processedMemberIds.has(member._id)) return;
      
      const spouseId = spousesMap.get(member._id);
      let spouseData = null;
      
      if (spouseId) {
        spouseData = members.find((m: any) => m._id === spouseId);
        if (spouseData) {
          processedMemberIds.add(spouseId);
        }
      }

      newNodes.push({
        id: member._id,
        type: 'person',
        position: { x: 0, y: 0 },
        data: { member, spouse: spouseData },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      processedMemberIds.add(member._id);
    });

    // Create edges for PARENT_CHILD
    relationships.forEach((rel: any) => {
      if (rel.relationshipType === 'PARENT_CHILD') {
        // If parent is a spouse, link from the primary node id that represents the couple
        // We will just use whichever node exists in newNodes
        let sourceId = rel.parentMemberId;
        let targetId = rel.childMemberId;

        const sourceNodeExists = newNodes.find(n => n.id === sourceId);
        if (!sourceNodeExists) {
           const partnerId = spousesMap.get(sourceId);
           if (partnerId && newNodes.find(n => n.id === partnerId)) {
             sourceId = partnerId;
           }
        }

        newEdges.push({
          id: `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'step',
          animated: false,
          style: { stroke: '#ccc', strokeWidth: 2 },
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SET_TREE_DATA') {
          processTreeData(data.payload);
        }
      } catch (e) {
        console.error('Failed to parse message', e);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // In React Native WebView, document.addEventListener('message') is sometimes used
    document.addEventListener('message', handleMessage as any);

    // Notify React Native that we are ready
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'WEBVIEW_READY' }));
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as any);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f5f5f5' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#ccc" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
