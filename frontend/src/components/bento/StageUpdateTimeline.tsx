import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StageUpdateHistoryEntry } from '@/types/pipeline.types';
import { CheckCircle2, Loader2, Circle, Clock } from 'lucide-react';

interface StageUpdateTimelineProps {
  updateHistory: StageUpdateHistoryEntry[];
  isDark: boolean;
  isExpanded: boolean;
}

export const StageUpdateTimeline: React.FC<StageUpdateTimelineProps> = ({ 
  updateHistory, 
  isDark,
  isExpanded 
}) => {
  if (!isExpanded || updateHistory.length === 0) {
    return null;
  }

  // Get unique updates (group by message to avoid duplicates)
  const uniqueUpdates = updateHistory.reduce((acc, update) => {
    const key = update.message;
    if (!acc.some(u => u.message === key)) {
      acc.push(update);
    }
    return acc;
  }, [] as StageUpdateHistoryEntry[]);

  // Take last 10 updates
  const recentUpdates = uniqueUpdates.slice(-10);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          mt-4 rounded-xl backdrop-blur-md border overflow-hidden
          ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/40 border-gray-200/50'}
        `}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Update Timeline
            </span>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
            {recentUpdates.map((update, index) => {
              const isLast = index === recentUpdates.length - 1;
              const isComplete = update.progress === 100;
              
              return (
                <motion.div
                  key={`${update.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="relative flex gap-3"
                >
                  {/* Timeline dot and line */}
                  <div className="relative flex flex-col items-center">
                    {/* Dot */}
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center z-10
                      ${isLast && !isComplete
                        ? 'bg-gradient-to-br from-primary to-sunset-gold shadow-glow animate-pulse-glow'
                        : isComplete
                        ? 'bg-gradient-to-br from-success/80 to-success shadow-[0_0_10px_rgba(139,195,74,0.4)]'
                        : 'bg-gray-400/30'
                      }
                    `}>
                      {isLast && !isComplete ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : isComplete ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Circle className="w-2.5 h-2.5 text-white fill-white" />
                      )}
                    </div>
                    
                    {/* Connecting line */}
                    {index < recentUpdates.length - 1 && (
                      <div className={`
                        w-0.5 h-full absolute top-6
                        ${isDark ? 'bg-gray-700' : 'bg-gray-300'}
                      `} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-3">
                    <p className={`
                      text-sm font-medium mb-1
                      ${isLast && !isComplete
                        ? isDark ? 'text-primary-light' : 'text-primary-dark'
                        : isDark ? 'text-gray-300' : 'text-gray-700'
                      }
                    `}>
                      {update.message}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </span>
                      
                      {update.progress > 0 && (
                        <span className={`
                          font-semibold
                          ${isLast && !isComplete
                            ? 'text-primary'
                            : isDark ? 'text-gray-400' : 'text-gray-600'
                          }
                        `}>
                          {update.progress}%
                        </span>
                      )}
                      
                      {/* Show data highlights */}
                      {update.data && (
                        <>
                          {update.data.current_theme && (
                            <span className={`
                              px-2 py-0.5 rounded-full text-xs
                              ${isDark ? 'bg-sunset-gold/20 text-sunset-gold' : 'bg-sunset-gold/30 text-primary-dark'}
                            `}>
                              {update.data.current_theme}
                            </span>
                          )}
                          {update.data.current_method && (
                            <span className={`
                              px-2 py-0.5 rounded-full text-xs
                              ${isDark ? 'bg-sunset-amber/20 text-sunset-amber' : 'bg-sunset-amber/30 text-primary-dark'}
                            `}>
                              {update.data.current_method}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
