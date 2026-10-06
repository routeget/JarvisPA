from typing import Dict, Any


class EmergencySafetyController:
    """
    Implements Section 120: Safety Controls.
    Emergency switches accessible via UI and system tray.
    """

    def __init__(self):
        self.is_paused: bool = False
        self.is_emergency_stopped: bool = False
        self.disable_automation: bool = False
        self.disable_outbound_communication: bool = False
        self.disable_cloud_ai: bool = False
        self.force_local_mode: bool = False

    def trigger_stop_all(self) -> Dict[str, Any]:
        self.is_emergency_stopped = True
        self.is_paused = True
        return {"status": "EMERGENCY_STOP_ACTIVE", "message": "All agent actions, tasks, and outbound communications halted."}

    def reset_stop(self) -> Dict[str, Any]:
        self.is_emergency_stopped = False
        self.is_paused = False
        return {"status": "NORMAL", "message": "Emergency stop cleared."}

    def toggle_pause(self, paused: bool) -> Dict[str, Any]:
        self.is_paused = paused
        return {"status": "PAUSED" if paused else "RESUMED"}

    def set_flags(self, **kwargs) -> Dict[str, Any]:
        for k, v in kwargs.items():
            if hasattr(self, k):
                setattr(self, k, bool(v))
        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_emergency_stopped": self.is_emergency_stopped,
            "is_paused": self.is_paused,
            "disable_automation": self.disable_automation,
            "disable_outbound_communication": self.disable_outbound_communication,
            "disable_cloud_ai": self.disable_cloud_ai,
            "force_local_mode": self.force_local_mode,
        }


emergency_controller = EmergencySafetyController()
