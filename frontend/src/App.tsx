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
  
  // Debug: Log view changes
  React.useEffect(() => {
    console.log('🔄 App view changed to:', currentView);
  }, [currentView]);
  
  return (
    <div 
      className={`
        min-h-screen p-4 sm:p-8 relative overflow-hidden transition-all duration-700
        ${isDarkMode
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
        }
      `}
    >
      {/* Enhanced animated background mesh */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`
            absolute top-0 -left-40 w-[600px] h-[600px] rounded-full
            mix-blend-multiply filter blur-3xl opacity-70
            animate-blob
            ${isDarkMode ? 'bg-purple-500' : 'bg-purple-300'}
          `}
        />
        <div 
          className={`
            absolute top-0 -right-40 w-[600px] h-[600px] rounded-full
            mix-blend-multiply filter blur-3xl opacity-70
            animate-blob animation-delay-2000
            ${isDarkMode ? 'bg-blue-500' : 'bg-blue-300'}
          `}
        />
        <div 
          className={`
            absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full
            mix-blend-multiply filter blur-3xl opacity-70
            animate-blob animation-delay-4000
            ${isDarkMode ? 'bg-pink-500' : 'bg-pink-300'}
          `}
        />
      </div>
      
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
