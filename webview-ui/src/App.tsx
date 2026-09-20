import { useEffect, useState } from 'react';
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

  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
        data: { member, spouse: spouseData, highlighted: false },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        draggable: false,
      });

      processedMemberIds.add(member._id);
    });

    // Create edges for PARENT_CHILD
    relationships.forEach((rel: any) => {
      if (rel.relationshipType === 'PARENT_CHILD') {
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
        } else if (data.type === 'HIGHLIGHT_NODE') {
          setNodes((nds) => nds.map((n) => {
            if (n.id === data.memberId) {
              return { ...n, data: { ...n.data, highlighted: true } };
            }
            return { ...n, data: { ...n.data, highlighted: false } };
          }));

          if (reactFlowInstance) {
            const node = reactFlowInstance.getNode(data.memberId);
            if (node) {
              reactFlowInstance.setCenter(node.position.x + 110, node.position.y + 60, { zoom: 1.5, duration: 800 });
            }
          }
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
  }, [reactFlowInstance]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f5f5f5' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        nodesDraggable={false}
        fitView
      >
        <Background color="#ccc" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
