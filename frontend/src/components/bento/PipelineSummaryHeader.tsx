import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, TrendingUp } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';

interface PipelineSummaryHeaderProps {
  isDark: boolean;
}

export const PipelineSummaryHeader: React.FC<PipelineSummaryHeaderProps> = ({ isDark }) => {
  const { stages, sessionId, isRunning } = usePipelineStore();
  
  if (!sessionId || stages.length === 0) {
    return null;
  }
  
  // Calculate overall progress
  const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length;
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const currentStage = stages.find(s => s.status === 'running');
  
  // Calculate elapsed time
  const startTime = stages.find(s => s.startTime)?.startTime;
  const [elapsedTime, setElapsedTime] = React.useState(0);
  
  React.useEffect(() => {
    if (!startTime || !isRunning) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, isRunning]);
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        mb-6 p-6 rounded-3xl backdrop-blur-md border
        ${isDark 
          ? 'glass-card-dark bg-white/5 border-white/10' 
          : 'glass-card-light bg-white/40 border-gray-200/50'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={`
          text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent
          ${isDark 
            ? 'from-horizon-cream via-sunset-gold to-sunset-amber' 
            : 'from-twilight-navy via-primary to-sunset-amber'
          }
        `}>
          Pipeline Progress
        </h2>
        
        <div className="flex items-center gap-4">
          {/* Elapsed time */}
          {startTime && (
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatTime(elapsedTime)}
              </span>
            </div>
          )}
          
          {/* Stages completed */}
          <div className="flex items-center gap-2">
            <Target className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {completedStages}/7 Stages
            </span>
          </div>
        </div>
      </div>
      
      {/* Current stage */}
      {currentStage && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-4 h-4 ${isDark ? 'text-primary-light' : 'text-primary'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-primary-light' : 'text-primary'}`}>
              Current: {currentStage.name}
            </span>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {currentStage.message}
          </p>
        </div>
      )}
      
      {/* Overall progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Overall Progress
          </span>
          <span className={`text-xs font-bold ${isDark ? 'text-secondary-light' : 'text-primary-dark'}`}>
            {Math.round(totalProgress)}%
          </span>
        </div>
        
        <div className={`
          h-3 rounded-full overflow-hidden border
          ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-secondary/20'}
        `}>
          <motion.div
            className="h-full bg-gradient-to-r from-sunset-coral via-sunset-gold to-sunset-amber shadow-[0_0_15px_rgba(255,157,92,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};
