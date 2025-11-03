import React from 'react';
import { motion } from 'framer-motion';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useUIStore } from '@/stores/uiStore';
import { Activity, FileText, Network } from 'lucide-react';

export const StatsFooter: React.FC = () => {
  const { stages, report, isRunning } = usePipelineStore();
  const { isDarkMode } = useUIStore();
  
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const totalStages = stages.length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`
        mt-8 glass-artistic rounded-3xl p-6 border shadow-2xl
        flex justify-around items-center
        ${isDarkMode 
          ? 'bg-gradient-to-br from-white/8 via-white/5 to-white/3 border-white/10' 
          : 'bg-gradient-to-br from-white/70 via-white/60 to-white/50 border-secondary/30'
        }
      `}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className={`w-5 h-5 ${isDarkMode ? 'text-secondary-light' : 'text-primary-dark'}`} />
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Pipeline Progress
          </p>
        </div>
        <p className={`text-3xl font-bold bg-gradient-to-r ${
          isDarkMode 
            ? 'from-primary-light to-secondary-light bg-clip-text text-transparent' 
            : 'from-primary-dark to-primary bg-clip-text text-transparent'
        }`}>
          {totalStages > 0 ? `${completedStages}/${totalStages}` : '0/7'}
        </p>
      </div>
      
      <div className={`w-px h-16 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-secondary/30 to-transparent' : 'bg-gradient-to-b from-transparent via-primary/20 to-transparent'}`} />
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className={`w-5 h-5 ${isDarkMode ? 'text-secondary-light' : 'text-primary-dark'}`} />
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Papers Analyzed
          </p>
        </div>
        <p className={`text-3xl font-bold bg-gradient-to-r ${
          isDarkMode 
            ? 'from-primary-light to-secondary-light bg-clip-text text-transparent' 
            : 'from-primary-dark to-primary bg-clip-text text-transparent'
        }`}>
          {report?.total_papers || 0}
        </p>
      </div>
      
      <div className={`w-px h-16 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-secondary/30 to-transparent' : 'bg-gradient-to-b from-transparent via-primary/20 to-transparent'}`} />
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Network className={`w-5 h-5 ${isDarkMode ? 'text-secondary-light' : 'text-primary-dark'}`} />
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Status
          </p>
        </div>
        <motion.p 
          animate={isRunning ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`text-3xl font-bold ${
            isRunning
              ? isDarkMode ? 'text-info' : 'text-info'
              : completedStages === totalStages && totalStages > 0
              ? 'text-success'
              : isDarkMode ? 'text-secondary-light' : 'text-primary-dark'
          }`}
        >
          {isRunning ? 'Running' : completedStages === totalStages && totalStages > 0 ? 'Complete' : 'Ready'}
        </motion.p>
      </div>
    </motion.div>
  );
};
