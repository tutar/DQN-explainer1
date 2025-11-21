import React from 'react';
import { AppSection } from '../types';

interface HeaderProps {
  currentSection: AppSection;
  setSection: (section: AppSection) => void;
}

const Header: React.FC<HeaderProps> = ({ currentSection, setSection }) => {
  const navItems = [
    { id: AppSection.Intro, label: '原理介绍' },
    { id: AppSection.Architecture, label: 'DQN 架构' },
    { id: AppSection.Simulation, label: '训练模拟' },
    { id: AppSection.Chat, label: 'AI 导师' },
  ];

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-blue-400 font-bold text-xl">DQN Explainer</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentSection === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile menu (simplified) */}
      <div className="md:hidden flex justify-around p-2 bg-slate-900">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`px-2 py-1 rounded text-xs font-medium ${
                 currentSection === item.id ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
      </div>
    </header>
  );
};

export default Header;