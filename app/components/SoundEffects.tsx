'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

/**
 * Sound effects context type
 */
interface SoundEffectsContextType {
  enabled: boolean;
  toggle: () => void;
  play: (sound: 'favorite' | 'unfavorite' | 'click' | 'success' | 'error') => void;
}

/**
 * Sound effects context
 */
const SoundEffectsContext = createContext<SoundEffectsContextType | undefined>(undefined);

/**
 * Sound effects provider props
 */
interface SoundEffectsProviderProps {
  children: ReactNode;
}

/**
 * Sound Effects Provider
 * 
 * Manages sound effects for user interactions.
 * Sounds are optional and can be toggled on/off.
 */
export function SoundEffectsProvider({ children }: SoundEffectsProviderProps) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundEffectsEnabled');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  // Save preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEffectsEnabled', String(enabled));
    }
  }, [enabled]);

  /**
   * Toggle sound effects on/off
   */
  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  /**
   * Play a sound effect
   * Uses Web Audio API for lightweight, programmatic sounds
   */
  const play = useCallback((sound: 'favorite' | 'unfavorite' | 'click' | 'success' | 'error') => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Sound configurations
      const sounds: Record<string, { frequency: number; duration: number; type: OscillatorType }> = {
        favorite: { frequency: 523.25, duration: 150, type: 'sine' }, // C5
        unfavorite: { frequency: 392.00, duration: 100, type: 'sine' }, // G4
        click: { frequency: 800, duration: 50, type: 'square' },
        success: { frequency: 659.25, duration: 200, type: 'sine' }, // E5
        error: { frequency: 220, duration: 200, type: 'sawtooth' }, // A3
      };

      const config = sounds[sound];
      if (!config) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = config.frequency;
      oscillator.type = config.type;

      // Fade out for smooth sound
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration / 1000);
    } catch {
      // Silently fail if audio context is not available
      // (e.g., user hasn't interacted with page yet)
    }
  }, [enabled]);

  return (
    <SoundEffectsContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundEffectsContext.Provider>
  );
}

/**
 * Hook to use sound effects
 */
export function useSoundEffects(): SoundEffectsContextType {
  const context = useContext(SoundEffectsContext);
  if (context === undefined) {
    // Return no-op if not within provider
    return {
      enabled: false,
      toggle: () => {},
      play: () => {},
    };
  }
  return context;
}

