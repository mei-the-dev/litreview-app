import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { Header } from '@/components/Header';
import { QueryInput } from '@/components/QueryInput';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { StatsFooter } from '@/components/StatsFooter';
import { ResultsView } from '@/components/results/ResultsView';

function App() {
  const { sessionId, currentView } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  
  // Connect to WebSocket when session starts
  useWebSocket(sessionId);
  
  return (
    <div 
      className={`
        min-h-screen p-8 relative overflow-hidden transition-all duration-700
        ${isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-[#E8DCC8] via-[#F0E6D2] to-[#E8DCC8]'
        }
      `}
    >
      {/* Animated background orbs */}
      <div 
        className={`
          absolute top-20 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse
          ${isDarkMode ? 'bg-primary/15' : 'bg-primary/10'}
        `}
      />
      <div 
        className={`
          absolute bottom-20 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse
          ${isDarkMode ? 'bg-primary-light/15' : 'bg-primary-light/10'}
        `}
        style={{ animationDelay: '1s' }}
      />
      <div 
        className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse
          ${isDarkMode ? 'bg-accent/10' : 'bg-accent/8'}
        `}
        style={{ animationDelay: '2s' }}
      />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto relative z-10">
        <Header />
        
        {currentView === 'pipeline' && <QueryInput />}
        
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {currentView === 'pipeline' ? (
              <BentoGrid key="pipeline" />
            ) : (
              <ResultsView key="results" />
            )}
          </AnimatePresence>
        </div>
        
        {currentView === 'pipeline' && <StatsFooter />}
      </div>
    </div>
  );
}

export default App;
