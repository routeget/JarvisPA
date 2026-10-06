import { create } from 'zustand';
import { 
  ScreenType, 
  ChatMessage, 
  ApprovalItem, 
  SafetyStatus 
} from '../types';
import { jarvisAPI } from '../services/api';
import { audioService } from '../services/audioService';

interface AppState {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  
  // Command Bar & Voice Modal
  isCommandBarOpen: boolean;
  setCommandBarOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;

  // Voice Response State (Section 40-42)
  voiceResponseEnabled: boolean;
  setVoiceResponseEnabled: (enabled: boolean) => void;
  speakResponse: (text: string) => void;
  stopSpeaking: () => void;

  // Chat
  messages: ChatMessage[];
  isChatLoading: boolean;
  currentTrace: string[];
  addMessage: (msg: ChatMessage) => void;
  sendMessage: (query: string, preferredProvider?: string) => Promise<void>;

  // Approvals & Safety
  pendingApprovals: ApprovalItem[];
  safetyStatus: SafetyStatus;
  loadApprovals: () => Promise<void>;
  decideApproval: (id: string, decision: 'APPROVED' | 'REJECTED', reason?: string) => Promise<void>;
  toggleEmergencyStop: () => Promise<void>;
  refreshSafetyStatus: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'home',
  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  isCommandBarOpen: false,
  setCommandBarOpen: (open) => set({ isCommandBarOpen: open }),
  isVoiceModalOpen: false,
  setVoiceModalOpen: (open) => set({ isVoiceModalOpen: open }),

  // Voice Response (TTS) State
  voiceResponseEnabled: true,
  setVoiceResponseEnabled: (enabled) => {
    if (!enabled) audioService.stop();
    set({ voiceResponseEnabled: enabled });
  },
  speakResponse: (text: string) => audioService.speak(text),
  stopSpeaking: () => audioService.stop(),

  messages: [
    {
      id: 'welcome_1',
      role: 'assistant',
      content: "Good day. I am J.A.R.V.I.S., your autonomous desktop AI agent. All enterprise connectors (Microsoft 365, Teams, Azure DevOps, GitHub, Slack, Google Workspace) and multi-model AI routing are online and nominal. What objective would you like to achieve today?",
      created_at: new Date().toISOString(),
    }
  ],
  isChatLoading: false,
  currentTrace: [],

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  sendMessage: async (query: string, preferredProvider?: string) => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
      currentTrace: ['Analyzing objective...', 'Routing to AI Provider...'],
    }));

    try {
      const data = await jarvisAPI.sendChat(query, preferredProvider);

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        model: data.model,
        provider: data.provider,
        duration_ms: data.duration_ms,
        activity_trace: data.activity_trace,
        citations: data.citations,
        pending_approvals: data.pending_approvals,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isChatLoading: false,
        currentTrace: [],
      }));

      // Speak voice response if enabled (Section 40-42)
      if (get().voiceResponseEnabled && data.response) {
        audioService.speak(data.response);
      }

      // Refresh approvals if any were generated
      if (data.pending_approvals && data.pending_approvals.length > 0) {
        get().loadApprovals();
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Failed to execute task: ${err.message || 'Unknown error'}. Please verify backend status.`,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        isChatLoading: false,
        currentTrace: [],
      }));
    }
  },

  pendingApprovals: [],
  safetyStatus: {
    is_emergency_stopped: false,
    is_paused: false,
    disable_automation: false,
    disable_outbound_communication: false,
    disable_cloud_ai: false,
    force_local_mode: false,
  },

  loadApprovals: async () => {
    try {
      const data = await jarvisAPI.getApprovals();
      set({ pendingApprovals: data });
    } catch (e) {
      console.error('Failed to load approvals', e);
    }
  },

  decideApproval: async (id: string, decision: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      await jarvisAPI.decideApproval(id, decision, reason);
      await get().loadApprovals();
    } catch (e) {
      console.error('Failed to decide approval', e);
    }
  },

  toggleEmergencyStop: async () => {
    audioService.stop();
    const current = get().safetyStatus.is_emergency_stopped;
    if (current) {
      await jarvisAPI.resetEmergencyStop();
    } else {
      await jarvisAPI.triggerEmergencyStop();
    }
    await get().refreshSafetyStatus();
  },

  refreshSafetyStatus: async () => {
    try {
      const status = await jarvisAPI.getSafetyStatus();
      set({ safetyStatus: status });
    } catch (e) {
      console.error('Failed to get safety status', e);
    }
  },
}));
