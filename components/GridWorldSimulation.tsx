import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GRID_SIZE, ACTIONS } from '../constants';
import { GridCell, SimulationState, Experience } from '../types';

// Helper to create initial grid
const createGrid = (size: number): GridCell[][] => {
  const grid: GridCell[][] = [];
  for (let y = 0; y < size; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < size; x++) {
      let type: GridCell['type'] = 'empty';
      // Hardcoded map for simplicity
      if (x === 4 && y === 4) type = 'goal';
      else if ((x === 2 && y === 2) || (x === 2 && y === 3) || (x === 3 && y === 1)) type = 'wall';
      else if (x === 1 && y === 3) type = 'pit';
      
      row.push({ x, y, type, qValues: [0, 0, 0, 0] });
    }
    grid.push(row);
  }
  return grid;
};

const GridWorldSimulation: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>({
    grid: createGrid(GRID_SIZE),
    agentPos: { x: 0, y: 0 },
    score: 0,
    episode: 1,
    epsilon: 1.0, // 100% exploration initially
    isAutoEpsilon: true,
    isTraining: false,
    replayBuffer: [],
  });

  const [showGuide, setShowGuide] = useState(true);
  // Speed state: 0 (slowest) to 100 (fastest)
  const [speed, setSpeed] = useState(90);

  // Use ref for simulation interval and state to access latest state without stale closures
  const stateRef = useRef(simState);
  useEffect(() => { stateRef.current = simState; }, [simState]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimState(prev => ({
      grid: createGrid(GRID_SIZE),
      agentPos: { x: 0, y: 0 },
      score: 0,
      episode: 1,
      epsilon: 1.0,
      isAutoEpsilon: prev.isAutoEpsilon,
      isTraining: false,
      replayBuffer: [],
    }));
  };

  const step = useCallback(() => {
    const current = stateRef.current;
    if (!current.isTraining) return;

    let { agentPos, epsilon, episode, grid, isAutoEpsilon, replayBuffer } = current;
    let { x, y } = agentPos;
    const currentCell = grid[y][x];

    // --- 1. Choose Action (Epsilon-Greedy) ---
    // 0: Up, 1: Right, 2: Down, 3: Left
    let actionIndex = 0;
    
    if (Math.random() < epsilon) {
      // Explore: Random action
      actionIndex = Math.floor(Math.random() * 4);
    } else {
      // Exploit: Choose action with max Q-value
      // Add some tiny random noise to break ties
      let maxQ = -Infinity;
      let bestActions: number[] = [];
      currentCell.qValues.forEach((q, idx) => {
          if (q > maxQ) {
              maxQ = q;
              bestActions = [idx];
          } else if (q === maxQ) {
              bestActions.push(idx);
          }
      });
      actionIndex = bestActions[Math.floor(Math.random() * bestActions.length)];
    }

    // --- 2. Execute Action ---
    let nextX = x;
    let nextY = y;

    if (actionIndex === 0) nextY--; // Up
    if (actionIndex === 1) nextX++; // Right
    if (actionIndex === 2) nextY++; // Down
    if (actionIndex === 3) nextX--; // Left

    // Check Boundary & Walls
    let hitWall = false;
    if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE || grid[nextY][nextX].type === 'wall') {
      hitWall = true;
      nextX = x; // Stay put
      nextY = y;
    }

    const nextCell = grid[nextY][nextX];
    let reward = -0.1; // Living penalty
    let done = false;

    if (nextCell.type === 'goal') {
      reward = 10;
      done = true;
    } else if (nextCell.type === 'pit') {
      reward = -10;
      done = true;
    }

    // --- 3. Update Q-Values (Tabular Q-Learning) ---
    // Formula: Q(s,a) = Q(s,a) + alpha * [reward + gamma * max(Q(s',a')) - Q(s,a)]
    const alpha = 0.2; // Learning rate
    const gamma = 0.9; // Discount factor
    
    const maxNextQ = Math.max(...nextCell.qValues);
    const oldQ = currentCell.qValues[actionIndex];
    const newQ = oldQ + alpha * (reward + gamma * maxNextQ - oldQ);

    // Create a deep copy of grid to update state
    const newGrid = grid.map(row => row.map(cell => ({ ...cell, qValues: [...cell.qValues] })));
    newGrid[y][x].qValues[actionIndex] = newQ;

    // --- 4. Record Experience ---
    const newExperience: Experience = {
        id: Date.now().toString() + Math.random(),
        state: { x, y },
        action: ACTIONS[actionIndex],
        reward: reward,
        nextState: { x: nextX, y: nextY }
    };
    const newReplayBuffer = [newExperience, ...replayBuffer].slice(0, 8); // Keep last 8

    // --- 5. Update State ---
    let nextEpsilon = epsilon;
    let nextEpisode = episode;

    if (done) {
      nextX = 0; // Reset agent pos to start
      nextY = 0;
      nextEpisode += 1;
      
      if (isAutoEpsilon) {
        nextEpsilon = Math.max(0.01, epsilon * 0.98);
      }
    }

    setSimState(prev => ({
      ...prev,
      grid: newGrid,
      agentPos: { x: nextX, y: nextY },
      score: done ? 0 : prev.score + reward,
      episode: nextEpisode,
      epsilon: nextEpsilon,
      replayBuffer: newReplayBuffer
    }));

  }, []);

  const toggleTraining = () => {
    setSimState(prev => ({ ...prev, isTraining: !prev.isTraining }));
  };

  const handleEpsilonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    setSimState(prev => ({ ...prev, epsilon: newVal }));
  };

  const setEpsilonMode = (isAuto: boolean) => {
    setSimState(prev => ({ ...prev, isAutoEpsilon: isAuto }));
  };

  // Calculate delay based on speed (0-100)
  // Speed 0 -> 1000ms delay
  // Speed 100 -> 20ms delay
  const stepDelay = Math.max(20, 1000 - (speed * 9.8));

  useEffect(() => {
    if (simState.isTraining) {
      // Clear existing interval to apply new speed immediately
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(step, stepDelay); 
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simState.isTraining, step, stepDelay]); // Re-run when speed changes

  // Helper to normalize Q-value for opacity (assuming range roughly -10 to 10)
  const getOpacity = (q: number) => {
      const min = -2;
      const max = 10;
      const val = (q - min) / (max - min);
      return Math.max(0.05, Math.min(0.9, val)); // Clamp between 0.05 and 0.9
  };

  const getColor = (q: number) => {
      if (q > 0) return `rgba(34, 197, 94, ${getOpacity(q)})`; // Green
      return `rgba(239, 68, 68, ${getOpacity(Math.abs(q))})`; // Red for negative
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Controls & Stats */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">控制台</h2>
                <p className="text-slate-400 text-sm mb-6">
                    随着训练进行，观察网格中的 Q 值（颜色三角形）如何变化，以及记忆库如何更新。
                </p>
                
                <div className="space-y-5 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Episode:</span>
                        <span className="text-white font-mono">{simState.episode}</span>
                    </div>

                    {/* Speed Control */}
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300">训练速度 (Speed):</span>
                            <span className="text-blue-400 font-mono font-bold">
                                {speed < 20 ? 'Slow' : speed > 80 ? 'Fast' : 'Normal'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg" title="慢速">🐢</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={speed}
                                onChange={(e) => setSpeed(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-lg" title="快速">🐇</span>
                        </div>
                    </div>

                    {/* Epsilon Control */}
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Epsilon (探索率):</span>
                          <span className="text-blue-400 font-mono font-bold">{simState.epsilon.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex bg-slate-700 rounded-md p-1 mb-3">
                        <button 
                          onClick={() => setEpsilonMode(true)}
                          className={`flex-1 text-xs py-1 rounded transition-all ${simState.isAutoEpsilon ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          自动衰减
                        </button>
                        <button 
                          onClick={() => setEpsilonMode(false)}
                          className={`flex-1 text-xs py-1 rounded transition-all ${!simState.isAutoEpsilon ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          固定值
                        </button>
                      </div>

                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={simState.epsilon}
                        onChange={handleEpsilonChange}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Current Reward:</span>
                        <span className={`font-mono ${simState.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {simState.score.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={toggleTraining}
                        className={`flex-1 py-2 rounded font-bold transition-colors ${
                            simState.isTraining 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {simState.isTraining ? '暂停' : '开始训练'}
                    </button>
                    <button
                        onClick={resetSimulation}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded font-bold"
                    >
                        重置
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <h3 className="font-bold text-white mb-2 text-sm">图例</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded mr-2"></div> Agent</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-2"></div> Goal (+10)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-2"></div> Pit (-10)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-500/50 mr-2" style={{clipPath: 'polygon(50% 50%, 0 0, 100% 0)'}}></div> High Q</div>
                </div>
            </div>
        </div>

        {/* Right Panel: Grid Visualization */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
            
            {/* User Guide Banner */}
            {showGuide && (
                <div className="bg-gradient-to-r from-blue-900/40 to-slate-900/40 border border-blue-500/30 p-5 rounded-xl relative shadow-lg backdrop-blur-sm animate-fade-in">
                    <button 
                      onClick={() => setShowGuide(false)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
                      title="关闭引导"
                    >
                      ✕
                    </button>
                    <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
                        <span className="text-2xl mr-2">🎓</span> 可视化指南：如何观察训练？
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                        <div className="flex items-start space-x-2">
                            <div className="mt-1 min-w-[20px] text-center">🔺</div>
                            <div>
                                <strong className="text-green-400 block mb-1">Q 值热力图 (三角形)</strong>
                                格子内的四个三角形代表四个方向的 Q 值。
                                <ul className="list-disc list-inside mt-1 text-slate-400 text-xs pl-1">
                                    <li>颜色越深/亮 = 预期奖励越高</li>
                                    <li>观察 <span className="text-green-400">绿色</span> 如何从终点(★)向起点反向传播</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <div className="mt-1 min-w-[20px] text-center">💾</div>
                            <div>
                                <strong className="text-purple-400 block mb-1">经验回放池 (下方列表)</strong>
                                这是智能体的“短期记忆”。
                                <p className="mt-1 text-slate-400 text-xs">
                                    它记录每一步的 <code>(State, Action, Reward, Next)</code>。DQN 从这里随机抽样进行学习。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* The Grid */}
            <div className="flex items-center justify-center bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner min-h-[400px]">
                <div 
                    className="grid gap-1 bg-slate-700 p-2 rounded shadow-2xl"
                    style={{ 
                        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                        width: '100%',
                        maxWidth: '450px',
                        aspectRatio: '1/1'
                    }}
                >
                    {simState.grid.map((row, y) => (
                        row.map((cell, x) => {
                            let bgClass = 'bg-slate-800';
                            if (cell.type === 'wall') bgClass = 'bg-slate-600';
                            else if (cell.type === 'goal') bgClass = 'bg-slate-800 border-2 border-green-500';
                            else if (cell.type === 'pit') bgClass = 'bg-slate-800 border-2 border-red-500';

                            const isAgent = simState.agentPos.x === x && simState.agentPos.y === y;

                            return (
                                <div 
                                    key={`${x}-${y}`} 
                                    className={`relative rounded overflow-hidden flex items-center justify-center ${bgClass}`}
                                >
                                    {/* Q-Value Triangles Overlay */}
                                    {cell.type === 'empty' && (
                                        <>
                                          {/* UP (0) */}
                                          <div className="absolute inset-0 transition-colors duration-300" 
                                               style={{ backgroundColor: getColor(cell.qValues[0]), clipPath: 'polygon(0 0, 100% 0, 50% 50%)' }}></div>
                                          {/* RIGHT (1) */}
                                          <div className="absolute inset-0 transition-colors duration-300" 
                                               style={{ backgroundColor: getColor(cell.qValues[1]), clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)' }}></div>
                                          {/* DOWN (2) */}
                                          <div className="absolute inset-0 transition-colors duration-300" 
                                               style={{ backgroundColor: getColor(cell.qValues[2]), clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)' }}></div>
                                          {/* LEFT (3) */}
                                          <div className="absolute inset-0 transition-colors duration-300" 
                                               style={{ backgroundColor: getColor(cell.qValues[3]), clipPath: 'polygon(0 0, 0 100%, 50% 50%)' }}></div>
                                        </>
                                    )}

                                    {/* Object Icons */}
                                    <div className="relative z-10 pointer-events-none">
                                        {cell.type === 'goal' && <span className="text-green-400 text-2xl drop-shadow-md">★</span>}
                                        {cell.type === 'pit' && <span className="text-red-400 text-2xl drop-shadow-md">⚠</span>}
                                    </div>
                                    
                                    {/* Agent */}
                                    {isAgent && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                                            <div className="w-3/4 h-3/4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] border-2 border-white flex items-center justify-center text-white font-bold text-[10px]">
                                                DQN
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Experience Replay Buffer */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-64">
                <div className="p-3 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        经验回放池 (Replay Buffer)
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">Size: {simState.replayBuffer.length}/1000</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-950/50">
                    {simState.replayBuffer.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                            暂无训练数据... 点击“开始训练”以收集经验。
                        </div>
                    ) : (
                        simState.replayBuffer.map((exp) => (
                            <div key={exp.id} className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700 text-xs animate-fade-in-up">
                                <div className="flex items-center space-x-3">
                                    <div className="flex flex-col items-center w-12">
                                        <span className="text-slate-500 text-[10px]">STATE</span>
                                        <span className="text-slate-200 font-mono">({exp.state.x},{exp.state.y})</span>
                                    </div>
                                    <div className="text-slate-600">→</div>
                                    <div className="flex flex-col items-center w-10">
                                        <span className="text-slate-500 text-[10px]">ACTION</span>
                                        <span className="text-blue-400 font-bold">{exp.action}</span>
                                    </div>
                                    <div className="text-slate-600">→</div>
                                    <div className="flex flex-col items-center w-12">
                                        <span className="text-slate-500 text-[10px]">REWARD</span>
                                        <span className={`font-mono font-bold ${exp.reward > 0 ? 'text-green-400' : exp.reward < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                            {exp.reward}
                                        </span>
                                    </div>
                                    <div className="text-slate-600">→</div>
                                    <div className="flex flex-col items-center w-12">
                                        <span className="text-slate-500 text-[10px]">NEXT</span>
                                        <span className="text-slate-200 font-mono">({exp.nextState.x},{exp.nextState.y})</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default GridWorldSimulation;