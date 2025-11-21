export const GEMINI_MODEL = 'gemini-2.5-flash';

export const GRID_SIZE = 6;
export const ACTIONS = ['↑', '→', '↓', '←']; // Up, Right, Down, Left

// Simplified descriptions for educational purposes
export const DQN_CONCEPTS = [
  {
    title: "Q-Learning 基础",
    content: "Q-Learning 是一种基于值的强化学习算法。它维护一个 Q 表 (Q-Table)，记录了在特定状态 (State) 下采取特定动作 (Action) 能获得的预期累积奖励 (Value)。公式：Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]"
  },
  {
    title: "从 Q-Table 到神经网络",
    content: "当状态空间非常大（例如视频游戏的像素输入）时，维护一个巨大的 Q 表是不现实的。DQN 使用深度神经网络 (Deep Neural Network) 来近似 Q 函数。输入是状态，输出是每个可能动作的 Q 值。"
  },
  {
    title: "经验回放 (Experience Replay)",
    content: "DQN 将智能体的经历 (State, Action, Reward, Next State) 存储在一个回放缓冲区中。训练时，随机抽取一小批样本进行学习。这打破了数据之间的时间相关性，使训练更稳定。"
  },
  {
    title: "目标网络 (Target Network)",
    content: "为了防止计算目标值时参数不断变化导致的不稳定，DQN 使用两个网络：主网络用来选择动作，目标网络用来计算目标 Q 值。目标网络的参数会定期从主网络复制过来。"
  }
];