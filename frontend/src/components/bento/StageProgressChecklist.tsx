import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { StageUpdateHistoryEntry } from '@/types/pipeline.types';

interface StageProgressChecklistProps {
  updateHistory: StageUpdateHistoryEntry[];
  currentProgress: number;
  isDark: boolean;
}

// Stage 6 sub-tasks definition
const STAGE_6_SUBTASKS = [
  { id: 'initialization', label: 'Initialization', minProgress: 0 },
  { id: 'overview', label: 'Overview', minProgress: 15 },
  { id: 'theme_analysis', label: 'Theme Analysis', minProgress: 25 },
  { id: 'methodology_grouping', label: 'Methodology Grouping', minProgress: 58 },
  { id: 'top_papers_compilation', label: 'Top Papers', minProgress: 70 },
  { id: 'synthesis_writing', label: 'AI Synthesis', minProgress: 75 },
  { id: 'finalization', label: 'Finalization', minProgress: 95 },
];

export const StageProgressChecklist: React.FC<StageProgressChecklistProps> = ({ 
  updateHistory,
  currentProgress,
  isDark 
}) => {
  // Determine which sub-tasks have been completed based on update history
  const completedSubTasks = new Set<string>();
  const currentSubTask = updateHistory[updateHistory.length - 1]?.data?.sub_task;
  
  updateHistory.forEach(update => {
    if (update.data?.sub_task) {
      completedSubTasks.add(update.data.sub_task);
    }
  });

  const getSubTaskStatus = (subtask: typeof STAGE_6_SUBTASKS[0], index: number) => {
    // Completed if we've seen this subtask in history and moved past it
    const isCompleted = currentProgress > subtask.minProgress + 10 || completedSubTasks.has(subtask.id);
    // Current if it's the active subtask
    const isCurrent = currentSubTask === subtask.id || 
      (currentProgress >= subtask.minProgress && currentProgress < (STAGE_6_SUBTASKS[index + 1]?.minProgress || 100));
    
    return { isCompleted, isCurrent };
  };

  return (
    <div className={`
      mt-4 rounded-xl backdrop-blur-md border p-4
      ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/40 border-gray-200/50'}
    `}>
      <div className="mb-4">
        <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Synthesis Steps
        </h4>
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
          <motion.div
            className="h-full bg-gradient-to-r from-sunset-coral via-sunset-gold to-sunset-amber"
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {STAGE_6_SUBTASKS.map((subtask, index) => {
          const { isCompleted, isCurrent } = getSubTaskStatus(subtask, index);
          
          // Extract relevant stats from history for this subtask
          const subtaskData = updateHistory
            .filter(u => u.data?.sub_task === subtask.id)
            .pop()?.data;
          
          return (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                flex items-start gap-3 p-2 rounded-lg transition-colors duration-300
                ${isCurrent ? (isDark ? 'bg-primary/10' : 'bg-primary/5') : ''}
              `}
            >
              {/* Status icon */}
              <div className="mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Circle className={`w-5 h-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                )}
              </div>
              
              {/* Label and details */}
              <div className="flex-1 min-w-0">
                <div className={`
                  text-sm font-medium
                  ${isCurrent 
                    ? isDark ? 'text-primary-light' : 'text-primary-dark'
                    : isCompleted
                    ? isDark ? 'text-gray-300' : 'text-gray-700'
                    : isDark ? 'text-gray-500' : 'text-gray-500'
                  }
                `}>
                  {subtask.label}
                </div>
                
                {/* Show sub-task specific data */}
                {(isCurrent || isCompleted) && subtaskData && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {subtaskData.theme_count && (
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {subtaskData.theme_count} themes
                      </span>
                    )}
                    {subtaskData.method_count && (
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {subtaskData.method_count} methods
                      </span>
                    )}
                    {subtaskData.total_papers && (
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {subtaskData.total_papers} papers
                      </span>
                    )}
                    {subtaskData.current_theme && (
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full
                        ${isDark ? 'bg-sunset-gold/20 text-sunset-gold' : 'bg-sunset-gold/30 text-primary-dark'}
                      `}>
                        {subtaskData.current_theme}
                      </span>
                    )}
                    {subtaskData.status === 'loading_model' && (
                      <span className={`text-xs ${isDark ? 'text-sunset-amber' : 'text-primary-dark'}`}>
                        Loading model...
                      </span>
                    )}
                    {subtaskData.status === 'running_inference' && (
                      <span className={`text-xs ${isDark ? 'text-sunset-amber' : 'text-primary-dark'}`}>
                        Running AI inference...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
