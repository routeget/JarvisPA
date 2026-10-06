import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Radio, Volume2, ShieldAlert, Play, Square } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { jarvisAPI } from '../services/api';
import { audioService } from '../services/audioService';

export const VoiceModal: React.FC = () => {
  const { isVoiceModalOpen, setVoiceModalOpen, sendMessage, setCurrentScreen, toggleEmergencyStop } = useAppStore();
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState('Listening... Speak a natural command or request.');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (isVoiceModalOpen) {
      setIsListening(true);
      setTranscript('');
      setSpeechFeedback('Listening... Speak a natural command (or click one below).');

      // Start live speech recognition
      const started = audioService.startListening(
        (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            handleSpokenCommand(text);
          }
        },
        (err) => {
          console.warn('Microphone STT note:', err);
        }
      );

      if (!started) {
        setSpeechFeedback('Microphone ready. You can test voice commands or listen to voice synthesis.');
      }
    } else {
      audioService.stopListening();
      audioService.stop();
      setIsPlayingAudio(false);
    }
  }, [isVoiceModalOpen]);

  if (!isVoiceModalOpen) return null;

  const handleSpokenCommand = async (command: string) => {
    setTranscript(command);
    setSpeechFeedback('Processing voice token stream...');

    try {
      const res = await jarvisAPI.sendVoiceCommand(command);
      if (res.action === 'EMERGENCY_STOP') {
        audioService.stop();
        setSpeechFeedback(res.speech_output || 'Emergency stop triggered.');
        audioService.speak(res.speech_output || 'Emergency stop triggered.');
      } else {
        const spoken = res.speech_output || 'Executing task now.';
        setSpeechFeedback(spoken);
        audioService.speak(spoken, () => {
          setTimeout(() => {
            setVoiceModalOpen(false);
            setCurrentScreen('chat');
            sendMessage(command);
          }, 800);
        });
      }
    } catch (err: any) {
      setSpeechFeedback(`Voice processing error: ${err.message}`);
    }
  };

  const testJarvisVoice = () => {
    setIsPlayingAudio(true);
    const greeting = "Good day, Commander. J.A.R.V.I.S. voice response is fully online and synchronized with all enterprise integrations.";
    setSpeechFeedback(greeting);
    audioService.speak(greeting, () => {
      setIsPlayingAudio(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0b1120] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl shadow-cyan-900/40 relative flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            audioService.stopListening();
            audioService.stop();
            setVoiceModalOpen(false);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase mb-6">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Real-time Voice & TTS Active</span>
        </div>

        {/* Animated Cybernetic Orb / Waveform */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-600/30 to-indigo-600/30 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center">
              <Mic className="w-8 h-8 text-cyan-400 animate-bounce" />
            </div>
          </div>
          {/* Waveform bars */}
          <div className="absolute -bottom-6 flex items-center gap-1">
            {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 35].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className="w-1 bg-cyan-400/80 rounded-full transition-all duration-300"
              />
            ))}
          </div>
        </div>

        {/* Live Feedback & Audio Playback Button */}
        <div className="mt-8 mb-4 min-h-[60px] w-full">
          <p className="text-sm font-medium text-slate-200">{speechFeedback}</p>
          {transcript && (
            <p className="text-xs font-mono text-cyan-400 mt-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              "{transcript}"
            </p>
          )}
        </div>

        {/* Test Speech Button */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={testJarvisVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test J.A.R.V.I.S. Voice Response</span>
          </button>
          {isPlayingAudio && (
            <button
              onClick={() => {
                audioService.stop();
                setIsPlayingAudio(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
            >
              <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>Stop Audio</span>
            </button>
          )}
        </div>

        {/* Quick Voice Command Triggers per Section 42 */}
        <div className="w-full space-y-1.5 text-xs text-left mt-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
            Voice Control Commands (Section 42):
          </span>
          <button
            onClick={() => handleSpokenCommand("JARVIS, check my email, Teams, Slack and Azure DevOps for everything related to Project Phoenix")}
            className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 text-left transition-all"
          >
            "JARVIS, check email, Teams, Slack, Azure DevOps for Project Phoenix"
          </button>
          <button
            onClick={() => handleSpokenCommand("JARVIS, what is on my calendar?")}
            className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 text-left transition-all"
          >
            "JARVIS, what is on my calendar?"
          </button>
          <button
            onClick={() => handleSpokenCommand("JARVIS, stop")}
            className="w-full px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/30 text-left transition-all flex items-center justify-between"
          >
            <span>"JARVIS, stop." (Emergency Stop Command)</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
