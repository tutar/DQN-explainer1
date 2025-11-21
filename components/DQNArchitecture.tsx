import React, { useState } from 'react';

const DQNArchitecture: React.FC = () => {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const stages = [
    {
      id: 'input',
      title: "State (Input)",
      subtitle: "Input Frame",
      description: "游戏画面或环境状态被转化为数字矩阵。在 DQN 中，这通常是预处理后的 84x84 像素灰度图像。",
      visual: "grid"
    },
    {
      id: 'conv',
      title: "Convolution",
      subtitle: "Feature Extraction",
      description: "卷积层 (Conv Layers) 扫描图像，提取边缘、形状和物体位置等特征。不需要人工设计特征，网络会自动学习。",
      visual: "layers"
    },
    {
      id: 'fc',
      title: "Fully Connected",
      subtitle: "Reasoning",
      description: "全连接层 (FC Layers) 整合提取到的特征，理解当前局势。例如：“如果前方有障碍且右边有奖励...”",
      visual: "dense"
    },
    {
      id: 'output',
      title: "Q-Values (Output)",
      subtitle: "Action Scores",
      description: "输出层为每个可能的动作给出一个 Q 值评分。Q 值越高，代表采取该动作后的预期总奖励越高。",
      visual: "bars"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
       <h2 className="text-3xl font-bold text-white mb-4 text-center">DQN 神经网络透视图</h2>
       <p className="text-center text-slate-400 mb-10">
         DQN 将像素直接映射为动作价值。点击下方不同阶段查看详情。
       </p>
       
       <div className="bg-slate-900 p-6 lg:p-10 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative">
          
          {/* Main Visual Pipeline */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 relative z-10">
            
            {/* 1. Input Stage */}
            <div 
              className={`relative group cursor-pointer p-4 rounded-xl transition-all duration-300 ${activeStage === 'input' ? 'bg-slate-800 ring-2 ring-purple-500' : 'hover:bg-slate-800/50'}`}
              onClick={() => setActiveStage('input')}
            >
               <div className="text-center mb-3 text-purple-400 font-bold text-sm">STATE (S)</div>
               <div className="w-24 h-24 bg-slate-800 border-2 border-purple-500/50 grid grid-cols-4 gap-0.5 p-0.5 rounded relative overflow-hidden">
                   {/* Pixel Grid Animation */}
                   {Array.from({length: 16}).map((_, i) => (
                       <div key={i} className="bg-purple-500/20" style={{ opacity: Math.random() * 0.8 + 0.2 }}></div>
                   ))}
                   <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50"></div>
               </div>
               <div className="mt-2 text-center text-xs text-slate-500 font-mono">[84, 84, 4]</div>
            </div>

            {/* Arrow */}
            <div className="text-slate-600 text-2xl transform rotate-90 lg:rotate-0">➜</div>

            {/* 2. Conv Stage */}
            <div 
              className={`relative group cursor-pointer p-4 rounded-xl transition-all duration-300 ${activeStage === 'conv' ? 'bg-slate-800 ring-2 ring-indigo-500' : 'hover:bg-slate-800/50'}`}
              onClick={() => setActiveStage('conv')}
            >
               <div className="text-center mb-3 text-indigo-400 font-bold text-sm">CONV LAYERS</div>
               <div className="relative w-24 h-24 flex items-center justify-center">
                   {/* Stacked Layers Effect */}
                   <div className="absolute w-16 h-16 bg-indigo-600/30 border border-indigo-500 rounded transform -translate-x-3 -translate-y-3"></div>
                   <div className="absolute w-16 h-16 bg-indigo-600/50 border border-indigo-500 rounded transform -translate-x-1 -translate-y-1"></div>
                   <div className="absolute w-16 h-16 bg-indigo-600/80 border border-indigo-400 rounded shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10 flex items-center justify-center">
                      <div className="w-12 h-12 border border-dashed border-white/30"></div>
                   </div>
               </div>
               <div className="mt-2 text-center text-xs text-slate-500 font-mono">Features</div>
            </div>

            {/* Arrow */}
            <div className="text-slate-600 text-2xl transform rotate-90 lg:rotate-0">➜</div>

            {/* 3. FC Stage */}
            <div 
              className={`relative group cursor-pointer p-4 rounded-xl transition-all duration-300 ${activeStage === 'fc' ? 'bg-slate-800 ring-2 ring-blue-500' : 'hover:bg-slate-800/50'}`}
              onClick={() => setActiveStage('fc')}
            >
               <div className="text-center mb-3 text-blue-400 font-bold text-sm">DENSE LAYERS</div>
               <div className="w-24 h-24 flex items-center justify-center space-x-2">
                   {/* Neural Network Nodes */}
                   <div className="flex flex-col justify-between h-20">
                       {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-600"></div>)}
                   </div>
                   <div className="h-20 w-12 border-l border-r border-slate-700 relative overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full opacity-30" stroke="currentColor">
                            <path d="M0,10 L48,40" className="text-blue-500" strokeWidth="0.5" />
                            <path d="M0,70 L48,40" className="text-blue-500" strokeWidth="0.5" />
                            <path d="M0,30 L48,10" className="text-blue-500" strokeWidth="0.5" />
                            <path d="M0,50 L48,70" className="text-blue-500" strokeWidth="0.5" />
                        </svg>
                   </div>
                   <div className="flex flex-col justify-between h-16">
                       {[1,2,3,4].map(i => <div key={i} className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>)}
                   </div>
               </div>
               <div className="mt-2 text-center text-xs text-slate-500 font-mono">Vector [512]</div>
            </div>

            {/* Arrow */}
            <div className="text-slate-600 text-2xl transform rotate-90 lg:rotate-0">➜</div>

            {/* 4. Output Stage */}
            <div 
              className={`relative group cursor-pointer p-4 rounded-xl transition-all duration-300 ${activeStage === 'output' ? 'bg-slate-800 ring-2 ring-emerald-500' : 'hover:bg-slate-800/50'}`}
              onClick={() => setActiveStage('output')}
            >
               <div className="text-center mb-3 text-emerald-400 font-bold text-sm">Q-VALUES</div>
               <div className="w-32 h-24 flex flex-col justify-center space-y-2">
                   {/* Q-Value Bars */}
                   {[
                       { label: 'UP', val: '70%' },
                       { label: 'RIGHT', val: '30%' },
                       { label: 'DOWN', val: '10%' },
                       { label: 'LEFT', val: '20%' }
                   ].map((item, i) => (
                       <div key={i} className="flex items-center text-xs">
                           <span className="w-10 text-slate-400 font-mono text-[10px]">{item.label}</span>
                           <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden ml-1">
                               <div className="h-full bg-emerald-500" style={{ width: item.val }}></div>
                           </div>
                       </div>
                   ))}
               </div>
               <div className="mt-2 text-center text-xs text-emerald-500 font-bold animate-pulse">Select Max Q</div>
            </div>

          </div>

          {/* Description Panel */}
          <div className="mt-8 bg-slate-950/50 rounded-xl p-6 min-h-[140px] border border-slate-800 transition-all">
             {activeStage ? (
                 stages.map(stage => stage.id === activeStage && (
                     <div key={stage.id} className="animate-fade-in">
                         <h3 className="text-xl font-bold text-white flex items-center">
                             <span className="w-2 h-6 bg-blue-500 rounded mr-3"></span>
                             {stage.title}
                             <span className="ml-3 text-sm font-normal text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                                 {stage.subtitle}
                             </span>
                         </h3>
                         <p className="mt-3 text-slate-300 leading-relaxed">{stage.description}</p>
                     </div>
                 ))
             ) : (
                 <div className="flex items-center justify-center h-full text-slate-500">
                     <p>点击上方的任意模块查看该层在 DQN 中的作用。</p>
                 </div>
             )}
          </div>

       </div>
       
       <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
           <div className="p-4 bg-slate-800 rounded border border-slate-700">
               <div className="text-2xl font-bold text-white">End-to-End</div>
               <div className="text-sm text-slate-400">从像素直接到动作</div>
           </div>
           <div className="p-4 bg-slate-800 rounded border border-slate-700">
               <div className="text-2xl font-bold text-white">Approximation</div>
               <div className="text-sm text-slate-400">用神经网络拟合 Q 表</div>
           </div>
           <div className="p-4 bg-slate-800 rounded border border-slate-700">
               <div className="text-2xl font-bold text-white">Loss Function</div>
               <div className="text-sm text-slate-400">MSE(Target Q - Predicted Q)</div>
           </div>
       </div>
    </div>
  );
};

export default DQNArchitecture;