export type GlobalInventoryStatus = 'Available' | 'In-Use' | 'Under Maintenance';
export type LANforgeLocation = 'VINSR' | 'OPEL' | 'GVP' | 'PRIMA';

export interface LANforgeRadio {
  id: string;
  lanforgeRef?: string;
  chipset: string;
  quantity: number;
}

export interface LANforgeItem {
  id: string;
  sNo: number;
  location: LANforgeLocation;
  testbedIp: string;
  project: string;
  pocId: string | null;
  pocName?: string;
  lanforgeId: string;
  lanforgeModel: string;
  maxEthernetSpeed: string;
  totalClients: number;
  noOf11beClients: number;
  noOf11axClients: number;
  noOf11acClients: number;
  noOf11nClients: number;
  status: GlobalInventoryStatus;
  comments: string;
  previouslyUsedBy?: string[];
  radios: LANforgeRadio[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesktopItem {
  id: string;
  sNo: number;
  deviceId: string;
  deviceBrand: string;
  model: string;
  project: string;
  pocId: string | null;
  pocName?: string;
  status: GlobalInventoryStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MobileItem {
  id: string;
  sNo: number;
  deviceId: string;
  deviceBrand: string;
  model: string;
  project: string;
  pocId: string | null;
  pocName?: string;
  status: GlobalInventoryStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChamberItem {
  id: string;
  sNo: number;
  chamberType: string;
  chamberId: string;
  usedById: string | null;
  usedByName?: string;
  project: string;
  status: GlobalInventoryStatus;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EquipmentCategory = 'lanforge' | 'desktop' | 'mobile' | 'chamber';
export type AssignmentStatus = 'active' | 'returned' | 'transferred';

export interface EquipmentAssignment {
  id: string;
  equipmentCategory: EquipmentCategory;
  equipmentId: string;
  equipmentTag: string;
  equipmentModel?: string;
  project?: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  assignedDate: string;
  returnDate: string | null;
  assignedBy: string;
  returnedBy?: string | null;
  notes: string;
  status: AssignmentStatus;
  transferredToEmployeeId?: string | null;
  transferredToEmployeeName?: string | null;
}

export type ActivityActionType = 
  | 'assigned' 
  | 'returned' 
  | 'transferred' 
  | 'status_change' 
  | 'config_updated' 
  | 'maintenance' 
  | 'added' 
  | 'archived'
  | 'created'
  | 'modified';

export interface ActivityLog {
  id: string;
  unitAssetTag: string;
  unitModel: string;
  inventoryCategory?: EquipmentCategory;
  inventoryId?: string | null;
  action: ActivityActionType;
  title: string;
  description: string;
  timestamp: string;
  performedBy?: string;
  employeeId?: string | null;
  employeeName?: string | null;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  user: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

export interface EmployeeEquipmentSummary {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  activeLANforges: LANforgeItem[];
  activeDesktops: DesktopItem[];
  activeMobiles: MobileItem[];
  activeChambers: ChamberItem[];
  totalActiveCount: number;
  assignmentHistory: EquipmentAssignment[];
}

export interface QueryResultItem {
  id: string;
  tag: string;
  model: string;
  category: 'lanforge' | 'desktop' | 'mobile' | 'chamber' | string;
  status: 'Available' | 'In-Use' | 'Under Maintenance' | string;
  location?: string;
  custodian?: string;
  details?: Record<string, any>;
}

export interface AIAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  actionPreview?: {
    id?: string;
    type: 'assignment' | 'config_update' | 'maintenance_log' | 'query_result' | 'transfer' | 'return' | string;
    title: string;
    unitAssetTag: string;
    model: string;
    changes: {
      field: string;
      from?: string;
      to: string;
    }[];
    status: 'pending' | 'applied' | 'cancelled';
    confirmationToken?: string;
    requiresConfirmation?: boolean;
    expiresAt?: string;
  };
  queryResults?: QueryResultItem[];
}
