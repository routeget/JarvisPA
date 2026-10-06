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
  metadata?: Record<string, any>;
  last_synced_at?: string;
  key_name?: string;
  is_configured?: boolean;
  masked_credential?: string | null;
}

export interface AIProviderItem {
  id: string;
  name: string;
  endpoint?: string;
  is_enabled: boolean;
  default_model?: string;
  fallback_model?: string;
  is_healthy: boolean;
  max_budget_daily: number;
  current_spend_daily?: number;
  key_name?: string;
  is_configured?: boolean;
  masked_key?: string | null;
}

export interface AIModelItem {
  id: string;
  provider_id: string;
  display_name: string;
  context_window: number;
  supports_tools: boolean;
  supports_vision: boolean;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
}

export interface ActivityLogItem {
  id: string;
  actor: string;
  action: string;
  resource: string;
  risk_level: string;
  timestamp: string;
  task_id?: string;
  provider?: string;
  model?: string;
  tool?: string;
  duration_ms?: number;
  classification?: string;
  arguments_hash?: string;
  result_status?: string;
  details?: Record<string, any>;
}

export interface MissionItem {
  id: string;
  title: string;
  objective: string;
  status: string;
  progress_percent: number;
  steps_total: number;
  steps_completed: number;
  schedule?: string;
  sources?: string[];
}

export interface AutomationItem {
  id: string;
  title: string;
  trigger_type: string;
  schedule_cron?: string;
  is_enabled: boolean;
  last_run_at?: string;
  actions_count: number;
}

export interface MemoryItem {
  id: string;
  content: string;
  memory_type: string;
  classification: string;
  importance: number;
  created_at: string;
  access_count: number;
}

export interface SafetyStatus {
  is_emergency_stopped: boolean;
  is_paused?: boolean;
  disable_automation?: boolean;
  disable_outbound_communication?: boolean;
  disable_cloud_ai?: boolean;
  force_local_mode?: boolean;
  safe_mode_active?: boolean;
  outbound_network_allowed?: boolean;
  execution_allowed?: boolean;
  last_stop_trigger?: string;
}
