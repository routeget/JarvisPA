import re
from typing import Dict, Any, Optional
from backend.jarvis.security.emergency import emergency_controller


class VoiceService:
    """
    Implements Voice Architecture per Section 40-42.
    Handles Speech-to-Text, Voice Command recognition, and Text-to-Speech synthesis formatting.
    """

    def __init__(self):
        self.is_listening: bool = False
        self.voice_enabled: bool = True
        self.current_provider: str = "GeminiLive / Local WebSpeech"

    def clean_text_for_speech(self, text: str) -> str:
        """
        Strips markdown formatting, code fences, and emojis so speech synthesis
        sounds natural, clear, and executive-ready like Tony Stark's J.A.R.V.I.S.
        """
        if not text:
            return ""

        # Remove code blocks
        clean = re.sub(r"```[\s\S]*?```", " Code block omitted. ", text)
        # Remove inline code
        clean = re.sub(r"`([^`]+)`", r"\1", clean)
        # Remove markdown headers
        clean = re.sub(r"#{1,6}\s*", "", clean)
        # Remove bold / italic
        clean = re.sub(r"\*\*([^*]+)\*\*", r"\1", clean)
        clean = re.sub(r"\*([^*]+)\*", r"\1", clean)
        # Remove list dashes/bullets
        clean = re.sub(r"^\s*[-*•]\s+", "", clean, flags=re.MULTILINE)
        # Remove numbered lists
        clean = re.sub(r"^\s*\d+\.\s+", "", clean, flags=re.MULTILINE)
        # Remove XML / HTML tags
        clean = re.sub(r"<[^>]+>", "", clean)
        # Remove emojis and excessive symbols
        clean = re.sub(r"[\U00010000-\U0010ffff]", "", clean)
        # Consolidate multiple spaces and newlines
        clean = re.sub(r"\s+", " ", clean).strip()

        # If too long, summarize the first 3 key sentences for immediate voice delivery
        sentences = re.split(r"(?<=[.!?])\s+", clean)
        if len(sentences) > 4:
            return " ".join(sentences[:4])

        return clean

    def process_voice_command(self, transcript: str) -> Dict[str, Any]:
        """
        Parses high priority voice control commands per Section 42.
        """
        t = transcript.strip().lower()

        # Immediate emergency stop command
        if any(w in t for w in ("jarvis stop", "stop all", "cancel that", "jarvis, stop", "emergency stop", "halt")):
            res = emergency_controller.trigger_stop_all()
            return {
                "action": "EMERGENCY_STOP",
                "speech_output": "Emergency stop initiated. All operations have been halted.",
                "details": res,
            }

        if any(w in t for w in ("resume", "continue", "clear stop")):
            res = emergency_controller.reset_stop()
            return {
                "action": "RESUME",
                "speech_output": "System resumed. All services standing by.",
                "details": res,
            }

        clean_speech = self.clean_text_for_speech(f"Understood. Analyzing objective: {transcript}")
        return {
            "action": "DELEGATE_TO_ORCHESTRATOR",
            "query": transcript,
            "speech_output": clean_speech,
        }

    def prepare_speech_response(self, text: str) -> Dict[str, Any]:
        """
        Produces clean speech synthesis text and audio configuration.
        """
        spoken_text = self.clean_text_for_speech(text)
        return {
            "spoken_text": spoken_text,
            "voice_parameters": {
                "rate": 1.0,
                "pitch": 0.95,
                "lang": "en-US",
                "gender": "male",
            },
        }


voice_service = VoiceService()
