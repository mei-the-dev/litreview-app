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
          ? 'bg-gradient-to-br from-midnight via-navy-deep to-navy-medium'
          : 'bg-gradient-to-br from-secondary-light via-white to-accent-muted'
        }
      `}
    >
      {/* Artistic animated background with glassmorphism-enhancing layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary artistic blob - golden */}
        <div 
          className={`
            absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full
            filter blur-3xl
            animate-blob
            ${isDarkMode 
              ? 'bg-gradient-to-br from-primary/30 via-primary-light/20 to-primary-dark/25 opacity-80' 
              : 'bg-gradient-to-br from-primary/20 via-secondary/30 to-primary-light/15 opacity-60'
            }
          `}
          style={{ mixBlendMode: isDarkMode ? 'screen' : 'multiply' }}
        />
        
        {/* Secondary artistic blob - pastel gold with purple hints */}
        <div 
          className={`
            absolute top-[10%] right-[-10%] w-[45%] h-[60%] rounded-full
            filter blur-3xl
            animate-blob animation-delay-2000
            ${isDarkMode 
              ? 'bg-gradient-to-bl from-secondary/25 via-purple-500/20 to-primary/30 opacity-70' 
              : 'bg-gradient-to-bl from-secondary-light/40 via-purple-200/30 to-primary/10 opacity-50'
            }
          `}
          style={{ mixBlendMode: isDarkMode ? 'screen' : 'multiply' }}
        />
        
        {/* Tertiary artistic blob - warm accent */}
        <div 
          className={`
            absolute bottom-[-5%] left-[20%] w-[55%] h-[45%] rounded-full
            filter blur-3xl
            animate-blob animation-delay-4000
            ${isDarkMode 
              ? 'bg-gradient-to-tr from-orange-400/20 via-primary-light/25 to-secondary/20 opacity-75' 
              : 'bg-gradient-to-tr from-orange-200/25 via-secondary/35 to-accent/30 opacity-45'
            }
          `}
          style={{ mixBlendMode: isDarkMode ? 'screen' : 'multiply' }}
        />
        
        {/* Additional depth layer - subtle grid pattern */}
        <div 
          className={`
            absolute inset-0 opacity-[0.02]
            ${isDarkMode ? 'bg-white' : 'bg-primary'}
          `}
          style={{
            backgroundImage: `
              linear-gradient(${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(193,143,50,0.05)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(193,143,50,0.05)'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Radial gradient overlay for depth */}
        <div 
          className={`
            absolute inset-0
            ${isDarkMode
              ? 'bg-radial-gradient from-transparent via-navy-deep/30 to-midnight/60'
              : 'bg-radial-gradient from-white/40 via-transparent to-secondary/20'
            }
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
