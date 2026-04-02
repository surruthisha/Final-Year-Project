import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { GameProvider, useGame } from './GameContext';
import { initialGameState, MINDLINGS } from '@/types/game';

const wrapper = ({ children }: { children: ReactNode }) => (
  <GameProvider>{children}</GameProvider>
);

describe('GameContext reducer', () => {
  it('initialises with the correct default state', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    expect(result.current.state).toEqual(initialGameState);
    expect(result.current.seedCount).toBe(0);
  });

  it('SET_SCREEN updates the screen', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'SET_SCREEN', screen: 'world-map' }); });
    expect(result.current.state.screen).toBe('world-map');
  });

  it('SELECT_MINDLING sets the selected mindling', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    const mindling = { ...MINDLINGS.pip, name: 'Bubbles' };
    act(() => { result.current.dispatch({ type: 'SELECT_MINDLING', mindling }); });
    expect(result.current.state.selectedMindling).toEqual(mindling);
  });

  it('SET_MINDLING_NAME sets the mindling name', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'SET_MINDLING_NAME', name: 'Sparky' }); });
    expect(result.current.state.mindlingName).toBe('Sparky');
  });

  it('COLLECT_SEED (spark) marks spark true and unlocks star-bridge', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'COLLECT_SEED', seedType: 'spark' }); });
    expect(result.current.state.seeds.spark).toBe(true);
    expect(result.current.state.unlockedIslands).toContain('star-bridge');
    expect(result.current.seedCount).toBe(1);
  });

  it('COLLECT_SEED (logic) marks logic true and unlocks hidden-reef', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'COLLECT_SEED', seedType: 'logic' }); });
    expect(result.current.state.seeds.logic).toBe(true);
    expect(result.current.state.unlockedIslands).toContain('hidden-reef');
  });

  it('COLLECT_SEED (harmony) marks harmony true and unlocks heart-isle', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'COLLECT_SEED', seedType: 'harmony' }); });
    expect(result.current.state.seeds.harmony).toBe(true);
    expect(result.current.state.unlockedIslands).toContain('heart-isle');
  });

  it('seedCount reflects all three collected seeds', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'COLLECT_SEED', seedType: 'spark' });
      result.current.dispatch({ type: 'COLLECT_SEED', seedType: 'logic' });
      result.current.dispatch({ type: 'COLLECT_SEED', seedType: 'harmony' });
    });
    expect(result.current.seedCount).toBe(3);
  });

  it('UNLOCK_ISLAND does not duplicate islands', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'UNLOCK_ISLAND', island: 'cloudport' });
      result.current.dispatch({ type: 'UNLOCK_ISLAND', island: 'cloudport' });
    });
    const cloudportCount = result.current.state.unlockedIslands.filter(i => i === 'cloudport').length;
    expect(cloudportCount).toBe(1);
  });

  it('UNLOCK_ISLAND adds a new island', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'UNLOCK_ISLAND', island: 'echo-bay' }); });
    expect(result.current.state.unlockedIslands).toContain('echo-bay');
  });

  it('SET_CURRENT_ISLAND sets currentIsland', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'SET_CURRENT_ISLAND', island: 'cloudport' }); });
    expect(result.current.state.currentIsland).toBe('cloudport');
  });

  it('UPDATE_STATS stores cloudport stats', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    const stats = { totalTime: 30, avgReactionTime: 350, catches: 8, misses: 2 };
    act(() => {
      result.current.dispatch({ type: 'UPDATE_STATS', statsType: 'cloudport', stats });
    });
    expect(result.current.state.stats.cloudport).toEqual(stats);
  });

  it('EVOLVE_MINDLING sets isEvolved to true', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'EVOLVE_MINDLING' }); });
    expect(result.current.state.isEvolved).toBe(true);
  });

  it('RESET_GAME restores initial state', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_SCREEN', screen: 'world-map' });
      result.current.dispatch({ type: 'COLLECT_SEED', seedType: 'spark' });
    });
    act(() => { result.current.dispatch({ type: 'RESET_GAME' }); });
    expect(result.current.state).toEqual(initialGameState);
  });

  it('TOGGLE_MUSIC flips musicEnabled', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    expect(result.current.state.settings.musicEnabled).toBe(true);
    act(() => { result.current.dispatch({ type: 'TOGGLE_MUSIC' }); });
    expect(result.current.state.settings.musicEnabled).toBe(false);
    act(() => { result.current.dispatch({ type: 'TOGGLE_MUSIC' }); });
    expect(result.current.state.settings.musicEnabled).toBe(true);
  });

  it('TOGGLE_SFX flips sfxEnabled', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    expect(result.current.state.settings.sfxEnabled).toBe(true);
    act(() => { result.current.dispatch({ type: 'TOGGLE_SFX' }); });
    expect(result.current.state.settings.sfxEnabled).toBe(false);
    act(() => { result.current.dispatch({ type: 'TOGGLE_SFX' }); });
    expect(result.current.state.settings.sfxEnabled).toBe(true);
  });

  it('TOGGLE_MUSIC does not affect sfxEnabled', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.dispatch({ type: 'TOGGLE_MUSIC' }); });
    expect(result.current.state.settings.sfxEnabled).toBe(true);
  });

  it('useGame throws outside GameProvider', () => {
    expect(() => renderHook(() => useGame())).toThrow(
      'useGame must be used within a GameProvider'
    );
  });
});
