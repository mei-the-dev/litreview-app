import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { Header } from '@/components/Header';
import { QueryInput } from '@/components/QueryInput';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { PipelineSummaryHeader } from '@/components/bento/PipelineSummaryHeader';
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
          ? 'bg-gradient-to-b from-twilight-navy via-twilight-indigo/30 to-midnight'
          : 'bg-gradient-to-b from-horizon-cream via-sunset-peach/20 to-secondary-light'
        }
      `}
      style={{
        backgroundImage: isDarkMode 
          ? 'linear-gradient(180deg, #3D3066 0%, rgba(107, 91, 149, 0.3) 30%, rgba(26, 31, 58, 0.8) 70%, #0A0E1A 100%)'
          : 'linear-gradient(180deg, #FFEFD5 0%, rgba(255, 207, 159, 0.4) 20%, rgba(255, 184, 77, 0.2) 50%, rgba(244, 231, 195, 0.3) 80%, #FEF6E4 100%)'
      }}
    >
      {/* Sunset-inspired animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sun/Moon glow at horizon */}
        <div 
          className={`
            absolute ${isDarkMode ? 'top-[15%]' : 'top-[10%]'} left-1/2 transform -translate-x-1/2
            w-[300px] h-[300px] rounded-full
            filter blur-[100px]
            animate-horizon-glow
            ${isDarkMode 
              ? 'bg-gradient-radial from-primary/40 via-sunset-amber/20 to-transparent' 
              : 'bg-gradient-radial from-sunset-gold/60 via-sunset-amber/40 to-transparent'
            }
          `}
        />
        
        {/* Warm sunset layer - left side */}
        <div 
          className={`
            absolute top-[5%] left-[-10%] w-[45%] h-[50%] rounded-full
            filter blur-[120px]
            animate-sunset-shimmer
            ${isDarkMode 
              ? 'bg-gradient-to-br from-sunset-coral/25 via-sunset-amber/20 to-primary/30 opacity-60' 
              : 'bg-gradient-to-br from-sunset-coral/40 via-sunset-amber/35 to-sunset-gold/30 opacity-70'
            }
          `}
          style={{ mixBlendMode: 'screen' }}
        />
        
        {/* Golden hour glow - right side */}
        <div 
          className={`
            absolute top-[10%] right-[-8%] w-[50%] h-[55%] rounded-full
            filter blur-[110px]
            animate-sunset-shimmer animation-delay-2000
            ${isDarkMode 
              ? 'bg-gradient-to-bl from-primary/30 via-sunset-rose/15 to-sunset-violet/25 opacity-50' 
              : 'bg-gradient-to-bl from-sunset-peach/50 via-sunset-rose/30 to-primary-light/25 opacity-65'
            }
          `}
          style={{ mixBlendMode: 'screen' }}
        />
        
        {/* Horizon reflection - bottom glow */}
        <div 
          className={`
            absolute bottom-[-15%] left-[15%] w-[70%] h-[40%] rounded-full
            filter blur-[100px]
            animate-sunset-shimmer animation-delay-4000
            ${isDarkMode 
              ? 'bg-gradient-to-t from-sunset-violet/20 via-primary-dark/25 to-transparent opacity-40' 
              : 'bg-gradient-to-t from-primary/30 via-sunset-amber/25 to-sunset-peach/20 opacity-55'
            }
          `}
          style={{ mixBlendMode: 'screen' }}
        />
        
        {/* Twilight purple accent - dark mode emphasis */}
        {isDarkMode && (
          <div 
            className="
              absolute top-[40%] right-[10%] w-[35%] h-[45%] rounded-full
              filter blur-[90px]
              animate-blob animation-delay-2000
              bg-gradient-to-bl from-sunset-violet/30 via-twilight-indigo/20 to-sunset-rose/15 opacity-40
            "
            style={{ mixBlendMode: 'screen' }}
          />
        )}
        
        {/* Subtle cloud-like wisps */}
        <div 
          className={`
            absolute inset-0 opacity-[0.03]
            ${isDarkMode ? 'bg-white' : 'bg-sunset-amber'}
          `}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 157, 92, 0.08)'} 0%, transparent 50%),
                             radial-gradient(circle at 80% 60%, ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 184, 77, 0.06)'} 0%, transparent 50%),
                             radial-gradient(circle at 40% 80%, ${isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 207, 159, 0.04)'} 0%, transparent 50%)`
          }}
        />
        
        {/* Atmospheric depth gradient */}
        <div 
          className={`
            absolute inset-0
            ${isDarkMode
              ? 'bg-gradient-to-b from-transparent via-navy-deep/20 to-midnight/40'
              : 'bg-gradient-to-b from-white/30 via-transparent to-secondary-light/40'
            }
          `}
        />
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto relative z-10">
        <Header />
        
        {currentView === 'pipeline' && <QueryInput />}
        
        {/* Pipeline Summary Header */}
        {currentView === 'pipeline' && <PipelineSummaryHeader isDark={isDarkMode} />}
        
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
