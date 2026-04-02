import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameScreen, Mindling, IslandType, initialGameState, GameStats } from '@/types/game';

type GameAction =
  | { type: 'SET_SCREEN'; screen: GameScreen }
  | { type: 'SELECT_MINDLING'; mindling: Mindling }
  | { type: 'SET_MINDLING_NAME'; name: string }
  | { type: 'COLLECT_SEED'; seedType: 'spark' | 'logic' | 'harmony' }
  | { type: 'UNLOCK_ISLAND'; island: IslandType }
  | { type: 'SET_CURRENT_ISLAND'; island: IslandType | null }
  | { type: 'UPDATE_STATS'; statsType: keyof GameStats; stats: GameStats[keyof GameStats] }
  | { type: 'EVOLVE_MINDLING' }
  | { type: 'RESET_GAME' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'TOGGLE_SFX' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SELECT_MINDLING':
      return { ...state, selectedMindling: action.mindling };
    case 'SET_MINDLING_NAME':
      return { ...state, mindlingName: action.name };
    case 'COLLECT_SEED':
      const newSeeds = { ...state.seeds, [action.seedType]: true };
      const newUnlockedIslands = [...state.unlockedIslands];
      
      // Unlock next island based on seed collected
      if (action.seedType === 'spark' && !newUnlockedIslands.includes('star-bridge')) {
        newUnlockedIslands.push('star-bridge');
      }
      if (action.seedType === 'logic' && !newUnlockedIslands.includes('hidden-reef')) {
        newUnlockedIslands.push('hidden-reef');
      }
      if (action.seedType === 'harmony' && !newUnlockedIslands.includes('heart-isle')) {
        newUnlockedIslands.push('heart-isle');
      }
      
      return { ...state, seeds: newSeeds, unlockedIslands: newUnlockedIslands };
    case 'UNLOCK_ISLAND':
      if (state.unlockedIslands.includes(action.island)) return state;
      return { ...state, unlockedIslands: [...state.unlockedIslands, action.island] };
    case 'SET_CURRENT_ISLAND':
      return { ...state, currentIsland: action.island };
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, [action.statsType]: action.stats } };
    case 'EVOLVE_MINDLING':
      return { ...state, isEvolved: true };
    case 'RESET_GAME':
      return initialGameState;
    case 'TOGGLE_MUSIC':
      return { ...state, settings: { ...state.settings, musicEnabled: !state.settings.musicEnabled } };
    case 'TOGGLE_SFX':
      return { ...state, settings: { ...state.settings, sfxEnabled: !state.settings.sfxEnabled } };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  seedCount: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  
  const seedCount = Object.values(state.seeds).filter(Boolean).length;

  return (
    <GameContext.Provider value={{ state, dispatch, seedCount }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
