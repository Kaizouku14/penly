/**
 * Hook for managing voice recording with audio visualization
 */

import { useState, useRef, useCallback, useEffect } from "react";

export interface AudioData {
  blob: Blob;
  url: string;
  duration: number;
  waveform: number[];
}

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isPlayingBack: boolean;
  recordedAudio: AudioData | null;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  playback: () => Promise<void>;
  stopPlayback: () => void;
  clearRecording: () => void;
  waveformData: number[];
}

const SAMPLE_RATE = 16000;

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<AudioData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordedAudioUrlRef = useRef<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Calculate waveform data
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Generate waveform visualization
        const rawData = audioBuffer.getChannelData(0);
        const samples = Math.floor(rawData.length / 100);
        const waveform: number[] = [];

        for (let i = 0; i < 100; i++) {
          let sum = 0;
          for (let j = 0; j < samples; j++) {
            sum += Math.abs(rawData[i * samples + j]);
          }
          waveform.push(sum / samples);
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        recordedAudioUrlRef.current = audioUrl;
        setRecordedAudio({
          blob: audioBlob,
          url: audioUrl,
          duration: audioBuffer.duration,
          waveform,
        });
        setWaveformData(waveform);

        audioContextRef.current = audioContext;
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to start recording");
      setError(error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      // Stop all tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      setIsRecording(false);
    }
  }, [isRecording]);

  const playback = useCallback(async () => {
    if (!recordedAudio) return;

    try {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(recordedAudio.url);
      }

      if (isPlayingBack) {
        audioElementRef.current.pause();
        setIsPlayingBack(false);
      } else {
        setIsPlayingBack(true);
        await audioElementRef.current.play();

        audioElementRef.current.onended = () => {
          setIsPlayingBack(false);
        };
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to play audio");
      setError(error);
    }
  }, [recordedAudio, isPlayingBack]);

  const stopPlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setIsPlayingBack(false);
  }, []);

  const clearRecording = useCallback(() => {
    stopPlayback();
    if (recordedAudioUrlRef.current) {
      URL.revokeObjectURL(recordedAudioUrlRef.current);
      recordedAudioUrlRef.current = null;
    }
    setRecordedAudio(null);
    setWaveformData([]);
  }, [stopPlayback]);

  // Cleanup on unmount - intentionally only runs on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Already stopped
        }
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (recordedAudioUrlRef.current) {
        URL.revokeObjectURL(recordedAudioUrlRef.current);
      }
      // Safe to read animationFrameRef.current here since we assign to local var
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const frameRef = animationFrameRef.current;
      if (frameRef) {
        cancelAnimationFrame(frameRef);
      }
    };
  }, []);

  return {
    isRecording,
    isPlayingBack,
    recordedAudio,
    error,
    startRecording,
    stopRecording,
    playback,
    stopPlayback,
    clearRecording,
    waveformData,
  };
};
