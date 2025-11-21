export enum AppSection {
  Intro = 'INTRO',
  Architecture = 'ARCH',
  Simulation = 'SIM',
  Chat = 'CHAT'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GridCell {
  x: number;
  y: number;
  type: 'empty' | 'wall' | 'goal' | 'pit' | 'agent';
  qValues: number[]; // [Up, Right, Down, Left]
}

export interface Experience {
  id: string;
  state: { x: number, y: number };
  action: string;
  reward: number;
  nextState: { x: number, y: number };
}

export interface SimulationState {
  grid: GridCell[][];
  agentPos: { x: number, y: number };
  score: number;
  episode: number;
  epsilon: number; // Exploration rate
  isAutoEpsilon: boolean; // Whether epsilon decays automatically
  isTraining: boolean;
  replayBuffer: Experience[];
}
