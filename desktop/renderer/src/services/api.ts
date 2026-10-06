const API_BASE = 'http://127.0.0.1:8000/api/v1';

export const jarvisAPI = {
  // Chat
  async sendChat(query: string, preferredProvider?: string, classification?: string) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        preferred_provider: preferredProvider,
        data_classification: classification || 'INTERNAL',
      }),
    });
    if (!res.ok) throw new Error(`Chat error: ${res.statusText}`);
    return await res.json();
  },

  // Daily Briefing
  async getDailyBriefing() {
    const res = await fetch(`${API_BASE}/briefing`);
    if (!res.ok) throw new Error(`Briefing error: ${res.statusText}`);
    return await res.json();
  },

  // Tasks
  async getTasks() {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error(`Tasks error: ${res.statusText}`);
    return await res.json();
  },

  async cancelTask(taskId: string) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/cancel`, { method: 'POST' });
    return await res.json();
  },

  // Approvals
  async getApprovals() {
    const res = await fetch(`${API_BASE}/approvals`);
    if (!res.ok) throw new Error(`Approvals error: ${res.statusText}`);
    return await res.json();
  },

  async decideApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED', reason?: string) {
    const res = await fetch(`${API_BASE}/approvals/${approvalId}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reason }),
    });
    return await res.json();
  },

  // Connections
  async getConnections() {
    const res = await fetch(`${API_BASE}/connections`);
    return await res.json();
  },

  async configureConnection(
    connectionId: string,
    data: {
      name?: string;
      status?: string;
      auth_type?: string;
      credential?: string;
      client_id?: string;
      client_secret?: string;
      tenant_id?: string;
      metadata?: Record<string, any>;
    }
  ) {
    const res = await fetch(`${API_BASE}/connections/${connectionId}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to configure connection');
    }
    return await res.json();
  },

  async testConnection(connectionId: string) {
    const res = await fetch(`${API_BASE}/connections/${connectionId}/test`, { method: 'POST' });
    return await res.json();
  },

  // Providers & Models
  async getProviders() {
    const res = await fetch(`${API_BASE}/providers`);
    return await res.json();
  },

  async configureProvider(
    providerId: string,
    data: {
      api_key?: string;
      endpoint?: string;
      is_enabled?: boolean;
      default_model?: string;
      fallback_model?: string;
      max_budget_daily?: number;
    }
  ) {
    const res = await fetch(`${API_BASE}/providers/${providerId}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to configure provider');
    }
    return await res.json();
  },

  async getModels() {
    const res = await fetch(`${API_BASE}/models`);
    return await res.json();
  },

  // Vault Management
  async getVaultKeys() {
    const res = await fetch(`${API_BASE}/vault/keys`);
    return await res.json();
  },

  async setVaultKey(key: string, value: string) {
    const res = await fetch(`${API_BASE}/vault/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error('Failed to store secret in vault');
    return await res.json();
  },

  async deleteVaultKey(keyName: string) {
    const res = await fetch(`${API_BASE}/vault/keys/${keyName}`, { method: 'DELETE' });
    return await res.json();
  },

  // Activity & Audit
  async getActivity() {
    const res = await fetch(`${API_BASE}/activity`);
    return await res.json();
  },

  // Missions
  async getMissions() {
    const res = await fetch(`${API_BASE}/missions`);
    return await res.json();
  },

  // Automations
  async getAutomations() {
    const res = await fetch(`${API_BASE}/automations`);
    return await res.json();
  },

  async runAutomation(autoId: string) {
    const res = await fetch(`${API_BASE}/automations/${autoId}/run`, { method: 'POST' });
    return await res.json();
  },

  // Memory
  async getMemories() {
    const res = await fetch(`${API_BASE}/memory`);
    return await res.json();
  },

  async forgetMemory(memoryId: string) {
    const res = await fetch(`${API_BASE}/memory/${memoryId}`, { method: 'DELETE' });
    return await res.json();
  },

  // Safety & Emergency
  async triggerEmergencyStop() {
    const res = await fetch(`${API_BASE}/safety/emergency-stop`, { method: 'POST' });
    return await res.json();
  },

  async resetEmergencyStop() {
    const res = await fetch(`${API_BASE}/safety/reset-stop`, { method: 'POST' });
    return await res.json();
  },

  async getSafetyStatus() {
    const res = await fetch(`${API_BASE}/safety/status`);
    return await res.json();
  },

  // Voice Command
  async sendVoiceCommand(transcript: string) {
    const res = await fetch(`${API_BASE}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    return await res.json();
  },
};
