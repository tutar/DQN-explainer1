import React from 'react';
import { DQN_CONCEPTS } from '../constants';

const ConceptExplainer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">Deep Q-Network (DQN) 如何工作？</h1>
        <p className="text-lg text-slate-400">
          结合了 <span className="text-blue-400">强化学习 (Reinforcement Learning)</span> 与 <span className="text-emerald-400">深度神经网络 (Deep Neural Networks)</span> 的开创性算法。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DQN_CONCEPTS.map((concept, index) => (
          <div key={index} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-all shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-white">{concept.title}</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {concept.content}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 mt-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">核心流程循环</h3>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-slate-300 relative">
           {/* Visual Flow Diagram using Tailwind & SVG */}
           <div className="w-full flex justify-center relative">
               <svg viewBox="0 0 800 300" className="w-full h-auto max-w-3xl">
                    {/* Environment Box */}
                    <rect x="50" y="50" width="150" height="200" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <text x="125" y="155" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">Environment</text>
                    
                    {/* Agent Box */}
                    <rect x="600" y="50" width="150" height="200" rx="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                    <text x="675" y="155" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">Agent (DQN)</text>

                    {/* Arrows */}
                    {/* State (Top) */}
                    <path d="M 200 80 L 600 80" stroke="#94a3b8" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
                    <text x="400" y="70" textAnchor="middle" fill="#94a3b8">State (Sₜ)</text>

                    {/* Reward (Middle) */}
                    <path d="M 200 150 L 600 150" stroke="#22c55e" strokeWidth="3" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
                    <text x="400" y="140" textAnchor="middle" fill="#22c55e">Reward (Rₜ)</text>

                    {/* Action (Bottom) */}
                    <path d="M 600 220 L 200 220" stroke="#3b82f6" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
                    <text x="400" y="210" textAnchor="middle" fill="#3b82f6">Action (Aₜ)</text>

                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                        </marker>
                    </defs>
               </svg>
           </div>
        </div>
        <p className="text-center text-slate-400 mt-4 text-sm">
            {'智能体观察状态 Sₜ，通过神经网络选择动作 Aₜ，环境返回奖励 Rₜ 和新状态 Sₜ₊₁。'}
        </p>
      </div>
    </div>
  );
};

export default ConceptExplainer;