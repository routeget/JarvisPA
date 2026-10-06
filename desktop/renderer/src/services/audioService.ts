// Web Speech API Voice and Audio Engine for J.A.R.V.I.S.
// Adheres to Section 20, 40-42: STT + TTS + Real-Time Voice Interaction

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private recognition: any = null;
  private isListeningActive = false;

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

  public speak(text: string, onEnd?: () => void): void {
    if (!this.synth) return;

    // Clean formatting in browser as well
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

    this.stop(); // Stop any ongoing speech first

    const utterance = new SpeechSynthesisUtterance(clean);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
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
