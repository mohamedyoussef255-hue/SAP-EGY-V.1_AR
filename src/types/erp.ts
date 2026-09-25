export type ModuleType = 'hr' | 'finance' | 'operations' | 'tasks' | 'analytics';

export type PlanTier = 'freemium' | 'growth' | 'enterprise';

export type DeploymentMode = 'CLOUD' | 'ON_PREMISE';

export interface OnPremiseLicense {
  licenseKey: string;
  licensedTo: string;
  edition: 'Enterprise On-Premise' | 'Standard On-Premise';
  issuedAt: string;
  expiresAt: string;
  maxUsers: number;
  serverFingerprint: string;
  signature: string;
  enabledModules: Record<ModuleType, boolean>;
  isValid: boolean;
  isExpired: boolean;
}

export interface SystemDeploymentConfig {
  mode: DeploymentMode;
  localTenantId: string;
  serverHost: string;
  postgresHost: string;
  license: OnPremiseLicense;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: PlanTier;
  createdAt: string;
  status: 'active' | 'suspended';
  storageUsedMb: number;
  storageQuotaMb: number;
  userCount: number;
  userLimit: number;
  enabledModules: Record<ModuleType, boolean>;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  managerId?: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: string;
  departmentId: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
}

export type DynamicFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'textarea'
  | 'currency';

export interface SelectOption {
  label: string;
  value: string;
}

export interface DynamicFormField {
  id: string;
  name: string; // Key in JSONB: e.g., 'asset_serial_number'
  label: string; // Display label
  type: DynamicFieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  colSpan?: 1 | 2; // 1 = half width, 2 = full width in a 2-col grid
  options?: SelectOption[]; // For select type
  dynamicDataSource?: string; // Optional dynamic source endpoint
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };
  tooltip?: string;
}

export interface FormTemplate {
  id: string;
  tenantId: string;
  entityType: string; // e.g. 'asset_entry', 'vendor_invoice', 'employee_record'
  name: string;
  description: string;
  module: ModuleType;
  version: number;
  fields: DynamicFormField[];
  createdAt: string;
  updatedAt: string;
}

export interface EntityRecord {
  id: string;
  tenantId: string;
  templateId: string;
  entityType: string;
  data: Record<string, any>; // Stored in PostgreSQL JSONB
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  stepNumber: number;
  name: string;
  roleRequired: string;
  departmentId?: string;
  slaHours: number;
}

export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  name: string;
  module: ModuleType;
  entityType: string;
  steps: WorkflowStep[];
  isActive: boolean;
}

export interface TaskItem {
  id: string;
  tenantId: string;
  workflowId?: string;
  title: string;
  description: string;
  module: ModuleType;
  departmentId: string;
  departmentName: string;
  assignedToUserId: string;
  assignedToUserName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  currentStep?: number;
  totalSteps?: number;
  dueDate: string;
  linkedEntityId?: string;
  entityType?: string;
  createdAt: string;
}

export interface ModuleKPIs {
  finance?: {
    revenueYTD: number;
    operatingExpenses: number;
    openInvoicesCount: number;
    cashRunwayMonths: number;
  };
  hr?: {
    totalEmployees: number;
    activeOnboarding: number;
    retentionRate: number;
    openRequisitions: number;
  };
  operations?: {
    activeWorkOrders: number;
    fulfillmentRate: number;
    inventoryTurnover: number;
    equipmentEfficiency: number;
  };
  tasks?: {
    totalActiveTasks: number;
    completedThisWeek: number;
    slaComplianceRate: number;
    pendingApprovals: number;
  };
}
