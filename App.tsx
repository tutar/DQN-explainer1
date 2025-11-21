import React, { useState } from 'react';
import Header from './components/Header';
import ConceptExplainer from './components/ConceptExplainer';
import DQNArchitecture from './components/DQNArchitecture';
import GridWorldSimulation from './components/GridWorldSimulation';
import AIChat from './components/AIChat';
import { AppSection } from './types';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.Intro);

  // We render all components but toggle their visibility to preserve state
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header currentSection={currentSection} setSection={setCurrentSection} />
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className={currentSection === AppSection.Intro ? 'block' : 'hidden'}>
          <ConceptExplainer />
        </div>
        <div className={currentSection === AppSection.Architecture ? 'block' : 'hidden'}>
          <DQNArchitecture />
        </div>
        <div className={currentSection === AppSection.Simulation ? 'block' : 'hidden'}>
          <GridWorldSimulation />
        </div>
        <div className={currentSection === AppSection.Chat ? 'block' : 'hidden'}>
          <AIChat />
        </div>
      </main>
      <footer className="bg-slate-900 border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Created with React, Tailwind, and Google Gemini API.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;