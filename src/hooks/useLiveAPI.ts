import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { AudioQueue } from '../utils/audioQueue';

export function useLiveAPI() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const connect = async (voiceName: string = "Zephyr") => {
    try {
      setIsConnecting(true);
      setError(null);

      // Re-initialize genAI to ensure fresh API key if changed
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      audioQueueRef.current = new AudioQueue(audioContext, (playing) => {
        setIsSpeaking(playing);
      });

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            gainNodeRef.current = gainNode;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              
              const bytes = new Uint8Array(pcm16.buffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64 = btoa(binary);
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };

            source.connect(processor);
            processor.connect(gainNode);
            gainNode.connect(audioContext.destination);
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioQueueRef.current) {
              audioQueueRef.current.playBase64Pcm(base64Audio);
            }
            if (message.serverContent?.interrupted && audioQueueRef.current) {
              audioQueueRef.current.stop();
            }
          },
          onclose: () => {
            disconnect();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error");
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
          },
          systemInstruction: "You are an Elvis Presley impersonator who is also a bulldog. You love peanut butter, bananas, and dog treats. You constantly beg the user for treats in a charming, Elvis-like way. Use signature Elvis phrases like 'Uh-huh-huh', 'Thank you very much', 'Mama', etc. Keep your responses short, punchy, and engaging. You are currently on stage performing.",
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect");
      setIsConnecting(false);
      disconnect();
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {}
      sessionRef.current = null;
    }
    if (processorRef.current && sourceRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioQueueRef.current) {
      audioQueueRef.current.stop();
      audioQueueRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  };

  const setAudioConfig = (speed: number, pitch: number, tone: number) => {
    if (audioQueueRef.current) {
      audioQueueRef.current.setAudioParams(speed, pitch, tone);
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    isSpeaking,
    connect,
    disconnect,
    setAudioConfig
  };
}
