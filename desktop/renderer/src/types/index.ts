export type ScreenType = 
  | 'home'
  | 'chat'
  | 'tasks'
  | 'activity'
  | 'automations'
  | 'connections'
  | 'memory'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  provider?: string;
  duration_ms?: number;
  activity_trace?: string[];
  citations?: Array<{
    system: string;
    title: string;
    source?: string;
    citation?: string;
  }>;
  pending_approvals?: ApprovalItem[];
  created_at?: string;
}

export interface ApprovalItem {
  id: string;
  task_id?: string;
  title: string;
  description: string;
  risk_level: string;
  action_type: string;
  target_resource?: string;
  status?: string;
  payload?: Record<string, any>;
  requested_at?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled' | 'Waiting for approval' | 'Scheduled';
  priority: string;
  assigned_agent: string;
  created_at: string;
  completed_at?: string;
  result_summary?: string;
}

export interface ConnectionItem {
  id: string;
  name: string;
  service_type: string;
  status: 'Connected' | 'Disconnected' | 'Testing' | 'Error';
  auth_type: string;
  last_synced_at?: string;
}

export interface AIProviderItem {
  id: string;
  name: string;
  endpoint?: string;
  is_enabled: boolean;
  default_model?: string;
  is_healthy: boolean;
  max_budget_daily: number;
  current_spend_daily: number;
}

export interface MissionItem {
  id: string;
  title: string;
  objective: string;
  schedule?: string;
  trigger_condition?: string;
  sources: string[];
  tools: string[];
  status: string;
  last_execution?: string;
  next_execution?: string;
}

export interface AutomationItem {
  id: string;
  title: string;
  description?: string;
  trigger_type: string;
  is_active: boolean;
  last_run_at?: string;
}

export interface MemoryItem {
  id: string;
  memory_type: string;
  content: string;
  classification: string;
  importance: number;
  source: string;
  created_at?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  task_id?: string;
  provider?: string;
  model?: string;
  tool?: string;
  arguments_hash?: string;
  result_status: string;
  approval_status?: string;
  duration_ms: number;
  classification: string;
}

export interface SafetyStatus {
  is_emergency_stopped: boolean;
  is_paused: boolean;
  disable_automation: boolean;
  disable_outbound_communication: boolean;
  disable_cloud_ai: boolean;
  force_local_mode: boolean;
}
