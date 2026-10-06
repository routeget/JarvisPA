// Multi-Model AI Voice and Audio Engine for J.A.R.V.I.S.
// Supports Google Gemini Live, OpenAI Realtime, ElevenLabs, Deepgram Aura, Azure Speech, and Local WebSpeech.
// Adheres to Section 20, 40-42: STT + TTS + Real-Time Voice Interaction

import { jarvisAPI } from './api';

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private recognition: any = null;
  private isListeningActive = false;
  private currentAudioPlayer: HTMLAudioElement | null = null;
  private customRate = 1.05;
  private customPitch = 0.95;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer British/Deep Natural English voice for J.A.R.V.I.S. personality
    const jarvisPref = voices.find((v) => 
      v.name.includes('UK English Male') ||
      v.name.includes('George') ||
      v.name.includes('Daniel') ||
      v.name.includes('David') ||
      v.name.includes('English (United Kingdom)')
    );
    const englishFallback = voices.find((v) => v.lang.startsWith('en'));
    this.selectedVoice = jarvisPref || englishFallback || voices[0] || null;
  }

  public setVoiceProfile(voiceName?: string, rate?: number, pitch?: number): void {
    if (rate !== undefined) this.customRate = rate;
    if (pitch !== undefined) this.customPitch = pitch;

    if (this.synth && voiceName) {
      const voices = this.synth.getVoices();
      const match = voices.find((v) => v.name.toLowerCase().includes(voiceName.toLowerCase()));
      if (match) {
        this.selectedVoice = match;
      }
    }
  }

  public async speak(text: string, onEnd?: () => void): Promise<void> {
    this.stop(); // Stop any ongoing speech or audio first

    // Clean text format for speech
    const clean = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[\u{1F300}-\u{1F6FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return;

    // First attempt to call backend synthesis for the active AI Voice Provider (ElevenLabs / OpenAI / Deepgram)
    try {
      const synthRes = await jarvisAPI.synthesizeVoice(clean);
      if (synthRes && synthRes.audio_data_url) {
        const audio = new Audio(synthRes.audio_data_url);
        this.currentAudioPlayer = audio;
        audio.onended = () => {
          this.currentAudioPlayer = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          this.currentAudioPlayer = null;
          this.fallbackWebSpeech(synthRes.spoken_text || clean, onEnd);
        };
        await audio.play();
        return;
      }

      // If backend returned voice parameters, apply them
      if (synthRes && synthRes.voice_parameters) {
        if (synthRes.voice_parameters.rate) this.customRate = synthRes.voice_parameters.rate;
        if (synthRes.voice_parameters.pitch) this.customPitch = synthRes.voice_parameters.pitch;
      }
      this.fallbackWebSpeech(synthRes?.spoken_text || clean, onEnd);
    } catch (e) {
      // Fallback gracefully to local Web Speech API
      this.fallbackWebSpeech(clean, onEnd);
    }
  }

  private fallbackWebSpeech(cleanText: string, onEnd?: () => void): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.customRate;
    utterance.pitch = this.customPitch;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.currentAudioPlayer) {
      this.currentAudioPlayer.pause();
      this.currentAudioPlayer.currentTime = 0;
      this.currentAudioPlayer = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    const isAudioPlaying = !!(this.currentAudioPlayer && !this.currentAudioPlayer.paused);
    const isSynthSpeaking = !!(this.synth && this.synth.speaking);
    return isAudioPlaying || isSynthSpeaking;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser environment.');
      return false;
    }

    try {
      if (this.recognition) {
        this.recognition.stop();
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          onResult(final, true);
        } else if (interim) {
          onResult(interim, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (onError) onError(event);
      };

      this.recognition.start();
      this.isListeningActive = true;
      return true;
    } catch (e) {
      if (onError) onError(e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListeningActive = false;
    }
  }
}

export const audioService = new AudioService();
