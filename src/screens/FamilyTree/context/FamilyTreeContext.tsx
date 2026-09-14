import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ManagementMode = 'VIEWER' | 'ADMIN';

export interface TreeData {
  treeId: string;
  rootMemberId: string | null;
  members: any[];
  relationships: any[];
}

interface FamilyTreeContextType {
  activeTreeId: string | null;
  setActiveTreeId: (id: string | null) => void;
  treeData: TreeData | null;
  setTreeData: React.Dispatch<React.SetStateAction<TreeData | null>>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  selectedNode: any;
  setSelectedNode: (node: any) => void;
  managementMode: ManagementMode;
  setManagementMode: (mode: ManagementMode) => void;
  
  // Modals visibility
  actionSheetVisible: boolean;
  setActionSheetVisible: (v: boolean) => void;
  profileVisible: boolean;
  setProfileVisible: (v: boolean) => void;
  addChildVisible: boolean;
  setAddChildVisible: (v: boolean) => void;
  editMemberVisible: boolean;
  setEditMemberVisible: (v: boolean) => void;
  addMemberVisible: boolean;
  setAddMemberVisible: (v: boolean) => void;
  requestModVisible: boolean;
  setRequestModVisible: (v: boolean) => void;
  addSubtreeReqVisible: boolean;
  setAddSubtreeReqVisible: (v: boolean) => void;
  headDetailsVisible: boolean;
  setHeadDetailsVisible: (v: boolean) => void;
  recycleBinVisible: boolean;
  setRecycleBinVisible: (v: boolean) => void;
  createTreeVisible: boolean;
  setCreateTreeVisible: (v: boolean) => void;

  // Moving Subtree State
  movingSubtreeNode: any;
  setMovingSubtreeNode: (node: any) => void;
}

const FamilyTreeContext = createContext<FamilyTreeContextType | undefined>(undefined);

export const FamilyTreeProvider = ({ children }: { children: ReactNode }) => {
  const [activeTreeId, setActiveTreeId] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [managementMode, setManagementMode] = useState<ManagementMode>('VIEWER');

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [addChildVisible, setAddChildVisible] = useState(false);
  const [editMemberVisible, setEditMemberVisible] = useState(false);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [requestModVisible, setRequestModVisible] = useState(false);
  const [addSubtreeReqVisible, setAddSubtreeReqVisible] = useState(false);
  const [headDetailsVisible, setHeadDetailsVisible] = useState(false);
  const [recycleBinVisible, setRecycleBinVisible] = useState(false);
  const [createTreeVisible, setCreateTreeVisible] = useState(false);

  const [movingSubtreeNode, setMovingSubtreeNode] = useState<any>(null);

  return (
    <FamilyTreeContext.Provider value={{
      activeTreeId, setActiveTreeId,
      treeData, setTreeData,
      loading, setLoading,
      selectedNode, setSelectedNode,
      managementMode, setManagementMode,
      actionSheetVisible, setActionSheetVisible,
      profileVisible, setProfileVisible,
      addChildVisible, setAddChildVisible,
      editMemberVisible, setEditMemberVisible,
      addMemberVisible, setAddMemberVisible,
      requestModVisible, setRequestModVisible,
      addSubtreeReqVisible, setAddSubtreeReqVisible,
      headDetailsVisible, setHeadDetailsVisible,
      recycleBinVisible, setRecycleBinVisible,
      createTreeVisible, setCreateTreeVisible,
      movingSubtreeNode, setMovingSubtreeNode
    }}>
      {children}
    </FamilyTreeContext.Provider>
  );
};

export const useFamilyTreeContext = () => {
  const context = useContext(FamilyTreeContext);
  if (!context) {
    throw new Error('useFamilyTreeContext must be used within a FamilyTreeProvider');
  }
  return context;
};
