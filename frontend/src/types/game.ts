export type MindlingType = 'pip' | 'mira' | 'vee' | 'nuo';

export interface Mindling {
  type: MindlingType;
  name: string;
  displayName: string;
  color: string;
  trait: string;
  emoji: string;
}

export const MINDLINGS: Record<MindlingType, Omit<Mindling, 'name'>> = {
  pip: {
    type: 'pip',
    displayName: 'Pip',
    color: 'mindling-pip',
    trait: 'Curiosity',
    emoji: '🐛',
  },
  mira: {
    type: 'mira',
    displayName: 'Mira',
    color: 'mindling-mira',
    trait: 'Calm',
    emoji: '🌱',
  },
  vee: {
    type: 'vee',
    displayName: 'Vee',
    color: 'mindling-vee',
    trait: 'Energy',
    emoji: '⚡',
  },
  nuo: {
    type: 'nuo',
    displayName: 'Nuo',
    color: 'mindling-nuo',
    trait: 'Memory',
    emoji: '🧠',
  },
};

export type GameScreen = 
  | 'title'
  | 'story-intro'
  | 'character-select'
  | 'world-map'
  | 'level-intro'
  | 'cloudport'
  | 'star-bridge'
  | 'hidden-reef'
  | 'echo-bay'
  | 'heart-isle'
  | 'report';

export type IslandType = 'cloudport' | 'star-bridge' | 'hidden-reef' | 'echo-bay' | 'heart-isle';

export interface Island {
  id: IslandType;
  name: string;
  description: string;
  seedType: 'spark' | 'logic' | 'harmony' | null;
  seedColor: string;
}

export const ISLANDS: Island[] = [
  {
    id: 'cloudport',
    name: 'Cloudport Isle',
    description: 'Catch the Fireflies to wake up the Mindling! Speed is key.',
    seedType: 'spark',
    seedColor: 'seed-spark',
  },
  {
    id: 'star-bridge',
    name: 'Star Bridge',
    description: 'Connect the stars: Number to Letter. 1 → A → 2 → B!',
    seedType: 'logic',
    seedColor: 'seed-logic',
  },
  {
    id: 'hidden-reef',
    name: 'Hidden Reef',
    description: 'Pop the bubbles and find matching pairs! Test your memory.',
    seedType: null,
    seedColor: '',
  },
  {
    id: 'echo-bay',
    name: 'Echo Bay',
    description: 'Listen to the crystals. Repeat their song!',
    seedType: 'harmony',
    seedColor: 'seed-harmony',
  },
  {
    id: 'heart-isle',
    name: 'Heart Isle',
    description: 'Plant the seeds and watch your Mindling grow!',
    seedType: null,
    seedColor: '',
  },
];

export interface GameStats {
  cloudport: {
    totalTime: number;
    avgReactionTime: number;
    catches: number;
    misses: number;
  } | null;
  starBridge: {
    totalTime: number;
    errors: number;
    completed: boolean;
  } | null;
  hiddenReef: {
    totalMoves: number;
    totalPairs: number;
    efficiency: number;
    roundsCompleted: number;
  } | null;
  echoBay: {
    maxSequence: number;
    totalRounds: number;
    perfectRounds: number;
  } | null;
}

export interface GameState {
  screen: GameScreen;
  selectedMindling: Mindling | null;
  mindlingName: string;
  seeds: {
    spark: boolean;
    logic: boolean;
    harmony: boolean;
  };
  unlockedIslands: IslandType[];
  currentIsland: IslandType | null;
  stats: GameStats;
  isEvolved: boolean;
  settings: {
    musicEnabled: boolean;
    sfxEnabled: boolean;
  };
}

export const initialGameState: GameState = {
  screen: 'title',
  selectedMindling: null,
  mindlingName: '',
  seeds: {
    spark: false,
    logic: false,
    harmony: false,
  },
  unlockedIslands: ['cloudport'],
  currentIsland: null,
  stats: {
    cloudport: null,
    starBridge: null,
    hiddenReef: null,
    echoBay: null,
  },
  isEvolved: false,
  settings: {
    musicEnabled: true,
    sfxEnabled: true,
  },
};
