import { useState, useEffect, useRef, useCallback } from 'react';

// Pentatonic scale for soothing child-friendly melody (C major pentatonic across octaves)
const MELODY_NOTES = [
  261.63, 293.66, 329.63, 392.00, 440.00, // C4-A4
  523.25, 587.33, 659.25, 783.99,          // C5-G5
];

const BASS_NOTES = [130.81, 146.83, 164.81, 196.00, 220.00]; // C3-A3

// Pre-composed melody fragments for more musical feel
const MELODY_PATTERNS = [
  [0, 2, 4, 2],    // C E G E
  [1, 3, 5, 3],    // D G C5 G
  [2, 4, 6, 4],    // E G D5 G
  [0, 4, 3, 2],    // C G F E
  [4, 3, 2, 0],    // G F E C
  [5, 4, 2, 0],    // C5 G E C
];

export function useBackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const melodyIntervalRef = useRef<number | null>(null);
  const chordIntervalRef = useRef<number | null>(null);
  const patternIndexRef = useRef(0);
  const noteIndexRef = useRef(0);

  const playMelodyNote = useCallback((ctx: AudioContext, gain: GainNode, freq: number) => {
    // Main tone - soft sine with gentle attack
    const osc1 = ctx.createOscillator();
    const osc1Gain = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);
    osc1Gain.gain.setValueAtTime(0, ctx.currentTime);
    osc1Gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.2);
    osc1Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
    osc1.connect(osc1Gain);
    osc1Gain.connect(gain);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 2.5);

    // Shimmer overtone - triangle
    const osc2 = ctx.createOscillator();
    const osc2Gain = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
    osc2Gain.gain.setValueAtTime(0, ctx.currentTime);
    osc2Gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.15);
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gain);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 1.8);

    // Warm sub-octave for depth
    const osc3 = ctx.createOscillator();
    const osc3Gain = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq / 2, ctx.currentTime);
    osc3Gain.gain.setValueAtTime(0, ctx.currentTime);
    osc3Gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.25);
    osc3Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    osc3.connect(osc3Gain);
    osc3Gain.connect(gain);
    osc3.start(ctx.currentTime);
    osc3.stop(ctx.currentTime + 2.2);
  }, []);

  const playPad = useCallback((ctx: AudioContext, gain: GainNode) => {
    // Soft ambient pad chord
    const chordFreqs = [
      BASS_NOTES[0], // C3
      BASS_NOTES[2], // E3
      BASS_NOTES[4], // A3
    ];

    chordFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
      oscGain.gain.setValueAtTime(0.04, ctx.currentTime + 4);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 8);
    });
  }, []);

  const start = useCallback(() => {
    if (audioContextRef.current) return;

    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.6, ctx.currentTime);
    masterGain.connect(ctx.destination);

    audioContextRef.current = ctx;
    masterGainRef.current = masterGain;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Play initial pad
    playPad(ctx, masterGain);

    // Melody loop - play pattern notes
    patternIndexRef.current = 0;
    noteIndexRef.current = 0;

    melodyIntervalRef.current = window.setInterval(() => {
      if (ctx.state === 'closed') return;

      const pattern = MELODY_PATTERNS[patternIndexRef.current];
      const noteIdx = pattern[noteIndexRef.current];
      const freq = MELODY_NOTES[noteIdx];

      playMelodyNote(ctx, masterGain, freq);

      noteIndexRef.current++;
      if (noteIndexRef.current >= pattern.length) {
        noteIndexRef.current = 0;
        patternIndexRef.current = (patternIndexRef.current + 1) % MELODY_PATTERNS.length;
      }
    }, 700);

    // Pad chord loop
    chordIntervalRef.current = window.setInterval(() => {
      if (ctx.state === 'closed') return;
      playPad(ctx, masterGain);
    }, 8000);

    setIsPlaying(true);
  }, [playMelodyNote, playPad]);

  const stop = useCallback(() => {
    if (melodyIntervalRef.current) {
      clearInterval(melodyIntervalRef.current);
      melodyIntervalRef.current = null;
    }
    if (chordIntervalRef.current) {
      clearInterval(chordIntervalRef.current);
      chordIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    masterGainRef.current = null;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { isPlaying, toggle, start, stop };
}
